import { PlayerState } from "../utils/types";
import { Game } from "./game";

export class Network {
    public game: Game
    public ws: WebSocket
    public onPlayerIDSet: (id: string) => void //callback

    constructor(game: Game, onPlayerIDSet: (id: string) => void) {
        this.game = game;
        this.onPlayerIDSet = onPlayerIDSet;
        this.ws = new WebSocket("ws://localhost:8080/ws");

        this.ws.addEventListener("open", () => {
            console.log("STEP 1: WEBSOCKET CONNECTED.")
            this.ws.send(JSON.stringify({ type: "hello", message: "Client connected" }));
        });

        this.ws.addEventListener("message", e => {
            try {
                const data = JSON.parse(e.data) as PlayerState;
                console.log("STEP 2: SERVER SEND>", JSON.stringify(data));
                this.handleMessage(data);
            } catch (err) {
                console.error("Error parsing WebSocket message:", err);
            }
        })
    }

    handleMessage(data: PlayerState) {
        console.log("== handlemsg ==");
        console.log(`data.type: ${data.type}`);

        switch (data.type) {
            case "playerID":
                console.log("== playerID ==");
                this.game.localPlayerID = data.id;
                console.log("ws: LocalID", this.game.localPlayerID);
                this.onPlayerIDSet(data.id); // notify game
                break;
            case "playerJoined":
                console.log("ws: LocalID", this.game.localPlayerID);
                break;
        }
    }

    sendPlayerPosition(x: number, y: number) {
        if (this.game.localPlayerID) {
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
