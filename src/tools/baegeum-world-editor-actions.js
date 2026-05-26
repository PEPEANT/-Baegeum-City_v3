import { isBillboard } from "../data/billboard-ads.js";
import { createWorldObjectId } from "../data/world-map-contract.js";
import { buildingShellSizeLabel, cycleBuildingShellSize, isBuildingShell } from "./baegeum-world-editor-building-shells.js";
import { isSelectionLayerLocked, isSelectionLocked, toggleSelectionLayerLock, toggleSelectionLock } from "./baegeum-world-editor-selection-lock.js";
import { clone, labelFor, selectedItem } from "./baegeum-world-editor-utils.js";

export function initSelectionActions(ui, state, onChange) {
  ui.rotateSelection.addEventListener("click", () => rotateSelected(state, onChange));
  ui.lockSelection.addEventListener("click", () => lockSelected(state, onChange));
  ui.lockLayerSelection.addEventListener("click", () => lockSelectedLayer(state, onChange));
  ui.resetSelection.addEventListener("click", () => resetSelected(state, onChange));
  ui.duplicateSelection.addEventListener("click", () => duplicateSelected(state, onChange));
  ui.deleteSelection.addEventListener("click", () => deleteSelected(state, onChange));
  ui.resizeBuildingShell.addEventListener("click", () => resizeBuildingShell(state, onChange));
}

export function syncSelectionActions(ui, state) {
  const item = selectedItem(state);
  const actionTarget = state.selected && ["scenery", "obstacle"].includes(state.selected.type);
  ui.selectionActions.hidden = !item || !actionTarget || state.mode === "build";
  ui.selectionActionLabel.textContent = actionTarget ? labelFor(state, state.selected) : "선택 없음";
  ui.rotateSelection.hidden = state.selected?.type !== "scenery";
  ui.rotateSelection.disabled = !item;
  ui.lockSelection.disabled = !item || !actionTarget;
  ui.lockSelection.textContent = isSelectionLocked(state) ? "잠금해제" : "좌표잠금";
  ui.lockSelection.classList.toggle("active", isSelectionLocked(state));
  ui.lockLayerSelection.disabled = !item || !actionTarget;
  ui.lockLayerSelection.textContent = isSelectionLayerLocked(state) ? "레이어해제" : "레이어잠금";
  ui.lockLayerSelection.classList.toggle("active", isSelectionLayerLocked(state));
  ui.resetSelection.disabled = !item || !findOriginalItem(state);
  ui.duplicateSelection.disabled = !item;
  ui.deleteSelection.disabled = !item;
  ui.openBillboardAd.hidden = !isBillboard(item);
  ui.resizeBuildingShell.hidden = !isBuildingShell(item);
  ui.resizeBuildingShell.disabled = !isBuildingShell(item);
  ui.resizeBuildingShell.textContent = isBuildingShell(item) ? `크기 ${buildingShellSizeLabel(item)}` : "크기";
}

function lockSelected(state, onChange) {
  const locked = toggleSelectionLock(state);
  onChange(locked ? "선택 항목 좌표 잠금." : "선택 항목 좌표 잠금 해제.");
}

function lockSelectedLayer(state, onChange) {
  const locked = toggleSelectionLayerLock(state);
  const layerName = state.selected?.type === "obstacle" ? "건물" : "장식물";
  onChange(locked ? `${layerName} 레이어 잠금.` : `${layerName} 레이어 잠금 해제.`);
}

function rotateSelected(state, onChange) {
  const item = selectedItem(state);
  if (!item || state.selected?.type !== "scenery") return;
  item.angle = Math.round(((item.angle || 0) + Math.PI / 12) * 100) / 100;
  onChange("선택 항목 회전됨.");
}

function resetSelected(state, onChange) {
  if (!state.selected || !["scenery", "obstacle"].includes(state.selected.type)) return;
  const original = findOriginalItem(state);
  if (!original) return onChange("원본 위치를 찾을 수 없습니다.");
  const list = state.selected.type === "scenery" ? state.map.scenery : state.map.obstacles;
  const current = list[state.selected.index];
  list[state.selected.index] = { ...clone(original), id: original.id || current?.id };
  onChange("선택 항목 원위치 복귀됨.");
}

function duplicateSelected(state, onChange) {
  if (!state.selected || !["scenery", "obstacle"].includes(state.selected.type)) return;
  const list = state.selected.type === "scenery" ? state.map.scenery : state.map.obstacles;
  const item = clone(list[state.selected.index]);
  item.id = createWorldObjectId(item, state.map);
  item.x = Math.min(state.map.width - (item.w || 0), Math.max(0, (item.x || 0) + 40));
  item.y = Math.min(state.map.height - (item.h || 0), Math.max(0, (item.y || 0) + 40));
  list.push(item);
  state.selected = { type: state.selected.type, index: list.length - 1 };
  onChange("선택 항목 복제됨.");
}

function deleteSelected(state, onChange) {
  if (!state.selected || !["scenery", "obstacle"].includes(state.selected.type)) return;
  const list = state.selected.type === "scenery" ? state.map.scenery : state.map.obstacles;
  list.splice(state.selected.index, 1);
  state.selected = null;
  state.billboardAdPaletteOpen = false;
  onChange("선택 항목 삭제됨.");
}

function resizeBuildingShell(state, onChange) {
  const item = selectedItem(state);
  const result = cycleBuildingShellSize(item);
  if (!result) return;
  onChange(`건물 크기 ${result.label}.`);
}

function findOriginalItem(state) {
  if (!state.selected || !state.originalMap) return null;
  const current = selectedItem(state);
  const list = state.selected.type === "scenery" ? state.originalMap.scenery : state.originalMap.obstacles;
  if (!Array.isArray(list)) return null;
  if (current?.id) {
    const byId = list.find((item) => item.id === current.id);
    if (byId) return byId;
  }
  return list[state.selected.index] || null;
}
