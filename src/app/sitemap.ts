import type { MetadataRoute } from "next";
import { properties } from "@/lib/properties";
import { site } from "@/lib/site";
import { articles, landingPages } from "@/lib/wix-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number) => ({ url: `${site.url}${path}`, priority });
  return [
    page("/", 1),
    page("/properties", 0.9),
    ...properties.map((p) => page(`/properties/${p.slug}`, 0.9)),
    page("/find-my-home", 0.8),
    page("/about", 0.5),
    page("/privacypolicy", 0.2),
    page("/terms-and-conditions", 0.2),
    // The Wix site's landing pages and blog, at their old URLs.
    ...landingPages.map((l) => page(l.url, 0.8)),
    page("/blog", 0.6),
    ...articles.map((a) => ({ url: `${site.url}${a.url}`, priority: 0.5, ...(a.date ? { lastModified: a.date } : {}) })),
  ];
}
