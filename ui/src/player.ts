export class Player {
    public x: number;
    public y: number;
    public velX: number;
    public velY: number;
    public color: string;
    private size: number;
    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.velX = 20;
        this.velY = 20;
        this.color = color;
        this.size = 10;

    };

    public updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 40, 40);
        ctx.strokeRect(this.x, this.y, 40, 40);
    }

    checkBound(width: number, height: number) {
        if ((this.x + this.size) >= width) {
            this.x -= this.size
        }

        if ((this.x - this.size) <= 0) {
            this.x += this.size

        }

        if ((this.y + this.size) >= height) {
            this.y -= this.size
        }

        if ((this.y - this.size) <= 0) {
            this.y += this.size

        }
    }
}
