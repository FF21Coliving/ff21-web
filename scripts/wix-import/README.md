# Wix SEO import

Carries the old Wix site's SEO over to this site: the same URLs, page titles,
descriptions and copy for its 80 area landing pages and 229 blog articles,
plus the redirects Wix had. Last run 17 Oct 2026.

Output: `src/content/wix/landing.json`, `blog.json`, `meta.json`, read by
`src/lib/wix-content.ts`.

To run it again (for example after new posts go up on Wix before the switch):

```
mkdir -p /tmp/wixseo/raw /tmp/wixseo/tools && cd /tmp/wixseo
# 1. the sitemaps
for s in sitemap pages-sitemap blog-posts-sitemap blog-categories-sitemap \
  dynamic-blog_p_9fb3b4ab_3c51_48c8_863a_7de194fdf1dd_0_5000-sitemap; do
  curl -sL "https://www.ff21.in/$s.xml" -o "${s%-sitemap}.xml"; done
# 2. the URL list (decode &apos; and &amp;), then fetch every page
python3 -c "import re,html,glob; print('\n'.join(sorted({html.unescape(u) for f in glob.glob('*.xml') for u in re.findall(r'<loc>([^<]*)</loc>', open(f).read()) if 'wixstatic' not in u and not u.endswith('.xml')})))" > urls.txt
python3 <repo>/scripts/wix-import/fetch.py
# 3. extract (needs cheerio in the tools folder)
cd tools && npm init -y >/dev/null && npm i cheerio@1.0.0 && cp <repo>/scripts/wix-import/extract.mjs . && node extract.mjs && cd ..
# 4. clean up and write the JSON into the repo
python3 <repo>/scripts/wix-import/build.py /tmp/wixseo
```

Two pages live on Wix but missing from its sitemap were added by hand:
`/coliving-near-rr-nagar` (empty, now redirects) and `/team-ff21` (now /about).
