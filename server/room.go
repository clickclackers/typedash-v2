// server/room.go
package main

// import (
// 	"encoding/json"
// )

// type Player struct {
// 	ID       int
// 	Username string
// 	Progress int
// }

// type Room struct {
// 	ID        string
// 	Challenge map[string]interface{} // or a struct if you want
// 	Players   []Player
// 	Ready     []Player
// 	Rankings  map[string]int
// }

// func saveRoom(room *Room) error {
// 	data, err := json.Marshal(room)
// 	if err != nil {
// 		return err
// 	}
// 	return rdb.Set(ctx, "room:"+room.ID, data, 0).Err()
// }

// func getRoom(roomID string) (*Room, error) {
// 	val, err := rdb.Get(ctx, "room:"+roomID).Result()
// 	if err != nil {
// 		return nil, err
// 	}
// 	var room Room
// 	if err := json.Unmarshal([]byte(val), &room); err != nil {
// 		return nil, err
// 	}
// 	return &room, nil
// }

// func deleteRoom(roomID string) error {
// 	return rdb.Del(ctx, "room:"+roomID).Err()
// }

// func addPlayerToRoom(roomID string, player Player) error {
// 	room, err := getRoom(roomID)
// 	if err != nil {
// 		return err
// 	}

// 	// Check if player already exists
// 	for _, p := range room.Players {
// 		if p.ID == player.ID {
// 			return nil // Player already exists
// 		}
// 	}

// 	room.Players = append(room.Players, player)
// 	return saveRoom(room)
// }
