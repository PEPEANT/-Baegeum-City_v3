export const RESTORED_PHONE_ECOSYSTEM_VERSION = "restored-phone-ecosystem-001";

export const RESTORED_PHONE_APP_PHASES = Object.freeze([
  "live",
  "planned",
  "future_online"
]);

export const RESTORED_PHONE_APP_CATALOG = Object.freeze([
  app("news", "Baegeum News", "phone", "live", "information"),
  app("stock", "Baegeum Securities", "phone", "live", "market"),
  app("relationships", "Relationships", "phone", "live", "relationship"),
  app("futures", "Coin Futures", "smartphone", "live", "market"),
  app("app_store", "Baegeum Store", "smartphone", "live", "store"),
  app("messenger", "BaeTalk", "smartphone", "planned", "chat"),
  app("community", "Baegeum Gallery", "smartphone", "planned", "community"),
  app("rankings", "Rankings", "smartphone", "planned", "ranking"),
  app("bank", "Baegeum Bank", "phone", "planned", "finance"),
  app("pay", "D-Pay", "phone", "planned", "finance"),
  app("map", "City Map", "phone", "planned", "navigation"),
  app("online_lobby", "Online Lobby", "smartphone", "future_online", "online")
]);

export const RESTORED_PHONE_SURFACE_BOUNDARIES = Object.freeze({
  launcher: "app icons, notification dots, installed/locked states",
  app_store: "catalog browsing and install/uninstall intent only",
  messenger: "private partner DM and future player chat routing",
  relationships: "partner list, logs, dates, confession, and lover state",
  community: "virtual board posts separate from realtime chat",
  market: "news, stocks, futures, and financial alerts",
  online: "connected-only lobby entry; no fake offline lobby"
});

function app(id, label, gate, phase, domain) {
  return Object.freeze({ id, label, gate, phase, domain });
}

export function listRestoredPhoneEcosystemApps(phase = null) {
  const apps = RESTORED_PHONE_APP_CATALOG.map((item) => ({ ...item }));
  return phase ? apps.filter((item) => item.phase === phase) : apps;
}

export function getRestoredPhoneEcosystemApp(appId) {
  return RESTORED_PHONE_APP_CATALOG.find((item) => item.id === appId) || null;
}

export function listRestoredPhoneStoreCandidates() {
  return listRestoredPhoneEcosystemApps().filter((item) => item.phase !== "live");
}

export function auditRestoredPhoneAppSeparation(currentLiveIds = []) {
  const catalogLiveIds = listRestoredPhoneEcosystemApps("live").map((item) => item.id);
  const missingLive = catalogLiveIds.filter((id) => !currentLiveIds.includes(id));
  return Object.freeze({
    ok: missingLive.length === 0,
    catalogLiveIds: Object.freeze(catalogLiveIds),
    missingLive: Object.freeze(missingLive),
    plannedIds: Object.freeze(listRestoredPhoneStoreCandidates().map((item) => item.id))
  });
}

export function validateRestoredPhoneEcosystemContract() {
  const errors = [];
  const ids = new Set();
  for (const item of RESTORED_PHONE_APP_CATALOG) {
    if (ids.has(item.id)) errors.push(`duplicate phone ecosystem app: ${item.id}`);
    ids.add(item.id);
    if (!RESTORED_PHONE_APP_PHASES.includes(item.phase)) errors.push(`invalid phase: ${item.id}`);
    if (!item.label || !item.gate || !item.domain) errors.push(`missing app metadata: ${item.id}`);
  }
  for (const required of ["app_store", "messenger", "relationships", "community"]) {
    if (!ids.has(required)) errors.push(`missing required phone ecosystem app: ${required}`);
  }
  if (getRestoredPhoneEcosystemApp("community")?.domain !== "community") {
    errors.push("virtual community app must stay separate from chat.");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}
