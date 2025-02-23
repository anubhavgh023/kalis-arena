import { Player } from "./player";
import { WsConnDriver } from "./ws.driver";
import { MapGenerator } from "./utils/hex";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private players: Map<string, Player>;
    private wsConDriver: WsConnDriver;
    private localPlayerID: string | null = null;
    private mapGen: MapGenerator

    //measure fps 
    private lastTime: number;
    private frameCount: number;
    private fps: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.players = new Map();
        this.wsConDriver = new WsConnDriver(this);
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;


        // gen con
        this.mapGen = new MapGenerator(40);
        this.mapGen.generateMap(canvas.width, canvas.height);


        window.addEventListener("keydown", e => {
            if (this.localPlayerID) {
                const localPlayer = this.players.get(this.localPlayerID);
                if (localPlayer) {
                    switch (e.key) {
                        case "ArrowLeft":
                            localPlayer.x -= localPlayer.velX;
                            break;
                        case "ArrowRight":
                            localPlayer.x += localPlayer.velX;
                            break;
                        case "ArrowUp":
                            localPlayer.y -= localPlayer.velY;
                            break;
                        case "ArrowDown":
                            localPlayer.y += localPlayer.velY;
                            break;
                    }
                    this.wsConDriver.sendPlayerPosition(localPlayer.x, localPlayer.y, "");
                }
            }
        })

    }

    public run() {
        this.gameLoop();
    }

    public addPlayer(id: string, player: Player) {
        this.players.set(id, player);
    }

    public removePlayer(id: string) {
        this.players.delete(id);
    }

    public getPlayer(id: string) {
        return this.players.get(id);
    }

    private gameLoop() {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        let fpsElem = document.querySelector(".fps")!;

        // Calculate FPS
        if (deltaTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            fpsElem.textContent = String(this.fps);
        }


        // Clear the canvas
        this.ctx.fillStyle = "rgb(0 0 0 / 25%)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.mapGen.drawMap(this.ctx);

        // Draw all players
        this.players.forEach(player => {
            player.draw(this.ctx)
            player.checkBound(this.canvas.width, this.canvas.height);
        })

        this.frameCount++
        requestAnimationFrame(() => this.gameLoop());
    }

    public setLocalPlayerId(id: string, color: string) {
        this.localPlayerID = id;
        const localPlayer = new Player(this.canvas.width / 2, this.canvas.height / 2, color);
        this.players.set(id, localPlayer);
    }
}
