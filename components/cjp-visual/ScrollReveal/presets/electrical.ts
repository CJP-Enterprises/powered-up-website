import type { Preset } from "./types";

export const CJP_VISUAL_VERSION = "1.5.3";

/** Electrical: crisp, quick. Wipes open sideways like a panel door; no parallax. */
const electrical = {
  trade: "electrical",
  effects: ["reveal", "wipe"],
  revealDistance: 14,
  wipeFrom: "left",
  wipeMs: 600,
  settle: 1.04,
  drift: 6,
  staggerMs: 55,
  counterMs: 1000,
} satisfies Preset;

export default electrical;
