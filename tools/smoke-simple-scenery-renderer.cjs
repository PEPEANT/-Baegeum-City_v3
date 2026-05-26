"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { drawSimpleScenery } = await load("src/renderers/simple-scenery-renderer.js");
  const { diceCityMap } = await load("src/data/dice-city-map.js");
  const ctx = fakeContext();

  drawSimpleScenery(ctx, diceCityMap.scenery);
  assert.ok(ctx.calls.fillRect > 0, "scenery renderer should draw rectangular props");
  assert.ok(ctx.calls.arc > 0, "scenery renderer should draw circular props");
  assert.ok(diceCityMap.scenery.filter((item) => item.type === "streetlight").length >= 6, "casino street should have lights");
  assert.ok(diceCityMap.scenery.filter((item) => item.type === "billboard").length >= 5, "casino street should have billboards");

  console.log("Simple scenery renderer smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function fakeContext() {
  const calls = { arc: 0, fillRect: 0 };
  return {
    calls,
    beginPath() {},
    arc() { calls.arc += 1; },
    ellipse() {},
    fill() {},
    fillRect() { calls.fillRect += 1; },
    fillText() {},
    lineTo() {},
    moveTo() {},
    restore() {},
    rotate() {},
    roundRect() {},
    save() {},
    stroke() {},
    translate() {},
    clip() {},
    createLinearGradient() {
      return { addColorStop() {} };
    }
  };
}
