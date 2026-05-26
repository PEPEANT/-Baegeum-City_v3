export const RESTORED_DPA_TOKEN_CONTRACT_VERSION = "restored-dpa-token-001";
export const RESTORED_DPA_SYMBOL = "DPA";
export const RESTORED_DPA_DISPLAY_NAME = "디페이 아케이드";
export const RESTORED_DPA_UNIT_WON = 1000;
export const RESTORED_DPA_LEDGER_FIELD = "chips";

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function nonNegativeInteger(value) {
  return Math.max(0, Math.floor(numeric(value)));
}

export function wonToRestoredDpa(won) {
  return Math.floor(nonNegativeInteger(won) / RESTORED_DPA_UNIT_WON);
}

export function restoredDpaToWon(dpa) {
  return nonNegativeInteger(dpa) * RESTORED_DPA_UNIT_WON;
}

export function formatRestoredDpa(dpa) {
  return `${nonNegativeInteger(dpa).toLocaleString()} ${RESTORED_DPA_SYMBOL}`;
}

export function createRestoredDpaExchangeQuote(input = {}) {
  const dpa = input.dpa !== undefined ? nonNegativeInteger(input.dpa) : wonToRestoredDpa(input.won);
  const won = input.won !== undefined ? nonNegativeInteger(input.won) : restoredDpaToWon(dpa);
  const normalizedDpa = Math.min(dpa, wonToRestoredDpa(won));
  return Object.freeze({
    contractVersion: RESTORED_DPA_TOKEN_CONTRACT_VERSION,
    symbol: RESTORED_DPA_SYMBOL,
    displayName: RESTORED_DPA_DISPLAY_NAME,
    unitWon: RESTORED_DPA_UNIT_WON,
    ledgerField: RESTORED_DPA_LEDGER_FIELD,
    won: restoredDpaToWon(normalizedDpa),
    dpa: normalizedDpa,
    label: `${RESTORED_DPA_UNIT_WON.toLocaleString()}원 = 1 ${RESTORED_DPA_SYMBOL}`
  });
}

export function validateRestoredDpaTokenContract() {
  const errors = [];
  if (wonToRestoredDpa(999) !== 0) errors.push("DPA exchange must floor partial 1000 won units");
  if (wonToRestoredDpa(5000) !== 5) errors.push("5000 won should quote 5 DPA");
  if (restoredDpaToWon(7) !== 7000) errors.push("7 DPA should quote 7000 won");
  const quote = createRestoredDpaExchangeQuote({ won: 12345 });
  if (quote.dpa !== 12 || quote.won !== 12000) errors.push("exchange quote must normalize to whole DPA units");
  if (quote.ledgerField !== "chips") errors.push("DPA must bridge to the current chips ledger field during migration");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
