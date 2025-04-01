import { COLS, GAME_HEIGHT, GAME_WIDTH, ROWS, TILE_SIZE } from "../core/config";
import { GameObject, GameObjectType } from "./gameObject";
import { Direction } from "../systems/input";
import { Camera } from "../systems/camera";

export class Player extends GameObject {
    public speed: number;
    public maxHeroSpriteFrame: number;
    public isMoving: boolean;
    public username: string;
    public isLocal: boolean;

    public speedX: number;
    public speedY: number

    public camera: Camera;

    constructor(gameObj: GameObjectType, username: string, isLocal: boolean = false) {
        super(gameObj);
        this.speed = 128;
        this.maxHeroSpriteFrame = 8;
        this.isMoving = false;
        this.username = username;
        this.isLocal = isLocal;
        this.speedX = 0;
        this.speedY = 0;

        // Init cam for this player
        this.camera = new Camera(
            GAME_WIDTH,
            GAME_HEIGHT,
            COLS * TILE_SIZE,
            ROWS * TILE_SIZE
        )
    }

    update(deltaTime: number) {
        if (!this.isLocal) return;

        let nextX = this.gameObj.destPosition.x;
        let nextY = this.gameObj.destPosition.y;
        const scaledSpeed = this.speed * (deltaTime / 1000);
        const distance = this.moveTowards(this.gameObj.destPosition, scaledSpeed);
        const arrived = distance <= scaledSpeed;

        // Reset speed tracking
        this.speedX = 0;
        this.speedY = 0;

        if (arrived) {
            let key = this.gameObj.game.input.lastKey(); // Use Game's input
            if (key === Direction.UP) {
                nextY -= TILE_SIZE;
                this.gameObj.sprite.y = 8;
                this.speedY = -1;
            }
            if (key === Direction.DOWN) {
                nextY += TILE_SIZE;
                this.gameObj.sprite.y = 10;
                this.speedY = 1;
            }
            if (key === Direction.LEFT) {
                nextX -= TILE_SIZE;
                this.gameObj.sprite.y = 9;
                this.speedX = -1
            }
            if (key === Direction.RIGHT) {
                nextX += TILE_SIZE;
                this.gameObj.sprite.y = 11;
                this.speedX = 1
            }

            // determine the row,col
            const col = nextX / TILE_SIZE;
            const row = nextY / TILE_SIZE;

            // only allow if not colliding with wall
            if (
                !this.gameObj.game.world.getTile(this.gameObj.game.world.level1.wallsLayer!, col, row)
                && !this.gameObj.game.world.getTile(this.gameObj.game.world.level1.propsLayer!, col, row)
            ) {
                this.gameObj.destPosition.x = nextX;
                this.gameObj.destPosition.y = nextY;
            }
        }

        this.isMoving = this.gameObj.game.input.keys.length > 0 || distance > 0;

        if (this.gameObj.game.eventUpdate && this.isMoving) {
            if (this.gameObj.sprite.x < this.maxHeroSpriteFrame - 1) {
                this.gameObj.sprite.x++;
            } else {
                this.gameObj.sprite.x = 0;
            }
        }

        // Update camera to center on player's rendered position
        this.camera.update(
            this.gameObj.position.x,
            this.gameObj.position.y,
            // deltaTime
        );
    }

    draw(ctx: CanvasRenderingContext2D) {
        //drawing from gameObj
        super.draw(ctx);

        ctx.fillStyle = "white";
        ctx.font = "12px Electrolize";
        ctx.fillText(this.username, this.gameObj.position.x - 10, this.gameObj.position.y - 20);
    }
}
