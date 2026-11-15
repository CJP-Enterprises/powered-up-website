"use client";

import { useEffect } from "react";
import { trackEvent, GA_EVENT } from "@/lib/analytics";

/**
 * Mount ONCE in app/layout.tsx. One document-level capture-phase listener
 * covers every tel:/sms:/mailto: link on every page, including pages added
 * later. No per-link edits.
 *
 * Taps fire click_to_call / click_to_text / click_to_email / directions_click
 * ONLY. A tap is not a lead: generate_lead fires once, from the quote form on
 * success (SEO playbook wave 2, 2026-11-15).
 */

const DEDUPE_MS = 1500;
const SELECTOR =
  'a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"], a[href*="google.com/maps"], a[href*="maps.google."], a[href*="goo.gl/maps"], a[href*="maps.app.goo.gl"], a[href*="maps.apple.com"]';

function linkLocation(el: Element): string {
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("nav")) return "nav";
  return "body";
}

export default function LeadTracking() {
  useEffect(() => {
    let lastFired = 0;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest(SELECTOR);
      if (!(link instanceof HTMLAnchorElement)) return;

      const now = Date.now();
      if (now - lastFired < DEDUPE_MS) return;
      lastFired = now;

      const href = link.getAttribute("href") ?? "";
      const link_location = linkLocation(link);
      if (!/^(tel|sms|mailto):/.test(href)) {
        trackEvent(GA_EVENT.directionsClick, { link_location });
        return;
      }
      const scheme = href.slice(0, href.indexOf(":"));
      const value = href.slice(scheme.length + 1).split("?")[0];

      if (scheme === "tel") {
        trackEvent(GA_EVENT.clickToCall, { phone_number: value, link_location });
        return;
      }

      if (scheme === "sms") {
        trackEvent(GA_EVENT.clickToText, { phone_number: value, link_location });
        return;
      }

      // mailto: — never send the address as a parameter.
      trackEvent(GA_EVENT.clickToEmail, { link_location });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
