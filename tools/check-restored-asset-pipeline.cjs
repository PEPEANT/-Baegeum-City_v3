const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const DOC_PATH = path.join(ROOT, "docs", "baegeum-city-v2-restored-asset-pipeline.md");
const INDEX_PATH = path.join(ROOT, "docs", "INDEX.md");
const MANIFEST_PATH = path.join(ROOT, "src", "restored", "assets", "asset-manifest.js");
const ASSETS_ROOT = path.join(ROOT, "assets");
const TRACKED_EXTENSIONS = new Set([".mp3", ".ogg", ".wav", ".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const INBOX_PREFIX = "assets/inbox/";

function normalizeRelative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isInboxFile(filePath) {
  return normalizeRelative(filePath).startsWith(INBOX_PREFIX);
}

async function main() {
  const errors = [];

  if (!fs.existsSync(DOC_PATH)) {
    errors.push("Missing restored asset pipeline document.");
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    errors.push("Missing restored asset manifest module.");
  }

  const indexText = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, "utf8") : "";
  if (!indexText.includes("baegeum-city-v2-restored-asset-pipeline.md")) {
    errors.push("docs/INDEX.md must link the restored asset pipeline document.");
  }

  const docText = fs.existsSync(DOC_PATH) ? fs.readFileSync(DOC_PATH, "utf8") : "";
  for (const requiredText of [
    "assets/restored/audio",
    "assets/restored/images",
    "assets/inbox/",
    "src/restored/assets/asset-manifest.js",
    "tools/check-restored-asset-pipeline.cjs"
  ]) {
    if (!docText.includes(requiredText)) {
      errors.push(`Asset pipeline doc must mention ${requiredText}.`);
    }
  }

  if (fs.existsSync(MANIFEST_PATH)) {
    const manifestModule = await import(pathToFileURL(MANIFEST_PATH).href);
    const manifest = manifestModule.RESTORED_ASSET_MANIFEST || [];
    const manifestErrors = manifestModule.validateRestoredAssetManifest
      ? manifestModule.validateRestoredAssetManifest(manifest)
      : ["Manifest module must export validateRestoredAssetManifest."];

    errors.push(...manifestErrors);

    const manifestPaths = new Set();
    for (const asset of manifest) {
      if (!asset.path) continue;
      const normalizedPath = asset.path.replace(/\\/g, "/");
      manifestPaths.add(normalizedPath);

      const absoluteAssetPath = path.join(ROOT, normalizedPath);
      if (!fs.existsSync(absoluteAssetPath)) {
        errors.push(`${asset.id} points at missing file: ${normalizedPath}`);
      }
    }

    const trackedFiles = walkFiles(ASSETS_ROOT)
      .filter((filePath) => !isInboxFile(filePath))
      .filter((filePath) => TRACKED_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
      .map(normalizeRelative)
      .sort();

    for (const filePath of trackedFiles) {
      if (!manifestPaths.has(filePath)) {
        errors.push(`Tracked asset file is missing from restored manifest: ${filePath}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("Restored asset pipeline check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("Restored asset pipeline check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
