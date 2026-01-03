package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"sync"
)

// PlayerInfo is used for JSON serialization of player data
type PlayerInfo struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Progress int    `json:"progress"`
}

type Room struct {
	ID        string                 `json:"id"`
	Challenge map[string]interface{} `json:"challenge"`
	Clients   map[*Client]bool       `json:"-"`
	Ready     map[string]bool        `json:"ready"`
	Rankings  map[string]int         `json:"rankings"`
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
		Ready:     make(map[string]bool),
		Rankings:  make(map[string]int),
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
	room.addClient(c)

	c.SendJSON(map[string]interface{}{
		"type":   "roomCreated",
		"roomID": roomID,
	})

	log.Printf("Room %s created", roomID)
}

func HandleJoinRoom(c *Client, roomID string, username string) {
	if username == "" {
		username = "Guest"
	}

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
	c.ID = randomID()
	c.Username = username
	c.Progress = 0
	room.addClient(c)

	joinMsg := map[string]interface{}{
		"type":      "playerJoined",
		"players":   room.getPlayers(),
		"ready":     room.getReadyCount(),
		"challenge": room.Challenge,
	}
	msgJSON, _ := json.Marshal(joinMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s joined room %s", username, roomID)
}

func HandleReady(c *Client) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	readyCount := room.setReady(c.ID)

	readyMsg := map[string]interface{}{
		"type":       "receiveReady",
		"readyCount": readyCount,
	}
	msgJSON, _ := json.Marshal(readyMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s ready in room %s (%d ready)", c.Username, c.roomID, readyCount)
}

func HandleTypingProgress(c *Client, charsTyped int) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	c.Progress = charsTyped

	progressMsg := map[string]interface{}{
		"type":     "progressUpdate",
		"id":       c.ID,
		"progress": c.Progress,
	}
	msgJSON, _ := json.Marshal(progressMsg)
	room.broadcast(msgJSON, nil)
}

func HandleCompleted(c *Client) {
	room := getRoom(c.roomID)
	if room == nil {
		return
	}

	rank := room.markCompleted(c.ID)

	completeMsg := map[string]interface{}{
		"type":     "playerCompleted",
		"id":       c.ID,
		"rank":     rank,
		"rankings": room.getRankings(),
	}
	msgJSON, _ := json.Marshal(completeMsg)
	room.broadcast(msgJSON, nil)

	log.Printf("Player %s completed in room %s (rank %d)", c.Username, c.roomID, rank)

	if room.allCompleted() {
		allCompleteMsg := map[string]interface{}{
			"type":     "allCompleted",
			"rankings": room.getRankings(),
		}
		msgJSON, _ := json.Marshal(allCompleteMsg)
		room.broadcast(msgJSON, nil)

		log.Printf("All players completed in room %s", c.roomID)
	}
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

	// Notify others that player left
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
		delete(r.Ready, client.ID)
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

func (r *Room) setReady(playerID string) int {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Ready[playerID] = true
	return len(r.Ready)
}

func (r *Room) getReadyCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Ready)
}

func (r *Room) markCompleted(playerID string) int {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.Rankings[playerID]; !exists {
		r.Rankings[playerID] = r.NextRank
		r.NextRank++
	}
	return r.Rankings[playerID]
}

func (r *Room) allCompleted() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Rankings) == len(r.Clients)
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
		})
	}
	return players
}

func (r *Room) getRankings() map[string]int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	rankings := make(map[string]int)
	for k, v := range r.Rankings {
		rankings[k] = v
	}
	return rankings
}

func (r *Room) reset(newChallenge map[string]interface{}) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Challenge = newChallenge
	r.Ready = make(map[string]bool)
	r.Rankings = make(map[string]int)
	r.NextRank = 1
	for client := range r.Clients {
		client.Progress = 0
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

	idx := rand.Intn(len(challenges))
	return &struct {
		ID   int32
		Text string
	}{
		ID:   challenges[idx].ID,
		Text: challenges[idx].Text,
	}, nil
}
