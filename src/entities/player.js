export class Player {
  constructor(spawn) {
    this.id = "local-player";
    this.name = "YOU";
    this.x = spawn.x;
    this.y = spawn.y;
    this.radius = 15;
    this.speed = 235;
    this.angle = -Math.PI / 2;
    this.facing = 1;
    this.moving = false;
    this.skin = "";
    this.skinPreset = "baegeum-hood";
  }

  setPosition(point) {
    this.x = point.x;
    this.y = point.y;
  }
}
