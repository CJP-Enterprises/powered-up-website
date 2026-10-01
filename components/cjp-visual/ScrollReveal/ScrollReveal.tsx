/**
 * ScrollReveal: the zero-JS motion layer. A SERVER component (no "use client"):
 * it renders plain markup with the cjp-motion.css classes, so it ships 0 KB of
 * JavaScript. The browser runs the animation on a scroll-driven timeline
 * (animation-timeline: view()); where that is unsupported (Firefox stable),
 * under reduced motion, for crawlers and for full-page captures, the content
 * simply sits in its finished place.
 *
 *   effect="reveal"  the block rises --reveal-distance as it enters (transform only)
 *   effect="wipe"    a photo frame clips open from the preset's edge while the
 *                    photo settles from a slight scale (frame = aspect box)
 *   effect="drift"   a photo drifts vertically inside an overflow-hidden frame
 *
 * Never on the LCP element (hero H1/photo), hero CTAs, the phone number, body
 * paragraphs or form fields. Use <Reveal>/<Wipe> (IntersectionObserver) only
 * when you need an opacity fade or Firefox parity.
 *
 * Source: .reveal from ~/stl-air-pros/app/globals.css:160-176 via
 * registry/_shared/motion/cjp-motion.css; preset tuning in ./scroll-reveal.css.
 */
import type { CSSProperties, ReactNode } from "react";
import type { Effect, Preset } from "./presets/types";
import "./scroll-reveal.css";

export const CJP_VISUAL_VERSION = "1.5.3";

type Tag = "div" | "section" | "article" | "header" | "li" | "figure" | "aside";

export type ScrollRevealProps = {
  children: ReactNode;
  /**
   * Which zero-JS effect. An effect the preset does not list falls back to "reveal".
   * @default "reveal"
   */
  effect?: Effect;
  /**
   * Trade behaviour: distance, wipe edge, settle, drift amount. Omit for the
   * cjp-motion.css defaults (16px rise, top-down wipe, 6% drift).
   * @default undefined
   */
  preset?: Preset;
  /**
   * Element for the outer node (the frame for wipe/drift).
   * @default "div"
   */
  as?: Tag;
  /**
   * Fixed aspect ratio for the wipe/drift frame, e.g. "4 / 3". Give one (or an
   * aspect-* class) so the frame never shifts layout.
   * @default undefined
   */
  aspectRatio?: string;
  /**
   * Classes for the outer node (the frame for wipe/drift: radius, size).
   * @default ""
   */
  className?: string;
  /**
   * Extra inline style for the outer node.
   * @default undefined
   */
  style?: CSSProperties;
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function ScrollReveal({
  children,
  effect = "reveal",
  preset,
  as: As = "div",
  aspectRatio,
  className = "",
  style,
}: ScrollRevealProps) {
  const fx: Effect = !preset || preset.effects.includes(effect) ? effect : "reveal";

  if (fx === "reveal") {
    const vars: Vars = { ...style };
    if (preset) vars["--reveal-distance"] = `${preset.revealDistance}px`;
    return (
      <As className={`reveal ${className}`.trim()} style={vars}>
        {children}
      </As>
    );
  }

  const frame: Vars = { ...style, ...(aspectRatio ? { aspectRatio } : null) };

  if (fx === "wipe") {
    const settle = preset?.settle ?? 1.05;
    const inner: Vars = { height: "100%", position: "relative" };
    if (settle > 1) inner["--sr-settle"] = settle;
    return (
      <As className={`relative overflow-hidden ${className}`.trim()} style={frame}>
        <div
          className="wipe-in"
          data-sr-from={preset?.wipeFrom ?? "top"}
          data-sr-settle={settle > 1 ? "" : undefined}
          style={inner}
        >
          <div style={{ position: "relative", height: "100%" }}>{children}</div>
        </div>
      </As>
    );
  }

  // drift: travel ±d% needs scale >= 1 + 2d to keep the frame covered.
  const d = preset?.drift ?? 6;
  const drift: Vars = {
    position: "relative",
    height: "100%",
    "--sr-drift": `${d}%`,
    "--sr-drift-scale": +(1 + (2 * d) / 100 + 0.005).toFixed(3),
  };
  return (
    <As className={`relative overflow-hidden ${className}`.trim()} style={frame}>
      <div className="drift" data-sr-drift="" style={drift}>
        {children}
      </div>
    </As>
  );
}
