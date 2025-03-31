export class Camera {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public maxX: number;
    public maxY: number;
    constructor(width: number, height: number, mapWidth: number, mapHeight: number) {
        this.x = 0
        this.y = 0
        this.width = width;
        this.height = height;
        this.maxX = mapWidth;
        this.maxY = mapHeight;
    }

    update(px: number, py: number) {
        // center the camera to player's position
        this.x = px - (this.width / 2);
        this.y = py - (this.height / 2);

        // clamp to map boundaries
        this.x = Math.max(0, Math.min(this.x, this.maxX))
        this.y = Math.max(0, Math.min(this.y, this.maxY))
    }
}
