import { Game } from "./core/game";
import { GAME_WIDTH, GAME_HEIGHT } from "./core/config";

const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
ctx.imageSmoothingEnabled = false;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

new Game(ctx);
