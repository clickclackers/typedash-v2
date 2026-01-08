package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	mrand "math/rand"
	"sync"
)

// PlayerInfo is used for JSON serialization of player data
type PlayerInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Progress int    `json:"progress"`
	Ready    bool   `json:"ready"`
	Rank     int    `json:"rank"`
}

type Room struct {
	ID        string                 `json:"id"`
	Challenge map[string]interface{} `json:"challenge"`
	Clients   map[*Client]bool       `json:"-"`
	NextRank  int                    `json:"nextRank"`
	mu        sync.RWMutex
}

// In-memory room storage
var (
	rooms   = make(map[string]*Room)
	roomsMu sync.RWMutex
)

func randomID() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// Room CRUD operations

func createRoom(roomID string, challenge map[string]interface{}) *Room {
	room := &Room{
		ID:        roomID,
		Challenge: challenge,
		Clients:   make(map[*Client]bool),
		NextRank:  1,
	}

	roomsMu.Lock()
	rooms[roomID] = room
	roomsMu.Unlock()

	return room
}

func getRoom(roomID string) *Room {
	roomsMu.RLock()
	defer roomsMu.RUnlock()
	return rooms[roomID]
}

func deleteRoom(roomID string) {
	roomsMu.Lock()
	delete(rooms, roomID)
	roomsMu.Unlock()
}

// Game action handlers
func HandleCreateRoom(c *Client, categoryID int) {
	roomID := randomID()

	challenge, err := getRandomChallenge(categoryID)
	if err != nil {
		log.Printf("Failed to get challenge: %v", err)
		c.SendError("Failed to create room")
		return
	}

	room := createRoom(roomID, map[string]interface{}{
		"id":   challenge.ID,
		"text": challenge.Text,
	})

	c.roomID = roomID
	c.Progress = 0
	room.addClient(c)

	c.SendJSON(map[string]interface{}{
		"type":       "roomCreated",
		"roomID":     roomID,
		"challenge":  room.Challenge,
		"players":    room.getPlayers(),
		"assignedID": c.ID,
	})

	log.Printf("Room %s created by %s", roomID, c.Username)
}

func HandleJoinRoom(c *Client, roomID string) {
	room := getRoom(roomID)
	if room == nil {
		c.SendJSON(map[string]interface{}{"type": "invalidRoom"})
		return
	}

	if room.clientCount() >= 4 {
		c.SendJSON(map[string]interface{}{"type": "roomFull"})
		return
	}

	c.roomID = roomID
	c.Progress = 0
	c.Ready = false
	c.Rank = 0
	room.addClient(c)

	// Send userID directly to the joining client
	c.SendJSON(map[string]interface{}{
		"type":       "assignedID",
		"assignedID": c.ID,
	})

	// Broadcast playerJoined to everyone
	joinMsg := map[string]interface{}{
		"type":      "playerJoined",
		"players":   room.getPlayers(),
		"challenge": room.Challenge,
	}
	msgJSON, _ := json.Marshal(joinMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s joined room %s", c.Username, roomID)
}

func HandleReady(c *Client) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	c.Ready = true

	readyMsg := map[string]interface{}{
		"type":    "receiveReady",
		"id":      c.ID,
		"players": room.getPlayers(),
	}
	msgJSON, _ := json.Marshal(readyMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s ready in room %s", c.Username, c.roomID)
}

func HandleTypingProgress(c *Client, charsTyped int) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	c.Progress = charsTyped
	var msg map[string]interface{}

	if charsTyped >= len(room.Challenge["text"].(string)) {
		c.Rank = room.NextRank
		room.NextRank++
		msg = map[string]interface{}{
			"type":    "playerCompleted",
			"players": room.getPlayers(),
		}
	} else {
		msg = map[string]interface{}{
			"type":     "progressUpdate",
			"id":       c.ID,
			"progress": c.Progress,
		}

	}
	msgJSON, _ := json.Marshal(msg)
	room.broadcast(msgJSON, nil)
}

func HandleLeaveRoom(c *Client) {
	if c.roomID == "" {
		return
	}

	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	room.removeClient(c)

	msg := map[string]interface{}{
		"type":    "playerLeft",
		"players": room.getPlayers(),
	}
	msgJSON, _ := json.Marshal(msg)
	room.broadcast(msgJSON, nil)

	// Delete room if empty
	if room.clientCount() == 0 {
		deleteRoom(c.roomID)
		log.Printf("Room %s deleted (empty)", c.roomID)
	}
}

func HandleRestartTest(c *Client) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	room.reset(room.Challenge)

	restartMsg := map[string]interface{}{
		"type":      "restartTest",
		"players":   room.getPlayers(),
		"challenge": room.Challenge,
	}
	msgJSON, _ := json.Marshal(restartMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s restarted test in room %s", c.Username, c.roomID)
}

// Room methods
func (r *Room) addClient(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Clients[client] = true
	log.Printf("Client %s (ID %s) added to room %s", client.Username, client.ID, r.ID)
}

func (r *Room) removeClient(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.Clients[client]; ok {
		delete(r.Clients, client)
		close(client.send)
		log.Printf("Client %s (ID %s) removed from room %s", client.Username, client.ID, r.ID)
	}
}

func (r *Room) broadcast(message []byte, exclude *Client) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for client := range r.Clients {
		if exclude != nil && client == exclude {
			continue
		}
		select {
		case client.send <- message:
		default:
			log.Printf("Client %s buffer full, dropping message", client.ID)
		}
	}
}

func (r *Room) clientCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Clients)
}

func (r *Room) getPlayers() []PlayerInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()
	players := make([]PlayerInfo, 0, len(r.Clients))
	for client := range r.Clients {
		players = append(players, PlayerInfo{
			ID:       client.ID,
			Username: client.Username,
			Progress: client.Progress,
			Ready:    client.Ready,
			Rank:     client.Rank,
		})
	}
	return players
}

func (r *Room) reset(newChallenge map[string]interface{}) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Challenge = newChallenge
	r.NextRank = 1
	for client := range r.Clients {
		client.Progress = 0
		client.Ready = false
	}
}

// Database helpers
func getRandomChallenge(categoryID int) (*struct {
	ID   int32
	Text string
}, error) {
	ctx := context.Background()
	challenges, err := queries.GetChallengesByCategory(ctx, int32(categoryID))
	if err != nil {
		return nil, err
	}

	if len(challenges) == 0 {
		return nil, fmt.Errorf("no challenges found for category %d", categoryID)
	}

	idx := mrand.Intn(len(challenges))
	return &struct {
		ID   int32
		Text string
	}{
		ID:   challenges[idx].ID,
		Text: challenges[idx].Text,
	}, nil
}
