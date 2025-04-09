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

	fs := http.FileServer(http.Dir("ui/dist"))
	mux.Handle("/", fs)
	mux.HandleFunc("/ws", wsHandler.HandleConns)

	log.Printf("Stating server at http://localhost%s", PORT)
	if err := http.ListenAndServe(PORT, mux); err != nil {
		log.Fatal(err)
	}
}
