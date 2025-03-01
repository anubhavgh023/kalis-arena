package handlers

import (
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/anubhavgh023/kalis-arena/internal/game"
	"github.com/anubhavgh023/kalis-arena/internal/utils"

	"github.com/gorilla/websocket"
)

const SERVER_FPS = 30
const TICK_RATE = time.Second / SERVER_FPS
const PLAYER_SIZE = 20

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	SHARED_CONFIG = utils.LoadConfig("shared_config.json")
)

type WsHandler struct {
	gameState  game.GameState
	inputQueue []game.PlayerMsg
	mu         sync.Mutex
}

func NewWsHandler(gameState game.GameState) *WsHandler {
	return &WsHandler{
		gameState:  gameState,
		inputQueue: make([]game.PlayerMsg, 0, 100),
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
	playerID := strconv.Itoa(len(wsh.gameState.GetAllPlayers()) + 1)
	playerColor := utils.GenerateRandomColor()
	randPosX := (rand.IntN(SHARED_CONFIG.CANVAS.WIDTH) + 100) % SHARED_CONFIG.CANVAS.WIDTH
	randPosY := (rand.IntN(SHARED_CONFIG.CANVAS.HEIGHT) + 100) % SHARED_CONFIG.CANVAS.HEIGHT

	newPlayer := game.Player{
		ID:      playerID,
		X:       randPosX,
		Y:       randPosY,
		Color:   playerColor,
		LastSeq: 0,
	}

	// Add player to the game state
	wsh.gameState.AddPlayer(playerID, newPlayer, conn)
	// fmt.Printf("[PLAYER JOINED]> ID: %s; X: %d; Y: %d\n", playerID, randPosX, randPosY)

	// Send the playerID & color back to the frontend
	playerData := game.NewPlayerMsg(
		game.MsgTypePlayerID,
		playerID,
		randPosX,
		randPosY,
		0,
		playerColor,
	)
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
				0,
				player.Color,
			)
			if err = conn.WriteJSON(existingPlayerMsg); err != nil {
				log.Println("ERROR sending existing player data:", err)
				wsh.gameState.RemovePlayer(playerID)
				return
			}
		}
	}

	// Notify all client about new player
	broadcastMsgPlayerJoined := game.NewPlayerMsg(
		game.MsgTypePlayerJoin,
		playerID,
		randPosX,
		randPosY,
		0,
		playerColor,
	)
	wsh.gameState.Broadcast(broadcastMsgPlayerJoined)

	// Handle incoming messages event loop
	for {
		var msg game.PlayerMsg
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Websocket read error:", err)
			break
		}
		msg.ID = playerID

		wsh.mu.Lock()
		wsh.inputQueue = append(wsh.inputQueue, msg)
		wsh.mu.Unlock()
	}

	// Remove players when conn is cloned
	wsh.gameState.RemovePlayer(playerID)
	broadcastMsgPlayerLeave := game.NewPlayerMsg(
		game.MsgTypePlayerLeave,
		playerID,
		randPosX,
		randPosY,
		0,
		"",
	)
	wsh.gameState.Broadcast(broadcastMsgPlayerLeave)
	fmt.Printf("[PLAYER LEFT]> ID: %s\n", playerID)
}

func (wsh *WsHandler) tick() {
	wsh.mu.Lock()
	defer wsh.mu.Unlock()
	// Process all messages in game with each tick
	if len(wsh.inputQueue) > 0 {
		for _, msg := range wsh.inputQueue {
			// playerMoved
			if player, exists := wsh.gameState.GetPlayer(msg.ID); exists {
				// update player pos only if seq is newer
				if msg.Seq > player.LastSeq {
					player.X = msg.X
					player.Y = msg.Y
					player.LastSeq = msg.Seq
				}

				// check collition

				// update game state
				wsh.gameState.UpdatePlayer(msg.ID, player)

				// broadcast authorative state
				broadcastMsgPlayerMoved := game.NewPlayerMsg(
					game.MsgTypePlayerMove,
					msg.ID,
					player.X,
					player.Y,
					msg.Seq,
					player.Color,
				)
				wsh.gameState.Broadcast(broadcastMsgPlayerMoved)
			}
			fmt.Printf("[SERVER]-> Time: %v,TICK MSG: %v\n", time.Now().Second(), msg)
		}
		wsh.inputQueue = wsh.inputQueue[:0]
	}
}

func (wsh *WsHandler) StartGameLoop() {
	ticker := time.NewTicker(TICK_RATE)
	defer ticker.Stop()
	fmt.Printf("Starting game loop with tick rate: %v\n", TICK_RATE)

	for {
		select {
		case <-ticker.C:
			wsh.tick()
		}
	}
}
