import { Game } from "./game";
import { Player } from "./player";

type PlayerState = {
    id: string
    type: "playerId" | "playerJoined" | "playerMoved" | "playerLeft";
    x: number;
    y: number;
    color: string;
}

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
            const data = JSON.parse(e.data) as PlayerState;
            this.handleMessage(data);
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
