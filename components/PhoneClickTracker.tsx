"use client";

import { useEffect } from "react";
import { GA_EVENT, trackEvent } from "@/lib/analytics";

/**
 * Sitewide click-to-call tracking.
 *
 * One delegated listener on the document catches every `tel:` link — header
 * (desktop + mobile menu), hero, contact section, footer, and any phone CTA
 * added later. Delegating instead of wrapping each anchor keeps those pages
 * server-rendered and leaves the markup, copy, and classes untouched.
 *
 * Renders nothing.
 */
export function PhoneClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      // closest() walks up from the click target, so clicks landing on the
      // phone icon <svg> or label <span> inside the anchor still resolve to it.
      const link = target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (!link) return;

      trackEvent(GA_EVENT.clickToCall, {
        link_url: link.getAttribute("href") ?? "",
        link_text: (link.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100),
        page_path: window.location.pathname,
      });
    }

    // Bubble phase: fires once per click, then the browser hands off to the dialer.
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
