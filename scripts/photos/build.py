"""Makes the site's photo files from the FF21 Image Library.

    python3 scripts/photos/build.py <folder of r<row>.jpg and <file id>.jpg exports>

Each photo becomes three WebP widths (640, 1080, 1600) in public/photos, so a
phone downloads the small one and a big screen the large one (the image
loader picks the width; see src/lib/wix-image-loader.ts). Photos listed in
"og" also get a 1200x630 JPEG for link previews. Camera metadata (including
any location) is dropped.
"""

import json
import os
import sys

from PIL import Image, ImageOps

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "..", "..", "public", "photos")
WIDTHS = (640, 1080, 1600)

src = sys.argv[1]
manifest = json.load(open(os.path.join(HERE, "manifest.json")))
os.makedirs(OUT, exist_ok=True)
total = 0
for name, row in manifest["photos"].items():
    # A row number on the Inventory tab, or a Drive file id from a later tab.
    file = f"r{row}.jpg" if isinstance(row, int) else f"{row}.jpg"
    im = ImageOps.exif_transpose(Image.open(os.path.join(src, file))).convert("RGB")
    for w in WIDTHS:
        out = os.path.join(OUT, f"{name}-{w}.webp")
        scaled = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        scaled.save(out, "WEBP", quality=72 if w > 640 else 70, method=6)
        total += os.path.getsize(out)
    if name in manifest["og"]:
        out = os.path.join(OUT, f"{name}-og.jpg")
        ImageOps.fit(im, (1200, 630), Image.LANCZOS).save(out, "JPEG", quality=78, optimize=True, progressive=True)
        total += os.path.getsize(out)
print(f"{len(manifest['photos'])} photos, {total / 1048576:.1f} MB in public/photos")
