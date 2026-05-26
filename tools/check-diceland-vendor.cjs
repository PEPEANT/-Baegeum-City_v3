"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "diceland");
const sourceCommit = "b8cec6b9a231a04b230b338dddb86c839f613f90";

const expectedHashes = {
  "index.html": "a614bee1260266539a1f033f21c6827393bde6edd94ca1a3d02dd15d4eee2762",
  "src/main.js": "5556a88c24312d16ab7c5df40625837cdcebd1ed456b298ba90e76b2ae1e8aa6",
  "src/features/blackjack/blackjackUI.js": "f203aff7b73fdc34215475709b0943e5dd5afd2111ea00314461f87ca56223a8",
  "src/features/blackjack/blackjackLogic.js": "bb2e435dd63e4f56475e44001fc487c55ee1c18c7e22d4eaeb407ee6f3d305b3",
  "src/features/roulette/rouletteUI.js": "21752dae20321808adb864c0ff31124dda54e1fb1c2f7f2f125fc8bec2a2b9c4",
  "src/features/roulette/rouletteLogic.js": "b3be32ace3edc39fba86dfab86cab9a1a7d1977262433c587bf33113f839408c",
  "src/core/input.js": "5f7d155c7616e0a060a930e143ceca6be1eec798db0a983be6da305379b7aad2",
  "styles/hud.css": "26753c9fcd2fc5e2805b8bdca987517955d3dbe4ecbde930ed8dd573007a6b4a",
  "styles/scenes/blackjack.css": "a3e2dbc4f34250569d0cb922e31d7baa71ead56441304782cced319e2a422a27",
  "styles/scenes/roulette.css": "7ed3533353bd631ec6344105678f6898514baf9b6fc81b2fc2d7c42c614f03b0"
};

function vendorPath(relativePath) {
  return path.join(vendorRoot, ...relativePath.split("/"));
}

function read(relativePath) {
  return fs.readFileSync(vendorPath(relativePath), "utf8");
}

function hashFile(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(vendorPath(relativePath))).digest("hex");
}

for (const [relativePath, expected] of Object.entries(expectedHashes)) {
  assert.ok(fs.existsSync(vendorPath(relativePath)), `${relativePath} is missing from DiceLand vendor files`);
  assert.equal(hashFile(relativePath), expected, `${relativePath} hash changed from ${sourceCommit}`);
}

const indexHtml = read("index.html");
assert.ok(indexHtml.includes("joystick-zone"), "DiceLand mobile joystick reference is missing");
assert.ok(indexHtml.includes("mobile-action"), "DiceLand mobile action button reference is missing");
assert.ok(indexHtml.includes("chip-display"), "DiceLand chip HUD reference is missing");
assert.ok(indexHtml.includes("ranking-layer"), "DiceLand ranking reference is missing");
assert.ok(indexHtml.includes("BLACKJACK"), "DiceLand blackjack modal reference is missing");
assert.ok(indexHtml.includes("data-amount"), "DiceLand bet amount reference is missing");

const blackjackUi = read("src/features/blackjack/blackjackUI.js");
assert.ok(blackjackUi.includes(".bj-chip"), "DiceLand blackjack chip UI reference is missing");

const input = read("src/core/input.js");
assert.ok(input.includes("setJoystick"), "DiceLand joystick input reference is missing");
assert.ok(input.includes("onAction"), "DiceLand action input reference is missing");

console.log("DiceLand vendor check passed.");
