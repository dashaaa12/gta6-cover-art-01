// paint.js — procedural poster scenes for Neon Coast Cover Studio.
// Every scene is drawn from scratch with canvas paths: no photographs, no
// traced artwork. A fixed seed per scene keeps every render deterministic.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return g;
}

function sunDisc(ctx, cx, cy, r, core, glow) {
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 2.4);
  g.addColorStop(0, glow);
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function cloudBands(ctx, w, h, rand, color, count, yBase, ySpread) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const y = yBase + rand() * ySpread;
    const cw = w * (0.25 + rand() * 0.5);
    const cx = rand() * w - cw * 0.3;
    const ch = h * (0.012 + rand() * 0.02);
    ctx.beginPath();
    ctx.ellipse(cx + cw / 2, y, cw / 2, ch, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintPalmTree(ctx, x, groundY, height, lean, color, frondColor) {
  const topX = x + lean * height;
  const topY = groundY - height;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(3, height * 0.035);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x + lean * height * 0.3, groundY - height * 0.6, topX, topY);
  ctx.stroke();
  ctx.strokeStyle = frondColor || color;
  const fronds = 9;
  for (let i = 0; i < fronds; i++) {
    const ang = Math.PI * (0.08 + (i / (fronds - 1)) * 0.84) + Math.PI;
    const len = height * (0.34 + (i % 3) * 0.05);
    const ex = topX + Math.cos(ang) * len;
    const ey = topY - Math.sin(ang) * len * 0.45 + len * 0.22;
    ctx.lineWidth = Math.max(2, height * 0.016);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(ang) * len * 0.55, topY - Math.sin(ang) * len * 0.5, ex, ey);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(topX, topY, height * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

function skylineRow(ctx, w, horizon, maxH, color, windowColor, rand, litRatio) {
  let x = -w * 0.02;
  ctx.fillStyle = color;
  const tops = [];
  while (x < w * 1.02) {
    const bw = w * (0.05 + rand() * 0.09);
    const bh = maxH * (0.35 + rand() * 0.65);
    ctx.fillRect(x, horizon - bh, bw, bh);
    tops.push([x, horizon - bh, bw, bh]);
    x += bw + w * (0.005 + rand() * 0.02);
  }
  if (windowColor) {
    ctx.fillStyle = windowColor;
    for (const [bx, by, bw, bh] of tops) {
      const cols = Math.max(1, Math.floor(bw / (w * 0.018)));
      const rows = 9;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rand() < litRatio) {
            ctx.fillRect(bx + bw * 0.14 + c * bw * 0.68 / cols, by + bh * 0.1 + r * bh * 0.8 / rows, bw * 0.3 / cols + 1.5, 2.2);
          }
        }
      }
    }
  }
}

export function paintSunsetPalms(ctx, w, h) {
  const rand = mulberry32(1101);
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.42, '#7597de'], [0.62, '#ff7e5f'], [0.8, '#feb47b'], [1, '#ffd194']]);
  sunDisc(ctx, w * 0.68, h * 0.6, h * 0.13, '#fff3b0', 'rgba(255,160,80,0.55)');
  cloudBands(ctx, w, h, rand, 'rgba(75,30,90,0.35)', 6, h * 0.06, h * 0.3);
  ctx.fillStyle = '#1d0b33';
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
  paintPalmTree(ctx, w * 0.16, h * 1.0, h * 0.78, 0.16, '#160826', '#160826');
  paintPalmTree(ctx, w * 0.9, h * 1.02, h * 0.92, -0.13, '#12061f', '#12061f');
  paintPalmTree(ctx, w * 0.55, h * 1.0, h * 0.5, 0.1, 'rgba(22,8,38,0.85)', 'rgba(22,8,38,0.85)');
}

export function paintSkylineDusk(ctx, w, h) {
  const rand = mulberry32(2202);
  skyGradient(ctx, w, h, [[0, '#0f0c29'], [0.5, '#302b63'], [0.78, '#ff512f'], [1, '#dd2476']]);
  sunDisc(ctx, w * 0.3, h * 0.66, h * 0.1, '#ffe29f', 'rgba(255,110,80,0.5)');
  cloudBands(ctx, w, h, rand, 'rgba(20,10,50,0.4)', 5, h * 0.05, h * 0.26);
  skylineRow(ctx, w, h * 0.9, h * 0.52, '#241536', null, rand, 0);
  skylineRow(ctx, w, h * 0.97, h * 0.36, '#150a26', 'rgba(255,205,120,0.9)', rand, 0.4);
  ctx.fillStyle = '#0b0518';
  ctx.fillRect(0, h * 0.97, w, h * 0.03);
}

export function paintSportsCar(ctx, w, h) {
  const rand = mulberry32(3303);
  skyGradient(ctx, w, h, [[0, '#141e30'], [0.55, '#8e2de2'], [0.8, '#ff6a5f'], [1, '#ffb75e']]);
  sunDisc(ctx, w * 0.78, h * 0.5, h * 0.11, '#fff3b0', 'rgba(255,140,80,0.5)');
  skylineRow(ctx, w, h * 0.72, h * 0.3, 'rgba(20,8,40,0.8)', 'rgba(255,210,140,0.85)', rand, 0.35);
  paintPalmTree(ctx, w * 0.06, h * 0.74, h * 0.5, 0.12, '#0d0518', '#0d0518');
  // road
  ctx.fillStyle = '#17102a';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,120,90,0.35)';
  ctx.fillRect(0, h * 0.72, w, h * 0.012);
  // neon underglow
  const carY = h * 0.8;
  const carW = w * 0.78, carX = w * 0.11, carH = h * 0.17;
  const glow = ctx.createRadialGradient(w / 2, carY + carH * 0.95, 10, w / 2, carY + carH * 0.95, carW * 0.55);
  glow.addColorStop(0, 'rgba(255,45,150,0.55)');
  glow.addColorStop(1, 'rgba(255,45,150,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(carX - carW * 0.1, carY + carH * 0.4, carW * 1.2, carH * 1.1);
  // body
  const bodyGrad = ctx.createLinearGradient(0, carY, 0, carY + carH);
  bodyGrad.addColorStop(0, '#ff5f6d');
  bodyGrad.addColorStop(0.55, '#d81b60');
  bodyGrad.addColorStop(1, '#7b1042');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(carX, carY + carH * 0.72);
  ctx.quadraticCurveTo(carX + carW * 0.02, carY + carH * 0.3, carX + carW * 0.16, carY + carH * 0.26);
  ctx.quadraticCurveTo(carX + carW * 0.3, carY - carH * 0.28, carX + carW * 0.52, carY - carH * 0.3);
  ctx.quadraticCurveTo(carX + carW * 0.72, carY - carH * 0.28, carX + carW * 0.82, carY + carH * 0.2);
  ctx.quadraticCurveTo(carX + carW * 0.99, carY + carH * 0.3, carX + carW, carY + carH * 0.66);
  ctx.quadraticCurveTo(carX + carW, carY + carH * 0.85, carX + carW * 0.9, carY + carH * 0.86);
  ctx.lineTo(carX + carW * 0.1, carY + carH * 0.86);
  ctx.quadraticCurveTo(carX, carY + carH * 0.85, carX, carY + carH * 0.72);
  ctx.closePath(); ctx.fill();
  // glasshouse
  ctx.fillStyle = 'rgba(16,10,34,0.92)';
  ctx.beginPath();
  ctx.moveTo(carX + carW * 0.33, carY + carH * 0.16);
  ctx.quadraticCurveTo(carX + carW * 0.42, carY - carH * 0.2, carX + carW * 0.55, carY - carH * 0.21);
  ctx.quadraticCurveTo(carX + carW * 0.68, carY - carH * 0.19, carX + carW * 0.76, carY + carH * 0.16);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,190,160,0.5)';
  ctx.fillRect(carX + carW * 0.06, carY + carH * 0.34, carW * 0.86, carH * 0.07);
  // wheels
  for (const fx of [0.2, 0.8]) {
    const wx = carX + carW * fx, wy = carY + carH * 0.86, wr = carH * 0.34;
    ctx.fillStyle = '#0a0616';
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = Math.max(2, carH * 0.045);
    ctx.beginPath(); ctx.arc(wx, wy, wr * 0.55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(wx, wy, wr * 0.14, 0, Math.PI * 2); ctx.fill();
  }
}

export function paintSpeedboat(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#355c7d'], [0.45, '#f8b195'], [0.62, '#f67280'], [1, '#c06c84']]);
  sunDisc(ctx, w * 0.5, h * 0.52, h * 0.11, '#fff1c9', 'rgba(255,170,90,0.5)');
  // sea
  const sea = ctx.createLinearGradient(0, h * 0.58, 0, h);
  sea.addColorStop(0, '#2a9d8f');
  sea.addColorStop(0.3, '#1d6f77');
  sea.addColorStop(1, '#0b3550');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);
  const rand = mulberry32(4404);
  ctx.strokeStyle = 'rgba(255,220,180,0.5)';
  ctx.lineWidth = Math.max(1.5, h * 0.004);
  for (let i = 0; i < 26; i++) {
    const y = h * 0.6 + rand() * h * 0.36;
    const x = rand() * w;
    const len = w * (0.02 + rand() * 0.07) * (0.4 + (y / h));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  // boat
  const bx = w * 0.16, by = h * 0.6, bw = w * 0.68, bh = h * 0.13;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); // wake
  ctx.moveTo(bx + bw * 0.05, by + bh * 0.75);
  ctx.lineTo(bx - w * 0.13, by + bh * 1.5);
  ctx.lineTo(bx + bw * 0.4, by + bh * 1.05);
  ctx.closePath(); ctx.fill();
  const hull = ctx.createLinearGradient(0, by, 0, by + bh);
  hull.addColorStop(0, '#ffffff');
  hull.addColorStop(0.5, '#ffd166');
  hull.addColorStop(1, '#ef476f');
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(bx, by + bh * 0.25);
  ctx.lineTo(bx + bw * 0.88, by + bh * 0.18);
  ctx.quadraticCurveTo(bx + bw * 1.02, by + bh * 0.22, bx + bw * 0.94, by + bh * 0.62);
  ctx.lineTo(bx + bw * 0.72, by + bh);
  ctx.lineTo(bx + bw * 0.16, by + bh);
  ctx.quadraticCurveTo(bx - bw * 0.03, by + bh * 0.6, bx, by + bh * 0.25);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#123';
  ctx.beginPath(); // windshield
  ctx.moveTo(bx + bw * 0.52, by + bh * 0.16);
  ctx.lineTo(bx + bw * 0.66, by - bh * 0.28);
  ctx.lineTo(bx + bw * 0.78, by + bh * 0.14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e2438';
  ctx.fillRect(bx + bw * 0.18, by - bh * 0.3, bw * 0.2, bh * 0.42); // driver silhouette block
}

export function paintHelicopter(ctx, w, h) {
  const rand = mulberry32(5505);
  skyGradient(ctx, w, h, [[0, '#050914'], [0.6, '#14213d'], [1, '#3a506b']]);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 70; i++) {
    ctx.fillRect(rand() * w, rand() * h * 0.55, 1.6, 1.6);
  }
  skylineRow(ctx, w, h * 0.96, h * 0.34, '#070b18', 'rgba(140,220,255,0.85)', rand, 0.4);
  // searchlight beam
  const hx = w * 0.62, hy = h * 0.3;
  const beam = ctx.createLinearGradient(hx, hy, w * 0.4, h * 0.96);
  beam.addColorStop(0, 'rgba(255,244,190,0.5)');
  beam.addColorStop(1, 'rgba(255,244,190,0.02)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(hx - w * 0.012, hy + h * 0.05);
  ctx.lineTo(hx + w * 0.012, hy + h * 0.05);
  ctx.lineTo(w * 0.52, h * 0.96);
  ctx.lineTo(w * 0.28, h * 0.96);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,244,190,0.35)';
  ctx.beginPath(); ctx.ellipse(w * 0.4, h * 0.955, w * 0.13, h * 0.016, 0, 0, Math.PI * 2); ctx.fill();
  // helicopter silhouette
  ctx.fillStyle = '#04060d';
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(-0.06);
  ctx.beginPath(); // body
  ctx.ellipse(0, 0, w * 0.085, h * 0.052, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-w * 0.02, -h * 0.012, -w * 0.21, h * 0.02); // tail boom
  ctx.beginPath(); // tail fin
  ctx.moveTo(-w * 0.225, -h * 0.045); ctx.lineTo(-w * 0.2, h * 0.028); ctx.lineTo(-w * 0.245, h * 0.03); ctx.closePath(); ctx.fill();
  ctx.fillRect(-w * 0.13, -h * 0.075, w * 0.26, h * 0.012); // main rotor
  ctx.fillRect(-w * 0.012, -h * 0.075, w * 0.02, h * 0.03); // mast
  ctx.fillRect(-w * 0.05, h * 0.062, w * 0.1, h * 0.01); // skid strut shadow
  ctx.beginPath(); // skids
  ctx.moveTo(-w * 0.055, h * 0.085); ctx.lineTo(w * 0.055, h * 0.085); ctx.lineWidth = h * 0.008; ctx.strokeStyle = '#04060d'; ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ff3355';
  ctx.beginPath(); ctx.arc(hx - w * 0.235, hy - h * 0.01, Math.max(2, h * 0.008), 0, Math.PI * 2); ctx.fill();
}

export function paintDecoHotel(ctx, w, h) {
  const rand = mulberry32(6606);
  skyGradient(ctx, w, h, [[0, '#0b0321'], [0.55, '#3b1163'], [0.82, '#c9184a'], [1, '#ff758f']]);
  sunDisc(ctx, w * 0.84, h * 0.34, h * 0.08, '#ffe5ec', 'rgba(255,120,170,0.45)');
  skylineRow(ctx, w, h * 0.98, h * 0.3, '#12042a', 'rgba(255,190,220,0.8)', rand, 0.3);
  // deco tower
  const tw = w * 0.4, tx = w * 0.3, base = h * 0.98, top = h * 0.1;
  const tower = ctx.createLinearGradient(tx, 0, tx + tw, 0);
  tower.addColorStop(0, '#2d1b4e');
  tower.addColorStop(0.5, '#4a2a7a');
  tower.addColorStop(1, '#241243');
  ctx.fillStyle = tower;
  ctx.fillRect(tx + tw * 0.18, top + (base - top) * 0.22, tw * 0.64, (base - top) * 0.78);
  ctx.fillRect(tx + tw * 0.3, top + (base - top) * 0.1, tw * 0.4, (base - top) * 0.9);
  ctx.fillRect(tx + tw * 0.42, top, tw * 0.16, (base - top));
  // neon edge tubes
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = w * 0.03;
  ctx.strokeRect(tx + tw * 0.18, top + (base - top) * 0.22, tw * 0.64, (base - top) * 0.78);
  ctx.strokeStyle = '#19e3ff';
  ctx.shadowColor = '#19e3ff';
  ctx.beginPath();
  ctx.moveTo(tx + tw * 0.5, top);
  ctx.lineTo(tx + tw * 0.5, base);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // windows
  ctx.fillStyle = 'rgba(255,214,150,0.95)';
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 4; c++) {
      if (rand() < 0.55) {
        ctx.fillRect(tx + tw * (0.26 + c * 0.13), top + (base - top) * (0.28 + r * 0.055), tw * 0.06, (base - top) * 0.026);
      }
    }
  }
  paintPalmTree(ctx, w * 0.12, h * 1.0, h * 0.52, 0.14, '#0a0218', '#0a0218');
  paintPalmTree(ctx, w * 0.9, h * 1.0, h * 0.6, -0.12, '#0a0218', '#0a0218');
}

export function paintDuoSilhouette(ctx, w, h) {
  skyGradient(ctx, w, h, [[0, '#3a1c71'], [0.5, '#d76d77'], [0.78, '#ffaf7b'], [1, '#ffd194']]);
  sunDisc(ctx, w * 0.5, h * 0.52, h * 0.17, '#fff3b0', 'rgba(255,150,80,0.55)');
  const rand = mulberry32(7707);
  cloudBands(ctx, w, h, rand, 'rgba(90,30,80,0.35)', 5, h * 0.05, h * 0.3);
  ctx.fillStyle = '#20082e';
  ctx.fillRect(0, h * 0.9, w, h * 0.1);
  paintPalmTree(ctx, w * 0.05, h * 0.92, h * 0.62, 0.14, '#1c0729', '#1c0729');
  paintPalmTree(ctx, w * 0.97, h * 0.92, h * 0.7, -0.14, '#1c0729', '#1c0729');
  const ink = '#1a0526';
  const rim = 'rgba(255,170,90,0.85)';
  // woman (left): curly hair mass, sunglasses bar, hoop earring, shoulders
  const wx = w * 0.36, wy = h * 0.46, wr = w * 0.115;
  ctx.fillStyle = ink;
  ctx.beginPath(); ctx.arc(wx, wy, wr * 1.18, 0, Math.PI * 2); ctx.fill(); // hair mass
  ctx.beginPath(); // face
  ctx.ellipse(wx + wr * 0.16, wy + wr * 0.08, wr * 0.72, wr * 0.86, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); // neck + shoulders + torso
  ctx.moveTo(wx - wr * 0.28, wy + wr * 0.72);
  ctx.lineTo(wx + wr * 0.44, wy + wr * 0.72);
  ctx.lineTo(wx + wr * 0.95, h * 0.92);
  ctx.lineTo(wx - wr * 1.05, h * 0.92);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a0212'; // sunglasses
  ctx.beginPath();
  ctx.roundRect(wx - wr * 0.28, wy - wr * 0.16, wr * 1.05, wr * 0.3, wr * 0.12);
  ctx.fill();
  ctx.strokeStyle = rim; // rim light on hair edge
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.beginPath(); ctx.arc(wx, wy, wr * 1.18, -0.7, 0.9); ctx.stroke();
  ctx.strokeStyle = '#ffd166'; // hoop earring
  ctx.lineWidth = Math.max(2, w * 0.005);
  ctx.beginPath(); ctx.arc(wx - wr * 0.52, wy + wr * 0.52, wr * 0.16, 0, Math.PI * 2); ctx.stroke();
  // man (right): short hair, jaw, open shirt V, gold chain
  const mx = w * 0.65, my = h * 0.44, mr = w * 0.105;
  ctx.fillStyle = ink;
  ctx.beginPath(); // head
  ctx.ellipse(mx, my, mr * 0.78, mr * 0.95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); // hair cap
  ctx.ellipse(mx, my - mr * 0.42, mr * 0.8, mr * 0.5, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.beginPath(); // shoulders + torso with open-shirt V
  ctx.moveTo(mx - mr * 0.4, my + wr * 0.62);
  ctx.lineTo(mx + mr * 0.42, my + wr * 0.62);
  ctx.lineTo(mx + mr * 1.15, h * 0.92);
  ctx.lineTo(mx - mr * 1.25, h * 0.92);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd194'; // chest V catching the sunset
  ctx.beginPath();
  ctx.moveTo(mx - mr * 0.3, my + wr * 0.66);
  ctx.lineTo(mx + mr * 0.32, my + wr * 0.66);
  ctx.lineTo(mx, my + wr * 1.25);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffd166'; // gold chain
  ctx.lineWidth = Math.max(2.5, w * 0.007);
  ctx.beginPath(); ctx.arc(mx, my + wr * 0.6, mr * 0.42, 0.25, Math.PI - 0.25); ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(mx, my + wr * 0.6 + mr * 0.42, w * 0.008, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.beginPath(); ctx.arc(mx, my, mr * 0.82, -1.2, 0.4); ctx.stroke();
}

export function paintNeonStreet(ctx, w, h) {
  const rand = mulberry32(8808);
  skyGradient(ctx, w, h, [[0, '#03071e'], [0.7, '#0d1b3e'], [1, '#123a5e']]);
  // buildings
  ctx.fillStyle = '#060b21';
  ctx.fillRect(0, 0, w * 0.3, h * 0.78);
  ctx.fillRect(w * 0.72, 0, w * 0.28, h * 0.78);
  // neon signs (glowing tubes, no words)
  const signs = [
    [0.045, 0.1, 0.2, 0.05, '#ff2e88'], [0.06, 0.24, 0.16, 0.045, '#19e3ff'],
    [0.76, 0.14, 0.18, 0.05, '#ffb300'], [0.79, 0.28, 0.13, 0.045, '#7cff4f'],
  ];
  for (const [sx, sy, sw, sh, color] of signs) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, h * 0.008);
    ctx.shadowColor = color;
    ctx.shadowBlur = h * 0.05;
    ctx.strokeRect(w * sx, h * sy, w * sw, h * sh);
  }
  ctx.shadowBlur = 0;
  // wet street with reflections
  const street = ctx.createLinearGradient(0, h * 0.78, 0, h);
  street.addColorStop(0, '#0a1230');
  street.addColorStop(1, '#164e63');
  ctx.fillStyle = street;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  for (let i = 0; i < 34; i++) {
    const y = h * 0.79 + rand() * h * 0.19;
    const x = rand() * w;
    const len = w * (0.015 + rand() * 0.06);
    ctx.fillStyle = ['rgba(255,46,136,0.5)', 'rgba(25,227,255,0.5)', 'rgba(255,179,0,0.45)'][i % 3];
    ctx.fillRect(x, y, len, Math.max(1.2, h * 0.003));
  }
  paintPalmTree(ctx, w * 0.36, h * 0.8, h * 0.42, 0.08, '#04060f', '#04060f');
}

export const SCENES = {
  duo: { label: 'The Duo (painted)', paint: paintDuoSilhouette },
  palms: { label: 'Sunset Palms', paint: paintSunsetPalms },
  skyline: { label: 'Skyline Dusk', paint: paintSkylineDusk },
  car: { label: 'Sports Car', paint: paintSportsCar },
  boat: { label: 'Speedboat', paint: paintSpeedboat },
  heli: { label: 'Police Helicopter', paint: paintHelicopter },
  hotel: { label: 'Deco Hotel', paint: paintDecoHotel },
  neon: { label: 'Neon Street', paint: paintNeonStreet },
};
