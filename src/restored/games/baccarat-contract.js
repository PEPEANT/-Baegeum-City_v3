import {
  RESTORED_GAMBLING_EVENT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_BACCARAT_CONTRACT_VERSION = "restored-baccarat-001";

export const RESTORED_BACCARAT_BET_TYPES = Object.freeze({
  PLAYER: "player",
  BANKER: "banker",
  TIE: "tie"
});

export const RESTORED_BACCARAT_OUTCOMES = Object.freeze({
  PLAYER: "player",
  BANKER: "banker",
  TIE: "tie"
});

const FACE_RANKS = Object.freeze(["10", "jack", "queen", "king"]);

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

export function normalizeRestoredBaccaratCard(card) {
  const rank = normalizeRank(typeof card === "string" ? card : card?.rank ?? card?.val);
  return Object.freeze({
    rank,
    suit: stringOrNull(card?.suit)
  });
}

export function scoreRestoredBaccaratHand(cards = []) {
  const normalizedCards = cards.map(normalizeRestoredBaccaratCard);
  const rawTotal = normalizedCards.reduce((total, card) => total + baccaratCardValue(card.rank), 0);
  const total = rawTotal % 10;
  return Object.freeze({
    total,
    natural: normalizedCards.length === 2 && total >= 8,
    cardCount: normalizedCards.length
  });
}

export function normalizeRestoredBaccaratBet(input = {}) {
  const type = Object.values(RESTORED_BACCARAT_BET_TYPES).includes(input.type)
    ? input.type
    : RESTORED_BACCARAT_BET_TYPES.PLAYER;
  return Object.freeze({ type, chips: chips(input.chips) });
}

export function resolveRestoredBaccaratRound({ playerCards = [], bankerCards = [], bet = {} } = {}) {
  const normalizedBet = normalizeRestoredBaccaratBet(bet);
  const player = scoreRestoredBaccaratHand(playerCards);
  const banker = scoreRestoredBaccaratHand(bankerCards);
  const outcome = compareBaccaratTotals(player.total, banker.total);
  const eventType = eventTypeForBaccaratBet(normalizedBet.type, outcome);
  return Object.freeze({
    bet: normalizedBet,
    outcome,
    player,
    banker,
    natural: player.natural || banker.natural,
    payoutChips: payoutForBaccaratBet(normalizedBet, outcome),
    eventType
  });
}

export function createRestoredBaccaratBetEnvelope(input = {}) {
  const bet = normalizeRestoredBaccaratBet(input.bet);
  return createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    actorId: input.actorId,
    venueId: input.venueId,
    gameId: "baccarat",
    roundId: input.roundId,
    tableId: input.tableId,
    amountChips: bet.chips,
    authority: input.authority,
    emotionTags: ["baccarat_bet", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || [],
    payload: { contractVersion: RESTORED_BACCARAT_CONTRACT_VERSION, bet }
  });
}

export function createRestoredBaccaratResultEnvelope(input = {}) {
  const round = resolveRestoredBaccaratRound(input);
  return Object.freeze({
    round,
    ...createRestoredGamblingEffects({
      type: round.eventType,
      actorId: input.actorId,
      venueId: input.venueId,
      gameId: "baccarat",
      roundId: input.roundId,
      tableId: input.tableId,
      outcome: `baccarat_${round.outcome}`,
      amountChips: round.payoutChips,
      authority: input.authority,
      emotionTags: defaultEmotionTags(round, input.emotionTags),
      relationshipHooks: input.relationshipHooks || ["partner_reacts_to_baccarat"],
      payload: {
        contractVersion: RESTORED_BACCARAT_CONTRACT_VERSION,
        outcome: round.outcome,
        bet: round.bet,
        playerTotal: round.player.total,
        bankerTotal: round.banker.total,
        payoutChips: round.payoutChips
      }
    })
  });
}

export function validateRestoredBaccaratContract() {
  const errors = [];
  const playerWin = resolveRestoredBaccaratRound({
    bet: { type: "player", chips: 10 },
    playerCards: ["king", "9"],
    bankerCards: ["4", "3"]
  });
  if (playerWin.outcome !== RESTORED_BACCARAT_OUTCOMES.PLAYER || playerWin.payoutChips !== 20) {
    errors.push("player bet should pay 2x including stake");
  }

  const bankerWin = resolveRestoredBaccaratRound({
    bet: { type: "banker", chips: 20 },
    playerCards: ["2", "4"],
    bankerCards: ["queen", "8"]
  });
  if (bankerWin.outcome !== RESTORED_BACCARAT_OUTCOMES.BANKER || bankerWin.payoutChips !== 39) {
    errors.push("banker bet should pay 1.95x including stake after commission");
  }

  const tieWin = resolveRestoredBaccaratRound({
    bet: { type: "tie", chips: 5 },
    playerCards: ["3", "5"],
    bankerCards: ["king", "8"]
  });
  if (tieWin.eventType !== RESTORED_GAMBLING_EVENT_TYPES.WIN || tieWin.payoutChips !== 45) {
    errors.push("tie bet should pay 9x including stake");
  }

  const tiePush = createRestoredBaccaratResultEnvelope({
    bet: { type: "player", chips: 5 },
    playerCards: ["3", "5"],
    bankerCards: ["king", "8"]
  });
  if (tiePush.round.eventType !== RESTORED_GAMBLING_EVENT_TYPES.REFUND || tiePush.round.payoutChips !== 5) {
    errors.push("player/banker bets should refund on tie");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

function normalizeRank(rank) {
  const lowered = String(rank || "").trim().toLowerCase();
  if (["a", "ace"].includes(lowered)) return "ace";
  if (["j", "jack"].includes(lowered)) return "jack";
  if (["q", "queen"].includes(lowered)) return "queen";
  if (["k", "king"].includes(lowered)) return "king";
  const number = Number(lowered);
  if (number >= 2 && number <= 10) return String(number);
  return "2";
}

function baccaratCardValue(rank) {
  if (rank === "ace") return 1;
  if (FACE_RANKS.includes(rank)) return 0;
  return Number(rank);
}

function compareBaccaratTotals(playerTotal, bankerTotal) {
  if (playerTotal > bankerTotal) return RESTORED_BACCARAT_OUTCOMES.PLAYER;
  if (bankerTotal > playerTotal) return RESTORED_BACCARAT_OUTCOMES.BANKER;
  return RESTORED_BACCARAT_OUTCOMES.TIE;
}

function eventTypeForBaccaratBet(type, outcome) {
  if (outcome === RESTORED_BACCARAT_OUTCOMES.TIE && type !== RESTORED_BACCARAT_BET_TYPES.TIE) {
    return RESTORED_GAMBLING_EVENT_TYPES.REFUND;
  }
  if (type === outcome) return RESTORED_GAMBLING_EVENT_TYPES.WIN;
  return RESTORED_GAMBLING_EVENT_TYPES.LOSS;
}

function payoutForBaccaratBet(bet, outcome) {
  if (outcome === RESTORED_BACCARAT_OUTCOMES.TIE && bet.type !== RESTORED_BACCARAT_BET_TYPES.TIE) {
    return bet.chips;
  }
  if (bet.type !== outcome) return 0;
  if (bet.type === RESTORED_BACCARAT_BET_TYPES.BANKER) return bet.chips + Math.floor(bet.chips * 0.95);
  if (bet.type === RESTORED_BACCARAT_BET_TYPES.TIE) return bet.chips * 9;
  return bet.chips * 2;
}

function defaultEmotionTags(round, extra = []) {
  const tags = ["baccarat_result"];
  if (round.eventType === RESTORED_GAMBLING_EVENT_TYPES.WIN) tags.push("win");
  else if (round.eventType === RESTORED_GAMBLING_EVENT_TYPES.REFUND) tags.push("relief");
  else tags.push("loss");
  return [...tags, ...extra];
}
