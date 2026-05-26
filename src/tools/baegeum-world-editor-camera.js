import { clamp } from "./baegeum-world-editor-utils.js";

export function fitEditorCamera(state) {
  const reserve = window.innerWidth > 760 ? 360 : 20;
  const widthZoom = (window.innerWidth - reserve) / state.map.width;
  const heightZoom = (window.innerHeight - 40) / state.map.height;
  state.camera.zoom = clamp(Math.min(widthZoom, heightZoom), 0.06, 1.6);
  state.camera.x = -24 / state.camera.zoom;
  state.camera.y = -24 / state.camera.zoom;
  syncEditorCamera(state);
}

export function syncEditorCamera(state) {
  state.camera.width = window.innerWidth;
  state.camera.height = window.innerHeight;
  state.camera.viewWidth = state.camera.width / state.camera.zoom;
  state.camera.viewHeight = state.camera.height / state.camera.zoom;
}

export function screenToWorld(state, x, y) {
  return { x: state.camera.x + x / state.camera.zoom, y: state.camera.y + y / state.camera.zoom };
}

export function startPan(state, event) {
  state.drag = { type: "pan", sx: event.clientX, sy: event.clientY, x: state.camera.x, y: state.camera.y };
  state.canvas.setPointerCapture(event.pointerId);
}

export function moveCamera(state, event) {
  state.camera.x = state.drag.x - (event.clientX - state.drag.sx) / state.camera.zoom;
  state.camera.y = state.drag.y - (event.clientY - state.drag.sy) / state.camera.zoom;
  clampEditorCamera(state);
}

export function zoomEditorCamera(state, event) {
  event.preventDefault();
  const before = screenToWorld(state, event.clientX, event.clientY);
  state.camera.zoom = clamp(state.camera.zoom * (event.deltaY < 0 ? 1.12 : 0.88), 0.06, 2.2);
  syncEditorCamera(state);
  state.camera.x = before.x - event.clientX / state.camera.zoom;
  state.camera.y = before.y - event.clientY / state.camera.zoom;
  clampEditorCamera(state);
}

export function centerEditorCamera(state, point) {
  syncEditorCamera(state);
  state.camera.x = point.x - state.camera.viewWidth * 0.5;
  state.camera.y = point.y - state.camera.viewHeight * 0.5;
  clampEditorCamera(state);
}

function clampEditorCamera(state) {
  state.camera.x = clamp(state.camera.x, -260, state.map.width + 260);
  state.camera.y = clamp(state.camera.y, -260, state.map.height + 260);
}
