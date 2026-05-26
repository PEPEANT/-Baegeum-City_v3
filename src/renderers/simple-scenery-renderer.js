import { drawBillboardAd } from "./billboard-ad-renderer.js";

export function drawSimpleScenery(ctx, scenery = []) {
  for (const item of scenery || []) {
    if (item.type === "tree") drawTree(ctx, item);
    else if (item.type === "brush") drawBrush(ctx, item);
    else if (item.type === "streetlight") drawStreetlight(ctx, item);
    else if (item.type === "billboard") drawBillboard(ctx, item);
  }
}

function drawTree(ctx, item) {
  const radius = item.r || 48;
  ctx.save();
  ctx.fillStyle = "rgba(23, 30, 20, 0.26)";
  ctx.beginPath();
  ctx.ellipse(item.x + 8, item.y + 12, radius * 0.82, radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = item.variant === "pine" ? "#243f2a" : "#2f5832";
  ctx.beginPath();
  ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(166, 198, 115, 0.28)";
  ctx.beginPath();
  ctx.arc(item.x - radius * 0.28, item.y - radius * 0.24, radius * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBrush(ctx, item) {
  const radius = item.r || 68;
  ctx.save();
  ctx.fillStyle = "rgba(46, 81, 45, 0.62)";
  ctx.beginPath();
  ctx.ellipse(item.x, item.y, radius, radius * 0.5, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(132, 156, 88, 0.32)";
  ctx.beginPath();
  ctx.ellipse(item.x - radius * 0.18, item.y - 6, radius * 0.42, radius * 0.18, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStreetlight(ctx, item) {
  ctx.save();
  ctx.fillStyle = "#343a38";
  ctx.fillRect(item.x + 12, item.y + 22, 6, item.h || 108);
  ctx.fillStyle = "#59615d";
  ctx.fillRect(item.x + 6, item.y + 18, 32, 8);
  ctx.fillStyle = "rgba(255, 218, 118, 0.28)";
  ctx.beginPath();
  ctx.arc(item.x + 30, item.y + 30, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe08a";
  ctx.beginPath();
  ctx.arc(item.x + 30, item.y + 30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBillboard(ctx, item) {
  const w = item.w || 168;
  const h = item.h || 74;
  ctx.save();
  ctx.fillStyle = "#2c2e2c";
  ctx.fillRect(item.x + w * 0.18, item.y + h * 0.8, 8, 42);
  ctx.fillRect(item.x + w * 0.74, item.y + h * 0.8, 8, 42);
  roundedRect(ctx, item.x, item.y, w, h, 8, "#151817", "#8f7840");
  drawBillboardAd(ctx, item);
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, radius, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.stroke();
}
