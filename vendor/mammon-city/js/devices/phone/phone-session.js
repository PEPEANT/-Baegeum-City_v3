const PHONE_APP_ID_ALIASES = {
  youtube: "video",
  phone: "call",
  internet: "dis",
  browser: "dis",
  store: "playstore",
};

const PHONE_DEFAULT_INSTALLED_APPS = ["bank", "dis", "news", "playstore", "call", "gallery"];
const PHONE_OPTIONAL_INSTALL_APP_IDS = new Set(["market", "jobs", "bus"]);
const PHONE_REMOVED_APP_IDS = new Set(["casino"]);

function normalizePhoneAppId(appId = "") {
  const rawAppId = String(appId || "").trim().toLowerCase();

  if (!rawAppId || rawAppId === "home") {
    return "";
  }

  return PHONE_APP_ID_ALIASES[rawAppId] || rawAppId;
}

function parsePhoneRoute(route = "home") {
  const rawRoute = String(route || "").trim();

  if (!rawRoute || rawRoute === "home") {
    return {
      route: "home",
      appId: "",
      screenId: "",
    };
  }

  const [rawAppId, rawScreenId] = rawRoute.split("/");
  const appId = normalizePhoneAppId(rawAppId);

  if (!appId) {
    return {
      route: "home",
      appId: "",
      screenId: "",
    };
  }

  const screenId = String(rawScreenId || "home").trim().toLowerCase() || "home";
  return {
    route: `${appId}/${screenId}`,
    appId,
    screenId,
  };
}

function normalizePhoneRoute(route = "home") {
  return parsePhoneRoute(route).route;
}

function isPhoneHomeRoute(route = "home") {
  return parsePhoneRoute(route).appId === "";
}

function createDefaultInstalledPhoneApps() {
  return [...PHONE_DEFAULT_INSTALLED_APPS];
}

function createDefaultManualPhoneInstalledApps() {
  return [];
}

function normalizeManualPhoneAppIds(appIds) {
  const source = Array.isArray(appIds) ? appIds : [];
  const normalized = [];

  source.forEach((appId) => {
    const normalizedAppId = normalizePhoneAppId(appId);
    if (
      !normalizedAppId
      || PHONE_REMOVED_APP_IDS.has(normalizedAppId)
      || !PHONE_OPTIONAL_INSTALL_APP_IDS.has(normalizedAppId)
      || normalized.includes(normalizedAppId)
    ) {
      return;
    }
    normalized.push(normalizedAppId);
  });

  return normalized;
}

function normalizeInstalledPhoneAppIds(appIds, manualInstalledApps = []) {
  const source = Array.isArray(appIds) ? appIds : [];
  const normalizedManualApps = normalizeManualPhoneAppIds(manualInstalledApps);
  const optionalAllowed = new Set(normalizedManualApps);
  const normalized = [];

  [...PHONE_DEFAULT_INSTALLED_APPS, ...source].forEach((appId) => {
    const normalizedAppId = normalizePhoneAppId(appId);
    if (
      !normalizedAppId
      || PHONE_REMOVED_APP_IDS.has(normalizedAppId)
      || normalized.includes(normalizedAppId)
      || (PHONE_OPTIONAL_INSTALL_APP_IDS.has(normalizedAppId) && !optionalAllowed.has(normalizedAppId))
    ) {
      return;
    }
    normalized.push(normalizedAppId);
  });

  return normalized;
}

function createDefaultPhoneDeviceState() {
  return {
    minimized: true,
    stageExpanded: false,
    route: "home",
    usedToday: false,
    installedApps: createDefaultInstalledPhoneApps(),
    manualInstalledApps: createDefaultManualPhoneInstalledApps(),
  };
}

function syncPhoneSessionState(targetState = state) {
  if (!targetState) {
    return createDefaultPhoneDeviceState();
  }

  const defaults = createDefaultPhoneDeviceState();
  const devices = targetState.devices && typeof targetState.devices === "object"
    ? targetState.devices
    : {};
  const nested = devices.phone && typeof devices.phone === "object"
    ? devices.phone
    : {};
  const legacyRoute = typeof nested.route === "string" && nested.route
    ? nested.route
    : (typeof targetState.phoneView === "string" && targetState.phoneView ? targetState.phoneView : "home");
  const manualInstalledApps = normalizeManualPhoneAppIds(
    Array.isArray(targetState.phoneManualInstalledApps)
      ? targetState.phoneManualInstalledApps
      : nested.manualInstalledApps,
  );
  const resolvedRoute = normalizePhoneRoute(
    legacyRoute,
  );
  const installedApps = normalizeInstalledPhoneAppIds(
    Array.isArray(targetState.installedPhoneApps)
      ? targetState.installedPhoneApps
      : nested.installedApps,
    manualInstalledApps,
  );
  const routeInfo = parsePhoneRoute(resolvedRoute);
  const safeRoute = PHONE_REMOVED_APP_IDS.has(routeInfo.appId)
    ? "home"
    : routeInfo.route;
  const resolved = {
    minimized: typeof targetState.phoneMinimized === "boolean"
      ? targetState.phoneMinimized
      : (typeof nested.minimized === "boolean" ? nested.minimized : defaults.minimized),
    stageExpanded: typeof targetState.phoneStageExpanded === "boolean"
      ? targetState.phoneStageExpanded
      : (typeof nested.stageExpanded === "boolean" ? nested.stageExpanded : defaults.stageExpanded),
    route: safeRoute,
    usedToday: typeof targetState.phoneUsedToday === "boolean"
      ? targetState.phoneUsedToday
      : (typeof nested.usedToday === "boolean" ? nested.usedToday : defaults.usedToday),
    installedApps,
    manualInstalledApps,
  };

  targetState.devices = {
    ...devices,
    phone: resolved,
  };
  targetState.phoneMinimized = resolved.minimized;
  targetState.phoneStageExpanded = resolved.stageExpanded;
  targetState.phoneView = safeRoute;
  targetState.phoneUsedToday = resolved.usedToday;
  targetState.installedPhoneApps = [...installedApps];
  targetState.phoneManualInstalledApps = [...manualInstalledApps];

  return resolved;
}

function getPhoneSessionState(targetState = state) {
  return syncPhoneSessionState(targetState);
}

function patchPhoneSession(targetState = state, patch = {}) {
  if (!targetState) {
    return createDefaultPhoneDeviceState();
  }

  const devices = targetState.devices && typeof targetState.devices === "object"
    ? targetState.devices
    : {};
  const currentPhoneState = syncPhoneSessionState(targetState);
  const nextPhoneState = {
    ...currentPhoneState,
    ...patch,
    route: Object.prototype.hasOwnProperty.call(patch, "route")
      ? normalizePhoneRoute(patch.route)
      : currentPhoneState.route,
    manualInstalledApps: Object.prototype.hasOwnProperty.call(patch, "manualInstalledApps")
      ? normalizeManualPhoneAppIds(patch.manualInstalledApps)
      : [...(currentPhoneState.manualInstalledApps || [])],
    installedApps: Object.prototype.hasOwnProperty.call(patch, "installedApps")
      ? normalizeInstalledPhoneAppIds(
        patch.installedApps,
        Object.prototype.hasOwnProperty.call(patch, "manualInstalledApps")
          ? patch.manualInstalledApps
          : currentPhoneState.manualInstalledApps,
      )
      : normalizeInstalledPhoneAppIds(
        currentPhoneState.installedApps,
        Object.prototype.hasOwnProperty.call(patch, "manualInstalledApps")
          ? patch.manualInstalledApps
          : currentPhoneState.manualInstalledApps,
      ),
  };
  const routeInfo = parsePhoneRoute(nextPhoneState.route);

  targetState.devices = {
    ...devices,
    phone: nextPhoneState,
  };
  targetState.phoneMinimized = nextPhoneState.minimized;
  targetState.phoneStageExpanded = nextPhoneState.stageExpanded;
  targetState.phoneView = routeInfo.route;
  targetState.phoneUsedToday = nextPhoneState.usedToday;
  targetState.installedPhoneApps = [...nextPhoneState.installedApps];
  targetState.phoneManualInstalledApps = [...nextPhoneState.manualInstalledApps];

  return nextPhoneState;
}

function resetPhoneSessionForDay(targetState = state) {
  const phoneState = getPhoneSessionState(targetState);
  return patchPhoneSession(targetState, {
    minimized: phoneState.minimized,
    stageExpanded: false,
    route: "home",
    usedToday: false,
  });
}

function getInstalledPhoneAppIds(targetState = state) {
  return [...getPhoneSessionState(targetState).installedApps];
}

function isPhoneAppInstalled(appId, targetState = state) {
  const normalizedAppId = normalizePhoneAppId(appId);
  return normalizedAppId
    ? getInstalledPhoneAppIds(targetState).includes(normalizedAppId)
    : false;
}

function installPhoneApp(appId, targetState = state) {
  const normalizedAppId = normalizePhoneAppId(appId);
  if (!normalizedAppId || isPhoneAppInstalled(normalizedAppId, targetState)) {
    return false;
  }

  const installedApps = [...getInstalledPhoneAppIds(targetState), normalizedAppId];
  const phoneState = getPhoneSessionState(targetState);
  const manualInstalledApps = PHONE_OPTIONAL_INSTALL_APP_IDS.has(normalizedAppId)
    ? [...(phoneState.manualInstalledApps || []), normalizedAppId]
    : [...(phoneState.manualInstalledApps || [])];
  patchPhoneSession(targetState, { installedApps, manualInstalledApps });
  return true;
}
