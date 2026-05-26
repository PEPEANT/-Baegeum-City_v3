import { getWorldObjectPreset } from "../data/world-object-presets.js";

const SIZE_STEPS = [
  { key: "compact", label: "소형", scale: 0.85 },
  { key: "standard", label: "기본", scale: 1 },
  { key: "large", label: "대형", scale: 1.15 }
];

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

function roundEven(value) {
  return Math.round(value / 2) * 2;
}
