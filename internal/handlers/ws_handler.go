package handlers

import (
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"strconv"
	"sync"

	"github.com/anubhavgh023/kalis-arena/internal/game"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WsHandler struct {
	gameState game.GameState
	mu        sync.Mutex
}

func NewWsHandler(gameState game.GameState) *WsHandler {
	return &WsHandler{
		gameState: gameState,
	}
}

func (wsh *WsHandler) HandleConns(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	defer conn.Close()

	// Generate PlayerID,Assigning color & random pos
	playerID := strconv.Itoa(len(wsh.gameState.GetAllPlayers()) + 1)
	randX := rand.IntN(10)*64 + 10
	randY := rand.IntN(10)*64 + 10

	// Creating new player
	newPlayer := game.Player{
		ID:   playerID,
		Conn: conn,
		X:    randX,
		Y:    randY,
	}

	// Add player to gameState
	wsh.gameState.AddPlayer(newPlayer)
	fmt.Printf("[PLAYER JOINED]> ID: %s; X: %d; Y: %d\n", playerID, newPlayer.X, newPlayer.Y)

	fmt.Printf("=== TOTAL PLAYERS]: %d ===\n", len(wsh.gameState.GetAllPlayers()))
	for id := range wsh.gameState.GetAllPlayers() {
		fmt.Println("Player ID: ", id)
	}
	fmt.Printf("\n=====================\n")

	// Send new player to frontend
	newPlayerData := game.NewPlayerMsg(
		game.MsgTypePlayerID,
		newPlayer.ID,
		newPlayer.X,
		newPlayer.Y,
	)

	if err := conn.WriteJSON(&newPlayerData); err != nil {
		log.Println("ERROR writing json:", err)
		conn.Close()
		return
	}

	//TODO: Send existing players to new client
	wsh.mu.Lock()
	for _, p := range wsh.gameState.GetAllPlayers() {
		if p.ID != playerID {
			exisitingPlayer := game.NewPlayerMsg(
				game.MsgTypePlayerJoin,
				p.ID,
				p.X,
				p.Y,
			)
			if err := conn.WriteJSON(&exisitingPlayer); err != nil {
				log.Println("ERROR sending existing player data:", err)
			}
		}
	}
	wsh.mu.Unlock()

	// Broadcast new player to all
	wsh.mu.Lock()
	for _, p := range wsh.gameState.GetAllPlayers() {
		if p.ID != playerID {
			newPlayerData := game.NewPlayerMsg(
				game.MsgTypePlayerJoin,
				newPlayer.ID,
				newPlayer.X,
				newPlayer.Y,
			)
			if err := p.Conn.WriteJSON(&newPlayerData); err != nil {
				log.Println("ERROR broadcasting new player:", err)
			}
		}
	}
	wsh.mu.Unlock()

	// Handle incoming messages event loop
	for {
		var msg game.PlayerMsg
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Websocket read error:", err)

			wsh.mu.Lock()
			// Remove player and notify others
			wsh.gameState.RemovePlayer(playerID)
			// Broadcast others to notify
			wsh.gameState.Broadcast(
				game.NewPlayerMsg(
					game.MsgTypePlayerLeave,
					playerID,
					0,
					0,
				),
			)
			wsh.mu.Unlock()
			conn.Close()
			break
		}

		fmt.Println("FROM CLIENT:", msg)

		// Process position updates
		if msg.Type == game.MsgTypePlayerMove {
			wsh.mu.Lock()
			if player, exists := wsh.gameState.GetPlayer(playerID); exists {
				player.X = msg.X
				player.Y = msg.Y
				wsh.gameState.UpdatePlayer(player)

				// Broadcast updates
				wsh.gameState.Broadcast(game.NewPlayerMsg(game.MsgTypePlayerMove, playerID, msg.X, msg.Y))
			}

			wsh.mu.Unlock()
		}
	}
}
