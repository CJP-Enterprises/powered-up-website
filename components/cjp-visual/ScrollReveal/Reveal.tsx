"use client";
/**
 * <Reveal>: the IntersectionObserver fallback for when a block should FADE and
 * rise (the zero-JS .reveal is transform-only), or when Firefox stable (no
 * animation-timeline) must animate too.
 *
 * Harvested from ~/clients-ga4/mission-decks/components/Reveal.tsx. Contract:
 *   - Server HTML carries no data-reveal: the block is visible without JS, to
 *     crawlers and in full-page captures.
 *   - Anything already on screen at mount is NEVER hidden (it would delay LCP
 *     and flash content the visitor is reading).
 *   - One observer per element; it disconnects after the first hit. The state
 *     lives in a DOM attribute, so there is no React re-render.
 *   - Reduced motion: scroll-reveal.css drops the rise and keeps the fade.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from "react";
import type { Preset } from "./presets/types";
import "./scroll-reveal.css";

export const CJP_VISUAL_VERSION = "1.5.3";

type Tag = "div" | "section" | "article" | "header" | "li" | "figure" | "aside" | "blockquote";

export type RevealProps = {
  children: ReactNode;
  /**
   * Element to render.
   * @default "div"
   */
  as?: Tag;
  /**
   * Delay in ms. For a grid, index * preset.staggerMs, capped at 4 steps.
   * @default 0
   */
  delay?: number;
  /**
   * Fraction of the element that must be visible before it fires.
   * @default 0.12
   */
  amount?: number;
  /**
   * Sets the rise distance (preset.revealDistance). Omit for --reveal-distance (16px).
   * @default undefined
   */
  preset?: Preset;
  /** @default "" */
  className?: string;
  /** @default undefined */
  style?: CSSProperties;
};

type Vars = CSSProperties & Record<`--${string}`, string>;

export function Reveal({ children, as: As = "div", delay = 0, amount = 0.12, preset, className = "", style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Already on screen (or above it) at mount: leave it exactly as rendered.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "out";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { threshold: amount, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      // Unmounted before it fired: never leave a hidden node behind.
      if (el.dataset.reveal === "out") delete el.dataset.reveal;
    };
  }, [amount]);

  const vars: Vars = { ...style };
  if (delay) vars["--reveal-delay"] = `${delay}ms`;
  if (preset) vars["--reveal-distance"] = `${preset.revealDistance}px`;

  return (
    <As ref={ref as Ref<never>} className={className || undefined} style={vars}>
      {children}
    </As>
  );
}

export default Reveal;
