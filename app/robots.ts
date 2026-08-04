import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Private paths that must never be crawled or indexed. /calculator is the
// auth-gated internal load calculator (Micah-only, JWT session) and /api is
// server routes — neither is a page a searcher should ever land on.
const DISALLOW = ["/api/", "/calculator"];

// Crawlers we allow onto the public site. "*" catches everyone else; the AI /
// answer-engine bots are listed explicitly (mirroring public/ai.txt) because we
// WANT them indexing us so the business surfaces in AI answers.
const AGENTS = [
  "*",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "cohere-ai",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOW,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
