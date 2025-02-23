package handlers

import (
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"os/exec"

	"github.com/anubhavgh023/kalis-arena/internal/game"
	"github.com/anubhavgh023/kalis-arena/internal/utils"

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

	// Generate a unique ID for the player
	uuid, err := exec.Command("uuidgen").Output()
	if err != nil {
		log.Println("ERROR generating uuid:", err)
	}

	playerID := string(uuid)

	// Assigning color
	playerColor := utils.GenerateRandomColor()

	// Add player to the game state
	randPosX := rand.Float64()*560 + 24
	randPosY := rand.Float64()*560 + 24

	wsh.gameState.AddPlayer(playerID, game.Player{
		ID:    playerID,
		X:     randPosX,
		Y:     randPosY,
		Color: playerColor,
	}, conn)
	fmt.Printf("[PLAYER JOINED]> ID: %s; X: %.3f; Y: %.3f\n", playerID[:8], randPosX, randPosY)

	// Send the playerID & color back to the frontend
	playerData := game.NewPlayerMsg(game.MsgTypePlayerID, playerID, randPosX, randPosY, playerColor)
	err = conn.WriteJSON(playerData)
	if err != nil {
		log.Println("ERROR writing json data:", err)
	}

	// Send existing players' information to the new player
	existingPlayers := wsh.gameState.GetAllPlayers()
	for id, player := range existingPlayers {
		if id != playerID {
			existingPlayerMsg := game.NewPlayerMsg(
				game.MsgTypePlayerJoin,
				id,
				player.X,
				player.Y,
				player.Color,
			)
			if err = conn.WriteJSON(existingPlayerMsg); err != nil {
				log.Println("ERROR sending existing player data:", err)
				return
			}
		}
	}

	// Notify all client about new player
	fmt.Println("Broadcasting player joined:", playerID, "Color:", playerColor)
	wsh.gameState.Broadcast(game.NewPlayerMsg(game.MsgTypePlayerJoin, playerID, randPosX, randPosY, playerColor))

	// Handle incoming messages
	for {
		var msg game.PlayerMsg
		err := conn.ReadJSON(&msg)
		fmt.Println(msg)
		if err != nil {
			log.Println("Websocket read error:", err)
			wsh.gameState.RemovePlayer(playerID)
			wsh.gameState.Broadcast(game.NewPlayerMsg(game.MsgTypePlayerLeave, playerID, randPosX, randPosY, ""))
			break
		}

		// Update player position
		wsh.gameState.Broadcast(game.NewPlayerMsg(game.MsgTypePlayerMove, playerID, msg.X, msg.Y, ""))
		fmt.Printf("[PLAYER MOVED]> ID: %s; X: %.3f; Y: %.3f\n", playerID[:8], msg.X, msg.Y)
	}
}
