import {
  RESTORED_GAMBLING_EVENT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_ROULETTE_CONTRACT_VERSION = "restored-roulette-001";

export const RESTORED_ROULETTE_BET_TYPES = Object.freeze({
  STRAIGHT: "straight",
  RED: "red",
  BLACK: "black",
  ODD: "odd",
  EVEN: "even",
  LOW: "low",
  HIGH: "high",
  DOZEN: "dozen",
  COLUMN: "column"
});

export const RESTORED_ROULETTE_COLORS = Object.freeze({
  GREEN: "green",
  RED: "red",
  BLACK: "black"
});

const RED_NUMBERS = Object.freeze([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const EVEN_MONEY_TYPES = Object.freeze([
  RESTORED_ROULETTE_BET_TYPES.RED,
  RESTORED_ROULETTE_BET_TYPES.BLACK,
  RESTORED_ROULETTE_BET_TYPES.ODD,
  RESTORED_ROULETTE_BET_TYPES.EVEN,
  RESTORED_ROULETTE_BET_TYPES.LOW,
  RESTORED_ROULETTE_BET_TYPES.HIGH
]);

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function chips(value) {
  return Math.max(1, Math.round(numeric(value)));
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function normalizeRestoredRouletteNumber(value) {
  const number = Math.round(numeric(value));
  if (number >= 0 && number <= 36) return number;
  return 0;
}

export function getRestoredRouletteColor(number) {
  const normalized = normalizeRestoredRouletteNumber(number);
  if (normalized === 0) return RESTORED_ROULETTE_COLORS.GREEN;
  return RED_NUMBERS.includes(normalized) ? RESTORED_ROULETTE_COLORS.RED : RESTORED_ROULETTE_COLORS.BLACK;
}

export function normalizeRestoredRouletteBet(input = {}) {
  const type = Object.values(RESTORED_ROULETTE_BET_TYPES).includes(input.type)
    ? input.type
    : RESTORED_ROULETTE_BET_TYPES.STRAIGHT;
  return Object.freeze({
    type,
    chips: chips(input.chips),
    number: normalizeRestoredRouletteNumber(input.number),
    dozen: clampBand(input.dozen, 1, 3),
    column: clampBand(input.column, 1, 3)
  });
}

export function resolveRestoredRouletteSpin({ bet = {}, resultNumber = 0 } = {}) {
  const normalizedBet = normalizeRestoredRouletteBet(bet);
  const number = normalizeRestoredRouletteNumber(resultNumber);
  const won = isWinningRouletteBet(normalizedBet, number);
  return Object.freeze({
    bet: normalizedBet,
    resultNumber: number,
    color: getRestoredRouletteColor(number),
    won,
    payoutChips: won ? normalizedBet.chips * payoutMultiplier(normalizedBet.type) : 0,
    eventType: won ? RESTORED_GAMBLING_EVENT_TYPES.WIN : RESTORED_GAMBLING_EVENT_TYPES.LOSS
  });
}

export function createRestoredRouletteBetEnvelope(input = {}) {
  const bet = normalizeRestoredRouletteBet(input.bet);
  return createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    actorId: input.actorId,
    venueId: input.venueId,
    gameId: "roulette",
    roundId: input.roundId,
    tableId: input.tableId,
    amountChips: bet.chips,
    authority: input.authority,
    emotionTags: ["roulette_bet", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || [],
    payload: { contractVersion: RESTORED_ROULETTE_CONTRACT_VERSION, bet }
  });
}

export function createRestoredRouletteResultEnvelope(input = {}) {
  const spin = resolveRestoredRouletteSpin(input);
  return Object.freeze({
    spin,
    ...createRestoredGamblingEffects({
      type: spin.eventType,
      actorId: input.actorId,
      venueId: input.venueId,
      gameId: "roulette",
      roundId: input.roundId,
      tableId: input.tableId,
      outcome: spin.won ? "roulette_win" : "roulette_loss",
      amountChips: spin.payoutChips,
      authority: input.authority,
      emotionTags: [spin.won ? "win" : "loss", "roulette_result", ...(input.emotionTags || [])],
      relationshipHooks: input.relationshipHooks || ["partner_reacts_to_roulette"],
      payload: {
        contractVersion: RESTORED_ROULETTE_CONTRACT_VERSION,
        resultNumber: spin.resultNumber,
        color: spin.color,
        bet: spin.bet,
        payoutChips: spin.payoutChips
      }
    })
  });
}

export function validateRestoredRouletteContract() {
  const errors = [];
  const straight = resolveRestoredRouletteSpin({ bet: { type: "straight", number: 17, chips: 2 }, resultNumber: 17 });
  if (!straight.won || straight.payoutChips !== 72) errors.push("straight bet should pay 36x including stake");
  const red = resolveRestoredRouletteSpin({ bet: { type: "red", chips: 5 }, resultNumber: 1 });
  if (!red.won || red.payoutChips !== 10) errors.push("red bet should pay 2x including stake");
  const zero = resolveRestoredRouletteSpin({ bet: { type: "black", chips: 5 }, resultNumber: 0 });
  if (zero.won || zero.color !== RESTORED_ROULETTE_COLORS.GREEN) errors.push("zero should be green and lose outside bets");
  const column = createRestoredRouletteResultEnvelope({ bet: { type: "column", column: 2, chips: 5 }, resultNumber: 5 });
  if (!column.spin.won || column.spin.payoutChips !== 15) errors.push("column bet should pay 3x including stake");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function isWinningRouletteBet(bet, number) {
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.STRAIGHT) return bet.number === number;
  if (number === 0) return false;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.RED) return getRestoredRouletteColor(number) === RESTORED_ROULETTE_COLORS.RED;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.BLACK) return getRestoredRouletteColor(number) === RESTORED_ROULETTE_COLORS.BLACK;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.ODD) return number % 2 === 1;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.EVEN) return number % 2 === 0;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.LOW) return number >= 1 && number <= 18;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.HIGH) return number >= 19 && number <= 36;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.DOZEN) return Math.ceil(number / 12) === bet.dozen;
  if (bet.type === RESTORED_ROULETTE_BET_TYPES.COLUMN) return ((number - 1) % 3) + 1 === bet.column;
  return false;
}

function payoutMultiplier(type) {
  if (type === RESTORED_ROULETTE_BET_TYPES.STRAIGHT) return 36;
  if (type === RESTORED_ROULETTE_BET_TYPES.DOZEN || type === RESTORED_ROULETTE_BET_TYPES.COLUMN) return 3;
  if (EVEN_MONEY_TYPES.includes(type)) return 2;
  return 0;
}

function clampBand(value, min, max) {
  const number = Math.round(numeric(value));
  if (number >= min && number <= max) return number;
  return min;
}
