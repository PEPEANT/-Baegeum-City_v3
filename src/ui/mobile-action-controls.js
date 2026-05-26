import { getRuntimeGame } from "../systems/runtime-state-facade.js";

const refs = {
  dock: document.getElementById("mobileActionDock"),
  button: document.getElementById("mobileActionButton"),
  label: document.getElementById("mobileActionLabel"),
  target: document.getElementById("mobileActionTarget"),
  hint: document.getElementById("mobileActionHint")
};

initMobileActionControls();

export function resolveActionState(game) {
  if (!game) return actionState("액션", "대상 없음", true);
  if (game.nearbyInteraction) {
    return actionState(game.nearbyInteraction.label, game.nearbyInteraction.target, Boolean(game.nearbyInteraction.disabled));
  }
  if (game.nearbyDoor) {
    const target = game.nearbyDoor.building?.sign || game.nearbyDoor.building?.name || "입구";
    return actionState(game.scene === "city" ? "입장" : "나가기", target, false);
  }
  if (game.scene !== "city") return actionState("테이블", "상호작용 대기", true);
  return actionState("입장", "가까운 입구 없음", true);
}

function initMobileActionControls() {
  if (!refs.button) return;
  refs.button.addEventListener("click", triggerInteract);
  requestAnimationFrame(updateMobileAction);
}

function updateMobileAction() {
  const state = resolveActionState(getRuntimeGame());
  refs.label.textContent = state.label;
  refs.target.textContent = state.target;
  refs.hint.textContent = state.hint;
  refs.button.disabled = state.disabled;
  refs.button.setAttribute("aria-label", `${state.label}: ${state.target}`);
  requestAnimationFrame(updateMobileAction);
}

function triggerInteract() {
  if (refs.button.disabled) return;
  const game = getRuntimeGame();
  game?.input?.press?.("KeyE");
  game?.canvas?.focus?.();
}

function actionState(label, target, disabled) {
  return { label, target, disabled, hint: "E" };
}
