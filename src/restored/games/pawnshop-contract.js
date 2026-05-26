import {
  RESTORED_GAMBLING_EVENT_TYPES,
  RESTORED_GAMBLING_EFFECT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_PAWNSHOP_CONTRACT_VERSION = "restored-pawnshop-001";

export const RESTORED_PAWNSHOP_STATUS = Object.freeze({
  OFFERED: "offered",
  ACTIVE: "active",
  REDEEMED: "redeemed",
  FORFEITED: "forfeited",
  SOLD: "sold"
});

export const RESTORED_PAWNSHOP_EFFECT_TYPES = Object.freeze({
  COLLATERAL_HOLD: "pawnshop_collateral_hold",
  COLLATERAL_RETURN: "pawnshop_collateral_return",
  COLLATERAL_SOLD: "pawnshop_collateral_sold",
  CASH_DELTA: "pawnshop_cash_delta"
});

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positiveInteger(value, fallback = 1) {
  const number = Math.round(numeric(value));
  return number >= 1 ? number : fallback;
}

function positiveMoney(value) {
  return Math.max(1, Math.round(numeric(value)));
}

function ratio(value, fallback) {
  const number = numeric(value);
  if (number > 0 && number <= 1) return number;
  return fallback;
}

function stringOrDefault(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function freezeEffect(effect) {
  return Object.freeze({ ...effect, payload: Object.freeze(effect.payload || {}) });
}

export function createRestoredPawnshopQuote(input = {}) {
  const actorId = stringOrDefault(input.actorId, "player:local");
  const itemId = stringOrDefault(input.itemId, "item:unknown");
  const count = positiveInteger(input.count);
  const appraisedCash = positiveMoney(input.appraisedCash);
  const loanRate = ratio(input.loanRate, 0.5);
  const feeRate = ratio(input.feeRate, 0.15);
  const loanCash = Math.max(1, Math.floor(appraisedCash * loanRate));
  const feeCash = Math.ceil(loanCash * feeRate);
  const collateralId = stringOrDefault(input.collateralId, `pawn:${actorId}:${itemId}`);
  return Object.freeze({
    contractVersion: RESTORED_PAWNSHOP_CONTRACT_VERSION,
    collateralId,
    actorId,
    itemId,
    itemName: stringOrDefault(input.itemName, itemId),
    count,
    appraisedCash,
    loanRate,
    feeRate,
    loanCash,
    feeCash,
    redeemCash: loanCash + feeCash,
    termDays: positiveInteger(input.termDays, 7),
    status: RESTORED_PAWNSHOP_STATUS.OFFERED
  });
}

export function createRestoredPawnshopPostEnvelope(input = {}) {
  const quote = createRestoredPawnshopQuote(input);
  return createPawnshopEnvelope({
    input,
    quote,
    eventType: RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_POSTED,
    status: RESTORED_PAWNSHOP_STATUS.ACTIVE,
    amountCash: quote.loanCash,
    effects: [
      collateralEffect(RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_HOLD, quote),
      cashDeltaEffect(quote, quote.loanCash)
    ]
  });
}

export function createRestoredPawnshopRedeemEnvelope(input = {}) {
  const quote = createRestoredPawnshopQuote(input);
  return createPawnshopEnvelope({
    input,
    quote,
    eventType: RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_REDEEMED,
    status: RESTORED_PAWNSHOP_STATUS.REDEEMED,
    amountCash: quote.redeemCash,
    effects: [
      cashDeltaEffect(quote, -quote.redeemCash),
      collateralEffect(RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_RETURN, quote)
    ]
  });
}

export function createRestoredPawnshopForfeitEnvelope(input = {}) {
  const quote = createRestoredPawnshopQuote(input);
  return createPawnshopEnvelope({
    input,
    quote,
    eventType: RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_SOLD,
    status: RESTORED_PAWNSHOP_STATUS.SOLD,
    amountCash: 0,
    effects: [collateralEffect(RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_SOLD, quote)]
  });
}

export function validateRestoredPawnshopContract() {
  const errors = [];
  const quote = createRestoredPawnshopQuote({ itemId: "energy-drink", appraisedCash: 10000 });
  if (quote.loanCash !== 5000 || quote.redeemCash !== 5750) errors.push("default quote should loan 50% and redeem with 15% fee");

  const post = createRestoredPawnshopPostEnvelope({ itemId: "energy-drink", appraisedCash: 10000 });
  if (post.event.type !== RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_POSTED) errors.push("post should emit collateral_posted");
  if (!hasEffect(post, RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_HOLD)) errors.push("post should hold collateral");
  if (cashDelta(post) !== 5000) errors.push("post should create positive local cash delta");
  if (hasEffect(post, RESTORED_GAMBLING_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY)) errors.push("pawnshop should not use economy ledger until debt/collateral ledger exists");

  const redeem = createRestoredPawnshopRedeemEnvelope({ itemId: "energy-drink", appraisedCash: 10000 });
  if (redeem.event.type !== RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_REDEEMED) errors.push("redeem should emit collateral_redeemed");
  if (cashDelta(redeem) !== -5750) errors.push("redeem should create negative local cash delta");
  if (!hasEffect(redeem, RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_RETURN)) errors.push("redeem should return collateral");

  const sold = createRestoredPawnshopForfeitEnvelope({ itemId: "energy-drink", appraisedCash: 10000 });
  if (sold.event.type !== RESTORED_GAMBLING_EVENT_TYPES.COLLATERAL_SOLD) errors.push("forfeit should emit collateral_sold");
  if (!hasEffect(sold, RESTORED_PAWNSHOP_EFFECT_TYPES.COLLATERAL_SOLD)) errors.push("forfeit should sell collateral");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function createPawnshopEnvelope({ input, quote, eventType, status, amountCash, effects }) {
  const payload = { ...quote, status };
  const envelope = createRestoredGamblingEffects({
    type: eventType,
    actorId: quote.actorId,
    venueId: stringOrDefault(input.venueId, "dice-pawnshop-01"),
    gameId: "pawnshop",
    roundId: input.roundId,
    tableId: input.tableId,
    amountCash,
    collateralValue: quote.appraisedCash,
    authority: input.authority,
    emotionTags: ["pawnshop_collateral", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || ["partner_reacts_to_pawnshop"],
    payload
  });
  return Object.freeze({
    quote: Object.freeze(payload),
    event: envelope.event,
    effects: Object.freeze([...envelope.effects, ...effects])
  });
}

function collateralEffect(type, quote) {
  return freezeEffect({
    type,
    targetId: quote.collateralId,
    payload: {
      collateralId: quote.collateralId,
      actorId: quote.actorId,
      itemId: quote.itemId,
      itemName: quote.itemName,
      count: quote.count,
      appraisedCash: quote.appraisedCash,
      loanCash: quote.loanCash,
      redeemCash: quote.redeemCash
    }
  });
}

function cashDeltaEffect(quote, cash) {
  return freezeEffect({
    type: RESTORED_PAWNSHOP_EFFECT_TYPES.CASH_DELTA,
    targetId: quote.actorId,
    payload: { cash }
  });
}

function hasEffect(envelope, type) {
  return envelope.effects.some((effect) => effect.type === type);
}

function cashDelta(envelope) {
  return envelope.effects.find((effect) => effect.type === RESTORED_PAWNSHOP_EFFECT_TYPES.CASH_DELTA)?.payload?.cash ?? 0;
}
