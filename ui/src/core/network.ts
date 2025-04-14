import { PlayerState } from "../utils/types";
import { Game } from "./game";

export class Network {
    public game: Game
    public ws: WebSocket
    public onPlayerIDSet: (data: { id: string, px: number; py: number }) => void //callback

    constructor(game: Game, onPlayerIDSet: (data: { id: string, px: number; py: number }) => void) {
        this.game = game;
        this.onPlayerIDSet = onPlayerIDSet;
        this.ws = new WebSocket("ws://localhost:8080/ws");

        this.ws.addEventListener("open", () => {
            console.log("== WEBSOCKET CONNECTED ==")
        });

        this.ws.addEventListener("message", e => {
            try {
                const data = JSON.parse(e.data) as PlayerState;
                console.log("STEP 2: SERVER SEND>", JSON.stringify(data));
                this.handleMessage(data);
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        });

        this.ws.addEventListener("close", () => {
            console.log("== WEBSOCKET DISCONNECTED ==");
        });
    }

    handleMessage(data: PlayerState) {
        console.log("== handlemsg ==");
        console.log(`data.type: ${data.type}`);

        switch (data.type) {
            case "playerID":
                this.game.localPlayerID = data.id;
                this.onPlayerIDSet({ id: data.id, px: data.x, py: data.y }); // notify game
                break;
            case "playerJoined":
                console.log("[client] playerJoined with ID:", data.id);
                this.game.addRemotePlayer(data.id, data.x, data.y);
                break;
            case "playerMoved":
                this.game.updateRemotePlayer(data.id, data.x, data.y);
                break;
            case "playerLeft":
                this.game.removeRemotePlayer(data.id);
                break;
        }
    }

    sendPlayerPosition(x: number, y: number) {
        if (this.game.localPlayerID && this.ws.readyState === WebSocket.OPEN) {
            const msg: PlayerState = {
                id: this.game.localPlayerID,
                type: "playerMoved",
                x,
                y,
            };
            this.ws.send(JSON.stringify(msg));
        }
    }
}
