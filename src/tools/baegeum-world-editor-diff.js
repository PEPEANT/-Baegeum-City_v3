export function describeDraftChanges(savedDraft, currentDraft) {
  if (!savedDraft || !currentDraft) return ["비교 기준 없음"];
  const objectChanges = compareObjects(savedDraft, currentDraft);
  const roadChanges = compareRoads(savedDraft, currentDraft);
  const mapChanges = compareMapBasics(savedDraft, currentDraft);
  const changes = [...objectChanges, ...roadChanges, ...mapChanges];
  return changes.length ? changes.slice(0, 4) : ["변경 없음"];
}

function compareObjects(savedDraft, currentDraft) {
  const saved = objectMap(savedDraft);
  const current = objectMap(currentDraft);
  const added = [...current.keys()].filter((id) => !saved.has(id));
  const removed = [...saved.keys()].filter((id) => !current.has(id));
  const changed = [...current.keys()].filter((id) => saved.has(id) && current.get(id) !== saved.get(id));
  return compact([
    added.length && `오브젝트 추가 ${added.length}`,
    removed.length && `오브젝트 삭제 ${removed.length}`,
    changed.length && `오브젝트 수정 ${changed.length}`
  ]);
}

function compareRoads(savedDraft, currentDraft) {
  const savedRoads = JSON.stringify(savedDraft.roads || []);
  const currentRoads = JSON.stringify(currentDraft.roads || []);
  if (savedRoads === currentRoads) return [];
  const savedPoints = pointCount(savedDraft.roads);
  const currentPoints = pointCount(currentDraft.roads);
  const delta = currentPoints - savedPoints;
  return [delta ? `도로점 변경 ${formatDelta(delta)}` : "도로 좌표 수정"];
}

function compareMapBasics(savedDraft, currentDraft) {
  const changes = [];
  for (const key of ["width", "height", "roadWidth"]) {
    if (savedDraft[key] !== currentDraft[key]) changes.push(`${key} ${savedDraft[key]} -> ${currentDraft[key]}`);
  }
  return changes;
}

function objectMap(draft) {
  const map = new Map();
  for (const item of [...(draft.obstacles || []), ...(draft.scenery || [])]) {
    if (!item?.id) continue;
    map.set(item.id, objectSignature(item));
  }
  return map;
}

function objectSignature(item) {
  return JSON.stringify({
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    rotation: item.rotation,
    type: item.type,
    kind: item.kind,
    presetId: item.presetId,
    adId: item.adId,
    collision: item.collision,
    destructibleSpec: item.destructibleSpec
  });
}

function pointCount(roads = []) {
  return roads.reduce((sum, road) => sum + (Array.isArray(road) ? road.length : 0), 0);
}

function formatDelta(value) {
  return value > 0 ? `+${value}` : String(value);
}

function compact(values) {
  return values.filter(Boolean);
}
