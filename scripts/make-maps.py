"""Builds the static neighbourhood map for each home (public/maps/<slug>.webp).

The maps are pictures, not live maps: OpenStreetMap tiles around the home's
Google Maps pin, stitched once and tinted in FF21's colours. The pin itself
is drawn by the page, so it stays sharp. Run again only when a home moves or
a new one opens:

    python3 scripts/make-maps.py            # every home
    python3 scripts/make-maps.py kdh-kundanahalli

Map data (c) OpenStreetMap contributors; the page shows the credit.
"""

import io
import math
import os
import sys
import time
import urllib.request

from PIL import Image, ImageOps

# Pins from FF21's own Google Maps listings (read 17 Oct 2026).
HOMES = {
    "itp-whitefield": (12.9804074, 77.7470304),
    "wfd-whitefield": (12.9843719, 77.733698),
    "kdh-kundanahalli": (12.951442, 77.7175013),
    "pods-marathahalli": (12.9478046, 77.7182353),
    "lit-thubarahalli": (12.9537477, 77.7195835),
    "bgm-doddanekundi": (12.972923, 77.6919095),
    "pmc-mahadevapura": (12.9925348, 77.6955089),
    "hbr-hennur": (13.0279627, 77.630975),
    "kora-koramangala": (12.9340807, 77.618472),
    "sjr-sarjapur": (12.9096202, 77.6810529),
}

ZOOM = 15  # the neighbourhood: main roads, lakes, the nearest tech park
WIDTH, HEIGHT = 1600, 1000  # shown at half size, sharp on phones and retina
DARK, MID, LIGHT = (96, 150, 154), (190, 214, 215), (247, 250, 250)  # FF21 teal-grey to mist
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
HEADERS = {"User-Agent": "ff21-web static map builder/1.0 (+https://ff21-web.vercel.app)"}
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "maps")


def to_pixels(lat, lng, z):
    n = 256 * 2**z
    x = (lng + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def tile(z, x, y):
    req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        data = r.read()
    time.sleep(0.2)  # gentle on the volunteer-run tile servers
    return Image.open(io.BytesIO(data)).convert("RGB")


def build(slug, lat, lng):
    cx, cy = to_pixels(lat, lng, ZOOM)
    left, top = cx - WIDTH / 2, cy - HEIGHT / 2
    tx0, ty0 = int(left // 256), int(top // 256)
    tx1, ty1 = int((left + WIDTH) // 256), int((top + HEIGHT) // 256)
    canvas = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            canvas.paste(tile(ZOOM, tx, ty), ((tx - tx0) * 256, (ty - ty0) * 256))
    ox, oy = int(left - tx0 * 256), int(top - ty0 * 256)
    img = canvas.crop((ox, oy, ox + WIDTH, oy + HEIGHT))
    # One soft colour: brightness kept, hue swapped for FF21 teal-grey.
    gray = ImageOps.autocontrast(ImageOps.grayscale(img), cutoff=2)
    tinted = ImageOps.colorize(gray, black=DARK, white=LIGHT, mid=MID)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{slug}.webp")
    tinted.save(path, "WEBP", quality=82, method=6)
    return path


if __name__ == "__main__":
    wanted = sys.argv[1:] or list(HOMES)
    for slug in wanted:
        print(build(slug, *HOMES[slug]))
