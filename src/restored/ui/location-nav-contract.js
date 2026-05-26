import {
  RESTORED_LOCATION_CONTEXT_IDS,
  listRestoredLocationContextIds
} from "../data/location-catalog.js";

export const RESTORED_LOCATION_NAV_CONTRACT_VERSION = "restored-location-nav-001";

const ACTIONS_BY_CONTEXT = Object.freeze({
  [RESTORED_LOCATION_CONTEXT_IDS.HOME_INSIDE]: Object.freeze([
    Object.freeze({ id: "myinfo", label: "내정보", icon: "👤", surface: "myinfo" }),
    Object.freeze({ id: "home", label: "집안", icon: "🏠", surface: "home" }),
    Object.freeze({ id: "go_out", label: "밖으로 나가기", icon: "🚪", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.HOME_FRONT })
  ]),
  [RESTORED_LOCATION_CONTEXT_IDS.HOME_FRONT]: Object.freeze([
    Object.freeze({ id: "fast_food", label: "패스트푸드점", icon: "🍔", surface: "place", targetPlaceId: "home:fast-food" }),
    Object.freeze({ id: "labor_office", label: "인력소", icon: "🧰", surface: "place", targetPlaceId: "home:labor-office" }),
    Object.freeze({ id: "convenience_store", label: "편의점", icon: "🏪", surface: "place", targetPlaceId: "home:convenience-store" }),
    Object.freeze({ id: "bus_stop", label: "버스정류장", icon: "🚌", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.TRAVEL }),
    Object.freeze({ id: "go_home", label: "집으로", icon: "🏠", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.HOME_INSIDE })
  ]),
  [RESTORED_LOCATION_CONTEXT_IDS.TRAVEL]: Object.freeze([
    Object.freeze({ id: "to_baegeum", label: "배금도시", icon: "🏙️", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.BAEGEUM_CITY }),
    Object.freeze({ id: "to_dice", label: "다이스시티", icon: "🎲", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.DICE_CITY }),
    Object.freeze({ id: "to_seosan", label: "서산도시", icon: "⚓", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.SEOSAN_CITY }),
    Object.freeze({ id: "go_home", label: "집으로", icon: "🏠", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.HOME_INSIDE })
  ]),
  [RESTORED_LOCATION_CONTEXT_IDS.BAEGEUM_CITY]: Object.freeze([
    Object.freeze({ id: "city_home", label: "우리집", icon: "🏠", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.HOME_INSIDE }),
    Object.freeze({ id: "job_places", label: "일자리", icon: "💼", surface: "place", targetPlaceId: "baegeum:job-street" }),
    Object.freeze({ id: "shops", label: "상점가", icon: "🛍️", surface: "shop", targetPlaceId: "baegeum:shop-street" }),
    Object.freeze({ id: "relationships", label: "인연", icon: "💕", surface: "place", targetPlaceId: "baegeum:street" }),
    Object.freeze({ id: "bus_stop", label: "이동", icon: "🚌", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.TRAVEL })
  ]),
  [RESTORED_LOCATION_CONTEXT_IDS.DICE_CITY]: Object.freeze([
    Object.freeze({ id: "casino_street", label: "카지노거리", icon: "🎰", surface: "place", targetPlaceId: "dice:casino-street" }),
    Object.freeze({ id: "pawnshop", label: "전당포", icon: "💎", surface: "place", targetPlaceId: "dice:pawnshop" }),
    Object.freeze({ id: "loan_office", label: "사채업소", icon: "💸", surface: "place", targetPlaceId: "dice:loan-office" }),
    Object.freeze({ id: "hotel", label: "호텔", icon: "🏨", surface: "place", targetPlaceId: "dice:hotel" }),
    Object.freeze({ id: "bus_stop", label: "이동", icon: "🚌", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.TRAVEL })
  ]),
  [RESTORED_LOCATION_CONTEXT_IDS.SEOSAN_CITY]: Object.freeze([
    Object.freeze({ id: "port", label: "항구", icon: "⚓", surface: "place", targetPlaceId: "seosan:port" }),
    Object.freeze({ id: "factory", label: "공장", icon: "🏭", surface: "place", targetPlaceId: "seosan:factory" }),
    Object.freeze({ id: "market", label: "시장", icon: "🧺", surface: "place", targetPlaceId: "seosan:market-street" }),
    Object.freeze({ id: "labor_office", label: "인력소", icon: "🧰", surface: "place", targetPlaceId: "seosan:labor-front" }),
    Object.freeze({ id: "bus_stop", label: "이동", icon: "🚌", surface: "navigation", targetContextId: RESTORED_LOCATION_CONTEXT_IDS.TRAVEL })
  ])
});

export function listRestoredLocationNavActions(contextId) {
  const actions = ACTIONS_BY_CONTEXT[contextId] || Object.freeze([]);
  if (contextId !== RESTORED_LOCATION_CONTEXT_IDS.BAEGEUM_CITY) return actions;
  return Object.freeze(actions.map((action) => (
    action.id === "shops" ? Object.freeze({ ...action, surface: "place" }) : action
  )));
}

export function getRestoredLocationNavAction(contextId, actionId) {
  return listRestoredLocationNavActions(contextId).find((action) => action.id === actionId) || null;
}

export function validateRestoredLocationNavContract() {
  const errors = [];
  const contextIds = new Set(listRestoredLocationContextIds());

  for (const contextId of contextIds) {
    const actions = listRestoredLocationNavActions(contextId);
    const actionIds = new Set();
    if (!actions.length) errors.push(`${contextId} actions are required`);
    if (actions.length > 5) errors.push(`${contextId} should keep mobile nav to five actions or fewer`);
    for (const action of actions) {
      if (!action.id) errors.push(`${contextId} action id is required`);
      if (actionIds.has(action.id)) errors.push(`duplicate action ${contextId}:${action.id}`);
      actionIds.add(action.id);
      if (!action.label) errors.push(`${contextId}:${action.id} label is required`);
      if (!action.surface) errors.push(`${contextId}:${action.id} surface is required`);
      if (action.targetContextId && !contextIds.has(action.targetContextId)) {
        errors.push(`${contextId}:${action.id} points to unknown context ${action.targetContextId}`);
      }
    }
  }

  return Object.freeze({ ok: errors.length === 0, errors });
}
