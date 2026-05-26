import { CityGame } from "./scenes/city-scene.js";

const canvas = document.getElementById("game");
const game = new CityGame(canvas);

game.start();
