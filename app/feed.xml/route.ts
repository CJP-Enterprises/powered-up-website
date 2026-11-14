import { SITE_URL } from "@/lib/site-url";
import { getAllPosts } from "@/lib/blog";

// RSS 2.0 feed for the blog (Ranked SEO Playbook #280). Built once at build
// time; same post URLs as the sitemap. Linked from the root layout metadata
// (alternates.types), not from the sitemap or robots.
export const dynamic = "force-static";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function GET() {
  const posts = getAllPosts();
  const blogUrl = `${SITE_URL}/blog`;
  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.date ? `      <pubDate>${post.date.toUTCString()}</pubDate>` : null;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid>${escapeXml(link)}</guid>`,
        pubDate,
        `      <description>${escapeXml(post.description ?? "")}</description>`,
        "    </item>",
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Powered Up LLC Blog</title>",
    `    <link>${escapeXml(blogUrl)}</link>`,
    "    <description>Electrical tips and project notes from Powered Up LLC, a licensed, owner-operated electrician serving Taunton, Brockton, Plymouth and the South Shore.</description>",
    "    <language>en-US</language>",
    `    <atom:link href="${escapeXml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
