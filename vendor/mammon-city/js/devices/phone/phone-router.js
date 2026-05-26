function openPhoneRoute(route, targetState = state) {
  if (!targetState?.hasPhone) {
    return false;
  }

  const routeInfo = typeof parsePhoneRoute === "function"
    ? parsePhoneRoute(route)
    : { route: route === "jobs" ? "jobs/home" : "home", appId: route === "jobs" ? "jobs" : "" };

  if (routeInfo.appId && typeof canOpenPhoneApp === "function" && !canOpenPhoneApp(routeInfo.appId, targetState)) {
    return false;
  }

  patchPhoneSession(targetState, {
    minimized: false,
    route: routeInfo.route,
  });

  if (routeInfo.route === "dis/home") {
    targetState.disSearchQuery = "";
    if (targetState.phoneAppStatus && typeof targetState.phoneAppStatus === "object") {
      delete targetState.phoneAppStatus.dis;
    }
  }

  if (typeof isPhoneHomeRoute === "function" ? isPhoneHomeRoute(routeInfo.route) : routeInfo.route === "home") {
    if (typeof refreshPhoneHomePreviewForState === "function") {
      refreshPhoneHomePreviewForState(targetState);
    }
  }

  return true;
}

function openPhoneAppRoute(appId, targetState = state) {
  const manifest = typeof getPhoneAppManifest === "function"
    ? getPhoneAppManifest(appId, targetState)
    : null;
  const route = manifest?.openRoute || normalizePhoneRoute(appId);

  if (!route || route === "home") {
    return false;
  }

  const opened = openPhoneRoute(route, targetState);

  if (!opened) {
    return false;
  }

  const canExpandStage = typeof canOpenPhoneStage === "function"
    ? canOpenPhoneStage(targetState)
    : Boolean(targetState?.hasPhone);

  if (canExpandStage) {
    patchPhoneSession(targetState, {
      stageExpanded: true,
    });
  }

  return true;
}

function openPhoneHomeRoute(targetState = state) {
  return openPhoneRoute("home", targetState);
}

function openPhoneJobsRoute(targetState = state) {
  return openPhoneAppRoute("jobs", targetState);
}

function togglePhonePanelState(targetState = state) {
  if (!targetState?.hasPhone) {
    return false;
  }

  const phoneState = getPhoneSessionState(targetState);
  const nextMinimized = !phoneState.minimized;

  patchPhoneSession(targetState, {
    minimized: nextMinimized,
    stageExpanded: nextMinimized ? false : phoneState.stageExpanded,
  });

  return true;
}

function togglePhoneStageState(targetState = state) {
  const phoneState = getPhoneSessionState(targetState);
  const canExpand = typeof canOpenPhoneStage === "function"
    ? canOpenPhoneStage(targetState)
    : (targetState?.hasPhone && !phoneState.minimized);

  if (!canExpand) {
    return false;
  }

  patchPhoneSession(targetState, {
    stageExpanded: !phoneState.stageExpanded,
  });

  return true;
}

function goBackInPhoneRoute(targetState = state) {
  const phoneState = getPhoneSessionState(targetState);

  if (phoneState.minimized) {
    return false;
  }

  const onHomeRoute = typeof isPhoneHomeRoute === "function"
    ? isPhoneHomeRoute(phoneState.route)
    : phoneState.route === "home";

  if (!onHomeRoute) {
    openPhoneHomeRoute(targetState);
    return true;
  }

  if (phoneState.stageExpanded) {
    patchPhoneSession(targetState, { stageExpanded: false });
    return true;
  }

  return false;
}
