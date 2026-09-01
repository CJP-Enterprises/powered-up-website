"use client";

import { useEffect } from "react";
import { trackEvent, trackLead } from "@/lib/analytics";

/**
 * Mount ONCE in app/layout.tsx. One document-level capture-phase listener
 * covers every tel:/sms:/mailto: link on every page, including pages added
 * later. No per-link edits.
 */

const DEDUPE_MS = 1500;
const SELECTOR = 'a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"]';

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
      const scheme = href.slice(0, href.indexOf(":"));
      const value = href.slice(scheme.length + 1).split("?")[0];
      const link_location = linkLocation(link);

      if (scheme === "tel") {
        trackEvent("click_to_call", { phone_number: value, link_location });
        trackLead("phone_call", { phone_number: value, link_location });
        return;
      }

      if (scheme === "sms") {
        trackEvent("click_to_text", { phone_number: value, link_location });
        trackLead("text_message", { phone_number: value, link_location });
        return;
      }

      // mailto: — never send the address as a parameter.
      trackEvent("click_to_email", { link_location });
      trackLead("email", { link_location });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
