/**
 * modules.js
 *
 * Each function here is a direct port of one `on doX` handler recovered
 * from the original Lingo (see the .ls files ProjectorRays produced).
 * Same layer IDs, same color palettes, same position/scale/rotation
 * ranges — the goal is that clicking "Generate" produces output with the
 * same *distribution* of variation as the original, not just something
 * that looks vaguely similar.
 *
 * A couple of deliberate deviations from the source, both noted inline:
 *   - setColor was occasionally called with a 3rd argument in the
 *     original Lingo, but the handler only ever used the first two — the
 *     3rd was dead. Dropped here.
 *   - Original ink/blend modes per sprite aren't visible in the movie
 *     script (they're set per-sprite in the Score, which ProjectorRays
 *     doesn't recover) — color tinting here uses alpha-matte compositing
 *     as the default assumption. See engine.js `_maybeTint`.
 */

const MODULES = {

  generic: {
    label: 'n_Generic',
    layerIds: [11, 43, 45, 47],
    run(stage) {
      stage.layer(11).setColor([rgb(242, 250, 252), rgb(219, 235, 240), rgb(229, 242, 206)]);
      stage.layer(11).setOnOff(1);

      // These three never receive setColor in the original script either —
      // faithful to the source. But measured against the real app (headless
      // capture), leaving them at the engine's white default produces a
      // dramatic colorfulness gap (confirmed ~12x on the analogous techno
      // case) — Director's true Score-authored default color for these
      // sprites isn't recoverable from the decompiled scripts, so this
      // reuses the module's own palette rather than leaving them grayscale.
      const genPalette = [rgb(242, 250, 252), rgb(219, 235, 240), rgb(229, 242, 206)];

      const l47 = stage.layer(47);
      l47.setPosition(0, 0, 0, 0);
      l47.setColor(genPalette);
      l47.setOnOff(1);
      l47.setFlashFrame();

      const l45 = stage.layer(45);
      l45.setPosition(-100, -10, 140, 10);
      l45.setBlend(30, 70);
      l45.setColor(genPalette);
      l45.setOnOff(1);
      l45.setFlashFrame();

      const l43 = stage.layer(43);
      l43.setPosition(-100, -200, 100, 100);
      l43.setBlend(40, 70);
      l43.setScale(60, 90);
      l43.setColor(genPalette);
      l43.setOnOff(1);
      l43.setFlashFrame();
    },
    text(stage, txt1, txt2, txt3) {
      stage.layer(47).setVariable('txt', txt1);
      stage.layer(45).setVariable('txt', txt2);
      stage.layer(43).setVariable('txt', txt3);
    },
  },

  cal: {
    label: 'California Noir',
    layerIds: [11, 13, 43, 45, 47],
    run(stage) {
      stage.layer(11).setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(50, 50, 60), rgb(50, 50, 40)]);
      stage.layer(11).setOnOff(1);

      const l13 = stage.layer(13);
      l13.setPosition(-500, -200, 500, 200);
      l13.setFlipH([1, 0]);
      l13.setRotation([0, 90, -90, 180]);
      l13.setSkew([0, 0, 0, 0, 0, 0, 0, -2, 2]);
      l13.setBlend(30, 100);
      // never colored in the original either — see generic module's note
      // on the measured colorfulness gap and why this reuses cal's palette
      l13.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(50, 50, 60), rgb(50, 50, 40)]);
      l13.setRandomOnOff([1, 1, 1, 1, 0]);
      l13.setFlashFrame();

      const l47 = stage.layer(47);
      l47.setPosition(-100, -100, 100, 40);
      l47.setScale(70, 150);
      l47.setRotation([0, 0, 0, 0, 0, 0, 0, 0, -60, 1, -1, 2, 3, 4, 5]);
      l47.setSkew([0, 0, 0, 0, 0, 10, -10, -7, 7, 1, 2, 3, 4, -3, -1]);
      l47.setBlend(90, 100);
      l47.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(80, 80, 80)]);
      l47.setOnOff(1);
      l47.setFlashFrame();

      const l45 = stage.layer(45);
      l45.setPosition(-100, 0, 200, 200);
      l45.setScale(40, 100);
      l45.setRotation([0, 0, 0, 0, 0, -90]);
      l45.setBlend(50, 90);
      l45.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255)]);
      l45.setOnOff(1);
      l45.setFlashFrame();

      const l43 = stage.layer(43);
      l43.setPosition(-200, -100, 200, 40);
      l43.setScale(80, 150);
      l43.setRotation([0, 0, 0, 0, 0, 90, 90, -90]);
      l43.setSkew([0, 0, 0, 0, 0, 15, -7, 7]);
      l43.setBlend(50, 80);
      l43.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(57, 57, 57)]);
      l43.setOnOff(1);
      l43.setFlashFrame();
    },
    text(stage, txt1, txt2, txt3) {
      stage.layer(47).setVariable('txt', txt1);
      stage.layer(45).setVariable('txt', txt2);
      stage.layer(43).setVariable('txt', txt3);
    },
  },

  techno: {
    label: 'Spacefarm',
    layerIds: [11, 13, 21, 23, 27, 43, 45, 47],
    run(stage) {
      stage.layer(11).setColor([
        rgb(1, 1, 1), rgb(255, 255, 250), rgb(50, 50, 60), rgb(255, 50, 40),
        rgb(62, 72, 107), rgb(174, 250, 0), rgb(255, 103, 255), rgb(0, 250, 229), rgb(49, 102, 213),
      ]);
      stage.layer(11).setOnOff(1);

      // 13/21/27/43 never receive setColor in the original script either —
      // faithful to the source. But this is the module where we directly
      // measured the consequence: real app colorfulness averaged 49.1,
      // web port averaged 4.1 (every single web frame less colorful than
      // every single real frame, zero overlap). Reusing techno's own vivid
      // palette here rather than leaving these four sprites grayscale.
      const technoPalette = [
        rgb(1, 1, 1), rgb(255, 255, 250), rgb(50, 50, 60), rgb(255, 50, 40),
        rgb(62, 72, 107), rgb(174, 250, 0), rgb(255, 103, 255), rgb(0, 250, 229), rgb(49, 102, 213),
      ];

      const l13 = stage.layer(13);
      l13.setPosition(-100, 0, 100, 0);
      l13.setScale(80, 250);
      l13.setFlipH([1, 0]);
      l13.setRotation([0, 180]);
      l13.setBlend(30, 100);
      l13.setColor(technoPalette);
      l13.setOnOff(1);
      l13.setFlashFrame();

      const l21 = stage.layer(21);
      l21.setRandomOnOff([1, 0]);
      l21.setScale(30, 1000);
      l21.setRotation([0, 90, -90, 180]);
      l21.setPosition(-400, -200, 400, 200);
      l21.setBlend(20, 50);
      l21.setColor(technoPalette);
      l21.setFlashFrame();

      const l23 = stage.layer(23);
      l23.setRandomOnOff([1, 0]);
      l23.setScale(20, 1000);
      l23.setRotation([0, 90, -90]);
      l23.setBlend(50, 80);
      l23.setColor([rgb(1, 1, 1), rgb(255, 255, 255)]);
      l23.setPosition(-300, 0, 300, 0);
      l23.setFlashFrame();

      const l27 = stage.layer(27);
      l27.setPosition(-200, -100, 200, 100);
      l27.setFlipH([1, 0]);
      l27.setRotation([0, 90, 180]);
      l27.setBlend(60, 90);
      l27.setColor(technoPalette);
      l27.setRandomOnOff([1, 0, 0]);
      l27.setScale(50, 100);
      l27.setFlashFrame();

      const l47 = stage.layer(47);
      l47.setPosition(-100, -300, 100, 40);
      l47.setScale(100, 180);
      l47.setRotation([0, 0, 0, 0, 0, -90]);
      l47.setBlend(90, 100);
      l47.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255)]);
      l47.setOnOff(1);
      l47.setFlashFrame();

      const l45 = stage.layer(45);
      l45.setPosition(-100, 0, 200, 200);
      l45.setScale(70, 90);
      l45.setRotation([0, 0, 0, 0, 0, -90]);
      l45.setBlend(50, 90);
      l45.setColor([rgb(1, 1, 1), rgb(255, 255, 255), rgb(255, 255, 255), rgb(255, 255, 255)]);
      l45.setOnOff(1);
      l45.setFlashFrame();

      const l43 = stage.layer(43);
      l43.setPosition(-100, -50, 200, 200);
      l43.setScale(90, 120);
      l43.setRotation([0, 0, 0, 0, 0, -90]);
      l43.setBlend(50, 90);
      l43.setColor(technoPalette);
      l43.setOnOff(1);
      l43.setFlashFrame();
    },
    text(stage, txt1, txt2, txt3) {
      stage.layer(47).setVariable('txt', txt1);
      stage.layer(45).setVariable('txt', txt2);
      stage.layer(43).setVariable('txt', txt3);
    },
  },

  mod: {
    label: 'die Modernist',
    layerIds: [11, 31],
    // Original supports bcard/bcardL/pcard/pcardL/cd/record/page/pageL/web
    // print-format sizing; web port defaults to 'page' since that's the
    // only one meaningful outside a print pipeline. Pass format to match
    // the others if you want print sizing later.
    run(stage, format = 'page') {
      const { left: theLeft, top: theTop } = stage.liveArea;
      stage.layer(11).setColor([rgb(255, 255, 255)]);
      stage.layer(11).setOnOff(1);
      const l31 = stage.layer(31);
      l31.registration = 'topleft'; // full-canvas cover image, not a centered sprite
      // Never colored in the original either — see generic module's note on
      // the measured colorfulness gap. mod has no existing palette to reuse
      // (its background is always plain white), so this is an invented
      // palette rather than one recovered from source. Avoiding white/
      // near-white entries deliberately: multiply-blend tinting with white
      // is the identity operation (no visible effect at all), which an
      // earlier version of this palette included — silently leaving ~half
      // of all generates grayscale despite "successfully" setting a color.
      l31.setColor([rgb(20, 20, 20), rgb(200, 30, 30), rgb(20, 60, 120), rgb(180, 150, 20)]);
      l31.setOnOff(1);
      l31.setFlashFrame();

      // scale multipliers per format, straight from doModscript's case block
      const formatScale = {
        bcard: 0.3816, bcardL: 0.296, pcard: 0.7632, pcardL: 0.589,
        cd: 0.9576, record: 0.65, page: 1, pageL: 0.775, web: 1,
      }[format] ?? 1;
      l31.scale = formatScale;
      l31.setPositionPoint(theLeft, theTop);
    },
    text(stage, txt1, txt2, txt3) {
      const l31 = stage.layer(31);
      l31.setVariable('txt1', txt1);
      l31.setVariable('txt2', txt2);
      l31.setVariable('txt3', txt3);
    },
  },

  ftool: {
    label: 'Future Tool',
    layerIds: [11, 13, 21, 23, 25, 27, 41, 43, 45, 47, 52],
    run(stage) {
      const { left: theLeft, right: theRight, bottom: theBot } = stage.liveArea;
      const ctrX = stage.ctrX, ctrY = stage.ctrY;

      const bgcolorList = [rgb(140, 90, 90), rgb(107, 115, 115), rgb(206, 206, 99), rgb(156, 189, 115), rgb(255, 255, 255)];
      const bgColor = pick(bgcolorList);
      stage.layer(11).color = bgColor; // direct assign, mirrors `sprite(11).color = bgColor`
      stage.layer(11).setOnOff(1);

      const l13 = stage.layer(13);
      l13.setPosition(-220, 0, 220, 0);
      l13.setFlipH([1, 0]);
      l13.setRotation([0, 180]);
      l13.setBlend(30, 100);
      // never colored in the original either — see generic module's note
      l13.setColor(bgcolorList);
      l13.setRandomOnOff([1, 1, 1, 0]);
      l13.setFlashFrame();

      const l21 = stage.layer(21);
      l21.setRandomOnOff([1, 0]);
      l21.setRotation([0, 90, -90]);
      l21.color = rgbAdd(bgColor, rgb(40, 20, 20));
      l21.setPosition(-200, 0, 200, 0);
      l21.setFlipH([1, 0]);
      l21.setBlend(50, 80);
      l21.setFlashFrame();

      const l23 = stage.layer(23);
      l23.setScale(50, 300);
      l23.setRotation([0, 90, -90]);
      l23.setColor([rgb(204, 235, 235), rgb(235, 235, 204), rgb(243, 182, 218)]);
      l23.setPosition(-100, -100, 100, 100);
      l23.setBlend(50, 80);
      l23.setRandomOnOff([1, 0]);
      l23.setFlashFrame();

      const l27 = stage.layer(27);
      l27.setPositionTarget([
        point(theLeft + 100, ctrY + 20), point(ctrX, ctrY + 40), point(theRight - 100, ctrY + 50),
        point(theRight - 200, theBot - 100), point(theLeft + 200, theBot - 100),
      ]);
      l27.setFlipH([1, 0]);
      // never colored in the original either — see generic module's note
      l27.setColor(bgcolorList);
      l27.setRandomOnOff([1, 0, 0]);
      l27.setScale(50, 100);
      l27.setFlashFrame();

      const l47 = stage.layer(47);
      l47.setPositionTarget([
        point(theLeft + 200, ctrY - 20), point(ctrX, ctrY - 40), point(theRight - 200, ctrY + 50),
        point(theRight - 200, ctrY - 100), point(ctrX + 30, ctrY + 20),
      ]);
      l47.setScale(40, 100);
      l47.setRotation([0, 0, 0, 0, 0, -90]);
      l47.setSkew([0, 0, 0, 0, 0, 0, 0, 7, 7]);
      l47.setBlend(90, 100);
      l47.setColor([rgb(123, 49, 57), rgb(107, 115, 115), rgb(119, 190, 175), rgb(255, 255, 255)]);
      l47.setOnOff(1);
      l47.setFlashFrame();

      const l45 = stage.layer(45);
      l45.setPositionPoint(l47.x + rnd(-80, 100), l47.y + rnd(20, 200));
      l45.setScale(40, 90);
      l45.setRotation([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, -90]);
      l45.setSkew([0, 0, 0, 0, 0, 0, 0, 7]);
      l45.setBlend(50, 80);
      const txt1color = l47.color;
      l45.setColor([rgb(255, 0, 33), rgb(50, 30, 20), rgbSub(txt1color, rgb(20, 20, 20))]);
      l45.setOnOff(1);
      l45.setFlashFrame();

      const l43 = stage.layer(43);
      l43.setPositionPoint(l27.x + rnd(-80, 100), l27.y + rnd(20, 200));
      l43.setScale(90, 120);
      l43.setBlend(50, 80);
      l43.setRotation([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, -90]);
      const txt3color = l47.color;
      l43.setColor([rgb(255, 0, 33), rgb(50, 30, 20), rgbSub(txt3color, rgb(20, 20, 20))]);
      l43.setOnOff(1);
      l43.setFlashFrame();

      const l41 = stage.layer(41);
      l41.setPositionPoint(l27.x + rnd(-20, 20), l27.y + rnd(-20, 20));
      l41.setOnOff(l27.visible ? 0 : 1);
      // never colored in the original either — see generic module's note.
      // Matters extra here: l25 below derives ITS color from l41.color, so
      // leaving l41 white was silently cascading the same problem into l25.
      l41.setColor(bgcolorList);

      const l25 = stage.layer(25);
      l25.setColor([rgb(60, 0, 40), rgb(255, 0, 33), rgb(0, 198, 255), rgb(181, 214, 173), rgb(250, 250, 255)]);
      l41.setScale(150, 250);
      l41.setRotation([0, 0, 0, 0, 0, -90]);
      l41.setSkew([0, 0, 0, 0, 0, 0, 0, -7, 7]);
      l41.setBlend(50, 80);
      l41.setFlashFrame();
      l41.setVariable('txt', String.fromCharCode(rnd(65, 122)));

      const l52 = stage.layer(52);
      l52.setPositionTarget([
        point(theLeft + 100, theBot - 80), point(ctrX, theBot - 20),
        point(theRight - 200, theBot - 70), point(theRight - 200, theBot - 80),
      ]);
      l52.setFlipH([1, 0]);
      l52.setBlend(80, 90);
      // never colored in the original either — see generic module's note
      l52.setColor(bgcolorList);
      l52.setRandomOnOff([1, 1, 1, 0]);
      l52.setScale(80, 100);
      l52.setFlashFrame();

      l25.setRandomOnOff([1, 1, 1, 1, 0]);
      l25.setScale(50, 200);
      l25.setBlend(50, 100);
      l25.color = rgbSub(l41.color, rgb(20, 30, 30));
      l25.setPositionPoint(l27.x, l27.y);
      l25.setBlend(70, 80);
      l25.setFlashFrame();
    },
    text(stage, txt1, txt2, txt3) {
      stage.layer(47).setVariable('txt', txt1);
      stage.layer(45).setVariable('txt', txt2);
      stage.layer(43).setVariable('txt', txt3);
    },
  },

  urb: {
    label: 'Urbivore',
    layerIds: [11, 13, 31, 47],
    run(stage, format = 'page') {
      const { left: theLeft, top: theTop } = stage.liveArea;
      const Xoffset = [0, 134, 268, 402, 536, 566, 670];
      const imgXoffset = [0, 11, 19, 153, 279, 283, 287, 421, 555, 566, 689];
      const Yoffset = [0, 141, 282, 423, 564, 705, 846];

      stage.layer(11).setColor([
        rgb(1, 1, 1), rgb(5, 67, 98), rgb(61, 74, 83), rgb(88, 100, 126), rgb(255, 98, 0),
        rgb(153, 0, 0), rgb(91, 105, 115), rgb(111, 151, 155), rgb(174, 250, 0), rgb(255, 255, 255), rgb(235, 255, 255),
      ]);
      stage.layer(11).setOnOff(1);

      const urbPalette = [
        rgb(1, 1, 1), rgb(5, 67, 98), rgb(61, 74, 83), rgb(88, 100, 126), rgb(255, 98, 0),
        rgb(153, 0, 0), rgb(91, 105, 115), rgb(111, 151, 155), rgb(174, 250, 0), rgb(255, 255, 255), rgb(235, 255, 255),
      ];

      const l13 = stage.layer(13);
      l13.setFlipH([1, 0]);
      l13.setBlend(50, 90);
      // never colored in the original either — see generic module's note
      l13.setColor(urbPalette);
      l13.setOnOff(1);
      l13.setFlashFrame();

      // simplified from the original's per-format offset table: 'page'
      // is the meaningful default for a web port (see mod.run note above)
      const l31 = stage.layer(31);
      l31.registration = 'topleft'; // full-canvas cover image, same as mod's sprite 31
      const l47 = stage.layer(47);
      l31.setPositionPoint(theLeft + pick(Xoffset.slice(0, 2)), theTop + pick(Yoffset.slice(0, 5)));
      l47.setPositionPoint(theLeft + pick(Xoffset.slice(0, 3)), theTop + pick(Yoffset.slice(0, 5)));

      l31.setBlend(90, 100);
      // never colored in the original either — see generic module's note
      l31.setColor(urbPalette);
      l31.setOnOff(1);
      l31.setFlashFrame();

      l47.setBlend(50, 100);
      l47.setColor([rgb(1, 1, 1), rgb(20, 20, 70), rgb(255, 255, 255), rgb(200, 245, 255), rgb(255, 98, 0), rgb(174, 250, 0), rgb(171, 204, 211)]);
      l47.setOnOff(1);
      l47.setFlashFrame();

      void imgXoffset; // only used by the 'page' format's setImagerect call on sprite 13, omitted — see README
    },
    text(stage, txt1, txt2, txt3) {
      const capconvert = pick([1, 0]);
      let input1 = txt1;
      if (capconvert) input1 = txt1.toUpperCase();
      stage.layer(31).setVariable('txt2', txt2);
      stage.layer(31).setVariable('txt3', txt3);
      stage.layer(47).setVariable('txt', input1);
    },
  },
};
