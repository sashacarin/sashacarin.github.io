#!/usr/bin/env python3
"""Sync feed.xml's <item> list from blog.html's post list.

blog.html's <ul class="posts"> is the hand-maintained source of truth for
title/link/date. Existing <item> blocks in feed.xml are matched by <guid> and
left byte-for-byte untouched, so editing a post or correcting its title/date
in blog.html never re-pings anyone. Only a post with no matching guid yet
(i.e. newly added to blog.html) gets a new <item> appended -- publishing a
post and pushing is what pings subscribers. New items get a naive
auto-generated description (the title, plus a period); hand-edit it
afterwards if you like, that's safe too since guid is what readers dedupe on.
"""
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "blog.html"
FEED = ROOT / "feed.xml"
SITE = "https://sashacarin.github.io"

POST_RE = re.compile(
    r'<li><span class="date">(?P<date>[\d-]+)</span>\s*'
    r'<a href="(?P<href>[^"]+)">(?P<title>.*?)</a></li>'
)
ITEM_RE = re.compile(r"^  <item>.*?^  </item>", re.DOTALL | re.MULTILINE)
GUID_RE = re.compile(r"<guid[^>]*>([^<]+)</guid>")


def slug_for(href):
    return Path(href).stem


def rfc822(date_str):
    return datetime.strptime(date_str, "%Y-%m-%d").strftime(
        "%a, %d %b %Y 12:00:00 +0000"
    )


def make_item(post):
    title, href, date = post["title"], post["href"], post["date"]
    link = f"{SITE}/{href}"
    guid = f"sashaslib-{slug_for(href)}"
    description = title if title.endswith(".") else f"{title}."
    return (
        "  <item>\n"
        f"    <title>{title}</title>\n"
        f"    <link>{link}</link>\n"
        f'    <guid isPermaLink="false">{guid}</guid>\n'
        f"    <description>{description}</description>\n"
        f"    <pubDate>{rfc822(date)}</pubDate>\n"
        "  </item>"
    )


def main():
    if not BLOG.exists():
        print(f"{BLOG} not found", file=sys.stderr)
        return 1
    if not FEED.exists():
        print(f"{FEED} not found (need an existing feed.xml as a template)", file=sys.stderr)
        return 1

    posts = [m.groupdict() for m in POST_RE.finditer(BLOG.read_text())]
    if not posts:
        print("no posts found in blog.html's <ul class=\"posts\">", file=sys.stderr)
        return 1

    feed_xml = FEED.read_text()
    item_matches = list(ITEM_RE.finditer(feed_xml))
    if not item_matches:
        print("no <item> blocks found in feed.xml to use as a template", file=sys.stderr)
        return 1

    existing_by_guid = {}
    for m in item_matches:
        g = GUID_RE.search(m.group(0))
        if g:
            existing_by_guid[g.group(1)] = m.group(0)

    new_guids = []
    blocks = []
    for post in posts:
        guid = f"sashaslib-{slug_for(post['href'])}"
        if guid in existing_by_guid:
            blocks.append(existing_by_guid[guid])
        else:
            blocks.append(make_item(post))
            new_guids.append(guid)

    start, end = item_matches[0].start(), item_matches[-1].end()
    new_feed = feed_xml[:start] + "\n\n".join(blocks) + feed_xml[end:]

    if new_feed == feed_xml:
        print("feed.xml already up to date")
        return 0

    try:
        ET.fromstring(new_feed)
    except ET.ParseError as e:
        print(f"refusing to write: regenerated feed.xml is not well-formed XML: {e}", file=sys.stderr)
        return 1

    FEED.write_text(new_feed)
    if new_guids:
        print(f"added {len(new_guids)} new item(s): {', '.join(new_guids)}")
    else:
        print("feed.xml reordered/normalized (no new items)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
