"""Makes the blog's photo files, copied off Wix's image service on 27 Oct 2026.

    python3 scripts/photos/build-blog.py <folder of <id>.webp files>

The folder holds Wix's 1600 px WebP of each blog photo, saved under the first
part of its media id (for "3a848c_e1b0...~mv2.jpg", "3a848c_e1b0....webp").
Each photo becomes two WebP widths in public/blog-photos: 640 and 1080, as the
blog's columns are at most 768 px wide. Each post cover also gets a 1200x630
JPEG for link previews. Metadata is dropped. Files already built are kept, so
it can be run again for new photos only.

Wix resized every photo on request, often taking 0.5-2 s; the site's own
files load in 0.1-0.3 s. See src/lib/wix-content.ts (`local`).
"""

import json
import os
import re
import sys

from PIL import Image, ImageOps

HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, "..", "..")
OUT = os.path.join(ROOT, "public", "blog-photos")
WIDTHS = (640, 1080)
# Keep in step with `retired` and `takenDown` in src/lib/wix-content.ts.
RETIRED = {"3a848c_cd0a5381b37143ed89554cbe4a3ac550~mv2.png"}
TAKEN_DOWN = {
    "/blog/pg-near-bagmane-tech-park-for-ladies-under-12000",
    "/blog/pg-near-manyata-tech-park-under-12000-bangalore",
    "/blog/top-10-affordable-pgs-near-brookefield-bangalore",
}
WIX_ID = re.compile(r"^[0-9a-f]{6}_[0-9a-f]{32}~mv2\.\w+$")


def key(media_id):
    return media_id.split("~")[0]


def rgb(im):
    # Flatten transparency onto white, as the pages show photos on white.
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, (255, 255, 255))
        flat.paste(im, mask=im.getchannel("A"))
        return flat
    return im.convert("RGB")


def used():
    photos, covers = set(), set()
    for a in json.load(open(os.path.join(ROOT, "src", "content", "wix", "blog.json"))):
        if a["path"] in TAKEN_DOWN:
            continue
        blocks = [b["id"] for b in a["blocks"] if b["t"] == "img" and b["id"] not in RETIRED]
        photos.update(blocks)
        cover = a.get("image")
        if cover in RETIRED:
            cover = blocks[0] if blocks else None
        if cover:
            photos.add(cover)
            covers.add(cover)
    bad = [p for p in photos if not WIX_ID.match(p)]
    if bad:
        sys.exit(f"not Wix media ids: {bad[:5]}")
    return photos, covers


if __name__ == "__main__":
    src = sys.argv[1]
    photos, covers = used()
    os.makedirs(OUT, exist_ok=True)
    made, missing, total = 0, [], 0
    for media_id in sorted(photos):
        name = key(media_id)
        wanted = [f"{name}-{w}.webp" for w in WIDTHS] + ([f"{name}-og.jpg"] if media_id in covers else [])
        if all(os.path.exists(os.path.join(OUT, f)) for f in wanted):
            continue
        path = os.path.join(src, f"{name}.webp")
        if not os.path.exists(path):
            missing.append(media_id)
            continue
        im = rgb(Image.open(path))
        for w in WIDTHS:
            out = os.path.join(OUT, f"{name}-{w}.webp")
            scaled = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            scaled.save(out, "WEBP", quality=72 if w > 640 else 70, method=6)
            total += os.path.getsize(out)
        if media_id in covers:
            out = os.path.join(OUT, f"{name}-og.jpg")
            ImageOps.fit(im, (1200, 630), Image.LANCZOS).save(out, "JPEG", quality=78, optimize=True, progressive=True)
            total += os.path.getsize(out)
        made += 1
    print(f"{len(photos)} blog photos ({len(covers)} covers): {made} built, {total / 1048576:.1f} MB written")
    if missing:
        print(f"missing from {src}: {len(missing)}, e.g. {missing[:3]}")
        sys.exit(1)
