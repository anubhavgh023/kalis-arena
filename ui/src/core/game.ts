import { World } from "./world";
import { Player } from "../entities/player";
import { GameObjectType } from "../entities/gameObject";
import { Input } from "../systems/input";
// import { WsConnDriver } from "./ws.driver";
import { GAME_HEIGHT, GAME_WIDTH } from "./config";
// import { JoinScreen } from "../screens/joinScreen";

export class Game {
    public world;
    public input;
    public player: Player | null = null;

    // ws-connection
    // public players: Map<string, Player>;
    // public wsConDriver: WsConnDriver;
    // public localPlayerID: string | null = null;

    public eventUpdate: boolean = false;
    public eventTimer: number = 0;
    public eventInterval: number = 200;
    public ctx: CanvasRenderingContext2D;

    public debugMode: boolean

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.world = new World();
        this.input = new Input(this);
        this.debugMode = false;

        // this.wsConDriver = new WsConnDriver(this);
        // this.players = new Map();

        // new JoinScreen((username) => {
        //     this.startGame(username);
        // })
        this.startGame("testing");
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
        this.player = new Player(gameObj, username, true);

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

        if (this.player) {
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

            // Update player
            this.player.update(deltaTime);

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
}
