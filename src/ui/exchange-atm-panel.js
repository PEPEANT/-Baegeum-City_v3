import { formatWon } from "../systems/player-economy-state.js";
import { canCommitLocalGameAction, commitLocalGameAction, createChipExchangeEnvelope } from "../systems/local-action-runtime.js";
import { LEDGER_EFFECT_STATUSES, applyLocalEconomyLedgerEffect } from "../systems/local-ledger-effect.js";
import { getRuntimeEconomy, getRuntimeGame, patchRuntimeState } from "../systems/runtime-state-facade.js";

export const RATE_WON_PER_CHIP = 1000;
export const EXCHANGE_OPTIONS = Object.freeze([10, 50, 100]);

const refs = {
  panel: typeof document === "undefined" ? null : document.getElementById("exchangeAtmPanel"),
  close: typeof document === "undefined" ? null : document.getElementById("exchangeAtmClose"),
  cash: typeof document === "undefined" ? null : document.getElementById("exchangeAtmCash"),
  chips: typeof document === "undefined" ? null : document.getElementById("exchangeAtmChips"),
  chipValue: typeof document === "undefined" ? null : document.getElementById("exchangeAtmChipValue"),
  msg: typeof document === "undefined" ? null : document.getElementById("exchangeAtmMsg"),
  buttons: typeof document === "undefined" ? [] : [...document.querySelectorAll("[data-exchange-dir]")]
};

const atmState = { open: false, game: null, prop: null };

initExchangeAtmPanel();

export function resolveExchangeAtmPanelState(game, economy = {}, open = atmState.open) {
  return {
    visible: Boolean(open && game?.currentInterior && game?.playerState?.mode === "venue_lobby"),
    cash: Math.max(0, Number(economy.cash) || 0),
    chips: Math.max(0, Number(economy.chips) || 0),
    venueName: game?.currentInterior?.name || "환전 ATM"
  };
}

export function createExchangeQuote(dir, chips, economy = {}) {
  const amount = EXCHANGE_OPTIONS.includes(Number(chips)) ? Number(chips) : 10;
  const won = amount * RATE_WON_PER_CHIP;
  if (dir === "H2C") {
    const valid = (Number(economy.chips) || 0) >= amount;
    return { valid, direction: "chips_to_cash", chips: amount, cash: won, message: valid ? `-${amount}칩 / +${formatWon(won)}` : "칩부족" };
  }
  const valid = (Number(economy.cash) || 0) >= won;
  return { valid, direction: "cash_to_chips", chips: amount, cash: won, message: valid ? `-${formatWon(won)} / +${amount}칩` : "잔액부족" };
}

export function openExchangeAtm(context = {}) {
  atmState.open = true;
  atmState.game = context.game || getRuntimeGame();
  atmState.prop = context.prop || null;
  renderExchangeAtmPanel("환전할 금액(칩)을 선택하세요!");
}

export function closeExchangeAtm() {
  atmState.open = false;
  renderExchangeAtmPanel();
}

function initExchangeAtmPanel() {
  if (!refs.panel) return;
  refs.close?.addEventListener("click", closeExchangeAtm);
  refs.buttons.forEach((button) => button.addEventListener("click", () => performExchange(button.dataset.exchangeDir, button.dataset.exchangeAmount)));
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && atmState.open) closeExchangeAtm();
  });
  window.addEventListener("baegeum:economy", () => renderExchangeAtmPanel());
  patchRuntimeState({ exchangeAtm: { open: openExchangeAtm, close: closeExchangeAtm } });
  renderExchangeAtmPanel();
}

function performExchange(dir, amount) {
  const game = atmState.game || getRuntimeGame();
  const economy = getRuntimeEconomy();
  const quote = createExchangeQuote(dir, Number(amount), economy?.getState?.() || {});
  if (!game || !economy?.record) return renderExchangeAtmPanel("환전 시스템 준비 중");
  if (!quote.valid) return renderExchangeAtmPanel(quote.message);
  const envelope = createChipExchangeEnvelope({
    interior: game.currentInterior,
    prop: atmState.prop,
    playerState: game.playerState,
    contract: game.contract,
    cash: quote.cash,
    chips: quote.chips,
    direction: quote.direction
  });
  const check = canCommitLocalGameAction(game, envelope);
  if (!check.ok) return renderExchangeAtmPanel("이미 처리된 환전 요청");
  const ledgerResult = applyLocalEconomyLedgerEffect(envelope, economy);
  if (!ledgerResult.ok) return renderExchangeAtmPanel(exchangeLedgerFailureMessage(ledgerResult));
  commitLocalGameAction(game, envelope);
  renderExchangeAtmPanel(quote.message);
}

export function exchangeLedgerFailureMessage(result) {
  if (result.status === LEDGER_EFFECT_STATUSES.MISSING_ECONOMY_RECORD) return "환전 시스템 준비 중";
  if (result.status === LEDGER_EFFECT_STATUSES.MISSING_EFFECT) return "환전 기록 누락";
  return `환전 실패: ${result.reason || result.status}`;
}

function renderExchangeAtmPanel(message) {
  if (!refs.panel) return;
  const state = resolveExchangeAtmPanelState(atmState.game || getRuntimeGame(), getRuntimeEconomy()?.getState?.() || {});
  refs.panel.hidden = !state.visible;
  refs.panel.setAttribute("aria-hidden", state.visible ? "false" : "true");
  refs.cash.textContent = formatWon(state.cash);
  refs.chips.textContent = String(state.chips);
  refs.chipValue.textContent = formatWon(state.chips * RATE_WON_PER_CHIP);
  if (message) refs.msg.textContent = message;
}
