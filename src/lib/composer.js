// Mesin penggabung foto + template ke satu gambar (Canvas). Semua jalan di browser.

export const LAYOUTS = {
  split: { id: 'split', name: 'Aku × Meme', desc: 'Foto kamu di kiri, meme di kanan', W: 1600, H: 900, shots: 1 },
  strip: { id: 'strip', name: 'Photo strip', desc: '4 pose berurutan ke bawah', W: 600, H: 1800, shots: 4 },
  polaroid: { id: 'polaroid', name: 'Polaroid', desc: '1 foto dengan tulisan tangan', W: 900, H: 1100, shots: 1 },
  grid: { id: 'grid', name: 'Kotak 2×2', desc: '4 pose dalam satu kartu', W: 1160, H: 1400, shots: 4 },
};

export const THEMES = [
  { id: 'bubblegum', name: 'Permen karet', bg1: '#FFB3D6', bg2: '#C9B8FF', accent: '#FF7EB6', ink: '#2B1B5A', pattern: 'dots' },
  { id: 'matcha', name: 'Matcha', bg1: '#B9F3D8', bg2: '#FFF3A8', accent: '#6EE7C0', ink: '#1F3B2E', pattern: 'stripes' },
  { id: 'sunset', name: 'Senja', bg1: '#FFD08A', bg2: '#FF8FB1', accent: '#FF9A5C', ink: '#4A1D3A', pattern: 'dots' },
  { id: 'grape', name: 'Anggur', bg1: '#B7A6FF', bg2: '#7FD6FF', accent: '#9C8CFF', ink: '#241552', pattern: 'stripes' },
  { id: 'ocean', name: 'Laut', bg1: '#A5E3FF', bg2: '#B9F3D8', accent: '#6CC8FF', ink: '#10345A', pattern: 'dots' },
  { id: 'lemon', name: 'Lemon', bg1: '#FFF2A0', bg2: '#FFC6A5', accent: '#FFD84D', ink: '#4A3510', pattern: 'none' },
];

export const STICKER_SETS = {
  cute: { name: 'Imut', items: ['🌸', '⭐', '💖', '🎀', '✨', '🍓'] },
  food: { name: 'Jajan', items: ['🍩', '🧋', '🍒', '🍪', '🍭', '🍓'] },
  space: { name: 'Luar angkasa', items: ['🚀', '🌙', '⭐', '👾', '🪐', '✨'] },
  meme: { name: 'Anak meme', items: ['💀', '🗿', '😭', '🤡', '🔥', '😎'] },
  none: { name: 'Tanpa stiker', items: [] },
};

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
        meme: { x: 840, y: 60, w: 700, h: 640 },
        caption: { x: 800, y: 790 },
        stickers: [[50, 50, 100, -15], [780, 60, 84, 10], [1555, 70, 100, 15], [55, 700, 88, -10], [1545, 705, 100, 12], [800, 640, 80, -6]],
      };
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
  return getSlots(layoutId).stickers.map(([x, y, size, rot], i) => ({
    id: `s${i}-${Date.now()}`,
    emoji: set.items[i % set.items.length],
    x, y, size, rot,
  }));
}

// Stiker paling atas yang kena titik (x, y), atau null
export function hitSticker(stickers, x, y) {
  for (let i = stickers.length - 1; i >= 0; i--) {
    const st = stickers[i];
    if (Math.hypot(x - st.x, y - st.y) <= st.size * 0.62) return st;
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

function drawPlaceholder(ctx, s, t, index, total) {
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = t.accent;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.min(s.w, s.h) * 0.3}px serif`;
  ctx.fillText('📸', s.x + s.w / 2, s.y + s.h / 2 - 14);
  ctx.fillStyle = t.ink;
  ctx.font = `600 ${Math.min(s.w, s.h) * 0.075}px Fredoka, sans-serif`;
  ctx.fillText(total > 1 ? `Pose ${index + 1}` : 'Foto kamu', s.x + s.w / 2, s.y + s.h / 2 + s.h * 0.2);
}

function drawMeme(ctx, s, t, meme, memeImg, plain) {
  popFrame(ctx, s.x, s.y, s.w, s.h, 36, t.ink, () => {
    if (memeImg) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      drawCover(ctx, memeImg, s.x, s.y, s.w, s.h);
    } else {
      const g = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h / 2, 30, s.x + s.w / 2, s.y + s.h / 2, s.w * 0.8);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.55, t.accent);
      g.addColorStop(1, t.bg2);
      ctx.fillStyle = g;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '320px serif';
      ctx.fillStyle = '#000';
      ctx.fillText(meme.emoji || '😂', s.x + s.w / 2, s.y + s.h / 2 + 6);
    }
  }, plain);

  // Teks meme gaya klasik (hanya untuk meme bawaan, bukan gambar upload)
  if (!memeImg) {
    ctx.save();
    ctx.beginPath();
    rr(ctx, s.x, s.y, s.w, s.h, plain ? 0 : 36);
    ctx.clip();
    ctx.font = '68px Anton, Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 12;
    ctx.strokeStyle = t.ink;
    ctx.fillStyle = '#fff';
    const maxW = s.w - 70;
    const top = wrapText(ctx, (meme.top || '').toUpperCase(), maxW).slice(0, 2);
    top.forEach((ln, i) => {
      const y = s.y + 28 + i * 76;
      ctx.strokeText(ln, s.x + s.w / 2, y);
      ctx.fillText(ln, s.x + s.w / 2, y);
    });
    ctx.textBaseline = 'bottom';
    const bottom = wrapText(ctx, (meme.bottom || '').toUpperCase(), maxW).slice(0, 2);
    bottom.forEach((ln, i) => {
      const y = s.y + s.h - 28 - (bottom.length - 1 - i) * 76;
      ctx.strokeText(ln, s.x + s.w / 2, y);
      ctx.fillText(ln, s.x + s.w / 2, y);
    });
    ctx.restore();
  }
}

function drawSticker(ctx, emoji, x, y, size, rot, ink) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = `${size * 0.8}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText(emoji, 0, size * 0.04);
  ctx.restore();
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Gambar hasil akhir ke canvas.
 * opts: { layout, theme, photos:[HTMLImageElement|null], meme:{emoji,top,bottom}, memeImg, caption, showDate, stickerSet }
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
      else drawPlaceholder(ctx, s, t, i, slots.photos.length);
    }, plain);
  });

  if (slots.meme) {
    drawMeme(ctx, slots.meme, t, opts.meme || {}, opts.memeImg, plain);
  }

  // Frame buatan sendiri (di atas foto)
  if (opts.frameImg && opts.frameMode !== 'under') ctx.drawImage(opts.frameImg, 0, 0, L.W, L.H);

  if (slots.meme) {
    // lencana "×" di tengah
    ctx.save();
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.arc(800 + 5, 380 + 5, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD84D';
    ctx.strokeStyle = t.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(800, 380, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = t.ink;
    ctx.font = '700 70px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', 800, 384);
    ctx.restore();
  }

  // Stiker
  (opts.stickers || []).forEach((st) => drawSticker(ctx, st.emoji, st.x, st.y, st.size, st.rot, t.ink));
  const sel = (opts.stickers || []).find((st) => st.id === opts.selectedId);
  if (sel) {
    ctx.save();
    ctx.translate(sel.x, sel.y);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, sel.size * 0.62 + 16, 0, Math.PI * 2);
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
  if (slots.meme) box(slots.meme, '#6EE7C0', 'Meme');
  ctx.fillStyle = '#2B1B5A';
  ctx.font = '600 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Ukuran ${L.W} × ${L.H} px. Kosongkan (transparan) area kuning/hijau.`, L.W / 2, L.H - 24);
}
