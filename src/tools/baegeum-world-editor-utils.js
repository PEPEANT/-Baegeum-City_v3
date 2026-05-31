import { isMoveLocked, isSelectionLayerLocked, isSelectionLocked } from "./baegeum-world-editor-selection-lock.js";

export function findHit(state, point) {
  if (state.mode === "scenery") return findScenery(state, point);
  if (state.mode === "obstacle") return findObstacle(state, point);
  if (state.mode === "road") return findRoad(state, point);
  return null;
}

export function captureOriginals(state, hit) {
  if (hit.type === "road") {
    return new Map(state.map.roads[hit.roadIndex].map((point, index) => [`road:${hit.roadIndex}:${index}`, { ...point }]));
  }
  if (hit.type === "road-point") {
    return new Map([[`road:${hit.roadIndex}:${hit.pointIndex}`, { ...state.map.roads[hit.roadIndex][hit.pointIndex] }]]);
  }
  if (hit.type === "obstacle") return new Map([[`obstacle:${hit.index}`, { ...state.map.obstacles[hit.index] }]]);
  return new Map([[`scenery:${hit.index}`, { ...state.map.scenery[hit.index] }]]);
}

export function moveOriginal(state, key, original, dx, dy) {
  if (isMoveLocked(state, key, original)) return;
  if (key.startsWith("scenery:")) return moveScenery(state, Number(key.split(":")[1]), original, dx, dy);
  if (key.startsWith("obstacle:")) return moveObstacle(state, Number(key.split(":")[1]), original, dx, dy);
  if (key.startsWith("road:")) return moveRoadPoint(state, key, original, dx, dy);
}

export function selectedItem(state) {
  const hit = state.selected;
  if (!hit) return null;
  if (hit.type === "scenery") return state.map.scenery[hit.index];
  if (hit.type === "obstacle") return state.map.obstacles[hit.index];
  if (hit.type === "road-point") return state.map.roads[hit.roadIndex][hit.pointIndex];
  return state.map.roads[hit.roadIndex][0];
}

export function drawEditorOverlay(ctx, state) {
  if (!state.showHandles) return;
  drawHit(ctx, state, state.hover, "rgba(255,255,255,0.45)");
  drawHit(ctx, state, state.selected, "rgba(107,188,255,0.95)");
  if (state.mode === "road") drawRoadHandles(ctx, state);
}

export function labelFor(state, hit) {
  if (!hit) return "선택 없음";
  if (hit.type === "scenery") return state.map.scenery[hit.index]?.id || `장식물 ${hit.index + 1}`;
  if (hit.type === "obstacle") return obstacleLabel(state.map.obstacles[hit.index], hit.index);
  if (hit.type === "road-point") return `도로 ${hit.roadIndex + 1} 점 ${hit.pointIndex + 1}`;
  return `도로 ${hit.roadIndex + 1}`;
}

export function metaFor(state, hit) {
  const locked = `${isSelectionLocked(state) ? " / 좌표 잠금" : ""}${isSelectionLayerLocked(state) ? " / 레이어 잠금" : ""}`;
  if (hit.type === "scenery") {
    const item = state.map.scenery[hit.index];
    return `${item.type || item.kind || "scenery"} / ${item.variant || "default"}${locked}`;
  }
  if (hit.type === "road") return "도로 몸통을 드래그하면 도로 전체가 이동합니다.";
  return `드래그하거나 좌표를 입력해 이동합니다.${locked}`;
}

export function syncSelectionInputs(ui, state) {
  const item = selectedItem(state);
  ui.title.textContent = state.selected ? labelFor(state, state.selected) : "No selection";
  ui.meta.textContent = state.selected ? metaFor(state, state.selected) : "Pick scenery, buildings, or road handles.";
  ui.x.value = item ? Math.round(item.x) : "";
  ui.y.value = item ? Math.round(item.y) : "";
  ui.x.disabled = !item || isSelectionLocked(state) || isSelectionLayerLocked(state);
  ui.y.disabled = !item || isSelectionLocked(state) || isSelectionLayerLocked(state);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findScenery(state, point) {
  const items = state.map.scenery || [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (hitItem(items[index], point)) return { type: "scenery", index };
  }
  return null;
}

function obstacleLabel(item, index) {
  if (item?.objectKind === "building_shell" && item.shellName) return item.shellName;
  return `${item?.kind || "건물"} ${index + 1}`;
}

function findObstacle(state, point) {
  const items = state.map.obstacles || [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (point.x >= item.x && point.x <= item.x + item.w && point.y >= item.y && point.y <= item.y + item.h) return { type: "obstacle", index };
  }
  return null;
}

function findRoad(state, point) {
  for (let roadIndex = 0; roadIndex < state.map.roads.length; roadIndex += 1) {
    const road = state.map.roads[roadIndex];
    for (let pointIndex = 0; pointIndex < road.length; pointIndex += 1) {
      if (distance(point, road[pointIndex]) < 26 / state.camera.zoom) return { type: "road-point", roadIndex, pointIndex };
    }
  }
  let best = null;
  state.map.roads.forEach((road, roadIndex) => {
    for (let index = 0; index < road.length - 1; index += 1) {
      const d = segmentDistance(point, road[index], road[index + 1]);
      if (d <= state.map.roadWidth * 0.55 && (!best || d < best.d)) best = { type: "road", roadIndex, d };
    }
  });
  return best;
}

function hitItem(item, point) {
  if (item.shape === "circle" || item.r) return distance(point, item) <= (item.r || Math.max(item.w || 20, item.h || 20) * 0.5);
  const center = { x: item.x + (item.w || 0) * 0.5, y: item.y + (item.h || 0) * 0.5 };
  const a = -(item.angle || 0);
  const x = Math.cos(a) * (point.x - center.x) - Math.sin(a) * (point.y - center.y);
  const y = Math.sin(a) * (point.x - center.x) + Math.cos(a) * (point.y - center.y);
  return Math.abs(x) <= (item.w || 24) * 0.5 && Math.abs(y) <= (item.h || 24) * 0.5;
}

function moveScenery(state, index, original, dx, dy) {
  const item = state.map.scenery[index];
  if (!item) return;
  item.x = clamp(Math.round(original.x + dx), 0, state.map.width);
  item.y = clamp(Math.round(original.y + dy), 0, state.map.height);
}

function moveObstacle(state, index, original, dx, dy) {
  const item = state.map.obstacles[index];
  if (!item) return;
  item.x = clamp(Math.round(original.x + dx), 0, Math.max(0, state.map.width - item.w));
  item.y = clamp(Math.round(original.y + dy), 0, Math.max(0, state.map.height - item.h));
}

function moveRoadPoint(state, key, original, dx, dy) {
  const [, roadIndex, pointIndex] = key.split(":").map(Number);
  const point = state.map.roads[roadIndex]?.[pointIndex];
  if (!point) return;
  point.x = clamp(Math.round(original.x + dx), 0, state.map.width);
  point.y = clamp(Math.round(original.y + dy), 0, state.map.height);
}

function drawHit(ctx, state, hit, color) {
  if (!hit) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 / state.camera.zoom;
  if (hit.type === "scenery") drawItemBounds(ctx, state.map.scenery[hit.index]);
  else if (hit.type === "obstacle") drawRect(ctx, state.map.obstacles[hit.index]);
  else if (hit.type === "road") strokePath(ctx, state.map.roads[hit.roadIndex]);
  else drawPoint(ctx, state.map.roads[hit.roadIndex][hit.pointIndex], 14 / state.camera.zoom);
  ctx.restore();
}

function drawItemBounds(ctx, item) {
  if (!item) return;
  if (item.shape === "circle" || item.r) {
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.r || 24, 0, Math.PI * 2);
    ctx.stroke();
  } else drawRect(ctx, item);
}

function drawRect(ctx, item) {
  if (!item) return;
  ctx.strokeRect(item.x, item.y, item.w || 24, item.h || 24);
}

function drawRoadHandles(ctx, state) {
  ctx.save();
  ctx.fillStyle = "#d6a64a";
  for (const road of state.map.roads) for (const point of road) drawPoint(ctx, point, 8 / state.camera.zoom, true);
  ctx.restore();
}

function drawPoint(ctx, point, radius, fill = false) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  fill ? ctx.fill() : ctx.stroke();
}

function strokePath(ctx, road) {
  if (!road?.length) return;
  ctx.beginPath();
  ctx.moveTo(road[0].x, road[0].y);
  for (let index = 1; index < road.length; index += 1) ctx.lineTo(road[index].x, road[index].y);
  ctx.stroke();
}

function segmentDistance(p, a, b) {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len = vx * vx + vy * vy || 1;
  const t = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / len, 0, 1);
  return distance(p, { x: a.x + vx * t, y: a.y + vy * t });
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
