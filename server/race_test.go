package main

import (
	"fmt"
	"io"
	"log"
	"runtime"
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

// --- Benchmarks ---

func suppressLogs() func() {
	original := log.Writer()
	log.SetOutput(io.Discard)
	return func() { log.SetOutput(original) }
}

type benchRoom struct {
	room    *Room
	clients []*Client
}

func setupBenchRooms(numRooms, playersPerRoom int, done <-chan struct{}) []benchRoom {
	text := "the quick brown fox jumps over the lazy dog and then runs back again across the field"
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": text,
	}

	brs := make([]benchRoom, numRooms)
	for i := 0; i < numRooms; i++ {
		roomID := fmt.Sprintf("bench-%d", i)
		room := createRoom(roomID, challenge)
		clients := make([]*Client, playersPerRoom)
		for j := 0; j < playersPerRoom; j++ {
			c := makeTestClient(fmt.Sprintf("r%d-c%d", i, j))
			c.roomID = roomID
			go drainClient(c, done)
			room.addClient(c)
			clients[j] = c
		}
		brs[i] = benchRoom{room: room, clients: clients}
	}
	return brs
}

func teardownBenchRooms(brs []benchRoom) {
	for _, br := range brs {
		for _, c := range br.clients {
			br.room.removeClient(c)
		}
		deleteRoom(br.room.ID)
	}
}

func BenchmarkBroadcast_10Rooms(b *testing.B) {
	benchmarkBroadcast(b, 10, 4)
}

func BenchmarkBroadcast_100Rooms(b *testing.B) {
	benchmarkBroadcast(b, 100, 4)
}

func BenchmarkBroadcast_500Rooms(b *testing.B) {
	benchmarkBroadcast(b, 500, 4)
}

func BenchmarkBroadcast_1000Rooms(b *testing.B) {
	benchmarkBroadcast(b, 1000, 4)
}

func benchmarkBroadcast(b *testing.B, numRooms, playersPerRoom int) {
	restore := suppressLogs()
	defer restore()

	done := make(chan struct{})
	brs := setupBenchRooms(numRooms, playersPerRoom, done)

	textLen := len(brs[0].room.Challenge["text"].(string))

	b.ResetTimer()
	b.ReportAllocs()

	for n := 0; n < b.N; n++ {
		progress := (n % (textLen - 1)) + 1
		for _, br := range brs {
			for _, c := range br.clients {
				HandleTypingProgress(c, progress)
			}
		}
	}

	b.StopTimer()
	close(done)
	teardownBenchRooms(brs)
}

func BenchmarkConcurrentBroadcast_100Rooms(b *testing.B) {
	benchmarkConcurrentBroadcast(b, 100, 4)
}

func BenchmarkConcurrentBroadcast_500Rooms(b *testing.B) {
	benchmarkConcurrentBroadcast(b, 500, 4)
}

func benchmarkConcurrentBroadcast(b *testing.B, numRooms, playersPerRoom int) {
	restore := suppressLogs()
	defer restore()

	done := make(chan struct{})
	brs := setupBenchRooms(numRooms, playersPerRoom, done)

	textLen := len(brs[0].room.Challenge["text"].(string))

	b.ResetTimer()
	b.ReportAllocs()

	b.RunParallel(func(pb *testing.PB) {
		i := 0
		for pb.Next() {
			progress := (i % (textLen - 1)) + 1
			br := brs[i%numRooms]
			c := br.clients[i%playersPerRoom]
			HandleTypingProgress(c, progress)
			i++
		}
	})

	b.StopTimer()
	close(done)
	teardownBenchRooms(brs)
}

func BenchmarkGetPlayers_4Players(b *testing.B) {
	restore := suppressLogs()
	defer restore()

	done := make(chan struct{})
	brs := setupBenchRooms(1, 4, done)

	b.ResetTimer()
	b.ReportAllocs()

	for n := 0; n < b.N; n++ {
		_ = brs[0].room.getPlayers()
	}

	b.StopTimer()
	close(done)
	teardownBenchRooms(brs)
}

func BenchmarkJoinLeave(b *testing.B) {
	restore := suppressLogs()
	defer restore()

	text := "the quick brown fox jumps over the lazy dog"
	challenge := map[string]interface{}{
		"id":   int32(1),
		"text": text,
	}
	room := createRoom("bench-join-leave", challenge)
	done := make(chan struct{})
	defer func() {
		close(done)
		deleteRoom("bench-join-leave")
	}()

	b.ResetTimer()
	b.ReportAllocs()

	for n := 0; n < b.N; n++ {
		c := makeTestClient(fmt.Sprintf("jl-%d", n))
		c.roomID = "bench-join-leave"
		go drainClient(c, done)
		room.addClient(c)
		room.removeClient(c)
	}
}

func BenchmarkMemoryPerRoom(b *testing.B) {
	restore := suppressLogs()
	defer restore()

	done := make(chan struct{})
	defer close(done)

	var before, after runtime.MemStats
	runtime.GC()
	runtime.ReadMemStats(&before)

	numRooms := 1000
	brs := setupBenchRooms(numRooms, 4, done)

	runtime.GC()
	runtime.ReadMemStats(&after)

	bytesPerRoom := (after.HeapAlloc - before.HeapAlloc) / uint64(numRooms)
	b.ReportMetric(float64(bytesPerRoom), "bytes/room")
	b.ReportMetric(float64(numRooms), "rooms")
	b.ReportMetric(float64(numRooms*4), "clients")
	b.ReportMetric(float64(after.HeapAlloc-before.HeapAlloc)/(1024*1024), "total_MB")

	teardownBenchRooms(brs)
}
