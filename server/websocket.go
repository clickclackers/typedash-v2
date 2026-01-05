package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		if os.Getenv("IS_LOCAL_DEV") == "true" {
			return true
		}
		return r.Header.Get("Origin") == "https://typedash.songyang.dev" || r.Header.Get("Origin") == "https://typedash-v2.netlify.app"
	},
}

// Client represents a player's WebSocket connection and game state
type Client struct {
	conn   *websocket.Conn
	send   chan []byte
	roomID string
	mu     sync.Mutex

	// Player info (exported for JSON serialization)
	ID       string `json:"id"`
	Username string `json:"username"`
	Progress int    `json:"progress"`
}

// HandleWebSocket handles new WebSocket connections
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	client := &Client{
		conn: conn,
		send: make(chan []byte, 256),
	}

	go client.writePump()
	client.readPump()
}

func (c *Client) writePump() {
	defer func() {
		err := c.conn.Close()
		if err != nil {
			log.Printf("Error closing connection for client %s: %v", c.ID, err)
		}
	}()

	for message := range c.send {
		c.mu.Lock()
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		c.mu.Unlock()

		if err != nil {
			log.Printf("Write error for client %s: %v", c.ID, err)
			return
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		HandleLeaveRoom(c)
		err := c.conn.Close()
		if err != nil {
			log.Printf("Error closing connection for client %s: %v", c.ID, err)
		}
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("Read error: %v", err)
			}
			break
		}

		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("JSON unmarshal error: %v", err)
			continue
		}

		msgType, ok := msg["type"].(string)
		if !ok {
			continue
		}

		c.handleMessage(msgType, msg)
	}
}

func (c *Client) handleMessage(msgType string, msg map[string]interface{}) {
	switch msgType {
	case "createRoom":
		categoryID, _ := msg["categoryId"].(float64)
		HandleCreateRoom(c, int(categoryID))

	case "joinRoom":
		roomID, _ := msg["roomID"].(string)
		username, _ := msg["username"].(string)
		HandleJoinRoom(c, roomID, username)

	case "ready":
		HandleReady(c)

	case "typingProgress":
		charsTyped, _ := msg["charsTyped"].(float64)
		HandleTypingProgress(c, int(charsTyped))

	case "completed", "testCompleted":
		HandleCompleted(c)

	case "leaveRoom":
		HandleLeaveRoom(c)
	}
}

func (c *Client) SendJSON(data map[string]interface{}) {
	msgJSON, _ := json.Marshal(data)
	c.send <- msgJSON
}

func (c *Client) SendError(message string) {
	c.SendJSON(map[string]interface{}{
		"type":    "error",
		"message": message,
	})
}
