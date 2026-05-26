import { drawDrawingWorldCharacter, getPlayableSkinPresets } from "./drawing-world-adapter.js";

export function startSkinStage(canvas, getCurrentSkin) {
  const ctx = canvas.getContext("2d");

  function frame() {
    resize(ctx, canvas);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    drawFloor(ctx, width, height);
    drawCharacters(ctx, width, height, getCurrentSkin());
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => resize(ctx, canvas));
  requestAnimationFrame(frame);
}

function resize(ctx, canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.floor(canvas.clientWidth));
  const height = Math.max(260, Math.floor(canvas.clientHeight));
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFloor(ctx, width, height) {
  ctx.fillStyle = "#e7e6bf";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(47, 63, 46, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 38) line(ctx, x, 0, x, height);
  for (let y = 0; y < height; y += 38) line(ctx, 0, y, width, y);
  ctx.fillStyle = "rgba(167, 85, 45, 0.16)";
  ctx.fillRect(0, height * 0.72, width, 36);
}

function drawCharacters(ctx, width, height, currentSkin) {
  const y = height * 0.56;
  const presets = getPlayableSkinPresets();
  const columns = Math.max(3, Math.floor((width - 150) / 78));
  drawDrawingWorldCharacter(ctx, { name: "YOU", x: 74, y, skin: currentSkin, moving: true }, { size: 64 });
  presets.forEach((preset, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 150 + column * 78;
    const previewY = y - 34 + row * 68;
    if (previewY > height - 34) return;
    drawDrawingWorldCharacter(ctx, {
      name: preset.name,
      x,
      y: previewY + Math.sin(Date.now() / 500 + index) * 6,
      skinPreset: preset.id,
      facing: index % 2 ? -1 : 1,
      moving: true
    }, { size: 48 });
  });
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
