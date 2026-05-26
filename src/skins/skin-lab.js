import { PALETTE } from "../../vendor/drawing-world/public/src/config.js";
import { loadSkinImageFile, saveSkinPng as saveSkinFile } from "../../vendor/drawing-world/public/src/ui/skin-files.js";
import { fillSkinArea } from "../../vendor/drawing-world/public/src/ui/skin-fill.js";
import {
  DEFAULT_SKIN_PRESET_ID,
  SKIN_PRESETS,
  SKIN_SIZE,
  clearSkinContext,
  drawPresetToContext
} from "./baegeum-skin-presets.js";
import {
  loadStoredSkinSelection,
  saveStoredPlayerSkin
} from "./drawing-world-adapter.js";
import { startSkinStage } from "./skin-lab-stage.js";

const SKIN_SCALE = 5;
const PREVIEW_SCALE = 2;
const BRUSH_SIZES = [1, 2, 4];
const ui = {
  editor: document.getElementById("skinEditor"),
  canvas: document.getElementById("skinCanvas"),
  preview: document.getElementById("skinPreview"),
  presets: document.getElementById("skinPresets"),
  palette: document.getElementById("skinPalette"),
  color: document.getElementById("skinColorInput"),
  brushSizes: document.getElementById("skinBrushSizes"),
  eraser: document.getElementById("skinEraserButton"),
  fill: document.getElementById("skinFillButton"),
  clear: document.getElementById("skinClearButton"),
  defaultSkin: document.getElementById("skinDefaultButton"),
  edit: document.getElementById("skinEditButton"),
  load: document.getElementById("skinLoadButton"),
  file: document.getElementById("skinFileInput"),
  save: document.getElementById("skinSaveButton"),
  apply: document.getElementById("skinApplyButton"),
  status: document.getElementById("skinStatus"),
  stage: document.getElementById("skinStage")
};

const ctx = ui.canvas.getContext("2d");
const previewCtx = ui.preview.getContext("2d");
let selectedColor = "#111827";
let selectedPreset = DEFAULT_SKIN_PRESET_ID;
let tool = "pen";
let brushSize = 1;
let painting = false;
let currentSkin = "";

init();

function init() {
  setupPixelCanvas(ui.canvas, SKIN_SCALE);
  setupPixelCanvas(ui.preview, PREVIEW_SCALE);
  renderPresets();
  renderPalette();
  renderBrushSizes();
  wireEvents();
  loadInitialSkin();
  startSkinStage(ui.stage, () => currentSkin);
}

function setupPixelCanvas(canvas, scale) {
  canvas.width = SKIN_SIZE;
  canvas.height = SKIN_SIZE;
  canvas.style.width = `${SKIN_SIZE * scale}px`;
  canvas.style.height = `${SKIN_SIZE * scale}px`;
  canvas.style.imageRendering = "pixelated";
}

function renderPresets() {
  ui.presets.replaceChildren();
  for (const preset of SKIN_PRESETS) {
    const button = document.createElement("button");
    const thumbnail = document.createElement("canvas");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "skin-preset";
    button.dataset.preset = preset.id;
    thumbnail.width = SKIN_SIZE;
    thumbnail.height = SKIN_SIZE;
    preset.draw(thumbnail.getContext("2d"));
    label.textContent = preset.name;
    button.append(thumbnail, label);
    button.addEventListener("click", () => applyPreset(preset.id));
    ui.presets.append(button);
  }
}

function renderPalette() {
  const colors = ["#111827", "#ffffff", "#94a3b8", "#f5b892", ...PALETTE, "#f97316", "#facc15", "#f9a8d4"];
  ui.palette.replaceChildren();
  for (const color of colors) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skin-swatch";
    button.dataset.color = color;
    button.style.background = color;
    button.addEventListener("click", () => selectColor(color));
    ui.palette.append(button);
  }
}

function renderBrushSizes() {
  ui.brushSizes.replaceChildren();
  for (const size of BRUSH_SIZES) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.skinSize = String(size);
    button.textContent = `${size}px`;
    button.addEventListener("click", () => {
      brushSize = size;
      syncUi();
    });
    ui.brushSizes.append(button);
  }
}

function wireEvents() {
  ui.color.addEventListener("input", () => selectColor(ui.color.value));
  ui.eraser.addEventListener("click", () => setTool("eraser"));
  ui.fill.addEventListener("click", () => setTool("fill"));
  ui.clear.addEventListener("click", clearSkin);
  ui.defaultSkin.addEventListener("click", () => applyPreset(DEFAULT_SKIN_PRESET_ID));
  ui.edit.addEventListener("click", editCurrentSkin);
  ui.load.addEventListener("click", () => ui.file.click());
  ui.file.addEventListener("change", loadFile);
  ui.save.addEventListener("click", savePng);
  ui.apply.addEventListener("click", applyToGame);
  ui.canvas.addEventListener("pointerdown", startPainting);
  ui.canvas.addEventListener("pointermove", paintPixel);
  ui.canvas.addEventListener("pointerup", stopPainting);
  ui.canvas.addEventListener("pointercancel", stopPainting);
  ui.canvas.addEventListener("pointerleave", stopPainting);
}

function loadInitialSkin() {
  const saved = loadStoredSkinSelection();
  selectedPreset = saved.presetId || DEFAULT_SKIN_PRESET_ID;
  if (saved.skin) {
    drawDataUrl(saved.skin, "저장된 스킨 불러옴");
  } else {
    applyPreset(selectedPreset);
  }
}

function applyPreset(presetId) {
  const preset = SKIN_PRESETS.find((item) => item.id === presetId) || SKIN_PRESETS[0];
  selectedPreset = preset.id;
  if (preset.id === "custom") clearSkinContext(ctx);
  else drawPresetToContext(ctx, preset);
  updatePreview(`${preset.name} 선택`);
}

function clearSkin() {
  selectedPreset = "custom";
  clearSkinContext(ctx);
  updatePreview("커스텀 캔버스 초기화");
}

function editCurrentSkin() {
  selectedPreset = "custom";
  setTool("pen");
  updatePreview("선택 스킨 편집 중");
}

function startPainting(event) {
  painting = true;
  selectedPreset = "custom";
  ui.canvas.setPointerCapture?.(event.pointerId);
  paintPixel(event);
}

function paintPixel(event) {
  if (!painting) return;
  event.preventDefault();
  const rect = ui.canvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * SKIN_SIZE);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * SKIN_SIZE);
  const startX = clamp(x - Math.floor(brushSize / 2), 0, SKIN_SIZE - brushSize);
  const startY = clamp(y - Math.floor(brushSize / 2), 0, SKIN_SIZE - brushSize);

  if (tool === "fill") fillSkinArea(ctx, x, y, selectedColor);
  else if (tool === "eraser") ctx.clearRect(startX, startY, brushSize, brushSize);
  else {
    ctx.fillStyle = selectedColor;
    ctx.fillRect(startX, startY, brushSize, brushSize);
  }
  updatePreview("커스텀 편집 중");
}

function stopPainting(event) {
  if (event?.pointerId !== undefined && ui.canvas.hasPointerCapture?.(event.pointerId)) {
    ui.canvas.releasePointerCapture(event.pointerId);
  }
  painting = false;
}

function selectColor(color) {
  selectedColor = color;
  ui.color.value = color;
  setTool("pen");
}

function setTool(nextTool) {
  tool = nextTool;
  syncUi();
}

async function loadFile() {
  const file = ui.file.files?.[0];
  ui.file.value = "";
  if (!file) return;
  try {
    await loadSkinImageFile(file, ui.canvas, SKIN_SIZE);
    selectedPreset = "custom";
    updatePreview("PNG 스킨 불러옴");
  } catch {
    setStatus("이미지 파일을 읽지 못했어요");
  }
}

function savePng() {
  const player = { skin: "" };
  saveSkinFile(ui.canvas, player, () => saveStoredPlayerSkin(player.skin, selectedPreset));
  setStatus("PNG 저장 및 본게임 스킨 갱신");
}

function applyToGame() {
  saveStoredPlayerSkin(currentSkin, selectedPreset);
  setStatus("본게임에 적용됨");
}

function drawDataUrl(dataUrl, status) {
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, SKIN_SIZE, SKIN_SIZE);
    updatePreview(status);
  };
  image.src = dataUrl;
}

function updatePreview(status) {
  previewCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.drawImage(ui.canvas, 0, 0);
  currentSkin = ui.canvas.toDataURL("image/png");
  setStatus(status);
  syncUi();
}

function syncUi() {
  ui.editor.classList.toggle("is-customizing", selectedPreset === "custom");
  ui.eraser.classList.toggle("active", tool === "eraser");
  ui.fill.classList.toggle("active", tool === "fill");
  ui.palette.querySelectorAll("[data-color]").forEach((button) => {
    button.classList.toggle("active", tool === "pen" && button.dataset.color === selectedColor);
  });
  ui.brushSizes.querySelectorAll("[data-skin-size]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.skinSize) === brushSize);
  });
  ui.presets.querySelectorAll("[data-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === selectedPreset);
  });
}

function setStatus(text) {
  ui.status.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
