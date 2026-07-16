let stage;
let currentModule = 'generic';
let manifest = null;

async function init() {
  // Real n_Gen's content area measures 566x734px (aspect ratio 0.771,
  // essentially US Letter portrait proportions) — confirmed by headless
  // capture of the actual exe across 120 generated frames, dead consistent
  // across all six modules. The previous 1000x700 landscape guess was the
  // wrong orientation entirely, not just a minor size mismatch.
  stage = new Stage(document.getElementById('stage'), { width: 850, height: 1100 });
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

  document.getElementById('generate-btn').addEventListener('click', generate);
  document.getElementById('download-btn').addEventListener('click', downloadImage);
  ['txt1', 'txt2', 'txt3'].forEach((id) => {
    document.getElementById(id).addEventListener('input', applyText);
  });

  switchModule();
}

function switchModule() {
  stage.currentModule = currentModule;
  stage.resetAll();
  applyManifest(stage, currentModule, manifest);
  generate();
}

function generate() {
  MODULES[currentModule].run(stage);
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
    a.download = `n_gen-${currentModule}-${Date.now()}.png`;
    a.click();
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

window.addEventListener('DOMContentLoaded', init);
