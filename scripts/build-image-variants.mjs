#!/usr/bin/env node
/**
 * CJP responsive image variants (new-client-build/assets/responsive-images).
 * Runs as `prebuild` and `predev`. Writes every raster image under public/
 * at the widths in WIDTHS to public/_v/<w>/<same path>.webp (gitignored), so
 * lib/image-loader.ts can give next/image a real srcset WITHOUT Vercel's
 * /_next/image optimizer (account-wide quota, 402 outages; never use it).
 *
 * Never upscales (a width above native gets a native-size copy so the URL
 * exists). Skips outputs newer than their source, so local re-runs are fast.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTHS = [384, 640, 960, 1280, 1920]; // keep in sync with lib/image-loader.ts
const QUALITY = 72;
const EXT = /\.(jpe?g|png|webp)$/i;

const pub = path.join(process.cwd(), "public");
const outRoot = path.join(pub, "_v");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p !== outRoot && !e.name.startsWith(".")) walk(p, acc);
    } else if (EXT.test(e.name)) acc.push(p);
  }
  return acc;
}

const files = walk(pub);
let written = 0, skipped = 0, failed = 0;
const t0 = Date.now();
const queue = [...files];
async function worker() {
  for (let src; (src = queue.shift()); ) {
    const rel = path.relative(pub, src).replace(EXT, ".webp");
    const mtime = fs.statSync(src).mtimeMs;
    let native;
    try { native = (await sharp(src).metadata()).width; } catch { failed++; continue; }
    for (const w of WIDTHS) {
      const out = path.join(outRoot, String(w), rel);
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= mtime) { skipped++; continue; }
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await sharp(src).rotate().resize({ width: Math.min(w, native), withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 }).toFile(out);
      written++;
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log(`image variants: ${files.length} images, ${written} written, ${skipped} up to date, ${failed} unreadable (${Date.now() - t0} ms)`);
if (failed) process.exitCode = 1; // an unreadable image would 404 through the loader
