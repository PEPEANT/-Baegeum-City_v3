export const RESTORED_CONSUMABLE_CONTRACT_VERSION = "restored-consumable-001";

export const RESTORED_CONSUMABLE_EFFECTS = Object.freeze({
  energy_drink: Object.freeze({
    itemId: "energy_drink",
    statId: "energy",
    amount: 20,
    label: "에너지"
  })
});

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function fail(reason, message) {
  return Object.freeze({ ok: false, reason, message });
}

export function getRestoredConsumableEffect(itemId) {
  return RESTORED_CONSUMABLE_EFFECTS[itemId] || null;
}

export function canUseRestoredConsumable(state, itemId) {
  const effect = getRestoredConsumableEffect(itemId);
  if (!effect) return fail("unsupported_item", "사용할 수 없는 아이템입니다.");
  const item = state?.luxury?.[itemId];
  if (numeric(item?.count) <= 0) return fail("missing_item", "소지품이 없습니다.");
  const stat = state?.profile?.stats?.[effect.statId];
  if (!stat) return fail("missing_stat", "회복할 능력치가 없습니다.");
  const max = Math.max(1, numeric(stat.max || 100));
  const before = Math.max(0, numeric(stat.value));
  if (before >= max) return fail("stat_full", `${effect.label}가 이미 가득합니다.`);
  return Object.freeze({ ok: true, effect, before, after: Math.min(max, before + effect.amount), max });
}

export function projectRestoredConsumableUse(state, itemId) {
  const check = canUseRestoredConsumable(state, itemId);
  if (!check.ok) return check;
  const nextState = cloneState(state);
  nextState.luxury[itemId].count = Math.max(0, numeric(nextState.luxury[itemId].count) - 1);
  nextState.profile.stats[check.effect.statId].value = check.after;
  nextState.profile.conditionLabel = check.after >= check.max ? "활력 충전" : "회복 중";
  return Object.freeze({
    ok: true,
    nextState,
    message: `${check.effect.label} +${check.after - check.before}`,
    effects: Object.freeze([
      Object.freeze({ type: "inventory_delta", itemId, count: -1 }),
      Object.freeze({ type: "player_state_patch", statId: check.effect.statId, before: check.before, after: check.after })
    ])
  });
}
