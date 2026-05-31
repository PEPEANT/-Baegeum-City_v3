import { getWorldObjectPreset } from "../data/world-object-presets.js";

const SIZE_STEPS = [
  { key: "compact", label: "소형", scale: 0.85 },
  { key: "standard", label: "기본", scale: 1 },
  { key: "large", label: "대형", scale: 1.15 }
];
export const BUILDING_SHELL_COLOR_OPTIONS = Object.freeze([
  { id: "slate", label: "Slate", value: "#58615a" },
  { id: "green", label: "Green", value: "#4f735c" },
  { id: "brick", label: "Brick", value: "#7a4d45" },
  { id: "blue", label: "Blue", value: "#4e647d" },
  { id: "gold", label: "Gold", value: "#7a6845" },
  { id: "violet", label: "Violet", value: "#665878" }
]);

export function isBuildingShell(item) {
  return item?.kind === "building" && item.objectKind === "building_shell";
}

export function buildingShellSizeLabel(item) {
  if (!isBuildingShell(item)) return "";
  return nearestSizeStep(item).label;
}

export function cycleBuildingShellSize(item) {
  if (!isBuildingShell(item)) return null;
  const base = baseShellSize(item);
  const currentIndex = SIZE_STEPS.findIndex((step) => step.key === nearestSizeStep(item, base).key);
  const next = SIZE_STEPS[(currentIndex + 1) % SIZE_STEPS.length];
  resizeAroundCenter(item, base, next.scale);
  syncShellCollision(item);
  return { key: next.key, label: next.label, w: item.w, h: item.h };
}

export function buildingShellDisplayName(item) {
  if (!isBuildingShell(item)) return "";
  return cleanShellName(item.shellName) || cleanShellName(item.label) || cleanShellName(item.sign) || item.presetId || item.id || "building";
}

export function buildingShellColor(item) {
  if (!isBuildingShell(item)) return "";
  return normalizeShellColor(item.shellColor);
}

export function setBuildingShellName(item, value) {
  if (!isBuildingShell(item)) return null;
  const shellName = cleanShellName(value);
  if (shellName) item.shellName = shellName;
  else delete item.shellName;
  return { shellName: item.shellName || "", label: buildingShellDisplayName(item) };
}

export function setBuildingShellColor(item, value) {
  if (!isBuildingShell(item)) return null;
  const shellColor = normalizeShellColor(value);
  if (shellColor) item.shellColor = shellColor;
  else delete item.shellColor;
  return { shellColor: item.shellColor || "", label: colorLabel(item.shellColor) };
}

function nearestSizeStep(item, base = baseShellSize(item)) {
  const ratio = base.w > 0 ? (Number(item.w) || base.w) / base.w : 1;
  return SIZE_STEPS.reduce((best, step) => {
    const bestDistance = Math.abs(ratio - best.scale);
    const distance = Math.abs(ratio - step.scale);
    return distance < bestDistance ? step : best;
  }, SIZE_STEPS[1]);
}

function baseShellSize(item) {
  const preset = getWorldObjectPreset(item.presetId);
  return {
    w: Number(preset?.visual?.w) || Number(item.w) || 120,
    h: Number(preset?.visual?.h) || Number(item.h) || 90
  };
}

function resizeAroundCenter(item, base, scale) {
  const cx = (Number(item.x) || 0) + (Number(item.w) || base.w) * 0.5;
  const cy = (Number(item.y) || 0) + (Number(item.h) || base.h) * 0.5;
  item.w = Math.max(80, roundEven(base.w * scale));
  item.h = Math.max(60, roundEven(base.h * scale));
  item.x = Math.round(cx - item.w * 0.5);
  item.y = Math.round(cy - item.h * 0.5);
}

function syncShellCollision(item) {
  if (item.collision?.shape !== "rect") return;
  item.collision.w = item.w;
  item.collision.h = item.h;
}

function cleanShellName(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 24);
}

function normalizeShellColor(value) {
  const color = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/u.test(color) ? color : "";
}

function colorLabel(value) {
  return BUILDING_SHELL_COLOR_OPTIONS.find((option) => option.value === normalizeShellColor(value))?.label || "Custom";
}

function roundEven(value) {
  return Math.round(value / 2) * 2;
}
