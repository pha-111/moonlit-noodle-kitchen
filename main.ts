// Moonlit Noodle Kitchen — hand-in program.
//
// Running this file delivers the entry: everything a player needs lives in
// the static `game/` folder next to it, and the photographs of the game in
// action live in `screenshots/`. Both folders are mirrored into the output
// directory and a dossier describing them is generated there with the
// vendored make.fun helper, so the dossier always matches the files.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// When MAKEFUN_OUTPUT_DIR is not set the output directory is `/output`,
// which is where the grading container expects the entry to appear.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const entryRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Limits handed to the dossier builder. They mirror the published gate for
// this bounty: at most four screenshots of 256 KiB each, at most 993 game
// files totalling 48 MiB, no game path longer than 1000 bytes, and the
// dossier text capped at 160 KiB.
const DOSSIER_LIMITS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  game_max_files: 993,
  game_max_bytes: 50_331_648,
  game_path_max_bytes: 1_000,
};

function deliverFolder(name) {
  const from = join(entryRoot, name);
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
deliverFolder("game");
deliverFolder("screenshots");

const dossierText = buildDossier(outputDir, DOSSIER_LIMITS);
writeFileSync(join(outputDir, "dossier.json"), dossierText);
console.log(
  `Moonlit Noodle Kitchen delivered to ${outputDir} (dossier ${dossierText.length} bytes)`,
);
