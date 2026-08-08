import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recent Work | Powered Up LLC | Taunton, MA Electrician",
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

// The SPAN smart panel entry was removed with its photo: that image was
// AI-generated and carried a visible "AI-generated content" watermark, while
// being presented as Micah's own finished work. Every other item here is a
// real job photo. If Powered Up does install SPAN panels, this belongs back in
// with a photograph of one.
const ITEMS = [
  {
    cls: "gallery-item",
    src: "/photos/work-tesla-charger-install.jpg",
    alt: "Tesla Wall Connector installed by Powered Up LLC — home EV charger with dedicated circuit and conduit run",
    tag: "EV Charger",
    title: "Tesla Wall Connector Install",
    desc: "Tesla Wall Connector Level 2 EV charger install with dedicated 240V circuit, proper conduit run, and code-compliant disconnect. Installed in an exterior alcove for weather protection.",
  },
  {
    cls: "gallery-item portrait",
    src: "/photos/micah-portrait.jpg",
    alt: "Micah Gentile, owner and licensed electrician at Powered Up LLC",
    tag: "Meet the Owner",
    title: "Micah Gentile · Owner & Licensed Electrician",
    desc: "When you call Powered Up LLC, this is who answers. Massachusetts-licensed electrician, owner-operator, and the one who shows up to do the work. Pictured at a commercial Enphase battery storage install.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-service-upgrade-white.jpg",
    alt: "200A electrical service upgrade installation on a white South Shore home",
    tag: "Service Upgrade",
    title: "200A Service Install",
    desc: "New meter base, main disconnect, and service entry conduit on a residential home. Permit pulled, inspection coordinated.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-solar-enphase.jpg",
    alt: "Enphase solar PV system maintenance on a South Shore home",
    tag: "Solar Service",
    title: "Enphase Solar System Service",
    desc: "Solar PV system maintenance and disconnect work. Powered Up LLC handles troubleshooting and service on existing Enphase systems.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-service-upgrade-victorian.jpg",
    alt: "Service entry upgrade on a Victorian home in the Greater Boston area",
    tag: "Older Home",
    title: "Victorian Service Upgrade",
    desc: "Service entry upgrade on a historic South Shore home. Older homes often need careful coordination with knob-and-tube remediation and modern code compliance.",
  },
  {
    cls: "gallery-item featured",
    src: "/photos/company-van.jpg",
    alt: "Powered Up LLC company van with branding and contact information",
    tag: "On The Road",
    title: "Powered Up LLC · Across the South Shore",
    desc: "If you see the van around Taunton, Brockton, Raynham, or Plymouth — that's us. Residential and commercial · service upgrades · rewires · new construction · car chargers.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-finished-service.jpg",
    alt: "Finished electrical service install by Powered Up LLC",
    tag: "Service Install",
    title: "Finished Service Install",
    desc: "Clean finished electrical service work. New meter base, conduit run, and disconnect — permit pulled, inspection coordinated.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-panel-install-02.jpg",
    alt: "Electrical panel work by Powered Up LLC — install and coordination",
    tag: "Panel Install",
    title: "Panel Install",
    desc: "Electrical panel installation with clean wire management. Residential and commercial capability across the South Shore.",
  },
  {
    cls: "gallery-item",
    src: "/photos/work-panel-install-03.jpg",
    alt: "Electrical panel work by Powered Up LLC — residential install",
    tag: "Panel Install",
    title: "Panel Install",
    desc: "Residential panel work. All installs done to current Massachusetts Electrical Code with permit and inspection coordination.",
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="page-header">
        <div className="wrap">
          <div className="eyebrow">Recent Work</div>
          <h1>
            Real jobs.<br />Real <em>South Shore</em> homes.
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
                  <img src={item.src} alt={item.alt} loading="lazy" />
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
