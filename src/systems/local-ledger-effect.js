import { GAME_EFFECT_TYPES } from "./game-action-master.js";

export const LEDGER_EFFECT_STATUSES = Object.freeze({
  OK: "ok",
  MISSING_EFFECT: "missing_effect",
  MISSING_ECONOMY_RECORD: "missing_economy_record",
  RECORD_FAILED: "record_failed"
});

export function applyLocalEconomyLedgerEffect(envelope, economy) {
  const effect = envelope?.effects?.find((item) => item.type === GAME_EFFECT_TYPES.ECONOMY_LEDGER_ENTRY);
  if (!effect) return ledgerEffectResult(false, LEDGER_EFFECT_STATUSES.MISSING_EFFECT, "No economy ledger effect found.");
  if (!economy?.record) {
    return ledgerEffectResult(false, LEDGER_EFFECT_STATUSES.MISSING_ECONOMY_RECORD, "Runtime economy recorder is unavailable.", effect);
  }
  try {
    const recordResult = economy.record(effect.payload);
    return { ok: true, status: LEDGER_EFFECT_STATUSES.OK, reason: "ok", effect, recordResult, error: null };
  } catch (error) {
    return ledgerEffectResult(false, LEDGER_EFFECT_STATUSES.RECORD_FAILED, String(error?.message || error), effect, error);
  }
}

function ledgerEffectResult(ok, status, reason, effect = null, error = null) {
  return {
    ok,
    status,
    reason,
    effect,
    recordResult: null,
    error: error ? String(error?.message || error) : null
  };
}
