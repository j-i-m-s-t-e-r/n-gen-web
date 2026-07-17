/**
 * engine.js
 *
 * A faithful port of n_Gen's sprite-control primitives, recovered from
 * `_imageprocess.ls` (decompiled via ProjectorRays). In the original,
 * every module script drives its layers entirely through these calls —
 * this file exists so the *ported* module recipes (see modules.js) can
 * stay a near line-for-line translation of the original Lingo.
 *
 * Director's `random(n)` returns an integer in [1, n]. `random(a, b)`
 * returns an integer in [a, b]. Both are inclusive — that matters for
 * getting the same odds as the original.
 */

function rnd(a, b) {
  if (b === undefined) { b = a; a = 1; }
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function pick(list) {
  return list[rnd(list.length) - 1];
}

function rgb(r, g, b) {
  return { r, g, b };
}

function rgbToCss({ r, g, b }) {
  return `rgb(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)})`;
}

function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

// Director lets you do `color1 - rgb(20,30,30)` etc. on colors — a couple
// of module scripts (doFtoolscript, doUrbanscript) lean on this to derive
// a related shade rather than picking a whole new color.
function rgbSub(c, d) {
  return rgb(c.r - d.r, c.g - d.g, c.b - d.b);
}
function rgbAdd(c, d) {
  return rgb(c.r + d.r, c.g + d.g, c.b + d.b);
}

/**
 * A Layer corresponds to one numbered Director sprite (11, 13, 21, 23,
 * 25, 27, 31, 41, 43, 45, 47, 52 ...). Each one owns a DOM element and a
 * pool of "frames" — the pre-drawn art variants that `setFlashFrame`
 * picked between at random in the original.
 *
 * frames: array of { src, tint } where tint controls how recoloring is
 * applied — 'currentColor' for SVGs authored to inherit fill, or 'alpha'
 * for raster assets recolored via alpha-matte compositing.
 */
class Layer {
  constructor(id, stage) {
    this.id = id;
    this.stage = stage;
    this.frames = [];
    this.el = document.createElement('div');
    this.el.className = 'ngen-layer';
    this.el.dataset.layerId = id;
    this.img = document.createElement('img');
    this.img.draggable = false;
    this.el.appendChild(this.img);
    this.textEl = null; // created lazily if setVariable is used
    this.vars = {};

    this.visible = false;
    this.x = 0; this.y = 0;
    this.scale = 1;
    this.rotation = 0;
    this.skew = 0;
    this.flipH = 1; this.flipV = 1;
    this.blend = 100;
    // Most sprites register from center — correct for the small
    // decorative/accent layers most modules use. Sprite 31 in mod/urb is
    // different: a full-canvas "hero" cover image positioned via
    // setPositionPoint(31, point(liveArea.left, liveArea.top)), which
    // only makes sense if it registers from its top-left corner (see
    // modules.js, set explicitly per-layer where needed).
    this.registration = 'center';
    // Director sprites always carry *some* .color even if a script never
    // calls setColor on them — doFtoolscript reads sprite(41).color at one
    // point without ever setting it first, relying on that default. White
    // is the standard default foreColor for a freshly placed sprite.
    this.color = rgb(255, 255, 255);
    this.naturalW = 0; this.naturalH = 0;

    stage.el.appendChild(this.el);
  }

  setFrames(frames) {
    this.frames = frames;
    if (frames.length === 1) this._ready = this._applyFrame(frames[0]);
  }

  setOnOff(v) { this.visible = !!v; this._render(); }
  setRandomOnOff(list) { this.setOnOff(pick(list)); }

  // Director's setPosition(sprite, rect(l,t,r,b)): offsets are random
  // within the rect and added to the stage center — NOT absolute coords.
  setPosition(l, t, r, b) {
    const dx = (r - l) !== 0 ? rnd(l, r) : 0;
    const dy = (b - t) !== 0 ? rnd(t, b) : 0;
    this.x = this.stage.ctrX + dx;
    this.y = this.stage.ctrY + dy;
    this._render();
  }
  setPositionPoint(x, y) { this.x = x; this.y = y; this._render(); }
  setPositionTarget(points) {
    const p = pick(points);
    this.setPositionPoint(p.x, p.y);
  }

  setScale(min, max) { this.scale = rnd(min, max) / 100; this._render(); }
  setColor(colors) { this.color = pick(colors); this._render(); }
  setBlend(min, max) { this.blend = rnd(min, max); this._render(); }
  setRotation(list) { this.rotation = pick(list); this._render(); }
  setSkew(list) { this.skew = pick(list); this._render(); }
  setFlipH(list) { this.flipH = pick(list) ? -1 : 1; this._render(); }
  setFlipV(list) { this.flipV = pick(list) ? -1 : 1; this._render(); }

  setFlashFrame() {
    if (!this.frames.length) return;
    const frame = pick(this.frames);
    this._ready = this._applyFrame(frame);
  }

  setVariable(key, value) {
    this.vars[key] = value;
    if (!this.textEl) {
      this.textEl = document.createElement('div');
      this.textEl.className = 'ngen-layer-text';
      this.textSpan = document.createElement('span');
      this.textEl.appendChild(this.textSpan);
      this.el.appendChild(this.textEl);
    }
    // Confirmed against the real app: sprite 47 is always the Headline, 45
    // the Subhead, 43 the Body Copy — consistent across generic/cal/
    // techno/ftool's separate-sprite-per-field pattern (all keyed 'txt'
    // regardless of role, since role comes from which SPRITE). mod/urb
    // instead pack txt1/txt2/txt3 (headline/subhead/body) onto one shared
    // sprite (31) — role there comes from the KEY instead. Re-evaluated on
    // every call, not just creation: a prior version only set this once,
    // so mod/urb's body-copy field never got wrap treatment at all — it
    // fired after the headline call had already locked in 'headline'.
    const idRole = { 47: 'headline', 45: 'subhead', 43: 'body' }[this.id];
    // mod/urb pack multiple fields (txt1/txt2/txt3 = headline/subhead/body)
    // onto ONE shared sprite. Once more than one field has been set here,
    // this becomes 'combined' rather than whatever the latest field alone
    // would suggest — a prior version let the last-set key (txt3 -> 'body')
    // win outright, which applied body-copy's corner alignment to the
    // ENTIRE concatenated block, pinning headline+subhead+body together to
    // the top-left of what's usually a full-canvas hero sprite.
    const isMultiField = Object.keys(this.vars).length > 1;
    const keyRole = isMultiField ? 'combined' : { txt1: 'headline', txt2: 'subhead', txt3: 'body' }[key];
    const role = idRole || keyRole;
    if (role) this.textEl.dataset.role = role;
    this.textFont = randomFont(this.stage.currentModule);
    this.textSpan.style.fontFamily = this.textFont;
    // Original modules set several named vars (txt, txt1, txt1cap, txt2,
    // txt3) meant for separate text fields inside one Flash sprite. We
    // don't know your exported layout for these yet, so by default we
    // just concatenate whatever's set — swap this for real per-field
    // <span data-var="txt1"> elements inside your asset once you wire
    // real assets in.
    this.textSpan.textContent = Object.values(this.vars).join(' ');
    // setVariable can be called before any other property-setter has
    // triggered a render on this layer (e.g. if a module calls setColor
    // then setVariable with nothing else in between) — don't rely on a
    // prior call having already sized/positioned the box correctly.
    this._render();
  }

  async _applyFrame(frame) {
    this.img.src = frame.src;
    this._pendingTint = frame.tint || 'alpha';
    await new Promise((resolve) => {
      if (this.img.complete && this.img.naturalWidth) resolve();
      else this.img.onload = resolve;
    });
    this.naturalW = this.img.naturalWidth;
    this.naturalH = this.img.naturalHeight;
    await this._maybeTint();
    this._render();
  }

  async _maybeTint() {
    if (this._pendingTint === 'currentColor') {
      // SVGs authored with fill="currentColor" pick up CSS `color` directly.
      this.el.style.color = rgbToCss(this.color);
      return;
    }
    if (this._pendingTint === 'none') return;
    await new Promise((resolve) => {
      if (this.img.complete) resolve();
      else this.img.onload = resolve;
    });
    const w = this.img.naturalWidth, h = this.img.naturalHeight;
    if (!w || !h) return;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.img, 0, 0);

    // knockoutBackground: JPEXS flattens sprites that were originally
    // transparent onto the Flash stage color, so a sprite that's really a
    // small text element floating on nothing arrives as a full-frame flat
    // grey rectangle with a tiny content sliver (measured content
    // fractions of 0.1-1.2% on ngeneric's blocks). For layers flagged
    // this way, sample the corner color and make near-matching pixels
    // transparent before tinting.
    if (this.knockoutBackground) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const bgR = d[0], bgG = d[1], bgB = d[2];
      const tol = 10;
      for (let p = 0; p < d.length; p += 4) {
        if (Math.abs(d[p] - bgR) <= tol && Math.abs(d[p+1] - bgG) <= tol && Math.abs(d[p+2] - bgB) <= tol) {
          d[p+3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Snapshot the current alpha state BEFORE tinting — for knocked-out
    // layers this preserves the transparency we just created; redrawing
    // this.img directly here instead would restore full opacity and
    // silently undo the knockout.
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w; maskCanvas.height = h;
    maskCanvas.getContext('2d').drawImage(canvas, 0, 0);

    // Default tint path: multiply-style colorization, luminance-aware.
    // Flat multiply blend darkens EVERY pixel proportionally to how dark
    // the tint color is — including near-white background/negative-space
    // pixels, no matter how low tintStrength is set (confirmed by direct
    // math: white tinted with a dark color at strength 0.4 becomes a
    // medium grey, not white). That was the actual mechanism behind a
    // measured real-vs-port gap on mod: the real app shows a predominantly
    // white background on roughly half its generates, the port showed it
    // on none. Near-white pixels now get little to no tint; only pixels
    // that already have real tonal content take the color.
    const strength = this.tintStrength ?? 1;
    const imgData2 = ctx.getImageData(0, 0, w, h);
    const d2 = imgData2.data;
    const tint = this.color;
    const WHITE_PROTECT_START = 235; // luminance above this: increasingly protected from tinting
    const WHITE_PROTECT_END = 255;
    for (let p = 0; p < d2.length; p += 4) {
      const r = d2[p], g = d2[p + 1], b = d2[p + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let localStrength = strength;
      if (lum >= WHITE_PROTECT_START) {
        const t = (lum - WHITE_PROTECT_START) / (WHITE_PROTECT_END - WHITE_PROTECT_START);
        localStrength = strength * (1 - t); // fades to 0 as luminance approaches white
      }
      d2[p] = r * (1 - localStrength) + (r * tint.r / 255) * localStrength;
      d2[p + 1] = g * (1 - localStrength) + (g * tint.g / 255) * localStrength;
      d2[p + 2] = b * (1 - localStrength) + (b * tint.b / 255) * localStrength;
    }
    ctx.putImageData(imgData2, 0, 0);
    // restore the pre-tint alpha shape (knockout, if any) — tinting above
    // doesn't touch alpha, but putImageData writes a full frame, so redo
    // the mask to be safe against any accidental alpha drift.
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);
    this.img.src = canvas.toDataURL();
  }

  _render() {
    this.el.style.display = this.visible ? 'block' : 'none';
    let w = this.naturalW || 0, h = this.naturalH || 0;
    // coverStage: Director sized these sprites via `sprite(31).width =
    // member.width * factor` where the member was authored at exactly
    // live-area size (566x734) — i.e. "fraction of the full canvas", not
    // "fraction of whatever pixel size the exported asset file happens to
    // be". Our exported/cropped assets have arbitrary dimensions, so
    // treating their file size as authoritative confined mod/urb's hero
    // image to a top-left fraction of the stage (measured: x 0-356 of
    // 850 across every generated frame before this fix).
    if (this.coverStage && w && h) {
      const targetW = this.stage.width * (this.coverScaleX ?? 1);
      const targetH = this.stage.height * (this.coverScaleY ?? 1);
      w = targetW; h = targetH;
    }
    this._renderW = w; this._renderH = h;
    const offX = this.registration === 'topleft' ? 0 : w / 2;
    const offY = this.registration === 'topleft' ? 0 : h / 2;
    this.el.style.left = (this.x - offX) + 'px';
    this.el.style.top = (this.y - offY) + 'px';
    this.el.style.width = w + 'px';
    this.el.style.height = h + 'px';
    this.el.style.transformOrigin = this.registration === 'topleft' ? '0 0' : '50% 50%';
    this.el.style.transform = [
      `rotate(${this.rotation}deg)`,
      `skewX(${this.skew}deg)`,
      `scale(${this.scale * this.flipH}, ${this.scale * this.flipV})`,
    ].join(' ');
    this.el.style.opacity = this.blend / 100;
  }

  reset() {
    this.visible = false;
    this.color = rgb(255, 255, 255);
    this.rotation = 0; this.skew = 0;
    this.flipH = 1; this.flipV = 1;
    this.blend = 100;
    this.scale = 1;
    this.registration = 'center';
    this.coverStage = false;
    this.coverScaleX = undefined;
    this.coverScaleY = undefined;
    this.knockoutBackground = false;
    this.tintStrength = undefined;
    this.vars = {};
    if (this.textSpan) this.textSpan.textContent = '';
    this._render();
  }
}

class Stage {
  constructor(el, { width = 1024, height = 768 } = {}) {
    this.el = el;
    // Stage gets recreated on format change (rebuildStage in app.js),
    // reusing the same DOM element — without this, the previous format's
    // layer divs stayed orphaned in the DOM, potentially still visible on
    // top of whatever the new format renders, making format switches look
    // like they'd done nothing at all.
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    this.width = width;
    this.height = height;
    this.ctrX = width / 2;
    this.ctrY = height / 2;
    // liveArea mirrors the original's rect(l,t,r,b) around center — used
    // by doFtool/doUrb/doMod for placement relative to the visible page.
    // Must be absolute stage coordinates (matching the original's
    // `rect(ctrX-w2, ctrY-h2, ctrX+w2, ctrY+h2)`), not raw offsets from
    // zero — a prior version omitted the ctrX/ctrY center offset, which
    // pushed anything positioned via setPositionPoint(liveArea.left,
    // liveArea.top) to roughly (-500,-350) instead of (0,0): almost
    // entirely off-canvas.
    this.liveArea = {
      left: this.ctrX - width / 2,
      top: this.ctrY - height / 2,
      right: this.ctrX + width / 2,
      bottom: this.ctrY + height / 2,
    };
    this.layers = {};
    this.currentModule = null;
    el.style.width = width + 'px';
    el.style.height = height + 'px';
  }

  layer(id) {
    if (!this.layers[id]) this.layers[id] = new Layer(id, this);
    return this.layers[id];
  }

  resetAll() {
    Object.values(this.layers).forEach((l) => l.reset());
  }

  // Composites all visible layers onto an offscreen canvas in ascending
  // sprite-ID order — which happens to already match Director's channel
  // z-order (higher channel number = drawn on top), so no extra sorting
  // is needed here.
  async exportPNG() {
    await Promise.all(Object.values(this.layers).map((l) => l._ready));

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const layer of Object.values(this.layers)) {
      if (!layer.visible || !layer.naturalW) continue;
      const drawW = layer._renderW || layer.naturalW;
      const drawH = layer._renderH || layer.naturalH;
      const offX = layer.registration === 'topleft' ? 0 : drawW / 2;
      const offY = layer.registration === 'topleft' ? 0 : drawH / 2;
      ctx.save();
      ctx.globalAlpha = layer.blend / 100;
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.transform(1, 0, Math.tan((layer.skew * Math.PI) / 180), 1, 0, 0);
      ctx.scale(layer.scale * layer.flipH, layer.scale * layer.flipV);
      ctx.drawImage(layer.img, -offX, -offY, drawW, drawH);
      ctx.restore();

      // Text overlays (setVariable) render with role-specific treatment on
      // screen (headline/subhead/body copy) — match that here rather than
      // using one uniform style, and rather than silently omitting
      // captions entirely, which the download previously did.
      const text = layer.textSpan && layer.textSpan.textContent;
      if (text) {
        const role = layer.textEl.dataset.role; // 'headline' | 'subhead' | 'body' | 'combined' | undefined
        ctx.save();
        ctx.globalAlpha = layer.blend / 100;
        // (layer.x, layer.y) is the layer's CENTER for normal registration
        // but its top-left CORNER for 'topleft' (mod/urb's hero sprite) —
        // text needs the actual visual center of the box, not the raw
        // registration point, or "centered" text on a topleft-registered
        // layer would still visually pull toward the corner.
        const boxCx = layer.registration === 'topleft' ? layer.x + (layer._renderW || layer.naturalW) / 2 : layer.x;
        const boxCy = layer.registration === 'topleft' ? layer.y + (layer._renderH || layer.naturalH) / 2 : layer.y;
        ctx.translate(boxCx, boxCy);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        // Text scales with the layer, same as the image does — in the
        // original, text was embedded inside the scaled Flash symbol, so
        // scaling the sprite scaled its text too. A prior version used a
        // fixed pixel font size regardless of layer.scale, so text never
        // varied in size at all across generates. coverStage layers
        // (mod/urb's hero sprite) size via targetW/H instead — their own
        // .scale stays ~1, so this is a no-op there, which is correct.
        if (!layer.coverStage) {
          ctx.scale(layer.scale, layer.scale);
        }

        const fontSize = role === 'headline' ? 34 : role === 'subhead' ? 26 : role === 'body' ? 18 : role === 'combined' ? 22 : 18;
        const weight = role === 'headline' ? '700' : role === 'subhead' ? '500' : role === 'combined' ? '600' : '600';
        ctx.font = `${weight} ${fontSize}px ${layer.textFont || "'IBM Plex Sans', sans-serif"}`;
        ctx.fillStyle = '#ffffff';

        if (role === 'body') {
          // Real word-wrap — canvas fillText doesn't wrap on its own, and
          // body copy is genuinely a multi-line paragraph in the real app,
          // not a one-line caption. Split on explicit newlines FIRST and
          // wrap each resulting line independently — splitting on /\s+/
          // across the whole text (a prior version) treated newlines as
          // just more whitespace to collapse, silently merging every
          // paragraph/line break the user typed into one continuous flow.
          const maxWidth = layer.naturalW * layer.scale * 0.85 || 300;
          const lineHeight = fontSize * 1.5;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          const lines = [];
          for (const rawLine of text.split('\n')) {
            if (rawLine.trim() === '') { lines.push(''); continue; }
            const words = rawLine.split(/ +/);
            let line = '';
            for (const word of words) {
              const test = line ? `${line} ${word}` : word;
              if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
              } else {
                line = test;
              }
            }
            if (line) lines.push(line);
          }
          const boxW = maxWidth + 20;
          const boxH = lines.length * lineHeight + 16;
          ctx.fillStyle = 'rgba(0,0,0,0.78)';
          ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
          ctx.fillStyle = '#ffffff';
          lines.forEach((l, i) => {
            ctx.fillText(l, -boxW / 2 + 10, -boxH / 2 + 8 + i * lineHeight);
          });
        } else if (role === 'combined') {
          // mod/urb's headline+subhead+body concatenated onto one sprite —
          // wraps like body copy (long text needs it) but stays centered
          // in the box rather than pinned to a corner.
          const maxWidth = (layer._renderW || layer.naturalW) * (layer.registration === 'topleft' ? 1 : layer.scale) * 0.7 || 300;
          const lineHeight = fontSize * 1.4;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const lines = [];
          for (const rawLine of text.split('\n')) {
            if (rawLine.trim() === '') { lines.push(''); continue; }
            const words = rawLine.split(/ +/);
            let line = '';
            for (const word of words) {
              const test = line ? `${line} ${word}` : word;
              if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
              } else {
                line = test;
              }
            }
            if (line) lines.push(line);
          }
          const boxW = maxWidth + 20;
          const boxH = lines.length * lineHeight + 16;
          ctx.fillStyle = 'rgba(0,0,0,0.78)';
          ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
          ctx.fillStyle = '#ffffff';
          lines.forEach((l, i) => {
            ctx.fillText(l, 0, -boxH / 2 + 8 + i * lineHeight);
          });
        } else {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const metrics = ctx.measureText(text);
          const padX = 10, padY = 4;
          const boxW = metrics.width + padX * 2;
          const boxH = fontSize + padY * 2;
          ctx.fillStyle = 'rgba(0,0,0,0.78)';
          ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, 0, 0);
        }
        ctx.restore();
      }
    }

    return canvas.toDataURL('image/png');
  }
}

// Rect helper matching Lingo's rect(left, top, right, bottom) literal
// used throughout the module scripts, e.g. rect(-100, -10, 140, 10).
function rect(l, t, r, b) { return { l, t, r, b }; }
function point(x, y) { return { x, y }; }
