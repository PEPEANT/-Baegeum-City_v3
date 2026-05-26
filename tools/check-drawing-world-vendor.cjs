"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const vendorRoot = path.join(root, "vendor", "drawing-world");
const sourceCommit = "ab60cc00753aae303bde8feffebb0faf94347185";

const expectedHashes = {
  "public/src/ui/skin-presets.js": "5fb972f42a1d8b8f637ced2c338471c287f40c2dc3cff56ec8ee180f29b011b5",
  "public/src/ui/skin-fill.js": "e0c5401541a8417fddec22e52be163de828f5f1162088c7de20401cdd6faa82a",
  "public/src/ui/skin-files.js": "e0842f51d41fd2785f14aa4249e3663ab6c2c379f676c271fd3eab2a3f367a42",
  "public/src/ui/lobby.js": "3de41657a91a0ea46f79234fbeff1906e9662381ff419edf8d7424313745283a",
  "public/src/ui/chat.js": "b14a97383f2d7d5d530a7d6ba4d33398ff60507022f9222c4f8b75b22db9d5e0",
  "public/src/player-render.js": "56ee2f3e8e7822eb871c4b479d715f4bad457eb27b40032442450ec042ea1f9f",
  "public/src/config.js": "7494aae88b8877af96aa0500fd6bcd2573583ab9fe392e87c9741eac5585b3e8",
  "public/ai-bot/skin-select.js": "77b7130620d1731e63d4780f83cdce7ad5fa265d5d9ce3fdce62ccbe3d250de6",
  "public/styles/skin-editor.css": "29698a61f8eb01108694ca810c3b94d8e032038642b7bbd147cb19a2502609fe",
  "public/styles/chat.css": "0395a9030e73e0f0c4700bc30946ca8b6831bf7f86224b69f0d3983bcba60fab",
  "server/websocket.js": "312f5637ae9000a77ce8b7b14a401a8018d7656a79ce60958f2293b36f92450e",
  "server/rooms.js": "9f31f246f5243441916d5af91f10255bee99ae648e882cb52c301968bd6edba7",
  "server/protocol.js": "51a679b06123a04f3f9763d8aa2956985b5dc9cbe71ae2ca490de5c6cdcdc488"
};

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function vendorPath(relativePath) {
  return path.join(vendorRoot, ...relativePath.split("/"));
}

(async () => {
  for (const [relativePath, expected] of Object.entries(expectedHashes)) {
    const fullPath = vendorPath(relativePath);
    assert.ok(fs.existsSync(fullPath), `${relativePath} is missing from Drawing World vendor files`);
    assert.equal(hashFile(fullPath), expected, `${relativePath} hash changed from ${sourceCommit}`);
  }

  const presetsModule = await import(pathToFileURL(vendorPath("public/src/ui/skin-presets.js")).href);
  assert.equal(presetsModule.SKIN_SIZE, 32, "Drawing World skins must stay 32x32 pixels");
  assert.deepEqual(
    presetsModule.SKIN_PRESETS.map((preset) => preset.id),
    ["painter", "robot", "gpichan", "kaguya", "custom"],
    "Drawing World skin preset ids changed"
  );

  const css = fs.readFileSync(vendorPath("public/styles/skin-editor.css"), "utf8");
  assert.ok(css.includes(".skin-editor"), "skin editor CSS should contain the original editor shell");
  const chat = fs.readFileSync(vendorPath("public/src/ui/chat.js"), "utf8");
  assert.ok(chat.includes("addChatBubble"), "Drawing World chat bubble helper should stay available");
  const websocket = fs.readFileSync(vendorPath("server/websocket.js"), "utf8");
  assert.ok(websocket.includes("function handleChat"), "Drawing World server chat handler should stay available");

  console.log("Drawing World vendor check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
