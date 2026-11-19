import "server-only";
import altData from "@/content/wix/alt-text.json";
import blogData from "@/content/wix/blog.json";
import landingData from "@/content/wix/landing.json";
import metaData from "@/content/wix/meta.json";
import { homesNear, places, properties, rentAt, roomKinds, type Property } from "./properties";
import { inr, rent } from "./site";

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

// Some Wix titles and descriptions carry line breaks or doubled spaces, which
// crawlers read as broken tags, and three titles end "| FF21 | FF21"; the
// words otherwise stay exactly as Wix had them.
const tidy = <T extends { title: string; description?: string | null }>(x: T): T => ({
  ...x,
  title: x.title.replace(/\s+/g, " ").trim().replace(/(\s*\|\s*FF21)+$/, " | FF21"),
  description: x.description?.replace(/\s+/g, " ").trim() || null,
});
// Wix left most blog photos without alt text; alt-text.json describes each
// one by its Wix image id, and fills in wherever Wix had none.
const altText = altData as Record<string, string>;
const withAlts = (blocks: Block[]): Block[] =>
  blocks.map((b) => (b.t === "img" && !b.alt.trim() && altText[b.id] ? { ...b, alt: altText[b.id] } : b));
// Wix's ITP banner still says "Pay 11200/-", and ITP starts at ₹12,000 now,
// so it stays out of the seven posts that carry it until there's a new one.
// The two posts that used it as their cover take their next photo instead.
const retired = new Set(["3a848c_cd0a5381b37143ed89554cbe4a3ac550~mv2.png"]);
const firstPhoto = (blocks: Block[]) => blocks.flatMap((b) => (b.t === "img" ? [b.id] : []))[0] ?? null;
// Wix's "/bangalore-student-pg" keeps its URL, but FF21 doesn't call itself a
// student PG (Madhvik, 28 Oct 2026): its name says "PGs in Bangalore" and its
// description loses the phrase.
const notStudent = (l: Landing): Landing =>
  l.path === "/bangalore-student-pg" ? { ...l, description: l.description?.replace(/Bangalore student PG,\s*/i, "") ?? null } : l;
// FF21 ITP closed (Madhvik, 5 Nov 2026). Its own page, /coliving-pgs-near-itpl,
// redirects to the other ITPL page (next.config.ts). Elsewhere its listing
// (an "FF21 ITP" heading and what follows, up to the next heading) and the
// "(Areas accessible from FF21-ITP …)" line come out.
const itpPage = "/coliving-pgs-near-itpl";
const withoutItp = (blocks: Block[]): Block[] => {
  let inItp = false;
  return blocks.filter((b) => {
    if (b.t === "h2") inItp = />FF21 ITP</.test(b.h);
    return !inItp && !(b.t === "p" && b.h.startsWith("(Areas accessible from FF21-ITP"));
  });
};
// FF21's own prices in the Wix copy say "from", never a top price. A price
// under an "FF21 PMC" style heading is that home's; elsewhere it's the home
// the page is about (pageHome), or FF21's lowest, ₹14,000. A price that is one
// of the home's room prices (`from` on its rooms in properties.ts) stays, as
// "from ₹19,800"; any other becomes the home's starting rent. Sentences that
// listed a top or premium price are rewritten whole. Posts keep their prices
// of other PGs; only the three that named an FF21 price change.
const mark = "\u0000rent\u0000";
const priceRewrites: [string, string][] = [
  // LIT's 1 BHK is ₹40,000 now (20 Nov 2026).
  ["Price: INR 45,200 (Per month)", "Price: INR 40,000 (Per month)"],
  ["a 1 BHK costs ₹45,200 per month", "a 1 BHK costs ₹40,000 per month"],
  ["Twin Sharing rooms start from ₹15,750, while more private Studio and Single Room options go up to ₹36,600.", `Twin Sharing rooms start from ${mark} a month, with Studio and Single Rooms for more privacy.`],
  ["Twin Sharing rooms start at ₹15,750 and range up to ₹16,950 for the premium range.", `Twin Sharing rooms start from ${mark} a month.`],
  ["start at ₹28,900/month (Deluxe) and ₹32,000/month (Premium)", "start from ₹28,900 a month"],
  ["which start at ₹14,000/month (Basic), ₹17,350/month (Deluxe), and ₹18,450/month (Premium)", `which start from ${mark} a month`],
  ["are available in Deluxe (₹34,700/month) and Premium (₹36,950/month) categories", "start from ₹34,700 a month"],
  ["Starting from ₹15,750 for Twin Sharing Deluxe to ₹32,000 for Premium Single Rooms, each stay", `With rooms from ${mark} a month, each stay`],
  ["private rooms starting from Rs 15,000 per month", `private rooms from ${mark} per month`],
  ["cost starting at ₹13,100/Month.", `starts from ${mark} a month.`],
  ["Prices starting at ₹10,000/month.", `Rent starts from ${mark} a month.`],
  ["Twin Sharing starts at ₹15,750/month,", `Twin Sharing starts from ${mark} a month,`],
  ["Studio Rooms start from ₹19,800/month and include", "Studio Rooms start from ₹19,800 a month and include"],
  ["With rates starting at ₹15,750/month,", `With rent from ${mark} a month,`],
  ["Single Rooms begin at ₹28,900.", "Single Rooms start from ₹28,900."],
  ["Bellandur starts at ₹14,000 per month", `Bellandur starts from ${mark} per month`],
];
// Area pages whose copy, and so whose prices, are about one home.
const pageHome: Record<string, string> = Object.fromEntries(
  Object.entries({
    PMC: ["/coliving-near-brookefield", "/coliving-pg-bangalore-smart-living", "/coliving-pg-in-bangalore-flexible-living", "/coliving-pg-in-kr-puram", "/coliving-pg-near-mahadevapura", "/coliving-pg-near-phoenix-marketcity-bangalore", "/coliving-pg-near-vr-bengaluru-whitefield", "/coliving-pgs-near-hoodi", "/coliving-space-bangalore-smart-urban-living", "/pg-in-kr-puram", "/pg-near-brookefield", "/pg-near-hoodi", "/pg-near-mahadevapura"],
    LIT: ["/coliving-near-kadubeesanahalli", "/pg-in-kadubeesanahalli", "/pgs-near-prestige-tech-park"],
    KDH: ["/pg-near-aecs-layout"],
    BGM: ["/pg-near-bagmane-tech-park", "/pg-near-doddanekundi"],
    HBR: ["/pg-near-kalyan-nagar", "/pg-near-nagawara"],
    PODS: ["/pg-near-marathahalli", "/coliving-pg-near-bellandur"],
  }).flatMap(([code, paths]) => paths.map((p) => [p, code])),
);
type Price = { rent: string; rooms: Set<number> };
const priceOf = (code: string | undefined): Price => {
  const home = code ? properties.find((p) => p.code === code) : undefined;
  if (!home) return { rent, rooms: new Set() };
  return { rent: rentAt(home), rooms: new Set(home.rooms.map((r) => r.from)) };
};
const homeHeading = (h: string) => h.replace(/<[^>]+>/g, "").match(/\bFF21[\s-]?([a-z]+)\b/i)?.[1].toUpperCase();
const ourPrice = /(?:₹|INR)\s?\d{1,2},\d{3}(?:\/-)?/g;
// The new price goes in last, so its own "₹14,000" isn't read as an old one.
// A bare price becomes "from ₹14,000", and "at from" or "for from" reads
// "from". Price cards put "Starts at" in a block of its own above the price:
// that reads "Starts from", and the price after it stays bare.
const isStartsAt = (h: string) => h.replace(/<[^>]+>/g, "").trim() === "Starts at";
// A room price is held as "\u0000<number>\u0000" until the end, like `mark`.
// Links to ITP's old page go straight to where it now redirects.
const fixCopy = (h: string, price: Price | null, bare = false) => {
  if (price && isStartsAt(h)) return h.replace("Starts at", "Starts from");
  const fixed = priceRewrites.reduce((s, [from, to]) => s.replace(from, to), h);
  const held = (m: string) => {
    const n = Number(m.replace(/\/-$/, "").replace(/\D/g, ""));
    return price?.rooms.has(n) ? `\u0000${n}\u0000` : mark;
  };
  const priced = price ? fixed.replace(ourPrice, (m) => (bare ? "" : "from ") + held(m)).replace(/\b(?:at|for|for just|from) from \u0000/g, "from \u0000") : fixed;
  return priced
    .replace(/\u0000(\d+)\u0000/g, (_, n: string) => inr(Number(n)))
    .replaceAll(mark, price?.rent ?? rent)
    .replaceAll(`href="${itpPage}"`, 'href="/pg-near-itpl-bangalore"');
};
// Fixes a run of texts (blocks, or a list's items), each knowing the one before.
const fixRun = (texts: string[], price: Price | null) => texts.map((t, i) => fixCopy(t, price, i > 0 && isStartsAt(texts[i - 1])));
// `page` is the page's home, or "" for none; null leaves prices alone (posts).
const withFixes = (blocks: Block[], page: string | null): Block[] => {
  let section: string | undefined;
  let prev = "";
  return blocks.map((b) => {
    if (b.t === "img") return b;
    if (b.t === "h2" || b.t === "h3") {
      const code = homeHeading(b.h);
      if (code || b.t === "h2") section = code;
    }
    const price = page === null ? null : priceOf(section ?? (page || undefined));
    if (b.t === "ul") {
      prev = "";
      return { ...b, items: fixRun(b.items, price) };
    }
    const h = fixCopy(b.h, price, isStartsAt(prev));
    prev = b.h;
    return { ...b, h };
  });
};

export const landingPages = (landingData as unknown as Landing[])
  .filter((l) => l.path !== itpPage)
  .map((l) => ({ ...l, blocks: withFixes(withoutItp(l.blocks), pageHome[l.path] ?? "") }))
  .map(tidy)
  .map(notStudent);
// Posts taken down on 24 Oct 2026: they listed made-up "FF21 … PG" homes at
// rents below FF21's real ones. next.config.ts redirects each to its area.
export const takenDown = new Set([
  "/blog/pg-near-bagmane-tech-park-for-ladies-under-12000",
  "/blog/pg-near-manyata-tech-park-under-12000-bangalore",
  "/blog/top-10-affordable-pgs-near-brookefield-bangalore",
]);
// Blog photos were copied off Wix's image service on 27 Oct 2026, which
// resized each one on request (often 0.5–2 s). They live in
// public/blog-photos under the first part of their Wix id, built by
// scripts/photos/build-blog.py; the image loader picks the width.
const local = (id: string) => `/blog-photos/${id.split("~")[0]}`;
export const articles = (blogData as unknown as Article[]).filter((a) => !takenDown.has(a.path)).map((a) => {
  const blocks = withFixes(withAlts(a.blocks.filter((b) => !(b.t === "img" && retired.has(b.id)))), null);
  const image = a.image && retired.has(a.image) ? firstPhoto(blocks) : a.image;
  return {
    ...tidy(a),
    blocks: blocks.map((b) => (b.t === "img" ? { ...b, id: local(b.id) } : b)),
    image: image ? local(image) : image,
  };
});
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
  "/coliving-near-brookefield": ["KDH", "WFD", "LIT"],
  "/coliving-near-kadubeesanahalli": ["LIT", "KDH", "PODS"],
  "/coliving-near-kaggadasapura": ["BGM", "PMC", "PODS"],
  "/coliving-near-koramangala": ["KORA", "SJR"],
  "/coliving-near-kundalahalli": ["KDH", "LIT"],
  "/coliving-near-kundanahalli": ["KDH", "PODS", "LIT"],
  "/coliving-pg-bangalore-smart-living": "all",
  "/coliving-pg-in-bangalore": "all",
  "/coliving-pg-in-bangalore-flexible-living": "all",
  "/coliving-pg-in-kalyan-nagar": ["HBR"],
  "/coliving-pg-in-kr-puram": ["PMC", "BGM"],
  "/coliving-pg-near-bagmane-tech-park": ["BGM", "PMC"],
  "/coliving-pg-near-bellandur": ["PODS", "KDH", "LIT"],
  "/coliving-pg-near-brigade-software-park-bangalore": ["WFD", "KDH"],
  "/coliving-pg-near-eco-space": ["PODS", "KDH", "LIT"],
  "/coliving-pg-near-mahadevapura": ["PMC", "BGM"],
  "/coliving-pg-near-manyata-tech-park": ["HBR"],
  "/coliving-pg-near-marathahalli": ["PODS", "KDH", "LIT", "BGM"],
  "/coliving-pg-near-phoenix-marketcity-bangalore": ["PMC", "BGM"],
  "/coliving-pg-near-vr-bengaluru-whitefield": ["PMC", "WFD"],
  "/coliving-pgs-near-aecs-layout": ["KDH"],
  "/coliving-pgs-near-beml-layout": ["LIT", "KDH"],
  "/coliving-pgs-near-doddanekundi": ["BGM", "PMC"],
  "/coliving-pgs-near-hbr-layout": ["HBR"],
  "/coliving-pgs-near-hoodi": ["PMC", "WFD"],
  "/coliving-pgs-near-hope-farm": ["WFD"],
  "/coliving-pgs-near-karthik-nagar": ["BGM", "PODS", "KDH"],
  "/coliving-pgs-near-nagawara": ["HBR"],
  "/coliving-pgs-near-nallurahalli": ["WFD"],
  "/coliving-space-bangalore-smart-urban-living": "all",
  "/luxury-pg-in-bangalore": "all",
  "/monthly-stay-in-bangalore": "all",
  "/pg-coliving-near-kalyani-tech-park-bangalore": ["WFD"],
  "/pg-coliving-near-mind-comp-tech-park-bangalore": ["WFD"],
  "/pg-in-adugodi": ["KORA"],
  "/pg-in-btm-layout": ["KORA", "SJR"],
  "/pg-in-hsr-layout": ["KORA", "SJR"],
  "/pg-in-indiranagar": ["KORA"],
  "/pg-in-jayanagar": ["KORA"],
  "/pg-in-kadubeesanahalli": ["LIT", "KDH", "PODS"],
  "/pg-in-kadugodi": ["WFD"],
  "/pg-in-kr-puram": ["PMC", "BGM"],
  "/pg-in-kundalahalli-gate": ["KDH", "LIT"],
  "/pg-in-kundanahalli": ["KDH", "PODS", "LIT"],
  "/pg-in-kundanhalli-bangalore": ["KDH", "PODS", "LIT"],
  "/pg-in-madiwala": ["KORA"],
  "/pg-in-varthur": ["KDH", "PODS", "LIT"],
  "/pg-near-aecs-layout": ["KDH"],
  "/pg-near-bagmane-tech-park": ["BGM", "PMC"],
  "/pg-near-bellandur": ["PODS", "KDH", "LIT"],
  "/pg-near-beml-layout": ["LIT", "KDH"],
  "/pg-near-brookefield": ["KDH", "WFD", "LIT"],
  "/pg-near-doddanekundi": ["BGM", "PMC"],
  "/pg-near-ecospace": ["PODS", "KDH", "LIT"],
  "/pg-near-hbr-layout": ["HBR"],
  "/pg-near-hoodi": ["PMC", "WFD"],
  "/pg-near-hopefarm": ["WFD"],
  "/pg-near-itpl-bangalore": ["WFD"],
  "/pg-near-kaggadasapura": ["BGM", "PMC", "PODS"],
  "/pg-near-kalyan-nagar": ["HBR"],
  "/pg-near-karthik-nagar": ["BGM", "PODS", "KDH"],
  "/pg-near-koramangala": ["KORA", "SJR"],
  "/pg-near-kundalahalli": ["KDH", "LIT"],
  "/pg-near-mahadevapura": ["PMC", "BGM"],
  "/pg-near-manyata-tech-park": ["HBR"],
  "/pg-near-marathahalli": ["PODS", "KDH", "LIT", "BGM"],
  "/pg-near-nagawara": ["HBR"],
  "/pg-near-nallurahalli": ["WFD"],
  "/pg-near-prestige-tech-park": ["LIT", "PODS", "KDH"],
  "/pg-near-rga-tech-park": ["SJR", "KORA"],
  "/pg-near-rmz-ecoworld": ["PODS", "LIT", "KDH"],
  "/pg-near-rr-nagar": ["KORA"],
  "/pgs-near-kadugondanahalli": ["HBR"],
  "/pgs-near-prestige-tech-park": ["LIT", "PODS", "KDH"],
  "/properties-near-office-techparks": "all",
  "/studio-pg-in-bangalore": "studio",
  "/whitefield-zhub": ["WFD"],
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
const landingNames: Record<string, string> = { "/bangalore-student-pg": "PGs in Bangalore" };
export const landingName = (l: Landing) =>
  landingNames[l.path] ??
  l.path
    .slice(1)
    .split("-")
    .map((w, i) =>
      w === "pgs" ? "PGs" : upper.has(w) ? w.toUpperCase() : i > 0 && lower.has(w) ? w : w === "zhub" ? "Z-Hub" : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ")
    .replace(/^PG Coliving/, "PG and coliving");

// --- Internal links ------------------------------------------------------------
// Google finds and weighs pages by the links between them. Each area page
// links to the other areas served by the same homes, each home lists its
// area pages, and each post links to related posts and the homes near the
// places it names, so no page hangs off a single link.

export const codesOf = (path: string) => {
  const pick = homesByPage[path];
  return Array.isArray(pick) ? pick : [];
};

// Area pages whose main home is this one (first in its list), so each area
// page is linked from exactly one home page; city-wide pages are left out.
export function areaPagesFor(code: string): Landing[] {
  return landingPages.filter((l) => codesOf(l.path)[0] === code).sort((a, b) => landingName(a).localeCompare(landingName(b)));
}

// Other area pages served by the same homes, most homes in common first.
export function nearbyAreaPages(path: string, limit = 12): Landing[] {
  const mine = codesOf(path);
  if (mine.length === 0) return [];
  return landingPages
    .filter((l) => l.path !== path)
    .map((l) => ({ l, shared: codesOf(l.path).filter((c) => mine.includes(c)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || landingName(a.l).localeCompare(landingName(b.l)))
    .slice(0, limit)
    .map((x) => x.l);
}

const STOP = new Set("a an and are at bangalore bengaluru best by for from guide how in is it its near of on or the to top what with you your ff21 2024 2025 2026 complete things".split(" "));
const wordsOf = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(" ").filter((w) => w.length > 2 && !STOP.has(w)));

// Related reads, worked out once for all posts: each post's three closest
// (most shared words in title and heading; ties go to the newer post), then
// every post linked from fewer than two others is added, as a further link, to
// the posts closest to it. So no post hangs off the blog list alone.
const RELATED = 3;
const EXTRA_MAX = 2;
const related: Map<string, { cards: Article[]; more: Article[] }> = (() => {
  const words = articles.map((a) => wordsOf(`${a.title} ${a.heading}`));
  const shared = (i: number, j: number) => {
    let n = 0;
    for (const w of words[j]) if (words[i].has(w)) n++;
    return n;
  };
  const byCloseness = (i: number) =>
    articles
      .map((_, j) => j)
      .filter((j) => j !== i)
      .map((j) => ({ j, n: shared(i, j) }))
      .sort((p, q) => q.n - p.n || (articles[q.j].date ?? "").localeCompare(articles[p.j].date ?? ""));
  const ranked = articles.map((_, i) => byCloseness(i));
  const cards = ranked.map((r) => r.slice(0, RELATED).map((x) => x.j));
  const more: number[][] = articles.map(() => []);
  const inbound = articles.map(() => 0);
  for (const list of cards) for (const j of list) inbound[j]++;
  for (let j = 0; j < articles.length; j++) {
    // The posts closest to j that don't already link it and have room.
    for (const { j: i } of ranked[j]) {
      if (inbound[j] >= 2) break;
      if (cards[i].includes(j) || more[i].includes(j) || more[i].length >= EXTRA_MAX) continue;
      more[i].push(j);
      inbound[j]++;
    }
  }
  return new Map(articles.map((a, i) => [a.path, { cards: cards[i].map((j) => articles[j]), more: more[i].map((j) => articles[j]) }]));
})();

export const relatedArticles = (a: Article) => related.get(a.path) ?? { cards: [], more: [] };

// The blog by topic, for the blog page's full list. Matched on the title, in
// this order; whatever matches nothing is "Places and things to do".
const TOPICS: [string, RegExp][] = [
  ["Finding a PG or coliving home", /\b(pgs?|coliving|co-living|colive|co-live|hostels?|paying guest|accommodation|rent|rental|rooms?|roommates?|flats?|tenants?|stay|living|move|moving|relocat\w*|housing|deposit|lease|landlords?|students?|colleges?|university|campus)\b/],
  ["Jobs and careers", /\b(jobs?|hiring|freshers?|careers?|interviews?|salary|recruit\w*|internships?|new hire)\b/],
  ["Food, cafés and nightlife", /\b(cafes?|restaurants?|food|pubs?|bars?|brew\w*|nightlife|dining|biryani|desserts?|coffee)\b/],
  ["Events and festivals", /\b(expo|festivals?|concerts?|marathons?|events?|diwali|holi|ganesh\w*|chaturthi|christmas|new year|ipl)\b/],
];
const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export const blogTopics: { name: string; posts: Article[] }[] = (() => {
  const groups = new Map<string, Article[]>([...TOPICS.map(([name]) => [name, []] as [string, Article[]]), ["Places and things to do", []]]);
  for (const a of articles) {
    const t = plain(`${a.title} ${a.heading}`);
    const hit = TOPICS.find(([, rx]) => rx.test(t));
    groups.get(hit ? hit[0] : "Places and things to do")!.push(a);
  }
  return [...groups].map(([name, posts]) => ({ name, posts })).filter((g) => g.posts.length > 0);
})();

// FF21 homes near the places a post names in its title ("Best Cafes in
// Whitefield" → the Whitefield homes), so readers can see where to live.
export function homesForArticle(a: Article, limit = 3): { place: string; homes: Property[] } | null {
  const text = ` ${a.title} ${a.heading} `.toLowerCase();
  const named = places.filter((p) => text.includes(` ${p.toLowerCase()}`)).sort((x, y) => y.length - x.length);
  for (const place of named) {
    const homes = homesNear(place);
    if (homes.length) return { place, homes: homes.slice(0, limit) };
  }
  return null;
}
