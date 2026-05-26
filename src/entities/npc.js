import { angleTo, dist } from "../core/math.js";

const names = ["강대리", "민수", "수진", "철호", "윤서", "도현", "지민", "현우", "하린", "태오"];

export class Npc {
  constructor(index, spawn, navGraph) {
    this.id = `npc-${index + 1}`;
    this.name = names[index % names.length];
    this.x = spawn.x;
    this.y = spawn.y;
    this.radius = 12;
    this.speed = 90 + (index % 4) * 10;
    this.angle = 0;
    this.facing = 1;
    this.moving = false;
    this.skin = "";
    this.skinPreset = "robot";
    this.wait = Math.random() * 1.5;
    this.path = [];
    this.pathIndex = 0;
    this.navGraph = navGraph;
    this.pickNewDestination();
  }

  update(dt, collision) {
    if (this.wait > 0) {
      this.wait -= dt;
      this.moving = false;
      return;
    }
    const target = this.path[this.pathIndex];
    if (!target) {
      this.moving = false;
      return this.pickNewDestination();
    }
    const distance = dist(this.x, this.y, target.x, target.y);
    if (distance < 20) {
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length) this.wait = 0.8 + Math.random() * 2.2;
      this.moving = false;
      return;
    }
    const heading = angleTo(this.x, this.y, target.x, target.y);
    this.angle = heading;
    const step = { x: Math.cos(heading) * this.speed * dt, y: Math.sin(heading) * this.speed * dt };
    this.facing = step.x < -0.01 ? -1 : 1;
    this.moving = true;
    const next = collision.moveCircle(this, step.x, step.y);
    this.x = next.x;
    this.y = next.y;
  }

  pickNewDestination() {
    const start = { x: this.x, y: this.y };
    const goal = this.navGraph.randomNode();
    this.path = this.navGraph.pathBetween(start, goal);
    this.pathIndex = 0;
  }
}
