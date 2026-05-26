import { effectiveCollision, objectBounds } from "./world-object-presets.js";

export function validateObjectPlacement(map, item) {
  const bounds = objectBounds(item);
  if (!insideMap(map, bounds)) return fail("map_bounds", "맵 밖에는 배치할 수 없습니다.");
  if (touchesProtectedZone(map, bounds)) return fail("protected_zone", "입구, 스폰, 거점 영역에는 배치할 수 없습니다.");
  if (touchesObstacle(map, bounds)) return fail("obstacle", "건물이나 벽과 겹칩니다.");
  if (touchesObjectCollision(map, item, bounds)) return fail("collision", "다른 충돌 오브젝트와 겹칩니다.");
  if (touchesRoad(map, bounds)) return fail("road", "도로 위에는 배치할 수 없습니다.");
  return { valid: true, code: "ok", reason: "배치 가능" };
}

function insideMap(map, bounds) {
  return bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.w <= map.width && bounds.y + bounds.h <= map.height;
}

function touchesObstacle(map, bounds) {
  return (map.obstacles || []).some((item) => !item.destroyed && rectsOverlap(bounds, item));
}

function touchesObjectCollision(map, item, bounds) {
  return (map.scenery || []).some((other) => {
    if (!other || other.id === item.id || other.id?.startsWith("preview-")) return false;
    if (!effectiveCollision(other)) return false;
    return rectsOverlap(bounds, objectBounds(other));
  });
}

function touchesRoad(map, bounds) {
  const center = rectCenter(bounds);
  const radius = Math.hypot(bounds.w, bounds.h) * 0.5;
  const clearance = (map.roadWidth || 120) * 0.5 + radius;
  for (const road of map.roads || []) {
    for (let index = 0; index < road.length - 1; index += 1) {
      if (segmentDistance(center, road[index], road[index + 1]) <= clearance) return true;
    }
  }
  return false;
}

function touchesProtectedZone(map, bounds) {
  return protectedCircles(map).some((circle) => circleTouchesRect(circle, bounds));
}

function protectedCircles(map) {
  const circles = [];
  for (const zone of map.safeZones || []) circles.push({ x: zone.x, y: zone.y, radius: (zone.radius || 0) + 60 });
  for (const point of Object.values(map.baseExitPoints || {})) circles.push({ x: point.x, y: point.y, radius: (point.radius || 80) + 60 });
  for (const point of flatPoints(map.spawns)) circles.push({ x: point.x, y: point.y, radius: 110 });
  for (const point of map.capturePoints || []) circles.push({ x: point.x, y: point.y, radius: 120 });
  return circles.filter((circle) => Number.isFinite(circle.x) && Number.isFinite(circle.y));
}

function flatPoints(value, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => flatPoints(item, output));
  } else if (value && typeof value === "object") {
    if (Number.isFinite(value.x) && Number.isFinite(value.y)) output.push(value);
    else Object.values(value).forEach((item) => flatPoints(item, output));
  }
  return output;
}

function circleTouchesRect(circle, rect) {
  const x = clamp(circle.x, rect.x, rect.x + rect.w);
  const y = clamp(circle.y, rect.y, rect.y + rect.h);
  return Math.hypot(circle.x - x, circle.y - y) <= circle.radius;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectCenter(rect) {
  return { x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.5 };
}

function segmentDistance(p, a, b) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len = vx * vx + vy * vy || 1;
  const t = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / len, 0, 1);
  return Math.hypot(p.x - (a.x + vx * t), p.y - (a.y + vy * t));
}

function fail(code, reason) {
  return { valid: false, code, reason };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
