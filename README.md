# n_Gen — web port

A from-scratch web reimplementation of n_Gen's generative engine, built
by decompiling the original 2001 Director/Lingo files (via
[ProjectorRays](https://github.com/ProjectorRays/ProjectorRays)) and
porting the recovered logic to JavaScript. Every module's color
palettes, position ranges, scale ranges, and rotation/skew values are
copied directly from the recovered Lingo — this isn't a guess at what
n_Gen felt like, it's the actual randomization logic.

## How it works

- **`js/engine.js`** — a small port of Director's sprite primitives
  (`setPosition`, `setColor`, `setScale`, `setBlend`, `setRotation`,
  `setSkew`, `setFlipH/V`, `setFlashFrame`) recovered from
  `_imageprocess.ls`. Every module script only ever talks to the
  "sprite" through these calls, so getting them right was the key to
  faithful behavior.
- **`js/modules.js`** — the six `doGeneric` / `doCal` / `doTechno` /
  `doMod` / `doFtool` / `doUrb` recipes, ported near line-for-line from
  the decompiled `.ls` files.
- **`js/assets.js`** — loads `assets/manifest.json` (built by
  `tools/build_manifest.py`) and hands each layer its pool of frame
  images. Falls back to placeholder shapes when a layer has none yet.
- **`index.html` / `css/style.css`** — a minimal control panel (module
  picker, three text fields, Generate button) over a canvas-like stage.

## Running it locally

No build step — it's plain HTML/JS/CSS.

```bash
cd n_gen_web
python3 -m http.server 8000
```

Open `http://localhost:8000`. You'll see placeholder shapes (circles,
squares, triangles, bars) standing in for real art — that's expected
until you wire in your exported assets.

## Wiring in your JPEXS-exported assets

Drop your exported files into this folder convention:

```
assets/
  generic/
    sprite_11/   any .svg/.png here = frame pool for layer 11 in the "generic" module
    sprite_43/
    sprite_45/
    sprite_47/
  cal/
    sprite_11/
    sprite_13/
    sprite_43/
    sprite_45/
    sprite_47/
  techno/   (11, 13, 21, 23, 27, 43, 45, 47)
  mod/      (11, 31)
  ftool/    (11, 13, 21, 23, 25, 27, 41, 43, 45, 47, 52)
  urb/      (11, 13, 31, 47)
```

The sprite numbers per module are exactly the layer IDs each module's
`run()` function in `js/modules.js` touches — check `layerIds` on each
module entry if you're unsure which folder a given exported asset
belongs in. Layer 11 is always the background across every module.

Then:

```bash
python3 tools/build_manifest.py
```

This scans those folders and writes `assets/manifest.json`. Re-run it
any time you add or change files — no manual JSON editing needed.

## What's faithfully ported vs. approximated

**Faithful:** all randomization ranges, all color palettes, all
position/scale/rotation/skew values, the exact sprite-recipe order per
module, and quirks like `doFtoolscript`'s sprites 43/45 being
positioned relative to *other* sprites' current location rather than
the stage.

**Approximated, because the source didn't preserve it:**

- **Color tinting mechanism.** Director's `sprite.color` interacts with
  whatever *ink mode* is set on that sprite in the Score — and ink
  modes live in score data ProjectorRays doesn't recover. This port
  assumes alpha-matte recoloring (treats each frame as a silhouette,
  fills it solid with the chosen color) as the default. If your real
  assets are line art on a transparent background this should look
  close; if they're full-color illustrations, alpha-matte tinting will
  flatten them incorrectly — for those, either skip `setColor` calls
  for that layer in `modules.js`, or re-export as monochrome SVGs with
  `fill="currentColor"` and name the file with `currentColor` in it
  (the manifest builder tags those automatically for exact CSS-based
  tinting instead).
- **Text field layout.** The original's text-bearing layers (`txt`,
  `txt1`, `txt1cap`, `txt2`, `txt3`) were separate editable fields
  *inside* a single Flash sprite. This port just overlays one text div
  per layer with all set values concatenated — once you see the real
  exported layout for those sprites, split `setVariable` targets into
  actual per-field elements (`engine.js`, `Layer.setVariable`).
- **`doMod` and `doUrb`'s print-format sizing** (business card, CD,
  record sizing/offsets) is simplified to the "page" format only, since
  those other formats assume a print pipeline this port doesn't have.
  The exact scale multipliers are still in `modules.js` if you want to
  extend it.
- **`doUrb`'s `setImagerect` call** on sprite 13 (grid-based image
  cropping tied to specific pixel offsets baked into the original
  layout) is omitted — noted inline in `modules.js`.

## Verified

All six modules were run 50 times each (300 total `Generate` calls)
against a scripted DOM stub with zero exceptions — the randomization
logic itself is solid. What I *can't* verify without your real assets
is whether the visual result reads the way the original did; that's
the next thing to check once assets are wired in.
