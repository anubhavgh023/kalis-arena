import { COLS, GAME_HEIGHT, GAME_WIDTH, ROWS, TILE_SIZE } from "../core/config";
import { GameObject, GameObjectType } from "./gameObject";
import { Direction } from "../systems/input";
import { Camera } from "../systems/camera";

export class Player extends GameObject {
    public speed: number;
    public maxHeroSpriteFrame: number;
    public isMoving: boolean;
    public username: string;

    public speedX: number;
    public speedY: number

    public camera: Camera;

    constructor(gameObj: GameObjectType, username: string) {
        super(gameObj);
        this.speed = 128;
        this.maxHeroSpriteFrame = 8;
        this.isMoving = false;
        this.username = username;
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

    // update(deltaTime: number, isLocal: boolean) {
    //     if (!isLocal) return;
    //
    //     let nextX = this.gameObj.destPosition.x;
    //     let nextY = this.gameObj.destPosition.y;
    //     const scaledSpeed = this.speed * (deltaTime / 1000);
    //     const distance = this.moveTowards(this.gameObj.destPosition, scaledSpeed);
    //     const arrived = distance <= scaledSpeed;
    //
    //     // Reset speed tracking
    //     this.speedX = 0;
    //     this.speedY = 0;
    //
    //     if (arrived) {
    //         let key = this.gameObj.game.input.lastKey(); // Use Game's input
    //         if (key === Direction.UP) {
    //             nextY -= TILE_SIZE;
    //             this.gameObj.sprite.y = 8;
    //             this.speedY = -1;
    //         }
    //         if (key === Direction.DOWN) {
    //             nextY += TILE_SIZE;
    //             this.gameObj.sprite.y = 10;
    //             this.speedY = 1;
    //         }
    //         if (key === Direction.LEFT) {
    //             nextX -= TILE_SIZE;
    //             this.gameObj.sprite.y = 9;
    //             this.speedX = -1
    //         }
    //         if (key === Direction.RIGHT) {
    //             nextX += TILE_SIZE;
    //             this.gameObj.sprite.y = 11;
    //             this.speedX = 1
    //         }
    //
    //         // determine the row,col
    //         const col = nextX / TILE_SIZE;
    //         const row = nextY / TILE_SIZE;
    //
    //         // only allow if not colliding with wall
    //         if (
    //             !this.gameObj.game.world.getTile(this.gameObj.game.world.level1.wallsLayer!, col, row)
    //             && !this.gameObj.game.world.getTile(this.gameObj.game.world.level1.propsLayer!, col, row)
    //         ) {
    //             this.gameObj.destPosition.x = nextX;
    //             this.gameObj.destPosition.y = nextY;
    //         }
    //     }
    //
    //     this.isMoving = this.gameObj.game.input.keys.length > 0 || distance > 0;
    //
    //     if (this.gameObj.game.eventUpdate && this.isMoving) {
    //         if (this.gameObj.sprite.x < this.maxHeroSpriteFrame - 1) {
    //             this.gameObj.sprite.x++;
    //         } else {
    //             this.gameObj.sprite.x = 0;
    //         }
    //
    //         // sending player postition
    //         this.gameObj.game.network.sendPlayerPosition(
    //             Math.floor(this.gameObj.position.x),
    //             Math.floor(this.gameObj.position.y)
    //         )
    //     }
    //
    //     // Update camera to center on player's rendered position
    //     this.camera.update(
    //         this.gameObj.position.x,
    //         this.gameObj.position.y,
    //         // deltaTime
    //     );
    //
    // }



    update(deltaTime: number, isLocal: boolean) {
        if (!isLocal) {
            // Allow remote players to update animations
            if (this.isMoving && this.gameObj.game.eventUpdate) {
                if (this.gameObj.sprite.x < this.maxHeroSpriteFrame - 1) {
                    this.gameObj.sprite.x++;
                } else {
                    this.gameObj.sprite.x = 0;
                }
            }
            this.camera.update(this.gameObj.position.x, this.gameObj.position.y);
            return;
        };

        let nextX = this.gameObj.destPosition.x;
        let nextY = this.gameObj.destPosition.y;
        const scaledSpeed = this.speed * (deltaTime / 1000);
        const distance = this.moveTowards(this.gameObj.destPosition, scaledSpeed);
        const arrived = distance <= scaledSpeed;

        // Reset speed tracking
        this.speedX = 0;
        this.speedY = 0;

        if (arrived) {
            const keys = this.gameObj.game.input.keys; // Check all pressed keys
            let moved = false;

            // Prioritize one direction to prevent diagonal movement
            if (keys.includes(Direction.UP)) {
                nextY -= TILE_SIZE;
                this.gameObj.sprite.y = 8; // Up sprite
                this.speedY = -1;
                moved = true;
            } else if (keys.includes(Direction.DOWN)) {
                nextY += TILE_SIZE;
                this.gameObj.sprite.y = 10; // Down sprite
                this.speedY = 1;
                moved = true;
            } else if (keys.includes(Direction.LEFT)) {
                nextX -= TILE_SIZE;
                this.gameObj.sprite.y = 9; // Left sprite
                this.speedX = -1;
                moved = true;
            } else if (keys.includes(Direction.RIGHT)) {
                nextX += TILE_SIZE;
                this.gameObj.sprite.y = 11; // Right sprite
                this.speedX = 1;
                moved = true;
            }

            if (moved) {
                const col = Math.floor(nextX / TILE_SIZE);
                const row = Math.floor(nextY / TILE_SIZE);

                // Walls and Props collision
                const wallTile = this.gameObj.game.world.getTile(this.gameObj.game.world.level1.wallsLayer!, col, row);
                const propTile = this.gameObj.game.world.getTile(this.gameObj.game.world.level1.propsLayer!, col, row);

                // Check for player collision 
                let playerCollision = false;
                for (const [_, otherPlayer] of this.gameObj.game.players) {
                    if (otherPlayer != this) {
                        const otherCol = Math.floor(otherPlayer.gameObj.position.x / TILE_SIZE)
                        const otherRow = Math.floor(otherPlayer.gameObj.position.y / TILE_SIZE);
                        if (col === otherCol && row === otherRow) {
                            playerCollision = true;
                            break;
                        }
                    }
                }

                // Allow movement only if no wall, prop, or player collision
                if (!wallTile && !propTile && !playerCollision) {
                    this.gameObj.destPosition.x = nextX;
                    this.gameObj.destPosition.y = nextY;
                }
            }
        }

        // Update moving state
        this.isMoving = this.gameObj.game.input.keys.length > 0 || distance > 0;

        if (this.gameObj.game.eventUpdate && this.isMoving) {
            // Animate local player
            if (this.gameObj.sprite.x < this.maxHeroSpriteFrame - 1) {
                this.gameObj.sprite.x++;
            } else {
                this.gameObj.sprite.x = 0;
            }

            // Send position to server
            this.gameObj.game.network.sendPlayerPosition(
                Math.floor(this.gameObj.position.x),
                Math.floor(this.gameObj.position.y)
            );
        }

        this.camera.update(this.gameObj.position.x, this.gameObj.position.y);
    }

    draw(ctx: CanvasRenderingContext2D) {
        //drawing from gameObj
        super.draw(ctx);

        ctx.fillStyle = "white";
        ctx.font = "12px Electrolize";
        ctx.fillText(this.username, this.gameObj.position.x - 10, this.gameObj.position.y - 20);
    }
}
