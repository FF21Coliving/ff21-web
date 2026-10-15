import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Previews and staging stay out of search results until launch.
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
