"use client";
/**
 * <Counter>: an honest stat that counts up once as it scrolls into view.
 *
 * Harvested from ~/clients-ga4/mission-decks/components/Counter.tsx, with the
 * fix required for promotion: a stat that is already on screen at mount is
 * never reset to 0 (the original flashed a visible number to 0 and back).
 *
 *   - The server HTML is the FINAL value: crawlers, no-JS and full-page
 *     captures always read the real number.
 *   - Only a stat that starts below the first viewport is rewound, and it
 *     counts up once when half of it is visible. One observer, disconnected
 *     on the first hit. Frames write the text node directly: no React re-render
 *     per frame.
 *   - The final value sits in the same grid cell, invisible, so the box is
 *     sized for it from the first paint: counting never moves layout (CLS 0).
 *   - Screen readers get the final value once (visually hidden copy); the
 *     animated digits are aria-hidden.
 *   - Reduced motion (or the gallery's data-cjp-motion="reduce"): no count,
 *     final value. Printing restores the final value.
 *
 * Count ONLY real record numbers (licence years, jobs from the client's own
 * records, review count from the live profile). Never a made-up "10,000+".
 */
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { Preset } from "./presets/types";

export const CJP_VISUAL_VERSION = "1.5.3";

export type CounterProps = {
  /** The real, final number. This is what the server renders. */
  value: number;
  /** @default "" */
  prefix?: string;
  /** e.g. "+" or " yrs". @default "" */
  suffix?: string;
  /**
   * Count duration in ms. Overrides preset.counterMs.
   * @default preset?.counterMs ?? 1100
   */
  duration?: number;
  /**
   * Fraction digits (4.9 stars = 1).
   * @default 0
   */
  decimals?: number;
  /**
   * Number formatting locale (thousands separators).
   * @default "en-US"
   */
  locale?: string;
  /** @default undefined */
  preset?: Preset;
  /** @default "" */
  className?: string;
};

const cell: CSSProperties = { gridArea: "1 / 1" };

function reduced(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.cjpMotion === "reduce"
  );
}

export function Counter({
  value,
  prefix = "",
  suffix = "",
  duration,
  decimals = 0,
  locale = "en-US",
  preset,
  className = "",
}: CounterProps) {
  const num = useRef<HTMLSpanElement>(null);
  const ms = duration ?? preset?.counterMs ?? 1100;
  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [locale, decimals],
  );
  const final = `${prefix}${fmt.format(value)}${suffix}`;

  useEffect(() => {
    const el = num.current;
    if (!el || typeof IntersectionObserver === "undefined" || reduced()) return;
    // THE FIX: a stat already on screen keeps its number. Never flash it to 0.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    // Write the text node React owns (nodeValue), never textContent: replacing
    // the node would detach it from React and a later prop change would be lost.
    const text = el.firstChild;
    if (!text || text.nodeType !== Node.TEXT_NODE) return;
    let raf = 0;
    const set = (s: string) => {
      text.nodeValue = s;
    };
    const show = (n: number) => set(`${prefix}${fmt.format(n)}${suffix}`);
    const restore = () => {
      cancelAnimationFrame(raf);
      set(final);
    };
    show(0);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (reduced()) return restore();
        const t0 = performance.now();
        const step = 10 ** decimals;
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / ms);
          const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic: decelerates, never overshoots
          if (p < 1) {
            show(Math.round(eased * value * step) / step);
            raf = requestAnimationFrame(tick);
          } else set(final);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    window.addEventListener("beforeprint", restore);
    return () => {
      io.disconnect();
      window.removeEventListener("beforeprint", restore);
      restore();
    };
  }, [value, ms, fmt, prefix, suffix, decimals, final]);

  return (
    <span className={`relative inline-grid tabular-nums ${className}`.trim()}>
      <span aria-hidden="true" className="invisible" style={cell}>
        {final}
      </span>
      <span aria-hidden="true" ref={num} style={cell}>
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  );
}

export default Counter;
