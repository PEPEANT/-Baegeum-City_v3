import { clamp, lerp } from "../core/math.js";

export class Camera {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.world = world;
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.zoom = 1;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.contextScale = dpr;
  }

  follow(target, dt) {
    const desiredX = target.x - this.width / 2;
    const desiredY = target.y - this.height / 2;
    const blend = 1 - Math.pow(0.001, Math.min(0.08, dt));
    this.x = clamp(lerp(this.x, desiredX, blend), 0, Math.max(0, this.world.width - this.width));
    this.y = clamp(lerp(this.y, desiredY, blend), 0, Math.max(0, this.world.height - this.height));
  }

  apply(ctx) {
    ctx.setTransform(this.contextScale, 0, 0, this.contextScale, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }
}
