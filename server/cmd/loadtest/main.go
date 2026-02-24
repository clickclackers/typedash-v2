package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

type config struct {
	serverURL      string
	numRooms       int
	playersPerRoom int
	typingDelayMs  int
	rampUpMs       int
}

type stats struct {
	mu              sync.Mutex
	connectErrors   int64
	messageErrors   int64
	droppedMessages int64
	broadcastLats   []time.Duration
}

func (s *stats) addLatency(d time.Duration) {
	s.mu.Lock()
	s.broadcastLats = append(s.broadcastLats, d)
	s.mu.Unlock()
}

func (s *stats) report(totalConns, totalRooms int, elapsed time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	fmt.Println("\n========================================")
	fmt.Println("  LOAD TEST RESULTS")
	fmt.Println("========================================")
	fmt.Printf("  Rooms:              %d\n", totalRooms)
	fmt.Printf("  Players/room:       %d\n", totalConns/totalRooms)
	fmt.Printf("  Total connections:  %d\n", totalConns)
	fmt.Printf("  Total duration:     %s\n", elapsed.Round(time.Millisecond))
	fmt.Printf("  Connect errors:     %d\n", atomic.LoadInt64(&s.connectErrors))
	fmt.Printf("  Message errors:     %d\n", atomic.LoadInt64(&s.messageErrors))
	fmt.Printf("  Dropped messages:   %d\n", atomic.LoadInt64(&s.droppedMessages))
	fmt.Println("----------------------------------------")

	if len(s.broadcastLats) == 0 {
		fmt.Println("  No latency samples collected.")
		fmt.Println("========================================")
		return
	}

	sort.Slice(s.broadcastLats, func(i, j int) bool {
		return s.broadcastLats[i] < s.broadcastLats[j]
	})

	n := len(s.broadcastLats)
	var total time.Duration
	for _, d := range s.broadcastLats {
		total += d
	}

	fmt.Printf("  Broadcast latency (%d samples):\n", n)
	fmt.Printf("    avg:  %s\n", (total / time.Duration(n)).Round(time.Microsecond))
	fmt.Printf("    p50:  %s\n", s.broadcastLats[n*50/100].Round(time.Microsecond))
	fmt.Printf("    p90:  %s\n", s.broadcastLats[n*90/100].Round(time.Microsecond))
	fmt.Printf("    p95:  %s\n", s.broadcastLats[n*95/100].Round(time.Microsecond))
	fmt.Printf("    p99:  %s\n", s.broadcastLats[n*99/100].Round(time.Microsecond))
	fmt.Printf("    max:  %s\n", s.broadcastLats[n-1].Round(time.Microsecond))
	fmt.Printf("  Throughput: %.0f msgs/sec\n", float64(n)/elapsed.Seconds())
	fmt.Println("========================================")
}

type player struct {
	conn   *websocket.Conn
	id     string
	roomID string
	inbox  chan map[string]interface{}
}

func connectPlayer(serverURL string, st *stats) (*player, error) {
	u, _ := url.Parse(serverURL)
	u.Path = "/ws"

	headers := http.Header{}
	headers.Set("Origin", "https://typedash.songyang.dev")
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), headers)
	if err != nil {
		atomic.AddInt64(&st.connectErrors, 1)
		return nil, fmt.Errorf("dial: %w", err)
	}

	p := &player{
		conn:  conn,
		inbox: make(chan map[string]interface{}, 256),
	}

	go p.readLoop(st)
	return p, nil
}

func (p *player) readLoop(st *stats) {
	for {
		_, message, err := p.conn.ReadMessage()
		if err != nil {
			return
		}
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err != nil {
			atomic.AddInt64(&st.messageErrors, 1)
			continue
		}
		select {
		case p.inbox <- msg:
		default:
			atomic.AddInt64(&st.droppedMessages, 1)
		}
	}
}

func (p *player) send(msg map[string]interface{}) error {
	data, _ := json.Marshal(msg)
	return p.conn.WriteMessage(websocket.TextMessage, data)
}

func (p *player) waitForType(msgType string, timeout time.Duration) (map[string]interface{}, error) {
	deadline := time.After(timeout)
	for {
		select {
		case msg := <-p.inbox:
			if t, _ := msg["type"].(string); t == msgType {
				return msg, nil
			}
		case <-deadline:
			return nil, fmt.Errorf("timeout waiting for %q", msgType)
		}
	}
}

func (p *player) drainUntilType(msgType string, timeout time.Duration) (map[string]interface{}, error) {
	deadline := time.After(timeout)
	for {
		select {
		case msg := <-p.inbox:
			if t, _ := msg["type"].(string); t == msgType {
				return msg, nil
			}
		case <-deadline:
			return nil, fmt.Errorf("timeout draining for %q", msgType)
		}
	}
}

func (p *player) close() {
	p.conn.WriteMessage(websocket.CloseMessage,
		websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	p.conn.Close()
}

func runRoom(cfg config, roomNum int, st *stats, wg *sync.WaitGroup) {
	defer wg.Done()

	wait := 5 * time.Second

	creator, err := connectPlayer(cfg.serverURL, st)
	if err != nil {
		log.Printf("[room %d] creator connect failed: %v", roomNum, err)
		return
	}
	defer creator.close()

	err = creator.send(map[string]interface{}{
		"type":       "createRoom",
		"categoryId": 1,
	})
	if err != nil {
		log.Printf("[room %d] create room send failed: %v", roomNum, err)
		return
	}

	resp, err := creator.waitForType("roomCreated", wait)
	if err != nil {
		log.Printf("[room %d] create room failed: %v", roomNum, err)
		return
	}
	roomID, _ := resp["roomID"].(string)
	creator.roomID = roomID
	if id, ok := resp["assignedID"].(string); ok {
		creator.id = id
	}

	challengeRaw, _ := resp["challenge"].(map[string]interface{})
	challengeText, _ := challengeRaw["text"].(string)
	if challengeText == "" {
		log.Printf("[room %d] no challenge text received", roomNum)
		return
	}

	joiners := make([]*player, 0, cfg.playersPerRoom-1)
	for i := 1; i < cfg.playersPerRoom; i++ {
		p, err := connectPlayer(cfg.serverURL, st)
		if err != nil {
			log.Printf("[room %d] joiner %d connect failed: %v", roomNum, i, err)
			continue
		}
		defer p.close()

		err = p.send(map[string]interface{}{
			"type":   "joinRoom",
			"roomID": roomID,
		})
		if err != nil {
			log.Printf("[room %d] join send failed: %v", roomNum, err)
			continue
		}

		idResp, err := p.waitForType("assignedID", wait)
		if err != nil {
			log.Printf("[room %d] joiner %d assignedID failed: %v", roomNum, i, err)
			continue
		}
		p.id = idResp["assignedID"].(string)
		p.roomID = roomID
		joiners = append(joiners, p)
	}

	allPlayers := append([]*player{creator}, joiners...)
	if len(allPlayers) < 2 {
		log.Printf("[room %d] not enough players (%d), skipping", roomNum, len(allPlayers))
		return
	}

	for _, p := range allPlayers {
		_ = p.send(map[string]interface{}{"type": "playerReady"})
	}
	for _, p := range allPlayers {
		_, _ = p.drainUntilType("receiveReady", wait)
	}

	delay := time.Duration(cfg.typingDelayMs) * time.Millisecond
	textLen := len(challengeText)

	var typeWg sync.WaitGroup
	for _, p := range allPlayers {
		typeWg.Add(1)
		go func(p *player) {
			defer typeWg.Done()
			for charIdx := 1; charIdx <= textLen; charIdx++ {
				sendTime := time.Now()
				err := p.send(map[string]interface{}{
					"type":       "typingProgress",
					"charsTyped": charIdx,
				})
				if err != nil {
					atomic.AddInt64(&st.messageErrors, 1)
					return
				}

				// Wait for at least one progress/completed broadcast back
				timeout := time.After(2 * time.Second)
				gotOwnResponse := false
				for !gotOwnResponse {
					select {
					case msg := <-p.inbox:
						t, _ := msg["type"].(string)
						if t == "progressUpdate" || t == "playerCompleted" {
							lat := time.Since(sendTime)
							st.addLatency(lat)
							gotOwnResponse = true
						}
					case <-timeout:
						gotOwnResponse = true
					}
				}

				// Drain any queued messages that arrived during processing,
				// recording latency for each progress/completed message
				draining := true
				for draining {
					select {
					case msg := <-p.inbox:
						t, _ := msg["type"].(string)
						if t == "progressUpdate" || t == "playerCompleted" {
							st.addLatency(time.Since(sendTime))
						}
					default:
						draining = false
					}
				}

				if charIdx < textLen {
					time.Sleep(delay)
				}
			}
		}(p)
	}
	typeWg.Wait()
}

func main() {
	cfg := config{}
	flag.StringVar(&cfg.serverURL, "url", "ws://localhost:3000", "WebSocket server URL")
	flag.IntVar(&cfg.numRooms, "rooms", 10, "Number of concurrent rooms")
	flag.IntVar(&cfg.playersPerRoom, "players", 4, "Players per room (max 4)")
	flag.IntVar(&cfg.typingDelayMs, "delay", 80, "Delay between keystrokes in ms (80ms ≈ 12 chars/sec)")
	flag.IntVar(&cfg.rampUpMs, "rampup", 500, "Delay between room creation in ms")
	flag.Parse()

	if cfg.playersPerRoom > 4 {
		cfg.playersPerRoom = 4
	}
	if cfg.playersPerRoom < 2 {
		cfg.playersPerRoom = 2
	}

	totalConns := cfg.numRooms * cfg.playersPerRoom

	fmt.Println("========================================")
	fmt.Println("  TYPEDASH LOAD TEST")
	fmt.Println("========================================")
	fmt.Printf("  Server:   %s\n", cfg.serverURL)
	fmt.Printf("  Rooms:    %d\n", cfg.numRooms)
	fmt.Printf("  Players:  %d/room (%d total connections)\n", cfg.playersPerRoom, totalConns)
	fmt.Printf("  Typing:   %dms delay (~%.0f chars/sec)\n", cfg.typingDelayMs, 1000.0/math.Max(1, float64(cfg.typingDelayMs)))
	fmt.Printf("  Ramp-up:  %dms between rooms\n", cfg.rampUpMs)
	fmt.Println("========================================")
	fmt.Println()

	st := &stats{}
	start := time.Now()

	var wg sync.WaitGroup
	rampDelay := time.Duration(cfg.rampUpMs) * time.Millisecond

	for i := 0; i < cfg.numRooms; i++ {
		wg.Add(1)
		go runRoom(cfg, i, st, &wg)
		if i < cfg.numRooms-1 && rampDelay > 0 {
			time.Sleep(rampDelay)
		}
	}

	wg.Wait()
	elapsed := time.Since(start)

	st.report(totalConns, cfg.numRooms, elapsed)

	if atomic.LoadInt64(&st.connectErrors) > 0 {
		os.Exit(1)
	}
}
