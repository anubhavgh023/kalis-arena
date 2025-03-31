export enum Direction {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

export class Input {
    public keys: Array<string>;
    constructor() {
        this.keys = [];

        window.addEventListener("keydown", e => {
            let key = e.key;
            if (key === "ArrowLeft" || key === "a") this.handleKeyDown(Direction.LEFT);
            if (key === "ArrowRight" || key === "d") this.handleKeyDown(Direction.RIGHT);
            if (key === "ArrowUp" || key === "w") this.handleKeyDown(Direction.UP);
            if (key === "ArrowDown" || key === "s") this.handleKeyDown(Direction.DOWN);
        });

        window.addEventListener("keyup", e => {
            let key = e.key;
            if (key === "ArrowLeft" || key === "a") this.handleKeyUp(Direction.LEFT);
            if (key === "ArrowRight" || key === "d") this.handleKeyUp(Direction.RIGHT);
            if (key === "ArrowUp" || key === "w") this.handleKeyUp(Direction.UP);
            if (key === "ArrowDown" || key === "s") this.handleKeyUp(Direction.DOWN);
        });
    }

    handleKeyDown(key: string) {
        if (this.keys.indexOf(key) === -1) {
            this.keys.unshift(key);
        }
    }

    handleKeyUp(key: string) {
        const index = this.keys.indexOf(key);
        if (index > -1) {
            this.keys.splice(index, 1);
        }
    }

    lastKey() {
        return this.keys[0]
    }
}
