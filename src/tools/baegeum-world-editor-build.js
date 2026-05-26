import { buildableWorldObjectPresets, createPlacedObject, effectiveCollision, getWorldObjectPreset, objectBounds } from "../data/world-object-presets.js";
import { canPlaceNewBuildingType } from "../data/city-district-contract.js";
import { createWorldObjectId } from "../data/world-map-contract.js";
import { validateObjectPlacement } from "../data/world-placement-validation.js";

export const BUILD_PRESETS = buildableWorldObjectPresets().map((preset) => ({
  id: preset.id,
  label: preset.label,
  layer: preset.layer,
  category: preset.editor.category,
  meta: preset.editor.meta,
  pinned: preset.editor.pinned,
  swatch: preset.editor.swatch,
  buildingType: preset.editor.buildingType,
  districtId: preset.editor.districtId
}));
export const BUILD_CATEGORY_LABELS = {
  city: "도시",
  building: "건물",
  nature: "자연물",
  street: "거리 시설",
  signage: "광고/간판",
  misc: "기타"
};
const BUILD_CATEGORY_ORDER = ["city", "building", "nature", "street", "signage", "misc"];

export function buildPresetsForMap(mapId = null, presets = BUILD_PRESETS) {
  return presets.filter((preset) => !mapId || !preset.buildingType || canPlaceNewBuildingType(preset.buildingType, mapId));
}

export function findBuildPreset(id, mapId = null) {
  return buildPresetsForMap(mapId).find((preset) => preset.id === id) || null;
}

export function createBuildCategoryOpenState(presets = BUILD_PRESETS) {
  return Object.fromEntries(groupBuildPresets(presets).map((group) => [group.key, group.open]));
}

export function setBuildCategoryOpen(openState, key, open) {
  return { ...openState, [key]: Boolean(open) };
}

export function renderBuildPalette(container, onSelect, openState = null, onToggle = null, mapId = null) {
  container.innerHTML = "";
  for (const group of groupBuildPresets(buildPresetsForMap(mapId), openState)) renderBuildGroup(container, group, onSelect, onToggle);
}

export function groupBuildPresets(presets, openState = null) {
  const groups = [];
  const pinned = presets.filter((preset) => preset.pinned);
  if (pinned.length) groups.push(buildGroup("pinned", "고정", true, pinned, openState));
  for (const key of BUILD_CATEGORY_ORDER) {
    const items = presets.filter((preset) => preset.category === key);
    if (items.length) groups.push(buildGroup(key, BUILD_CATEGORY_LABELS[key], false, items, openState));
  }
  return groups;
}

export function syncBuildControls(ui, state) {
  ensureFloatingBuildSection(ui);
  const placing = state.mode === "build" && Boolean(state.buildPreset);
  ui.buildSection.hidden = state.mode !== "build" || !state.buildListOpen;
  ui.buildActive.hidden = !placing || state.buildListOpen;
  ui.buildActiveLabel.textContent = placing ? `${state.buildPreset.label} 배치 중` : "배치 중";
  ui.completeBuild.disabled = !state.buildPreset;
  for (const button of ui.buildPalette.querySelectorAll("[data-build-preset]")) {
    button.classList.toggle("active", button.dataset.buildPreset === state.buildPreset?.id);
  }
}

export function createSceneryItem(map, preset, point, options = {}) {
  const item = createPlacedObject(preset.id);
  item.id = options.preview ? `preview-${preset.id}` : createWorldObjectId(preset.id, map);
  placeItem(item, point, options.snap, options.grid || 40);
  return item;
}

export function canPlaceScenery(map, item) {
  return validateObjectPlacement(map, item).valid;
}

export function validateSceneryPlacement(map, item) {
  return validateObjectPlacement(map, item);
}

export function drawBuildGhost(renderer, ctx, state) {
  const ghost = state.buildGhost;
  if (!ghost?.item) return;
  ctx.save();
  ctx.globalAlpha = ghost.valid ? 0.62 : 0.32;
  if (ghost.item.objectLayer === "obstacle") renderer.drawObstacles({ world: { obstacles: [ghost.item] } });
  else renderer.drawScenery({ world: { scenery: [ghost.item] } });
  ctx.globalAlpha = 1;
  ctx.strokeStyle = ghost.valid ? "rgba(86, 220, 130, 0.95)" : "rgba(255, 92, 92, 0.95)";
  ctx.lineWidth = 4 / state.camera.zoom;
  ctx.setLineDash([14 / state.camera.zoom, 9 / state.camera.zoom]);
  drawBounds(ctx, ghost.item);
  ctx.restore();
}

export function drawObjectRuleOverlay(ctx, state) {
  if (!state.showRules) return;
  ctx.save();
  ctx.lineWidth = 2 / state.camera.zoom;
  for (const item of state.map.scenery || []) {
    const collision = effectiveCollision(item);
    if (!collision) continue;
    const bounds = objectBounds(item);
    ctx.strokeStyle = item.destructibleSpec?.enabled ? "rgba(255, 214, 92, 0.82)" : "rgba(255, 92, 92, 0.72)";
    ctx.setLineDash(item.destructibleSpec?.enabled ? [10 / state.camera.zoom, 7 / state.camera.zoom] : []);
    if (collision.shape === "circle") {
      ctx.beginPath();
      ctx.arc(bounds.x + bounds.w * 0.5, bounds.y + bounds.h * 0.5, bounds.w * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }
  }
  ctx.restore();
}

export function buildStatusLabel(state) {
  if (!state.buildPreset) return state.buildListOpen ? "건설 목록 열림." : "건설 대기.";
  const preset = getWorldObjectPreset(state.buildPreset.id);
  const detail = preset?.destructible?.enabled ? "파괴 가능" : "고정";
  return `${state.buildPreset.label} 배치 중. ${detail}. 맵을 클릭하면 놓습니다.`;
}

function placeItem(item, point, snap, grid) {
  const p = snap ? snapPoint(point, grid) : point;
  if (item.shape === "circle" || item.r) {
    item.x = Math.round(p.x);
    item.y = Math.round(p.y);
    return;
  }
  item.x = Math.round(p.x - (item.w || 24) * 0.5);
  item.y = Math.round(p.y - (item.h || 24) * 0.5);
}

function ensureFloatingBuildSection(ui) {
  if (!ui.buildSection || ui.buildSection.dataset.floating === "true") return;
  const anchor = document.querySelector(".selection-action-strip");
  document.body.insertBefore(ui.buildSection, anchor || null);
  ui.buildSection.dataset.floating = "true";
}

function buildGroup(key, label, defaultOpen, presets, openState) {
  return { key, label, open: openState?.[key] ?? defaultOpen, presets };
}

function renderBuildGroup(container, group, onSelect, onToggle) {
  const section = document.createElement("details");
  section.className = "build-group";
  section.dataset.buildGroup = group.key;
  section.open = group.open;
  section.innerHTML = `<summary><strong></strong><span></span></summary><div class="build-card-grid"></div>`;
  section.querySelector("strong").textContent = group.label;
  section.querySelector("summary span").textContent = `${group.presets.length}`;
  section.addEventListener("toggle", () => onToggle?.(group.key, section.open));
  const grid = section.querySelector(".build-card-grid");
  for (const preset of group.presets) grid.appendChild(buildButton(preset, onSelect));
  container.appendChild(section);
}

function buildButton(preset, onSelect) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "build-card";
  button.dataset.buildPreset = preset.id;
  button.innerHTML = `<span class="build-swatch"></span><span class="build-copy"><strong></strong><span></span></span>`;
  button.querySelector(".build-swatch").style.background = preset.swatch;
  button.querySelector("strong").textContent = preset.label;
  button.querySelector(".build-copy span").textContent = preset.meta;
  button.addEventListener("click", () => onSelect(preset.id));
  return button;
}

function snapPoint(point, grid) {
  return {
    x: Math.round(point.x / grid) * grid,
    y: Math.round(point.y / grid) * grid
  };
}

function drawBounds(ctx, item) {
  const bounds = objectBounds(item);
  if (item.collision?.shape === "circle") {
    ctx.beginPath();
    ctx.arc(bounds.x + bounds.w * 0.5, bounds.y + bounds.h * 0.5, bounds.w * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }
  ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
}
