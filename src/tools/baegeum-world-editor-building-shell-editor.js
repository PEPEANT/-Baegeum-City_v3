import { BUILDING_SHELL_COLOR_OPTIONS, buildingShellColor, buildingShellDisplayName, isBuildingShell, setBuildingShellColor, setBuildingShellName } from "./baegeum-world-editor-building-shells.js";
import { selectedItem } from "./baegeum-world-editor-utils.js";

let controls = null;

export function initBuildingShellEditor(state, onChange) {
  controls = readControls();
  if (!controls.panel) return;
  controls.colorGrid.innerHTML = "";
  for (const option of BUILDING_SHELL_COLOR_OPTIONS) controls.colorGrid.appendChild(colorButton(option, state, onChange));
  controls.name.addEventListener("change", () => {
    const result = setBuildingShellName(selectedItem(state), controls.name.value);
    if (result) onChange(`건물 이름 ${result.label}.`);
  });
}

export function syncBuildingShellEditor(state) {
  if (!controls) controls = readControls();
  if (!controls.panel) return;
  const item = selectedItem(state);
  const editable = isBuildingShell(item) && state.mode !== "build";
  controls.panel.hidden = !editable;
  if (!editable) return;
  controls.name.value = item.shellName || buildingShellDisplayName(item);
  const color = buildingShellColor(item);
  for (const button of controls.colorGrid.querySelectorAll("[data-shell-color]")) {
    button.classList.toggle("active", button.dataset.shellColor === color);
  }
}

function colorButton(option, state, onChange) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "building-shell-color-button";
  button.dataset.shellColor = option.value;
  button.title = option.label;
  button.ariaLabel = option.label;
  button.style.background = option.value;
  button.addEventListener("click", () => {
    const result = setBuildingShellColor(selectedItem(state), option.value);
    if (result) onChange(`건물 색상 ${result.label}.`);
  });
  return button;
}

function readControls() {
  return {
    panel: document.getElementById("buildingShellEditor"),
    name: document.getElementById("buildingShellNameInput"),
    colorGrid: document.getElementById("buildingShellColorGrid")
  };
}
