/**
 * ScrollReveal preset shape. Presets carry trade behaviour (which effects the
 * trade uses, distances, wipe direction and timing, drift amount, stagger),
 * never a brand colour. Durations for the IO path read the skin tokens
 * (--dur-3), so a luxury skin's +20% flows through without a preset change;
 * the preset's own millisecond values (wipe, counter) already include it.
 */

export const CJP_VISUAL_VERSION = "1.5.3";

export type Trade = "hvac" | "electrical" | "plumbing" | "roofing" | "luxury" | "saas";

/** The zero-JS effects `<ScrollReveal effect>` renders. */
export type Effect = "reveal" | "wipe" | "drift";

/** The edge a wipe opens from. */
export type WipeFrom = "top" | "bottom" | "left" | "right";

export type Preset = {
  trade: Trade;
  /** The effects this trade uses. `<ScrollReveal>` falls back to "reveal" for any other. */
  effects: readonly Effect[];
  /** Rise distance in px for .reveal and <Reveal>. 12-20; never more (40px reads as a template). */
  revealDistance: number;
  /** Edge the wipe opens from, both paths. */
  wipeFrom: WipeFrom;
  /** <Wipe> clip transition, ms. */
  wipeMs: number;
  /** Photo scale the wipe settles from (1 = no settle). 1.04-1.08. */
  settle: number;
  /** .drift travel, percent of the frame, each way. 6 default, 8 luxury. */
  drift: number;
  /** Suggested delay step for a grid of <Reveal>/<Wipe>, ms (index * staggerMs, cap 4 steps). */
  staggerMs: number;
  /** <Counter> duration, ms. */
  counterMs: number;
};
