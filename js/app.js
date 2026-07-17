let stage;
let currentModule = 'generic';
let currentFormat = 'page';
let manifest = null;

// Real measured content-area dimensions per format, headless-captured from
// the exe's View menu (each format genuinely has a different Flash-authored
// liveArea, not just a scale multiplier on one fixed canvas — confirmed
// from source: setoutputMedia reads width/height from a Flash property
// per-frame). Scaled up from raw capture pixels by the same 1.502 factor
// used for Poster (566x734 real -> 850x1100 here), for internal consistency.
const FORMAT_DIMENSIONS = {
  page: { width: 850, height: 1100 },    // real: 566 x 734  (ratio 0.771)
  bcard: { width: 326, height: 568 },     // real: 217 x 378  (ratio 0.574)
  pcard: { width: 650, height: 980 },     // real: 433 x 652  (ratio 0.664)
  cd: { width: 897, height: 811 },        // real: 597 x 540  (ratio 1.106)
  record: { width: 1008, height: 1008 },  // real: 671 x 671  (ratio 1.000)
  web: { width: 967, height: 995 },       // real: 644 x 662  (ratio 0.973)
};

async function init() {
  manifest = await loadManifest();

  const select = document.getElementById('module-select');
  Object.entries(MODULES).forEach(([key, mod]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = mod.label;
    select.appendChild(opt);
  });
  select.value = currentModule;
  select.addEventListener('change', () => {
    currentModule = select.value;
    switchModule();
  });

  const formatSelect = document.getElementById('format-select');
  formatSelect.value = currentFormat;
  formatSelect.addEventListener('change', () => {
    currentFormat = formatSelect.value;
    rebuildStage();
    switchModule();
  });

  document.getElementById('generate-btn').addEventListener('click', generate);
  document.getElementById('download-btn').addEventListener('click', downloadImage);
  ['txt1', 'txt2', 'txt3'].forEach((id) => {
    document.getElementById(id).addEventListener('input', applyText);
  });

  rebuildStage();
  switchModule();
}

function rebuildStage() {
  const dims = FORMAT_DIMENSIONS[currentFormat];
  stage = new Stage(document.getElementById('stage'), dims);
}

function switchModule() {
  stage.currentModule = currentModule;
  stage.resetAll();
  applyManifest(stage, currentModule, manifest);
  generate();
}

function generate() {
  MODULES[currentModule].run(stage, currentFormat);
  applyText();
}

function applyText() {
  const txt1 = document.getElementById('txt1').value;
  const txt2 = document.getElementById('txt2').value;
  const txt3 = document.getElementById('txt3').value;
  MODULES[currentModule].text(stage, txt1, txt2, txt3);
}

async function downloadImage() {
  const btn = document.getElementById('download-btn');
  const original = btn.textContent;
  btn.textContent = 'Rendering…';
  btn.disabled = true;
  try {
    const dataUrl = await stage.exportPNG();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `n_gen-${currentModule}-${currentFormat}-${Date.now()}.png`;
    a.click();
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', init);
