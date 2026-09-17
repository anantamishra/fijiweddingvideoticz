# fijiweddingvideoticz — static home page

A dependency-free static home page for
[fijiweddingvideoticz.com](https://fijiweddingvideoticz.com/), built to replace the
WordPress/Elementor original with a photography-led editorial layout.

No framework, no build step, no plugins: one HTML file, one stylesheet, one script.

## Files

```
index.html               the page
assets/css/style.css     design system, layout, responsive rules
assets/js/main.js        menu, lightbox, film loader, slider, reveals, form
assets/img/brand/        logo, AIPP accreditation, directory badges
assets/img/gallery/      venue photography at 768 / 1024 / 1536 for srcset
assets/img/film/         Vimeo poster frames
```

## Running it

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## The design

Warm porcelain and bronze palette, Cormorant Garamond for display type against Jost for
interface type, and full-bleed photography carrying each section.

- **Hero** — full-viewport reception frame with a slow pan, layered scrim so the type stays
  legible, and a stat row (years, venues, reply time)
- **Masthead** — transparent over the hero, frosted and solid once you scroll past it; the
  eleven-page menu lives in a full-screen overlay so the bar stays quiet
- **Story** — asymmetric split, the studio's three paragraphs, and a service index
- **Venues** — a nine-tile mosaic with wide and tall spans; tiles link through to each venue
  page, and a zoom button opens a keyboard-navigable lightbox
- **Films** — poster-first grid; the Vimeo player is injected only when you press play, so
  nine embeds cost nothing on load
- **Testimonials** — dark section, one quote at a time, arrows/dots/swipe, auto-height
- **Enquire** — split layout with floating-label fields on a raised card
- **Footer** — brand note, quick links, opening hours, map

Dark mode ships via `prefers-color-scheme`, motion is disabled under
`prefers-reduced-motion`, and breakpoints land at 1100px (nav collapse), 900px, 780px
and 600px.

## Performance notes

- Images are served from a `srcset` at three widths; the hero is preloaded with
  `fetchpriority="high"`, everything else is lazy
- Films load zero third-party bytes until clicked
- No jQuery, Elementor, Slider Revolution, analytics or pixel runtimes
- Icons are inline SVG; only the two font families are fetched externally

## Differences from the live site

- **The form has no backend.** It validates client-side and shows the studio's email and
  phone instead. Point `action` at your own handler to make it live.
- **Nav and venue links are relative paths** mirroring the live URL structure
  (`photography/`, `sofitel-fiji-weddings/`, …). Only the home page lives in this repo, so
  they resolve once the sibling pages exist.
- **Film titles and posters** come from the studio's own Vimeo channel metadata; the
  original page showed unlabelled players.
- **`LocalBusiness` structured data** replaces the WordPress-generated JSON-LD.
