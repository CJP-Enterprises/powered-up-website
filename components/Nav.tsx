"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { services } from "@/lib/services";
import { towns } from "@/lib/towns";

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const BurgerIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );

type NavLink = { href: string; label: string; match?: string };

const LINKS: NavLink[] = [
  { href: "/gallery", label: "Gallery", match: "/gallery" },
  { href: "/blog", label: "Blog", match: "/blog" },
  { href: "/services", label: "Services", match: "/services" },
  { href: "/#area", label: "Service Area" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Book a Call" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (l: NavLink) =>
    l.match ? pathname === l.match || pathname.startsWith(`${l.match}/`) : false;

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <div className="nav-logo-badge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Powered Up LLC" />
          </div>
          <span className="nav-logo-text">
            POWERED <span>UP</span>
          </span>
        </Link>

        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className={isActive(l) ? "active" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <a href="tel:+15086225919" className="nav-cta">
            <PhoneIcon />
            Call (508) 622-5919
          </a>
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <BurgerIcon open={open} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`}>
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={isActive(l) ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}

        <Link
          href="/services"
          className="mobile-menu-group-label"
          onClick={() => setOpen(false)}
        >
          Services
        </Link>
        {services.map((s) => (
          <Link
            key={s.slug}
            href={`/services/${s.slug}`}
            className={`mobile-menu-sub${pathname === `/services/${s.slug}` ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {s.serviceName}
          </Link>
        ))}

        <div className="mobile-menu-group-label">Towns We Serve</div>
        {towns.map((t) => (
          <Link
            key={t.slug}
            href={`/${t.slug}`}
            className={`mobile-menu-sub${pathname === `/${t.slug}` ? " active" : ""}`}
            onClick={() => setOpen(false)}
          >
            {t.townFull}
          </Link>
        ))}

        <a href="tel:+15086225919" className="mobile-menu-cta" onClick={() => setOpen(false)}>
          <PhoneIcon />
          Call (508) 622-5919
        </a>
      </div>
    </nav>
  );
}
