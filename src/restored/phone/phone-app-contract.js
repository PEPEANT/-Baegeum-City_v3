export const RESTORED_PHONE_APP_CONTRACT_VERSION = "restored-phone-app-002";

export const RESTORED_PHONE_APP_GATES = Object.freeze(["phone", "smartphone"]);

export const RESTORED_PHONE_APPS = Object.freeze([
  Object.freeze({ id: "news", label: "뉴스", icon: "📰", gate: "phone", domain: "news" }),
  Object.freeze({ id: "stock", label: "주식", icon: "📈", gate: "phone", domain: "market" }),
  Object.freeze({ id: "relationships", label: "인연", icon: "💕", gate: "phone", domain: "relationship" }),
  Object.freeze({ id: "app_store", label: "스토어", icon: "🛒", gate: "smartphone", domain: "store" }),
  Object.freeze({ id: "futures", label: "코인선물", icon: "⚡", gate: "smartphone", domain: "futures" })
]);

export function listRestoredPhoneApps() {
  return RESTORED_PHONE_APPS.map((app) => ({ ...app }));
}

export function listRestoredPhoneAppIds() {
  return RESTORED_PHONE_APPS.map((app) => app.id);
}

export function getRestoredPhoneApp(appId) {
  return RESTORED_PHONE_APPS.find((app) => app.id === appId) || null;
}

export function getRestoredPhoneAppGate(appId) {
  return getRestoredPhoneApp(appId)?.gate || null;
}

export function canUseRestoredPhoneApp(appId, device = {}) {
  const app = getRestoredPhoneApp(appId);
  if (!app) return false;
  if (app.gate === "smartphone") return Boolean(device.hasSmartPhone);
  if (app.gate === "phone") return Boolean(device.hasPhone);
  return false;
}

export function listUsableRestoredPhoneApps(device = {}) {
  return listRestoredPhoneApps().filter((app) => canUseRestoredPhoneApp(app.id, device));
}

export function validateRestoredPhoneAppContract() {
  const errors = [];
  const ids = new Set();
  for (const app of RESTORED_PHONE_APPS) {
    if (!app.id) errors.push("phone app id is required");
    if (ids.has(app.id)) errors.push(`duplicate phone app: ${app.id}`);
    ids.add(app.id);
    if (!RESTORED_PHONE_APP_GATES.includes(app.gate)) {
      errors.push(`invalid phone app gate: ${app.id}`);
    }
    if (!app.label || !app.icon || !app.domain) {
      errors.push(`phone app display data missing: ${app.id}`);
    }
  }
  for (const required of ["news", "stock", "relationships", "app_store", "futures"]) {
    if (!ids.has(required)) errors.push(`missing phone app: ${required}`);
  }
  if (getRestoredPhoneAppGate("relationships") !== "phone") {
    errors.push("relationships app must require phone");
  }
  if (getRestoredPhoneAppGate("futures") !== "smartphone") {
    errors.push("futures app must require smartphone");
  }
  if (getRestoredPhoneAppGate("app_store") !== "smartphone") {
    errors.push("app_store must require smartphone");
  }
  return Object.freeze({ ok: errors.length === 0, errors });
}
