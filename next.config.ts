import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Next's list of bots that can't run JavaScript, which get a fresh,
  // uncached render, minus Chrome-Lighthouse: PageSpeed runs JavaScript and
  // should measure the same cached page people get, not a slower one.
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  images: {
    // Photos are served and resized by Wix's image CDN until they move to our
    // own storage in scope 2. See src/lib/wix-image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/wix-image-loader.ts",
    qualities: [70, 80, 90],
    // Fewer widths than Next's default (8 + 7): our own photos come in 640,
    // 1080 and 1600 anyway, and every width is repeated in every <img> and in
    // the page data, which made the homepage's HTML about 60 KB heavier.
    deviceSizes: [640, 828, 1080, 1600, 2048],
    imageSizes: [96, 256, 384],
  },
  // Our own photos, videos and logos change only with a new file name, so
  // browsers keep them for 30 days instead of checking on every visit.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];
    return ["/photos/:path*", "/videos/:path*", "/brand/:path*", "/maps/:path*"].map((source) => ({ source, headers: cache }));
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
        // In the old site's menu (not in its sitemap), and its blog feed.
        ["/best-coliving-spaces-bangalore", "/properties"],
        ["/blog-feed.xml", "/blog"],
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
