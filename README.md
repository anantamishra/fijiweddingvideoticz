# fijiweddingvideoticz — static home page

A fast, dependency-free home page for
[fijiweddingvideoticz.com](https://fijiweddingvideoticz.com/), built around the wedding
albums. No framework, no build step for the page itself, no plugins.

## Files

```
index.html                  the page (album grid is generated — see below)
data/albums.json            source of truth for the album grid
tools/optimize-images.py    photo -> AVIF + WebP + JPEG at 4 widths
tools/build-albums.py       regenerates the album grid from albums.json
assets/css/style.css        design system, layout, responsive rules
assets/css/fonts.css        self-hosted @font-face declarations
assets/js/main.js           menu, lightbox, film loader, slider, reveals, form
assets/fonts/               6 woff2 faces, latin subset
assets/img/gallery/         album covers, 480/768/1200/1800
assets/img/film/            Vimeo poster frames, 480/800
```

## Adding a wedding album

```bash
# 1. drop the cover photo in a sources folder, named <slug>.jpg
python3 tools/optimize-images.py ~/album-sources assets/img/gallery

# 2. add the album to data/albums.json (slug, title, location, href, alt, size)
# 3. regenerate the grid
python3 tools/build-albums.py
```

`size` is `normal`, `wide` or `tall` and controls how the tile spans the mosaic.

This is a command-line workflow, not the upload screen — that needs a backend, which is
a separate decision (see **Next** below).

## Running it

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Speed

First load is **~335 KB** with **zero third-party requests**:

| | |
|---|---|
| HTML + CSS + JS | 86 KB |
| 2 preloaded fonts | 63 KB |
| Hero photo (AVIF, 1800px) | 172 KB |
| Logo | 15 KB |

How it gets there:

- **AVIF first, WebP second, JPEG fallback** through `<picture>`, at four widths. AVIF runs
  roughly half the weight of the equivalent JPEG.
- **Self-hosted fonts** — no render-blocking request to Google Fonts, latin subset only,
  the two faces used above the fold are preloaded.
- **Critical shell CSS is inlined**, so first paint never waits on the stylesheet.
- **Vimeo players load on click.** Nine films cost nothing until someone presses play.
- **The Google map loads on click** too, so no third-party frame on first paint.
- Everything below the fold is `loading="lazy"` with width/height set, so nothing shifts.

## The page

Warm porcelain and bronze, Cormorant Garamond against Jost, photography carrying every
section. Hero → albums → accreditations → approach → films → testimonials → enquiry.

The album mosaic is the centre of the page: nine resort albums with wide and tall spans,
a "View album" affordance on hover, and a corner button that opens the cover full screen
in a keyboard-navigable lightbox.

### Menu structure

Eight flat links became six top-level items, three of them grouped:

```
Home
Services ▾    Photography · Film · Elopements · Family Photography · DJ Services
Albums  ▾     one entry per resort, generated from data/albums.json
Guides  ▾     Fiji Wedding Guide · Choosing a Photographer
About Us
Contact Us
```

The Albums menu is deduped by resort, so the three Sofitel albums and two Musket Cove
albums appear once each — six entries from nine albums, rebuilt by `build-albums.py`
along with the grid.

Guides brings back two pages that exist on the site but had dropped out of the menu.
Delete that group from `index.html` if you would rather leave them out.

Dropdowns open on hover on desktop, on click or keyboard anywhere, and close on Escape,
click-outside or focus leaving the group. Below 1100px the whole thing becomes a
full-screen overlay with the same groups as headed sections.

Dark mode ships via `prefers-color-scheme`; motion is disabled under
`prefers-reduced-motion`.

## Next

- **Album uploads** need a backend. The options are keeping WordPress and replacing the
  theme (keeps the admin and the existing albums), or a headless CMS behind a Next.js
  front end. Not started — the architecture is still to be decided.
- **The enquiry form has no backend.** It validates client-side and shows the studio's email
  and phone. Point `action` at a handler to make it live.
- **Nav and album links are relative paths** mirroring the live URL structure. Only the home
  page lives in this repo, so they resolve once the sibling pages exist.
