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
 *
 * Privacy (2026-11-14, Ranked SEO Playbook #565/#414): the variants carry no
 * EXIF (sharp drops it on output), but the ORIGINAL under public/ is served
 * too (og:image, direct links). A job photo straight off a phone carries the
 * customer's home in its GPS tags. Any original with a GPS IFD fails the build
 * here, naming the file; strip it (exiftool -gps:all= <file>, or re-export)
 * and commit the clean bytes. Detection: the GPSInfo pointer entry (tag
 * 0x8825, type LONG, count 1) in either byte order, which is how every camera
 * writes it; no EXIF parser needed.
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

const GPS_IFD_BE = Buffer.from([0x88, 0x25, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01]);
const GPS_IFD_LE = Buffer.from([0x25, 0x88, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00]);
const hasGps = (exif) => Boolean(exif) && (exif.includes(GPS_IFD_BE) || exif.includes(GPS_IFD_LE));

const files = walk(pub);
let written = 0, skipped = 0, failed = 0;
const gps = [];
const t0 = Date.now();
const queue = [...files];
async function worker() {
  for (let src; (src = queue.shift()); ) {
    const rel = path.relative(pub, src).replace(EXT, ".webp");
    const mtime = fs.statSync(src).mtimeMs;
    let native;
    try {
      const meta = await sharp(src).metadata();
      native = meta.width;
      if (hasGps(meta.exif)) gps.push(path.relative(pub, src));
    } catch { failed++; continue; }
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
if (gps.length) {
  console.error(`image variants: ${gps.length} original(s) under public/ carry GPS EXIF (a customer's home). Strip and recommit:\n  ${gps.join("\n  ")}`);
  process.exitCode = 1;
}
