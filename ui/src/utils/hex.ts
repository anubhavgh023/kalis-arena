type Elements = "ice" | "sand"

interface Hex {
    x: number;
    y: number;
    type?: Elements;
    exists: boolean;  // Whether this hex is part of the map or a gap
    isEdge: boolean; // Whether this hex is on the edge of a platform
}

export class MapGenerator {
    private hexSize: number;
    private hexGrid: Map<string, Hex>;

    constructor(hexSize: number = 50) {
        this.hexSize = hexSize;
        this.hexGrid = new Map();
    }

    private getHexKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    generateMap(width: number, height: number) {
        const a = 2 * Math.PI / 6;
        const r = this.hexSize;

        // First pass: generate base hexes with random gaps
        for (let y = r; y + r * Math.sin(a) < height; y += r * Math.sin(a)) {
            for (let x = r, j = 0; x + r * (1 + Math.cos(a)) < width; x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)) {
                // Random chance to create a gap
                const exists = Math.random() > 0.3;  // 30% chance of gap

                this.hexGrid.set(this.getHexKey(x, y), {
                    x,
                    y,
                    exists,
                    isEdge: false
                });
            }
        }

        // Second pass: mark edge hexes
        this.hexGrid.forEach((hex) => {
            if (hex.exists) {
                // Check surrounding hexes
                const neighbors = this.getNeighborKeys(hex.x, hex.y);
                const hasGapNeighbor = neighbors.some(neighborKey => {
                    const neighbor = this.hexGrid.get(neighborKey);
                    return !neighbor || !neighbor.exists;
                });
                hex.isEdge = hasGapNeighbor;

                const elementChance = Math.random() > 0.9;
                if (elementChance) {
                    hex.type = Math.random() > 0.5 ? "ice" : "sand";
                }
            }
        });
    }

    private getNeighborKeys(x: number, y: number): string[] {
        const a = 2 * Math.PI / 6;
        const r = this.hexSize;

        // Get the 6 surrounding hex coordinates
        return [
            this.getHexKey(x + r * Math.cos(a * 0), y + r * Math.sin(a * 0)),
            this.getHexKey(x + r * Math.cos(a * 1), y + r * Math.sin(a * 1)),
            this.getHexKey(x + r * Math.cos(a * 2), y + r * Math.sin(a * 2)),
            this.getHexKey(x + r * Math.cos(a * 3), y + r * Math.sin(a * 3)),
            this.getHexKey(x + r * Math.cos(a * 4), y + r * Math.sin(a * 4)),
            this.getHexKey(x + r * Math.cos(a * 5), y + r * Math.sin(a * 5))
        ];
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
