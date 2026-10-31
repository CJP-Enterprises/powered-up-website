import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never Vercel's /_next/image optimizer (account-wide quota, 402'd client
  // images). Any next/image goes through the pre-sized variants written by
  // scripts/build-image-variants.mjs (run by `prebuild`); raw <img> tags use
  // lib/responsive-img.ts for the same files.
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [384],
  },
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
