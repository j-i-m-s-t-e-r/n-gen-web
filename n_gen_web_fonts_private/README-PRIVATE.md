# Private fonts — LOCAL USE ONLY

This folder contains the 150 actual fonts extracted from the original
n_Gen `.cxt` files (deduplicated from the original 244-file export by
content hash). These are commercial/licensed typefaces from real
foundries — Émigré, Berthold, Linotype, Bitstream, and others — not
something to redistribute publicly.

**Do not commit this folder. Do not deploy it to GitHub Pages or anywhere
public.** You confirmed this stays private, which is what makes wiring
these in reasonable — using fonts you already have access to for your own
local use is a very different situation from serving them to the public
internet.

## Setup

1. Copy this whole `fonts-private/` folder into your `n_gen_web` project
   root, alongside `index.html`.
2. Add this line to `.gitignore` in the project root (create the file if
   it doesn't exist):
   ```
   fonts-private/
   ```
3. In `index.html`, add these two lines right after the existing Google
   Fonts `<link>` tag and right after `<script src="js/fontpool.js">`:
   ```html
   <link rel="stylesheet" href="fonts-private/fonts-local.css">
   ```
   and, in the script section near the bottom:
   ```html
   <script src="fonts-private/fontpool-local.js"></script>
   ```
   (after `js/fontpool.js`, before `js/engine.js` — it needs `FONT_POOLS`
   to already exist so it can override it).
4. Open the page and check the browser console for:
   `[fontpool-local] Loaded 150 real fonts across 6 modules — local override active.`
   If you see that, it's working — every module now draws from its real
   font library instead of the free substitutes.

## What's here

- `techno/`, `cal/`, `ftool/`, `mod/`, `urb/`, `generic/` — the actual
  `.ttf` files, one copy per unique font (deduped across the modules that
  originally shared it).
- `fonts-local.css` — `@font-face` declarations for all 150.
- `fontpool-local.js` — overrides `FONT_POOLS` with these real family
  names, keyed the same way the public `js/fontpool.js` is.

## If you ever do want to make the repo public

Just don't include this folder — the `.gitignore` entry above handles
that automatically. The site will fall back to the public Google Fonts
pool with no other changes needed.
