"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number.parseInt(process.env.PORT || process.argv[2] || "4173", 10);
const host = process.env.HOST || "127.0.0.1";

const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"]
]);

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store"
  });
  res.end(body);
}

function resolveFile(requestUrl = "/") {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const clean = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(root, clean.replace(/^\/+/, ""));
  return filePath === root || filePath.startsWith(root + path.sep) ? filePath : null;
}

const server = http.createServer((req, res) => {
  if ((req.url || "/") === "/health") {
    send(res, 200, JSON.stringify({ ok: true, service: "baegeum-city-v2" }), "application/json; charset=utf-8");
    return;
  }

  const filePath = resolveFile(req.url || "/");
  if (!filePath) return send(res, 403, "Forbidden");

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return send(res, 404, "Not found");
    const type = mime.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`Baegeum City v2: http://${host}:${port}/index.html`);
});
