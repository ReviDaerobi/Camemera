// Library ikon stiker (SVG berwarna, gaya stiker dengan garis tebal).
// Dipakai di canvas (hasil foto) dan di UI (palet, dekorasi), jadi tidak ada emoji sistem.
const petals = (cx, cy, r, pr, fill, ink, n = 6) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${pr}" fill="${fill}" stroke="${ink}"/>`;
  }).join('');

const rays = (cx, cy, r1, r2, ink, n = 8) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n;
    return `<line x1="${(cx + r1 * Math.cos(a)).toFixed(1)}" y1="${(cy + r1 * Math.sin(a)).toFixed(1)}" x2="${(cx + r2 * Math.cos(a)).toFixed(1)}" y2="${(cy + r2 * Math.sin(a)).toFixed(1)}" stroke="${ink}" stroke-width="4.5"/>`;
  }).join('');

export const STICKER_ICONS = {
  heart: {
    name: 'Hati',
    svg: (k) => `<path d="M32 56C32 56 7 40 7 23a12.5 12.5 0 0 1 25-4 12.5 12.5 0 0 1 25 4c0 17-25 33-25 33z" fill="#FF7EB6" stroke="${k}"/><path d="M15 22a7 7 0 0 1 6-7" stroke="#fff" stroke-width="3.5"/>`,
  },
  star: {
    name: 'Bintang',
    svg: (k) => `<polygon points="32,5 40,23 59,25 45,38 49,58 32,48 15,58 19,38 5,25 24,23" fill="#FFD84D" stroke="${k}"/>`,
  },
  flower: {
    name: 'Bunga',
    svg: (k) => `${petals(32, 32, 16, 11, '#FF7EB6', k)}<circle cx="32" cy="32" r="10" fill="#FFD84D" stroke="${k}"/>`,
  },
  sparkle: {
    name: 'Kilau',
    svg: (k) => `<path d="M32 4C34 22 42 30 60 32 42 34 34 42 32 60 30 42 22 34 4 32 22 30 30 22 32 4Z" fill="#6CC8FF" stroke="${k}"/>`,
  },
  bow: {
    name: 'Pita',
    svg: (k) => `<path d="M30 32 8 17Q3 32 8 47Z" fill="#FF7EB6" stroke="${k}"/><path d="M34 32 56 17Q61 32 56 47Z" fill="#FF7EB6" stroke="${k}"/><rect x="25" y="24" width="14" height="16" rx="6" fill="#FF4F9A" stroke="${k}"/>`,
  },
  rainbow: {
    name: 'Pelangi',
    svg: (k) => `<g transform="translate(5 8) scale(.85)"><path d="M6 46a26 26 0 0 1 52 0" stroke="${k}" stroke-width="22"/><path d="M6 46a26 26 0 0 1 52 0" stroke="#FF7EB6" stroke-width="16"/><path d="M12 46a20 20 0 0 1 40 0" stroke="#FFD84D" stroke-width="7"/><path d="M18 46a14 14 0 0 1 28 0" stroke="#6EE7C0" stroke-width="7"/><path d="M24 46a8 8 0 0 1 16 0" stroke="#6CC8FF" stroke-width="7"/><circle cx="8" cy="50" r="7" fill="#fff" stroke="${k}"/><circle cx="56" cy="50" r="7" fill="#fff" stroke="${k}"/></g>`,
  },
  donut: {
    name: 'Donat',
    svg: (k) => `<circle cx="32" cy="32" r="25" fill="#FFC38A" stroke="${k}"/><circle cx="32" cy="32" r="21" fill="#FF7EB6" stroke="${k}"/><circle cx="32" cy="32" r="7" fill="#fff" stroke="${k}"/><g stroke-width="3.5"><line x1="18" y1="24" x2="22" y2="27" stroke="#FFD84D"/><line x1="40" y1="16" x2="44" y2="19" stroke="#6EE7C0"/><line x1="46" y1="34" x2="49" y2="38" stroke="#6CC8FF"/><line x1="30" y1="48" x2="34" y2="47" stroke="#FFD84D"/><line x1="16" y1="38" x2="20" y2="40" stroke="#9C8CFF"/><line x1="30" y1="14" x2="34" y2="16" stroke="#fff"/></g>`,
  },
  icecream: {
    name: 'Es krim',
    svg: (k) => `<path d="M19 30h26L32 61Z" fill="#FFC38A" stroke="${k}"/><circle cx="32" cy="22" r="15" fill="#FF7EB6" stroke="${k}"/><path d="M19 30a13 6 0 0 0 26 0" fill="#FF4F9A" stroke="${k}"/><circle cx="32" cy="6" r="4.5" fill="#FF4F6A" stroke="${k}"/>`,
  },
  cherry: {
    name: 'Ceri',
    svg: (k) => `<path d="M20 38C24 24 30 14 38 8M44 40C44 28 42 16 38 8" fill="none" stroke="${k}"/><path d="M38 8c6-4 14-2 18 4-8 4-14 2-18-4Z" fill="#6EE7C0" stroke="${k}"/><circle cx="19" cy="47" r="11" fill="#FF4F6A" stroke="${k}"/><circle cx="44" cy="48" r="11" fill="#FF4F6A" stroke="${k}"/><path d="M14 44a6 6 0 0 1 4-4M39 45a6 6 0 0 1 4-4" stroke="#fff" stroke-width="3"/>`,
  },
  lollipop: {
    name: 'Permen',
    svg: (k) => `<line x1="32" y1="40" x2="32" y2="61" stroke="${k}" stroke-width="5"/><circle cx="32" cy="24" r="20" fill="#FF7EB6" stroke="${k}"/><path d="M32 24a2 2 0 0 1 4 0a6 6 0 0 1-12 0a10 10 0 0 1 20 0a14 14 0 0 1-28 0" stroke="#fff" stroke-width="3.5" fill="none"/>`,
  },
  strawberry: {
    name: 'Stroberi',
    svg: (k) => `<path d="M32 59C16 49 8 33 13 22c4-8 13-8 19-5 6-3 15-3 19 5 5 11-3 27-19 37z" fill="#FF4F6A" stroke="${k}"/><path d="M19 17 32 7l13 10-13 5Z" fill="#6EE7C0" stroke="${k}"/><g fill="#FFE7A0" stroke="none"><ellipse cx="24" cy="32" rx="2" ry="3"/><ellipse cx="38" cy="30" rx="2" ry="3"/><ellipse cx="31" cy="40" rx="2" ry="3"/><ellipse cx="22" cy="43" rx="2" ry="3"/><ellipse cx="40" cy="43" rx="2" ry="3"/><ellipse cx="31" cy="51" rx="2" ry="3"/></g>`,
  },
  cookie: {
    name: 'Kue',
    svg: (k) => `<circle cx="32" cy="32" r="25" fill="#E8B67A" stroke="${k}"/><g fill="#7A4A2A" stroke="none"><circle cx="22" cy="24" r="4"/><circle cx="40" cy="20" r="3.5"/><circle cx="44" cy="38" r="4.5"/><circle cx="26" cy="42" r="3.5"/><circle cx="34" cy="31" r="3"/></g>`,
  },
  rocket: {
    name: 'Roket',
    svg: (k) => `<path d="M22 40 10 52l14-2Z" fill="#FF7EB6" stroke="${k}"/><path d="M42 40l12 12-14-2Z" fill="#FF7EB6" stroke="${k}"/><path d="M26 49 32 61l6-12Z" fill="#FFD84D" stroke="${k}"/><path d="M32 3C45 13 47 31 42 47H22C17 31 19 13 32 3Z" fill="#fff" stroke="${k}"/><circle cx="32" cy="25" r="7" fill="#6CC8FF" stroke="${k}"/>`,
  },
  moon: {
    name: 'Bulan',
    svg: (k) => `<path d="M42 6A27 27 0 1 0 58 44 21 21 0 0 1 42 6Z" fill="#FFD84D" stroke="${k}"/><circle cx="24" cy="38" r="3" fill="#F2B84B" stroke="none"/><circle cx="32" cy="48" r="2.2" fill="#F2B84B" stroke="none"/>`,
  },
  planet: {
    name: 'Planet',
    svg: (k) => `<ellipse cx="32" cy="34" rx="29" ry="9" transform="rotate(-20 32 34)" stroke="${k}" stroke-width="10"/><ellipse cx="32" cy="34" rx="29" ry="9" transform="rotate(-20 32 34)" stroke="#FFD84D" stroke-width="4"/><circle cx="32" cy="32" r="17" fill="#9C8CFF" stroke="${k}"/><path d="M22 26a12 12 0 0 1 8-6" stroke="#fff" stroke-width="3.5"/>`,
  },
  bolt: {
    name: 'Petir',
    svg: (k) => `<path d="M38 3 13 36h16l-5 25 27-35H35Z" fill="#FFD84D" stroke="${k}"/>`,
  },
  smile: {
    name: 'Senyum',
    svg: (k) => `<circle cx="32" cy="32" r="26" fill="#FFD84D" stroke="${k}"/><ellipse cx="23" cy="27" rx="3" ry="4.5" fill="${k}" stroke="none"/><ellipse cx="41" cy="27" rx="3" ry="4.5" fill="${k}" stroke="none"/><path d="M20 38Q32 51 44 38" stroke="${k}" fill="none"/><circle cx="16" cy="38" r="4" fill="#FF7EB6" stroke="none" opacity=".7"/><circle cx="48" cy="38" r="4" fill="#FF7EB6" stroke="none" opacity=".7"/>`,
  },
  crown: {
    name: 'Mahkota',
    svg: (k) => `<path d="M8 50 5 18 22 32 32 12 42 32 59 18 56 50Z" fill="#FFD84D" stroke="${k}"/><circle cx="32" cy="40" r="4" fill="#FF7EB6" stroke="${k}"/><circle cx="17" cy="42" r="3" fill="#6CC8FF" stroke="${k}"/><circle cx="47" cy="42" r="3" fill="#6CC8FF" stroke="${k}"/>`,
  },
  music: {
    name: 'Musik',
    svg: (k) => `<path d="M28 49V15L54 9v34" fill="none" stroke="${k}"/><path d="M28 15 54 9v12l-26 6Z" fill="#FF7EB6" stroke="${k}"/><circle cx="19" cy="49" r="9" fill="#9C8CFF" stroke="${k}"/><circle cx="45" cy="43" r="9" fill="#9C8CFF" stroke="${k}"/>`,
  },
  camera: {
    name: 'Kamera',
    svg: (k) => `<rect x="21" y="9" width="22" height="12" rx="4" fill="#6CC8FF" stroke="${k}"/><rect x="5" y="16" width="54" height="40" rx="9" fill="#6CC8FF" stroke="${k}"/><circle cx="32" cy="37" r="13" fill="#fff" stroke="${k}"/><circle cx="32" cy="37" r="7" fill="#9C8CFF" stroke="${k}"/><circle cx="50" cy="25" r="3" fill="#FFD84D" stroke="none"/>`,
  },
  gift: {
    name: 'Kado',
    svg: (k) => `<rect x="9" y="28" width="46" height="29" rx="4" fill="#FF7EB6" stroke="${k}"/><rect x="6" y="19" width="52" height="12" rx="4" fill="#FF9A5C" stroke="${k}"/><rect x="28" y="19" width="8" height="38" fill="#FFD84D" stroke="${k}"/><path d="M32 19C22 3 9 10 20 19ZM32 19C42 3 55 10 44 19Z" fill="#FFD84D" stroke="${k}"/>`,
  },
  cloud: {
    name: 'Awan',
    svg: (k) => `<g transform="translate(2 8) scale(.5)"><path d="M30 62a22 22 0 0 1-2-43 28 28 0 0 1 52-6 24 24 0 0 1 14 49z" fill="#E6F6FF" stroke="${k}" stroke-width="6"/></g>`,
  },
  sun: {
    name: 'Matahari',
    svg: (k) => `${rays(32, 32, 20, 28, k)}<circle cx="32" cy="32" r="15" fill="#FFD84D" stroke="${k}"/>`,
  },
  butterfly: {
    name: 'Kupu-kupu',
    svg: (k) => `<path d="M30 16 24 6M34 16 40 6" fill="none" stroke="${k}"/><ellipse cx="19" cy="24" rx="15" ry="14" transform="rotate(-25 19 24)" fill="#FF7EB6" stroke="${k}"/><ellipse cx="45" cy="24" rx="15" ry="14" transform="rotate(25 45 24)" fill="#FF7EB6" stroke="${k}"/><ellipse cx="22" cy="46" rx="11" ry="10" transform="rotate(20 22 46)" fill="#9C8CFF" stroke="${k}"/><ellipse cx="42" cy="46" rx="11" ry="10" transform="rotate(-20 42 46)" fill="#9C8CFF" stroke="${k}"/><rect x="29.5" y="14" width="5" height="40" rx="2.5" fill="${k}" stroke="${k}"/>`,
  },
  cat: {
    name: 'Kucing',
    svg: (k) => `<path d="M9 26 11 5l17 11Z" fill="#FFC38A" stroke="${k}"/><path d="M55 26 53 5 36 16Z" fill="#FFC38A" stroke="${k}"/><ellipse cx="32" cy="38" rx="25" ry="20" fill="#FFC38A" stroke="${k}"/><circle cx="22" cy="36" r="3" fill="${k}" stroke="none"/><circle cx="42" cy="36" r="3" fill="${k}" stroke="none"/><path d="M29 43h6l-3 3Z" fill="#FF7EB6" stroke="#FF7EB6" stroke-width="1.5"/><path d="M32 46v3M26 50q3 2 6-1 3 3 6 1" fill="none" stroke="${k}" stroke-width="2.5"/>`,
  },
};

export const STICKER_SETS = {
  cute: { name: 'Imut', items: ['heart', 'flower', 'star', 'bow', 'sparkle', 'rainbow'] },
  food: { name: 'Jajan', items: ['donut', 'icecream', 'cherry', 'lollipop', 'strawberry', 'cookie'] },
  space: { name: 'Luar angkasa', items: ['rocket', 'moon', 'planet', 'star', 'sparkle', 'bolt'] },
  fun: { name: 'Ceria', items: ['smile', 'crown', 'music', 'camera', 'gift', 'butterfly'] },
  none: { name: 'Tanpa stiker', items: [] },
};

const wrap = (inner, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`;

export function iconDataUrl(id, ink = '#2B1B5A') {
  const def = STICKER_ICONS[id];
  if (!def) return '';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wrap(def.svg(ink), ink))}`;
}

const cache = new Map();
/** Muat ikon jadi HTMLImageElement (di-cache per id + warna garis). */
export function loadIcon(id, ink = '#2B1B5A') {
  const key = `${id}|${ink}`;
  if (cache.has(key)) return cache.get(key);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = iconDataUrl(id, ink);
  });
  cache.set(key, p);
  return p;
}
