"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "iron-line");
const vendorFiles = [
  "src/core/math.js",
  "src/data/scenery-catalog.js",
  "src/data/map01.js",
  "src/data/map01-custom-layout.js"
];

(async () => {
  const { cityMap } = await import(pathToFileURL("src/data/city-map.js"));
  const compact = await import(pathToFileURL("src/data/baegeum-city-compact-layout.js"));
  const runtime = await import(pathToFileURL("src/scenes/city-scene-runtime.js"));
  const browserMap = compact.compactBaegeumMapLayout(loadIronLineBrowserMap());
  const browserReport = summarizeMap("iron-line-browser", browserMap);
  const fallbackReport = summarizeMap("fallback-city-map", cityMap);
  const runtimeMap = runtime.createRuntimeMap(browserMap);

  assertMapFits(browserReport);
  assertMapFits(fallbackReport);
  assert.equal(browserReport.height, compact.BAEGEUM_COMPACT_HEIGHT, "browser baegeum map should use the compact height");
  assert.equal(browserReport.maxBottom, browserReport.height, "browser map content reaches the lower edge");
  assert.ok(browserReport.playerSpawnY < 4300, "baegeum player spawn should move inside the compact map");
  assertRuntimeTransitionFits(runtimeMap);

  console.log("Baegeum map shrink readiness: compact relayout fits target height.");
  console.log(JSON.stringify({
    browser: publicReport(browserReport),
    fallback: publicReport(fallbackReport)
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function pathToFileURL(relativePath) {
  const { pathToFileURL: toUrl } = require("url");
  return toUrl(path.join(root, relativePath)).href;
}

function loadIronLineBrowserMap() {
  const context = { window: {}, console };
  context.window.IronLine = {};
  context.IronLine = context.window.IronLine;
  vm.createContext(context);
  for (const file of vendorFiles) {
    vm.runInContext(readVendor(file), context, { filename: file });
  }
  return context.window.IronLine.map01;
}

function readVendor(relativePath) {
  return fs.readFileSync(path.join(vendorRoot, relativePath), "utf8");
}

function summarizeMap(label, map) {
  const rows = [];
  collectRoads(rows, map);
  collectRects(rows, map.obstacles, "obstacle");
  collectRects(rows, map.scenery, "scenery");
  collectPoints(rows, map.navGraph?.nodes, "nav");
  collectPoints(rows, map.capturePoints, "capture");
  collectPoints(rows, map.safeZones, "safe-zone");
  collectNestedPoints(rows, map.baseExitPoints, "base-exit");
  collectNestedPoints(rows, map.spawns, "spawn");
  addPoint(rows, "playerSpawn", map.playerSpawn || map.spawns?.player);

  rows.sort((a, b) => b.bottom - a.bottom);
  return {
    label,
    width: Number(map.width),
    height: Number(map.height),
    maxBottom: Math.ceil(rows[0]?.bottom || 0),
    playerSpawnY: Math.round(Number((map.playerSpawn || map.spawns?.player || {}).y || 0)),
    blockers: rows.slice(0, 8)
  };
}

function collectRoads(rows, map) {
  (map.roads || []).forEach((road, roadIndex) => {
    (road || []).forEach((point, pointIndex) => addPoint(rows, `road:${roadIndex}:${pointIndex}`, point));
  });
}

function collectRects(rows, items = [], prefix) {
  for (const item of items || []) {
    if (!Number.isFinite(Number(item?.y))) continue;
    const bottom = Number(item.y) + Number(item.h || item.r || 0);
    rows.push({ label: `${prefix}:${item.id || item.kind || item.type || "unknown"}`, bottom });
  }
}

function collectPoints(rows, items = [], prefix) {
  for (const item of items || []) addPoint(rows, `${prefix}:${item.id || item.name || "unknown"}`, item);
}

function collectNestedPoints(rows, value, prefix) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectNestedPoints(rows, item, `${prefix}:${index}`));
    return;
  }
  if (!value || typeof value !== "object") return;
  addPoint(rows, prefix, value);
  for (const [key, child] of Object.entries(value)) collectNestedPoints(rows, child, `${prefix}:${key}`);
}

function addPoint(rows, label, point) {
  if (!Number.isFinite(Number(point?.y))) return;
  rows.push({ label, bottom: Number(point.y) });
}

function assertMapFits(report) {
  assert.ok(report.width > 0, `${report.label} needs a positive width`);
  assert.ok(report.height > 0, `${report.label} needs a positive height`);
  assert.ok(report.maxBottom <= report.height, `${report.label} has content outside map height`);
}

function assertRuntimeTransitionFits(map) {
  const transition = (map.mapTransitions || []).find((item) => item.objectId === "intercity-bus-terminal");
  assert.ok(transition, "compact baegeum map needs the intercity bus terminal transition");
  assert.ok(map.playerSpawn.y < map.height, "compact player spawn should be inside the map");
  assert.ok(transition.rect.y + transition.rect.h <= map.height, "compact bus terminal should fit inside the map");
  assert.equal(transition.interactionPoint.y, Math.round(map.playerSpawn.y), "terminal interaction should stay anchored to player spawn");
}

function publicReport(report) {
  return {
    height: report.height,
    maxBottom: report.maxBottom,
    shrinkablePixelsWithoutRelayout: report.height - report.maxBottom,
    playerSpawnY: report.playerSpawnY,
    lowestContent: report.blockers
  };
}
