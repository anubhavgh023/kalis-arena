import mapData from "./map.json"

type Elements = "ice" | "sand"

interface Hex {
    x: number;
    y: number;
    type?: Elements;
    exists: boolean;  // Whether this hex is part of the map or a gap
    isEdge: boolean; // Whether this hex is on the edge of a platform
}

export class MapRenderer {
    private hexSize: number;
    private hexGrid: Map<string, any>;

    constructor() {
        this.hexSize = 50;
        this.hexGrid = new Map(Object.entries(mapData));
    }


    drawMap(ctx: CanvasRenderingContext2D) {
        this.hexGrid.forEach((hex) => {
            if (hex.exists) {
                this.drawHex(ctx, hex);
            }
        });
    }

    private drawHex(ctx: CanvasRenderingContext2D, hex: Hex) {
        const a = 2 * Math.PI / 6;
        const r = this.hexSize;
        const { x, y, isEdge, type } = hex;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
        }
        ctx.closePath();

        // Regular platform
        if (!isEdge) {
            ctx.fillStyle = 'hsla(210, 5%, 29%, 0.8)'; // Dark gray with 80% opacity
        }
        else if (type) {
            switch (type) {
                case "ice":
                    ctx.fillStyle = 'hsla(195,53%,80%,0.2)'; // Light blue
                    break;
                case "sand":
                    ctx.fillStyle = 'hsla(45, 35%, 63%, 0.2)'; // Sandy color
                    break
            }

        }
        // Edge/cliff hex
        else {
            ctx.fillStyle = 'hsla(210, 5%, 24%, 0.6)'; // Even darker gray with 80% opacity
        }

        ctx.fill();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
