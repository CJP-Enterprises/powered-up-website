import type { Metadata } from "next";
import Link from "next/link";
import { rimg } from "@/lib/responsive-img";
import { ITEMS } from "@/lib/gallery";

export const metadata: Metadata = {
  title: { absolute: "Recent Work | Powered Up LLC | Taunton, MA Electrician" },
  description:
    "Recent electrical work by Powered Up LLC — service upgrades, solar systems, panel installations across Taunton and the South Shore. Owner-operated, licensed in Massachusetts.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Recent Work | Powered Up LLC",
    description: "See recent electrical installations by Powered Up LLC across the South Shore.",
    type: "website",
    url: "https://www.poweredbymicah.com/gallery",
    images: ["/og-image.jpg"],
  },
};


export default function GalleryPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Recent Work</div>
          <h1>
            Real jobs.<br />Real <em className="accent">South Shore</em> homes.
          </h1>
          <p>
            A look at recent installations and service work across Taunton, Brockton, Plymouth, and
            the surrounding South Shore. Every job done by Micah personally — no subs, no rotating
            crews.
          </p>
        </div>
      </section>

      <section className="gallery">
        <div className="wrap">
          <div className="gallery-grid">
            {ITEMS.map((item) => (
              <div className={item.cls} key={item.title}>
                <div className="gallery-item-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...rimg(item.src)} alt={item.alt} loading="lazy" />
                </div>
                <div className="gallery-item-meta">
                  <span className="gallery-item-tag">{item.tag}</span>
                  <h3 className="gallery-item-title">{item.title}</h3>
                  <p className="gallery-item-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <div className="wrap cta-strip-inner">
          <h3>
            Got a project?<br />
            <em>Let&apos;s talk about it.</em>
          </h3>
          <Link href="/#book" className="btn btn-primary">
            Book a Call
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
