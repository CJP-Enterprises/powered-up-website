import sitemap from "@/lib/sitemapEntries";

/**
 * /sitemap.xml as a route handler (was app/sitemap.ts). Moved so the human
 * HTML sitemap can live at /sitemap: Next.js refuses a page and a metadata
 * sitemap on the same segment. Same entries (lib/sitemapEntries.ts), same XML.
 */
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const body = sitemap()
    .map((e) => {
      const mod = e.lastModified ? new Date(e.lastModified).toISOString() : null;
      return `<url>\n<loc>${esc(e.url)}</loc>${mod ? `\n<lastmod>${mod}</lastmod>` : ""}\n</url>`;
    })
    .join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
