#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".wav"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const IMAGE_FOLDER_BY_ROLE = {
  partner: "partners",
  item: "items",
  background: "backgrounds",
  ui: "ui",
  city: "city",
  casino: "casino",
  phone: "phone"
};

function parseArgs(argv) {
  const args = { input: "", flags: {} };
  for (const part of argv) {
    if (part.startsWith("--")) {
      const [key, value] = part.slice(2).split("=");
      args.flags[key] = value === undefined ? true : value;
    } else if (!args.input) {
      args.input = part;
    }
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Restored material intake

Usage:
  node tools/intake-restored-material.cjs "<file-or-url>" [--kind=asset|github|note] [--role=partner|bgm] [--id=asset:id] [--name=Name] [--write] [--force]

Examples:
  node tools/intake-restored-material.cjs "assets/inbox/partner.png" --role=partner --id=image:partner:college-student:portrait-neutral
  node tools/intake-restored-material.cjs "assets/inbox/casino-bgm.mp3" --role=bgm --id=audio:bgm:casino-night:loop --write
  node tools/intake-restored-material.cjs "https://github.com/owner/repo" --kind=github --name=RepoName --write
`);
}

function isUrl(value) {
  return /^https?:\/\//i.test(value);
}

function isGithubUrl(value) {
  return /^https:\/\/github\.com\/[^/]+\/[^/\s#?]+/i.test(value);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "intake";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function detectKind(input, flags) {
  if (flags.kind) return flags.kind;
  if (isGithubUrl(input)) return "github";
  if (isUrl(input)) return "note";

  const extension = path.extname(input).toLowerCase();
  if (AUDIO_EXTENSIONS.has(extension) || IMAGE_EXTENSIONS.has(extension)) return "asset";
  return "note";
}

function detectAssetType(input) {
  const extension = path.extname(input).toLowerCase();
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  return "";
}

function defaultRole(type) {
  return type === "audio" ? "bgm" : "preview";
}

function normalizePath(value) {
  return value.replace(/\\/g, "/");
}

function buildTargetPath(input, type, role) {
  const fileName = path.basename(input);
  if (type === "audio") {
    return normalizePath(path.join("assets", "restored", "audio", role, fileName));
  }

  const folder = IMAGE_FOLDER_BY_ROLE[role];
  if (folder) return normalizePath(path.join("assets", "restored", "images", folder, fileName));
  return normalizePath(path.join("assets", "restored", "source", "generated", fileName));
}

function buildAssetId(input, type, role, flags) {
  if (flags.id) return flags.id;
  const baseName = path.basename(input, path.extname(input));
  return `${type}:${role}:${slugify(baseName)}`;
}

function buildAssetCard(input, flags) {
  const type = detectAssetType(input);
  if (!type) throw new Error(`Unsupported asset extension: ${input}`);

  const role = flags.role || defaultRole(type);
  const id = buildAssetId(input, type, role, flags);
  const targetPath = flags.target || buildTargetPath(input, type, role);
  const source = flags.source || "human-provided";
  const status = flags.status || "intake-staged";

  return {
    kind: "asset",
    slug: slugify(id),
    markdown: `# Asset Intake: ${id}

- Received: ${today()}
- Source file: ${input}
- Type: ${type}
- Role: ${role}
- Proposed id: ${id}
- Proposed target: ${targetPath}
- Source: ${source}
- Status: ${status}

## Manifest Candidate

\`\`\`js
{
  id: "${id}",
  type: "${type}",
  role: "${role}",
  path: "${targetPath}",
  source: "${source}",
  status: "${status}"
}
\`\`\`

## Next

1. Confirm source/license/fit.
2. Move or copy the approved file to the proposed target.
3. Register the manifest entry in \`src/restored/assets/asset-manifest.js\`.
4. Run \`npm run check\`.
`
  };
}

function repoNameFromUrl(input, flags) {
  if (flags.name) return flags.name;
  const match = input.match(/^https:\/\/github\.com\/([^/]+)\/([^/\s#?]+)/i);
  if (!match) return "Reference";
  return match[2].replace(/\.git$/i, "");
}

function buildGithubCard(input, flags) {
  const name = repoNameFromUrl(input, flags);
  const use = flags.use || "restored Baegeum City reference";
  return {
    kind: "github",
    slug: slugify(`github-${name}`),
    markdown: `# GitHub Intake: ${name}

- Repository: ${input}
- Added: ${today()}
- Status: pinned reference
- Use: ${use}
- Import decision: reference only until license, structure, and fit are reviewed.

## refs/github-reference-systems.md Candidate

\`\`\`text
### ${name}

- Repository: ${input}
- Added: ${today()}
- Status: pinned reference
- Use: ${use}
- Import decision: reference only until license, structure, and fit are reviewed.
\`\`\`
`
  };
}

function buildNoteCard(input, flags) {
  const name = flags.name || slugify(input);
  return {
    kind: "note",
    slug: slugify(`note-${name}`),
    markdown: `# Intake Note: ${name}

- Added: ${today()}
- Source: ${input}
- Status: review needed

## Next

Decide whether this becomes a doc update, catalog entry, asset manifest entry, or reference-only note.
`
  };
}

function cardPath(card) {
  if (card.kind === "asset") return path.join(ROOT, "assets", "inbox", `${card.slug}.intake.md`);
  return path.join(ROOT, "refs", "intake", `${card.slug}.md`);
}

function writeCard(card, flags) {
  const outputPath = cardPath(card);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  if (fs.existsSync(outputPath) && !flags.force) {
    throw new Error(`Intake card already exists: ${path.relative(ROOT, outputPath)}. Use --force to overwrite.`);
  }
  fs.writeFileSync(outputPath, card.markdown, "utf8");
  return outputPath;
}

function main() {
  const { input, flags } = parseArgs(process.argv.slice(2));
  if (!input || flags.help) {
    printHelp();
    return;
  }

  const kind = detectKind(input, flags);
  const card = kind === "asset"
    ? buildAssetCard(input, flags)
    : kind === "github"
      ? buildGithubCard(input, flags)
      : buildNoteCard(input, flags);

  if (flags.write) {
    const outputPath = writeCard(card, flags);
    process.stdout.write(`Wrote ${path.relative(ROOT, outputPath)}\n`);
  } else {
    process.stdout.write(card.markdown);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
