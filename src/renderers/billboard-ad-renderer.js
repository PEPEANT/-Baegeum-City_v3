import { resolveBillboardAd } from "../data/billboard-ads.js";

if (typeof window !== "undefined") installBillboardAdRenderer(window.IronLine);

export function installBillboardAdRenderer(ironLine = globalThis.window?.IronLine) {
  const proto = ironLine?.Renderer?.prototype;
  if (!proto?.drawBillboardScenery || proto.__baegeumBillboardAds) return false;
  const baseDraw = proto.drawBillboardScenery;
  proto.drawBillboardScenery = function drawBaegeumBillboard(item) {
    baseDraw.call(this, item);
    drawBillboardAd(this.ctx, item);
  };
  proto.__baegeumBillboardAds = true;
  return true;
}

export function drawBillboardAd(ctx, item) {
  const ad = resolveBillboardAd(item);
  const w = item.w || 150;
  const h = item.h || 64;
  const damage = item.maxHp ? Math.max(0, Math.min(1, 1 - (item.hp || 0) / item.maxHp)) : 0;
  const box = { x: w * 0.055, y: h * 0.075, w: w * 0.89, h: h * 0.55 };
  ctx.save();
  ctx.translate(item.x + w * 0.5, item.y + h * 0.5);
  ctx.rotate(item.angle || 0);
  ctx.translate(-w * 0.5, -h * 0.5);
  clipRound(ctx, box, 4);
  drawBackground(ctx, ad, box, damage);
  drawAdMark(ctx, ad, box);
  drawAdCopy(ctx, ad, box);
  ctx.restore();
}

function drawBackground(ctx, ad, box, damage) {
  const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
  gradient.addColorStop(0, ad.bg);
  gradient.addColorStop(1, shade(ad.bg, -24 - damage * 28));
  ctx.fillStyle = gradient;
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = ad.accent;
  ctx.fillRect(box.x + box.w * 0.62, box.y - box.h * 0.15, box.w * 0.5, box.h * 1.3);
  ctx.globalAlpha = damage > 0.4 ? 0.24 : 0.12;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(box.x + box.w * (0.08 + i * 0.18), box.y);
    ctx.lineTo(box.x + box.w * (0.28 + i * 0.18), box.y + box.h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawAdMark(ctx, ad, box) {
  const size = box.h * 0.48;
  const x = box.x + box.w * 0.12;
  const y = box.y + box.h * 0.5;
  ctx.fillStyle = ad.fg;
  ctx.font = `italic 900 ${size}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ad.icon, x, y + size * 0.04);
  ctx.strokeStyle = ad.fg;
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.beginPath();
  ctx.moveTo(x + size * 0.38, y);
  ctx.lineTo(x + size * 0.72, y - size * 0.1);
  ctx.lineTo(x + size * 0.92, y + size * 0.05);
  ctx.stroke();
}

function drawAdCopy(ctx, ad, box) {
  const mainSize = Math.max(11, box.h * 0.36);
  ctx.fillStyle = ad.fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `italic 900 ${mainSize}px Arial, sans-serif`;
  ctx.fillText(ad.headline, box.x + box.w * 0.25, box.y + box.h * 0.42, box.w * 0.68);
  ctx.fillStyle = ad.accent;
  ctx.font = `500 ${Math.max(7, box.h * 0.18)}px Arial, sans-serif`;
  ctx.fillText(ad.tagline, box.x + box.w * 0.34, box.y + box.h * 0.74, box.w * 0.58);
}

function clipRound(ctx, box, radius) {
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, radius);
  ctx.clip();
}

function shade(hex, amount) {
  const value = hex.replace("#", "");
  const next = [0, 2, 4].map((start) => {
    const channel = Math.max(0, Math.min(255, parseInt(value.slice(start, start + 2), 16) + amount));
    return channel.toString(16).padStart(2, "0");
  });
  return `#${next.join("")}`;
}
