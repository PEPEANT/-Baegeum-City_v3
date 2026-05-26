import { BUILDING_TYPE_IDS, DISTRICT_IDS } from "./city-district-contract.js";
import { INFRASTRUCTURE_WORLD_OBJECT_PRESETS } from "./world-object-infrastructure-presets.js";

const BREAK_BY_COMMON = ["vehicleImpact", "explosion", "weapon"];

export const WORLD_OBJECT_PRESETS = [
  sceneryPreset({
    id: "tree-broadleaf",
    label: "활엽수",
    editorCategory: "nature",
    meta: "충돌 / 파괴 가능",
    swatch: "#437146",
    visual: { type: "tree", variant: "broadleaf", shape: "circle", r: 54 },
    collision: { kind: "soft-solid", shape: "circle", r: 42, blocksPlayers: true, blocksVehicles: true },
    maxHp: 72,
    debrisPreset: "tree-stump"
  }),
  sceneryPreset({
    id: "tree-pine",
    label: "침엽수",
    editorCategory: "nature",
    meta: "충돌 / 파괴 가능",
    swatch: "#355f38",
    visual: { type: "tree", variant: "pine", shape: "circle", r: 48 },
    collision: { kind: "soft-solid", shape: "circle", r: 38, blocksPlayers: true, blocksVehicles: true },
    maxHp: 66,
    debrisPreset: "tree-stump"
  }),
  sceneryPreset({
    id: "streetlight",
    label: "가로등",
    meta: "얇은 충돌 / 차량 파괴",
    editorCategory: "street",
    pinned: true,
    swatch: "#f1d36f",
    visual: { type: "streetlight", variant: "single", shape: "rect", w: 30, h: 108 },
    collision: { kind: "thin-solid", shape: "rect", x: 10, y: 76, w: 10, h: 24, blocksPlayers: true, blocksVehicles: true },
    maxHp: 28,
    debrisPreset: "bent-light"
  }),
  sceneryPreset({
    id: "billboard",
    label: "광고판",
    meta: "광고 스킨 / 파괴 가능",
    editorCategory: "signage",
    pinned: true,
    swatch: "#3f4f94",
    visual: { type: "billboard", variant: "campaign", adId: "dis-inside", shape: "rect", w: 168, h: 74 },
    collision: { kind: "thin-solid", shape: "rect", x: 32, y: 52, w: 104, h: 18, blocksPlayers: true, blocksVehicles: true },
    maxHp: 40,
    debrisPreset: "broken-sign"
  }),
  buildingPreset({
    id: "building-shop-shell",
    label: "빈 상가",
    meta: "건물 배치 / 입장 없음",
    editorCategory: "building",
    swatch: "#6d7c74",
    buildingType: BUILDING_TYPE_IDS.CONVENIENCE_STORE,
    districtId: DISTRICT_IDS.BAEGEUM_COMMERCE,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "service-block", w: 220, h: 150 },
    collision: { kind: "solid-building", shape: "rect", w: 220, h: 150, blocksPlayers: true, blocksVehicles: true }
  }),
  buildingPreset({
    id: "building-home-shell",
    label: "빈 주택",
    meta: "배금 생활 / 입장 없음",
    editorCategory: "building",
    swatch: "#8b7d62",
    buildingType: BUILDING_TYPE_IDS.HOME,
    districtId: DISTRICT_IDS.BAEGEUM_RESIDENTIAL,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "barracks", w: 200, h: 138 },
    collision: { kind: "solid-building", shape: "rect", w: 200, h: 138, blocksPlayers: true, blocksVehicles: true }
  }),
  buildingPreset({
    id: "building-civic-shell",
    label: "빈 공공건물",
    meta: "배금 공공 / 입장 없음",
    editorCategory: "building",
    swatch: "#6f7d86",
    buildingType: BUILDING_TYPE_IDS.POLICE_STATION,
    districtId: DISTRICT_IDS.BAEGEUM_CIVIC,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "checkpoint", w: 240, h: 150 },
    collision: { kind: "solid-building", shape: "rect", w: 240, h: 150, blocksPlayers: true, blocksVehicles: true }
  }),
  ...INFRASTRUCTURE_WORLD_OBJECT_PRESETS,
  buildingPreset({
    id: "building-casino-shell",
    label: "빈 카지노",
    meta: "건물 배치 / venue 없음",
    editorCategory: "building",
    swatch: "#7b384d",
    buildingType: BUILDING_TYPE_IDS.BLACKJACK_CASINO,
    districtId: DISTRICT_IDS.DICE_CASINO_STRIP,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "depot", w: 260, h: 170 },
    collision: { kind: "solid-building", shape: "rect", w: 260, h: 170, blocksPlayers: true, blocksVehicles: true }
  }),
  buildingPreset({
    id: "building-alley-shell",
    label: "골목 상가",
    meta: "좁은 건물 / 입장 없음",
    editorCategory: "building",
    swatch: "#56606d",
    buildingType: BUILDING_TYPE_IDS.BACK_ALLEY,
    districtId: DISTRICT_IDS.DICE_BACK_ALLEY,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "garage", w: 180, h: 130 },
    collision: { kind: "solid-building", shape: "rect", w: 180, h: 130, blocksPlayers: true, blocksVehicles: true }
  }),
  buildingPreset({
    id: "building-loan-shell",
    label: "빈 사채업소",
    meta: "다이스 뒷골목 / 입장 없음",
    editorCategory: "building",
    swatch: "#584755",
    buildingType: BUILDING_TYPE_IDS.LOAN_OFFICE,
    districtId: DISTRICT_IDS.DICE_BACK_ALLEY,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "bunker", w: 210, h: 142 },
    collision: { kind: "solid-building", shape: "rect", w: 210, h: 142, blocksPlayers: true, blocksVehicles: true }
  }),
  buildingPreset({
    id: "building-motel-shell",
    label: "빈 모텔",
    meta: "다이스 밤거리 / 입장 없음",
    editorCategory: "building",
    swatch: "#5f526e",
    buildingType: BUILDING_TYPE_IDS.MOTEL,
    districtId: DISTRICT_IDS.DICE_NIGHTLIFE,
    visual: { kind: "building", objectKind: "building_shell", capabilities: ["collidable"], variant: "warehouse", w: 250, h: 154 },
    collision: { kind: "solid-building", shape: "rect", w: 250, h: 154, blocksPlayers: true, blocksVehicles: true }
  }),
  sceneryPreset({
    id: "bench",
    label: "벤치",
    meta: "낮은 충돌 / 차량 파괴",
    editorCategory: "street",
    pinned: true,
    swatch: "#9a7042",
    visual: { type: "bench", variant: "wood", shape: "rect", w: 112, h: 36 },
    collision: { kind: "low-solid", shape: "rect", x: 0, y: 2, w: 112, h: 30, blocksPlayers: true, blocksVehicles: false },
    maxHp: 32,
    debrisPreset: "broken-bench"
  }),
  sceneryPreset({
    id: "brush",
    label: "수풀",
    meta: "약한 방해 / 파괴 가능",
    editorCategory: "nature",
    swatch: "#557744",
    visual: { type: "brush", variant: "brush", shape: "circle", r: 72 },
    collision: { kind: "soft-block", shape: "circle", r: 36, blocksPlayers: false, blocksVehicles: false },
    maxHp: 38,
    debrisPreset: "trampled-brush"
  })
];

export function getWorldObjectPreset(id) {
  return WORLD_OBJECT_PRESETS.find((preset) => preset.id === id) || null;
}

export function buildableWorldObjectPresets() {
  return WORLD_OBJECT_PRESETS.filter((preset) => preset.editor?.buildable);
}

export function createPlacedObject(presetId) {
  const preset = getWorldObjectPreset(presetId);
  if (!preset) throw new Error(`Unknown world object preset: ${presetId}`);
  const item = {
    presetId: preset.id,
    objectLayer: preset.layer,
    ...clone(preset.visual),
    collision: clone(preset.collision),
    destructibleSpec: clone(preset.destructible),
    buildRules: clone(preset.buildRules)
  };
  if (preset.destructible?.maxHp) {
    item.hp = preset.destructible.maxHp;
    item.maxHp = preset.destructible.maxHp;
    item.destructible = true;
  }
  return item;
}

export function createObjectRuntimeState(item) {
  return {
    id: item.id,
    hp: item.destructibleSpec?.maxHp || item.maxHp || 1,
    destroyed: false,
    lastDamageBy: null,
    revision: 0
  };
}

export function applyObjectDamage(item, runtimeState, amount, source = {}) {
  const spec = item.destructibleSpec;
  if (!spec?.enabled || !spec.breakBy?.includes(source.type)) return runtimeState;
  const next = { ...runtimeState, hp: Math.max(0, runtimeState.hp - Math.max(0, amount)), lastDamageBy: source.id || null };
  next.destroyed = next.hp <= 0;
  next.revision = (runtimeState.revision || 0) + 1;
  return next;
}

export function effectiveCollision(item, runtimeState = null) {
  const destroyed = runtimeState?.destroyed || item.destroyed;
  if (destroyed && item.destructibleSpec?.destroyedCollision === "none") return null;
  return clone(item.collision || null);
}

export function objectBounds(item) {
  const collision = effectiveCollision(item) || {};
  if (collision.shape === "circle") {
    const center = visualCenter(item);
    const r = collision.r || item.r || Math.max(item.w || 20, item.h || 20) * 0.5;
    return { x: center.x + (collision.x || 0) - r, y: center.y + (collision.y || 0) - r, w: r * 2, h: r * 2 };
  }
  if (collision.shape === "rect") {
    return { x: item.x + (collision.x || 0), y: item.y + (collision.y || 0), w: collision.w || item.w || 24, h: collision.h || item.h || 24 };
  }
  if (item.shape === "circle" || item.r) return { x: item.x - item.r, y: item.y - item.r, w: item.r * 2, h: item.r * 2 };
  return { x: item.x, y: item.y, w: item.w || 24, h: item.h || 24 };
}

function sceneryPreset(config) {
  return {
    id: config.id,
    label: config.label,
    layer: "scenery",
    editor: { buildable: true, category: config.editorCategory || "misc", meta: config.meta, pinned: Boolean(config.pinned), swatch: config.swatch },
    visual: config.visual,
    collision: config.collision,
    destructible: {
      enabled: true,
      maxHp: config.maxHp,
      breakBy: BREAK_BY_COMMON,
      destroyedCollision: "none",
      debrisPreset: config.debrisPreset
    },
    buildRules: { category: "scenery", avoidEntrances: true, avoidSpawns: true }
  };
}

function buildingPreset(config) {
  const visual = { ...config.visual, buildingType: config.buildingType, districtId: config.districtId };
  return {
    id: config.id,
    label: config.label,
    layer: "obstacle",
    editor: { buildable: true, category: config.editorCategory || "building", meta: config.meta, pinned: Boolean(config.pinned), swatch: config.swatch, buildingType: config.buildingType, districtId: config.districtId },
    visual,
    collision: config.collision,
    destructible: { enabled: false },
    buildRules: { category: "building", avoidEntrances: true, avoidSpawns: true, buildingType: config.buildingType, districtId: config.districtId }
  };
}

function visualCenter(item) {
  if (item.shape === "circle" || item.r) return { x: item.x, y: item.y };
  return { x: item.x + (item.w || 0) * 0.5, y: item.y + (item.h || 0) * 0.5 };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}
