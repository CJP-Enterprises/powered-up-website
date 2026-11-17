"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Core Web Vitals to GA4 v1.0.0 (skills repo assets/wave5, 2026-11-16; playbook #489).
 * Copy to components/WebVitals.tsx, render once inside <body> in app/layout.tsx.
 * No new dependency: next/web-vitals ships with Next.
 *
 * Sends LCP, CLS and INP as GA4 events named exactly "LCP" / "CLS" / "INP"
 * (Google's documented web-vitals -> GA4 shape): value (CLS x1000, rounded),
 * metric_id, metric_value, metric_delta, metric_rating, non_interaction.
 * Goes through window.gtag / dataLayer so it queues while gtag.js is deferred;
 * it never forces gtag.js to load (vitals must not cost the page speed).
 */

const WANTED = new Set(["LCP", "CLS", "INP"]);

export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (!WANTED.has(metric.name)) return;
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    const gtag =
      typeof w.gtag === "function"
        ? w.gtag
        : function () {
            // eslint-disable-next-line prefer-rest-params
            w.dataLayer!.push(arguments);
          };
    gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: (metric as { rating?: string }).rating,
      non_interaction: true,
    });
  });
  return null;
}
