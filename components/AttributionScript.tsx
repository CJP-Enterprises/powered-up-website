import { ATTRIBUTION_SCRIPT } from "@/lib/attribution";

/**
 * Copy to components/AttributionScript.tsx and render it ONCE inside <body>
 * in app/layout.tsx (any position; it is a plain inline script, so it runs as
 * the HTML parses, before hydration, on every full page load).
 *
 * A server component on purpose: no client JS, nothing visible. The live check
 * is `curl -s <site> | grep -c cjp_attr` (>= 1).
 */
export default function AttributionScript() {
  return <script id="cjp-attribution" dangerouslySetInnerHTML={{ __html: ATTRIBUTION_SCRIPT }} />;
}
