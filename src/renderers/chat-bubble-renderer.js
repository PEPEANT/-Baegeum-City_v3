export function drawChatBubble(ctx, game, entity) {
  const bubble = game.chat?.bubbleFor(entity);
  if (!bubble) return;
  const text = bubble.text.length > 42 ? `${bubble.text.slice(0, 42)}...` : bubble.text;
  ctx.save();
  ctx.font = "500 13px 'Malgun Gothic', sans-serif";
  const paddingX = 10;
  const width = Math.min(240, ctx.measureText(text).width + paddingX * 2);
  const height = 27;
  const x = entity.x - width / 2;
  const y = entity.y - entity.radius - 76;
  ctx.fillStyle = "rgba(17, 24, 22, 0.88)";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.fillStyle = "#fff8dc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, entity.x, y + height / 2);
  ctx.restore();
}
