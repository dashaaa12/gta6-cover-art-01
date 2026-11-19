// grades.js — Vice City colour grades for Neon Coast Cover Studio.
// A grade is a CSS filter applied while a photo is drawn, plus tinted light
// overlays clipped to the panel, so photos and painted panels share one look.

import { mulberry32 } from './paint.js';

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    filter: 'saturate(1.28) contrast(1.07) brightness(1.03) sepia(0.16)',
    overlays: [
      ['rgba(255,110,60,0.20)', 'overlay', 0.55],
      ['rgba(64,20,120,0.22)', 'soft-light', 0],
      ['rgba(255,170,60,0.14)', 'soft-light', 0.3],
    ],
  },
  neon: {
    label: 'Neon Nights',
    filter: 'saturate(1.4) contrast(1.12) brightness(0.99)',
    overlays: [
      ['rgba(20,220,255,0.16)', 'overlay', 0.5],
      ['rgba(255,40,140,0.17)', 'soft-light', 0.15],
      ['rgba(10,10,60,0.20)', 'overlay', 0],
    ],
  },
  golden: {
    label: 'Golden Hour',
    filter: 'saturate(1.15) contrast(1.04) brightness(1.07) sepia(0.28)',
    overlays: [
      ['rgba(255,180,70,0.22)', 'soft-light', 0.2],
      ['rgba(255,120,40,0.12)', 'overlay', 0.6],
    ],
  },
  noir: {
    label: 'Midnight Noir',
    filter: 'saturate(0.25) contrast(1.22) brightness(0.94)',
    overlays: [
      ['rgba(30,40,90,0.25)', 'overlay', 0],
      ['rgba(255,60,90,0.10)', 'soft-light', 0.7],
    ],
  },
};

// overlays entries: [colour, composite, focus] where focus 0 paints the whole
// panel, and a value in (0,1] centres a soft radial pool of light there.
export function applyGradeOverlays(ctx, x, y, w, h, gradeKey) {
  const grade = GRADES[gradeKey] || GRADES.sunset;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (const [color, composite, focus] of grade.overlays) {
    ctx.globalCompositeOperation = composite;
    if (focus > 0) {
      const g = ctx.createRadialGradient(
        x + w / 2, y + h * focus, Math.min(w, h) * 0.1,
        x + w / 2, y + h * focus, Math.max(w, h) * 0.85);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}

export function gradeFilter(gradeKey) {
  return (GRADES[gradeKey] || GRADES.sunset).filter;
}

export function addVignette(ctx, w, h, strength) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.74);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(5,0,16,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Deterministic film grain: one seeded tile, stamped with low alpha.
export function addGrain(ctx, w, h, amount, seed) {
  if (amount <= 0) return;
  const tile = 128;
  const off = document.createElement('canvas');
  off.width = tile; off.height = tile;
  const octx = off.getContext('2d');
  const img = octx.createImageData(tile, tile);
  const rand = mulberry32(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v;
    img.data[i + 3] = Math.floor(amount * 255);
  }
  octx.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(off, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
