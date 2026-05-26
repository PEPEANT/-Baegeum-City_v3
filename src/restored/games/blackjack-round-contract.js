import {
  RESTORED_BLACKJACK_CONTRACT_VERSION,
  RESTORED_BLACKJACK_DEALER_STAND_TOTAL,
  compareRestoredBlackjackRound,
  createRestoredBlackjackBetEnvelope,
  createRestoredBlackjackResultEnvelope,
  normalizeRestoredBlackjackCard,
  scoreRestoredBlackjackHand
} from "./blackjack-contract.js";

export const RESTORED_BLACKJACK_ROUND_CONTRACT_VERSION = "restored-blackjack-round-001";

export const RESTORED_BLACKJACK_ROUND_STATUSES = Object.freeze({
  READY: "ready",
  PLAYER_TURN: "player_turn",
  DEALER_TURN: "dealer_turn",
  SETTLED: "settled"
});

const STANDARD_RANKS = Object.freeze(["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"]);
const STANDARD_SUITS = Object.freeze(["spade", "heart", "diamond", "club"]);

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positiveInteger(value, fallback = 1) {
  return Math.max(1, Math.round(numeric(value) || fallback));
}

function stringOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function createRestoredBlackjackShoe({ decks = 1, cards = null } = {}) {
  const source = Array.isArray(cards) ? cards : buildStandardShoe(decks);
  return Object.freeze(source.map(normalizeRestoredBlackjackCard));
}

export function createRestoredBlackjackRoundState(input = {}) {
  return freezeRound({
    schemaVersion: RESTORED_BLACKJACK_ROUND_CONTRACT_VERSION,
    rulesVersion: RESTORED_BLACKJACK_CONTRACT_VERSION,
    roundId: stringOrFallback(input.roundId, "round:blackjack:local"),
    actorId: stringOrFallback(input.actorId, "player:local"),
    venueId: stringOrFallback(input.venueId, null),
    tableId: stringOrFallback(input.tableId, null),
    betChips: positiveInteger(input.betChips),
    status: RESTORED_BLACKJACK_ROUND_STATUSES.READY,
    shoe: createRestoredBlackjackShoe({ decks: input.decks, cards: input.shoe }),
    playerCards: [],
    dealerCards: [],
    outcome: null,
    history: ["round_ready"],
    authority: input.authority
  });
}

export function createRestoredBlackjackRoundBetEnvelope(roundState) {
  const round = normalizeRound(roundState);
  return createRestoredBlackjackBetEnvelope(roundEnvelopeInput(round));
}

export function dealRestoredBlackjackRound(roundState) {
  const round = normalizeRound(roundState);
  if (round.status !== RESTORED_BLACKJACK_ROUND_STATUSES.READY) return round;
  let next = withHistory(round, "initial_deal");
  next = drawTo(next, "player");
  next = drawTo(next, "dealer");
  next = drawTo(next, "player");
  next = drawTo(next, "dealer");
  const comparison = compareRound(next);
  if (comparison.player.natural || comparison.dealer.natural) return settleWithOutcome(next, comparison);
  return freezeRound({ ...next, status: RESTORED_BLACKJACK_ROUND_STATUSES.PLAYER_TURN });
}

export function hitRestoredBlackjackRound(roundState) {
  const round = normalizeRound(roundState);
  if (!canHitRestoredBlackjackRound(round)) return round;
  const next = withHistory(drawTo(round, "player"), "player_hit");
  const player = scoreRestoredBlackjackHand(next.playerCards);
  if (player.busted) return settleWithOutcome(next, compareRound(next));
  return next;
}

export function standRestoredBlackjackRound(roundState) {
  const round = normalizeRound(roundState);
  if (!canStandRestoredBlackjackRound(round)) return round;
  let next = freezeRound({ ...withHistory(round, "player_stand"), status: RESTORED_BLACKJACK_ROUND_STATUSES.DEALER_TURN });
  while (scoreRestoredBlackjackHand(next.dealerCards).total < RESTORED_BLACKJACK_DEALER_STAND_TOTAL && next.shoe.length) {
    next = withHistory(drawTo(next, "dealer"), "dealer_draw");
  }
  return settleWithOutcome(next, compareRound(next));
}

export function createRestoredBlackjackRoundResultEnvelope(roundState) {
  const round = normalizeRound(roundState);
  if (round.status !== RESTORED_BLACKJACK_ROUND_STATUSES.SETTLED) return null;
  return createRestoredBlackjackResultEnvelope({
    ...roundEnvelopeInput(round),
    playerCards: round.playerCards,
    dealerCards: round.dealerCards
  });
}

export function canHitRestoredBlackjackRound(roundState) {
  return normalizeRound(roundState).status === RESTORED_BLACKJACK_ROUND_STATUSES.PLAYER_TURN;
}

export function canStandRestoredBlackjackRound(roundState) {
  return normalizeRound(roundState).status === RESTORED_BLACKJACK_ROUND_STATUSES.PLAYER_TURN;
}

export function validateRestoredBlackjackRoundContract() {
  const errors = [];
  const natural = dealRestoredBlackjackRound(createRestoredBlackjackRoundState({
    betChips: 10,
    shoe: ["ace", "9", "king", "7"]
  }));
  if (natural.status !== RESTORED_BLACKJACK_ROUND_STATUSES.SETTLED) errors.push("natural deal should auto-settle");
  if (natural.outcome?.result !== "player_blackjack") errors.push("natural deal should create player_blackjack outcome");
  if (createRestoredBlackjackRoundResultEnvelope(natural)?.outcome?.payoutChips !== 25) errors.push("natural result envelope should keep blackjack payout");

  const bust = hitRestoredBlackjackRound(dealRestoredBlackjackRound(createRestoredBlackjackRoundState({
    betChips: 10,
    shoe: ["10", "8", "9", "7", "5"]
  })));
  if (bust.outcome?.result !== "player_bust") errors.push("hit should settle player busts");

  const stand = standRestoredBlackjackRound(dealRestoredBlackjackRound(createRestoredBlackjackRoundState({
    betChips: 10,
    shoe: ["10", "9", "8", "6", "7"]
  })));
  if (stand.outcome?.result !== "dealer_bust") errors.push("dealer should draw until stand threshold or bust");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function buildStandardShoe(decks) {
  const output = [];
  for (let deck = 0; deck < positiveInteger(decks); deck += 1) {
    for (const suit of STANDARD_SUITS) {
      for (const rank of STANDARD_RANKS) output.push({ rank, suit });
    }
  }
  return output;
}

function normalizeRound(roundState = {}) {
  return freezeRound({
    ...roundState,
    schemaVersion: RESTORED_BLACKJACK_ROUND_CONTRACT_VERSION,
    rulesVersion: RESTORED_BLACKJACK_CONTRACT_VERSION,
    roundId: stringOrFallback(roundState.roundId, "round:blackjack:local"),
    actorId: stringOrFallback(roundState.actorId, "player:local"),
    betChips: positiveInteger(roundState.betChips),
    status: Object.values(RESTORED_BLACKJACK_ROUND_STATUSES).includes(roundState.status)
      ? roundState.status
      : RESTORED_BLACKJACK_ROUND_STATUSES.READY,
    shoe: createRestoredBlackjackShoe({ cards: roundState.shoe }),
    playerCards: (roundState.playerCards || []).map(normalizeRestoredBlackjackCard),
    dealerCards: (roundState.dealerCards || []).map(normalizeRestoredBlackjackCard),
    history: Array.isArray(roundState.history) ? roundState.history.filter(Boolean) : []
  });
}

function drawTo(round, target) {
  if (!round.shoe.length) return round;
  const [card, ...shoe] = round.shoe;
  const targetCards = target === "dealer" ? "dealerCards" : "playerCards";
  return freezeRound({
    ...round,
    shoe,
    [targetCards]: [...round[targetCards], card]
  });
}

function withHistory(round, entry) {
  return freezeRound({ ...round, history: [...round.history, entry] });
}

function compareRound(round) {
  return compareRestoredBlackjackRound({
    playerCards: round.playerCards,
    dealerCards: round.dealerCards,
    betChips: round.betChips
  });
}

function settleWithOutcome(round, outcome) {
  return freezeRound({
    ...withHistory(round, `settled:${outcome.result}`),
    status: RESTORED_BLACKJACK_ROUND_STATUSES.SETTLED,
    outcome
  });
}

function roundEnvelopeInput(round) {
  return {
    actorId: round.actorId,
    venueId: round.venueId,
    tableId: round.tableId,
    roundId: round.roundId,
    betChips: round.betChips,
    authority: round.authority
  };
}

function freezeRound(round) {
  return Object.freeze({
    ...round,
    shoe: Object.freeze([...(round.shoe || [])]),
    playerCards: Object.freeze([...(round.playerCards || [])]),
    dealerCards: Object.freeze([...(round.dealerCards || [])]),
    history: Object.freeze([...(round.history || [])])
  });
}
