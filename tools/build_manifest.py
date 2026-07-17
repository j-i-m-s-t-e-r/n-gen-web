#!/usr/bin/env python3
"""
Scans assets/<module>/sprite_<id>/ for image files and writes
assets/manifest.json, matching the folder convention:

    assets/
      generic/
        sprite_11/   any .svg or .png files here = frame pool for layer 11
        sprite_43/
        sprite_45/
        sprite_47/
      cal/
        sprite_11/
        sprite_13/
        ...
      techno/  mod/  ftool/  urb/   (module keys — see js/modules.js)

Each frame defaults to tint "multiply" (real assets are opaque textures,
# not alpha-cutout icons; multiply-blend colorizes while preserving detail).
If a file's name contains "currentColor" (e.g. figA_currentColor.svg),
it's tagged tint "currentColor" instead — use that for SVGs you've
authored or edited to use fill="currentColor" so recoloring is exact
rather than approximated.

Run from the project root:
    python3 tools/build_manifest.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
MODULE_KEYS = ["generic", "cal", "techno", "mod", "ftool", "urb"]
VALID_EXT = {".svg", ".png", ".jpg", ".jpeg", ".webp"}


def build():
    manifest = {}
    found_any = False

    for module_key in MODULE_KEYS:
        module_dir = ASSETS / module_key
        if not module_dir.is_dir():
            continue
        manifest[module_key] = {}
        for sprite_dir in sorted(module_dir.glob("sprite_*")):
            if not sprite_dir.is_dir():
                continue
            try:
                sprite_id = int(sprite_dir.name.replace("sprite_", ""))
            except ValueError:
                print(f"  skipping {sprite_dir.name} (expected sprite_<number>)")
                continue
            frames = []
            for f in sorted(sprite_dir.iterdir()):
                if f.suffix.lower() not in VALID_EXT:
                    continue
                tint = "currentColor" if "currentColor" in f.name else "multiply"
                frames.append({
                    "src": f"assets/{module_key}/{sprite_dir.name}/{f.name}",
                    "tint": tint,
                })
            if frames:
                manifest[module_key][str(sprite_id)] = frames
                found_any = True
                print(f"  {module_key}/sprite_{sprite_id}: {len(frames)} frame(s)")

    out_path = ASSETS / "manifest.json"
    ASSETS.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(manifest, indent=2))
    print(f"\nWrote {out_path}")
    if not found_any:
        print("No frames found yet — this is expected before you've dropped in "
              "exported assets. The app will use placeholder shapes until then.")


if __name__ == "__main__":
    build()
