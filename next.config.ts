import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Photos are served and resized by Wix's image CDN until they move to our
    // own storage in scope 2. See src/lib/wix-image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/wix-image-loader.ts",
    qualities: [70, 80, 90],
  },
  async redirects() {
    // The old register page now opens Find my home (query string kept).
    return [
      { source: "/register", destination: "/find-my-home", permanent: false },
      // Redirects the Wix site already had, and its thin duplicate pages
      // (checked against www.ff21.in on 17 Oct 2026).
      ...[
        ["/ff21kdh", "/properties/kdh-kundanahalli"],
        ["/ff21-kdh", "/properties/kdh-kundanahalli"],
        ["/copy-of-ff21-kdh-kundanhalli", "/properties/kdh-kundanahalli"],
        ["/ff21pmc", "/coliving-pg-near-mahadevapura"],
        ["/ff21lit", "/pg-in-kadubeesanahalli"],
        ["/ff21podsthubrahalli", "/coliving-pg-near-bellandur"],
        ["/coliving-pgs-near-doddenakundi", "/coliving-pgs-near-doddanekundi"],
        ["/coliving-near-rr-nagar", "/pg-near-rr-nagar"],
        ["/team-ff21", "/about"],
        ["/blog-1", "/blog"],
        ["/post/____a", "/blog"],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
