import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand-name">
              POWERED <span>UP</span> LLC
            </div>
            <p>
              Owner-operated electrical contractor based in Taunton, MA. Serving Taunton, the
              Greater Boston area, and the South Shore. Est. 2024.
            </p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link href="/#services">Panel Upgrades</Link></li>
              <li><Link href="/#services">EV Chargers</Link></li>
              <li><Link href="/#services">New Construction</Link></li>
              <li><Link href="/#services">Remodels</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/#work">Recent Work</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><a href="/card">Digital Card</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><Link href="/contact">Book a Call</Link></li>
              <li><a href="tel:+15086225919">(508) 622-5919</a></li>
              <li><a href="mailto:micah.gentile@poweredbymicah.com">Email Micah</a></li>
              <li>Mon–Sat · 7am–7pm</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © 2024 Powered Up LLC · All Rights Reserved · <Link href="/privacy">Privacy</Link> ·{" "}
            <Link href="/terms">Terms</Link>
          </span>
          <span>Built with care in Massachusetts</span>
        </div>
      </div>
    </footer>
  );
}
