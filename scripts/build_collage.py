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

The order the tiles are placed in is not the order below. Identical images
sitting next to each other is the one thing that makes a repeating board look
repeating, so the order is searched for below -- see scatter().
"""
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "collage.html"
IMAGES = ROOT / "assets" / "collage"

# How many tiles to emit. Enough to fill a 4K display at the largest tile
# size (about 18 x 11), with a little slack; on anything smaller the surplus
# is clipped. Every tile past the fold still costs layout, so this is sized
# to the worst case rather than rounded up for comfort.
COUNT = 220

# Column counts the board plausibly lands on across real window widths.
# scatter() avoids vertical neighbours for every one of them at once, since
# a static file cannot know which it will be.
LAGS = range(8, 25)

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
    ("widelogo.gif",             None, None, "contain"),
    ("select.gif",               None, None, "contain"),
    ("HWAwardForVision.gif",     None, None, "contain"),
]


def scatter(n, k, seed=20260904):
    """Order n cells drawn from k images so copies never touch.

    Greedy: at each cell, discard the two preceding images outright, then of
    what is left prefer whichever collides with the fewest of the candidate
    column counts. Ties broken at random. Guarantees no horizontal neighbour
    repeats, and in practice leaves only a handful of vertical ones at any
    single column count.
    """
    rng = random.Random(seed)
    out = []
    for i in range(n):
        recent = {out[i - 1] if i >= 1 else -1, out[i - 2] if i >= 2 else -1}
        best, best_cost = [], None
        for c in range(k):
            if c in recent:
                continue
            cost = sum(1 for lag in LAGS if i >= lag and out[i - lag] == c)
            if best_cost is None or cost < best_cost:
                best, best_cost = [c], cost
            elif cost == best_cost:
                best.append(c)
        out.append(rng.choice(best))
    return out


def report(order, k):
    worst = max((sum(1 for i in range(lag, len(order))
                     if order[i] == order[i - lag]), lag) for lag in LAGS)
    side = sum(1 for i in range(1, len(order)) if order[i] == order[i - 1])
    print("%d tiles from %d images" % (len(order), k))
    print("  horizontal neighbour repeats: %d" % side)
    print("  worst column count: %d repeats at %d columns" % worst)


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
    order = scatter(COUNT, len(TILES))
    report(order, len(TILES))
    body = "\n".join(markup(TILES[i]) for i in order)
    OUT.write_text(head + body + "\n</div>\n</body>\n</html>\n", encoding="utf-8")
    print("wrote %s" % OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
