package game

import (
	"sync"

	"github.com/gorilla/websocket"
)

type GameState interface {
	AddPlayer(id string, player Player, conn *websocket.Conn)
	UpdatePlayer(id string, player Player)
	RemovePlayer(id string)
	GetPlayer(id string) (Player, bool)
	Broadcast(msg PlayerMsg)
	GetAllPlayers() map[string]Player
}

type gameState struct {
	players map[string]Player
	conns   map[string]*websocket.Conn
	mu      sync.RWMutex
}

func NewGameState() GameState {
	return &gameState{
		players: make(map[string]Player),
		conns:   make(map[string]*websocket.Conn),
	}
}

func (gs *gameState) AddPlayer(id string, player Player, conn *websocket.Conn) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.players[id] = player
	gs.conns[id] = conn
}

func (gs *gameState) UpdatePlayer(id string, updatedPlayer Player) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.players[id] = updatedPlayer
}

func (gs *gameState) RemovePlayer(id string) {
	gs.mu.Lock()
	delete(gs.players, id)
	delete(gs.conns, id)
	gs.mu.Unlock()
}

func (gs *gameState) GetPlayer(id string) (Player, bool) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	player, exists := gs.players[id]
	return player, exists
}

func (gs *gameState) Broadcast(msg PlayerMsg) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	for _, conn := range gs.conns {
		conn.WriteJSON(msg)
	}
}

func (gs *gameState) GetAllPlayers() map[string]Player {
	gs.mu.RLock()
	defer gs.mu.RUnlock()

	return gs.players
}
