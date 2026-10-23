import { properties, fromPrice, type Property } from "./properties";
import { site } from "./site";

// Structured data shared by several pages (JSON-LD). Kept to what each page
// visibly shows, so search engines and AI assistants read the same facts as
// visitors.

// Each home's Google Maps pin (the same pins scripts/make-maps.py uses).
export const pins: Record<string, [number, number]> = {
  "itp-whitefield": [12.9804074, 77.7470304],
  "wfd-whitefield": [12.9843719, 77.733698],
  "kdh-kundanahalli": [12.951442, 77.7175013],
  "pods-marathahalli": [12.9478046, 77.7182353],
  "lit-thubarahalli": [12.9537477, 77.7195835],
  "bgm-doddanekundi": [12.972923, 77.6919095],
  "pmc-mahadevapura": [12.9925348, 77.6955089],
  "hbr-hennur": [13.0279627, 77.630975],
  "kora-koramangala": [12.9340807, 77.618472],
  "sjr-sarjapur": [12.9096202, 77.6810529],
};

export const homeUrl = (p: Property) => `${site.url}/properties/${p.slug}`;

// The homes as a list, so a search engine or assistant can name all of them.
export function homesList(list: Property[] = properties, name = "FF21 coliving homes in Bangalore") {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: list.length,
    itemListElement: list.map((p, i) => {
      const from = fromPrice(p);
      return {
        "@type": "ListItem",
        position: i + 1,
        url: homeUrl(p),
        name: `FF21 ${p.code}, ${p.area}${from ? ` (from ₹${from.toLocaleString("en-IN")} a month)` : ""}`,
      };
    }),
  };
}

export const breadcrumbs = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${site.url}${path}` })),
});

export const ldScript = (data: unknown) => ({ __html: JSON.stringify({ "@context": "https://schema.org", ...(data as object) }).replace(/</g, "\\u003c") });
