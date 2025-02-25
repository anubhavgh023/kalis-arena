export class Player {
    public x: number;
    public y: number;
    private moveSpeed: number;
    private keys = {
        up: false,
        down: false,
        left: false,
        right: false,
    }
    public color: string;
    private size: number;
    private dashOffset: number = 0;
    constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.moveSpeed = 14;
        this.color = color;
        this.size = 20;

    };

    handleKeyDown(key: string) {
        if (key === "ArrowUp" || key === "w") this.keys.up = true;
        if (key === "ArrowLeft" || key === "a") this.keys.left = true;
        if (key === "ArrowDown" || key === "s") this.keys.down = true;
        if (key === "ArrowRight" || key === "d") this.keys.right = true;
    }

    handleKeyUp(key: string) {
        if (key === "ArrowUp" || key === "w") this.keys.up = false;
        if (key === "ArrowLeft" || key === "a") this.keys.left = false;
        if (key === "ArrowDown" || key === "s") this.keys.down = false;
        if (key === "ArrowRight" || key === "d") this.keys.right = false;
    }

    public move() {
        if (this.keys.up) this.y -= this.moveSpeed
        if (this.keys.down) this.y += this.moveSpeed
        if (this.keys.left) this.x -= this.moveSpeed
        if (this.keys.right) this.x += this.moveSpeed
        console.log(this.x, this.y)
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
        // Save the entire canvas state before making any changes
        ctx.save();

        // Update the dash offset for animation
        this.dashOffset -= 0.3; // Speed of animation
        if (this.dashOffset < -8) this.dashOffset = 0; // Reset when complete cycle

        // Set up the dashed line pattern
        ctx.setLineDash([5, 3]); // Length of dash and gap
        ctx.lineDashOffset = this.dashOffset;

        // Start a new path for the circle
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 1.5, 0, Math.PI * 2);

        // Set fill color with transparency
        let domainColor = this.color.split(')');
        domainColor[0] = domainColor[0] + ',0.1'; // Fix the alpha value format
        ctx.fillStyle = domainColor[0] + ')';

        // Set stroke color
        ctx.strokeStyle = "gray";

        // Complete the path and render it
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Restore the canvas state to what it was before this method
        ctx.restore();
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
