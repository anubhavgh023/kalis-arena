import { Game } from "./game";
// import { Player } from "../entities/player";
import { isPlayerState, PlayerState } from "../utils/types";

export class WsConnDriver {
    private ws: WebSocket;
    public game: Game;
    private playerId: string | null = null;

    constructor(game: Game) {
        this.game = game;
        this.ws = new WebSocket("ws://localhost:8080/ws");

        this.ws.addEventListener("open", () => {
            console.log("WEBSOCKET CONNECTED.")
        });

        this.ws.addEventListener("message", e => {
            const data = JSON.parse(e.data) as PlayerState;
            if (isPlayerState(data)) {
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
                console.log("SET: playerId")
                // this.playerId = data.id;
                // this.game.setLocalPlayerId(data.id)
                break
            case "playerJoined":
                console.log("JOINED: new player")
                // const newPlayer = new Player(data.x, data.y, data.color);
                // newPlayer.setTargetPosition(data.x, data.y);
                // this.game.addPlayer(data.id, newPlayer);
                break;
            case "playerMoved":
                console.log("MOVED: playerId")
                // const player = this.game.getPlayer(data.id);
                // if (player) {
                //     if (data.id === this.playerId) {
                //         // reconcile localplayer with server state
                //         player.reconcile(data.x, data.y, data.seq)
                //     } else {
                //         player.setTargetPosition(data.x, data.y);
                //     }
                // }
                break;
            case "playerLeft":
                console.log("LEFT: playerId")
                // this.game.removePlayer(data.id);
                break;
        }
    }

    public sendPlayerPosition(x: number, y: number) {
        if (this.playerId) {
            const msg: PlayerState = {
                id: this.playerId,
                type: "playerMoved",
                x,
                y,
            };
            this.ws.send(JSON.stringify(msg));
        }
    }
}
