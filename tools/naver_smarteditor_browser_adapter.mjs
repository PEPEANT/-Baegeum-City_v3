import fs from "node:fs/promises";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loadPayload(payloadPath) {
  return JSON.parse(await fs.readFile(payloadPath, "utf-8"));
}

export async function inspectDraft(tab) {
  return tab.playwright.evaluate(() => {
    const text = document.body.innerText || "";
    const imgs = [...document.querySelectorAll("img")].map((img) => ({
      alt: img.alt || "",
      srcHead: (img.src || "").slice(0, 120),
      width: img.naturalWidth || 0,
      height: img.naturalHeight || 0,
    }));
    return {
      shortAnchors: text.match(/\[\[IMG_\d{3}\]\]/g) || [],
      longPlaceholderCount: (text.match(/\[이미지[^\n]+\]/g) || []).length,
      imgCount: imgs.length,
      imgs,
      hasTitleSignal: text.includes("AI가 다 해줄 줄 알았다"),
      textLength: text.length,
    };
  });
}

export async function pasteTextDraft(tab, payload) {
  const current = await inspectDraft(tab);
  const targetText = current.shortAnchors[0] || "[[IMG_001]]";
  const target = tab.playwright.getByText(targetText, { exact: true });
  const count = await target.count();
  if (count !== 1) {
    throw new Error(`Expected one editor anchor to focus, found ${count}: ${targetText}`);
  }

  await target.click({ timeoutMs: 10000 });
  await sleep(300);
  await tab.clipboard.writeText(payload.body_text);
  await tab.cua.keypress({ keys: ["CTRL", "A"] });
  await sleep(300);
  await tab.cua.keypress({ keys: ["CTRL", "V"] });
  await sleep(2500);
  return inspectDraft(tab);
}

export async function replaceAnchorWithImage(tab, asset) {
  const target = tab.playwright.getByText(asset.anchor, { exact: true });
  const count = await target.count();
  if (count !== 1) {
    throw new Error(`Expected one ${asset.anchor}, found ${count}`);
  }

  await target.click({ timeoutMs: 10000 });
  await sleep(400);
  await tab.cua.keypress({ keys: ["HOME"] });
  await sleep(150);
  await tab.cua.keypress({ keys: ["SHIFT", "END"] });
  await sleep(250);

  const bytes = await fs.readFile(asset.absolute_path);
  await tab.clipboard.write([
    {
      entries: [
        {
          mimeType: asset.mime_type,
          base64: Buffer.from(bytes).toString("base64"),
        },
      ],
    },
  ]);
  await tab.cua.keypress({ keys: ["CTRL", "V"] });
  await sleep(6500);
  return inspectDraft(tab);
}

export async function replaceAnchorsWithImages(tab, payload) {
  const results = [];
  for (const asset of payload.assets) {
    const state = await replaceAnchorWithImage(tab, asset);
    results.push({ anchor: asset.anchor, state });
  }
  return results;
}

export async function saveDraft(tab) {
  const saveButton = tab.playwright.getByRole("button", { name: "저장", exact: true });
  const count = await saveButton.count();
  if (count !== 1) {
    throw new Error(`Expected one save button, found ${count}`);
  }
  await saveButton.click({ timeoutMs: 10000 });
  await sleep(5000);
  return inspectDraft(tab);
}

