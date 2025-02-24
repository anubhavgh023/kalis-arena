import { Player } from "./player";
import { WsConnDriver } from "./ws.driver";
import { MapRenderer } from "./utils/mapRenderer";

const Keys = {
    up: false,
    down: false,
    left: false,
    right: false,
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private players: Map<string, Player>;
    private wsConDriver: WsConnDriver;
    private localPlayerID: string | null = null;
    private mapRender: MapRenderer
    private postionUpdateInterval: number | null = null;

    // track prev postions for delta calculations
    private prevX: number = 0;
    private prevY: number = 0;

    private moveSpeed: number = 10;

    private interpolationFactor: number = 0.6;

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

        // delta postion update
        this.postionUpdateInterval = window.setInterval(() => {
            if (this.localPlayerID) {
                const localPlayer = this.players.get(this.localPlayerID)!;

                // only send update if the pos changed
                if (this.prevX !== localPlayer.x && this.prevX !== localPlayer.y) {
                    //cal delta
                    const dx = localPlayer.x - this.prevX;
                    const dy = localPlayer.y - this.prevY;

                    this.wsConDriver.sendPlayerPosition(dx, dy, "delta");

                    //update prev pos
                    this.prevX = localPlayer.x;
                    this.prevY = localPlayer.y;
                }
            }
        }, 100);


        // generate map layout
        this.mapRender = new MapRenderer();
        // this.mapGen.generateMap(canvas.width, canvas.height);

        window.addEventListener("keydown", e => {
            e.preventDefault();
            if (e.key === "ArrowUp" || e.key === "w") Keys.up = true;
            if (e.key === "ArrowLeft" || e.key === "a") Keys.left = true;
            if (e.key === "ArrowDown" || e.key === "s") Keys.down = true;
            if (e.key === "ArrowRight" || e.key === "d") Keys.right = true;
            this.move()
        })

        window.addEventListener("keyup", e => {
            e.preventDefault();
            if (e.key === "ArrowUp" || e.key === "w") Keys.up = false;
            if (e.key === "ArrowLeft" || e.key === "a") Keys.left = false;
            if (e.key === "ArrowDown" || e.key === "s") Keys.down = false;
            if (e.key === "ArrowRight" || e.key === "d") Keys.right = false;
            this.move()
        })
    }

    public cleanup() {
        if (this.postionUpdateInterval !== null) {
            clearInterval(this.postionUpdateInterval);
        }
    }

    public move() {
        if (this.localPlayerID) {
            const localPlayer = this.players.get(this.localPlayerID)!;
            let moved = false;
            if (Keys.up) {
                localPlayer.y -= this.moveSpeed;
                moved = true;
            }

            if (Keys.down) {
                localPlayer.y += this.moveSpeed;
                moved = true;
            }

            if (Keys.left) {
                localPlayer.x -= this.moveSpeed;
                moved = true;
            }

            if (Keys.right) {
                localPlayer.x += this.moveSpeed;
                moved = true;
            }

            if (moved) {
                const dx = localPlayer.x - this.prevX;
                const dy = localPlayer.x - this.prevY;

                if (dx !== 0 && dy !== 0) {
                    this.wsConDriver.sendPlayerPosition(dx, dy, "delta");

                    //update prev pos
                    this.prevX = localPlayer.x;
                    this.prevY = localPlayer.y;
                }
            }
        }
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

    public updatePlayerPosition(id: string, dx: number, dy: number) {
        const localPlayer = this.players.get(id);
        if (localPlayer && id !== this.localPlayerID) {
            localPlayer.x += dx * this.interpolationFactor;
            localPlayer.y += dy * this.interpolationFactor;
            localPlayer.checkBound(this.canvas.width, this.canvas.height);
        }
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw map
        this.mapRender.drawMap(this.ctx);

        // Draw all players
        this.players.forEach(player => {
            player.drawDomain(this.ctx);
            player.drawPlayer(this.ctx);
            player.checkBound(this.canvas.width, this.canvas.height);
        })


        this.frameCount++
        requestAnimationFrame(() => this.gameLoop());
    }

    public setLocalPlayerId(id: string, color: string) {
        this.localPlayerID = id;
        const localPlayer = new Player(this.canvas.width / 2, this.canvas.height / 2, color);
        this.players.set(id, localPlayer);

        // init prev pos tracking
        this.prevX = localPlayer.x;
        this.prevY = localPlayer.y;
    }
}
