export function drawCityBoundaryObstacles(ctx, obstacles = []) {
  for (const item of obstacles || []) {
    if (item?.kind === "city-boundary") drawCityBoundaryObstacle(ctx, item);
  }
  drawCustomizedBuildingShells(ctx, obstacles);
}

export function drawCityBoundaryObstacle(ctx, item) {
  const rect = normalizeRect(item);
  ctx.save();
  drawWallBase(ctx, rect);
  drawWallSeams(ctx, rect);
  if (String(item.variant || "").includes("tunnel")) drawTunnelMouth(ctx, rect);
  ctx.restore();
}

function drawWallBase(ctx, rect) {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  gradient.addColorStop(0, "#8f8879");
  gradient.addColorStop(0.5, "#6e6a61");
  gradient.addColorStop(1, "#4b4a45");
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  roundRect(ctx, rect.x + 5, rect.y + 6, rect.w, rect.h, 6);
  ctx.fill();
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(246, 226, 174, 0.22)";
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 6);
  ctx.fill();
  ctx.stroke();
}

function drawWallSeams(ctx, rect) {
  const horizontal = rect.w >= rect.h;
  const length = horizontal ? rect.w : rect.h;
  const count = Math.max(2, Math.floor(length / 96));
  ctx.strokeStyle = "rgba(36, 34, 30, 0.34)";
  ctx.lineWidth = 2;
  for (let i = 1; i < count; i += 1) {
    const t = i / count;
    ctx.beginPath();
    if (horizontal) {
      const x = rect.x + rect.w * t;
      ctx.moveTo(x, rect.y + 6);
      ctx.lineTo(x, rect.y + rect.h - 6);
    } else {
      const y = rect.y + rect.h * t;
      ctx.moveTo(rect.x + 6, y);
      ctx.lineTo(rect.x + rect.w - 6, y);
    }
    ctx.stroke();
  }
}

function drawTunnelMouth(ctx, rect) {
  const horizontal = rect.w >= rect.h;
  const mouth = horizontal
    ? { w: Math.min(320, rect.w * 0.34), h: Math.max(24, rect.h * 0.62) }
    : { w: Math.max(24, rect.w * 0.62), h: Math.min(320, rect.h * 0.34) };
  const x = rect.x + (rect.w - mouth.w) / 2;
  const y = rect.y + (rect.h - mouth.h) / 2;
  const gradient = ctx.createLinearGradient(x, y, x + mouth.w, y + mouth.h);
  gradient.addColorStop(0, "#11100f");
  gradient.addColorStop(1, "#2b2924");
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(245, 214, 142, 0.34)";
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, mouth.w, mouth.h, Math.min(18, mouth.h * 0.35));
  ctx.fill();
  ctx.stroke();
}

function normalizeRect(item) {
  return {
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    w: Math.max(1, Number(item.w) || 1),
    h: Math.max(1, Number(item.h) || 1)
  };
}

function drawCustomizedBuildingShells(ctx, obstacles) {
  for (const item of obstacles || []) {
    if (!isCustomizedBuildingShell(item)) continue;
    const rect = normalizeRect(item);
    ctx.save();
    if (validHex(item.shellColor)) drawShellColor(ctx, rect, item.shellColor);
    if (item.shellName) drawShellName(ctx, rect, item.shellName);
    ctx.restore();
  }
}

function isCustomizedBuildingShell(item) {
  return item?.kind === "building" && item.objectKind === "building_shell" && (validHex(item.shellColor) || Boolean(item.shellName));
}

function drawShellColor(ctx, rect, color) {
  ctx.fillStyle = `${color}b8`;
  ctx.strokeStyle = "rgba(255, 244, 196, 0.38)";
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x + 4, rect.y + 4, Math.max(1, rect.w - 8), Math.max(1, rect.h - 8), 5);
  ctx.fill();
  ctx.stroke();
}

function drawShellName(ctx, rect, name) {
  const label = String(name).slice(0, 24);
  const x = rect.x + rect.w * 0.5;
  const y = rect.y - 32;
  ctx.font = "bold 19px 'Malgun Gothic', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(86, ctx.measureText(label).width + 24);
  ctx.fillStyle = "rgba(22, 28, 24, 0.92)";
  ctx.strokeStyle = "rgba(255, 215, 102, 0.82)";
  ctx.lineWidth = 2;
  roundRect(ctx, x - width / 2, y - 17, width, 34, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffe186";
  ctx.fillText(label, x, y + 1);
}

function validHex(value) {
  return /^#[0-9a-f]{6}$/u.test(String(value || "").toLowerCase());
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
}
