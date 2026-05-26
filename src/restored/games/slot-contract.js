import {
  RESTORED_GAMBLING_EVENT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_SLOT_CONTRACT_VERSION = "restored-slot-001";

export const RESTORED_SLOT_SYMBOLS = Object.freeze({
  BLANK: "blank",
  CHERRY: "cherry",
  LEMON: "lemon",
  BELL: "bell",
  BAR: "bar",
  SEVEN: "seven"
});

export const RESTORED_SLOT_RESULTS = Object.freeze({
  JACKPOT: "jackpot",
  TRIPLE: "triple",
  PAIR: "pair",
  LOSS: "loss"
});

const SYMBOL_ORDER = Object.freeze(Object.values(RESTORED_SLOT_SYMBOLS));

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function chips(value) {
  return Math.max(1, Math.round(numeric(value)));
}

export function normalizeRestoredSlotSymbol(symbol) {
  const normalized = String(symbol || "").trim().toLowerCase();
  if (SYMBOL_ORDER.includes(normalized)) return normalized;
  return RESTORED_SLOT_SYMBOLS.BLANK;
}

export function normalizeRestoredSlotReels(symbols = []) {
  const reels = [0, 1, 2].map((index) => normalizeRestoredSlotSymbol(symbols[index]));
  return Object.freeze(reels);
}

export function normalizeRestoredSlotBet(input = {}) {
  return Object.freeze({ chips: chips(input.chips) });
}

export function resolveRestoredSlotSpin({ bet = {}, symbols = [] } = {}) {
  const normalizedBet = normalizeRestoredSlotBet(bet);
  const reels = normalizeRestoredSlotReels(symbols);
  const result = classifySlotResult(reels);
  const multiplier = slotPayoutMultiplier(reels, result);
  const payoutChips = normalizedBet.chips * multiplier;
  return Object.freeze({
    bet: normalizedBet,
    reels,
    result,
    multiplier,
    payoutChips,
    eventType: payoutChips > 0 ? RESTORED_GAMBLING_EVENT_TYPES.WIN : RESTORED_GAMBLING_EVENT_TYPES.LOSS
  });
}

export function createRestoredSlotBetEnvelope(input = {}) {
  const bet = normalizeRestoredSlotBet(input.bet);
  return createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    actorId: input.actorId,
    venueId: input.venueId,
    gameId: "slot",
    roundId: input.roundId,
    tableId: input.tableId,
    amountChips: bet.chips,
    authority: input.authority,
    emotionTags: ["slot_bet", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || [],
    payload: { contractVersion: RESTORED_SLOT_CONTRACT_VERSION, bet }
  });
}

export function createRestoredSlotResultEnvelope(input = {}) {
  const spin = resolveRestoredSlotSpin(input);
  return Object.freeze({
    spin,
    ...createRestoredGamblingEffects({
      type: spin.eventType,
      actorId: input.actorId,
      venueId: input.venueId,
      gameId: "slot",
      roundId: input.roundId,
      tableId: input.tableId,
      outcome: `slot_${spin.result}`,
      amountChips: spin.payoutChips,
      authority: input.authority,
      emotionTags: defaultEmotionTags(spin, input.emotionTags),
      relationshipHooks: input.relationshipHooks || ["partner_reacts_to_slot"],
      payload: {
        contractVersion: RESTORED_SLOT_CONTRACT_VERSION,
        reels: spin.reels,
        result: spin.result,
        multiplier: spin.multiplier,
        payoutChips: spin.payoutChips
      }
    })
  });
}

export function validateRestoredSlotContract() {
  const errors = [];
  const jackpot = resolveRestoredSlotSpin({
    bet: { chips: 2 },
    symbols: ["seven", "seven", "seven"]
  });
  if (jackpot.result !== RESTORED_SLOT_RESULTS.JACKPOT || jackpot.payoutChips !== 100) {
    errors.push("three sevens should pay 50x jackpot");
  }

  const triple = resolveRestoredSlotSpin({
    bet: { chips: 3 },
    symbols: ["bar", "bar", "bar"]
  });
  if (triple.result !== RESTORED_SLOT_RESULTS.TRIPLE || triple.payoutChips !== 60) {
    errors.push("three bars should pay 20x");
  }

  const pair = createRestoredSlotResultEnvelope({
    bet: { chips: 5 },
    symbols: ["cherry", "blank", "cherry"]
  });
  if (pair.spin.result !== RESTORED_SLOT_RESULTS.PAIR || pair.spin.payoutChips !== 10) {
    errors.push("two cherries should pay 2x");
  }

  const loss = createRestoredSlotResultEnvelope({
    bet: { chips: 5 },
    symbols: ["cherry", "lemon", "bell"]
  });
  if (loss.event.type !== RESTORED_GAMBLING_EVENT_TYPES.LOSS || loss.spin.payoutChips !== 0) {
    errors.push("mixed symbols should lose");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function classifySlotResult(reels) {
  const [first, second, third] = reels;
  if (first === RESTORED_SLOT_SYMBOLS.SEVEN && first === second && second === third) return RESTORED_SLOT_RESULTS.JACKPOT;
  if (first === second && second === third && first !== RESTORED_SLOT_SYMBOLS.BLANK) return RESTORED_SLOT_RESULTS.TRIPLE;
  if (countSymbol(reels, RESTORED_SLOT_SYMBOLS.CHERRY) >= 2) return RESTORED_SLOT_RESULTS.PAIR;
  if (countSymbol(reels, RESTORED_SLOT_SYMBOLS.SEVEN) === 2) return RESTORED_SLOT_RESULTS.PAIR;
  return RESTORED_SLOT_RESULTS.LOSS;
}

function slotPayoutMultiplier(reels, result) {
  if (result === RESTORED_SLOT_RESULTS.JACKPOT) return 50;
  if (result === RESTORED_SLOT_RESULTS.TRIPLE) {
    if (reels[0] === RESTORED_SLOT_SYMBOLS.BAR) return 20;
    if (reels[0] === RESTORED_SLOT_SYMBOLS.BELL) return 10;
    return 5;
  }
  if (result === RESTORED_SLOT_RESULTS.PAIR) {
    if (countSymbol(reels, RESTORED_SLOT_SYMBOLS.SEVEN) === 2) return 3;
    return 2;
  }
  return 0;
}

function countSymbol(reels, symbol) {
  return reels.filter((reelSymbol) => reelSymbol === symbol).length;
}

function defaultEmotionTags(spin, extra = []) {
  const tags = ["slot_result"];
  if (spin.result === RESTORED_SLOT_RESULTS.JACKPOT) tags.push("jackpot");
  else if (spin.eventType === RESTORED_GAMBLING_EVENT_TYPES.WIN) tags.push("win");
  else tags.push("loss");
  return [...tags, ...extra];
}
