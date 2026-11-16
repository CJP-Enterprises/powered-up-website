import Link from "next/link";
import { rimg } from "@/lib/responsive-img";
import { recentPhotos } from "@/lib/recentPhotos";
import { relatedServices } from "@/lib/relatedServices";

/**
 * "Recent projects": real job photos tagged with this service (lib/gallery.ts),
 * newest first, never the page's hero. Lazy, responsive-images kit (never
 * /_next/image). Renders nothing under 2 photos.
 */
export function RecentProjects({ service, exclude = [] }: { service: string; exclude?: string[] }) {
  const photos = recentPhotos(service, exclude);
  if (photos.length === 0) return null;
  return (
    <section className="gallery">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">Recent Projects</div>
            <h2 className="h-section">
              Real jobs. <em>Recent work.</em>
            </h2>
          </div>
          <div className="section-head-right">
            <Link href="/gallery" className="btn btn-ghost">
              See the full gallery
            </Link>
          </div>
        </div>
        <div className="gallery-grid">
          {photos.map((p) => (
            <div className="gallery-item" key={p.src}>
              <div className="gallery-item-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...rimg(p.src)} alt={p.alt} loading="lazy" decoding="async" />
              </div>
              <div className="gallery-item-meta">
                <span className="gallery-item-tag">{p.tag}</span>
                <h3 className="gallery-item-title">{p.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Related services: 3 sibling services with descriptive anchors + the hub link. */
export function RelatedServices({ slug }: { slug: string }) {
  const items = relatedServices(slug);
  if (items.length === 0) return null;
  return (
    <section className="services">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow">Related Services</div>
            <h2 className="h-section">
              Often <em>done together.</em>
            </h2>
          </div>
          <div className="section-head-right">
            <Link href="/services" className="btn btn-ghost">
              See all our services
            </Link>
          </div>
        </div>
        <div className="services-grid">
          {items.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`} className="service">
              <div className="service-num">{s.label}</div>
              <h3 className="service-title">{s.anchor}</h3>
              <p className="service-desc">{s.line}</p>
              <span className="service-arrow">
                View service
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 14, height: 14 }}>
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
