import imageLoader from "./image-loader";

/**
 * Responsive srcset for the site's raw <img> tags (CJP responsive-images kit).
 * Points at the pre-sized WebP variants written by
 * scripts/build-image-variants.mjs (/_v/<w>/<path>.webp), so phones get a
 * ~640-960px file instead of the 1400-2000px original. Never uses Vercel's
 * /_next/image optimizer. Spread onto an existing <img>: markup, classes and
 * layout stay exactly as they were; `src` stays the original as a fallback.
 */
const WIDTHS = [384, 640, 960, 1280, 1920]; // keep in sync with the script

export function rimg(src: string, sizes = "(max-width: 768px) 100vw, 50vw") {
  return {
    src,
    srcSet: WIDTHS.map((w) => `${imageLoader({ src, width: w })} ${w}w`).join(", "),
    sizes,
  };
}
