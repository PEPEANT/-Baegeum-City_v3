import { createWorldEditorDraft } from "../data/world-editor-draft.js";
import { clone } from "./baegeum-world-editor-utils.js";
import { describeDraftChanges } from "./baegeum-world-editor-diff.js";

const HISTORY_LIMIT = 60;

export function initHistory(state) {
  const current = snapshotMap(state.map);
  state.history = {
    undo: [],
    redo: [],
    current,
    saved: current,
    savedSignature: current.signature
  };
}

export function commitHistory(state) {
  const next = snapshotMap(state.map);
  if (!state.history || next.signature === state.history.current.signature) return false;
  state.history.undo.push(state.history.current);
  if (state.history.undo.length > HISTORY_LIMIT) state.history.undo.shift();
  state.history.redo = [];
  state.history.current = next;
  return true;
}

export function undoHistory(state) {
  if (!state.history?.undo.length) return false;
  state.history.redo.push(state.history.current);
  const previous = state.history.undo.pop();
  applySnapshot(state, previous);
  state.history.current = previous;
  return true;
}

export function redoHistory(state) {
  if (!state.history?.redo.length) return false;
  state.history.undo.push(state.history.current);
  const next = state.history.redo.pop();
  applySnapshot(state, next);
  state.history.current = next;
  return true;
}

export function markHistorySaved(state) {
  if (!state.history) initHistory(state);
  state.history.current = snapshotMap(state.map);
  state.history.saved = state.history.current;
  state.history.savedSignature = state.history.current.signature;
}

export function syncHistoryControls(ui, state) {
  const history = state.history;
  const dirty = history ? history.current.signature !== history.savedSignature : false;
  ui.undo.disabled = !history?.undo.length;
  ui.redo.disabled = !history?.redo.length;
  ui.save.classList.toggle("dirty", dirty);
  ui.changeState.textContent = dirty ? "저장 안 됨" : "저장됨";
  ui.changeState.classList.toggle("dirty", dirty);
  if (ui.changeDetail) ui.changeDetail.textContent = changeDetail(history, dirty);
}

export function isHistoryDirty(state) {
  const history = state.history;
  return history ? history.current.signature !== history.savedSignature : false;
}

export function bindHistoryShortcuts(undo, redo) {
  window.addEventListener("keydown", (event) => {
    if (isTextEditingTarget(event.target) || !(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      redo();
    } else if (key === "z") {
      event.preventDefault();
      undo();
    } else if (key === "y") {
      event.preventDefault();
      redo();
    }
  });
}

function snapshotMap(map) {
  const mapSnapshot = clone(map);
  const draft = createWorldEditorDraft(map, { includeSavedAt: false });
  const signature = JSON.stringify(draft);
  return { map: mapSnapshot, draft, signature };
}

function changeDetail(history, dirty) {
  if (!history) return "변경 기준 없음";
  if (!dirty) return "저장 기준과 동일";
  return describeDraftChanges(history.saved?.draft, history.current?.draft).join(" · ");
}

function applySnapshot(state, snapshot) {
  state.map = clone(snapshot.map);
  state.selected = null;
  state.hover = null;
  state.drag = null;
  state.buildGhost = null;
  state.billboardAdPaletteOpen = false;
}

function isTextEditingTarget(target) {
  const tag = target?.tagName;
  return target?.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
