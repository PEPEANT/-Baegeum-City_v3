"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "iron-line");

const expectedHashes = new Map([
  ["editor.html", "dcdce4c4044d306af2ed877f8ad8e2c68615ad06d14dc508fe1af62806597d59"],
  ["map-editor.css", "255dfe16d0a81c069354a9b9ecd6afe5da9a7e2c3a88f7d00cde673d427b3ff0"],
  ["src/core/math.js", "02e00ea4472fd02c9f4631d54bd5197616502278140a152a6ad164da3519e73c"],
  ["src/data/scenery-catalog.js", "255e31cea421b19a1d76b718aabc524e03d4bfd17fc5a3ad54ed3a1c1bf89faf"],
  ["src/data/constants.js", "444902b791b36c44c132c8a20e71aa033b4b1c22c40b66c72e97ad4e50558288"],
  ["src/data/map01.js", "aa592d57912bdac909f9316ae0747882e5de79c6eb67199a89bc31cdb331d119"],
  ["src/data/map01-custom-layout.js", "d7274662087d58bfbdf01ce1794a04ed589af7779aca56340617d1749db28533"],
  ["src/tools/map-editor-utils.js", "03f43db3c11e506512feec3c9cceaaa963042fcc66b968ea59762d3a563f00d3"],
  ["src/tools/map-editor.js", "78fa6d75fc1d0708d14b14a00910e5bedd41fb970ac3623f3752e3527191b97f"],
  ["src/systems/renderer.js", "3bfd58c46b9a9a794fe04c33394da0b167e0801c61acd7325e95cddbd20b7bf3"],
  ["src/systems/renderer-minimap.js", "562fcb4c8fa64406414c852c0450366577890c7af1b2ad3d3a240c5e01a533a2"],
  ["src/systems/renderer-scenery.js", "85fbab13d842b44196dff4ada0bea7e58f24ab93be4748943a39237712b121d2"]
]);

function read(relativePath) {
  return fs.readFileSync(path.join(vendorRoot, relativePath), "utf8");
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(read(relativePath)).digest("hex");
}

for (const [relativePath, expected] of expectedHashes) {
  assert.equal(sha256(relativePath), expected, `${relativePath} differs from the vendored Iron Line source`);
}

const context = { window: {}, console };
context.window.IronLine = {};
context.IronLine = context.window.IronLine;
vm.createContext(context);

for (const file of [
  "src/core/math.js",
  "src/data/scenery-catalog.js",
  "src/data/map01.js",
  "src/data/map01-custom-layout.js"
]) {
  vm.runInContext(read(file), context, { filename: file });
}

const map = context.window.IronLine.map01;
assert.equal(map.width, 8200, "Iron Line final map width should be 8200");
assert.equal(map.height, 5600, "Iron Line final map height should be 5600");
assert.equal(map.roads.length, 6, "Iron Line road count should be 6");
assert.equal(map.obstacles.length, 36, "Iron Line obstacle count should be 36");
assert.equal(map.scenery.length, 54, "Iron Line scenery count should be 54");
assert.equal(map.navGraph.nodes.length, 37, "Iron Line nav node count should be 37");
assert.equal(map.navGraph.edges.length, 49, "Iron Line nav edge count should be 49");

console.log("Iron Line vendor check passed.");
