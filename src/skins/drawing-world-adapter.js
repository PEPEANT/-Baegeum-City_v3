import {
  DEFAULT_SKIN_PRESET_ID,
  SKIN_PRESETS,
  SKIN_SIZE,
  drawPresetToContext,
  findSkinPreset,
  normalizeSkinPresetId,
  resolveSkinPresetDirection
} from "./baegeum-skin-presets.js";

export const BAEGEUM_SKIN_KEY = "baegeum-city:v2:skin";
export const BAEGEUM_SKIN_PRESET_KEY = "baegeum-city:v2:skin-preset";
export const DRAWING_WORLD_SKIN_KEY = "simulac-draw-world:skin:v1";

const presetDataUrls = new Map();
const skinImages = new Map();

export function getPlayableSkinPresets() {
  return SKIN_PRESETS.filter((preset) => preset.id !== "custom");
}

export function drawPresetSkin(canvas, presetId, direction = "side") {
  const preset = findSkinPreset(presetId);
  canvas.width = SKIN_SIZE;
  canvas.height = SKIN_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  drawPresetToContext(ctx, preset, direction);
  return canvas;
}

export function getPresetSkinDataUrl(presetId, direction = "side") {
  const preset = findSkinPreset(presetId);
  const resolvedDirection = resolveSkinPresetDirection(preset.id, direction);
  const cacheKey = `${preset.id}:${resolvedDirection}`;
  if (presetDataUrls.has(cacheKey)) return presetDataUrls.get(cacheKey);
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  drawPresetSkin(canvas, preset.id, resolvedDirection);
  const dataUrl = canvas.toDataURL("image/png");
  presetDataUrls.set(cacheKey, dataUrl);
  return dataUrl;
}

export function loadStoredSkinSelection() {
  if (typeof localStorage === "undefined") return { presetId: DEFAULT_SKIN_PRESET_ID, skin: "" };
  const storedPresetId = localStorage.getItem(BAEGEUM_SKIN_PRESET_KEY) || DEFAULT_SKIN_PRESET_ID;
  const presetId = normalizeSkinPresetId(storedPresetId);
  const customSelected = presetId === "custom";
  const storedSkin = customSelected ? localStorage.getItem(BAEGEUM_SKIN_KEY) : "";
  const legacySkin = customSelected ? localStorage.getItem(DRAWING_WORLD_SKIN_KEY) : "";
  let skin = storedSkin || legacySkin || "";
  if (storedPresetId !== presetId) {
    localStorage.setItem(BAEGEUM_SKIN_PRESET_KEY, presetId);
  }
  return { presetId, skin };
}

export function saveStoredPlayerSkin(skin, presetId = "custom") {
  if (typeof localStorage === "undefined") return;
  const normalizedPresetId = normalizeSkinPresetId(presetId);
  localStorage.setItem(BAEGEUM_SKIN_PRESET_KEY, normalizedPresetId);
  if (normalizedPresetId === "custom" && skin) localStorage.setItem(BAEGEUM_SKIN_KEY, skin);
  else localStorage.removeItem(BAEGEUM_SKIN_KEY);
}

export function applyStoredSkinToPlayer(player) {
  const selection = loadStoredSkinSelection();
  player.name = player.name || "YOU";
  player.skinPreset = selection.presetId;
  player.skin = selection.skin || getPresetSkinDataUrl(selection.presetId);
}

export function assignNpcSkin(npc, index) {
  const presets = getPlayableSkinPresets();
  const preset = presets[index % presets.length] || presets[0];
  npc.skinPreset = preset?.id || DEFAULT_SKIN_PRESET_ID;
  npc.skin = getPresetSkinDataUrl(npc.skinPreset);
}

export function drawDrawingWorldCharacter(ctx, entity, options = {}) {
  const size = options.size || 50;
  const label = options.label || entity.name || "";
  const direction = resolveEntityDirection(entity, options);
  const resolvedDirection = resolveSkinPresetDirection(entity.skinPreset || DEFAULT_SKIN_PRESET_ID, direction);
  const skin = entity.skin || getPresetSkinDataUrl(entity.skinPreset, direction);
  const walk = entity.moving ? Math.sin(Date.now() / 120) * 2.2 : 0;
  const squash = entity.moving ? 1 + Math.abs(Math.sin(Date.now() / 120)) * 0.035 : 1;
  const facing = resolvedDirection === "side" && entity.facing === -1 ? -1 : 1;

  ctx.save();
  ctx.translate(entity.x, entity.y + walk);
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(3, size * 0.34, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.scale(facing, squash);
  const image = getSkinImage(skin);
  if (image?.complete && image.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, -size / 2, -size / 2, size, size);
  } else {
    drawFallbackAvatar(ctx, size, options.color || entity.color || "#111827");
  }
  ctx.restore();

  if (label) drawName(ctx, entity.x, entity.y + size / 2 + 8, label);
  return true;
}

function getSkinImage(skin) {
  if (!skin) return null;
  if (skinImages.has(skin)) return skinImages.get(skin);
  const image = new Image();
  image.src = skin;
  skinImages.set(skin, image);
  return image;
}

function resolveEntityDirection(entity, options) {
  if (options.direction) return options.direction;
  if (entity.skinDirection) return entity.skinDirection;
  if (!Number.isFinite(entity.angle)) return "side";
  const x = Math.cos(entity.angle);
  const y = Math.sin(entity.angle);
  if (Math.abs(y) > Math.abs(x) * 1.25) return y > 0 ? "front" : "back";
  return "side";
}

function drawFallbackAvatar(ctx, size, color) {
  ctx.fillStyle = color;
  roundRect(ctx, -size / 2, -size / 2, size, size, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-8, -6, 4, 4);
  ctx.fillRect(6, -6, 4, 4);
  ctx.fillStyle = "#111827";
  ctx.fillRect(-6, 7, 12, 3);
}

function drawName(ctx, x, y, label) {
  ctx.fillStyle = "rgba(24, 28, 21, 0.86)";
  ctx.font = "12px Dotum, '돋움', 'Malgun Gothic', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, x, y);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}
