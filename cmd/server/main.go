package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

const PORT = ":8080"

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Player struct {
	ID    string
	X     float64
	Y     float64
	Color string
}

type GameState struct {
	Players map[string]Player
	Conns   map[string]*websocket.Conn
	mu      sync.Mutex
}

var gameState = GameState{
	Players: make(map[string]Player),
	Conns:   make(map[string]*websocket.Conn),
}

func handleWsConns(w http.ResponseWriter, r *http.Request) {
	// Upgrade the http.conn -> ws.conn
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Websocket upgrade error:", err)
		return
	}
	defer conn.Close()

	// Gen a unique ID for the player
	playerID := fmt.Sprintf("player_%d", len(gameState.Players)+1)

	// Assigning color
	playerColor := generateRandomColor()
	fmt.Println(playerID, playerColor)

	// Add player to the game state
	gameState.mu.Lock()
	gameState.Players[playerID] = Player{ID: playerID, X: rand.Float64() * 720, Y: rand.Float64() * 720, Color: playerColor}
	gameState.Conns[playerID] = conn
	gameState.mu.Unlock()

	// Send the player's ID back to the frontend
	conn.WriteJSON(map[string]interface{}{
		"type":  "playerId",
		"id":    playerID,
		"color": playerColor,
	})

	// Send existing players to the new client
	gameState.mu.Lock()
	for id, player := range gameState.Players {
		if id != playerID {
			conn.WriteJSON(map[string]interface{}{
				"type":  "playerJoined",
				"id":    player.ID,
				"x":     player.X,
				"y":     player.Y,
				"color": playerColor,
			})
		}
	}
	gameState.mu.Unlock()

	// Notify all client about new player
	broadcastPlayerJoined(playerID)

	// Handle incoming messages
	for {
		var msg map[string]interface{}
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Websocket read error:", err)
			gameState.mu.Lock()
			delete(gameState.Players, playerID)
			delete(gameState.Conns, playerID)
			gameState.mu.Unlock()
			broadcastPlayerLeft(playerID)
			break
		}
		// Update player position
		gameState.mu.Lock()
		player := gameState.Players[playerID]
		player.X = msg["x"].(float64)
		player.Y = msg["y"].(float64)
		gameState.Players[playerID] = player
		gameState.mu.Unlock()

		// Broadcast the updated position to all clients
		broadcastPlayerMoved(playerID, player.X, player.Y,player.Color)
	}
}

func broadcastPlayerJoined(playerID string) {
	gameState.mu.Lock()
	player := gameState.Players[playerID]
	gameState.mu.Unlock()

	broadcast(map[string]interface{}{
		"type":  "playerJoined",
		"id":    playerID,
		"x":     player.X,
		"y":     player.Y,
		"color": player.Color,
	})
}

func broadcastPlayerMoved(playerID string, x float64, y float64, color string) {
	broadcast(map[string]interface{}{
		"type":  "playerMoved",
		"id":    playerID,
		"x":     x,
		"y":     y,
		"color": color,
	})
}

func broadcastPlayerLeft(playerID string) {
	broadcast(map[string]interface{}{
		"type": "playerLeft",
		"id":   playerID,
	})
}

func broadcast(msg interface{}) {
	gameState.mu.Lock()
	defer gameState.mu.Unlock()

	for _, conn := range gameState.Conns {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("Websocket write error:", err)
		}
	}
}

func generateRandomColor() string {
	return fmt.Sprintf("hsl(%d, 100%%, 50%%)", rand.Intn(360))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", handleWsConns)

	log.Println("Server Listening on PORT:", PORT)
	http.ListenAndServe(PORT, mux)
}
