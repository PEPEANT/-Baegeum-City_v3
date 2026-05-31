const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "editor.html"), "utf8");
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);

assert.ok(scripts.includes("src/tools/baegeum-world-editor.js"), "editor.html must load the world editor entry");

for (const source of scripts) {
  if (/^(https?:)?\/\//.test(source)) continue;
  const localPath = path.join(root, source);
  assert.ok(fs.existsSync(localPath), `Missing editor script: ${source}`);
}

const entry = fs.readFileSync(path.join(root, "src/tools/baegeum-world-editor.js"), "utf8");
const buildEntry = fs.readFileSync(path.join(root, "src/tools/baegeum-world-editor-build.js"), "utf8");
assert.ok(entry.includes("./baegeum-world-editor-utils.js"), "world editor entry must use split editor utils");
assert.ok(entry.includes("./baegeum-world-editor-maps.js"), "world editor entry must use split map selector helpers");
assert.ok(entry.includes("activeMapId"), "world editor debug state should expose active map id");
assert.ok(fs.existsSync(path.join(root, "src/tools/baegeum-world-editor-building-shell-editor.js")), "building shell editor helper must stay split");
assert.ok(buildEntry.includes("ensureFloatingBuildSection"), "build palette should mount outside the right panel");
assert.ok(html.includes("activeMapSelect"), "editor should expose active map selector");
assert.ok(html.includes("lockSelectionButton"), "editor actionbar should expose coordinate-lock action");
assert.ok(html.includes("lockLayerSelectionButton"), "editor actionbar should expose layer-lock action");
assert.ok(html.includes("resetSelectionButton"), "editor actionbar should expose return-to-original action");
assert.ok(html.includes("buildingShellEditor"), "editor should expose building shell name/color panel");

console.log("World editor entry smoke check passed.");
