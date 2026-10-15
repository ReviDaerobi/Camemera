// Mesin penggabung foto + template ke satu gambar (Canvas). Semua jalan di browser.
import { STICKER_SETS, loadIcon } from './stickers.js';
import { TEMPLATE_PRESETS } from '../templates.config.js';

export { STICKER_SETS };

export const LAYOUTS = {
  split: { id: 'split', name: 'Aku × Meme', desc: 'Foto kamu di kiri, meme di kanan', W: 1600, H: 900, shots: 1 },
  trio: { id: 'trio', name: 'Aku × 3 Meme', desc: '3 foto di kiri, 3 meme di kanan (berpasangan)', W: 1480, H: 1760, shots: 3 },
  strip: { id: 'strip', name: 'Photo strip', desc: '4 pose berurutan ke bawah', W: 600, H: 1800, shots: 4 },
  polaroid: { id: 'polaroid', name: 'Polaroid', desc: '1 foto dengan tulisan tangan', W: 900, H: 1100, shots: 1 },
  grid: { id: 'grid', name: 'Kotak 2×2', desc: '4 pose dalam satu kartu', W: 1160, H: 1400, shots: 4 },
};

// Daftar template ada di src/templates.config.js
export const THEMES = TEMPLATE_PRESETS;

export const FILTERS = {
  normal: { name: 'Normal', css: 'none' },
  warm: { name: 'Hangat', css: 'saturate(1.25) sepia(0.18) brightness(1.05)' },
  soft: { name: 'Lembut', css: 'brightness(1.1) contrast(0.92) saturate(1.1)' },
  bw: { name: 'Hitam putih', css: 'grayscale(1) contrast(1.1)' },
};

// Posisi tiap elemen per layout. Stiker: [x, y, ukuran, rotasi(derajat)]
function getSlots(id) {
  switch (id) {
    case 'split':
      return {
        photos: [{ x: 60, y: 60, w: 700, h: 640 }],
        memes: [{ x: 840, y: 60, w: 700, h: 640 }],
        caption: { x: 800, y: 790 },
        stickers: [[50, 50, 100, -15], [780, 60, 84, 10], [1555, 70, 100, 15], [55, 700, 88, -10], [1545, 705, 100, 12], [800, 640, 80, -6]],
      };
    case 'trio': {
      const rows = [0, 1, 2].map((i) => 60 + i * 510);
      return {
        photos: rows.map((y) => ({ x: 60, y, w: 640, h: 480 })),
        memes: rows.map((y) => ({ x: 780, y, w: 640, h: 480 })),
        caption: { x: 740, y: 1665 },
        stickers: [[46, 46, 100, -15], [740, 40, 84, 10], [1434, 50, 100, 15], [740, 555, 76, -8], [740, 1065, 76, 6], [48, 1550, 90, -10], [1436, 1552, 100, 12]],
      };
    }
    case 'strip':
      return {
        photos: [0, 1, 2, 3].map((i) => ({ x: 40, y: 50 + i * 394, w: 520, h: 370 })),
        caption: { x: 300, y: 1710 },
        stickers: [[36, 44, 84, -15], [566, 430, 84, 12], [38, 824, 84, -10], [566, 1218, 84, 10], [300, 1640, 70, 0], [560, 40, 70, 14]],
      };
    case 'polaroid':
      return {
        card: { x: 30, y: 30, w: 840, h: 1040 },
        photos: [{ x: 70, y: 70, w: 760, h: 760 }],
        caption: { x: 450, y: 930 },
        stickers: [[44, 44, 104, -15], [866, 60, 92, 15], [856, 990, 100, 12], [50, 1010, 92, -10], [450, 60, 70, 0], [90, 840, 76, 8]],
      };
    default: // grid
      return {
        photos: [
          { x: 60, y: 60, w: 500, h: 500 },
          { x: 600, y: 60, w: 500, h: 500 },
          { x: 60, y: 600, w: 500, h: 500 },
          { x: 600, y: 600, w: 500, h: 500 },
        ],
        caption: { x: 580, y: 1250 },
        stickers: [[44, 44, 92, -15], [1116, 50, 92, 15], [580, 580, 92, 0], [50, 1118, 92, -10], [1118, 1126, 92, 12], [580, 60, 70, 4]],
      };
  }
}

// Daftar stiker awal (bisa digeser di preview). Koordinat dalam piksel canvas.
export function defaultStickers(layoutId, setId) {
  const set = STICKER_SETS[setId] || STICKER_SETS.cute;
  if (!set.items.length) return [];
  const L = LAYOUTS[layoutId];
  return getSlots(layoutId).stickers.map(([x, y, base, rot], i) => {
    const size = Math.round(base * 1.45);
    const m = size / 2 + 8; // jaga supaya stiker tidak terpotong tepi gambar
    return {
      id: `s${i}-${Date.now()}`,
      icon: set.items[i % set.items.length],
      x: Math.min(L.W - m, Math.max(m, x)),
      y: Math.min(L.H - m, Math.max(m, y)),
      size, rot,
    };
  });
}

// Stiker paling atas yang kena titik (x, y). minR = radius sentuh minimum (piksel canvas)
// supaya stiker kecil tetap mudah disentuh di layar HP.
export function hitSticker(stickers, x, y, minR = 0) {
  for (let i = stickers.length - 1; i >= 0; i--) {
    const st = stickers[i];
    if (Math.hypot(x - st.x, y - st.y) <= Math.max(st.size * 0.55, minR)) return st;
  }
  return null;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrapText(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBackground(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, t.bg1);
  g.addColorStop(1, t.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  if (t.pattern === 'dots') {
    for (let y = 20; y < H; y += 44) {
      for (let x = ((y / 44) % 2) * 22 + 12; x < W; x += 44) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (t.pattern === 'stripes') {
    ctx.lineWidth = 14;
    for (let i = -H; i < W; i += 56) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function popFrame(ctx, x, y, w, h, r, ink, drawInside, plain = false) {
  if (plain) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    drawInside();
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.fillStyle = ink;
  rr(ctx, x + 10, y + 10, w, h, r);
  ctx.fill();
  ctx.restore();

  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  drawInside();
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = ink;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

function drawPlaceholder(ctx, s, t, index, total, camImg) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = t.accent;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.globalAlpha = 1;
  const size = Math.min(s.w, s.h) * 0.34;
  if (camImg) ctx.drawImage(camImg, s.x + (s.w - size) / 2, s.y + s.h / 2 - size * 0.85, size, size);
  ctx.fillStyle = t.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.min(s.w, s.h) * 0.075}px Fredoka, sans-serif`;
  ctx.fillText(total > 1 ? `Pose ${index + 1}` : 'Foto kamu', s.x + s.w / 2, s.y + s.h / 2 + s.h * 0.2);
}

// ---------- MEME ----------
export const MEME_TEMPLATES = [
  { id: 'cat', name: 'Kucing kaget', fields: ['Teks atas', 'Teks bawah'], defaults: ['PAS LIHAT JAM', 'KOK UDAH SIANG'] },
  { id: 'buttons', name: 'Dua tombol', fields: ['Pilihan A', 'Pilihan B'], defaults: ['Rebahan lagi', 'Ngerjain tugas'] },
  { id: 'approve', name: 'Tolak & terima', fields: ['Yang ditolak', 'Yang disukai'], defaults: ['Tidur cukup 8 jam', 'Begadang scroll HP'] },
  { id: 'news', name: 'Breaking news', fields: ['Judul berita', 'Teks berjalan'], defaults: ['ES TEH TERNYATA KEBUTUHAN POKOK', 'Warga setuju, dompet tidak'] },
];

// Teks gaya meme klasik (putih, garis tepi), maksimal 3 baris
function memeText(ctx, text, cx, y, maxW, px, baseline, ink) {
  const t = String(text || '').toUpperCase().trim();
  if (!t) return;
  ctx.save();
  ctx.font = `${px}px Anton, Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  ctx.lineWidth = px * 0.18;
  ctx.strokeStyle = ink;
  ctx.fillStyle = '#fff';
  const lines = wrapText(ctx, t, maxW).slice(0, 3);
  const lh = px * 1.1;
  lines.forEach((ln, i) => {
    const yy = baseline === 'top' ? y + i * lh : y - (lines.length - 1 - i) * lh;
    ctx.strokeText(ln, cx, yy);
    ctx.fillText(ln, cx, yy);
  });
  ctx.restore();
}

// Teks yang otomatis mengecil sampai muat di kotak
function fitText(ctx, text, x, y, w, h, o = {}) {
  const t = String(text || '').trim();
  if (!t) return;
  const family = o.family || 'Fredoka, sans-serif';
  const weight = o.weight || '700';
  let px = o.maxPx || 80;
  let lines = [];
  for (; px >= (o.minPx || 14); px -= 2) {
    ctx.font = `${weight} ${px}px ${family}`;
    lines = wrapText(ctx, t, w);
    if (lines.length * px * 1.15 <= h && lines.every((l) => ctx.measureText(l).width <= w)) break;
  }
  ctx.save();
  ctx.fillStyle = o.color || '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lh = px * 1.15;
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x + w / 2, top + i * lh));
  ctx.restore();
}

// Wajah kartun untuk template meme (digambar sendiri, bukan emoji)
function drawFace(ctx, cx, cy, r, mood, ink, fill = '#FFD84D') {
  ctx.save();
  ctx.lineWidth = Math.max(4, r * 0.07);
  ctx.strokeStyle = ink;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const ex = r * 0.36;
  const ey = -r * 0.12;
  const line = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(cx + x1, cy + y1);
    ctx.lineTo(cx + x2, cy + y2);
    ctx.stroke();
  };
  const dot = (x, y, rad, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + x, cy + y, rad, 0, Math.PI * 2);
    ctx.fill();
  };
  const bigEye = (x, rad) => {
    dot(x, ey, rad, '#fff');
    ctx.beginPath();
    ctx.arc(cx + x, cy + ey, rad, 0, Math.PI * 2);
    ctx.stroke();
    dot(x, ey, rad * 0.38, ink);
  };

  if (mood === 'shock') {
    bigEye(-ex, r * 0.2);
    bigEye(ex, r * 0.2);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 0.16, r * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();
    line(-ex - r * 0.16, ey - r * 0.34, -ex + r * 0.16, ey - r * 0.42);
    line(ex - r * 0.16, ey - r * 0.42, ex + r * 0.16, ey - r * 0.34);
  } else if (mood === 'sad') {
    dot(-ex, ey, r * 0.09, ink);
    dot(ex, ey, r * 0.09, ink);
    line(-ex - r * 0.16, ey - r * 0.26, -ex + r * 0.16, ey - r * 0.38);
    line(ex + r * 0.16, ey - r * 0.26, ex - r * 0.16, ey - r * 0.38);
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.68, r * 0.27, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    dot(ex + r * 0.04, ey + r * 0.34, r * 0.07, '#6CC8FF');
  } else if (mood === 'smug') {
    line(-ex - r * 0.15, ey, -ex + r * 0.15, ey);
    line(ex - r * 0.15, ey, ex + r * 0.15, ey);
    line(ex - r * 0.2, ey - r * 0.3, ex + r * 0.18, ey - r * 0.42);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.3, cy + r * 0.4);
    ctx.quadraticCurveTo(cx + r * 0.1, cy + r * 0.66, cx + r * 0.4, cy + r * 0.26);
    ctx.stroke();
  } else if (mood === 'sweat') {
    dot(-ex, ey, r * 0.09, ink);
    dot(ex, ey, r * 0.09, ink);
    line(-ex - r * 0.16, ey - r * 0.36, -ex + r * 0.16, ey - r * 0.26);
    line(ex + r * 0.16, ey - r * 0.36, ex - r * 0.16, ey - r * 0.26);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.32, cy + r * 0.48);
    ctx.quadraticCurveTo(cx - r * 0.16, cy + r * 0.36, cx, cy + r * 0.48);
    ctx.quadraticCurveTo(cx + r * 0.16, cy + r * 0.6, cx + r * 0.32, cy + r * 0.46);
    ctx.stroke();
    ctx.fillStyle = '#6CC8FF';
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.62, cy - r * 0.5);
    ctx.quadraticCurveTo(cx + r * 0.8, cy - r * 0.2, cx + r * 0.62, cy - r * 0.12);
    ctx.quadraticCurveTo(cx + r * 0.44, cy - r * 0.2, cx + r * 0.62, cy - r * 0.5);
    ctx.fill();
    ctx.stroke();
  } else {
    // happy
    [-ex, ex].forEach((x) => {
      ctx.beginPath();
      ctx.arc(cx + x, cy + ey + r * 0.06, r * 0.12, Math.PI, 0);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.1, r * 0.5, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTemplate(ctx, s, t, meme) {
  const u = Math.min(s.w, s.h);
  const tx = meme.texts || [];
  const pad = u * 0.06;
  if (meme.tpl === 'buttons') {
    ctx.fillStyle = '#F3F0FF';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    const gap = s.w * 0.05;
    const bw = (s.w - pad * 2 - gap) / 2;
    const bh = s.h * 0.4;
    const by = s.y + s.h * 0.09;
    [['#FF5C7A', '#C93352', tx[0]], ['#4FB0FF', '#2B7FCC', tx[1]]].forEach(([c, d, label], i) => {
      const bx = s.x + pad + i * (bw + gap);
      ctx.fillStyle = d;
      rr(ctx, bx, by + bh * 0.08, bw, bh, bh * 0.2);
      ctx.fill();
      ctx.fillStyle = c;
      rr(ctx, bx, by, bw, bh, bh * 0.2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = t.ink;
      rr(ctx, bx, by, bw, bh, bh * 0.2);
      ctx.stroke();
      fitText(ctx, label, bx + bw * 0.08, by + bh * 0.08, bw * 0.84, bh * 0.84, { maxPx: u * 0.1 });
    });
    drawFace(ctx, s.x + s.w / 2, s.y + s.h * 0.77, s.h * 0.17, 'sweat', t.ink);
  } else if (meme.tpl === 'approve') {
    const rh = s.h / 2;
    [['#FFD3C4', 'sad', tx[0]], ['#CFF7E7', 'smug', tx[1]]].forEach(([bg, mood, label], i) => {
      const ry = s.y + i * rh;
      ctx.fillStyle = bg;
      ctx.fillRect(s.x, ry, s.w, rh);
      ctx.fillStyle = i === 0 ? '#FFB199' : '#9CE9CC';
      ctx.fillRect(s.x, ry, rh, rh);
      drawFace(ctx, s.x + rh / 2, ry + rh / 2, rh * 0.32, mood, t.ink);
      fitText(ctx, label, s.x + rh + pad * 0.6, ry + pad * 0.5, s.w - rh - pad * 1.4, rh - pad, { color: t.ink, maxPx: rh * 0.3 });
    });
    ctx.lineWidth = 5;
    ctx.strokeStyle = t.ink;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + rh);
    ctx.lineTo(s.x + s.w, s.y + rh);
    ctx.stroke();
  } else if (meme.tpl === 'news') {
    const g = ctx.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h);
    g.addColorStop(0, '#1B2A6B');
    g.addColorStop(1, '#2B1B5A');
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    const lw = Math.min(s.w * 0.4, u * 0.8);
    ctx.fillStyle = '#FF3B5C';
    rr(ctx, s.x + pad, s.y + s.h * 0.07, lw, s.h * 0.13, s.h * 0.03);
    ctx.fill();
    fitText(ctx, 'BREAKING', s.x + pad, s.y + s.h * 0.07, lw, s.h * 0.13, { family: 'Anton, Impact, sans-serif', weight: '400', maxPx: u * 0.09, color: '#fff' });
    fitText(ctx, tx[0], s.x + pad, s.y + s.h * 0.25, s.w - pad * 2, s.h * 0.48, { maxPx: u * 0.15, color: '#fff' });
    ctx.fillStyle = '#FFD84D';
    ctx.fillRect(s.x, s.y + s.h * 0.78, s.w, s.h * 0.22);
    fitText(ctx, tx[1], s.x + pad, s.y + s.h * 0.78, s.w - pad * 2, s.h * 0.22, { maxPx: u * 0.09, color: t.ink });
  } else {
    // cat (kucing kaget)
    const g = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h / 2, 20, s.x + s.w / 2, s.y + s.h / 2, s.w * 0.8);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, t.accent);
    g.addColorStop(1, t.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h * 0.52;
    const r = u * 0.3;
    ctx.save();
    ctx.lineWidth = Math.max(4, r * 0.07);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = t.ink;
    ctx.fillStyle = '#FFC38A';
    [[-1], [1]].forEach(([d]) => {
      ctx.beginPath();
      ctx.moveTo(cx + d * r * 0.95, cy - r * 0.15);
      ctx.lineTo(cx + d * r * 0.85, cy - r * 1.25);
      ctx.lineTo(cx + d * r * 0.2, cy - r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
    drawFace(ctx, cx, cy, r, 'shock', t.ink, '#FFC38A');
    ctx.save();
    ctx.lineWidth = Math.max(3, r * 0.04);
    ctx.strokeStyle = t.ink;
    [[-1], [1]].forEach(([d]) => {
      [0.22, 0.4].forEach((dy) => {
        ctx.beginPath();
        ctx.moveTo(cx + d * r * 0.65, cy + r * dy);
        ctx.lineTo(cx + d * r * 1.25, cy + r * (dy - 0.06 + (dy > 0.3 ? 0.14 : -0.02)));
        ctx.stroke();
      });
    });
    ctx.restore();
    memeText(ctx, tx[0], s.x + s.w / 2, s.y + u * 0.045, s.w - u * 0.11, u * 0.106, 'top', t.ink);
    memeText(ctx, tx[1], s.x + s.w / 2, s.y + s.h - u * 0.045, s.w - u * 0.11, u * 0.106, 'bottom', t.ink);
  }
}

function drawMeme(ctx, s, t, meme, memeImg, plain) {
  const m = meme || {};
  const u = Math.min(s.w, s.h);
  popFrame(ctx, s.x, s.y, s.w, s.h, 36, t.ink, () => {
    if (m.kind === 'template') {
      drawTemplate(ctx, s, t, m);
    } else if (m.kind === 'upload') {
      if (memeImg) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        drawCover(ctx, memeImg, s.x, s.y, s.w, s.h);
        memeText(ctx, m.capTop, s.x + s.w / 2, s.y + u * 0.045, s.w - u * 0.11, u * 0.106, 'top', t.ink);
        memeText(ctx, m.capBottom, s.x + s.w / 2, s.y + s.h - u * 0.045, s.w - u * 0.11, u * 0.106, 'bottom', t.ink);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = t.accent;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.globalAlpha = 1;
        fitText(ctx, 'Upload foto meme', s.x + u * 0.1, s.y, s.w - u * 0.2, s.h, { color: t.ink, maxPx: u * 0.09 });
      }
    } else {
      // emoji + teks
      const g = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h / 2, 30, s.x + s.w / 2, s.y + s.h / 2, s.w * 0.8);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, t.accent);
      g.addColorStop(1, t.bg2);
      ctx.fillStyle = g;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${u * 0.5}px serif`;
      ctx.fillStyle = '#000';
      ctx.fillText(m.emoji || '😂', s.x + s.w / 2, s.y + s.h / 2 + 4);
      memeText(ctx, m.top, s.x + s.w / 2, s.y + u * 0.045, s.w - u * 0.11, u * 0.106, 'top', t.ink);
      memeText(ctx, m.bottom, s.x + s.w / 2, s.y + s.h - u * 0.045, s.w - u * 0.11, u * 0.106, 'bottom', t.ink);
    }
  }, plain);
}

function drawSticker(ctx, img, x, y, size, rot) {
  if (!img) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Gambar hasil akhir ke canvas.
 * opts: { layout, theme, photos:[Image|null], memes:[{kind,emoji,top,bottom,tpl,texts,capTop,capBottom}], memeImgs:[Image|null], caption, showDate, stickers, ... }
 */
export async function renderBooth(canvas, opts) {
  const L = LAYOUTS[opts.layout];
  const t = opts.theme;
  const slots = getSlots(opts.layout);
  canvas.width = L.W;
  canvas.height = L.H;
  const ctx = canvas.getContext('2d');

  try {
    await Promise.all([
      document.fonts.load('700 40px Fredoka'),
      document.fonts.load('40px Anton'),
      document.fonts.load('700 40px Caveat'),
    ]);
  } catch {
    /* font gagal dimuat: pakai font cadangan */
  }

  const iconIds = [...new Set((opts.stickers || []).map((st) => st.icon))];
  const [camImg, ...stickerImgs] = await Promise.all(['camera', ...iconIds].map((id) => loadIcon(id, t.ink)));
  const iconMap = Object.fromEntries(iconIds.map((id, i) => [id, stickerImgs[i]]));

  drawBackground(ctx, L.W, L.H, t);
  const plain = !!opts.plainPhotos;
  if (opts.frameImg && opts.frameMode === 'under') ctx.drawImage(opts.frameImg, 0, 0, L.W, L.H);

  if (slots.card) {
    const c = slots.card;
    ctx.save();
    ctx.fillStyle = t.ink;
    rr(ctx, c.x + 10, c.y + 10, c.w, c.h, 28);
    ctx.fill();
    ctx.fillStyle = '#fffdf9';
    rr(ctx, c.x, c.y, c.w, c.h, 28);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = t.ink;
    ctx.stroke();
    ctx.restore();
  }

  slots.photos.forEach((s, i) => {
    const img = opts.photos[i];
    const radius = opts.layout === 'polaroid' ? 14 : 28;
    popFrame(ctx, s.x, s.y, s.w, s.h, radius, t.ink, () => {
      if (img) drawCover(ctx, img, s.x, s.y, s.w, s.h);
      else drawPlaceholder(ctx, s, t, i, slots.photos.length, camImg);
    }, plain);
  });

  if (slots.memes) {
    slots.memes.forEach((rect, i) => drawMeme(ctx, rect, t, (opts.memes || [])[i], (opts.memeImgs || [])[i], plain));
  }

  // Frame buatan sendiri (di atas foto)
  if (opts.frameImg && opts.frameMode !== 'under') ctx.drawImage(opts.frameImg, 0, 0, L.W, L.H);

  if (slots.memes) {
    // lencana "×" di antara tiap pasangan foto dan meme
    slots.memes.forEach((m, i) => {
      const ph = slots.photos[Math.min(i, slots.photos.length - 1)];
      const bx = (ph.x + ph.w + m.x) / 2;
      const by = ph.y + ph.h / 2;
      const br = Math.min(52, (m.x - ph.x - ph.w) * 0.7);
      ctx.save();
      ctx.fillStyle = t.ink;
      ctx.beginPath();
      ctx.arc(bx + 5, by + 5, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD84D';
      ctx.strokeStyle = t.ink;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = t.ink;
      ctx.font = `700 ${Math.round(br * 1.35)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('×', bx, by + br * 0.08);
      ctx.restore();
    });
  }

  // Stiker
  (opts.stickers || []).forEach((st) => drawSticker(ctx, iconMap[st.icon], st.x, st.y, st.size, st.rot));
  const sel = (opts.stickers || []).find((st) => st.id === opts.selectedId);
  if (sel) {
    ctx.save();
    ctx.translate(sel.x, sel.y);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, sel.size * 0.55 + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = '#FF7EB6';
    ctx.stroke();
    ctx.restore();
  }

  // Teks
  const cap = slots.caption;
  ctx.save();
  ctx.fillStyle = t.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const text = (opts.caption || '').trim();
  const isPolaroid = opts.layout === 'polaroid';
  if (text) {
    ctx.font = isPolaroid ? '700 92px Caveat, cursive' : `700 ${opts.layout === 'strip' ? 52 : 66}px Fredoka, sans-serif`;
    const maxW = L.W - 200;
    let size = parseInt(ctx.font.match(/(\d+)px/)[1], 10);
    while (ctx.measureText(text).width > maxW && size > 24) {
      size -= 4;
      ctx.font = ctx.font.replace(/\d+px/, `${size}px`);
    }
    ctx.fillText(text, cap.x, cap.y);
  }
  if (opts.showDate) {
    ctx.font = '600 30px Fredoka, sans-serif';
    ctx.globalAlpha = 0.75;
    ctx.fillText(formatDate(), cap.x, cap.y + (text ? (isPolaroid ? 70 : 58) : 0));
  }
  ctx.restore();
}

/** Gambar panduan ukuran frame: kotak berwarna menunjukkan posisi foto/meme. */
export function renderGuide(canvas, layoutId) {
  const L = LAYOUTS[layoutId];
  const slots = getSlots(layoutId);
  canvas.width = L.W;
  canvas.height = L.H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, L.W, L.H);
  const box = (s, color, label) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 10]);
    ctx.strokeStyle = '#2B1B5A';
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#2B1B5A';
    ctx.font = '600 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, s.x + s.w / 2, s.y + s.h / 2);
  };
  slots.photos.forEach((s, i) => box(s, '#FFD84D', slots.photos.length > 1 ? `Foto ${i + 1}` : 'Foto'));
  if (slots.memes) slots.memes.forEach((m, i) => box(m, '#6EE7C0', slots.memes.length > 1 ? `Meme ${i + 1}` : 'Meme'));
  ctx.fillStyle = '#2B1B5A';
  ctx.font = '600 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Ukuran ${L.W} × ${L.H} px. Kosongkan (transparan) area kuning/hijau.`, L.W / 2, L.H - 24);
}
