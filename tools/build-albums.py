#!/usr/bin/env python3
"""
Rewrite the home-page album grid from data/albums.json.

    python3 tools/build-albums.py

Adding an album is three steps:
  1. put the cover photo in your sources folder as <slug>.jpg
  2. python3 tools/optimize-images.py <sources> assets/img/gallery
  3. add the entry to data/albums.json, then run this script

The generated markup is written between the ALBUMS markers in index.html;
everything outside those markers is left untouched.
"""
import json, os, re, sys

START = "<!-- ALBUMS:START -->"
END = "<!-- ALBUMS:END -->"
SIZE_CLASS = {"wide": " tile--wide", "tall": " tile--tall", "normal": ""}


def picture(slug, alt, sizes, widths, lazy=True):
    avif = ", ".join(f"assets/img/gallery/{slug}-{w}.avif {w}w" for w in widths)
    webp = ", ".join(f"assets/img/gallery/{slug}-{w}.webp {w}w" for w in widths)
    loading = ' loading="lazy" decoding="async"' if lazy else ' fetchpriority="high"'
    return (
        f'<picture>\n'
        f'              <source type="image/avif" srcset="{avif}" sizes="{sizes}">\n'
        f'              <source type="image/webp" srcset="{webp}" sizes="{sizes}">\n'
        f'              <img src="assets/img/gallery/{slug}-1200.jpg" width="1200" height="800"'
        f' alt="{alt}"{loading}>\n'
        f'            </picture>'
    )


def tile(album):
    size = album.get("size", "normal")
    widths = [480, 768, 1200] if size != "wide" else [768, 1200, 1800]
    sizes = "(max-width: 600px) 100vw, (max-width: 780px) 50vw, 33vw"
    if size == "wide":
        sizes = "(max-width: 780px) 100vw, 66vw"

    available = [w for w in widths if os.path.exists(f"assets/img/gallery/{album['slug']}-{w}.avif")]
    if not available:
        raise SystemExit(f"no optimized images for '{album['slug']}' — run optimize-images.py first")

    return f"""        <article class="tile{SIZE_CLASS[size]}">
          <a class="tile-link" href="{album['href']}">
            {picture(album['slug'], album['alt'], sizes, available)}
            <span class="tile-body">
              <span class="tile-kicker">{album['location']}</span>
              <span class="tile-title">{album['title']}</span>
              <span class="tile-more">View album <i aria-hidden="true">&#8594;</i></span>
            </span>
          </a>
          <button class="tile-zoom" data-slug="{album['slug']}" data-caption="{album['title']} &mdash; {album['location']}" aria-label="Open photo: {album['title']}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6h-2V6.41l-3.3 3.3-1.4-1.42L17.58 5H15ZM3 15h2v2.59l3.3-3.3 1.4 1.42L6.42 19H9v2H3Z"/></svg>
          </button>
        </article>"""


def main():
    albums = json.load(open("data/albums.json"))["albums"]
    html = open("index.html", encoding="utf-8").read()

    if START not in html or END not in html:
        raise SystemExit("index.html is missing the ALBUMS markers")

    grid = "\n".join(tile(a) for a in albums)
    new = re.sub(
        re.escape(START) + r".*?" + re.escape(END),
        f"{START}\n{grid}\n        {END}",
        html,
        flags=re.S,
    )
    open("index.html", "w", encoding="utf-8").write(new)
    print(f"rebuilt {len(albums)} album tiles")


if __name__ == "__main__":
    sys.exit(main())
