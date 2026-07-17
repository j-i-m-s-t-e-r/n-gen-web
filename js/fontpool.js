/**
 * fontpool.js
 *
 * n_Gen's original text sprites picked a random font per generation from
 * an embedded library of ~244 display fonts — but not one shared pool.
 * Each module drew from its own distinct cluster:
 *   - calnoir:  gothic/blackletter/grunge (Fraktur, DeadHistory, Exocet,
 *               Bernhard Modern, Eviscerate)
 *   - spcfrm:   digital/LCD/futuristic (DigitalReadOut, LCDK, OCR family,
 *               ScreenMatrix, Space)
 *   - ftool:    playful/novelty (JuicyFruits, Inkblob, animal-themed,
 *               bubble/toy fonts)
 *   - generic/modern/urb: clean bold grotesk (Helvetica, Akzidenz
 *               Grotesk, Eurostile, TradeGothic — often in condensed or
 *               heavy weights)
 * All of those are named commercial typefaces, not redistributable. This
 * keeps the per-module *character* — six different moods, not one grab
 * bag — built entirely on free, OFL/Apache-licensed Google Fonts chosen
 * to evoke each cluster rather than imitate any specific original font.
 */

const FONT_POOLS = {
  cal: [
    "'UnifrakturMaguntia', cursive",   // genuine blackletter — closest free equivalent to the Fraktur cluster
    "'UnifrakturCook', cursive",
    "'Metal Mania', cursive",           // grunge/metal, stands in for Eviscerate/Undo
    "'Nosifer', cursive",               // horror-grunge, stands in for DeadHistory
    "'IM Fell English', serif",         // aged serif, stands in for Bernhard Modern
    "'Special Elite', monospace",       // typewriter, stands in for Prestige Elite
  ],
  techno: [
    "'Orbitron', sans-serif",           // futuristic display — core techno feel
    "'Audiowide', sans-serif",
    "'Share Tech Mono', monospace",     // stands in for OCR/DigitalReadOut cluster
    "'VT323', monospace",               // pixel/LCD, stands in for LCDK/ScreenMatrix
    "'Rajdhani', sans-serif",           // condensed techno
    "'Chakra Petch', sans-serif",
  ],
  ftool: [
    "'Baloo 2', cursive",               // rounded/playful, stands in for the toy/novelty cluster
    "'Fredoka', sans-serif",
    "'Bungee', sans-serif",             // bold playful display
    "'Luckiest Guy', cursive",
    "'Chewy', cursive",
  ],
  generic: [
    "'Oswald', sans-serif",             // clean condensed grotesk — stands in for Eurostile/TradeGothic
    "'Big Shoulders Display', sans-serif",
    "'Archivo Black', sans-serif",      // heavy grotesk — stands in for Helvetica/Akzidenz Bold
    "'Anton', sans-serif",
  ],
  mod: [
    "'Big Shoulders Display', sans-serif",
    "'Oswald', sans-serif",
    "'Archivo Black', sans-serif",
    "'Anton', sans-serif",
    "'Bebas Neue', sans-serif",
  ],
  urb: [
    "'Bungee', sans-serif",             // urban/industrial bold — stands in for TradeGothic Condensed
    "'Big Shoulders Display', sans-serif",
    "'Oswald', sans-serif",
    "'Teko', sans-serif",
    "'Anton', sans-serif",
  ],
};

const DEFAULT_POOL = FONT_POOLS.generic;

// Real extracted fonts (assets/fonts-private/, gitignored — private use
// only, not for the public deploy). Loaded async at startup; randomFont()
// falls back to the curated Google Fonts pool above until this resolves,
// and permanently falls back if fonts-private/ isn't present at all (e.g.
// on a fresh clone without it) — every font-family string always ends
// with a fallback face, so a missing woff2 just degrades gracefully.
let PRIVATE_FONT_POOLS = null;

async function loadPrivateFonts() {
  try {
    const res = await fetch('assets/fonts-private/manifest.json', { cache: 'no-store' });
    if (!res.ok) return;
    PRIVATE_FONT_POOLS = await res.json();
  } catch {
    // fonts-private/ not present — stay on the Google Fonts pool, silently
  }
}

function randomFont(moduleKey) {
  const privatePool = PRIVATE_FONT_POOLS && PRIVATE_FONT_POOLS[moduleKey];
  const fallback = (FONT_POOLS[moduleKey] || DEFAULT_POOL)[0];
  if (privatePool && privatePool.length) {
    const realFamily = privatePool[Math.floor(Math.random() * privatePool.length)];
    // Real font first, curated substitute second, generic last — a missing
    // or failed woff2 degrades to something reasonable instead of tofu.
    return `'${realFamily}', ${fallback}`;
  }
  const pool = FONT_POOLS[moduleKey] || DEFAULT_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}
