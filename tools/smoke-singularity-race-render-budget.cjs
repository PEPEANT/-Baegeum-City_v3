"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pageSource = fs.readFileSync(path.join(root, "singularity-race.html"), "utf8");

function functionBody(name) {
  const start = pageSource.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  let depth = 0;
  let opened = false;
  for (let index = start; index < pageSource.length; index += 1) {
    const char = pageSource[index];
    if (char === "{") {
      depth += 1;
      opened = true;
    } else if (char === "}") {
      depth -= 1;
      if (opened && depth === 0) return pageSource.slice(start, index + 1);
    }
  }
  throw new Error(`${name} body should close`);
}

const advanceBody = functionBody("advanceActionPreview");
const frameBody = functionBody("renderActionPreviewFrame");
const minimapBody = functionBody("renderRaceMinimap");

assert(pageSource.includes("RACE_HUD_RENDER_INTERVAL_MS"), "race HUD render interval should exist");
assert(pageSource.includes("RACE_STANDINGS_RENDER_INTERVAL_MS"), "race standings render interval should exist");
assert(pageSource.includes("RACE_SLOT_RENDER_INTERVAL_MS"), "race slot render interval should exist");
assert(pageSource.includes("renderCache"), "race render cache should exist");
assert(advanceBody.includes("renderActionPreviewFrame(now)"), "hot movement loop should use lightweight frame render");
assert(frameBody.includes("renderTrack();"), "lightweight frame should keep track rendering hot");
assert(frameBody.includes("renderRaceStandings();"), "rankings should stay throttled, not removed");
assert(!frameBody.includes("renderMessages();"), "hot frame must not redraw chat messages");
assert(!frameBody.includes("renderProfileSkins();"), "hot frame must not redraw profile skins");
assert(minimapBody.includes("minimapPlayerNode"), "minimap should cache static SVG and move only the player dot");

console.log("Singularity Race render budget smoke passed.");
