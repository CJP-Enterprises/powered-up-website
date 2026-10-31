/**
 * next/image custom loader (CJP responsive-images kit). Maps any local raster
 * image in public/ to the pre-sized variant written by
 * scripts/build-image-variants.mjs: /_v/<w>/<path>.webp, picking the nearest
 * generated width at or above what next/image asks for. Static imports
 * (/_next/...), SVG/GIF and external URLs pass through untouched.
 */
const WIDTHS = [384, 640, 960, 1280, 1920]; // keep in sync with the script

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("/") || src.startsWith("//") || src.startsWith("/_next/") || src.startsWith("/_v/")) return src;
  const [path] = src.split(/[?#]/);
  if (!/\.(jpe?g|png|webp)$/i.test(path)) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  // encodeURI: a space in a filename would split the srcset entry.
  return encodeURI(`/_v/${w}${decodeURI(path).replace(/\.(jpe?g|png|webp)$/i, ".webp")}`);
}
