import {
  formatWon,
  patchPlayerEconomy,
  readPlayerEconomy,
  savePlayerEconomy
} from "../systems/player-economy-state.js";
import { itemTypeLabel } from "../systems/inventory-master.js";
import {
  appendEconomyLedgerEntry,
  createEconomyEntry,
  projectEconomyFromLedger,
  readEconomyLedger
} from "../systems/economy-ledger.js";
import { patchRuntimeState } from "../systems/runtime-state-facade.js";

let state = readPlayerEconomy();
let ledgerEntries = readEconomyLedger();

const refs = {
  day: document.getElementById("day-display"),
  cash: document.getElementById("money-display"),
  bank: document.getElementById("bank-display"),
  chips: document.getElementById("chip-display"),
  stamina: document.getElementById("stamina-display"),
  energy: document.getElementById("energy-display"),
  hungerOriginal: document.getElementById("hunger-display"),
  bag: document.getElementById("inventory-count"),
  bagButton: document.getElementById("inventory-button"),
  bagPanel: document.getElementById("inventory-panel"),
  bagClose: document.getElementById("inventory-close-button"),
  bagSummary: document.getElementById("inventory-summary"),
  bagTabs: document.getElementById("inventory-tabs"),
  bagList: document.getElementById("inventory-list")
};

initPlayerStatusHud();

function initPlayerStatusHud() {
  if (!refs.cash) return;
  state = savePlayerEconomy(state);
  refs.bagButton?.addEventListener("click", toggleBagPanel);
  refs.bagClose?.addEventListener("click", () => setBagPanel(false));
  document.addEventListener("pointerdown", closeBagOnOutsidePress);
  document.addEventListener("keydown", closeBagOnEscape);
  window.addEventListener("baegeum:clock", (event) => {
    refs.day.textContent = event.detail?.dayLabel || "DAY 01";
  });
  render();
  publishEconomyApi();
}

function render() {
  refs.cash.textContent = `현금 ${formatWon(state.cash)}`;
  refs.bank.textContent = `계좌 ${formatWon(state.bank)}`;
  refs.chips.textContent = `칩 ${state.chips}`;
  refs.stamina.textContent = String(state.stamina);
  refs.energy.textContent = String(state.energy);
  refs.hungerOriginal.textContent = `${state.hunger}/${state.hungerMax}`;
  refs.bag.textContent = String(state.inventory.length);
  refs.bagSummary.innerHTML = buildBagSummaryMarkup();
  refs.bagTabs.innerHTML = buildBagTabsMarkup();
  refs.bagList.innerHTML = buildBagMarkup();
}

function buildBagSummaryMarkup() {
  return `
    <div class="inventory-summary-chip">
      <span class="inventory-summary-label">SLOTS</span>
      <span class="inventory-summary-value">${escapeHtml(state.inventory.length)} / ${escapeHtml(state.bagSlots)}</span>
    </div>
    <div class="inventory-summary-chip">
      <span class="inventory-summary-label">CHIPS</span>
      <span class="inventory-summary-value">${escapeHtml(state.chips)}</span>
    </div>
  `;
}

function buildBagTabsMarkup() {
  return `
    <button class="inventory-tab is-active" type="button">
      전체 <span class="inventory-tab-count">${escapeHtml(state.inventory.length)}</span>
    </button>
  `;
}

function buildBagMarkup() {
  if (!state.inventory.length) {
    return `
      <div class="inventory-empty">
        <div class="inventory-empty-title">아직 가방에 든 물건이 없음</div>
        <div class="inventory-empty-body">칩 교환소, 카지노 보상, 이벤트 아이템이 나중에 여기에 쌓임.</div>
      </div>
    `;
  }
  return state.inventory.map((item) => `
    <div class="inventory-item">
      <div class="inventory-item-main">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(itemTypeLabel(item.type))} · x${escapeHtml(item.count)}</span>
      </div>
    </div>
  `).join("");
}

function toggleBagPanel() {
  setBagPanel(refs.bagPanel.hidden);
}

function setBagPanel(open) {
  refs.bagPanel.hidden = !open;
  refs.bagPanel.setAttribute("aria-hidden", open ? "false" : "true");
  refs.bagButton.setAttribute("aria-expanded", open ? "true" : "false");
}

function closeBagOnOutsidePress(event) {
  if (refs.bagPanel.hidden) return;
  const target = event.target;
  if (refs.bagPanel.contains(target) || refs.bagButton.contains(target)) return;
  setBagPanel(false);
}

function closeBagOnEscape(event) {
  if (event.code === "Escape") setBagPanel(false);
}

function updateEconomy(patch) {
  state = patchPlayerEconomy(state, patch);
  render();
  window.dispatchEvent(new CustomEvent("baegeum:economy", { detail: getState() }));
  return getState();
}

function recordEconomyEntry(input) {
  const entry = createEconomyEntry(input);
  const nextState = projectEconomyFromLedger(state, [entry]);
  const result = appendEconomyLedgerEntry(entry);
  ledgerEntries = result.entries;
  state = savePlayerEconomy(nextState);
  render();
  window.dispatchEvent(new CustomEvent("baegeum:economy", { detail: getState() }));
  window.dispatchEvent(new CustomEvent("baegeum:economy-ledger", { detail: entry }));
  return { entry, state: getState() };
}

function getState() {
  return JSON.parse(JSON.stringify(state));
}

function publishEconomyApi() {
  patchRuntimeState({
    economy: {
      getState,
      getLedger: () => JSON.parse(JSON.stringify(ledgerEntries)),
      record: recordEconomyEntry,
      update: updateEconomy,
      render
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
