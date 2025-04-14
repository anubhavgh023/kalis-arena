package game

import (
	"log"
	"sync"
)

type GameState interface {
	AddPlayer(player Player)
	UpdatePlayer(player Player)
	RemovePlayer(id string)
	GetPlayer(id string) (Player, bool)
	Broadcast(msg PlayerMsg)
	GetAllPlayers() map[string]Player
}

type gameState struct {
	players map[string]Player
	mu      sync.RWMutex
}

// Init NewGameState
func NewGameState() GameState {
	return &gameState{
		players: make(map[string]Player),
	}
}

// Add Player to gamestate
func (gs *gameState) AddPlayer(player Player) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.players[player.ID] = player
}

// Update Player
func (gs *gameState) UpdatePlayer(player Player) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	gs.players[player.ID] = player
}

// Remove Player from gamestate
func (gs *gameState) RemovePlayer(id string) {
	gs.mu.Lock()
	delete(gs.players, id)
	gs.mu.Unlock()
}

// Get Player by id
func (gs *gameState) GetPlayer(id string) (Player, bool) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	player, exists := gs.players[id]
	return player, exists
}

// Broadcast to every player in gamestate
func (gs *gameState) Broadcast(msg PlayerMsg) {
	gs.mu.Lock()
	defer gs.mu.Unlock()

	for _, player := range gs.players {
		if err := player.Conn.WriteJSON(msg); err != nil {
			log.Println("ERROR Broadcasting: ", err)
			player.Conn.Close()
		}
	}
}

// Get all players map
func (gs *gameState) GetAllPlayers() map[string]Player {
	gs.mu.RLock()
	defer gs.mu.RUnlock()

	return gs.players
}
