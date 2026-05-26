function getPhoneAppRegistry(targetState = state) {
  const manifestGetters = [
    typeof getDisAppManifest === "function" ? getDisAppManifest : null,
    typeof getMarketAppManifest === "function" ? getMarketAppManifest : null,
    typeof getNewsAppManifest === "function" ? getNewsAppManifest : null,
    typeof getPlayStoreAppManifest === "function" ? getPlayStoreAppManifest : null,
    typeof getBusAppManifest === "function" ? getBusAppManifest : null,
    typeof getCallAppManifest === "function" ? getCallAppManifest : null,
    typeof getGalleryAppManifest === "function" ? getGalleryAppManifest : null,
    typeof getBankAppManifest === "function" ? getBankAppManifest : null,
    typeof getJobsAppManifest === "function" ? getJobsAppManifest : null,
    typeof getDeliveryAppManifest === "function" ? getDeliveryAppManifest : null,
    typeof getStocksAppManifest === "function" ? getStocksAppManifest : null,
    typeof getCoinAppManifest === "function" ? getCoinAppManifest : null,
    typeof getVideoAppManifest === "function" ? getVideoAppManifest : null,
  ].filter(Boolean);

  return manifestGetters
    .map((getManifest) => getManifest(targetState))
    .filter((manifest) => manifest && manifest.id)
    .map((manifest) => {
      const id = normalizePhoneAppId(manifest.id);
      return {
        ...manifest,
        id,
        openRoute: normalizePhoneRoute(manifest.openRoute || `${id}/home`),
      };
    });
}

function getPhoneAppManifest(appId, targetState = state) {
  const normalizedAppId = normalizePhoneAppId(appId);
  return getPhoneAppRegistry(targetState).find((manifest) => manifest.id === normalizedAppId) || null;
}

function getPhoneAppManifestByAction(actionId, targetState = state) {
  const normalizedActionId = String(actionId || "").trim();
  return getPhoneAppRegistry(targetState).find((manifest) => manifest.primaryActionId === normalizedActionId) || null;
}

function canOpenPhoneApp(appId, targetState = state) {
  const manifest = getPhoneAppManifest(appId, targetState);

  if (!manifest || !targetState?.hasPhone) {
    return false;
  }

  if (typeof isPhoneAppInstalled === "function" && !isPhoneAppInstalled(appId, targetState)) {
    return false;
  }

  if (typeof manifest.isAvailable === "function") {
    return Boolean(manifest.isAvailable(targetState));
  }

  return typeof canUsePhoneApps === "function"
    ? canUsePhoneApps(targetState)
    : true;
}

function getInstalledPhoneAppRegistry(targetState = state) {
  const registry = getPhoneAppRegistry(targetState);
  const installedAppIds = typeof getInstalledPhoneAppIds === "function"
    ? getInstalledPhoneAppIds(targetState)
    : [];

  return installedAppIds
    .map((appId) => registry.find((manifest) => manifest.id === appId))
    .filter(Boolean);
}

function getPhoneStoreCatalog(targetState = state) {
  return getPhoneAppRegistry(targetState).filter((manifest) => (
    manifest.installable
    && (typeof isPhoneAppInstalled !== "function" || !isPhoneAppInstalled(manifest.id, targetState))
  ));
}

function buildPhoneRouteScreenMarkup(route, options = {}, targetState = state) {
  const routeInfo = parsePhoneRoute(route);
  const manifest = getPhoneAppManifest(routeInfo.appId, targetState);

  if (!manifest) {
    return '<div class="phone-job-empty">앱 화면을 불러오지 못했습니다.</div>';
  }

  if (typeof manifest.buildScreenMarkup === "function") {
    const screenMarkup = manifest.buildScreenMarkup({
      ...options,
      route: routeInfo.route,
      appId: routeInfo.appId,
      screenId: routeInfo.screenId,
      targetState,
    });

    const screenClasses = [
      "phone-route-screen",
      manifest.screenMode === "fullbleed" ? "is-fullbleed" : "",
      routeInfo.appId ? `is-app-${routeInfo.appId}` : "",
    ].filter(Boolean).join(" ");

    return `
      <div
        class="${screenClasses}"
        data-phone-app-root="${routeInfo.appId || ""}"
        data-phone-screen-id="${routeInfo.screenId || "home"}"
      >
        ${screenMarkup}
      </div>
    `;
  }

  return '<div class="phone-job-empty">앱 화면 준비 중입니다.</div>';
}
