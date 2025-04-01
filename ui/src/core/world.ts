import { TILE_SIZE, ROWS, COLS } from "./config";
import mapData from "../tileMap4.json" assert {type: "json"};
import { Camera } from "../systems/camera";

type Level = {
    grassLayer: number[];
    propsLayer: number[];
    wallsLayer: number[];
    backgroundLayer: HTMLImageElement;
    collitionTileset: HTMLImageElement;
    propsTileset: HTMLImageElement;
}

export class World {
    public level1: Level
    public tileMapCols: number;
    public wallTileMapCols: number;
    public propsTileMapCols: number;

    // Draw Grid
    constructor() {
        if (!mapData.layers[0].data || !mapData.layers[1].data || !mapData.layers[3].data) {
            throw new Error("Error loading data from JSON: Missing or invalid layer data");
        }
        this.level1 = {
            grassLayer: mapData.layers[0].data,
            propsLayer: mapData.layers[1].data,
            wallsLayer: mapData.layers[3].data,

            // assets
            backgroundLayer: document.querySelector("#grass-tileset") as HTMLImageElement,
            collitionTileset: document.querySelector("#wall-tileset") as HTMLImageElement,
            propsTileset: document.querySelector("#props-tileset") as HTMLImageElement
        }
        // Number of cols in the tileMap image 32px block each
        this.tileMapCols = this.level1.backgroundLayer.width / TILE_SIZE;
        this.wallTileMapCols = this.level1.collitionTileset.width / TILE_SIZE;
        this.propsTileMapCols = this.level1.propsTileset.width / TILE_SIZE;
    }

    getTile(layer: number[], col: number, row: number): number {
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
            throw new Error(`ERROR: Out of bound tileMap(col:${col},row:${row})`);
        }

        return layer[row * COLS + col] || 0; // Default to 0 if undefined
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
    //}


    // Grass Layer 0: Dynamic Matrix Gen tileMap
    drawBackground(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        const grassFirstGid = 1; // From tileMap4.json

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const gid = this.getTile(this.level1.grassLayer, col, row);
                if (gid >= grassFirstGid) {
                    const localId = gid - grassFirstGid;
                    const sx = (localId % this.tileMapCols) * TILE_SIZE;
                    const sy = Math.floor(localId / this.tileMapCols) * TILE_SIZE;
                    const x = col * TILE_SIZE; // World coordinates
                    const y = row * TILE_SIZE;

                    ctx.drawImage(
                        this.level1.backgroundLayer,
                        sx,
                        sy,
                        TILE_SIZE,
                        TILE_SIZE,
                        Math.round(x),
                        Math.round(y),
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }

    // Walls Layer 3: Dynamic Matrix Gen tileMap
    drawWalls(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        // Props tileset firstgid from tileMap4.json
        const propsFirstGid = 321;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const gid = this.getTile(this.level1.wallsLayer, col, row);
                if (gid >= propsFirstGid) { // Only draw if it's a valid props tile
                    const localId = gid - propsFirstGid; // Convert GID to local ID
                    const sx = (localId % this.wallTileMapCols) * TILE_SIZE;
                    const sy = Math.floor(localId / this.wallTileMapCols) * TILE_SIZE;
                    const x = col * TILE_SIZE; // Use world coordinates
                    const y = row * TILE_SIZE;

                    ctx.drawImage(
                        this.level1.collitionTileset,
                        sx,
                        sy,
                        TILE_SIZE,
                        TILE_SIZE,
                        Math.round(x),
                        Math.round(y),
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }

    // Props Layer 2: Dynamic Rendering
    drawProps(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        // Props tileset firstgid from tileMap4.json
        const propsFirstGid = 65;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const gid = this.getTile(this.level1.propsLayer, col, row);
                if (gid >= propsFirstGid) { // Only draw if it's a valid props tile
                    const localId = gid - propsFirstGid; // Convert GID to local ID
                    const sx = (localId % this.propsTileMapCols) * TILE_SIZE;
                    const sy = Math.floor(localId / this.propsTileMapCols) * TILE_SIZE;
                    const x = col * TILE_SIZE; // Use world coordinates
                    const y = row * TILE_SIZE;

                    ctx.drawImage(
                        this.level1.propsTileset,
                        sx,
                        sy,
                        TILE_SIZE,
                        TILE_SIZE,
                        Math.round(x),
                        Math.round(y),
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }

    //------ DEBUG MODE -------//

    // Debug Mode
    drawGrid(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        ctx.strokeStyle = "green";
        for (let row = 0; row <= endRow; row++) {
            for (let col = 0; col <= endCol; col++) {
                ctx.strokeRect(
                    col * TILE_SIZE,
                    row * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
                ctx.fillStyle = "black";
                ctx.font = "12px";
                ctx.fillText(`${col}:${row}`,
                    col * TILE_SIZE - 24,
                    row * TILE_SIZE - 12
                );
            }
        }
    }

    // Debug Mode
    drawCollitionGrid(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        ctx.fillStyle = "rgba(0,0,255,0.4)";
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (this.getTile(this.level1.wallsLayer, col, row)) {
                    ctx.fillRect(
                        col * TILE_SIZE,
                        row * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }

    // Debug Mode
    drawPropsGrid(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / TILE_SIZE);
        const endCol = Math.min(startCol + Math.ceil(camera.width / TILE_SIZE), COLS - 1);
        const startRow = Math.floor(camera.y / TILE_SIZE);
        const endRow = Math.min(startRow + Math.ceil(camera.height / TILE_SIZE), ROWS - 1);

        ctx.fillStyle = "rgba(255,0,0,0.4)";
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (this.getTile(this.level1.propsLayer, col, row)) {
                    ctx.fillRect(
                        col * TILE_SIZE,
                        row * TILE_SIZE,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }
}
