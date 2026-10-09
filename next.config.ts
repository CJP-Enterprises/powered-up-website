import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // The "Or book online" link in missed-call texts: shows this domain, the tap is still recorded in the CJP CRM.
      { source: "/b/:token", destination: "https://signal.cjp-enterprises.com/b/:token" },
      // Preserve the legacy digital business card at /card (served from public/card.html)
      { source: "/card", destination: "/card.html" },
    ];
  },
};

export default nextConfig;
