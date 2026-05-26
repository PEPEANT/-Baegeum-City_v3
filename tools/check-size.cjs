"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const roots = ["src", "tools"].map((name) => path.join(root, name)).filter(fs.existsSync);
const maxLines = 300;
const maxFunctionWarn = 100;
const warnings = [];

function walk(dir, output = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === "node_modules" || item.name === ".git") continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, output);
    else if (/\.(js|cjs)$/i.test(item.name)) output.push(full);
  }
  return output;
}

function relative(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function checkSyntax(file) {
  execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
}

function longestFunctionSpan(lines) {
  let longest = 0;
  let start = -1;
  let depth = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (start < 0 && /(function\b|=>\s*\{|^\s*(async\s+)?[a-zA-Z0-9_$]+\([^)]*\)\s*\{)/.test(line)) {
      start = index;
      depth = 0;
    }
    if (start >= 0) {
      depth += (line.match(/\{/g) || []).length;
      depth -= (line.match(/\}/g) || []).length;
      if (depth <= 0 && index > start) {
        longest = Math.max(longest, index - start + 1);
        start = -1;
      }
    }
  }
  return longest;
}

const files = roots.flatMap((dir) => walk(dir));
for (const file of files) {
  checkSyntax(file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  if (lines.length > maxLines) {
    throw new Error(`${relative(file)} has ${lines.length} lines; limit is ${maxLines}.`);
  }
  const longest = longestFunctionSpan(lines);
  if (longest > maxFunctionWarn) warnings.push(`${relative(file)} longest function is ${longest} lines.`);
}

console.log(`Syntax and size check passed for ${files.length} JavaScript files.`);
for (const warning of warnings) console.warn(`Warning: ${warning}`);
