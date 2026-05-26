import { effectiveCollision, objectBounds } from "./world-object-presets.js";
import { validateWorldMapDraft } from "./world-map-contract.js";

const MAX_PAIR_ISSUES = 12;

export function createWorldMapValidationReport(map = {}) {
  const issues = [
    ...contractIssues(validateWorldMapDraft(map)),
    ...boundsIssues(map),
    ...collisionOverlapIssues(map),
    ...entranceIssues(map)
  ];
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    ok: errors.length === 0,
    issueCount: issues.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    issues,
    errors,
    warnings
  };
}

function contractIssues(report) {
  const issues = [];
  for (const code of report.errors) issues.push(issue("error", code, contractLabel(code)));
  const summary = report.summary;
  if (summary.duplicateIds.length) issues.push(issue("warning", "duplicate_id", `ID 중복 ${summary.duplicateIds.length}개`));
  if (summary.invalidIds.length) issues.push(issue("warning", "invalid_id", `ID 형식 오류 ${summary.invalidIds.length}개`));
  if (summary.missingIds > 0) issues.push(issue("warning", "missing_id", `ID 누락 ${summary.missingIds}개`));
  return issues;
}

function boundsIssues(map) {
  const issues = [];
  for (const item of collidableItems(map, { includeNonBlocking: true })) {
    if (!insideMap(map, item.bounds)) issues.push(issue("error", "out_of_bounds", `맵 밖 오브젝트: ${item.id}`, item.id));
  }
  for (const point of roadPoints(map)) {
    if (!pointInsideMap(map, point)) issues.push(issue("error", "road_out_of_bounds", `맵 밖 도로점: ${point.id}`, point.id));
  }
  return issues;
}

function collisionOverlapIssues(map) {
  const issues = [];
  const items = collidableItems(map).filter((item) => item.blocks);
  for (let a = 0; a < items.length; a += 1) {
    for (let b = a + 1; b < items.length; b += 1) {
      if (isIntentionalOverlap(items[a], items[b])) continue;
      if (!rectsOverlap(items[a].bounds, items[b].bounds)) continue;
      issues.push(issue("warning", "collision_overlap", `충돌 겹침: ${items[a].id} / ${items[b].id}`, `${items[a].id},${items[b].id}`));
      if (issues.length >= MAX_PAIR_ISSUES) return issues;
    }
  }
  return issues;
}

function entranceIssues(map) {
  const issues = [];
  const blockers = collidableItems(map).filter((item) => item.blocks);
  for (const entrance of entrances(map)) {
    if (!pointInsideMap(map, entrance)) {
      issues.push(issue("error", "entrance_out_of_bounds", `맵 밖 입구: ${entrance.id}`, entrance.id));
      continue;
    }
    const blockedBy = blockers.find((blocker) => blocker.id !== entrance.ownerId && circleTouchesRect(entrance, blocker.bounds));
    if (blockedBy) issues.push(issue("warning", "blocked_entrance", `막힌 입구: ${entrance.id}`, blockedBy.id));
  }
  return issues;
}

function collidableItems(map, options = {}) {
  const items = [];
  for (const [index, item] of (map.obstacles || []).entries()) {
    if (!item || item.destroyed) continue;
    const id = item.id || `obstacle:${index + 1}`;
    items.push({ id, kind: item.kind || "obstacle", layer: "obstacle", bounds: rectBounds(item), blocks: true });
  }
  for (const [index, item] of (map.scenery || []).entries()) {
    if (!item || item.id?.startsWith("preview-")) continue;
    const collision = effectiveCollision(item);
    const blocks = Boolean(collision?.blocksPlayers || collision?.blocksVehicles);
    if (!options.includeNonBlocking && !blocks) continue;
    items.push({ id: item.id || `scenery:${index + 1}`, kind: item.type || "scenery", layer: "scenery", bounds: objectBounds(item), blocks });
  }
  return items.filter((item) => isFiniteRect(item.bounds));
}

function entrances(map) {
  if (Array.isArray(map.buildings) && map.buildings.length) return buildingEntrances(map.buildings);
  return (map.obstacles || [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item?.kind === "building")
    .map(({ item, index }) => ({
      id: `entrance:${item.id || `building:${index + 1}`}:front`,
      ownerId: item.id || `obstacle:${index + 1}`,
      x: item.x + item.w * 0.5,
      y: item.y + item.h + 42,
      radius: 42
    }));
}

function buildingEntrances(buildings) {
  const output = [];
  for (const building of buildings) {
    for (const door of building.doors || []) {
      output.push({ id: door.id || `entrance:${building.id}:front`, ownerId: building.rect?.id || building.id, x: door.x, y: door.y, radius: 42 });
    }
  }
  return output;
}

function roadPoints(map) {
  const output = [];
  for (const [roadIndex, road] of (map.roads || []).entries()) {
    for (const [pointIndex, point] of road.entries()) output.push({ id: `road:${roadIndex + 1}:${pointIndex + 1}`, ...point });
  }
  return output;
}

function issue(severity, code, label, target = null) {
  return { severity, code, label, target };
}

function isIntentionalOverlap(a, b) {
  const pair = new Set([a.kind, b.kind]);
  if (a.kind === "base-wall" && b.kind === "base-wall") return true;
  return pair.size === 1 && pair.has("city-boundary");
}

function contractLabel(code) {
  return ({
    unsupported_schema: "지원하지 않는 맵 스키마",
    future_draft_version: "미래 버전 드래프트",
    missing_map_version: "mapVersion 누락",
    invalid_size: "맵 크기 오류"
  })[code] || code;
}

function rectBounds(item) {
  return { x: item.x, y: item.y, w: item.w || 0, h: item.h || 0 };
}

function insideMap(map, rect) {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= map.width && rect.y + rect.h <= map.height;
}

function pointInsideMap(map, point) {
  return point.x >= 0 && point.y >= 0 && point.x <= map.width && point.y <= map.height;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function circleTouchesRect(circle, rect) {
  const x = clamp(circle.x, rect.x, rect.x + rect.w);
  const y = clamp(circle.y, rect.y, rect.y + rect.h);
  return Math.hypot(circle.x - x, circle.y - y) <= circle.radius;
}

function isFiniteRect(rect) {
  return Number.isFinite(rect.x) && Number.isFinite(rect.y) && Number.isFinite(rect.w) && Number.isFinite(rect.h);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
