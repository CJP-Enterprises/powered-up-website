import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { services } from "@/lib/services";
import { towns } from "@/lib/towns";
import { SITE_URL } from "@/lib/site-url";
import { lastModified } from "@/lib/lastmod";

// lastModified is the real date of the newest commit that touched the route's source files
// (lib/lastmod.ts), or omitted when git cannot answer. Never "now": a sitemap that says every
// page changed today is ignored by crawlers. changefreq/priority are not read by Google.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: lastModified("app/page.tsx", "lib/services.ts", "lib/towns.ts") },
    { url: `${SITE_URL}/services`, lastModified: lastModified("app/services/page.tsx", "lib/services.ts") },
    { url: `${SITE_URL}/gallery`, lastModified: lastModified("app/gallery/page.tsx") },
    { url: `${SITE_URL}/blog`, lastModified: lastModified("app/blog/page.tsx", "content/blog") },
    { url: `${SITE_URL}/card`, lastModified: lastModified("public/card.html") },
    { url: `${SITE_URL}/contact`, lastModified: lastModified("app/contact/page.tsx") },
    { url: `${SITE_URL}/privacy`, lastModified: lastModified("app/privacy/page.tsx") },
    { url: `${SITE_URL}/terms`, lastModified: lastModified("app/terms/page.tsx") },
  ];

  // Each service and town has its own page.tsx under app/, rendered from lib/services.ts / lib/towns.ts.
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: lastModified(`app/services/${s.slug}/page.tsx`, "lib/services.ts"),
  }));

  const townRoutes: MetadataRoute.Sitemap = towns.map((t) => ({
    url: `${SITE_URL}/${t.slug}`,
    lastModified: lastModified(`app/${t.slug}/page.tsx`, "lib/towns.ts"),
  }));

  // Blog posts are dated from their own frontmatter; omitted when the post has no valid date.
  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ?? undefined,
  }));

  return [...staticRoutes, ...serviceRoutes, ...townRoutes, ...postRoutes];
}
