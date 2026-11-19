// app.js — Neon Coast Cover Studio: editor state and wiring.
// Photos are read locally with object URLs and drawn on the canvas; nothing
// is uploaded anywhere. URL parameters size/layout/grade/title preselect a
// look, demo=1 loads the sample photos, and shot=cover renders only the
// cover full-frame (the maker uses it for the entry's screenshots).

import { POST_SIZES, layoutPanels, defaultPanelContent, renderCover } from './cover.js';
import { SCENES } from './paint.js';

const SAMPLE_PHOTOS = [
  { src: 'samples/woman-car.jpg', label: 'Boulevard' },
  { src: 'samples/man-rooftop.jpg', label: 'Rooftop' },
  { src: 'samples/friends-neon.jpg', label: 'Neon Street' },
];

const params = new URLSearchParams(location.search);
const shotMode = params.get('shot') === 'cover';
if (shotMode) document.body.classList.add('shot');

const state = {
  size: params.get('size') || 'landscape',
  layout: params.get('layout') || 'collage',
  grade: params.get('grade') || 'sunset',
  title: params.get('title') || 'GRAND THEFT AUTO VI',
  subtitle: params.get('subtitle') !== null ? params.get('subtitle') : 'Vice City',
  caption: params.get('caption') !== null ? params.get('caption') : 'WELCOME BACK TO THE CITY OF NEON',
  heat: params.get('heat') !== null ? Math.min(5, Math.max(0, Number(params.get('heat')) || 0)) : 5,
  grain: params.get('grain') !== null ? Math.min(1, Math.max(0, Number(params.get('grain')) || 0)) : 0.5,
};

const panelCounts = { collage: 4, quad: 4, hero: 3, strips: 3 };
const panelsByLayout = {};
for (const key of Object.keys(panelCounts)) {
  panelsByLayout[key] = Array.from({ length: panelCounts[key] }, (_, i) => defaultPanelContent(key === 'hero' ? [0, 4, 5][i] : i));
}

const photos = []; // { img, label }
let selectedPanel = 0;

const canvas = document.getElementById('coverCanvas');
const ctx = canvas.getContext('2d');

function currentPanels() {
  return panelsByLayout[state.layout];
}

function currentView() {
  return {
    size: POST_SIZES[state.size],
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    caption: state.caption,
    heat: state.heat,
    grain: state.grain,
    panels: currentPanels(),
    photos: photos.map(p => p.img),
  };
}

function pixelRects() {
  const { w, h } = POST_SIZES[state.size];
  const gutter = Math.max(6, Math.round(w * 0.0072));
  return layoutPanels(state.layout, w, h)
    .filter(r => r.w > 0 && r.h > 0)
    .map(r => ({ x: r.x * w + gutter / 2, y: r.y * h + gutter / 2, w: r.w * w - gutter, h: r.h * h - gutter }));
}

function drawSelection() {
  const rect = pixelRects()[selectedPanel];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(3, POST_SIZES[state.size].w * 0.003);
  ctx.setLineDash([18, 12]);
  ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
  ctx.restore();
}

function render() {
  const { w, h } = POST_SIZES[state.size];
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  renderCover(ctx, currentView());
  if (!shotMode) drawSelection();
}

// ---------- photos ----------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addSamplePhotos() {
  for (const sample of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(sample.src);
      photos.push({ img, label: sample.label });
    } catch {
      // a missing sample never blocks the studio
    }
  }
}

async function addUserPhotos(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      photos.push({ img, label: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'Photo' });
    } catch {
      URL.revokeObjectURL(url);
    }
  }
  refreshPhotoUI();
  render();
}

// ---------- panel editor ----------

const panelSource = document.getElementById('panelSource');
const zoomRange = document.getElementById('zoomRange');
const panXRange = document.getElementById('panXRange');
const panYRange = document.getElementById('panYRange');

function refreshPanelSource() {
  panelSource.innerHTML = '';
  photos.forEach((photo, i) => {
    const opt = document.createElement('option');
    opt.value = `photo:${i}`;
    opt.textContent = `Photo — ${photo.label}`;
    panelSource.appendChild(opt);
  });
  for (const [key, scene] of Object.entries(SCENES)) {
    const opt = document.createElement('option');
    opt.value = `scene:${key}`;
    opt.textContent = `Painted — ${scene.label}`;
    panelSource.appendChild(opt);
  }
  syncPanelControls();
}

function syncPanelControls() {
  const panel = currentPanels()[selectedPanel];
  document.getElementById('selectedPanelName').textContent = String(selectedPanel + 1);
  panelSource.value = panel.kind === 'photo' ? `photo:${panel.photo}` : `scene:${panel.scene}`;
  zoomRange.value = panel.zoom;
  panXRange.value = panel.ox;
  panYRange.value = panel.oy;
  document.getElementById('zoomOut').textContent = `${Number(panel.zoom).toFixed(2)}×`;
  document.getElementById('panXOut').textContent = Number(panel.ox).toFixed(2);
  document.getElementById('panYOut').textContent = Number(panel.oy).toFixed(2);
  refreshPhotoStrip();
}

function refreshPhotoStrip() {
  const strip = document.getElementById('photoStrip');
  strip.innerHTML = '';
  const panel = currentPanels()[selectedPanel];
  photos.forEach((photo, i) => {
    const fig = document.createElement('figure');
    if (panel.kind === 'photo' && panel.photo === i) fig.className = 'on';
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.label;
    const cap = document.createElement('figcaption');
    cap.textContent = photo.label;
    fig.appendChild(img);
    fig.appendChild(cap);
    fig.title = `Put ${photo.label} in panel ${selectedPanel + 1}`;
    fig.addEventListener('click', () => {
      Object.assign(currentPanels()[selectedPanel], { kind: 'photo', photo: i });
      syncPanelControls();
      render();
    });
    strip.appendChild(fig);
  });
}

function refreshPhotoUI() {
  refreshPanelSource();
}

panelSource.addEventListener('change', () => {
  const [kind, value] = panelSource.value.split(':');
  const panel = currentPanels()[selectedPanel];
  if (kind === 'photo') Object.assign(panel, { kind: 'photo', photo: Number(value) });
  else Object.assign(panel, { kind: 'scene', scene: value });
  refreshPhotoStrip();
  render();
});

function bindCrop(range, out, key, format) {
  range.addEventListener('input', () => {
    const panel = currentPanels()[selectedPanel];
    panel[key] = Number(range.value);
    out.textContent = format(Number(range.value));
    render();
  });
}
bindCrop(zoomRange, document.getElementById('zoomOut'), 'zoom', v => `${v.toFixed(2)}×`);
bindCrop(panXRange, document.getElementById('panXOut'), 'ox', v => v.toFixed(2));
bindCrop(panYRange, document.getElementById('panYOut'), 'oy', v => v.toFixed(2));

document.getElementById('fillAllBtn').addEventListener('click', () => {
  const panel = currentPanels()[selectedPanel];
  const photoIndex = panel.kind === 'photo' ? panel.photo : 0;
  const crops = [
    { zoom: 1.05, ox: -0.15, oy: 0 }, { zoom: 1.35, ox: 0.3, oy: -0.2 },
    { zoom: 1.5, ox: -0.3, oy: 0.15 }, { zoom: 1.25, ox: 0.1, oy: 0.25 },
  ];
  currentPanels().forEach((p, i) => Object.assign(p, { kind: 'photo', photo: photoIndex }, crops[i % crops.length]));
  syncPanelControls();
  render();
});

canvas.addEventListener('click', event => {
  const box = canvas.getBoundingClientRect();
  const { w, h } = POST_SIZES[state.size];
  const x = (event.clientX - box.left) * (w / box.width);
  const y = (event.clientY - box.top) * (h / box.height);
  const index = pixelRects().findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  if (index >= 0) {
    selectedPanel = index;
    syncPanelControls();
    render();
  }
});

// ---------- photos intake ----------

const photoInput = document.getElementById('photoInput');
const dropZone = document.getElementById('dropZone');
photoInput.addEventListener('change', () => {
  addUserPhotos([...photoInput.files]);
  photoInput.value = '';
});
for (const name of ['dragenter', 'dragover']) {
  dropZone.addEventListener(name, event => {
    event.preventDefault();
    dropZone.classList.add('dragging');
  });
}
for (const name of ['dragleave', 'drop']) {
  dropZone.addEventListener(name, event => {
    event.preventDefault();
    dropZone.classList.remove('dragging');
  });
}
dropZone.addEventListener('drop', event => {
  addUserPhotos([...event.dataTransfer.files]);
});
document.querySelectorAll('[data-sample]').forEach(btn => {
  btn.addEventListener('click', () => {
    const index = Number(btn.dataset.sample);
    if (photos[index]) {
      Object.assign(currentPanels()[selectedPanel], { kind: 'photo', photo: index });
      syncPanelControls();
      render();
    }
  });
});

// ---------- look & words ----------

function bindSegment(id, attr, apply) {
  const row = document.getElementById(id);
  row.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      row.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      apply(btn.dataset[attr]);
      render();
    });
  });
}
function syncSegment(id, attr, value) {
  document.getElementById(id).querySelectorAll('button').forEach(b => {
    b.classList.toggle('on', b.dataset[attr] === value);
  });
}
bindSegment('layoutSeg', 'layout', v => { state.layout = v; selectedPanel = 0; syncPanelControls(); });
bindSegment('gradeSeg', 'grade', v => { state.grade = v; });
bindSegment('sizeSeg', 'size', v => { state.size = v; });

function bindText(id, key) {
  const input = document.getElementById(id);
  input.value = state[key];
  input.addEventListener('input', () => {
    state[key] = input.value;
    render();
  });
}
bindText('titleInput', 'title');
bindText('subtitleInput', 'subtitle');
bindText('captionInput', 'caption');

const heatRange = document.getElementById('heatRange');
heatRange.addEventListener('input', () => {
  state.heat = Number(heatRange.value);
  document.getElementById('heatOut').textContent = heatRange.value;
  render();
});
const grainRange = document.getElementById('grainRange');
grainRange.addEventListener('input', () => {
  state.grain = Number(grainRange.value);
  document.getElementById('grainOut').textContent = `${Math.round(state.grain * 100)}%`;
  render();
});

// ---------- export ----------

document.getElementById('exportBtn').addEventListener('click', () => {
  const { w, h } = POST_SIZES[state.size];
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  renderCover(out.getContext('2d'), currentView());
  out.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon-coast-cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
});

// ---------- start ----------

(async function startStudio() {
  syncSegment('layoutSeg', 'layout', state.layout);
  syncSegment('gradeSeg', 'grade', state.grade);
  syncSegment('sizeSeg', 'size', state.size);
  heatRange.value = state.heat;
  document.getElementById('heatOut').textContent = String(state.heat);
  grainRange.value = state.grain;
  document.getElementById('grainOut').textContent = `${Math.round(state.grain * 100)}%`;
  await addSamplePhotos();
  try {
    await Promise.race([
      Promise.all([document.fonts.load('100px Anton'), document.fonts.load('60px Pacifico')]),
      new Promise(resolve => setTimeout(resolve, 2500)),
    ]);
    await document.fonts.ready;
  } catch {
    // lettering falls back to system fonts if the files cannot load
  }
  refreshPhotoUI();
  render();
  if (shotMode) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
      document.title = 'shot-ready';
    }));
  }
})();
