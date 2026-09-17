# fijiweddingvideoticz — static home page

A hand-built static HTML/CSS/JS rebuild of the home page of
[fijiweddingvideoticz.com](https://fijiweddingvideoticz.com/), which today runs on
WordPress (Solene theme + Elementor, Essential Addons, Contact Form 7, Slider Revolution).

The goal is the same page — same content, sections, order and look — with no WordPress,
no plugins and no build step: three files and a folder of images.

## Files

```
index.html            the whole page
assets/css/style.css  layout, type and responsive rules
assets/js/main.js     mobile nav, sticky header, testimonial slider, scroll reveal, form handler
assets/img/           logo, accreditation badge, directory badges, 9 venue thumbs, hero photo
```

## Running it

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Sections (in source order, matching the live page)

1. Sticky header — logo + AIPP badge, 11-item menu, social icons, hamburger below 880px
2. Hero — `Fiji Wedding Photographer | DJ Services` over a full-bleed photo
3. Intro copy — three paragraphs with the Bula Bride / reviews links
4. `Fiji Wedding Venues | Photography` — 9 venue cards (3×3, zoom on hover)
5. `Fiji Wedding Films & Highlight Videos` — 9 Vimeo embeds (3×3)
6. `Testimonials` — Bula Bride, Easy Weddings and Married by Mandi badges
7. `Get in Touch` — 6-field contact form
8. Review slider — 5 client testimonials, autoplay, dots, swipe
9. Info strip — location, email, phone
10. Footer — contact info, quick links, business hours, Google map, copyright

## Differences from the live site

- **Contact form has no backend.** The live form posts to Contact Form 7. Here, submit runs
  client-side validation and shows the email/phone instead. Point the `action` at your own
  endpoint (or a PHP/Next.js handler) to make it live.
- **Nav and venue links are relative paths** (`photography/`, `sofitel-fiji-weddings/`, …)
  that mirror the live URL structure, so they resolve once sibling pages exist. Only the home
  page is in this repo.
- **Videos embed the Vimeo player directly** rather than the Essential Addons "sticky video"
  widget; the same nine video IDs are used.
- **Third-party scripts are not carried over** — Google Analytics/MonsterInsights, Site Kit,
  Facebook Pixel, jQuery, Elementor and Slider Revolution runtimes.
- **Icons are inline SVG** instead of Font Awesome, and fonts load from Google Fonts
  (Cormorant Garamond for display, Roboto for body) as on the live site.

## Notes

- Images were pulled from the live site's media library; `assets/img/hero.jpg` is the full
  2048×1536 original (~3 MB) and is worth resizing/converting to WebP before production.
- Layout is responsive at 1024px, 880px (nav collapse) and 767px breakpoints, and honours
  `prefers-reduced-motion`.
