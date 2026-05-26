export function toggleSelectionLock(state) {
  const key = selectedLockKey(state);
  if (!key) return false;
  const locks = selectionLocks(state);
  if (locks.has(key)) {
    locks.delete(key);
    return false;
  }
  locks.add(key);
  return true;
}

export function toggleSelectionLayerLock(state) {
  const key = selectedLayerKey(state);
  if (!key) return false;
  const locks = layerLocks(state);
  if (locks.has(key)) {
    locks.delete(key);
    return false;
  }
  locks.add(key);
  return true;
}

export function isSelectionLocked(state) {
  const key = selectedLockKey(state);
  return Boolean(key && selectionLocks(state).has(key));
}

export function isSelectionLayerLocked(state) {
  const key = selectedLayerKey(state);
  return Boolean(key && layerLocks(state).has(key));
}

export function isMoveLocked(state, moveKey, original) {
  const key = moveLockKey(moveKey, original);
  const layerKey = moveLayerKey(moveKey);
  return Boolean(key && selectionLocks(state).has(key) || layerKey && layerLocks(state).has(layerKey));
}

function selectedLockKey(state) {
  const hit = state.selected;
  if (!hit || !["scenery", "obstacle"].includes(hit.type)) return "";
  const list = hit.type === "scenery" ? state.map.scenery : state.map.obstacles;
  return lockKey(hit.type, list?.[hit.index], hit.index);
}

function selectedLayerKey(state) {
  const hit = state.selected;
  return hit && ["scenery", "obstacle"].includes(hit.type) ? hit.type : "";
}

function moveLockKey(moveKey, original) {
  if (moveKey.startsWith("scenery:")) return lockKey("scenery", original, Number(moveKey.split(":")[1]));
  if (moveKey.startsWith("obstacle:")) return lockKey("obstacle", original, Number(moveKey.split(":")[1]));
  return "";
}

function moveLayerKey(moveKey) {
  if (moveKey.startsWith("scenery:")) return "scenery";
  if (moveKey.startsWith("obstacle:")) return "obstacle";
  return "";
}

function lockKey(type, item, index) {
  if (!item) return "";
  return item.id ? `${type}:${item.id}` : `${type}:index:${index}`;
}

function selectionLocks(state) {
  if (!state.selectionLocks) state.selectionLocks = new Set();
  return state.selectionLocks;
}

function layerLocks(state) {
  if (!state.layerLocks) state.layerLocks = new Set();
  return state.layerLocks;
}
