const toggle = document.getElementById("settingsToggle");
const panel = document.getElementById("settingsPanel");

if (toggle && panel) {
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" && !panel.hidden) setOpen(false);
  });
}

function setOpen(open) {
  panel.hidden = !open;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  toggle.setAttribute("aria-label", open ? "설정 닫기" : "설정 열기");
  document.body.classList.toggle("settings-open", open);
}
