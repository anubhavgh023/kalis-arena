import { Game } from "./game";

const canvas = document.querySelector(".game") as HTMLCanvasElement;
canvas.width = 1080;
canvas.height = 720;

const game = new Game(canvas);
game.run();





