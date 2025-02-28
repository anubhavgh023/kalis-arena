import { Game } from "./game";
import { Player } from "./player";
import { isPlayerState, PlayerState } from "./types";


export class WsConnDriver {
    private ws: WebSocket;
    private game: Game;
    private playerId: string | null = null;

    constructor(game: Game) {
        this.game = game;
        this.ws = new WebSocket("ws://localhost:8080/ws");

        this.ws.addEventListener("open", () => {
            console.log("WEBSOCKET CONNECTED.")
        });

        this.ws.addEventListener("message", e => {
            const data = JSON.parse(e.data);

            if (isPlayerState(data)) {
                console.log(`Player connected: ${data.id}`);
                this.handleMessage(data);
            } else {
                console.log("Received mismatched data from server");
                this.ws.close()
            }
        })
    }

    private handleMessage(data: PlayerState) {
        switch (data.type) {
            case "playerId":
                this.playerId = data.id;
                this.game.setLocalPlayerId(data.id, data.color)
                break
            case "playerJoined":
                const newPlayer = new Player(data.x, data.y, data.color);
                this.game.addPlayer(data.id, newPlayer);
                break;
            case "playerMoved":
                const player = this.game.getPlayer(data.id);
                if (player) {
                    player.x = data.x;
                    player.y = data.y;
                }
                break;
            case "playerLeft":
                this.game.removePlayer(data.id);
                break;
        }
    }

    public sendPlayerPosition(x: number, y: number, color: string) {
        if (this.playerId) {
            const msg: PlayerState = {
                id: this.playerId,
                type: "playerMoved",
                x,
                y,
                color,
            };
            this.ws.send(JSON.stringify(msg));
        }
    }
}
