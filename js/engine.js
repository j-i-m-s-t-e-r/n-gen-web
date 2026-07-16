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
      this.el.appendChild(this.textEl);
    }
    this.textFont = randomFont(this.stage.currentModule);
    this.textEl.style.fontFamily = this.textFont;
    // Original modules set several named vars (txt, txt1, txt1cap, txt2,
    // txt3) meant for separate text fields inside one Flash sprite. We
    // don't know your exported layout for these yet, so by default we
    // just concatenate whatever's set — swap this for real per-field
    // <span data-var="txt1"> elements inside your asset once you wire
    // real assets in.
    this.textEl.textContent = Object.values(this.vars).join(' ');
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
    // Default path: 'multiply'. Real exported frames turned out to be fully
    // opaque full-canvas renders (confirmed against actual n_Gen assets —
    // alpha fill ratio is 1.0 across every sampled frame), not alpha-cutout
    // silhouettes. Multiply-blend colorizes while preserving the texture's
    // own light/dark detail; source-atop alpha-matting (the original guess
    // here, before real assets were available) would have just flattened
    // every frame into a solid color swatch.
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
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgbToCss(this.color);
    ctx.fillRect(0, 0, w, h);
    // multiply darkens everything including near-white ground — restore
    // original alpha shape so we're not compounding opacity with .blend
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(this.img, 0, 0);
    this.img.src = canvas.toDataURL();
  }

  _render() {
    this.el.style.display = this.visible ? 'block' : 'none';
    const w = this.naturalW || 0, h = this.naturalH || 0;
    // Explicit left/top (not a percentage-based translate(-50%,-50%)
    // trick) so this uses the exact same numbers exportPNG() uses for
    // its canvas draw — two different transform systems computing "center
    // this layer at (x,y)" independently is exactly how they drift apart.
    this.el.style.left = (this.x - w / 2) + 'px';
    this.el.style.top = (this.y - h / 2) + 'px';
    this.el.style.width = w + 'px';
    this.el.style.height = h + 'px';
    this.el.style.transformOrigin = '50% 50%';
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
    this.vars = {};
    if (this.textEl) this.textEl.textContent = '';
    this._render();
  }
}

class Stage {
  constructor(el, { width = 1024, height = 768 } = {}) {
    this.el = el;
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
      ctx.save();
      ctx.globalAlpha = layer.blend / 100;
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.transform(1, 0, Math.tan((layer.skew * Math.PI) / 180), 1, 0, 0);
      ctx.scale(layer.scale * layer.flipH, layer.scale * layer.flipV);
      ctx.drawImage(layer.img, -layer.naturalW / 2, -layer.naturalH / 2, layer.naturalW, layer.naturalH);
      ctx.restore();

      // Text overlays (setVariable) render as a separate flex-centered div
      // on screen — match that here rather than silently omitting captions,
      // which the download previously did entirely.
      const text = layer.textEl && layer.textEl.textContent;
      if (text) {
        ctx.save();
        ctx.globalAlpha = layer.blend / 100;
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.font = `14px ${layer.textFont || "'IBM Plex Sans', sans-serif"}`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.fillText(text, 0, 0);
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
