// server/websocket.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type WSMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func randomID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// Client represents a single WebSocket connection
type Client struct {
	conn *websocket.Conn
	// Potentially a channel for sending messages to this client
	send   chan []byte
	roomID string
}

// Hub maintains the set of active clients per room and broadcasts messages.
type Hub struct {
	// Registered clients for each room.
	// map[roomID]map[*Client]bool
	rooms map[string]map[*Client]bool
	mutex sync.RWMutex // Protects access to rooms map

	// Register requests from the clients.
	register chan *ClientJoinRequest

	// Unregister requests from clients.
	unregister chan *ClientLeaveRequest

	// Inbound messages from the Redis Pub/Sub
	redisMessages chan *redis.Message

	redisClient *redis.Client
}

// ClientJoinRequest holds client and roomID
type ClientJoinRequest struct {
	Client *Client
	RoomID string
}

// ClientLeaveRequest holds client and roomID
type ClientLeaveRequest struct {
	Client *Client
	RoomID string
}

// NewHub creates a new Hub instance
func NewHub(redisClient *redis.Client) *Hub {
	hub := &Hub{
		rooms:         make(map[string]map[*Client]bool),
		register:      make(chan *ClientJoinRequest),
		unregister:    make(chan *ClientLeaveRequest),
		redisMessages: make(chan *redis.Message),
		redisClient:   redisClient,
	}

	// Start periodic cleanup of stale rooms
	go hub.periodicCleanup()

	return hub
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case req := <-h.register:
			h.mutex.Lock()
			if _, ok := h.rooms[req.RoomID]; !ok {
				h.rooms[req.RoomID] = make(map[*Client]bool)
				// New room, subscribe to its Redis channel
				go h.subscribeToRoom(req.RoomID)
			}

			// Room size limit: max 6 players per room
			if len(h.rooms[req.RoomID]) >= 6 {
				h.mutex.Unlock()
				log.Printf("Room %s is full, rejecting client", req.RoomID)
				req.Client.send <- []byte(`{"type":"roomFull"}`)
				close(req.Client.send)
				return
			}

			h.rooms[req.RoomID][req.Client] = true
			h.mutex.Unlock()
			log.Printf("Client registered to room %s (total: %d)", req.RoomID, len(h.rooms[req.RoomID]))

			// Fetch room data from Redis and send to client
			room, err := getRoom(req.RoomID)
			if err == nil && room != nil {
				// Send room data including challenge to the client
				roomData := map[string]interface{}{
					"type":      "roomData",
					"roomID":    room.ID,
					"challenge": room.Challenge,
					"players":   room.Players,
					"ready":     room.Ready,
					"rankings":  room.Rankings,
				}
				roomDataJSON, _ := json.Marshal(roomData)
				req.Client.send <- roomDataJSON
			}

		case req := <-h.unregister:
			h.mutex.Lock()
			if clients, ok := h.rooms[req.RoomID]; ok {
				if _, ok := clients[req.Client]; ok {
					delete(clients, req.Client)
					close(req.Client.send) // Close send channel when client unregisters
					if len(clients) == 0 {
						delete(h.rooms, req.RoomID)
						// Clean up Redis data for empty room
						h.redisClient.Del(ctx, "game_room:"+req.RoomID+":state").Err()
						h.redisClient.Del(ctx, "game_room:"+req.RoomID+":progress").Err()
						log.Printf("Room %s cleaned up (no more clients)", req.RoomID)
					}
				}
			}
			h.mutex.Unlock()
			log.Printf("Client unregistered from room %s", req.RoomID)

		case redisMsg := <-h.redisMessages:
			// A message from Redis Pub/Sub has arrived
			roomID := redisMsg.Channel // Assuming channel name is roomID or similar
			message := redisMsg.Payload

			h.mutex.RLock()
			if clients, ok := h.rooms[roomID]; ok {
				for client := range clients {
					select {
					case client.send <- []byte(message):
						// Message sent to client
					default:
						// Handle case where client's send buffer is full
						log.Printf("Client send buffer full for room %s. Dropping message.", roomID)
						delete(clients, client) // Unregister problematic client
						close(client.send)
					}
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// subscribeToRoom subscribes to a specific Redis Pub/Sub channel for a room
func (h *Hub) subscribeToRoom(roomID string) {
	pubsub := h.redisClient.Subscribe(ctx, roomID)
	defer pubsub.Close()

	log.Printf("Subscribed to Redis channel: %s", roomID)

	for {
		msg, err := pubsub.ReceiveMessage(ctx)
		if err != nil {
			log.Printf("Error receiving from Redis Pub/Sub for room %s: %v", roomID, err)
			// Handle reconnection logic here
			break
		}
		h.redisMessages <- msg // Send to hub's main loop for processing
	}
}

// handleWebsocket handles new WebSocket connections
func (h *Hub) handleWebsocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close()

	client := &Client{
		conn: conn,
		send: make(chan []byte, 256), // Buffered channel
	}

	// Goroutine for writing messages to the client
	go func() {
		defer func() {
			// This is where unregister happens if the write loop exits
			// Need a way to signal which room it was in.
			// This structure needs improvement for clean unregistering.
			// For now, let's just close the connection.
			log.Printf("Client write goroutine exiting for %s", conn.RemoteAddr().String())
			conn.Close()
		}()
		for {
			select {
			case message, ok := <-client.send:
				if !ok {
					// The hub closed the channel.
					conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("write error for %s: %v", conn.RemoteAddr().String(), err)
					return // Exit loop on error
				}
			}
		}
	}()

	// Goroutine for reading messages from the client
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("Client disconnected: %v", err)
			} else {
				log.Printf("read error: %v", err)
			}
			break // Exit loop on error or disconnect
		}

		if messageType == websocket.TextMessage {
			// Parse incoming message to determine action (join room, progress update)
			var msg map[string]interface{}
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("JSON unmarshal error: %v", err)
				continue
			}

			msgType, ok := msg["type"].(string)
			if !ok {
				log.Println("Message 'type' not found or invalid.")
				continue
			}

			switch msgType {
			case "createRoom":
				// Generate a new room ID on the server
				newRoomID := randomID()

				// Check if room already exists (collision detection)
				_, err := getRoom(newRoomID)
				if err == nil {
					// Room already exists, return error
					log.Printf("Room ID collision detected: %s", newRoomID)
					client.send <- []byte(`{"type":"error","message":"Failed to create room, please try again later"}`)
					continue
				}

				client.roomID = newRoomID

				// Extract challenge data from the message
				challengeData, ok := msg["challenge"]
				if !ok {
					log.Println("Challenge data not found in createRoom message")
					client.send <- []byte(`{"type":"error","message":"Challenge data required"}`)
					continue
				}

				// Extract username and id from the message
				var ID int
				var Username string

				user, ok := msg["user"].(map[string]interface{})
				if user == nil {
					ID = 0
					Username = "Guest"
				} else {
					ID = user["id"].(int)
					Username = user["username"].(string)
				}

				// Create a new room with the challenge data and add the creator as the first player
				creatorPlayer := Player{
					ID:       ID,
					Username: Username,
					Progress: 0,
				}

				room := &Room{
					ID:        newRoomID,
					Challenge: challengeData.(map[string]interface{}),
					Players:   []Player{creatorPlayer},
					Ready:     []Player{},
					Rankings:  make(map[string]int),
				}

				// Save the room to Redis
				if err := saveRoom(room); err != nil {
					log.Printf("Failed to save room %s: %v", newRoomID, err)
					client.send <- []byte(`{"type":"error","message":"Failed to create room"}`)
					continue
				}

				// Send the room ID back to the client
				response := map[string]interface{}{
					"type":   "roomCreated",
					"roomID": newRoomID,
				}
				responseJSON, _ := json.Marshal(response)
				client.send <- responseJSON

				// Register the client to the new room
				h.register <- &ClientJoinRequest{Client: client, RoomID: newRoomID}

			case "joinRoom":
				roomID, ok := msg["roomID"].(string)
				if !ok {
					log.Println("Message 'roomID' not found or invalid.")
					continue
				}

				// Basic room ID validation (alphanumeric, 3-20 chars)
				if len(roomID) < 3 || len(roomID) > 20 {
					log.Printf("Invalid room ID length: %s", roomID)
					continue
				}

				var ID int
				var Username string

				user, ok := msg["user"].(map[string]interface{})
				if user == nil {
					ID = 0
					Username = "Guest"
				} else {
					ID = user["id"].(int)
					Username = user["username"].(string)
				}

				// Store roomID in client for cleanup
				client.roomID = roomID

				// Add player to room before registering
				player := Player{
					ID:       ID,
					Username: Username,
					Progress: 0,
				}

				if err := addPlayerToRoom(roomID, player); err != nil {
					log.Printf("Failed to add player to room %s: %v", roomID, err)
					client.send <- []byte(`{"type":"error","message":"Failed to join room"}`)
					continue
				}

				h.register <- &ClientJoinRequest{Client: client, RoomID: roomID}
				// The client is now associated with a room locally on this server
				// and this server is subscribed to that room's Redis channel.
				// For simplicity, we assume one room per client for now.
			case "typingProgress":
				// Use the client's roomID for typing progress
				if client.roomID == "" {
					log.Println("Client not associated with any room for typing progress")
					continue
				}

				// Publish this update to Redis Pub/Sub
				// All servers subscribed to roomID will receive it and broadcast to their clients.
				go func(m []byte, rID string) {
					// Store progress in Redis Hash (room state)
					playerID, _ := msg["playerID"].(string)      // Assuming playerID is in message
					charsTyped, _ := msg["charsTyped"].(float64) // JSON numbers are float64

					h.redisClient.HSet(ctx, "game_room:"+rID+":progress", playerID, int(charsTyped)).Err()

					// Publish the original message (or a processed one) to the room's channel
					err := h.redisClient.Publish(ctx, rID, string(m)).Err()
					if err != nil {
						log.Printf("Failed to publish to Redis room %s: %v", rID, err)
					}
				}(message, client.roomID)
			case "leaveRoom":
				if client.roomID == "" {
					log.Println("Client not associated with any room for leave request")
					continue
				}
				h.unregister <- &ClientLeaveRequest{Client: client, RoomID: client.roomID}
				return // Client explicitly left, break read loop
			default:
				log.Printf("Unknown message type: %s", msgType)
			}
		}
	}

	// Important: When the read loop breaks (client disconnects),
	// we need to unregister the client from the hub.
	// This example needs robust client tracking for unregistering.
	// A more robust solution would store the roomID with the client struct
	// and pass it to unregister.
	// For now, let's assume the unregister is triggered by a "leaveRoom" message or
	// a more sophisticated connection manager.
	log.Printf("Client read goroutine exiting for %s", conn.RemoteAddr().String())
	// In a real app, you'd iterate through all rooms and remove this client.
	// Or pass the roomID when the client is created.
	// For simplicity in this example, assume a client is only in one room at a time.
	// If a client unexpectedly disconnects, you'd need a way to figure out which room
	// they were in to clean up.
	// This usually involves storing a map of client to roomID in the hub.
}

// periodicCleanup removes stale rooms every 5 minutes
func (h *Hub) periodicCleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		h.mutex.Lock()
		for roomID, clients := range h.rooms {
			if len(clients) == 0 {
				delete(h.rooms, roomID)
				// Clean up Redis data
				h.redisClient.Del(ctx, "game_room:"+roomID+":state").Err()
				h.redisClient.Del(ctx, "game_room:"+roomID+":progress").Err()
				log.Printf("Periodic cleanup: removed stale room %s", roomID)
			}
		}
		h.mutex.Unlock()
	}
}

func leaveRoom(roomID string, player Player) {
	room, err := getRoom(roomID)
	if err != nil || room == nil {
		return
	}
	// Remove player from Players slice
	newPlayers := []Player{}
	for _, p := range room.Players {
		if p.ID != player.ID {
			newPlayers = append(newPlayers, p)
		}
	}
	room.Players = newPlayers
	saveRoom(room)
	// Optionally: delete room if empty
	if len(room.Players) == 0 {
		deleteRoom(roomID)
	}
}
