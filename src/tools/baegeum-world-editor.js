import { diceCityMap } from "../data/dice-city-map.js";
import "../renderers/billboard-ad-renderer.js";
import { captureOriginals, clone, drawEditorOverlay, findHit, labelFor, moveOriginal, selectedItem, syncSelectionInputs } from "./baegeum-world-editor-utils.js";
import { initBillboardAdControls, syncBillboardAdControls } from "./baegeum-world-editor-billboards.js";
import { initSelectionActions, syncSelectionActions } from "./baegeum-world-editor-actions.js";
import { buildStatusLabel, createBuildCategoryOpenState, createSceneryItem, drawBuildGhost, drawObjectRuleOverlay, findBuildPreset, renderBuildPalette, setBuildCategoryOpen, syncBuildControls, validateSceneryPlacement } from "./baegeum-world-editor-build.js";
import { fitEditorCamera, moveCamera, screenToWorld, startPan, syncEditorCamera, zoomEditorCamera } from "./baegeum-world-editor-camera.js";
import { syncContractControls } from "./baegeum-world-editor-contract.js";
import { bindHistoryShortcuts, commitHistory, isHistoryDirty, redoHistory, syncHistoryControls, undoHistory } from "./baegeum-world-editor-history.js";
import { createEditorMapState, editorMapDraftJson, editorMapSwitchBlock, initEditorMapSelector, loadEditorMapDraft, resetEditorMapDraft, saveEditorMapDraft, switchEditorMapState, syncEditorMapControls } from "./baegeum-world-editor-maps.js";
import { drawCityBoundaryObstacles } from "../renderers/city-boundary-renderer.js";

const IronLine = window.IronLine || {};
const TEAM = IronLine.constants?.TEAM || { NEUTRAL: "neutral" };
const GRID = 40;
const $ = (id) => document.getElementById(id);
const state = {
  canvas: document.getElementById("worldEditorCanvas"),
  renderer: null,
  originalMap: null, map: null, activeMapId: null, baseMaps: null, mapOptions: [],
  mode: "scenery",
  selected: null,
  hover: null,
  drag: null,
  history: null,
  editorRevision: 0,
  buildPreset: null,
  buildGhost: null,
  buildListOpen: false,
  buildCategoryOpen: createBuildCategoryOpenState(),
  billboardAdPaletteOpen: false,
  snap: true,
  showHandles: true, showRules: false,
  camera: { x: 0, y: 0, width: 0, height: 0, zoom: 1, viewWidth: 0, viewHeight: 0 }
};
window.BaegeumWorldEditor = {
  debugState: () => clone({ map: state.map, activeMapId: state.activeMapId, selected: state.selected, mode: state.mode, camera: state.camera, dirty: isHistoryDirty(state) })
};
const ui = {
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  mapSelect: $("activeMapSelect"), mapDraftKey: $("activeMapDraftKey"),
  buildSection: $("buildSection"), buildPalette: $("buildPalette"), completeBuild: $("completeBuildButton"),
  buildActive: $("buildActiveStrip"), buildActiveLabel: $("buildActiveLabel"),
  openBuildList: $("openBuildListButton"), closeBuildList: $("closeBuildListButton"),
  title: $("selectionTitle"), meta: $("selectionMeta"), x: $("selectedXInput"), y: $("selectedYInput"),
  selectionActions: $("selectionActionStrip"), selectionActionLabel: $("selectionActionLabel"),
  rotateSelection: $("rotateSelectionButton"), lockSelection: $("lockSelectionButton"), lockLayerSelection: $("lockLayerSelectionButton"), resetSelection: $("resetSelectionButton"), duplicateSelection: $("duplicateSelectionButton"), deleteSelection: $("deleteSelectionButton"), resizeBuildingShell: $("resizeBuildingShellButton"),
  openBillboardAd: $("openBillboardAdButton"), closeBillboardAd: $("closeBillboardAdButton"), billboardAdPalette: $("billboardAdPalette"), billboardAdGrid: $("billboardAdGrid"),
  undo: $("undoButton"), redo: $("redoButton"), changeState: $("changeStateLabel"),
  changeDetail: $("changeDetailLabel"),
  contractMap: $("contractMapLabel"), contractSchema: $("contractSchemaLabel"), contractRevision: $("contractRevisionLabel"), contractSummary: $("contractSummaryLabel"),
  validationReport: $("validationReport"), validationTitle: $("validationTitle"), validationDetail: $("validationDetail"), validationList: $("validationList"),
  snap: $("snapToggle"), handles: $("handleToggle"), rules: $("ruleToggle"), fit: $("fitButton"), save: $("saveButton"),
  reset: $("resetButton"), copy: $("copyButton"), output: $("exportOutput"), status: $("statusText")
};
init();
function init() {
  if (!IronLine.map01 || !IronLine.Renderer) {
    document.body.textContent = "Iron Line map renderer failed to load.";
    return;
  }
  Object.assign(state, createEditorMapState({ "baegeum-city": IronLine.map01, "dice-city": diceCityMap }));
  initEditorMapSelector(ui.mapSelect, state, switchEditorMap);
  loadEditorMapDraft(state);
  state.renderer = new IronLine.Renderer(state.canvas, state.camera);
  renderBuildPalette(ui.buildPalette, selectBuildPreset, state.buildCategoryOpen, toggleBuildCategory, state.activeMapId);
  initBillboardAdControls(ui, state, recordChange);
  initSelectionActions(ui, state, recordChange);
  bind();
  fitEditorCamera(state);
  syncUi("Original Iron Line city map loaded. Drag items to tune the city layout.");
  requestAnimationFrame(draw);
}
function bind() {
  window.addEventListener("resize", () => {
    state.renderer.resize();
    syncEditorCamera(state);
  });
  bindHistoryShortcuts(undoEdit, redoEdit);
  state.canvas.addEventListener("pointerdown", onPointerDown);
  state.canvas.addEventListener("pointermove", onPointerMove);
  state.canvas.addEventListener("pointerup", endDrag);
  state.canvas.addEventListener("pointercancel", endDrag);
  state.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  state.canvas.addEventListener("wheel", (event) => zoomEditorCamera(state, event), { passive: false });
  ui.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  ui.completeBuild.addEventListener("click", completeBuild);
  ui.openBuildList.addEventListener("click", () => { state.buildListOpen = true; syncUi(buildStatusLabel(state)); });
  ui.closeBuildList.addEventListener("click", () => { state.buildListOpen = false; syncUi(buildStatusLabel(state)); });
  ui.snap.addEventListener("change", () => state.snap = ui.snap.checked);
  ui.handles.addEventListener("change", () => state.showHandles = ui.handles.checked);
  ui.rules.addEventListener("change", () => state.showRules = ui.rules.checked);
  ui.undo.addEventListener("click", undoEdit);
  ui.redo.addEventListener("click", redoEdit);
  ui.fit.addEventListener("click", () => fitEditorCamera(state));
  ui.save.addEventListener("click", saveDraft);
  ui.reset.addEventListener("click", resetDraft);
  ui.copy.addEventListener("click", copyDraft);
  ui.x.addEventListener("change", moveSelectionFromInputs);
  ui.y.addEventListener("change", moveSelectionFromInputs);
}
function switchEditorMap(mapId) {
  const block = editorMapSwitchBlock(state, mapId);
  if (block.reason === "dirty") return syncUi("저장 안 된 변경이 있습니다. 저장 후 맵을 전환하세요.");
  if (block.reason === "unavailable") return syncUi("아직 기본 맵이 없는 도시입니다.");
  const next = switchEditorMapState(state, mapId);
  if (!next) return syncUi("아직 기본 맵이 없는 도시입니다.");
  if (state.buildPreset && !findBuildPreset(state.buildPreset.id, state.activeMapId)) state.buildPreset = null; renderBuildPalette(ui.buildPalette, selectBuildPreset, state.buildCategoryOpen, toggleBuildCategory, state.activeMapId);
  fitEditorCamera(state);
  syncUi(`${next.displayName} 편집 중.`);
}

function draw() {
  syncEditorCamera(state);
  const ctx = state.renderer.ctx;
  ctx.clearRect(0, 0, state.camera.width, state.camera.height);
  ctx.save();
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-state.camera.x, -state.camera.y);
  const game = editorGame();
  state.renderer.drawTerrain(game);
  state.renderer.drawSafeZones(game);
  state.renderer.drawCapturePoints(game);
  state.renderer.drawObstacles(game);
  drawCityBoundaryObstacles(ctx, state.map.obstacles);
  state.renderer.drawScenery(game);
  drawObjectRuleOverlay(ctx, state);
  drawBuildGhost(state.renderer, ctx, state);
  drawEditorOverlay(ctx, state);
  ctx.restore();
  requestAnimationFrame(draw);
}

function editorGame() {
  const capturePoints = (state.map.capturePoints || []).map((point) => ({ radius: 88, owner: TEAM.NEUTRAL || "neutral", progress: 0, contested: false, ...point }));
  return {
    world: state.map,
    capturePoints,
    effects: { scorchMarks: [], dustPuffs: [], trackScuffs: [] }
  };
}

function setMode(mode) {
  state.mode = ["scenery", "build", "obstacle", "road", "view"].includes(mode) ? mode : "scenery";
  state.selected = null; state.hover = null; state.drag = null; state.buildGhost = null;
  state.buildListOpen = state.mode === "build"; state.billboardAdPaletteOpen = false;
  syncUi(state.mode === "build" ? buildStatusLabel(state) : `${modeLabel()} 모드 선택됨.`);
}

function onPointerDown(event) {
  state.canvas.focus();
  const world = screenToWorld(state, event.clientX, event.clientY);
  if (event.button === 1 || event.button === 2 || state.mode === "view") return startPan(state, event);
  if (state.mode === "build") return placeBuildItem(event, world);
  const hit = findHit(state, world);
  if (hit) {
    state.selected = hit;
    state.drag = { type: "move", start: world, originals: captureOriginals(state, hit) };
  } else {
    state.selected = null;
    startPan(state, event);
  }
  state.canvas.setPointerCapture(event.pointerId);
  syncUi(hit ? `${labelFor(state, hit)} selected.` : "Drag empty space to move the camera.");
}

function onPointerMove(event) {
  const world = screenToWorld(state, event.clientX, event.clientY);
  if (state.drag?.type === "pan") return moveCamera(state, event);
  if (state.drag?.type === "move") return moveSelected(world);
  if (state.mode === "build") return updateBuildGhost(world);
  state.hover = findHit(state, world);
}

function endDrag() {
  if (state.drag?.type === "move") {
    recordChange(`${labelFor(state, state.selected)} moved.`);
  }
  state.drag = null;
}

function moveSelected(world) {
  const dx = snapDelta(world.x - state.drag.start.x);
  const dy = snapDelta(world.y - state.drag.start.y);
  for (const [key, original] of state.drag.originals) moveOriginal(state, key, original, dx, dy);
  syncSelectionInputs(ui, state);
}

function moveSelectionFromInputs() {
  const item = selectedItem(state);
  if (!state.selected || !item) return;
  const dx = Number(ui.x.value) - item.x;
  const dy = Number(ui.y.value) - item.y;
  const originals = captureOriginals(state, state.selected);
  for (const [key, original] of originals) moveOriginal(state, key, original, dx, dy);
  recordChange("Coordinates applied.");
}

function selectBuildPreset(id) {
  state.buildPreset = findBuildPreset(id, state.activeMapId);
  state.buildGhost = null;
  if (state.mode !== "build") state.mode = "build";
  state.buildListOpen = false;
  syncUi(buildStatusLabel(state));
}

function toggleBuildCategory(key, open) {
  state.buildCategoryOpen = setBuildCategoryOpen(state.buildCategoryOpen, key, open);
}

function updateBuildGhost(world) {
  if (!state.buildPreset) {
    state.buildGhost = null;
    return;
  }
  const item = createSceneryItem(state.map, state.buildPreset, world, { snap: state.snap, grid: GRID, preview: true });
  state.buildGhost = { item, ...validateSceneryPlacement(state.map, item) };
}

function placeBuildItem(event, world) {
  if (!state.buildPreset) {
    startPan(state, event);
    syncUi("건설 카드를 먼저 선택하세요.");
    return;
  }
  const item = createSceneryItem(state.map, state.buildPreset, world, { snap: state.snap, grid: GRID });
  const validation = validateSceneryPlacement(state.map, item);
  if (!validation.valid) {
    syncUi(validation.reason);
    return;
  }
  const list = item.objectLayer === "obstacle" ? (state.map.obstacles ||= []) : (state.map.scenery ||= []);
  list.push(item);
  state.selected = { type: item.objectLayer === "obstacle" ? "obstacle" : "scenery", index: list.length - 1 };
  updateBuildGhost(world);
  recordChange(`${state.buildPreset.label} 배치됨. 계속 놓거나 배치 완료를 누르세요.`);
}

function completeBuild() {
  state.buildPreset = null;
  state.buildGhost = null;
  state.buildListOpen = false;
  setMode("scenery");
  syncUi("배치 완료. 저장을 누르면 본게임에 반영됩니다.");
}

function undoEdit() {
  if (!undoHistory(state)) return;
  syncUi("이전 편집으로 되돌림.");
}

function redoEdit() {
  if (!redoHistory(state)) return;
  syncUi("되돌린 편집을 다시 적용함.");
}

function saveDraft() {
  const active = saveEditorMapDraft(state);
  syncUi(`${active?.displayName || "맵"} draft saved.`);
}
function resetDraft() {
  resetEditorMapDraft(state);
  fitEditorCamera(state);
  syncUi("World editor draft reset.");
}
async function copyDraft() {
  await navigator.clipboard?.writeText(ui.output.value);
  syncUi("World editor JSON copied.");
}

function syncUi(message = "") {
  ui.modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  syncBuildControls(ui, state);
  syncEditorMapControls(ui, state);
  syncSelectionInputs(ui, state);
  syncSelectionActions(ui, state);
  syncBillboardAdControls(ui, state);
  syncHistoryControls(ui, state);
  syncContractControls(ui, state, syncUi);
  updateExport();
  ui.status.textContent = message || `${modeLabel()} mode`;
}

function recordChange(message) {
  commitHistory(state);
  syncUi(message);
}

function updateExport() {
  ui.output.value = editorMapDraftJson(state);
}

function modeLabel() {
  return ({ scenery: "장식물", build: "건설", obstacle: "건물", road: "도로", view: "보기" })[state.mode] || "장식물";
}

function snapDelta(value) {
  return state.snap ? Math.round(value / GRID) * GRID : value;
}
