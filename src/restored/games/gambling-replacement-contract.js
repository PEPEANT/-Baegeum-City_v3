export const RESTORED_GAMBLING_REPLACEMENT_CONTRACT_VERSION = "restored-gambling-replacement-001";

export const RESTORED_GAMBLING_EVENT_TYPES = Object.freeze({
  VENUE_VISIT: "gambling_venue_visit",
  BET_PLACED: "gambling_bet_placed",
  WIN: "gambling_win",
  LOSS: "gambling_loss",
  REFUND: "gambling_refund",
  DEBT_CREATED: "debt_created",
  COLLATERAL_POSTED: "collateral_posted",
  COLLATERAL_REDEEMED: "collateral_redeemed",
  COLLATERAL_SOLD: "collateral_sold"
});

export const RESTORED_GAMBLING_EFFECT_TYPES = Object.freeze({
  EVENT_RECORD: "gambling_event_record",
  ECONOMY_LEDGER_ENTRY: "economy_ledger_entry",
  RELATIONSHIP_EMOTION_HOOK: "relationship_emotion_hook",
  ONLINE_AUTHORITY_REQUEST: "online_authority_request"
});

export const RESTORED_GAMBLING_LEDGER_TYPES = Object.freeze({
  BET_RESERVED: "bet_reserved",
  BET_SETTLED: "bet_settled",
  BET_REFUNDED: "bet_refunded"
});

export const RESTORED_GAMBLING_AUTHORITY = Object.freeze({
  LOCAL_PROTOTYPE: "local-prototype",
  SERVER_REQUIRED: "server-required"
});

export const RESTORED_GAMBLING_GAME_IDS = Object.freeze([
  "blackjack",
  "roulette",
  "baccarat",
  "odd-even",
  "slot",
  "horse-racing",
  "pawnshop",
  "loan-office"
]);

const EVENT_TO_LEDGER_TYPE = Object.freeze({
  [RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED]: RESTORED_GAMBLING_LEDGER_TYPES.BET_RESERVED,
  [RESTORED_GAMBLING_EVENT_TYPES.WIN]: RESTORED_GAMBLING_LEDGER_TYPES.BET_SETTLED,
  [RESTORED_GAMBLING_EVENT_TYPES.LOSS]: RESTORED_GAMBLING_LEDGER_TYPES.BET_SETTLED,
  [RESTORED_GAMBLING_EVENT_TYPES.REFUND]: RESTORED_GAMBLING_LEDGER_TYPES.BET_REFUNDED
});

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function nonNegative(value) {
  return Math.max(0, Math.round(numeric(value)));
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function uniqueStrings(values = []) {
  return Object.freeze([...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))]);
}

function clonePlain(value) {
  if (!value || typeof value !== "object") return Object.freeze({});
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}

function freezeEffect(effect) {
  return Object.freeze({ ...effect, payload: Object.freeze(effect.payload || {}) });
}

export function createRestoredGamblingEvent(input = {}) {
  const type = normalizeGamblingEventType(input.type);
  const actorId = stringOrNull(input.actorId) || "player:local";
  const venueId = stringOrNull(input.venueId);
  const gameId = normalizeGamblingGameId(input.gameId);
  const roundId = stringOrNull(input.roundId);
  const tableId = stringOrNull(input.tableId);
  const stableTarget = roundId || tableId || venueId || gameId || "global";
  return Object.freeze({
    schemaVersion: RESTORED_GAMBLING_REPLACEMENT_CONTRACT_VERSION,
    id: stringOrNull(input.id) || `restored-gambling:${type}:${actorId}:${stableTarget}`,
    type,
    actorId,
    venueId,
    gameId,
    roundId,
    tableId,
    outcome: stringOrNull(input.outcome),
    amounts: Object.freeze({
      chips: nonNegative(input.amountChips),
      cash: nonNegative(input.amountCash),
      debt: nonNegative(input.debtAmount),
      collateralValue: nonNegative(input.collateralValue)
    }),
    emotionTags: uniqueStrings(input.emotionTags),
    relationshipHooks: uniqueStrings(input.relationshipHooks),
    authority: normalizeGamblingAuthority(input.authority),
    occurredAt: stringOrNull(input.occurredAt),
    payload: clonePlain(input.payload)
  });
}

export function createRestoredGamblingEffects(eventInput = {}, options = {}) {
  const event = createRestoredGamblingEvent(eventInput);
  const effects = [
    freezeEffect({
      type: RESTORED_GAMBLING_EFFECT_TYPES.EVENT_RECORD,
      targetId: event.roundId || event.tableId || event.venueId || event.actorId,
      payload: { event }
    })
  ];
  const ledgerEffect = createLedgerEffect(event, options.ledgerDeltas);
  if (ledgerEffect) effects.push(ledgerEffect);
  if (event.emotionTags.length || event.relationshipHooks.length) {
    effects.push(freezeEffect({
      type: RESTORED_GAMBLING_EFFECT_TYPES.RELATIONSHIP_EMOTION_HOOK,
      targetId: event.actorId,
      payload: {
        sourceEventId: event.id,
        eventType: event.type,
        emotionTags: event.emotionTags,
        relationshipHooks: event.relationshipHooks,
        venueId: event.venueId,
        gameId: event.gameId
      }
    }));
  }
  if (event.authority === RESTORED_GAMBLING_AUTHORITY.SERVER_REQUIRED) {
    effects.push(freezeEffect({
      type: RESTORED_GAMBLING_EFFECT_TYPES.ONLINE_AUTHORITY_REQUEST,
      targetId: event.tableId || event.venueId || event.gameId || "online:gambling",
      payload: { eventId: event.id, eventType: event.type, authority: event.authority }
    }));
  }
  return Object.freeze({ event, effects: Object.freeze(effects) });
}

export function normalizeGamblingEventType(type) {
  const allowed = Object.values(RESTORED_GAMBLING_EVENT_TYPES);
  if (allowed.includes(type)) return type;
  return RESTORED_GAMBLING_EVENT_TYPES.VENUE_VISIT;
}

export function normalizeGamblingGameId(gameId) {
  if (RESTORED_GAMBLING_GAME_IDS.includes(gameId)) return gameId;
  return null;
}

export function normalizeGamblingAuthority(authority) {
  const allowed = Object.values(RESTORED_GAMBLING_AUTHORITY);
  if (allowed.includes(authority)) return authority;
  return RESTORED_GAMBLING_AUTHORITY.LOCAL_PROTOTYPE;
}

export function validateRestoredGamblingReplacementContract() {
  const errors = [];
  for (const required of ["BET_PLACED", "WIN", "LOSS", "REFUND", "DEBT_CREATED", "COLLATERAL_POSTED", "COLLATERAL_REDEEMED", "COLLATERAL_SOLD"]) {
    if (!RESTORED_GAMBLING_EVENT_TYPES[required]) errors.push(`missing gambling event type: ${required}`);
  }
  for (const required of ["EVENT_RECORD", "ECONOMY_LEDGER_ENTRY", "RELATIONSHIP_EMOTION_HOOK", "ONLINE_AUTHORITY_REQUEST"]) {
    if (!RESTORED_GAMBLING_EFFECT_TYPES[required]) errors.push(`missing gambling effect type: ${required}`);
  }
  const placed = createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    gameId: "blackjack",
    venueId: "dice-blackjack-casino-01",
    roundId: "round:test",
    amountChips: 10,
    emotionTags: ["risk"],
    relationshipHooks: ["partner_saw_bet"]
  });
  const ledger = placed.effects.find((effect) => effect.type === RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  if (ledger?.payload?.entryType !== RESTORED_GAMBLING_LEDGER_TYPES.BET_RESERVED) {
    errors.push("bet placed must project to bet_reserved ledger vocabulary");
  }
  if (ledger?.payload?.deltas?.chips !== -10) {
    errors.push("bet placed must reserve chips with a negative chip delta");
  }
  if (!placed.effects.some((effect) => effect.type === RESTORED_GAMBLING_EFFECT_TYPES.RELATIONSHIP_EMOTION_HOOK)) {
    errors.push("emotion/relationship hooks must be preserved as effects");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function createLedgerEffect(event, overrideDeltas) {
  const entryType = EVENT_TO_LEDGER_TYPE[event.type];
  if (!entryType) return null;
  const deltas = normalizeLedgerDeltas(event, overrideDeltas);
  return freezeEffect({
    type: RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY,
    targetId: "economy:local",
    payload: {
      entryType,
      deltas,
      reason: event.type,
      venueId: event.venueId,
      tableId: event.tableId,
      roundId: event.roundId,
      authority: event.authority
    }
  });
}

function normalizeLedgerDeltas(event, overrideDeltas) {
  if (overrideDeltas) {
    return Object.freeze({
      cash: Math.round(numeric(overrideDeltas.cash)),
      bank: Math.round(numeric(overrideDeltas.bank)),
      chips: Math.round(numeric(overrideDeltas.chips))
    });
  }
  if (event.type === RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED) return Object.freeze({ cash: 0, bank: 0, chips: -event.amounts.chips });
  if (event.type === RESTORED_GAMBLING_EVENT_TYPES.WIN) return Object.freeze({ cash: 0, bank: 0, chips: event.amounts.chips });
  if (event.type === RESTORED_GAMBLING_EVENT_TYPES.REFUND) return Object.freeze({ cash: 0, bank: 0, chips: event.amounts.chips });
  return Object.freeze({ cash: 0, bank: 0, chips: 0 });
}
