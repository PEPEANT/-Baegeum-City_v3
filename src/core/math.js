export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function dist(a, b, c, d) {
  const ax = typeof a === "object" ? a.x : a;
  const ay = typeof a === "object" ? a.y : b;
  const bx = typeof c === "object" ? c.x : c;
  const by = typeof c === "object" ? c.y : d;
  return Math.hypot((bx || 0) - (ax || 0), (by || 0) - (ay || 0));
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function normalizeAngle(angle) {
  const twoPi = Math.PI * 2;
  let next = angle % twoPi;
  if (next > Math.PI) next -= twoPi;
  if (next < -Math.PI) next += twoPi;
  return next;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function circleRectCollision(x, y, radius, rect) {
  const closestX = clamp(x, rect.x, rect.x + rect.w);
  const closestY = clamp(y, rect.y, rect.y + rect.h);
  return Math.hypot(x - closestX, y - closestY) <= radius;
}

export function lineIntersectsRect(ax, ay, bx, by, rect) {
  if (pointInRect(ax, ay, rect) || pointInRect(bx, by, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y]
  ];
  return edges.some(([cx, cy, dx, dy]) => segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy));
}

function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const det = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(det) < 0.00001) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / det;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / det;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
