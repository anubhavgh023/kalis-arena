import { World } from "./world";
import { Player } from "../entities/player";
import { GameObjectType } from "../entities/gameObject";
import { Input } from "../systems/input";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { Network } from "./network";
import { JoinScreen } from "../screens/joinScreen";


export class Game {
    public world;
    public input;
    public player: Player | null = null;
    public localPlayerID: string | null = null;
    public players: Map<string, Player>

    // network
    public network: Network

    public eventUpdate: boolean = false;
    public eventTimer: number = 0;
    public eventInterval: number = 200;
    public ctx: CanvasRenderingContext2D;

    public debugMode: boolean;

    private pendingPlayerData: { id: string; px: number; py: number } | null = null;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.world = new World();
        this.input = new Input(this);
        this.debugMode = false;

        this.players = new Map();

        // Testing: network instance
        // this.network = new Network(this, (data: { id: string, px: number, py: number }) => {
        //     this.startGame(`Player_${data.id}`, data.px, data.py);
        // })

        this.network = new Network(this, (data: { id: string, px: number, py: number }) => {
            this.pendingPlayerData = data;
            this.localPlayerID = data.id;
        })

        new JoinScreen((username: string) => {
            if (this.pendingPlayerData) {
                this.startGame(username, this.pendingPlayerData.px, this.pendingPlayerData.py);
                this.pendingPlayerData = null;
            } else {
                console.log("No server data available")
            }
        })
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }

    startGame(username: string, px: number, py: number) {
        const gameObj: GameObjectType = {
            game: this,
            position: { x: px, y: py },
            // sprite-sheet
            sprite: {
                x: 0,
                y: 2,
                width: 64,
                height: 64,
                image: document.querySelector("#hero1") as HTMLImageElement
            },
        }

        // Add local player to map
        if (this.localPlayerID) {
            // Create New Player
            this.player = new Player(gameObj, username);
            this.players.set(this.localPlayerID, this.player);
        }

        // Start the game loop
        let lastTime = 0;
        const fpsElem = document.querySelector(".fps")!;
        const animate = (timeStamp: number) => {
            const deltaTime = (timeStamp - lastTime)
            fpsElem.textContent = String(Math.round(1000 / deltaTime));
            lastTime = timeStamp;

            this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            this.render(deltaTime);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

    }

    addRemotePlayer(id: string, px: number, py: number, username: string = `Player_${id}`) {
        if (id === this.localPlayerID) return; // skip local player
        const gameObj: GameObjectType = {
            game: this,
            position: { x: px, y: py },
            sprite: {
                x: 0,
                y: 2,
                width: 64,
                height: 64,
                image: document.querySelector("#hero1") as HTMLImageElement,
            },
        };
        const player = new Player(gameObj, username);
        this.players.set(id, player);
    }


    // // Update remote player
    // updateRemotePlayer(id: string, x: number, y: number) {
    //     const player = this.players.get(id);
    //     if (player && id !== this.localPlayerID) {
    //         player.gameObj.position.x = x;
    //         player.gameObj.position.y = y;
    //
    //         player.gameObj.destPosition.x = x;
    //         player.gameObj.destPosition.y = y;
    //     }
    // }

    // Update remote player
    updateRemotePlayer(id: string, x: number, y: number) {
        const player = this.players.get(id);

        if (player && id !== this.localPlayerID) {
            // Track previous position for movement detection
            const prevX = player.gameObj.position.x;
            const prevY = player.gameObj.position.y;

            // Align positions to grid
            const newX = x + 2;
            const newY = y + 2;
            player.gameObj.position.x = newX;
            player.gameObj.position.y = newY;
            player.gameObj.destPosition.x = newX;
            player.gameObj.destPosition.y = newY;

            // Set isMoving based on position change
            player.isMoving = newX !== prevX || newY !== prevY;

            // Update sprite orientation and animation
            if (player.isMoving) {
                // Set direction: right=11, left=9, down=10, up=8
                if (newX > prevX) player.gameObj.sprite.y = 11; // Right
                else if (newX < prevX) player.gameObj.sprite.y = 9; // Left
                else if (newY > prevY) player.gameObj.sprite.y = 10; // Down
                else if (newY < prevY) player.gameObj.sprite.y = 8; // Up
            } else {
                // Reset to idle frame when stopped
                player.gameObj.sprite.x = 0;
                player.isMoving = false;
            }
        }
    }


    // Remove remote player 
    removeRemotePlayer(id: string) {
        if (this.players.delete(id)) {
            console.log(`Removed player ${id}`);
        }
    }

    render(deltaTime: number) {
        if (!this.player) return;

        // update animation timer
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer -= this.eventInterval;
            this.eventUpdate = true;
        }

        // Translate context to account for camera position
        this.ctx.save();
        this.ctx.translate(-this.player.camera.x, -this.player.camera.y);


        // Render world using player's camera
        this.world.drawBackground(this.ctx, this.player.camera);
        this.world.drawProps(this.ctx, this.player.camera);
        this.world.drawWalls(this.ctx, this.player.camera);

        // Debug Mode: True || False
        if (this.debugMode) {
            this.world.drawGrid(this.ctx, this.player.camera);
            this.world.drawCollitionGrid(this.ctx, this.player.camera);
            this.world.drawPropsGrid(this.ctx, this.player.camera);
        }

        // Draw all players
        this.players.forEach((player) => {
            player.draw(this.ctx);
            player.update(deltaTime, player === this.player);
        })

        this.ctx.restore();
    }
}
