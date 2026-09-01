import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import LeadTracking from "@/components/LeadTracking";

const SITE_URL = "https://www.poweredbymicah.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Powered Up LLC | Licensed Electrician | Taunton, MA | Owner-Operated",
    template: "%s | Powered Up LLC",
  },
  description:
    "Licensed, owner-operated electrical contractor serving Taunton, Brockton, Plymouth and the South Shore. New construction, remodels, panel upgrades, EV chargers. Free estimates. Call Micah directly.",
  authors: [{ name: "Powered Up LLC" }],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-32.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Powered Up LLC | Licensed Electrician | Taunton, MA",
    description:
      "Owner-operated electrical contractor — Taunton to Plymouth. Free estimates within 24 hours. When you call, you get Micah.",
    type: "website",
    url: SITE_URL,
    siteName: "Powered Up LLC",
    locale: "en_US",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Powered Up LLC | Licensed Electrician | Taunton, MA",
    description:
      "Owner-operated electrical contractor — Taunton to Plymouth. Free estimates within 24 hours. When you call, you get Micah.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true, "max-image-preview": "large" } as Metadata["robots"],
  other: {
    "geo.region": "US-MA",
    "geo.placename": "Taunton, Massachusetts",
    "geo.position": "41.9001;-71.0898",
    ICBM: "41.9001, -71.0898",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F1A2E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* The hero preload that lived here pointed at the video poster, which
            was only reachable via a CSS background and so invisible to the
            preload scanner. The hero is now a real <img fetchPriority="high">
            in the homepage markup, which the scanner finds on its own — and
            this tag sat in the root layout, so it was fetching a homepage-only
            image on every page of the site. */}
      </head>
      <body>
        <LeadTracking />
        <GoogleAnalytics />
        <TopBar />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
