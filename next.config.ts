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
    return [{ source: "/register", destination: "/find-my-home", permanent: false }];
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
