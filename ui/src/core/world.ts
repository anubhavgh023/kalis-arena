import { TILE_SIZE, ROWS, COLS, GAME_HEIGHT, GAME_WIDTH, SPRITE_OFFSET } from "./config";
import mapData from "../testMap3.json" assert {type: "json"};
import { Camera } from "../systems/camera";

type Level = {
    grassLayer: number[];
    wallsLayer?: number[];
    backgroundLayer: HTMLImageElement;
    collitionTileset: HTMLImageElement;
}

export class World {
    public level1: Level
    public tileMapCols: number;

    // Draw Grid
    constructor() {
        this.level1 = {
            grassLayer: mapData.layers[0].data,
            // wallsLayer: mapData.layers[1].data,

            // assets
            backgroundLayer: document.querySelector("#grass-tileset") as HTMLImageElement,
            collitionTileset: document.querySelector("#wall-tileset") as HTMLImageElement
        }
        // Number of cols in the tileMap image 32px block each
        this.tileMapCols = this.level1.backgroundLayer.width / TILE_SIZE;
    }

    // updateCamera(px: number, py: number, deltaTime: number) {
    //     this.camX = px - (this.camWidth / 2);
    //     this.camY = py - (this.camHeight / 2);
    //
    //     // // clamp
    //     this.camX = Math.max(0, Math.min(this.camX, this.mapX));
    //     this.camY = Math.max(0, Math.min(this.camY, this.mapY));
    // }
    //
    //
    getTile(layer: number[], col: number, row: number): number {
        //layer 0 || layer 1 ...
        return layer[row * COLS + col]
    }

    // drawBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
    //     ctx.drawImage(
    //         // Load image
    //         this.level1.backgroundLayer,
    //
    //         // Camera cropping: (x1,y1) -> (x2,y2)
    //         camera.x,
    //         camera.y,
    //         camera.width,
    //         camera.height,
    //
    //         // Steach it to: (x1,y1) -> (x2,y2)
    //         0,
    //         0,
    //         camera.width,
    //         camera.height,
    //     );


    // Dynamic Matrix Gen tileMap
    drawBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
        // camera pos: col,row:
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = startCol + (camera.width / TILE_SIZE);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = startRow + Math.floor(camera.height / TILE_SIZE);

        // camera offsets
        const offsetX = -camera.x + (startCol * TILE_SIZE);
        const offsetY = -camera.y + (startRow * TILE_SIZE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tileType = this.getTile(this.level1.grassLayer, row, col);
                const x = ((col - startCol) * TILE_SIZE) + offsetX;
                const y = ((row - startRow) * TILE_SIZE) + offsetY;
                ctx.drawImage(
                    // Load image
                    this.level1.backgroundLayer,

                    // Camera cropping: (x1,y1) -> (x2,y2)
                    ((tileType - 1) * TILE_SIZE) % this.level1.backgroundLayer.width,
                    Math.floor((tileType - 1) / this.tileMapCols) * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE,

                    // Steach it to: (x1,y1) -> (x2,y2)
                    Math.round(x), //dest x
                    Math.round(y),//dest y
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
        }
    }

    drawGrid(ctx: CanvasRenderingContext2D) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                ctx.strokeStyle = "green"
                ctx.strokeRect(
                    col * TILE_SIZE,
                    row * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
        }
    }
}
