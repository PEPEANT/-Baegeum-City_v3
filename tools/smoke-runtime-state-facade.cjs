const assert = require("assert");
const fs = require("fs");
const path = require("path");

(async () => {
  const facade = await import("../src/systems/runtime-state-facade.js");
  const root = {};
  assert.deepStrictEqual(facade.getRuntimeState(root), {});
  assert.equal(facade.getRuntimeGame(root), null);

  const patched = facade.patchRuntimeState({ game: { scene: "city" }, economy: { chips: 10 } }, root);
  assert.equal(patched.game.scene, "city");
  assert.equal(facade.getRuntimeGame(root).scene, "city");
  assert.equal(facade.getRuntimeEconomy(root).chips, 10);

  facade.patchRuntimeState({ exchangeAtm: { open: true } }, root);
  assert.equal(facade.getRuntimeExchangeAtm(root).open, true);
  assert.equal(facade.getRuntimeGame(root).scene, "city");

  const chatPanel = fs.readFileSync(path.join(__dirname, "../src/ui/world-chat-panel.js"), "utf8");
  assert.ok(chatPanel.includes("getRuntimeGame"), "world chat panel should use the runtime facade");
  assert.equal(chatPanel.includes("window.BaegeumCity"), false, "world chat panel should not read window.BaegeumCity directly");

  const mobileControls = fs.readFileSync(path.join(__dirname, "../src/ui/mobile-action-controls.js"), "utf8");
  assert.ok(mobileControls.includes("getRuntimeGame"), "mobile action controls should use the runtime facade");
  assert.equal(mobileControls.includes("window.BaegeumCity"), false, "mobile action controls should not read window.BaegeumCity directly");

  const exchangePanel = fs.readFileSync(path.join(__dirname, "../src/ui/exchange-atm-panel.js"), "utf8");
  assert.ok(exchangePanel.includes("getRuntimeGame"), "exchange ATM panel should use the runtime facade");
  assert.ok(exchangePanel.includes("getRuntimeEconomy"), "exchange ATM panel should read economy through the runtime facade");
  assert.ok(exchangePanel.includes("patchRuntimeState"), "exchange ATM panel should publish through the runtime facade");
  assert.equal(exchangePanel.includes("window.BaegeumCity"), false, "exchange ATM panel should not read window.BaegeumCity directly");

  const oddEvenPanel = fs.readFileSync(path.join(__dirname, "../src/ui/odd-even-table-panel.js"), "utf8");
  assert.ok(oddEvenPanel.includes("getRuntimeGame"), "odd-even table panel should read game through the runtime facade");
  assert.ok(oddEvenPanel.includes("getRuntimeEconomy"), "odd-even table panel should read economy through the runtime facade");
  assert.equal(oddEvenPanel.includes("window.BaegeumCity"), false, "odd-even table panel should not read window.BaegeumCity directly");

  const interiorRuntime = fs.readFileSync(path.join(__dirname, "../src/systems/interior-interaction-runtime.js"), "utf8");
  assert.ok(interiorRuntime.includes("getRuntimeExchangeAtm"), "interior interaction runtime should read exchange ATM through the runtime facade");
  assert.equal(interiorRuntime.includes("window.BaegeumCity"), false, "interior interaction runtime should not read window.BaegeumCity directly");

  const localActionRuntime = fs.readFileSync(path.join(__dirname, "../src/systems/local-action-runtime.js"), "utf8");
  assert.ok(localActionRuntime.includes("patchRuntimeState"), "local action runtime should publish through the runtime facade");
  assert.equal(localActionRuntime.includes("window.BaegeumCity"), false, "local action runtime should not write window.BaegeumCity directly");

  const playerStatusHud = fs.readFileSync(path.join(__dirname, "../src/ui/player-status-hud.js"), "utf8");
  assert.ok(playerStatusHud.includes("patchRuntimeState"), "player status HUD should publish economy through the runtime facade");
  assert.equal(playerStatusHud.includes("window.BaegeumCity"), false, "player status HUD should not write window.BaegeumCity directly");

  const phoneShell = fs.readFileSync(path.join(__dirname, "../src/devices/phone/mammon-phone-shell.js"), "utf8");
  assert.ok(phoneShell.includes("getRuntimeState"), "phone shell should read runtime context through the runtime facade");
  assert.equal(phoneShell.includes("BaegeumCity"), false, "phone shell should not read BaegeumCity directly");

  const disPreview = fs.readFileSync(path.join(__dirname, "../src/devices/phone/dis-preview.js"), "utf8");
  assert.ok(disPreview.includes("getRuntimeState"), "DIS preview should read runtime context through the runtime facade");
  assert.equal(disPreview.includes("BaegeumCity"), false, "DIS preview should not read BaegeumCity directly");

  const cityScene = fs.readFileSync(path.join(__dirname, "../src/scenes/city-scene.js"), "utf8");
  assert.ok(cityScene.includes("patchRuntimeState"), "city scene should publish runtime state through the runtime facade");
  assert.equal(cityScene.includes("BaegeumCity"), false, "city scene should not publish BaegeumCity directly");

  console.log("Runtime state facade smoke check passed.");
})();
