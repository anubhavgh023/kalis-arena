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

	go wsHandler.StartGameLoop()

	fs := http.FileServer(http.Dir("ui/dist"))
	mux.Handle("/", fs)
	mux.HandleFunc("/ws", wsHandler.HandleConns)

	log.Println("Stating server at PORT", PORT)
	err := http.ListenAndServe(PORT, mux)

	log.Println("Stating server at PORT", PORT)
	err = http.ListenAndServe(PORT, mux)
	if err != nil {
		log.Fatal(err)
	}
}
