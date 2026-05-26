import { allMapConfigs } from "../data/map-registry.js";
import { compactBaegeumMapLayout } from "../data/baegeum-city-compact-layout.js";
import { applyWorldEditorDraft, clearWorldEditorDraft, createWorldEditorDraft, DEFAULT_WORLD_EDITOR_MAP_ID, readWorldEditorDraft, writeWorldEditorDraft } from "../data/world-editor-draft.js";
import { initHistory, isHistoryDirty, markHistorySaved } from "./baegeum-world-editor-history.js";
import { clone } from "./baegeum-world-editor-utils.js";

export function createEditorMapState(baseMaps = {}) {
  const mapOptions = allMapConfigs().map((config) => ({
    ...config,
    available: Boolean(baseMaps[config.mapId])
  }));
  return {
    activeMapId: availableMapId(mapOptions),
    baseMaps,
    mapOptions
  };
}

export function activeEditorBaseMap(state) {
  return state.baseMaps?.[state.activeMapId] || null;
}

export function activeEditorMapOption(state) {
  return state.mapOptions.find((map) => map.mapId === state.activeMapId) || null;
}

export function loadEditorMapDraft(state) {
  const savedDraft = readWorldEditorDraft({ mapId: state.activeMapId });
  state.originalMap = compactEditorMap(clone(activeEditorBaseMap(state)), state.activeMapId);
  state.map = compactEditorMap(applyWorldEditorDraft(clone(state.originalMap), { mapId: state.activeMapId }), state.activeMapId);
  state.editorRevision = Number(savedDraft?.editorRevision) || 0;
  initHistory(state);
}

export function switchEditorMapState(state, mapId) {
  const next = selectEditorMap(state, mapId);
  if (!next) return null;
  clearEditorMapTransientState(state);
  loadEditorMapDraft(state);
  return next;
}

export function editorMapSwitchBlock(state, mapId) {
  const next = state.mapOptions.find((map) => map.mapId === mapId);
  if (!next?.available) return { blocked: true, reason: "unavailable", target: next || null };
  if (next.mapId !== state.activeMapId && isHistoryDirty(state)) {
    return { blocked: true, reason: "dirty", target: next };
  }
  return { blocked: false, reason: "", target: next };
}

export function saveEditorMapDraft(state) {
  if (isHistoryDirty(state)) state.editorRevision += 1;
  const draft = createWorldEditorDraft(state.map, { editorRevision: state.editorRevision });
  writeWorldEditorDraft(draft, { mapId: state.activeMapId });
  markHistorySaved(state);
  return activeEditorMapOption(state);
}

export function resetEditorMapDraft(state) {
  clearWorldEditorDraft({ mapId: state.activeMapId });
  clearEditorMapTransientState(state);
  loadEditorMapDraft(state);
}

export function editorMapDraftJson(state) {
  return JSON.stringify(createWorldEditorDraft(state.map, { editorRevision: state.editorRevision }), null, 2);
}

export function selectEditorMap(state, mapId) {
  const next = state.mapOptions.find((map) => map.mapId === mapId);
  if (!next?.available) return null;
  state.activeMapId = next.mapId;
  return next;
}

export function initEditorMapSelector(select, state, onChange) {
  select.innerHTML = "";
  for (const map of state.mapOptions) select.appendChild(mapOptionElement(map));
  select.addEventListener("change", () => onChange(select.value));
}

export function syncEditorMapControls(ui, state) {
  const active = activeEditorMapOption(state);
  ui.mapSelect.value = state.activeMapId;
  ui.mapDraftKey.textContent = active ? `${active.mapId} · ${active.draftKey}` : "-";
}

function mapOptionElement(map) {
  const option = document.createElement("option");
  option.value = map.mapId;
  option.disabled = !map.available;
  option.textContent = map.available ? map.displayName : `${map.displayName} (준비 전)`;
  return option;
}

function clearEditorMapTransientState(state) {
  state.selected = null;
  state.hover = null;
  state.drag = null;
  state.buildGhost = null;
  state.billboardAdPaletteOpen = false;
}

function availableMapId(mapOptions) {
  return mapOptions.find((map) => map.mapId === DEFAULT_WORLD_EDITOR_MAP_ID && map.available)?.mapId
    || mapOptions.find((map) => map.available)?.mapId
    || DEFAULT_WORLD_EDITOR_MAP_ID;
}

function compactEditorMap(map, mapId) {
  return mapId === DEFAULT_WORLD_EDITOR_MAP_ID ? compactBaegeumMapLayout(map) : map;
}
