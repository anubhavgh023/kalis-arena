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
        this.size = 20;

    };

    public updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        // player
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    drawDomain(ctx: CanvasRenderingContext2D) {
        // domain area
        ctx.beginPath()
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 1.5, 0, Math.PI * 2)
        let domainColor = this.color.split(')')
        domainColor[1] = "0.1" // alpha 
        ctx.fillStyle = domainColor.join() + ')';
        ctx.strokeStyle = "gray"
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
