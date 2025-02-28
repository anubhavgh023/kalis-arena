import { Game } from "./game";
import WORLD_VIEW from "../../shared_config.json"

const canvas = document.querySelector(".game") as HTMLCanvasElement;
canvas.width = WORLD_VIEW.canvas.width;
canvas.height = WORLD_VIEW.canvas.height;

const game = new Game(canvas);
game.run();





