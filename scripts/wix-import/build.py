"""Turns the extracted Wix pages and posts into the site's content files.

Pipeline (run from a scratch folder, see README.md next to this file):
  fetch.py   downloads every URL in the Wix sitemaps
  extract.mjs  pulls title, description and copy blocks out of each page
  build.py   (this file) cleans them up and writes src/content/wix/*.json

Copy is kept as written on Wix. Only presentation is touched: links point
inside the new site, layout leftovers (price banners, footer lines) go,
short lines that act as headings become headings, and runs of short lines
become lists.
"""

import json
import os
import re
import sys
from html import unescape

SRC = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "content", "wix")

# Wix URLs the new site serves with its own pages, or sends elsewhere.
OWN_PAGES = {"/", "/properties", "/privacypolicy", "/terms-and-conditions", "/blog", "/blog-1", "/team-ff21"}
# (thin "FF21 Location - KDH" pages, and an empty RR Nagar page not in the sitemap)
JUNK_POSTS = {"/post/____a"}  # a one-letter test post
REDIRECTED = {"/ff21kdh", "/ff21-kdh", "/copy-of-ff21-kdh-kundanhalli", "/ff21podsthubrahalli", "/coliving-near-rr-nagar"}

LEFTOVER = re.compile(
    r"^(?:(?:Twin|Single|Studio|Pod)s?\s+Rooms?\s+(?:at|in)\s+.*!|.*FOOD INCLUSIVE.*|.*Room Available with FOOD.*|"
    r"Book now with our new ZERO DEPOSIT policy!?|\*?All the prices listed.*|Stalk Us Here!?|Come visit us.*|"
    r"Wanna take a .*tour.*|Can't wait to join FF21.*|Whatsapp.*|Email-.*)$",
    re.I,
)


# FF21's own prices that changed since the Wix copy was written, applied to
# the area pages (blog lists of other PGs keep their numbers).
PRICE_FIXES = [
    (re.compile(r"11,200"), "12,000"),  # ITP twin, from 17 Oct 2026
]


def fix_prices(h):
    for pattern, new in PRICE_FIXES:
        h = pattern.sub(new, h)
    return h


def text(h):
    return unescape(re.sub(r"<[^>]+>", "", h)).strip()


def fix_links(h):
    def repl(m):
        href = unescape(m.group(1))
        if re.match(r"https?://(www\.)?ff21\.co\.in", href):
            new = "/find-my-home"
        elif re.match(r"https?://(www\.)?ff21\.in", href):
            new = re.sub(r"https?://(www\.)?ff21\.in", "", href) or "/"
            new = {"/team-ff21": "/about", "/blog-1": "/blog"}.get(new, new)
        elif "wix.com" in href or href.startswith("/search/"):
            return m.group(2)
        elif re.match(r"https?://[^/]*[A-Z]", href):
            # Wix turned words like "professionals.Top" into links; they aren't.
            return m.group(2)
        else:
            new = href
        return f'<a href="{new}">{m.group(2)}</a>'

    return re.sub(r'<a href="([^"]*)">(.*?)</a>', repl, h)


def is_headingish(t):
    return 3 <= len(t) <= 70 and not re.search(r"[.!?,;:)]$", t) and not re.match(r"^[·•\-*\d]", t)


def shape(blocks):
    """Wix blocks -> [{t, h|items|id,alt}] with headings and lists restored."""
    out = []
    raw = []
    for b in blocks:
        if b["tag"] == "img":
            raw.append({"t": "img", "id": b["id"], "alt": b.get("alt", "")})
        elif b["tag"] in ("ul", "ol"):
            items = [fix_links(i) for i in b.get("items", []) if text(i)]
            if items:
                raw.append({"t": "ul", "items": items})
        else:
            h = fix_links(b["html"])
            t = text(h)
            if not t or LEFTOVER.match(t):
                continue
            tag = b["tag"]
            if tag in ("h1",):
                raw.append({"t": "h1", "h": h})
            elif tag in ("h2", "h3", "h4", "h5", "h6"):
                raw.append({"t": "h2" if tag == "h2" else "h3", "h": h})
            elif tag == "li":
                raw.append({"t": "li", "h": h})
            else:
                raw.append({"t": "p", "h": h})
    i = 0
    while i < len(raw):
        b = raw[i]
        if b["t"] in ("p", "li"):
            # A run of short lines (places, bullets, list items) is a list.
            j = i
            run = []
            while j < len(raw) and raw[j]["t"] in ("p", "li"):
                t = text(raw[j]["h"])
                bullet = re.match(r"^[·•▪\-–*]\s*", t)
                if raw[j]["t"] == "li" or bullet or (len(t) <= 60 and not re.search(r"[.!?]$", t) and not (run and t.endswith(":"))):
                    run.append(re.sub(r"^\s*[·•▪\-–*]\s*", "", raw[j]["h"]))
                    j += 1
                else:
                    break
            # "Residents can benefit from:" introduces the list; it isn't an item.
            if run and text(run[0]).endswith(":") and raw[i]["t"] == "p":
                out.append({"t": "p", "h": run[0]})
                run = run[1:]
                i += 1
            if len(run) >= 3 or (raw[i]["t"] == "li" and run):
                # The first short line before a list often names it.
                first = text(run[0])
                if len(run) >= 4 and is_headingish(first) and not raw[i]["t"] == "li" and (out and out[-1]["t"] not in ("h2", "h3") and not text(out[-1].get("h", "")).endswith(":")):
                    out.append({"t": "h3", "h": run[0]})
                    run = run[1:]
                out.append({"t": "ul", "items": run})
                i = j
                continue
            t = text(b["h"])
            following = raw[i + 1] if i + 1 < len(raw) else None
            short_title = len(t) <= 40 and len(t.split()) <= 6
            if b["t"] == "p" and is_headingish(t) and following and following["t"] == "p" and len(text(following["h"])) > (40 if short_title else 90):
                out.append({"t": "h3", "h": b["h"]})
            else:
                out.append({"t": "p", "h": b["h"]})
            i += 1
            continue
        out.append(b)
        i += 1
    return out


def first_para(blocks):
    for b in blocks:
        if b["t"] == "p" and len(text(b["h"])) > 80:
            t = text(b["h"])
            return t if len(t) <= 158 else t[:155].rsplit(" ", 1)[0] + "…"
    return None


pages = json.load(open(os.path.join(SRC, "pages.json")))
posts = json.load(open(os.path.join(SRC, "posts.json")))

landing, own = [], {}
for p in pages:
    path = p["path"]
    meta = {"title": p["title"], "description": p.get("description")}
    if path in OWN_PAGES:
        own[path] = meta
        continue
    if path in REDIRECTED:
        continue
    blocks = shape(p["blocks"])
    for b in blocks:
        if "h" in b:
            b["h"] = fix_prices(b["h"])
        if "items" in b:
            b["items"] = [fix_prices(i) for i in b["items"]]
    h1 = next((text(b["h"]) for b in blocks if b["t"] == "h1"), None)
    blocks = [b for b in blocks if b["t"] != "h1"]
    landing.append({
        "path": path,
        "url": p["rawPath"],
        "title": p["title"],
        "description": p.get("description") or first_para(blocks),
        "h1": h1,
        "image": p.get("ogImage"),
        "blocks": blocks,
    })

articles = []
for p in posts:
    blocks = shape(p["blocks"])
    h1 = next((text(b["h"]) for b in blocks if b["t"] == "h1"), None)
    blocks = [b for b in blocks if b["t"] != "h1"]
    title = re.sub(r"(\s*\|\s*FF21\s*)+$", "", p["title"]).strip()
    img = next((b for b in blocks if b["t"] == "img"), None)
    if p["path"] in JUNK_POSTS:
        continue
    articles.append({
        "path": p["path"],
        # The URL exactly as Wix published it, for canonicals and links.
        "url": p["rawPath"],
        "title": p["title"],
        "heading": re.sub(r"(\s*\|\s*FF21\s*)+$", "", h1).strip() if h1 else title,
        "description": p.get("description") or first_para(blocks),
        "date": p.get("lastmod"),
        "image": img["id"] if img else None,
        "blocks": blocks,
    })
articles.sort(key=lambda a: a["date"] or "", reverse=True)

os.makedirs(OUT, exist_ok=True)
json.dump(landing, open(os.path.join(OUT, "landing.json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(articles, open(os.path.join(OUT, "blog.json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(own, open(os.path.join(OUT, "meta.json"), "w"), ensure_ascii=False, indent=1)
print(len(landing), "landing pages,", len(articles), "articles; own pages:", ", ".join(own))
