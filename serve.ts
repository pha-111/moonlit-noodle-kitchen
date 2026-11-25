// A small static file server used only while developing the game.
//   node serve.ts            -> http://localhost:8080
//   node serve.ts --port 9000
// It serves the files under game/ and nothing else.

import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const gameRoot = resolve(fileURLToPath(new URL("./game", import.meta.url)));

const portFlag = process.argv.indexOf("--port");
const wantedPort = portFlag >= 0 ? Number(process.argv[portFlag + 1]) : 8080;
const listenPort =
  Number.isInteger(wantedPort) && wantedPort > 0 && wantedPort < 65_536
    ? wantedPort
    : 8080;

const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".wav", "audio/wav"],
  [".mp3", "audio/mpeg"],
]);

const server = createServer((req, res) => {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  if (decodedPath.endsWith("/")) decodedPath += "index.html";

  const target = resolve(join(gameRoot, normalize(decodedPath)));
  if (target !== gameRoot && !target.startsWith(gameRoot + sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }

  let body;
  try {
    if (!statSync(target).isFile()) throw new Error("directory");
    body = readFileSync(target);
  } catch {
    res.writeHead(404).end("not found");
    return;
  }

  res.writeHead(200, {
    "content-type": CONTENT_TYPES.get(extname(target).toLowerCase()) ?? "application/octet-stream",
    "content-length": body.length,
    "cache-control": "no-store",
  });
  res.end(body);
});

server.listen(listenPort, "127.0.0.1", () => {
  console.log(`Serving Moonlit Noodle Kitchen at http://localhost:${listenPort}`);
});
