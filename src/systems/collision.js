import { circleRectCollision, clamp } from "../core/math.js";

export class CollisionWorld {
  constructor({ width, height, obstacles = [] }) {
    this.width = width;
    this.height = height;
    this.obstacles = obstacles;
  }

  moveCircle(entity, dx, dy) {
    let x = entity.x;
    let y = entity.y;
    x = this.resolveAxis(entity, x + dx, y, "x");
    y = this.resolveAxis(entity, x, y + dy, "y");
    return {
      x: clamp(x, entity.radius, this.width - entity.radius),
      y: clamp(y, entity.radius, this.height - entity.radius)
    };
  }

  resolveAxis(entity, nextX, nextY, axis) {
    const blocked = this.obstacles.some((rect) => circleRectCollision(nextX, nextY, entity.radius, rect));
    return blocked ? entity[axis] : (axis === "x" ? nextX : nextY);
  }

  nearestDoor(player, buildings, maxDistance = 78) {
    let nearest = null;
    for (const building of buildings) {
      for (const door of building.doors || []) {
        const distance = Math.hypot(player.x - door.x, player.y - door.y);
        if (distance <= maxDistance && (!nearest || distance < nearest.distance)) {
          nearest = { building, door, distance };
        }
      }
    }
    return nearest;
  }
}
