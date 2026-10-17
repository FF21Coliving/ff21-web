import * as cheerio from "cheerio";
import fs from "node:fs";

const index = fs.readFileSync("../index.tsv", "utf8").trim().split("\n").map((l) => l.split("\t"));
const lastmod = {}, sitemapImages = {};
for (const f of fs.readdirSync("..").filter((f) => f.endsWith(".xml"))) {
  const x = fs.readFileSync("../" + f, "utf8");
  for (const m of x.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]*)<\/loc>/)?.[1];
    if (!loc) continue;
    const u = loc.replace(/&apos;/g, "'").replace(/&amp;/g, "&");
    lastmod[u] = m[1].match(/<lastmod>([^<]*)<\/lastmod>/)?.[1];
    sitemapImages[u] = [...m[1].matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map((x) => x[1]);
  }
}

const clean = (s) => s.replace(/​/g, "").replace(/\s+/g, " ").trim();
// Inner HTML kept to a safe subset: text, links, bold, italics.
function inline($, el) {
  let out = "";
  $(el).contents().each((_, n) => {
    if (n.type === "text") out += $.root().text.call($(n)) ?? "";
    else if (n.type === "tag") {
      const inner = inline($, n);
      if (n.tagName === "a" && $(n).attr("href")) out += `<a href="${$(n).attr("href").replace(/"/g, "&quot;")}">${inner}</a>`;
      else if (["strong", "b"].includes(n.tagName)) out += inner.trim() ? `<strong>${inner}</strong>` : inner;
      else if (["em", "i"].includes(n.tagName)) out += inner.trim() ? `<em>${inner}</em>` : inner;
      else if (n.tagName === "br") out += " ";
      else out += inner;
    }
  });
  return out;
}
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function textHtml($, el) {
  // Rebuild from text nodes with escaping, keeping links/bold/italic.
  const walk = (node) => {
    let out = "";
    $(node).contents().each((_, n) => {
      if (n.type === "text") out += esc(n.data || "");
      else if (n.type === "tag") {
        const inner = walk(n);
        const href = $(n).attr("href");
        if (n.tagName === "a" && href) out += `<a href="${href.replace(/"/g, "&quot;")}">${inner}</a>`;
        else if (["strong", "b"].includes(n.tagName) && inner.trim()) out += `<strong>${inner}</strong>`;
        else if (["em", "i"].includes(n.tagName) && inner.trim()) out += `<em>${inner}</em>`;
        else if (n.tagName === "br") out += " ";
        else out += inner;
      }
    });
    return out;
  };
  return clean(walk(el)).replace(/<strong>\s*<\/strong>/g, "");
}

const pages = [], posts = [];
for (const [url, file, status] of index) {
  if (status.startsWith("ERR")) continue;
  const raw = fs.readFileSync("../raw/" + file, "utf8");
  const $ = cheerio.load(raw);
  const meta = (sel) => $(sel).attr("content") || undefined;
  const finalUrl = status.split(" ")[1] || url;
  const rec = {
    url,
    path: decodeURIComponent(new URL(url).pathname),
    rawPath: new URL(url).pathname,
    redirectedTo: finalUrl !== url ? new URL(finalUrl).pathname : undefined,
    title: clean($("title").first().text()),
    description: meta('meta[name="description"]'),
    canonical: $('link[rel="canonical"]').attr("href"),
    ogTitle: meta('meta[property="og:title"]'),
    ogImage: meta('meta[property="og:image"]'),
    robots: meta('meta[name="robots"]'),
    lastmod: lastmod[url],
    images: sitemapImages[url] || [],
    blocks: [],
  };
  if (rec.path.startsWith("/blog/") || rec.path.startsWith("/post/")) {
    const nodes = $("[id^=viewer-]").filter((_, e) => !$(e).parents("[id^=viewer-]").length);
    nodes.each((_, e) => {
      const tag = e.tagName;
      if (tag === "div" && !$(e).find("img").length) return;
      if (/^h[1-6]$/.test(tag) || tag === "p") {
        const h = textHtml($, e);
        if (h) rec.blocks.push({ tag, html: h });
      } else if (tag === "ul" || tag === "ol") {
        rec.blocks.push({ tag, items: $(e).children("li").map((_, li) => textHtml($, li)).get() });
      }
      $(e).find("img").each((_, im) => {
        const src = $(im).attr("src") || "";
        const id = src.match(/media\/([^/]+?)(?:\/|$)/)?.[1];
        if (id) rec.blocks.push({ tag: "img", id: decodeURIComponent(id), alt: $(im).attr("alt") || "" });
      });
    });
    rec.h1 = clean($("h1").first().text()) || undefined;
    posts.push(rec);
  } else {
    $('[data-testid="richTextElement"]').each((_, rt) => {
      $(rt).find("h1,h2,h3,h4,h5,h6,p,li").each((_, e) => {
        if (e.tagName === "p" && $(e).parents("li").length) return;
        const h = textHtml($, e);
        if (h) rec.blocks.push({ tag: e.tagName, html: h });
      });
    });
    rec.imgAlts = $("img").map((_, im) => ({ alt: $(im).attr("alt") || "", id: decodeURIComponent(($(im).attr("src") || "").match(/media\/([^/]+?)(?:\/|$)/)?.[1] || "") })).get().filter((x) => x.id);
    pages.push(rec);
  }
}
// Text on most pages is the site's header/footer, not page content.
const freq = {};
for (const p of pages) for (const t of new Set(p.blocks.map((b) => b.html))) freq[t] = (freq[t] || 0) + 1;
const common = new Set(Object.entries(freq).filter(([, n]) => n >= pages.length * 0.25).map(([t]) => t));
for (const p of pages) p.blocks = p.blocks.filter((b) => !common.has(b.html));
fs.writeFileSync("../pages.json", JSON.stringify(pages, null, 1));
fs.writeFileSync("../posts.json", JSON.stringify(posts, null, 1));
console.log("pages", pages.length, "posts", posts.length, "common dropped", common.size);
console.log([...common].slice(0, 40).join("\n"));
