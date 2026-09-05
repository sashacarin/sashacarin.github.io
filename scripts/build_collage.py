#!/usr/bin/env python3
"""Generate collage.html, the tile board that sits behind every page.

The board is plain HTML and CSS -- no script runs on the site -- which means
the tiles have to be written out literally. There are 300 of them, so they
get written here instead of by hand.

Editing the board means editing TILES below and re-running this script:

    python3 scripts/build_collage.py

Each entry is (file, href, label, fit):

    file  -- name of an image in assets/collage/
    href  -- page to open when the tile is clicked, or None for decoration
    label -- tooltip and accessible name; required when there is an href
    fit   -- "cover" crops the image square, "contain" letterboxes it whole.
             Use contain for anything with text or a shape that shouldn't be
             cut: banners, badges, wide logos.

The order the tiles are placed in is not the order below. The board is a
fixed 5 x 3, so with fewer than fifteen images some have to appear twice --
arrange() looks for a placement where no image touches a copy of itself,
diagonally included.
"""
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "collage.html"
IMAGES = ROOT / "assets" / "collage"

# The board is a fixed grid dividing the viewport, not an auto-filling one,
# so this is exactly how many tiles there are -- none are clipped.
COLS = 5
ROWS = 3
COUNT = COLS * ROWS

TILES = [
    ("qween.jpg",                None, None, "cover"),
    ("lorenz.png",               None, None, "cover"),
    ("chirikov.gif",             None, None, "cover"),
    ("ordchaos.gif",             None, None, "cover"),
    ("genepool.gif",             None, None, "cover"),
    ("ortnet.gif",               None, None, "cover"),
    ("gusher_1.JPG",             None, None, "cover"),
    ("laun.gif",                 None, None, "cover"),
    ("interrogate150.jpg",       None, None, "cover"),
    ("relationship-compass.jpg", None, None, "cover"),
    ("blownaway.jpg",            None, None, "contain"),
    ("PREVIEWHM.jpg",            None, None, "contain"),
    ("HWAwardForVision.gif",     None, None, "contain"),
]


def arrange(n, k, seed=20260904):
    """Place n cells from k images so no image touches a copy of itself.

    Every image is used before any is used twice, so the repeats are only
    the n - k surplus. Neighbours here means all eight around a cell, not
    just left and above: at this size a diagonal pair is as obvious as any
    other. Shuffles until one comes up clean, which it does almost at once.
    """
    rng = random.Random(seed)
    pool = [i % k for i in range(n)]

    def clean(order):
        for idx, img in enumerate(order):
            r, c = divmod(idx, COLS)
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < ROWS and 0 <= nc < COLS:
                        if order[nr * COLS + nc] == img:
                            return False
        return True

    for attempt in range(20000):
        rng.shuffle(pool)
        if clean(pool):
            return list(pool), attempt + 1
    raise SystemExit("no clean arrangement found for %d images in %d cells" % (k, n))


def report(order, k, attempts):
    dupes = [i for i in set(order) if order.count(i) > 1]
    print("%d tiles (%d x %d) from %d images" % (len(order), COLS, ROWS, k))
    print("  images shown twice: %d" % len(dupes))
    print("  no image touches a copy of itself (found in %d shuffles)" % attempts)


def markup(tile):
    name, href, label, fit = tile
    if not (IMAGES / name).exists():
        raise SystemExit("missing image: assets/collage/%s" % name)
    if " " in name:
        raise SystemExit("space in filename needs escaping in URLs: %s" % name)
    cls = ' class="contain"' if fit == "contain" else ""
    img = '<img src="assets/collage/%s" alt=""%s draggable="false">' % (name, cls)
    if href:
        esc = label.replace("&", "&amp;").replace("<", "&lt;").replace('"', "&quot;")
        return ('<a class="t" href="%s" target="_top" tabindex="-1" title="%s">%s</a>'
                % (href, esc, img))
    return '<div class="t">%s</div>' % img


def main():
    head = (ROOT / "scripts" / "collage_head.html").read_text(encoding="utf-8")
    order, attempts = arrange(COUNT, len(TILES))
    report(order, len(TILES), attempts)
    body = "\n".join(markup(TILES[i]) for i in order)
    OUT.write_text(head + body + "\n</div>\n</body>\n</html>\n", encoding="utf-8")
    print("wrote %s" % OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
