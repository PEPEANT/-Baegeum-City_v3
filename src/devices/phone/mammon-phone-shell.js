import { getRuntimeState } from "../../systems/runtime-state-facade.js";
import { buildDisPreviewMarkup, isDisRoute } from "./dis-preview.js";

const phoneApps = [
  { id: "bank", label: "은행", icon: "🏦" },
  { id: "dis", label: "디시인사이드", icon: "💬" },
  { id: "news", label: "뉴스", icon: "📰" },
  { id: "playstore", label: "플레이스토어", icon: "🛒" },
  { id: "call", label: "전화", icon: "📞" },
  { id: "gallery", label: "갤러리", icon: "🖼️" },
  { id: "stocks", label: "증권", icon: "📈" }
];

const phoneState = {
  open: false,
  stageExpanded: false,
  route: "home"
};

let clockSnapshot = null;

const refs = {
  panel: document.getElementById("phone-panel"),
  stage: document.getElementById("phone-stage"),
  focusDim: document.getElementById("phone-focus-dim"),
  apps: document.getElementById("phone-apps"),
  appScreen: document.getElementById("phone-app-screen"),
  controls: document.getElementById("phone-controls"),
  stageButton: document.getElementById("phone-stage-btn"),
  cityMapButton: document.getElementById("city-map-toggle-btn"),
  homeButton: document.getElementById("phone-home-btn"),
  backButton: document.getElementById("phone-back-btn"),
  time: document.getElementById("phone-time-display"),
  signal: document.getElementById("phone-status-signal"),
  dayChip: document.getElementById("phone-day-chip")
};

initMammonPhoneShell();

function initMammonPhoneShell() {
  if (!refs.panel) return;
  refs.homeButton?.addEventListener("click", onHomeButton);
  refs.stageButton?.addEventListener("click", onStageButton);
  refs.backButton?.addEventListener("click", onBackButton);
  refs.focusDim?.addEventListener("click", closePhone);
  refs.cityMapButton.hidden = true;
  window.addEventListener("baegeum:clock", (event) => {
    clockSnapshot = event.detail;
    renderClockLabels();
  });
  window.addEventListener("baegeum:chat-channel", refreshDisContent);
  window.addEventListener("baegeum:chat", refreshDisContent);
  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyP") {
      event.preventDefault();
      togglePhone();
    }
  });
  updatePhoneShell();
}

function onHomeButton() {
  if (!phoneState.open) {
    openPhone();
    return;
  }
  if (phoneState.route !== "home") {
    phoneState.route = "home";
    updatePhoneShell();
    return;
  }
  closePhone();
}

function onStageButton() {
  if (!phoneState.open) return;
  phoneState.stageExpanded = !phoneState.stageExpanded;
  updatePhoneShell();
}

function onBackButton() {
  if (phoneState.route !== "home") {
    phoneState.route = "home";
  } else if (phoneState.stageExpanded) {
    phoneState.stageExpanded = false;
  } else {
    phoneState.open = false;
  }
  updatePhoneShell();
}

function togglePhone() {
  phoneState.open ? closePhone() : openPhone();
}

function openPhone() {
  phoneState.open = true;
  updatePhoneShell();
}

function closePhone() {
  phoneState.open = false;
  phoneState.stageExpanded = false;
  phoneState.route = "home";
  updatePhoneShell();
}

function updatePhoneShell() {
  const onHomeRoute = phoneState.route === "home";
  const focusActive = phoneState.open && (phoneState.stageExpanded || !onHomeRoute);
  const fullbleedRoute = !onHomeRoute && isDisRoute(phoneState.route);
  document.body.classList.toggle("phone-focus-active", focusActive);
  document.body.classList.toggle("phone-stage-active", phoneState.open && phoneState.stageExpanded);
  document.body.classList.toggle("phone-safe-layout", false);
  document.body.classList.toggle("phone-collapsed", !phoneState.open || focusActive);

  refs.panel.classList.toggle("is-unlocked", true);
  refs.panel.classList.toggle("is-hidden-panel", !phoneState.open);
  refs.panel.classList.toggle("is-app-open", !onHomeRoute);
  refs.panel.classList.toggle("has-fullbleed-app", fullbleedRoute);
  refs.panel.classList.toggle("is-focus-mode", focusActive);
  refs.panel.classList.toggle("is-stage-docked", phoneState.open && phoneState.stageExpanded);
  refs.stage.classList.toggle("has-fullbleed-app", fullbleedRoute);

  refs.controls.hidden = false;
  refs.controls.classList.toggle("is-collapsed", !phoneState.open);
  refs.stageButton.hidden = !phoneState.open;
  refs.backButton.hidden = !phoneState.open;
  refs.stageButton.setAttribute("aria-pressed", phoneState.stageExpanded ? "true" : "false");
  refs.stageButton.classList.toggle("is-active", phoneState.stageExpanded);
  refs.stageButton.setAttribute("aria-label", phoneState.stageExpanded ? "폰 축소" : "폰 펼치기");
  refs.homeButton.setAttribute("aria-expanded", phoneState.open ? "true" : "false");
  refs.backButton.disabled = !phoneState.open;

  renderClockLabels();
  updateFocusDim(focusActive);
  updatePanelHome(onHomeRoute);
  updateStage(onHomeRoute);
}

function renderClockLabels() {
  const clock = currentClock();
  refs.time.textContent = clock.dayLabel;
  refs.signal.textContent = "ONLINE";
  refs.dayChip.textContent = "";
  refs.dayChip.hidden = true;
  document.querySelectorAll("[data-phone-clock='time']").forEach((item) => {
    item.textContent = clock.dayLabel;
  });
  document.querySelectorAll("[data-phone-clock='day']").forEach((item) => {
    item.textContent = clock.dayLabel;
  });
}

function updateFocusDim(active) {
  refs.focusDim.hidden = !active;
  refs.focusDim.setAttribute("aria-hidden", active ? "false" : "true");
  refs.focusDim.classList.toggle("is-active", active);
}

function updatePanelHome(onHomeRoute) {
  refs.apps.hidden = !onHomeRoute;
  refs.apps.innerHTML = onHomeRoute ? buildPhoneHomeGridMarkup() : "";
  refs.appScreen.hidden = onHomeRoute;
  refs.appScreen.classList.toggle("is-fullbleed-route", !onHomeRoute && isDisRoute(phoneState.route));
  refs.appScreen.innerHTML = onHomeRoute ? "" : buildDisabledAppMarkup(phoneState.route);
  refs.apps.querySelectorAll("[data-phone-app]").forEach((button) => {
    button.addEventListener("click", () => {
      phoneState.route = `${button.dataset.phoneApp}/home`;
      phoneState.stageExpanded = true;
      updatePhoneShell();
    });
  });
}

function updateStage(onHomeRoute) {
  const shouldShow = phoneState.open && phoneState.stageExpanded;
  refs.stage.hidden = !shouldShow;
  refs.stage.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  refs.stage.innerHTML = shouldShow ? buildPhoneStageMarkup(onHomeRoute) : "";
  refs.stage.querySelectorAll("[data-phone-app]").forEach((button) => {
    button.addEventListener("click", () => {
      phoneState.route = `${button.dataset.phoneApp}/home`;
      phoneState.stageExpanded = true;
      updatePhoneShell();
    });
  });
}

function buildPhoneHomeGridMarkup() {
  return phoneApps.map((app) => `
    <button
      class="phone-app-btn"
      type="button"
      data-phone-app="${escapeHtml(app.id)}"
    >
      <span class="phone-app-icon-tile">
        <span class="phone-app-emoji">${escapeHtml(app.icon)}</span>
      </span>
      <span class="phone-app-name">${escapeHtml(app.label)}</span>
    </button>
  `).join("");
}

function buildPhoneStageMarkup(onHomeRoute) {
  const clock = currentClock();
  const stageScreenClass = isDisRoute(phoneState.route) ? "phone-stage-app-screen is-fullbleed-route" : "phone-stage-app-screen";
  const stageBody = onHomeRoute
    ? `<div class="phone-stage-home-grid">${buildPhoneHomeGridMarkup()}</div><div class="phone-stage-home-fill"></div>`
    : `<div class="${stageScreenClass}">${buildDisabledAppMarkup(phoneState.route)}</div>`;
  return `
    <div class="phone-stage-shell ${onHomeRoute ? "is-home-view" : "is-app-view"}">
      <div class="phone-stage-top">
        <div class="phone-stage-day">BAEGEUM CITY</div>
        <div class="phone-stage-meta">
          <span class="phone-stage-time" data-phone-clock="day">${escapeHtml(clock.dayLabel)}</span>
          <span class="phone-stage-signal">ONLINE</span>
        </div>
      </div>
      ${stageBody}
    </div>
  `;
}

function buildDisabledAppMarkup(route) {
  const appId = String(route || "").split("/")[0];
  const app = phoneApps.find((item) => item.id === appId) || { label: "앱", icon: "📱" };
  if (isDisRoute(route)) return buildDisPreviewMarkup({ compact: false, context: phoneRuntimeContext() });
  return `
    <div class="phone-app-screen-top">
      <div class="phone-app-screen-copy">
        <div class="phone-app-screen-kicker">APP LOCKED</div>
        <div class="phone-app-screen-title">${escapeHtml(app.icon)} ${escapeHtml(app.label)}</div>
        <div class="phone-app-screen-note">앱 기능은 아직 연결하지 않고, 원본 휴대폰 셸만 테스트 중입니다.</div>
      </div>
    </div>
    <div class="phone-job-empty">다음 단계에서 이 앱 원본 기능을 따로 고정해서 연결합니다.</div>
  `;
}

function refreshDisContent() {
  if (!phoneState.open || !isDisRoute(phoneState.route)) return;
  updatePanelHome(false);
  updateStage(false);
}

function phoneRuntimeContext() {
  const runtime = getRuntimeState();
  const game = runtime.game || {};
  return {
    clock: currentClock(),
    chat: runtime.chat,
    channel: runtime.chat?.channel,
    scene: game.scene,
    venue: game.currentInterior
  };
}

function currentClock() {
  return clockSnapshot || getRuntimeState().clockSnapshot || { timeText: "08:00", dayLabel: "DAY 01", phaseLabel: "낮" };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
