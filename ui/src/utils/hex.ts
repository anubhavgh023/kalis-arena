// Hexagon
const a = 2 * Math.PI / 6;
const r = 50;

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.strokeStyle = `rgb(105 105 105 /20%)`

    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
    }
    ctx.closePath()
    ctx.stroke();
}

export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    for (let y = r; y + r * Math.sin(a) < height; y += r * Math.sin(a)) {
        for (let x = r, j = 0; x + r * (1 + Math.cos(a)) < width; x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)) {
            drawHexagon(ctx, x, y);
        }
    }
}
//

