export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomHSL(): string {
    return `hsl(${random(180, 360)}, ${random(50, 90)}%, ${random(40, 70)}%)`;
}

