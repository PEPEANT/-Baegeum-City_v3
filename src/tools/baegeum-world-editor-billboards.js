import { billboardAdOptions, isBillboard, resolveBillboardAd, setBillboardAdId } from "../data/billboard-ads.js";
import { selectedItem } from "./baegeum-world-editor-utils.js";

export function initBillboardAdControls(ui, state, onChange) {
  ui.billboardAdGrid.innerHTML = "";
  for (const ad of billboardAdOptions()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ad-card";
    button.dataset.adId = ad.id;
    button.innerHTML = `<span class="ad-preview"><b></b><small></small></span><strong></strong>`;
    button.querySelector(".ad-preview").style.background = `linear-gradient(135deg, ${ad.bg}, ${ad.bg} 65%, ${ad.accent})`;
    button.querySelector(".ad-preview").style.color = ad.fg;
    button.querySelector(".ad-preview b").textContent = ad.headline;
    button.querySelector(".ad-preview small").textContent = ad.tagline;
    button.querySelector("strong").textContent = ad.label;
    button.addEventListener("click", () => {
      const item = selectedItem(state);
      const next = setBillboardAdId(item, ad.id);
      state.billboardAdPaletteOpen = false;
      if (next) onChange(`${next.label} 광고로 변경됨.`);
    });
    ui.billboardAdGrid.appendChild(button);
  }
  ui.openBillboardAd.addEventListener("click", () => {
    state.billboardAdPaletteOpen = true;
    onChange("광고판 팔레트 열림.");
  });
  ui.closeBillboardAd.addEventListener("click", () => {
    state.billboardAdPaletteOpen = false;
    onChange("광고판 팔레트 닫힘.");
  });
}

export function syncBillboardAdControls(ui, state) {
  const item = selectedItem(state);
  const billboard = isBillboard(item);
  const ad = billboard ? resolveBillboardAd(item) : null;
  if (!billboard) state.billboardAdPaletteOpen = false;
  ui.openBillboardAd.hidden = !billboard;
  ui.billboardAdPalette.hidden = !(billboard && state.billboardAdPaletteOpen);
  for (const button of ui.billboardAdGrid.querySelectorAll("[data-ad-id]")) {
    button.classList.toggle("active", button.dataset.adId === ad?.id);
  }
}
