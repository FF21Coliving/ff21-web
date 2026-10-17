import "server-only";
import blogData from "@/content/wix/blog.json";
import landingData from "@/content/wix/landing.json";
import metaData from "@/content/wix/meta.json";
import { properties, roomKinds, type Property } from "./properties";

// Everything below was carried over from the Wix site (www.ff21.in, read 17
// Oct 2026) so the SEO it built keeps working: the same URLs, titles,
// descriptions and copy. scripts/wix-import/ rebuilds the JSON.

// `path` is the decoded URL path (what routes see); `url` is the path exactly
// as Wix published it, used for canonicals, links and the sitemap.

// One block of copy. `h` and `items` are HTML limited to text, links, bold
// and italics, escaped when they were extracted.
export type Block =
  | { t: "h2" | "h3" | "p"; h: string }
  | { t: "ul"; items: string[] }
  | { t: "img"; id: string; alt: string };

export type Landing = { path: string; url: string; title: string; description?: string | null; h1?: string | null; image?: string | null; blocks: Block[] };
export type Article = { path: string; url: string; title: string; heading: string; description?: string | null; date?: string | null; image?: string | null; blocks: Block[] };

export const landingPages = landingData as unknown as Landing[];
export const articles = blogData as unknown as Article[];
// Titles and descriptions of Wix pages the new site has its own version of.
export const wixMeta = metaData as unknown as Record<string, { title: string; description?: string | null }>;

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export const getLanding = (slug: string) => landingPages.find((l) => l.path === `/${safeDecode(slug)}`);
export const getArticle = (prefix: "blog" | "post", slug: string) => articles.find((a) => a.path === `/${prefix}/${safeDecode(slug)}`);

// Which homes each landing page shows, nearest first. Pages about Bangalore
// in general show every home; "studio" pages show homes with studios.
const homesByPage: Record<string, string[] | "all" | "studio"> = {
  "/bangalore-student-pg": "all",
  "/best-pg-in-sarjapur": ["SJR", "KORA"],
  "/coliving-near-brookefield": ["ITP", "KDH", "WFD", "LIT"],
  "/coliving-near-kadubeesanahalli": ["LIT", "KDH", "PODS"],
  "/coliving-near-kaggadasapura": ["BGM", "PMC", "PODS"],
  "/coliving-near-koramangala": ["KORA", "SJR"],
  "/coliving-near-kundalahalli": ["KDH", "ITP", "LIT"],
  "/coliving-near-kundanahalli": ["KDH", "PODS", "LIT"],
  "/coliving-pg-bangalore-smart-living": "all",
  "/coliving-pg-in-bangalore": "all",
  "/coliving-pg-in-bangalore-flexible-living": "all",
  "/coliving-pg-in-kalyan-nagar": ["HBR"],
  "/coliving-pg-in-kr-puram": ["PMC", "BGM"],
  "/coliving-pg-near-bagmane-tech-park": ["BGM", "PMC"],
  "/coliving-pg-near-bellandur": ["PODS", "KDH", "LIT"],
  "/coliving-pg-near-brigade-software-park-bangalore": ["ITP", "WFD", "KDH"],
  "/coliving-pg-near-eco-space": ["PODS", "KDH", "LIT"],
  "/coliving-pg-near-mahadevapura": ["PMC", "BGM"],
  "/coliving-pg-near-manyata-tech-park": ["HBR"],
  "/coliving-pg-near-marathahalli": ["PODS", "KDH", "LIT", "BGM"],
  "/coliving-pg-near-phoenix-marketcity-bangalore": ["PMC", "BGM"],
  "/coliving-pg-near-vr-bengaluru-whitefield": ["PMC", "WFD", "ITP"],
  "/coliving-pgs-near-aecs-layout": ["ITP", "KDH"],
  "/coliving-pgs-near-beml-layout": ["LIT", "KDH", "ITP"],
  "/coliving-pgs-near-doddanekundi": ["BGM", "PMC"],
  "/coliving-pgs-near-hbr-layout": ["HBR"],
  "/coliving-pgs-near-hoodi": ["PMC", "WFD", "ITP"],
  "/coliving-pgs-near-hope-farm": ["WFD", "ITP"],
  "/coliving-pgs-near-itpl": ["ITP", "WFD"],
  "/coliving-pgs-near-karthik-nagar": ["BGM", "PODS", "KDH"],
  "/coliving-pgs-near-nagawara": ["HBR"],
  "/coliving-pgs-near-nallurahalli": ["ITP", "WFD"],
  "/coliving-space-bangalore-smart-urban-living": "all",
  "/luxury-pg-in-bangalore": "all",
  "/monthly-stay-in-bangalore": "all",
  "/pg-coliving-near-kalyani-tech-park-bangalore": ["ITP", "WFD"],
  "/pg-coliving-near-mind-comp-tech-park-bangalore": ["ITP", "WFD"],
  "/pg-in-adugodi": ["KORA"],
  "/pg-in-btm-layout": ["KORA", "SJR"],
  "/pg-in-hsr-layout": ["KORA", "SJR"],
  "/pg-in-indiranagar": ["KORA"],
  "/pg-in-jayanagar": ["KORA"],
  "/pg-in-kadubeesanahalli": ["LIT", "KDH", "PODS"],
  "/pg-in-kadugodi": ["ITP", "WFD"],
  "/pg-in-kr-puram": ["PMC", "BGM"],
  "/pg-in-kundalahalli-gate": ["KDH", "ITP", "LIT"],
  "/pg-in-kundanahalli": ["KDH", "PODS", "LIT"],
  "/pg-in-kundanhalli-bangalore": ["KDH", "PODS", "LIT"],
  "/pg-in-madiwala": ["KORA"],
  "/pg-in-varthur": ["KDH", "PODS", "LIT"],
  "/pg-near-aecs-layout": ["ITP", "KDH"],
  "/pg-near-bagmane-tech-park": ["BGM", "PMC"],
  "/pg-near-bellandur": ["PODS", "KDH", "LIT"],
  "/pg-near-beml-layout": ["LIT", "KDH", "ITP"],
  "/pg-near-brookefield": ["ITP", "KDH", "WFD", "LIT"],
  "/pg-near-doddanekundi": ["BGM", "PMC"],
  "/pg-near-ecospace": ["PODS", "KDH", "LIT"],
  "/pg-near-hbr-layout": ["HBR"],
  "/pg-near-hoodi": ["PMC", "WFD", "ITP"],
  "/pg-near-hopefarm": ["WFD", "ITP"],
  "/pg-near-itpl-bangalore": ["ITP", "WFD"],
  "/pg-near-kaggadasapura": ["BGM", "PMC", "PODS"],
  "/pg-near-kalyan-nagar": ["HBR"],
  "/pg-near-karthik-nagar": ["BGM", "PODS", "KDH"],
  "/pg-near-koramangala": ["KORA", "SJR"],
  "/pg-near-kundalahalli": ["KDH", "ITP", "LIT"],
  "/pg-near-mahadevapura": ["PMC", "BGM"],
  "/pg-near-manyata-tech-park": ["HBR"],
  "/pg-near-marathahalli": ["PODS", "KDH", "LIT", "BGM"],
  "/pg-near-nagawara": ["HBR"],
  "/pg-near-nallurahalli": ["ITP", "WFD"],
  "/pg-near-prestige-tech-park": ["LIT", "PODS", "KDH"],
  "/pg-near-rga-tech-park": ["SJR", "KORA"],
  "/pg-near-rmz-ecoworld": ["PODS", "LIT", "KDH"],
  "/pg-near-rr-nagar": ["KORA"],
  "/pgs-near-kadugondanahalli": ["HBR"],
  "/pgs-near-prestige-tech-park": ["LIT", "PODS", "KDH"],
  "/properties-near-office-techparks": "all",
  "/studio-pg-in-bangalore": "studio",
  "/whitefield-zhub": ["WFD", "ITP"],
};

export function homesFor(path: string): Property[] {
  const pick = homesByPage[path] ?? "all";
  if (pick === "all") return properties;
  if (pick === "studio") return properties.filter((p) => roomKinds(p).includes("studio"));
  return pick.map((code) => properties.find((p) => p.code === code)).filter((p): p is Property => Boolean(p));
}

// A short, readable name for a landing page, for link lists, read from its
// URL: "/pg-near-bagmane-tech-park" is "PG near Bagmane Tech Park".
const upper = new Set(["pg", "itpl", "hbr", "kr", "rr", "btm", "hsr", "aecs", "beml", "rmz", "rga", "vr"]);
const lower = new Set(["near", "in", "at", "for"]);
export const landingName = (l: Landing) =>
  l.path
    .slice(1)
    .split("-")
    .map((w, i) =>
      w === "pgs" ? "PGs" : upper.has(w) ? w.toUpperCase() : i > 0 && lower.has(w) ? w : w === "zhub" ? "Z-Hub" : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ")
    .replace(/^PG Coliving/, "PG and coliving");
