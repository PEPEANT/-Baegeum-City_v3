import {
  RESTORED_GAMBLING_AUTHORITY,
  RESTORED_GAMBLING_EVENT_TYPES,
  createRestoredGamblingEffects
} from "./gambling-replacement-contract.js";

export const RESTORED_BLACKJACK_CONTRACT_VERSION = "restored-blackjack-001";
export const RESTORED_BLACKJACK_DEALER_STAND_TOTAL = 17;
export const RESTORED_BLACKJACK_WIN_MULTIPLIER = 2;
export const RESTORED_BLACKJACK_NATURAL_MULTIPLIER = 2.5;

export const RESTORED_BLACKJACK_RESULTS = Object.freeze({
  PLAYER_BLACKJACK: "player_blackjack",
  DEALER_BLACKJACK: "dealer_blackjack",
  PLAYER_WIN: "player_win",
  PLAYER_LOSS: "player_loss",
  PUSH: "push",
  PLAYER_BUST: "player_bust",
  DEALER_BUST: "dealer_bust"
});

const FACE_RANKS = Object.freeze(["jack", "queen", "king"]);

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

export function normalizeRestoredBlackjackCard(card) {
  const rank = normalizeRank(typeof card === "string" ? card : card?.rank ?? card?.val);
  return Object.freeze({
    rank,
    suit: stringOrNull(card?.suit),
    hidden: Boolean(card?.hidden)
  });
}

export function scoreRestoredBlackjackHand(cards = []) {
  let total = 0;
  let aces = 0;
  const normalizedCards = cards.map(normalizeRestoredBlackjackCard).filter((card) => !card.hidden);
  for (const card of normalizedCards) {
    if (card.rank === "ace") {
      aces += 1;
      total += 11;
    } else if (FACE_RANKS.includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return Object.freeze({
    total,
    soft: aces > 0,
    busted: total > 21,
    natural: normalizedCards.length === 2 && total === 21,
    cardCount: normalizedCards.length
  });
}

export function compareRestoredBlackjackRound({ playerCards = [], dealerCards = [], betChips = 1 } = {}) {
  const bet = chips(betChips);
  const player = scoreRestoredBlackjackHand(playerCards);
  const dealer = scoreRestoredBlackjackHand(dealerCards);
  const result = resolveResult(player, dealer);
  return Object.freeze({
    result,
    betChips: bet,
    payoutChips: payoutForResult(result, bet),
    player,
    dealer,
    eventType: eventTypeForResult(result)
  });
}

export function createRestoredBlackjackBetEnvelope(input = {}) {
  const bet = chips(input.betChips);
  return createRestoredGamblingEffects({
    type: RESTORED_GAMBLING_EVENT_TYPES.BET_PLACED,
    actorId: input.actorId,
    venueId: input.venueId,
    gameId: "blackjack",
    roundId: input.roundId,
    tableId: input.tableId,
    amountChips: bet,
    authority: input.authority,
    emotionTags: ["blackjack_bet", ...(input.emotionTags || [])],
    relationshipHooks: input.relationshipHooks || [],
    payload: { contractVersion: RESTORED_BLACKJACK_CONTRACT_VERSION, betChips: bet }
  });
}

export function createRestoredBlackjackResultEnvelope(input = {}) {
  const outcome = compareRestoredBlackjackRound(input);
  return Object.freeze({
    outcome,
    ...createRestoredGamblingEffects({
      type: outcome.eventType,
      actorId: input.actorId,
      venueId: input.venueId,
      gameId: "blackjack",
      roundId: input.roundId,
      tableId: input.tableId,
      outcome: outcome.result,
      amountChips: outcome.payoutChips,
      authority: input.authority,
      emotionTags: defaultEmotionTags(outcome.result, input.emotionTags),
      relationshipHooks: input.relationshipHooks || ["partner_reacts_to_blackjack"],
      payload: {
        contractVersion: RESTORED_BLACKJACK_CONTRACT_VERSION,
        result: outcome.result,
        playerTotal: outcome.player.total,
        dealerTotal: outcome.dealer.total,
        betChips: outcome.betChips,
        payoutChips: outcome.payoutChips
      }
    })
  });
}

export function validateRestoredBlackjackContract() {
  const errors = [];
  const natural = compareRestoredBlackjackRound({
    betChips: 10,
    playerCards: ["ace", "king"],
    dealerCards: ["9", "7"]
  });
  if (natural.result !== RESTORED_BLACKJACK_RESULTS.PLAYER_BLACKJACK) errors.push("natural blackjack should win");
  if (natural.payoutChips !== 25) errors.push("natural blackjack should pay 3:2 plus stake after reservation");

  const push = createRestoredBlackjackResultEnvelope({
    betChips: 10,
    playerCards: ["10", "king"],
    dealerCards: ["queen", "10"]
  });
  if (push.outcome.eventType !== RESTORED_GAMBLING_EVENT_TYPES.REFUND) errors.push("push should use refund event vocabulary");

  const server = createRestoredBlackjackResultEnvelope({
    betChips: 10,
    playerCards: ["10", "9"],
    dealerCards: ["king", "8"],
    authority: RESTORED_GAMBLING_AUTHORITY.SERVER_REQUIRED
  });
  if (!server.effects.some((effect) => effect.type === "online_authority_request")) {
    errors.push("server-required blackjack results should request online authority");
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

function resolveResult(player, dealer) {
  if (player.busted) return RESTORED_BLACKJACK_RESULTS.PLAYER_BUST;
  if (player.natural && !dealer.natural) return RESTORED_BLACKJACK_RESULTS.PLAYER_BLACKJACK;
  if (dealer.natural && !player.natural) return RESTORED_BLACKJACK_RESULTS.DEALER_BLACKJACK;
  if (dealer.busted) return RESTORED_BLACKJACK_RESULTS.DEALER_BUST;
  if (player.total > dealer.total) return RESTORED_BLACKJACK_RESULTS.PLAYER_WIN;
  if (player.total < dealer.total) return RESTORED_BLACKJACK_RESULTS.PLAYER_LOSS;
  return RESTORED_BLACKJACK_RESULTS.PUSH;
}

function payoutForResult(result, bet) {
  if (result === RESTORED_BLACKJACK_RESULTS.PLAYER_BLACKJACK) {
    return Math.floor(bet * RESTORED_BLACKJACK_NATURAL_MULTIPLIER);
  }
  if (result === RESTORED_BLACKJACK_RESULTS.PLAYER_WIN || result === RESTORED_BLACKJACK_RESULTS.DEALER_BUST) {
    return bet * RESTORED_BLACKJACK_WIN_MULTIPLIER;
  }
  if (result === RESTORED_BLACKJACK_RESULTS.PUSH) return bet;
  return 0;
}

function eventTypeForResult(result) {
  if (result === RESTORED_BLACKJACK_RESULTS.PUSH) return RESTORED_GAMBLING_EVENT_TYPES.REFUND;
  if (payoutForResult(result, 1) > 0) return RESTORED_GAMBLING_EVENT_TYPES.WIN;
  return RESTORED_GAMBLING_EVENT_TYPES.LOSS;
}

function defaultEmotionTags(result, extra = []) {
  const tags = ["blackjack_result"];
  if (result === RESTORED_BLACKJACK_RESULTS.PLAYER_BLACKJACK) tags.push("big_win");
  else if (eventTypeForResult(result) === RESTORED_GAMBLING_EVENT_TYPES.WIN) tags.push("win");
  else if (result === RESTORED_BLACKJACK_RESULTS.PUSH) tags.push("relief");
  else tags.push("loss");
  return [...tags, ...extra];
}
