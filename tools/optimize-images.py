#!/usr/bin/env python3
"""
Generate responsive, modern-format derivatives for the site's photography.

    python3 tools/optimize-images.py sources/ assets/img/gallery

For every source photo this writes AVIF, WebP and JPEG at each width in WIDTHS,
skipping widths larger than the original. The page serves them through a
<picture> element, so browsers take AVIF first, then WebP, then JPEG.

Run it after dropping new album photos into the sources folder.
"""
import sys, os
from PIL import Image, ImageOps

WIDTHS = [480, 768, 1200, 1800]
QUALITY = {"avif": 55, "webp": 78, "jpg": 82}


def derivatives(src_path, out_dir, stem):
    made = []
    with Image.open(src_path) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        ow, oh = im.size

        for w in WIDTHS:
            if w > ow:
                continue
            h = round(oh * w / ow)
            resized = im.resize((w, h), Image.LANCZOS)

            for fmt in ("avif", "webp", "jpg"):
                out = os.path.join(out_dir, f"{stem}-{w}.{fmt}")
                params = {"quality": QUALITY[fmt]}
                if fmt == "jpg":
                    params.update(optimize=True, progressive=True)
                    resized.save(out, "JPEG", **params)
                elif fmt == "webp":
                    resized.save(out, "WEBP", method=6, **params)
                else:
                    resized.save(out, "AVIF", **params)
                made.append((out, os.path.getsize(out)))
    return made, (ow, oh)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)

    src_total = out_total = 0
    for name in sorted(os.listdir(src_dir)):
        if not name.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        stem = os.path.splitext(name)[0]
        path = os.path.join(src_dir, name)
        made, size = derivatives(path, out_dir, stem)
        src_bytes = os.path.getsize(path)
        src_total += src_bytes
        out_total += sum(b for _, b in made)
        print(f"{stem:26} {size[0]}x{size[1]}  {src_bytes // 1024:>5} KB "
              f"-> {len(made)} files")

    print(f"\nsources {src_total // 1024} KB · derivatives {out_total // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
