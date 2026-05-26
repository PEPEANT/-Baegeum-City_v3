export class Input {
  constructor(target = window) {
    this.keys = new Set();
    this.pressed = new Set();
    this.debugPressed = false;
    target.addEventListener("keydown", (event) => this.onKeyDown(event));
    target.addEventListener("keyup", (event) => this.onKeyUp(event));
    window.addEventListener("blur", () => this.clear());
  }

  onKeyDown(event) {
    if (isTypingTarget(event.target)) return;
    if (!this.keys.has(event.code)) this.pressed.add(event.code);
    this.keys.add(event.code);
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  clear() {
    this.keys.clear();
    this.pressed.clear();
  }

  consume(code) {
    const had = this.pressed.has(code);
    this.pressed.delete(code);
    return had;
  }

  press(code) {
    this.pressed.add(code);
  }

  axis(negative, positive) {
    return (this.keys.has(positive) ? 1 : 0) - (this.keys.has(negative) ? 1 : 0);
  }

  movementVector() {
    const x = this.axis("KeyA", "KeyD") || this.axis("ArrowLeft", "ArrowRight");
    const y = this.axis("KeyW", "KeyS") || this.axis("ArrowUp", "ArrowDown");
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length, moving: x !== 0 || y !== 0 };
  }

  endFrame() {
    this.pressed.clear();
  }
}

function isTypingTarget(target) {
  const tag = target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
}
