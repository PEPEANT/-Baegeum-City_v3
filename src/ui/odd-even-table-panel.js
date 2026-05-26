import {
  canCommitLocalGameAction,
  commitLocalGameAction,
  createOddEvenBetReserveEnvelope
} from "../systems/local-action-runtime.js";
import { LEDGER_EFFECT_STATUSES, applyLocalEconomyLedgerEffect } from "../systems/local-ledger-effect.js";
import { getRuntimeEconomy, getRuntimeGame } from "../systems/runtime-state-facade.js";

const refs = {
  panel: typeof document === "undefined" ? null : document.getElementById("oddEvenTablePanel"),
  venue: typeof document === "undefined" ? null : document.getElementById("oddEvenVenueLabel"),
  chips: typeof document === "undefined" ? null : document.getElementById("oddEvenChipStatus"),
  start: typeof document === "undefined" ? null : document.getElementById("oddEvenStartButton"),
  hint: typeof document === "undefined" ? null : document.getElementById("oddEvenHint"),
  picks: typeof document === "undefined" ? [] : [...document.querySelectorAll("[data-odd-even-pick]")],
  bets: typeof document === "undefined" ? [] : [...document.querySelectorAll("[data-chip-option]")]
};

const selection = { pick: null, chips: 10, reserved: null };

initOddEvenTablePanel();

export function resolveOddEvenPanelState(game, economy = {}, currentSelection = selection) {
  const visible = game?.playerState?.mode === "table_seated" && game?.currentInterior?.gameType === "odd-even";
  const chips = Math.max(0, Number(economy.chips) || 0);
  const selectedPick = currentSelection.pick === "even" ? "even" : currentSelection.pick === "odd" ? "odd" : null;
  const selectedChips = Math.max(1, Math.round(Number(currentSelection.chips) || 10));
  const reserved = currentSelection.reserved || null;
  return {
    visible,
    venueName: game?.playerState?.venueName || game?.currentInterior?.name || "홀짝카지노",
    tableId: game?.playerState?.tableId || null,
    chips,
    selectedPick,
    selectedChips,
    reserved,
    canStart: Boolean(visible && selectedPick && chips >= selectedChips && !reserved)
  };
}

export function createOddEvenHintText(state) {
  if (state.reserved) return `예약 완료: ${state.reserved.label} · ${state.reserved.chips}칩`;
  if (!state.selectedPick) return "홀/짝을 먼저 고르세요. 아직 결과는 굴리지 않습니다.";
  if (state.chips < state.selectedChips) return `칩 ${state.selectedChips}개가 필요함. 환전 ATM에서 먼저 교환.`;
  return `${state.selectedPick === "odd" ? "홀" : "짝"} · 칩 ${state.selectedChips} 예약 가능`;
}

function initOddEvenTablePanel() {
  if (!refs.panel) return;
  refs.picks.forEach((button) => button.addEventListener("click", () => {
    selection.pick = button.dataset.oddEvenPick;
    renderOddEvenTablePanel();
  }));
  refs.bets.forEach((button) => button.addEventListener("click", () => {
    selection.chips = Number(button.dataset.chipOption) || 10;
    renderOddEvenTablePanel();
  }));
  refs.start?.addEventListener("click", performOddEvenBetReservation);
  requestAnimationFrame(renderOddEvenTablePanel);
}

function performOddEvenBetReservation() {
  const game = getRuntimeGame();
  const economy = getRuntimeEconomy();
  const state = resolveOddEvenPanelState(game, economy?.getState?.() || {});
  if (!state.canStart) return renderOddEvenTablePanel(createOddEvenHintText(state));
  const envelope = createOddEvenBetReserveEnvelope({
    interior: game.currentInterior,
    playerState: game.playerState,
    contract: game.contract,
    pick: selection.pick,
    chips: selection.chips
  });
  const check = canCommitLocalGameAction(game, envelope);
  if (!check.ok) return renderOddEvenTablePanel("이미 처리된 베팅 요청");
  const ledgerResult = applyLocalEconomyLedgerEffect(envelope, economy);
  if (!ledgerResult.ok) return renderOddEvenTablePanel(oddEvenLedgerFailureMessage(ledgerResult));
  commitLocalGameAction(game, envelope);
  selection.reserved = {
    roundId: envelope.action.payload.roundId,
    label: selection.pick === "odd" ? "홀" : "짝",
    chips: selection.chips
  };
  renderOddEvenTablePanel("베팅 예약 완료. 결과 정산은 아직 연결하지 않았습니다.");
}

export function oddEvenLedgerFailureMessage(result) {
  if (result.status === LEDGER_EFFECT_STATUSES.MISSING_ECONOMY_RECORD) return "베팅 시스템 준비 중";
  if (result.status === LEDGER_EFFECT_STATUSES.MISSING_EFFECT) return "베팅 기록 누락";
  return `베팅 예약 실패: ${result.reason || result.status}`;
}

function renderOddEvenTablePanel(message) {
  if (!refs.panel) return;
  const game = getRuntimeGame();
  const economy = getRuntimeEconomy()?.getState?.() || {};
  const state = resolveOddEvenPanelState(game, economy);
  refs.panel.hidden = !state.visible;
  refs.panel.setAttribute("aria-hidden", state.visible ? "false" : "true");
  if (refs.venue) refs.venue.textContent = state.venueName;
  if (refs.chips) refs.chips.textContent = `칩 ${state.chips}`;
  syncButtons();
  if (refs.start) {
    refs.start.disabled = !state.canStart;
    refs.start.textContent = state.reserved ? "예약 완료" : "베팅 예약";
  }
  if (refs.hint) refs.hint.textContent = message || createOddEvenHintText(state);
  requestAnimationFrame(renderOddEvenTablePanel);
}

function syncButtons() {
  refs.picks.forEach((button) => button.classList.toggle("is-active", button.dataset.oddEvenPick === selection.pick));
  refs.bets.forEach((button) => button.classList.toggle("is-active", Number(button.dataset.chipOption) === selection.chips));
}
