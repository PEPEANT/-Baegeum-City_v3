export function drawMapTransitions(ctx, transitions = [], activeTransition = null) {
  for (const transition of transitions) drawBusTerminal(ctx, transition, activeTransition?.id === transition.id);
}

function drawBusTerminal(ctx, transition, active) {
  const rect = transition.rect;
  if (!rect) return;
  ctx.save();
  roundRect(ctx, rect, active ? "#213d4a" : "#29333a", active ? "#ffd36a" : "#7fb2c7", 10);
  ctx.fillStyle = "#10181c";
  ctx.fillRect(rect.x + 18, rect.y + 18, rect.w - 36, 38);
  ctx.fillStyle = active ? "#ffe58b" : "#b9eefc";
  ctx.font = "bold 22px Dotum, '돋움', 'Malgun Gothic', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(transition.label || "시외버스터미널", rect.x + rect.w / 2, rect.y + 38);
  drawBus(ctx, rect.x + 54, rect.y + 82, active);
  ctx.fillStyle = "#e8d7a2";
  ctx.font = "14px Dotum, '돋움', 'Malgun Gothic', sans-serif";
  ctx.fillText(transition.interactionLabel || "이동", rect.x + rect.w / 2, rect.y + rect.h - 22);
  ctx.restore();
}

function drawBus(ctx, x, y, active) {
  ctx.fillStyle = active ? "#e9b949" : "#c58b3c";
  ctx.fillRect(x, y, 250, 42);
  ctx.fillStyle = "#15242d";
  for (let index = 0; index < 5; index += 1) ctx.fillRect(x + 18 + index * 42, y + 8, 28, 18);
  ctx.fillStyle = "#1d1d1b";
  ctx.beginPath();
  ctx.arc(x + 54, y + 46, 14, 0, Math.PI * 2);
  ctx.arc(x + 202, y + 46, 14, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, rect, fill, stroke, radius) {
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.stroke();
}
