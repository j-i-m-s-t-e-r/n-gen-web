#!/usr/bin/env python3
"""
Crops every frame image in assets/<module>/sprite_<id>/ to its actual
content bounding box, trimming flat-color blank padding.

Why: JPEXS renders every frame at the full SWF stage size regardless of
how much of that frame the original design actually used. Comparing
against the real app (headless capture, 120 samples), our "text" role
sprites in particular were rendering far larger than the original —
web port averaged 44% canvas coverage on the generic module vs the
real app's 10%. The actual content (a small caption graphic) was
sitting in a mostly-blank 900x675 frame, and our engine was scaling
the whole blank frame as if it were the real asset size.

Background/graphic sprites are typically already 60-95% full-bleed, so
this leaves them close to unchanged — safe to run across everything,
not just the sprites suspected of being oversized.

Usage:
    python3 tools/crop_content.py
"""
import os
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
THRESHOLD = 8       # how far a pixel must differ from the border color to count as "content"
PADDING = 6          # keep a small margin around detected content
MIN_CONTENT_FRACTION = 0.002  # skip crop if content region is implausibly tiny (likely a blank/noise frame)


def crop_one(path: Path) -> str:
    im = Image.open(path)
    gray = np.array(im.convert("L"))
    border_color = int(gray[0, 0])
    diff = np.abs(gray.astype(int) - border_color)
    mask = diff > THRESHOLD

    if mask.mean() < MIN_CONTENT_FRACTION:
        return "skipped (no content detected, likely a blank frame)"

    ys, xs = np.where(mask)
    x0, x1 = max(0, xs.min() - PADDING), min(gray.shape[1], xs.max() + PADDING)
    y0, y1 = max(0, ys.min() - PADDING), min(gray.shape[0], ys.max() + PADDING)

    if (x1 - x0) >= im.width * 0.98 and (y1 - y0) >= im.height * 0.98:
        return "skipped (already full-bleed)"

    cropped = im.crop((x0, y0, x1, y1))
    cropped.save(path, quality=90)
    return f"{im.size} -> {cropped.size}"


def main():
    total = 0
    for module_dir in sorted(ASSETS.iterdir()):
        if not module_dir.is_dir():
            continue
        for sprite_dir in sorted(module_dir.glob("sprite_*")):
            files = [f for f in sprite_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")]
            if not files:
                continue
            changed = 0
            for f in files:
                result = crop_one(f)
                if result.startswith("skipped"):
                    continue
                changed += 1
            print(f"{module_dir.name}/{sprite_dir.name}: {changed}/{len(files)} frames cropped")
            total += changed
    print(f"\nTotal frames cropped: {total}")


if __name__ == "__main__":
    main()
