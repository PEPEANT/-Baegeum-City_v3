"use strict";

const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");

async function load(relativePath) {
  return import(pathToFileURL(path.join(root, relativePath)).href);
}

(async () => {
  const {
    GAME_ACTION_TYPES,
    GAME_EFFECT_TYPES,
    canExecuteGameAction,
    createActionEnvelope,
    createGameAction,
    createGameEffect
  } = await load("src/systems/game-action-master.js");

  const action = createGameAction({
    type: GAME_ACTION_TYPES.EXCHANGE_CHIPS,
    requestId: "req:chip-exchange-001",
    actorId: "player:test",
    source: "mobile_action",
    targetId: "object:chip-counter-001",
    interactionId: "use:chip-counter-001",
    payload: { cash: -10000, chips: 10 },
    context: { channelId: "venue:chip-exchange-01", mapVersion: "baegeum-city-v2-map-001" }
  });
  assert.equal(action.requestId, "req:chip-exchange-001", "requestId should stay stable for dedupe");
  assert.equal(action.context.channelId, "venue:chip-exchange-01", "action should keep channel context");
  assert.equal(canExecuteGameAction(action, []).ok, true, "fresh action should execute");
  assert.equal(canExecuteGameAction(action, [action.requestId]).reason, "duplicate_action", "same request should not execute twice");

  const effect = createGameEffect({
    type: GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY,
    actionId: action.requestId,
    payload: { entryType: "chip_exchange", deltas: { cash: -10000, chips: 10 } }
  });
  const envelope = createActionEnvelope({ action, effects: [effect] });
  assert.equal(envelope.effects[0].actionId, action.requestId, "effects should be tied to action requestId");

  assert.throws(() => createActionEnvelope({
    action,
    effects: [{ type: GAME_EFFECT_TYPES.UI_MESSAGE, actionId: "req:other-action" }]
  }), /does not belong/, "foreign effects should be rejected");

  console.log("Game action master smoke check passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
