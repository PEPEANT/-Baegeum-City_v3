export function drawHorseRacingInteriorProp(ctx, prop) {
  if (prop.role === "horse-scoreboard") return drawScoreboard(ctx, prop);
  if (prop.role === "horse-track") return drawTrack(ctx, prop);
  if (prop.role === "horse-grandstand") return drawGrandstand(ctx, prop);
  if (prop.role === "horse-betting-station") return drawBettingStation(ctx, prop);
  return false;
}

function drawScoreboard(ctx, prop) {
  panel(ctx, prop, "#030303", "#4a4a4a", 8);
  const split = prop.x + Math.round(prop.w * 0.42);
  ctx.fillStyle = "#080808";
  ctx.fillRect(prop.x + 8, prop.y + 8, split - prop.x - 12, prop.h - 16);
  ctx.fillStyle = "#050505";
  ctx.fillRect(split, prop.y + 8, prop.x + prop.w - split - 8, prop.h - 16);
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(split, prop.y + 10);
  ctx.lineTo(split, prop.y + prop.h - 10);
  ctx.stroke();
  drawScoreboardTitle(ctx, prop, split);
  drawHorseRows(ctx, prop, split);
  drawLedOverlay(ctx, prop);
  return true;
}

function drawScoreboardTitle(ctx, prop, split) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fbbf24";
  ctx.shadowColor = "rgba(251, 191, 36, 0.85)";
  ctx.shadowBlur = 14;
  ctx.font = "bold 34px 'Black Han Sans', 'Malgun Gothic', sans-serif";
  ctx.fillText(prop.label || "황금말대회", (prop.x + split) / 2, prop.y + 62);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#9a6a12";
  ctx.font = "12px 'Share Tech Mono', monospace";
  ctx.fillText("GOLDEN HORSE DERBY", (prop.x + split) / 2, prop.y + 104);
  ctx.restore();
}

function drawHorseRows(ctx, prop, split) {
  const rows = prop.horses || [];
  const x = split + 24;
  const cols = [0, 48, 216, 300];
  ctx.save();
  ctx.font = "12px 'Share Tech Mono', monospace";
  ctx.fillStyle = "#94a3b8";
  ["NO", "NAME", "ODDS", "STATUS"].forEach((label, index) => ctx.fillText(label, x + cols[index], prop.y + 30));
  rows.forEach((row, index) => {
    const y = prop.y + 52 + index * 18;
    ctx.fillStyle = row[3] === "WARNING" ? "#ef4444" : "#4ade80";
    row.forEach((value, col) => ctx.fillText(value, x + cols[col], y));
  });
  ctx.restore();
}

function drawLedOverlay(ctx, prop) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  for (let y = prop.y + 10; y < prop.y + prop.h; y += 4) line(ctx, prop.x + 8, y, prop.x + prop.w - 8, y);
  for (let x = prop.x + 8; x < prop.x + prop.w; x += 4) line(ctx, x, prop.y + 8, x, prop.y + prop.h - 8);
  ctx.restore();
}

function drawTrack(ctx, prop) {
  panel(ctx, prop, "#14532d", "#78350f", 12);
  for (let x = prop.x; x < prop.x + prop.w; x += 96) {
    ctx.fillStyle = x / 96 % 2 < 1 ? "rgba(20, 83, 45, 0.8)" : "rgba(22, 101, 52, 0.82)";
    ctx.fillRect(x, prop.y + 8, Math.min(96, prop.x + prop.w - x), prop.h - 16);
  }
  drawTrackLines(ctx, prop);
  return true;
}

function drawTrackLines(ctx, prop) {
  const laneHeight = prop.h / (prop.lanes || 5);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.setLineDash([10, 10]);
  for (let lane = 1; lane < (prop.lanes || 5); lane += 1) line(ctx, prop.x + 8, prop.y + laneHeight * lane, prop.x + prop.w - 8, prop.y + laneHeight * lane);
  ctx.setLineDash([]);
  ctx.fillStyle = "#fff";
  ctx.fillRect(prop.x + 54, prop.y + 8, 8, prop.h - 16);
  drawFinishLine(ctx, prop.x + prop.w - 82, prop.y + 8, 30, prop.h - 16);
}

function drawFinishLine(ctx, x, y, w, h) {
  const cell = 15;
  for (let yy = y; yy < y + h; yy += cell) {
    for (let xx = x; xx < x + w; xx += cell) {
      ctx.fillStyle = ((xx + yy) / cell) % 2 === 0 ? "#fff" : "#111";
      ctx.fillRect(xx, yy, cell, cell);
    }
  }
}

function drawGrandstand(ctx, prop) {
  panel(ctx, prop, "#1a0505", "#0a0a0a", 4);
  ctx.fillStyle = "#4b5563";
  ctx.fillRect(prop.x + 24, prop.y + 10, prop.w - 48, 4);
  const rows = prop.rows || 3;
  const sections = prop.sections || 4;
  const seats = prop.seatsPerSection || 18;
  const startY = prop.y + 25;
  for (let row = 0; row < rows; row += 1) drawSeatRow(ctx, prop, startY + row * 20, sections, seats);
  return true;
}

function drawSeatRow(ctx, prop, y, sections, seats) {
  const seatW = 8;
  const gap = 2;
  const aisle = 25;
  const total = sections * seats * (seatW + gap) + (sections - 1) * aisle;
  let x = prop.x + (prop.w - total) / 2;
  for (let section = 0; section < sections; section += 1) {
    for (let seat = 0; seat < seats; seat += 1) {
      ctx.fillStyle = "#7f1d1d";
      roundRect(ctx, { x, y, w: seatW, h: 12 }, 3);
      x += seatW + gap;
    }
    x += aisle;
  }
}

function drawBettingStation(ctx, prop) {
  panel(ctx, prop, "#1e1e1e", "#4a4a4a", 8);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  roundRect(ctx, { x: prop.x + prop.w / 2 - 118, y: prop.y + 9, w: 236, h: 24 }, 12);
  ctx.strokeStyle = "#d4af37";
  ctx.stroke();
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 16px 'Malgun Gothic', sans-serif";
  ctx.fillText(prop.label || "티켓 & 배팅", prop.x + prop.w / 2, prop.y + 22);
  ctx.restore();
  drawWindows(ctx, prop);
  return true;
}

function drawWindows(ctx, prop) {
  const count = prop.windows || 4;
  const gap = prop.w / (count + 1);
  for (let index = 0; index < count; index += 1) {
    const cx = prop.x + gap * (index + 1);
    const vip = index === 2;
    panel(ctx, { x: cx - 42, y: prop.y + 42, w: 84, h: 36 }, "#2d2d2d", vip ? "#d4af37" : "#555", 5);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(cx - 28, prop.y + 49, 56, 16);
    ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
    ctx.font = "8px 'Share Tech Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CLOSED", cx, prop.y + 61);
    ctx.fillStyle = vip ? "#3f2e05" : "#5c4033";
    ctx.fillRect(cx - 50, prop.y + 76, 100, 7);
  }
}

function panel(ctx, rect, fill, stroke, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, rect, radius) {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
