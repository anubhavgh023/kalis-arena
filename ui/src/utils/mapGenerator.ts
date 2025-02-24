type Elements = "ice" | "sand"

interface Hex {
    x: number;
    y: number;
    type?: Elements;
    exists: boolean;  // Whether this hex is part of the map or a gap
    isEdge: boolean; // Whether this hex is on the edge of a platform
}

export class RandomMapGenerator {
    private hexSize: number;
    private hexGrid: Map<string, Hex>;

    constructor(hexSize: number = 50) {
        this.hexSize = hexSize;
        this.hexGrid = new Map();
    }

    private getHexKey(x: number, y: number): string {
        return `${x},${y}`;
    }

    generateMap(width: number, height: number): Map<string, Hex> {
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
        return this.hexGrid;
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
}

const hexMap = new RandomMapGenerator();
const map = hexMap.generateMap(1080, 720);
const jsonData = JSON.stringify(Object.fromEntries(map.entries()), null, 2);
console.log(jsonData);
