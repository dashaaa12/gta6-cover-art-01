// main.ts — hands in the Neon Coast Cover Studio entry.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json with the kit's buildDossier, so the
// dossier is byte for byte what the scorer rebuilds from the same files.
//
// Grader-proofing: the repository is read-only and the working directory is
// not guaranteed, so the source tree is resolved from MAKEFUN_BOT_DIR and
// falls back to this script's own directory. The output directory is a
// mount point, so its contents are emptied and it is never deleted itself.
// Copies walk entries in sorted order so two runs hand in identical trees.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.MAKEFUN_BOT_DIR || scriptDir;
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  const entries = readdirSync(sourceDir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const from = join(sourceDir, entry.name);
    const to = join(targetDir, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) cpSync(from, to);
  }
}

mkdirSync(outputDir, { recursive: true });
for (const name of readdirSync(outputDir)) {
  rmSync(join(outputDir, name), { recursive: true, force: true });
}

copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
}));
