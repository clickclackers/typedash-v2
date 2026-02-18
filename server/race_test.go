package main

import (
	"fmt"
	"sync"
	"testing"
)

func makeTestClient(id string) *Client {
	return &Client{
		ID:       id,
		Username: "user_" + id,
		send:     make(chan []byte, 256),
	}
}

func drainClient(c *Client, done <-chan struct{}) {
	for {
		select {
		case _, ok := <-c.send:
			if !ok {
				return
			}
		case <-done:
			return
		}
	}
}

func TestRace_ConcurrentJoinAndLeave(t *testing.T) {
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": "the quick brown fox jumps over the lazy dog",
	}
	room := createRoom("test-join-leave", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("test-join-leave")
	}()

	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			c := makeTestClient(fmt.Sprintf("join-%d", i))
			c.roomID = "test-join-leave"
			go drainClient(c, done)

			room.addClient(c)
			_ = room.getPlayers()
			_ = room.clientCount()
			room.removeClient(c)
		}(i)
	}
	wg.Wait()
}

func TestRace_ConcurrentTypingProgress(t *testing.T) {
	text := "the quick brown fox jumps over the lazy dog"
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": text,
	}
	room := createRoom("test-progress", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("test-progress")
	}()

	clients := make([]*Client, 4)
	for i := 0; i < 4; i++ {
		c := makeTestClient(fmt.Sprintf("prog-%d", i))
		c.roomID = "test-progress"
		clients[i] = c
		go drainClient(c, done)
		room.addClient(c)
	}

	var wg sync.WaitGroup
	for _, c := range clients {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			for j := 1; j <= len(text); j++ {
				HandleTypingProgress(c, j)
			}
		}(c)
	}
	wg.Wait()

	for _, c := range clients {
		room.removeClient(c)
	}
}

func TestRace_ConcurrentGetPlayers(t *testing.T) {
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": "hello world",
	}
	room := createRoom("test-getplayers", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("test-getplayers")
	}()

	clients := make([]*Client, 4)
	for i := 0; i < 4; i++ {
		c := makeTestClient(fmt.Sprintf("gp-%d", i))
		c.roomID = "test-getplayers"
		clients[i] = c
		go drainClient(c, done)
		room.addClient(c)
	}

	var wg sync.WaitGroup

	// Concurrent getPlayers while modifying client state
	for _, c := range clients {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			for j := 0; j < 50; j++ {
				c.mu.Lock()
				c.Progress = j
				c.Ready = j%2 == 0
				c.mu.Unlock()
			}
		}(c)
	}

	for i := 0; i < 4; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 50; j++ {
				_ = room.getPlayers()
			}
		}()
	}

	wg.Wait()

	for _, c := range clients {
		room.removeClient(c)
	}
}

func TestRace_LeaveWhileBroadcast(t *testing.T) {
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": "the quick brown fox",
	}
	room := createRoom("test-leave-broadcast", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("test-leave-broadcast")
	}()

	clients := make([]*Client, 4)
	for i := 0; i < 4; i++ {
		c := makeTestClient(fmt.Sprintf("lb-%d", i))
		c.roomID = "test-leave-broadcast"
		clients[i] = c
		go drainClient(c, done)
		room.addClient(c)
	}

	var wg sync.WaitGroup

	// Some clients send progress
	for _, c := range clients[:2] {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			for j := 1; j <= 10; j++ {
				HandleTypingProgress(c, j)
			}
		}(c)
	}

	// Other clients leave
	for _, c := range clients[2:] {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			HandleLeaveRoom(c)
		}(c)
	}

	wg.Wait()

	for _, c := range clients[:2] {
		room.removeClient(c)
	}
}

func TestRace_ReadyWhileProgress(t *testing.T) {
	text := "the quick brown fox"
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": text,
	}
	room := createRoom("test-ready-progress", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("test-ready-progress")
	}()

	clients := make([]*Client, 4)
	for i := 0; i < 4; i++ {
		c := makeTestClient(fmt.Sprintf("rp-%d", i))
		c.roomID = "test-ready-progress"
		clients[i] = c
		go drainClient(c, done)
		room.addClient(c)
	}

	var wg sync.WaitGroup

	// Some clients ready up
	for _, c := range clients[:2] {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			HandleReady(c)
		}(c)
	}

	// Others send progress
	for _, c := range clients[2:] {
		wg.Add(1)
		go func(c *Client) {
			defer wg.Done()
			for j := 1; j < len(text); j++ {
				HandleTypingProgress(c, j)
			}
		}(c)
	}

	wg.Wait()

	for _, c := range clients {
		room.removeClient(c)
	}
}
