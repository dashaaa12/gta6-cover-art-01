// cover.js — the cover renderer for Neon Coast Cover Studio.
// Draws the multi-panel GTA-style poster: photo or painted panels with white
// gutters, a bold title block, a neon script subtitle, a caption bar and a
// five-star heat meter, at the three post sizes.

import { SCENES } from './paint.js';
import { applyGradeOverlays, gradeFilter, addVignette, addGrain } from './grades.js';

export const POST_SIZES = {
  landscape: { label: 'Landscape 1920 × 1080', w: 1920, h: 1080 },
  square: { label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
};

export const LAYOUTS = {
  collage: { label: 'Vice Collage' },
  quad: { label: 'Four Corners' },
  hero: { label: 'Hero + Insets' },
  strips: { label: 'Panel Strips' },
};

// Panel rectangles in relative units, per layout and orientation family.
export function layoutPanels(layoutKey, w, h) {
  const landscape = w >= h;
  switch (layoutKey) {
    case 'quad':
      return [
        { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
        { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      ];
    case 'hero':
      return landscape
        ? [{ x: 0, y: 0, w: 1, h: 1 }, { x: 0.665, y: 0.07, w: 0.3, h: 0.4 }, { x: 0.665, y: 0.53, w: 0.3, h: 0.4 }]
        : [{ x: 0, y: 0, w: 1, h: 1 }, { x: 0.06, y: 0.6, w: 0.4, h: 0.3 }, { x: 0.54, y: 0.6, w: 0.4, h: 0.3 }];
    case 'strips':
      return landscape
        ? [{ x: 0, y: 0, w: 0.34, h: 1 }, { x: 0.34, y: 0, w: 0.33, h: 1 }, { x: 0.67, y: 0, w: 0.33, h: 1 }]
        : [{ x: 0, y: 0, w: 1, h: 0.34 }, { x: 0, y: 0.34, w: 1, h: 0.33 }, { x: 0, y: 0.67, w: 1, h: 0.33 }];
    case 'collage':
    default:
      // the bottom row ends at 0.912 so painted panels stay clear of the caption bar
      return landscape
        ? [{ x: 0, y: 0, w: 0.52, h: 1 }, { x: 0.52, y: 0, w: 0.48, h: 0.54 }, { x: 0.52, y: 0.54, w: 0.24, h: 0.372 }, { x: 0.76, y: 0.54, w: 0.24, h: 0.372 }]
        : [{ x: 0, y: 0, w: 1, h: 0.52 }, { x: 0, y: 0.52, w: 0.5, h: 0.392 }, { x: 0.5, y: 0.52, w: 0.5, h: 0.392 }, { x: 0, y: 0, w: 0, h: 0 }];
  }
}

// What fills each panel before the user changes anything: the first sample
// photo leads, painted scenes and the other photos fill the rest.
export function defaultPanelContent(panelIndex) {
  const plan = [
    { kind: 'photo', photo: 0, zoom: 1, ox: 0, oy: 0 },
    { kind: 'scene', scene: 'car', zoom: 1, ox: 0, oy: 0 },
    { kind: 'photo', photo: 1, zoom: 1.15, ox: 0, oy: -0.1 },
    { kind: 'photo', photo: 2, zoom: 1.1, ox: 0, oy: 0 },
    { kind: 'scene', scene: 'heli', zoom: 1, ox: 0, oy: 0 },
    { kind: 'scene', scene: 'boat', zoom: 1, ox: 0, oy: 0 },
  ];
  return { ...plan[panelIndex % plan.length] };
}

function drawPhotoCover(ctx, img, px, py, pw, ph, panel, gradeKey) {
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * (panel.zoom || 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = px + (pw - dw) * (0.5 + (panel.ox || 0) / 2);
  const dy = py + (ph - dh) * (0.5 + (panel.oy || 0) / 2);
  ctx.save();
  ctx.filter = gradeFilter(gradeKey);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawScenePanel(ctx, sceneKey, px, py, pw, ph) {
  const scene = SCENES[sceneKey] || SCENES.palms;
  ctx.save();
  ctx.translate(px, py);
  scene.paint(ctx, pw, ph);
  ctx.restore();
}

function drawPanel(ctx, rect, panel, view) {
  const px = rect.x, py = rect.y, pw = rect.w, ph = rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  ctx.fillStyle = '#101018';
  ctx.fillRect(px, py, pw, ph);
  if (panel.kind === 'photo') {
    const img = view.photos[panel.photo];
    if (img && img.complete && img.naturalWidth > 0) {
      drawPhotoCover(ctx, img, px, py, pw, ph, panel, view.grade);
    } else {
      drawScenePanel(ctx, 'duo', px, py, pw, ph);
    }
  } else {
    drawScenePanel(ctx, panel.scene, px, py, pw, ph);
  }
  applyGradeOverlays(ctx, px, py, pw, ph, view.grade);
  ctx.restore();
  ctx.strokeStyle = 'rgba(8,4,18,0.65)';
  ctx.lineWidth = Math.max(2, view.w * 0.0016);
  ctx.strokeRect(px, py, pw, ph);
}

export function fitTitleLines(ctx, title, maxWidth, startSize) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return { size: startSize, lines: [] };
  let size = startSize;
  const fits = (lines, s) => {
    ctx.font = `${s}px Anton, sans-serif`;
    return lines.every(line => ctx.measureText(line).width <= maxWidth);
  };
  while (size > 24) {
    if (fits([words.join(' ')], size)) return { size, lines: [words.join(' ')] };
    if (words.length > 1) {
      let best = null;
      for (let cut = 1; cut < words.length; cut++) {
        const lines = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
        if (fits(lines, size)) { best = lines; break; }
      }
      if (best) return { size, lines: best };
    }
    size -= 6;
  }
  return { size, lines: [words.join(' ')] };
}

function drawTitleBlock(ctx, w, h, view) {
  const title = (view.title || '').toUpperCase();
  if (!title) return;
  const maxWidth = w * 0.94;
  const { size, lines } = fitTitleLines(ctx, title, maxWidth, Math.floor(Math.min(h * 0.148, w * 0.155)));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let y = h * 0.038;
  const lineHeight = size * 0.94;
  lines.forEach((line, i) => {
    ctx.font = `${size}px Anton, sans-serif`;
    const grad = ctx.createLinearGradient(0, y, 0, y + size);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.62, '#fff6e3');
    grad.addColorStop(1, '#ffc98a');
    ctx.fillStyle = 'rgba(12,2,24,0.6)';
    ctx.fillText(line, w / 2 + size * 0.045, y + size * 0.05);
    ctx.lineWidth = size * 0.17;
    ctx.strokeStyle = '#0d0217';
    ctx.lineJoin = 'round';
    ctx.strokeText(line, w / 2, y);
    ctx.fillStyle = grad;
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
    void i;
  });
  if (view.subtitle) {
    const subSize = Math.floor(size * 0.52);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.save();
    ctx.translate(w * 0.635, y - subSize * 0.28);
    ctx.rotate(-0.045);
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = subSize * 0.55;
    ctx.fillStyle = '#ff5da2';
    ctx.fillText(view.subtitle, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd7ea';
    ctx.fillText(view.subtitle, 0, 0);
    ctx.restore();
  }
}

function drawSpacedText(ctx, text, cx, y, spacing) {
  const chars = [...text];
  const widths = chars.map(ch => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = prevAlign;
}

function drawCaptionBar(ctx, w, h, view) {
  if (!view.caption) return;
  const barH = Math.floor(h * 0.078);
  const y = h - barH;
  ctx.fillStyle = 'rgba(6,2,14,0.88)';
  ctx.fillRect(0, y, w, barH);
  const rule = ctx.createLinearGradient(0, 0, w, 0);
  rule.addColorStop(0, '#ff2e88');
  rule.addColorStop(0.5, '#ffb300');
  rule.addColorStop(1, '#19e3ff');
  ctx.fillStyle = rule;
  ctx.fillRect(0, y, w, Math.max(3, h * 0.005));
  const size = Math.floor(barH * 0.46);
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  drawSpacedText(ctx, view.caption.toUpperCase(), w / 2, y + barH * 0.56, size * 0.22);
}

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = -Math.PI / 2 + i * Math.PI / 5;
    const x = cx + Math.cos(ang) * rad;
    const yy = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
  }
  ctx.closePath();
}

function drawHeatStars(ctx, w, h, heat) {
  const r = Math.min(w, h) * 0.021;
  const gap = r * 2.5;
  let cx = w - Math.min(w, h) * 0.028 - r - gap * 4;
  const cy = Math.min(w, h) * 0.033 + r;
  for (let i = 0; i < 5; i++) {
    starPath(ctx, cx, cy, r);
    if (i < heat) {
      ctx.fillStyle = '#ffd166';
      ctx.fill();
      ctx.strokeStyle = '#0d0217';
      ctx.lineWidth = r * 0.14;
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = r * 0.12;
      ctx.stroke();
    }
    cx += gap;
  }
}

// view: { size, layout, grade, title, subtitle, caption, heat, grain, panels, photos }
export function renderCover(ctx, view) {
  const { w, h } = view.size;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f7f2e7';
  ctx.fillRect(0, 0, w, h);
  const gutter = Math.max(6, Math.round(w * 0.0072));
  const rects = layoutPanels(view.layout, w, h)
    .filter(r => r.w > 0 && r.h > 0)
    .map(r => ({
      x: r.x * w + gutter / 2, y: r.y * h + gutter / 2,
      w: r.w * w - gutter, h: r.h * h - gutter,
    }));
  rects.forEach((rect, i) => {
    const panel = view.panels[i] || defaultPanelContent(i);
    drawPanel(ctx, rect, panel, { ...view, w, h });
  });
  drawTitleBlock(ctx, w, h, view);
  drawHeatStars(ctx, w, h, view.heat);
  drawCaptionBar(ctx, w, h, view);
  addVignette(ctx, w, h, 0.3);
  addGrain(ctx, w, h, (view.grain || 0) * 0.14, 4242);
  ctx.restore();
}
