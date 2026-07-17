/**
 * assets.js
 *
 * Real assets: run `python3 tools/build_manifest.py` after dropping your
 * JPEXS-exported files into assets/<module>/sprite_<id>/ (see README).
 * That produces manifest.json, which this file loads.
 *
 * No manifest yet, or a layer missing from it: falls back to a generated
 * placeholder silhouette so you can see the engine's randomization logic
 * working immediately, without waiting on real art.
 */

async function loadManifest() {
  try {
    const res = await fetch('assets/manifest.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const PLACEHOLDER_SHAPES = [
  // simple silhouettes, white fill on transparent ground — alpha-matte
  // tinting (engine.js) recolors these based on shape alpha, same as it
  // would recolor a real exported asset.
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="90" fill="white"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect x="20" y="20" width="160" height="160" fill="white"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><polygon points="100,10 190,190 10,190" fill="white"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect x="0" y="0" width="200" height="60" fill="white"/></svg>`,
];

function placeholderFrames(count = 4) {
  return Array.from({ length: count }, (_, i) => ({
    src: 'data:image/svg+xml;utf8,' + encodeURIComponent(PLACEHOLDER_SHAPES[i % PLACEHOLDER_SHAPES.length]),
    tint: 'multiply',
  }));
}

function backgroundFrame(stage) {
  // Director's "Bgnd Color" member (always sprite 11) is a plain solid
  // color field with no Flash/image content — confirmed against the real
  // .cxt export, which produced zero SWF blocks for it (every other
  // visual member produced exactly one). Sized generously oversized vs.
  // the stage, matching the original's `sprite(11).rect = rect(ctrX-800,
  // ctrY-600, ctrX+800, ctrY+600)`.
  const w = stage.width + 600, h = stage.height + 600;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/></svg>`;
  return { src: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg), tint: 'multiply' };
}

function applyManifest(stage, moduleKey, manifest) {
  const spec = MODULES[moduleKey];
  spec.layerIds.forEach((id) => {
    if (id === 11) {
      const bg = stage.layer(11);
      // Must be set before setFrames — its synthetic base is pure white
      // (luminance 255) specifically so it can take full tint color; with
      // white-protect on (the default, right for real photos with actual
      // white highlights to preserve) it would get zero tint at exactly
      // the pixel value it always starts at, leaving every module's
      // background permanently white regardless of chosen color.
      bg.whiteProtect = false;
      bg.setFrames([backgroundFrame(stage)]);
      // Position at stage center: layers default to x=0,y=0 (the canvas
      // ORIGIN) with center registration, which parked the oversized
      // background's center on the top-left corner — leaving the bottom
      // and right of the canvas black wherever content was sparse.
      bg.setPositionPoint(stage.ctrX, stage.ctrY);
      return;
    }
    const frames = manifest?.[moduleKey]?.[id];
    stage.layer(id).setFrames(
      frames && frames.length ? frames : placeholderFrames()
    );
  });
}
