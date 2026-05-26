import { createWorldEditorDraft } from "../data/world-editor-draft.js";
import { validateWorldMapDraft, WORLD_MAP_SCHEMA_VERSION } from "../data/world-map-contract.js";
import { createWorldMapValidationReport } from "../data/world-map-validation-report.js";
import { centerEditorCamera } from "./baegeum-world-editor-camera.js";

export function syncContractControls(ui, state, onIssueFocus = null) {
  const draft = createWorldEditorDraft(state.map, {
    editorRevision: state.editorRevision,
    includeSavedAt: false
  });
  const report = validateWorldMapDraft(draft);
  const validation = createWorldMapValidationReport(draft);
  ui.contractMap.textContent = draft.mapVersion;
  ui.contractSchema.textContent = WORLD_MAP_SCHEMA_VERSION;
  ui.contractRevision.textContent = `rev ${draft.editorRevision}`;
  ui.contractSummary.textContent = summaryLabel(report);
  ui.contractSummary.classList.toggle("warning", report.warnings.length > 0);
  ui.contractSummary.classList.toggle("error", !report.ok);
  syncValidationReport(ui, state, draft, validation, onIssueFocus);
}

function summaryLabel(report) {
  const summary = report.summary;
  if (!report.ok) return `계약 오류 ${report.errors.length}`;
  if (summary.duplicateIds.length) return `ID 중복 ${summary.duplicateIds.length}`;
  if (summary.invalidIds.length) return `ID 형식 오류 ${summary.invalidIds.length}`;
  if (summary.missingIds > 0) return `ID 누락 ${summary.missingIds}`;
  return `${summary.scenery} objects / ${summary.roads} roads`;
}

function syncValidationReport(ui, state, draft, validation, onIssueFocus) {
  ui.validationTitle.textContent = validationTitle(validation);
  ui.validationDetail.textContent = validationDetail(validation);
  ui.validationReport.classList.toggle("warning", validation.warningCount > 0);
  ui.validationReport.classList.toggle("error", !validation.ok);
  ui.validationList.innerHTML = "";
  for (const item of validation.issues.slice(0, 4)) {
    const row = document.createElement("li");
    row.className = item.severity;
    const button = document.createElement("button");
    const target = issueFocusTarget(state, draft, item);
    button.type = "button";
    button.textContent = item.label;
    button.disabled = !target;
    button.title = target ? "해당 위치로 이동" : "이동할 수 없는 검증 항목";
    button.addEventListener("click", () => {
      focusIssueTarget(state, target);
      onIssueFocus?.(`검증 항목으로 이동: ${item.label}`);
    });
    row.appendChild(button);
    ui.validationList.appendChild(row);
  }
}

function issueFocusTarget(state, draft, issue) {
  for (const targetId of issueTargetIds(issue.target)) {
    const target = focusTargetById(state, draft, targetId);
    if (target) return target;
  }
  return null;
}

function issueTargetIds(target) {
  if (typeof target !== "string") return [];
  return target.split(",").map((part) => part.trim()).filter(Boolean);
}

function focusTargetById(state, draft, targetId) {
  if (targetId.startsWith("road:")) return roadTarget(state, targetId);
  const sceneryIndex = (draft.scenery || []).findIndex((item) => item?.id === targetId);
  if (sceneryIndex >= 0) return itemTarget(state, "scenery", sceneryIndex);
  const obstacleIndex = (draft.obstacles || []).findIndex((item) => item?.id === targetId);
  if (obstacleIndex >= 0) return itemTarget(state, "obstacle", obstacleIndex);
  if (targetId.startsWith("entrance:")) return focusTargetById(state, draft, entranceOwnerId(targetId));
  return null;
}

function roadTarget(state, targetId) {
  const [, roadValue, pointValue] = targetId.split(":");
  const roadIndex = Number(roadValue) - 1;
  const pointIndex = Number(pointValue) - 1;
  const point = state.map.roads?.[roadIndex]?.[pointIndex];
  if (!point) return null;
  return {
    selection: { type: "road-point", roadIndex, pointIndex },
    mode: "road",
    point
  };
}

function itemTarget(state, type, index) {
  const list = type === "scenery" ? state.map.scenery : state.map.obstacles;
  const item = list?.[index];
  if (!item) return null;
  return {
    selection: { type, index },
    mode: type === "obstacle" ? "obstacle" : "scenery",
    point: itemCenter(item)
  };
}

function focusIssueTarget(state, target) {
  if (!target) return;
  state.mode = target.mode;
  state.selected = target.selection;
  state.buildGhost = null;
  state.buildListOpen = false;
  state.billboardAdPaletteOpen = false;
  centerEditorCamera(state, target.point);
}

function itemCenter(item) {
  if (item.shape === "circle" || item.r) return { x: item.x, y: item.y };
  return {
    x: item.x + (item.w || 0) * 0.5,
    y: item.y + (item.h || 0) * 0.5
  };
}

function entranceOwnerId(targetId) {
  return targetId.replace(/^entrance:/, "").replace(/:front$/, "");
}

function validationTitle(validation) {
  if (!validation.ok) return `검증 오류 ${validation.errorCount}`;
  if (validation.warningCount > 0) return `검증 경고 ${validation.warningCount}`;
  return "검증 통과";
}

function validationDetail(validation) {
  if (!validation.issueCount) return "ID, 충돌, 입구 이상 없음";
  const hidden = Math.max(0, validation.issueCount - 4);
  return hidden ? `상위 4개 표시, 추가 ${hidden}개` : "저장 전 확인 필요";
}
