const assert = require("assert");

(async () => {
  const lockModule = await import("../src/tools/baegeum-world-editor-selection-lock.js");
  const state = {
    selected: { type: "scenery", index: 0 },
    map: {
      scenery: [{ id: "bench:0001", x: 100, y: 100 }],
      obstacles: [{ id: "building:0001", x: 20, y: 20 }]
    }
  };

  assert.strictEqual(lockModule.isSelectionLocked(state), false);
  assert.strictEqual(lockModule.isSelectionLayerLocked(state), false);

  assert.strictEqual(lockModule.toggleSelectionLock(state), true);
  assert.strictEqual(lockModule.isSelectionLocked(state), true);
  assert.strictEqual(lockModule.isMoveLocked(state, "scenery:0", state.map.scenery[0]), true);
  assert.strictEqual(lockModule.isMoveLocked(state, "obstacle:0", state.map.obstacles[0]), false);

  assert.strictEqual(lockModule.toggleSelectionLock(state), false);
  assert.strictEqual(lockModule.isMoveLocked(state, "scenery:0", state.map.scenery[0]), false);

  assert.strictEqual(lockModule.toggleSelectionLayerLock(state), true);
  assert.strictEqual(lockModule.isSelectionLayerLocked(state), true);
  assert.strictEqual(lockModule.isMoveLocked(state, "scenery:0", state.map.scenery[0]), true);
  assert.strictEqual(lockModule.isMoveLocked(state, "scenery:4", { id: "bench:0005" }), true);
  assert.strictEqual(lockModule.isMoveLocked(state, "obstacle:0", state.map.obstacles[0]), false);

  state.selected = { type: "obstacle", index: 0 };
  assert.strictEqual(lockModule.isSelectionLayerLocked(state), false);

  console.log("World editor selection lock smoke check passed.");
})();
