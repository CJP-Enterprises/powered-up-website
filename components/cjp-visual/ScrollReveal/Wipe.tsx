"use client";
/**
 * <Wipe>: the IntersectionObserver clip-path reveal for photo frames, when the
 * zero-JS `<ScrollReveal effect="wipe">` is not enough (Firefox parity, or a
 * wipe that should play once in time rather than scrub with the scroll).
 *
 * Harvested from ~/clients-ga4/mission-decks/components/Wipe.tsx. The clip
 * lives on an INNER node and the observer watches the OUTER one: a node at
 * clip-path inset(100% ...) has a zero-size intersection rect, so observing it
 * would leave the photo hidden forever. Inside the clip, the photo settles
 * from preset.settle to 1 while the frame opens.
 *
 * Same contract as <Reveal>: visible server HTML, never hides what is already
 * on screen, one observer that disconnects, reduced motion = fade only.
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { Preset, WipeFrom } from "./presets/types";
import "./scroll-reveal.css";

export const CJP_VISUAL_VERSION = "1.5.3";

export type WipeProps = {
  children: ReactNode;
  /**
   * Edge the frame opens from. Overrides preset.wipeFrom.
   * @default preset?.wipeFrom ?? "bottom"
   */
  from?: WipeFrom;
  /**
   * Timing (wipeMs), settle scale and default edge.
   * @default undefined
   */
  preset?: Preset;
  /**
   * Delay in ms (index * preset.staggerMs for a row of frames).
   * @default 0
   */
  delay?: number;
  /**
   * Fixed aspect ratio of the frame, e.g. "4 / 5". Give one (or an aspect-* class) for CLS 0.
   * @default undefined
   */
  aspectRatio?: string;
  /**
   * Classes for the OUTER frame (radius, size). The frame is overflow-hidden.
   * @default ""
   */
  className?: string;
  /** @default undefined */
  style?: CSSProperties;
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export function Wipe({ children, from, preset, delay = 0, aspectRatio, className = "", style }: WipeProps) {
  const outer = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = outer.current;
    const c = clip.current;
    if (!el || !c || typeof IntersectionObserver === "undefined") return;
    // Already on screen at mount: never wipe what the visitor is looking at.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    c.dataset.wipe = "out";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          c.dataset.wipe = "in";
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (c.dataset.wipe === "out") delete c.dataset.wipe;
    };
  }, []);

  const frame: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...(aspectRatio ? { aspectRatio } : null),
    ...style,
  };
  const inner: Vars = { height: "100%" };
  if (delay) inner["--reveal-delay"] = `${delay}ms`;
  if (preset) {
    inner["--sr-wipe-ms"] = `${preset.wipeMs}ms`;
    inner["--sr-settle"] = preset.settle;
  }

  return (
    <div ref={outer} className={className || undefined} style={frame}>
      <div ref={clip} data-sr-from={from ?? preset?.wipeFrom ?? "bottom"} style={inner}>
        <div data-sr-settle="" style={{ position: "relative", height: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Wipe;
