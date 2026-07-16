let stage;
let currentModule = 'generic';
let manifest = null;

async function init() {
  stage = new Stage(document.getElementById('stage'), { width: 1000, height: 700 });
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
