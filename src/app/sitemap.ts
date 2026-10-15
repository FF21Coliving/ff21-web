import type { MetadataRoute } from "next";
import { properties } from "@/lib/properties";
import { site } from "@/lib/site";

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
  ];
}
