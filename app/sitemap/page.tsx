import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { services } from "@/lib/services";
import { towns } from "@/lib/towns";

// HTML sitemap (SEO playbook rows 82/97/70/388): every indexable page in plain,
// grouped links. Same URL set as lib/sitemapEntries.ts (the XML sitemap); a page
// added there belongs here too.
export const metadata: Metadata = {
  title: { absolute: "Sitemap | Powered Up LLC" },
  description: "Every page on the Powered Up LLC website: services, towns, gallery and articles.",
  alternates: { canonical: "/sitemap" },
};

type Item = { href: string; label: string };

function Group({ heading, items }: { heading: string; items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-cream">{heading}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            {/* /card is a static file in public/, not a Next route: a plain link. */}
            {i.href === "/card" ? (
              <a href={i.href} className="text-cream/75 underline-offset-4 hover:text-yellow hover:underline">
                {i.label}
              </a>
            ) : (
              <Link href={i.href} className="text-cream/75 underline-offset-4 hover:text-yellow hover:underline">
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SitemapPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Sitemap</div>
          <h1>
            Every page <em className="accent">on this site.</em>
          </h1>
        </div>
      </section>
      <section className="services-index">
        <div className="wrap grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <Group
            heading="Main pages"
            items={[
              { href: "/", label: "Home" },
              { href: "/services", label: "All services" },
              { href: "/service-areas", label: "Service areas" },
              { href: "/gallery", label: "Recent work" },
              { href: "/blog", label: "Blog" },
              { href: "/contact", label: "Book a call" },
              { href: "/card", label: "Digital card" },
            ]}
          />
          <Group heading="Services" items={services.map((s) => ({ href: `/services/${s.slug}`, label: s.serviceName }))} />
          <Group heading="Towns" items={towns.map((t) => ({ href: `/${t.slug}`, label: t.townFull }))} />
          <Group heading="Articles" items={getAllPosts().map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))} />
          <Group
            heading="Legal"
            items={[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
