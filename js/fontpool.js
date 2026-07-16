/**
 * fontpool.js
 *
 * n_Gen's original text sprites picked a random font per generation from
 * an embedded library of ~244 display fonts (Exocet, Template Gothic,
 * Trixie, Eurostile, Akzidenz Grotesk, Bauhaus, HandelGothic, and so on —
 * genuinely a lot of variety, spanning grunge/techno/typewriter/futurist
 * styles). Those are named commercial typefaces from real foundries
 * (Émigré, Berthold, Linotype, Bitstream, others) — not something to
 * bundle into a public repo.
 *
 * This is the same mechanic — random expressive font per generation —
 * built on free, OFL/Apache-licensed Google Fonts chosen to span a
 * similar range of moods rather than to imitate any specific original.
 */

const FONT_POOL = [
  "'Bebas Neue', sans-serif",       // bold condensed — stands in for the Eurostile/TradeGothic condensed cluster
  "'Special Elite', monospace",      // typewriter — stands in for Prestige Elite / OCR-family
  "'Space Mono', monospace",         // digital/technical — stands in for DigitalReadOut / OCR-B cluster
  "'Archivo Black', sans-serif",     // heavy grotesk — stands in for the Helvetica/Akzidenz Bold cluster
  "'Permanent Marker', cursive",     // handwritten/grunge — stands in for Undo / Eviscerate cluster
  "'Monoton', cursive",              // display/neon — stands in for the more experimental display fonts
  "'Righteous', sans-serif",         // rounded display — general expressive fallback
  "'Rock Salt', cursive",            // rough handwritten — stands in for the grunge cluster
];

function randomFont() {
  return FONT_POOL[Math.floor(Math.random() * FONT_POOL.length)];
}
