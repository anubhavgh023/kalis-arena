import { World } from "./world";
import { Player } from "../entities/player";
import { GameObjectType } from "../entities/gameObject";
import { Input } from "../systems/input";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
import { Network } from "./network";
// import { JoinScreen } from "../screens/joinScreen";


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

    public debugMode: boolean

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.world = new World();
        this.input = new Input(this);
        this.debugMode = true;

        this.players = new Map();

        // network instance
        this.network = new Network(this, (id: string) => {
            console.log(`ID set: ${id}`);
            this.startGame(`testing`);
        })

        // new JoinScreen((username) => {
        //     this.startGame(username);
        // })
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }

    startGame(username: string) {
        const gameObj: GameObjectType = {
            game: this,
            position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 },
            // sprite-sheet
            sprite: {
                x: 0,
                y: 2,
                width: 64,
                height: 64,
                image: document.querySelector("#hero1") as HTMLImageElement
            },
        }
        // Create New Player
        this.player = new Player(gameObj, username);

        // add player to map
        if (this.localPlayerID) {
            this.players.set(this.localPlayerID, this.player);
        }
        console.log("playerMap:", this.players);
        console.log("localID:", this.localPlayerID);

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

    render(deltaTime: number) {
        if (!this.player) return;

        // update animation timer
        if (this.eventTimer < this.eventInterval) {
            this.eventTimer += deltaTime;
            this.eventUpdate = false;
        } else {
            this.eventTimer = this.eventInterval % this.eventTimer;
            this.eventUpdate = true;

        }

        // Translate context to account for camera position
        this.ctx.save();
        this.ctx.translate(-this.player.camera.x, -this.player.camera.y);

        // // Draw all players
        // this.players.forEach((player, id) => {
        //     console.log("ID:", id);
        //     player.update(deltaTime, true);
        //     this.world.drawBackground(this.ctx, player.camera);
        //     this.world.drawProps(this.ctx, player.camera);
        //     this.world.drawWalls(this.ctx, player.camera);
        // })
        //
        //


        // Update player
        this.player.update(deltaTime, true);

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

        this.player.draw(this.ctx);
        this.ctx.restore();
    }
}
