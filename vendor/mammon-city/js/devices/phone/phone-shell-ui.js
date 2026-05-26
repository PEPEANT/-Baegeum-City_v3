function createPhoneQuickToggleState(screenState = {}, targetState = state) {
  const cityMapOpen = Boolean(
    typeof cityMapUiState !== "undefined"
    && cityMapUiState
    && cityMapUiState.open
  );
  const mapAvailable = typeof canShowCityMapForState === "function"
    ? canShowCityMapForState(targetState)
    : false;

  return {
    cityMapOpen,
    mapAvailable,
    showMapQuickButton: Boolean(mapAvailable && (screenState?.minimized || cityMapOpen)),
  };
}

function createPhoneShellViewModel(targetState = state) {
  const phoneState = typeof syncPhoneSessionState === "function"
    ? syncPhoneSessionState(targetState)
    : {
        minimized: Boolean(targetState?.phoneMinimized),
        stageExpanded: Boolean(targetState?.phoneStageExpanded),
        route: typeof targetState?.phoneView === "string" && targetState.phoneView
          ? targetState.phoneView
          : "home",
        usedToday: Boolean(targetState?.phoneUsedToday),
        installedApps: Array.isArray(targetState?.installedPhoneApps)
          ? [...targetState.installedPhoneApps]
          : [],
      };
  const jobsState = typeof syncJobsDomainState === "function"
    ? syncJobsDomainState(targetState)
    : {
        ...(targetState?.jobs || {}),
        scheduledShift: targetState?.jobs?.scheduledShift || null,
        applicationDoneToday: Boolean(targetState?.jobs?.applicationDoneToday),
      };
  const unlocked = Boolean(targetState?.hasPhone);
  const canUseApps = typeof canUsePhoneApps === "function" ? canUsePhoneApps(targetState) : unlocked;
  const canOpenStage = typeof canOpenPhoneStage === "function"
    ? canOpenPhoneStage(targetState)
    : (unlocked && !phoneState.minimized && canUseApps);
  const preview = targetState?.phonePreview || {};
  const hasShiftToday = Boolean(jobsState.scheduledShift && jobsState.scheduledShift.day === targetState.day);
  const hasBookedShift = Boolean(jobsState.scheduledShift && jobsState.scheduledShift.day > targetState.day);
  const jobAppliedToday = Boolean(jobsState.applicationDoneToday);
  const stageExpanded = Boolean(phoneState.stageExpanded) && canOpenStage;
  const routeInfo = typeof parsePhoneRoute === "function"
    ? parsePhoneRoute(phoneState.route)
    : { appId: phoneState.route === "jobs" ? "jobs" : "" };
  const previewAppId = typeof normalizePhoneAppId === "function"
    ? normalizePhoneAppId(preview.appId || "")
    : String(preview.appId || "");

  return {
    day: targetState.day,
    unlocked,
    usedToday: phoneState.usedToday,
    minimized: phoneState.minimized,
    phoneView: phoneState.route,
    preview,
    phoneTime: typeof getSceneTimeText === "function" ? getSceneTimeText() : "08:00",
    canUseApps,
    canOpenStage,
    hasShiftToday,
    hasBookedShift,
    jobAppliedToday,
    stageExpanded,
    activeAppId: routeInfo.appId || previewAppId,
    signalText: !unlocked
      ? "LOCK"
      : hasShiftToday
        ? "SHIFT"
        : hasBookedShift
          ? "BOOKED"
          : jobAppliedToday
            ? "APPLIED"
            : phoneState.usedToday
              ? "DONE"
              : canUseApps
                ? "ONLINE"
                : "HOLD",
  };
}

function applyPhoneShellUiLegacyStatus(uiRefs, screenState) {
  if (!uiRefs?.phonePanel) {
    return;
  }

  const {
    unlocked,
    usedToday,
    minimized,
    phoneView,
    phoneTime,
    canUseApps,
    stageExpanded,
    day,
    activeAppId,
    signalText,
  } = screenState;
  const quickToggleState = createPhoneQuickToggleState(screenState, state);

  uiRefs.phonePanel.classList.toggle("is-unlocked", unlocked);
  uiRefs.phonePanel.classList.toggle("phone-used", usedToday);
  uiRefs.phonePanel.classList.toggle("is-hidden-panel", minimized);
  uiRefs.game?.classList.toggle("phone-collapsed", minimized);

  if (uiRefs.phoneControls) {
    uiRefs.phoneControls.hidden = !unlocked;
    uiRefs.phoneControls.classList.toggle("is-collapsed", minimized);
  }

  if (uiRefs.phoneToggleButton) {
    uiRefs.phoneToggleButton.hidden = !unlocked || quickToggleState.cityMapOpen;
    uiRefs.phoneToggleButton.setAttribute("aria-expanded", minimized ? "false" : "true");
    uiRefs.phoneToggleButton.setAttribute("aria-label", minimized ? "폰 열기" : "폰 닫기");
    uiRefs.phoneToggleButton.classList.toggle("is-active", !minimized);
    const toggleIcon = uiRefs.phoneToggleButton.querySelector(".phone-control-icon");
    const toggleLabel = uiRefs.phoneToggleButton.querySelector(".phone-control-label");
    if (toggleIcon) {
      toggleIcon.textContent = "";
    }
    if (toggleLabel) {
      toggleLabel.textContent = "";
    }
  }

  if (uiRefs.cityMapToggleButton) {
    uiRefs.cityMapToggleButton.hidden = !unlocked || !quickToggleState.showMapQuickButton;
    uiRefs.cityMapToggleButton.disabled = !quickToggleState.mapAvailable;
    uiRefs.cityMapToggleButton.setAttribute("aria-expanded", quickToggleState.cityMapOpen ? "true" : "false");
    uiRefs.cityMapToggleButton.setAttribute("aria-label", quickToggleState.cityMapOpen ? "지도 닫기" : "지도 열기");
    uiRefs.cityMapToggleButton.classList.toggle("is-active", quickToggleState.cityMapOpen);
    const mapLabel = uiRefs.cityMapToggleButton.querySelector(".phone-control-label");
    if (mapLabel) {
      mapLabel.textContent = "";
    }
  }

  if (uiRefs.phoneStageButton) {
    uiRefs.phoneStageButton.hidden = !unlocked || minimized;
    uiRefs.phoneStageButton.disabled = !screenState.canOpenStage;
    uiRefs.phoneStageButton.setAttribute("aria-label", "폰 화면 크게 보기");
    uiRefs.phoneStageButton.setAttribute("aria-pressed", stageExpanded ? "true" : "false");
    uiRefs.phoneStageButton.classList.toggle("is-active", stageExpanded);
    const stageLabel = uiRefs.phoneStageButton.querySelector(".phone-control-label");
    if (stageLabel) {
      stageLabel.textContent = stageExpanded ? "축소" : "확장";
    }
  }

  if (uiRefs.phoneBackButton) {
    const canGoBack = !minimized && (
      (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(phoneView) : phoneView !== "home")
      || stageExpanded
    );
    uiRefs.phoneBackButton.hidden = !unlocked || minimized;
    uiRefs.phoneBackButton.disabled = !canGoBack;
    uiRefs.phoneBackButton.setAttribute("aria-label", "이전 화면");
  }

  if (uiRefs.phoneTimeDisplay) {
    uiRefs.phoneTimeDisplay.textContent = phoneTime;
  }

  if (uiRefs.phoneStatusSignal) {
    uiRefs.phoneStatusSignal.textContent = signalText;
  }

  if (uiRefs.phoneDayChip) {
    uiRefs.phoneDayChip.textContent = typeof formatTurnBadge === "function"
      ? formatTurnBadge(day)
      : `TURN ${String(day).padStart(2, "0")}`;
  }

  uiRefs.phonePanel.querySelectorAll(".phone-app-btn[data-phone-app]").forEach((button) => {
    const appId = button.dataset.phoneApp;
    const active = activeAppId === appId;
    const canOpen = typeof canOpenPhoneApp === "function"
      ? canOpenPhoneApp(appId, state)
      : (unlocked && canUseApps);
    button.classList.toggle("is-selected", active);
    button.disabled = !unlocked || !canUseApps || !canOpen;
  });
}

function applyPhoneShellUi(uiRefs, screenState) {
  if (!uiRefs?.phonePanel) {
    return;
  }

  const {
    unlocked,
    usedToday,
    minimized,
    phoneView,
    phoneTime,
    canUseApps,
    stageExpanded,
    day,
    activeAppId,
  } = screenState;
  const quickToggleState = createPhoneQuickToggleState(screenState, state);

  uiRefs.phonePanel.classList.toggle("is-unlocked", unlocked);
  uiRefs.phonePanel.classList.toggle("phone-used", usedToday);
  uiRefs.phonePanel.classList.toggle("is-hidden-panel", minimized);
  uiRefs.game?.classList.toggle("phone-collapsed", minimized);

  if (uiRefs.phoneControls) {
    uiRefs.phoneControls.hidden = !unlocked;
    uiRefs.phoneControls.classList.toggle("is-collapsed", minimized);
  }

  if (uiRefs.phoneToggleButton) {
    uiRefs.phoneToggleButton.hidden = !unlocked || quickToggleState.cityMapOpen;
    uiRefs.phoneToggleButton.setAttribute("aria-expanded", minimized ? "false" : "true");
    uiRefs.phoneToggleButton.setAttribute("aria-label", minimized ? "폰 열기" : "폰 닫기");
    uiRefs.phoneToggleButton.classList.toggle("is-active", !minimized);
    const toggleIcon = uiRefs.phoneToggleButton.querySelector(".phone-control-icon");
    const toggleLabel = uiRefs.phoneToggleButton.querySelector(".phone-control-label");
    if (toggleIcon) {
      toggleIcon.textContent = "";
    }
    if (toggleLabel) {
      toggleLabel.textContent = "";
    }
  }

  if (uiRefs.cityMapToggleButton) {
    uiRefs.cityMapToggleButton.hidden = !unlocked || !quickToggleState.showMapQuickButton;
    uiRefs.cityMapToggleButton.disabled = !quickToggleState.mapAvailable;
    uiRefs.cityMapToggleButton.setAttribute("aria-expanded", quickToggleState.cityMapOpen ? "true" : "false");
    uiRefs.cityMapToggleButton.setAttribute("aria-label", quickToggleState.cityMapOpen ? "지도 닫기" : "지도 열기");
    uiRefs.cityMapToggleButton.classList.toggle("is-active", quickToggleState.cityMapOpen);
    const mapLabel = uiRefs.cityMapToggleButton.querySelector(".phone-control-label");
    if (mapLabel) {
      mapLabel.textContent = "";
    }
  }

  if (uiRefs.phoneStageButton) {
    uiRefs.phoneStageButton.hidden = !unlocked || minimized;
    uiRefs.phoneStageButton.disabled = !screenState.canOpenStage;
    uiRefs.phoneStageButton.setAttribute("aria-label", "폰 화면 크게 보기");
    uiRefs.phoneStageButton.setAttribute("aria-pressed", stageExpanded ? "true" : "false");
    uiRefs.phoneStageButton.classList.toggle("is-active", stageExpanded);
    const stageLabel = uiRefs.phoneStageButton.querySelector(".phone-control-label");
    if (stageLabel) {
      stageLabel.textContent = "";
    }
  }

  if (uiRefs.phoneBackButton) {
    const canGoBack = !minimized && (
      (typeof isPhoneHomeRoute === "function" ? !isPhoneHomeRoute(phoneView) : phoneView !== "home")
      || stageExpanded
    );
    uiRefs.phoneBackButton.hidden = !unlocked || minimized;
    uiRefs.phoneBackButton.disabled = !canGoBack;
    uiRefs.phoneBackButton.setAttribute("aria-label", "이전 화면");
    const backLabel = uiRefs.phoneBackButton.querySelector(".phone-control-label");
    if (backLabel) {
      backLabel.textContent = "";
    }
  }

  if (uiRefs.phoneTimeDisplay) {
    uiRefs.phoneTimeDisplay.textContent = phoneTime;
  }

  if (uiRefs.phoneStatusSignal) {
    uiRefs.phoneStatusSignal.textContent = typeof formatTurnBadge === "function"
      ? formatTurnBadge(day)
      : `TURN ${String(day).padStart(2, "0")}`;
  }

  if (uiRefs.phoneDayChip) {
    uiRefs.phoneDayChip.hidden = true;
  }

  uiRefs.phonePanel.querySelectorAll(".phone-app-btn[data-phone-app]").forEach((button) => {
    const appId = button.dataset.phoneApp;
    const active = activeAppId === appId;
    const canOpen = typeof canOpenPhoneApp === "function"
      ? canOpenPhoneApp(appId, state)
      : (unlocked && canUseApps);
    button.classList.toggle("is-selected", active);
    button.disabled = !unlocked || !canUseApps || !canOpen;
  });
}
