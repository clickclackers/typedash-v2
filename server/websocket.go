package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var jwtSecret []byte

func init() {
	if os.Getenv("IS_LOCAL_DEV") == "true" {
		jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	} else {
		secretBytes, err := os.ReadFile("/run/secrets/jwt_secret")
		if err != nil {
			log.Printf("Warning: Failed to read JWT_SECRET: %v", err)
			return
		}
		jwtSecret = []byte(strings.TrimSpace(string(secretBytes)))
	}
}

type Claims struct {
	UserID   int32  `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

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
	conn      *websocket.Conn
	send      chan []byte
	roomID    string
	mu        sync.Mutex
	closeOnce sync.Once

	// Player info (exported for JSON serialization)
	ID       string `json:"id"` // Database user ID (as string) or random ID for guests
	Username string `json:"username"`
	Progress int    `json:"progress"`
	Ready    bool   `json:"ready"`
	Rank     int    `json:"rank"` // 0 means not completed yet
}

// closeConn safely closes the WebSocket connection exactly once
func (c *Client) closeConn() {
	c.closeOnce.Do(func() {
		err := c.conn.Close()
		if err != nil {
			log.Printf("Error closing socket %s: %v", c.ID, err)
		}
	})
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

	// Try to authenticate user from JWT cookie
	if cookie, err := r.Cookie("auth_token"); err == nil && len(jwtSecret) > 0 {
		token, err := jwt.ParseWithClaims(cookie.Value, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(*Claims); ok {
				client.ID = fmt.Sprintf("%d", claims.UserID)
				client.Username = claims.Username
				log.Printf("Authenticated WebSocket connection for user %s (ID: %s)", claims.Username, client.ID)
			}
		}
	}

	if client.ID == "" {
		client.ID = randomID()
		client.Username = "Guest"
	}

	go client.writePump()
	client.readPump()
}

func (c *Client) writePump() {
	defer c.closeConn()

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
		c.closeConn()
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
		HandleJoinRoom(c, roomID)

	case "playerReady":
		HandleReady(c)

	case "typingProgress":
		charsTyped, _ := msg["charsTyped"].(float64)
		HandleTypingProgress(c, int(charsTyped))

	case "leaveRoom":
		HandleLeaveRoom(c)

		// case "restartTest":
		// 	HandleRestartTest(c)
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
