/**
 * CANONICAL HOST — the single source of truth for absolute URLs.
 *
 * Must match the host Vercel actually serves on (www is the primary domain).
 * Lives here rather than inline in each route so robots.ts and sitemap.ts can
 * never drift apart: a sitemap advertised on one host while canonicals point at
 * another sends crawlers through redirects and suppresses indexing.
 */
export const SITE_URL = "https://www.poweredbymicah.com";
