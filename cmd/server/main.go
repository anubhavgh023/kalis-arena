package main

import (
	"log"
	"net/http"

	"github.com/anubhavgh023/kalis-arena/internal/game"
	"github.com/anubhavgh023/kalis-arena/internal/handlers"
)

const PORT = ":8080"

func main() {
	gameState := game.NewGameState()
	wsHandler := handlers.NewWsHandler(gameState)

	mux := http.NewServeMux()
	mux.HandleFunc("/", wsHandler.HandleConns)

	log.Println("Server Listening on PORT:", PORT)
	http.ListenAndServe(PORT, mux)
}
