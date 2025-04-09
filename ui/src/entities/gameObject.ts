import { SPRITE_OFFSET, TILE_SIZE } from "../core/config";
import { Game } from "../core/game";

export type SpriteData = {
    x: number,
    y: number,
    width: number,
    height: number,
    image?: any
}

export type Coordinates = {
    x: number,
    y: number

}

export type GameObjectType = {
    game?: Game,
    sprite?: SpriteData,
    position?: Coordinates,
    scale?: number,
    destPosition?: Coordinates,
    distToTravel?: Coordinates
}

export class GameObject {
    public gameObj: Required<GameObjectType>
    public width: number
    public height: number
    public debug: boolean

    constructor(gameObj: GameObjectType) {
        this.gameObj = {
            game: gameObj.game!,
            sprite: gameObj.sprite = gameObj.sprite ?? { x: 0, y: 0, width: TILE_SIZE, height: TILE_SIZE },
            position: gameObj.position = gameObj.position ?? { x: 1, y: 1 },
            scale: gameObj.scale = gameObj.scale ?? 1,
            destPosition: { x: gameObj.position.x, y: gameObj.position.y },
            distToTravel: { x: 0, y: 0 }
        }
        this.width = this.gameObj.sprite.width * this.gameObj.scale;
        this.height = this.gameObj.sprite.height * this.gameObj.scale;
        this.debug = true;
    }

    moveTowards(destPos: Coordinates, speed: number): number {
        // cal coordinates of distToTravel
        this.gameObj.distToTravel.x = this.gameObj.destPosition.x - this.gameObj.position.x;
        this.gameObj.distToTravel.y = this.gameObj.destPosition.y - this.gameObj.position.y;

        // cal dist to travel
        let distance = Math.hypot(this.gameObj.distToTravel.x, this.gameObj.distToTravel.y);

        if (distance <= speed) {
            // if close enough, snap to position
            this.gameObj.position.x = destPos.x;
            this.gameObj.position.y = destPos.y;
        } else {
            // take a step towards destination
            const stepX = this.gameObj.distToTravel.x / distance // normalizing: u = v/|v|
            const stepY = this.gameObj.distToTravel.y / distance // normalizing

            // update obj postion
            this.gameObj.position.x += stepX * speed;
            this.gameObj.position.y += stepY * speed;


            //remaining distance
            this.gameObj.distToTravel.x = destPos.x - this.gameObj.position.x;
            this.gameObj.distToTravel.y = destPos.y - this.gameObj.position.y;
            distance = Math.hypot(this.gameObj.distToTravel.x, this.gameObj.distToTravel.y);
        }

        return distance;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.gameObj.game.debugMode) {
            // current hero position
            ctx.fillStyle = "blue"
            ctx.fillRect(
                this.gameObj.position.x,
                this.gameObj.position.y,
                TILE_SIZE,
                TILE_SIZE
            );

            // dest hero position
            ctx.strokeStyle = "yellow"
            ctx.strokeRect(
                this.gameObj.destPosition.x,
                this.gameObj.destPosition.y,
                TILE_SIZE,
                TILE_SIZE
            );
        }

        // draw hero sprite
        ctx.drawImage(
            this.gameObj.sprite.image,
            this.gameObj.sprite.x * this.gameObj.sprite.width,
            this.gameObj.sprite.y * this.gameObj.sprite.height,
            this.gameObj.sprite.width,
            this.gameObj.sprite.height,

            // coordinates for placing cropped out sprite sheet on map
            this.gameObj.position.x - SPRITE_OFFSET,
            this.gameObj.position.y - TILE_SIZE,

            // adjusting scaling of sprite
            this.width,
            this.height
        );
    }
}
