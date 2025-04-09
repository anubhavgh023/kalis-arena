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
	players   map[string]game.PlayerMsg
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

	//Generate PlayerID,Assigning color & random pos
	playerID := strconv.Itoa(rand.IntN(1000) + rand.IntN(1000))
	randX := rand.IntN(10)
	randY := rand.IntN(10)

	// testing: creating new player
	newPlayer := game.Player{
		ID: playerID,
		X:  randX,
		Y:  randY,
	}

	//TODO: Add player to gameState
	fmt.Printf("[PLAYER JOINED]> ID: %s; X: %d; Y: %d\n", playerID, newPlayer.X, newPlayer.Y)

	// send new player to frontend
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

	// Handle incoming messages event loop
	for {
		var msg game.PlayerMsg
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Websocket read error:", err)
			break
		}

		fmt.Println("FROM CLIENT:", msg)

		wsh.mu.Lock()
		wsh.mu.Unlock()
	}
}
