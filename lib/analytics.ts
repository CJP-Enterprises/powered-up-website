/**
 * GA4 event helpers.
 *
 * `window.gtag` is injected by the analytics tag in the root layout, and only
 * when the measurement ID env var is set. It is legitimately absent in dev, in
 * preview builds without the env var, and for the large share of visitors
 * running an ad/tracking blocker — so every call here no-ops instead of
 * throwing. Analytics must never break a real user action.
 *
 * No global augmentation: `Window` is narrowed locally so this file drops into
 * any site without colliding with an existing `declare global` block.
 */

type Gtag = (command: string, ...args: unknown[]) => void;

/** Send a GA4 event. Silently does nothing if gtag never loaded. */
export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", eventName, params);
  } catch {
    // A failed beacon is never worth interrupting the user for.
  }
}

/**
 * GA4 event names registered as key events in the property. Keep these exact —
 * renaming one silently detaches it from its key-event/conversion config.
 */
export const GA_EVENT = {
  /** A lead form was submitted and accepted by the server. */
  generateLead: "generate_lead",
  /** Any `tel:` link clicked, anywhere on the site. */
  clickToCall: "click_to_call",
} as const;

export type LeadMethod = "phone_call" | "text_message" | "form" | "email";

/**
 * Fires GA4's recommended `generate_lead` event — the ONLY event name that
 * populates GA4's Lead acquisition report. `method` is what splits that report
 * by channel, so it must always be present.
 */
export function trackLead(
  method: LeadMethod,
  params: Record<string, unknown> = {},
): void {
  trackEvent(GA_EVENT.generateLead, { method, ...params });
}
