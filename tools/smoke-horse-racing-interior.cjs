"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const { interiors } = await load("src/data/interiors.js");
  const { drawHorseRacingInteriorProp } = await load("src/renderers/horse-racing-interior-renderer.js");
  const interior = interiors["interior-horse-track"];
  assert.equal(interior.gameType, "horse-racing", "horse track should use the horse-racing game type");
  assert.deepEqual(
    interior.props.map((prop) => prop.role),
    ["horse-scoreboard", "horse-track", "horse-grandstand", "horse-betting-station", "exchange-atm"],
    "horse track should preserve the draft map sections"
  );
  assert.equal(interior.props.find((prop) => prop.role === "horse-scoreboard").horses.length, 5, "scoreboard should list 5 horses");
  assert.equal(interior.props.find((prop) => prop.role === "horse-track").lanes, 5, "track should have 5 lanes");
  assert.equal(interior.props.find((prop) => prop.role === "horse-grandstand").rows, 3, "grandstand should keep 3 seat rows");
  assert.equal(interior.props.find((prop) => prop.role === "horse-betting-station").windows, 4, "betting station should keep 4 windows");
  assert.equal(drawHorseRacingInteriorProp(fakeContext(), { role: "unknown" }), false, "renderer should ignore unrelated props");

  console.log("Horse racing interior smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

function fakeContext() {
  return {
    beginPath() {},
    fill() {},
    fillRect() {},
    fillText() {},
    lineTo() {},
    moveTo() {},
    restore() {},
    roundRect() {},
    save() {},
    setLineDash() {},
    stroke() {}
  };
}
