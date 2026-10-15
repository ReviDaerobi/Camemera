import { useCallback, useEffect, useRef, useState } from 'react';
import memesData from '../../shared/memes.json';
import { Camera, Dices } from 'lucide-react';
import { FILTERS, LAYOUTS, MEME_TEMPLATES, STICKER_SETS, THEMES, defaultStickers, hitSticker, renderBooth, renderGuide } from '../lib/composer.js';
import { MEME_IMAGES } from '../lib/memeImages.js';
import { STICKER_ICONS } from '../lib/stickers.js';
import { Flower, Sparkle, Star } from './Decor.jsx';
import StickerIcon from './StickerIcon.jsx';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function readFile(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
}

const newMeme = (i = 0) => ({
  kind: 'emoji',
  emoji: memesData[i].emoji,
  top: memesData[i].top,
  bottom: memesData[i].bottom,
  tpl: 'cat',
  texts: [...MEME_TEMPLATES[0].defaults],
  capTop: '',
  capBottom: '',
});
const tplMeme = (id) => ({ ...newMeme(0), kind: 'template', tpl: id, texts: [...MEME_TEMPLATES.find((t) => t.id === id).defaults] });

const MEME_KINDS = [
  { id: 'emoji', label: 'Emoji + teks' },
  { id: 'template', label: 'Template gambar' },
  { id: 'upload', label: 'Gambar meme' },
];

const STORE_KEY = 'cekrek.templates.v1';
function loadSavedTemplates() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'tema', label: 'Tema' },
  { id: 'meme', label: 'Meme' },
  { id: 'stiker', label: 'Stiker' },
  { id: 'frame', label: 'Frame' },
  { id: 'custom', label: 'Custom' },
];


function saveBlob(blob, name) {
  if (!blob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export default function Booth() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const previewRef = useRef(null);
  const renderToken = useRef(0);
  const fileRef = useRef(null);
  const memeFileRef = useRef(null);
  const frameFileRef = useRef(null);
  const dragRef = useRef(null);

  const [layout, setLayout] = useState('split');
  const [theme, setTheme] = useState({ ...THEMES[0] });
  // Satu entri per kotak meme (layout Aku × Meme pakai 1, Aku × 3 Meme pakai 3)
  const [memes, setMemes] = useState(() => [newMeme(0), tplMeme('cat'), tplMeme('approve')]);
  const [memeSlot, setMemeSlot] = useState(0);
  const [memeUrls, setMemeUrls] = useState([null, null, null]);
  const [memeImgs, setMemeImgs] = useState([null, null, null]);
  const [caption, setCaption] = useState('Cekrek bareng!');
  const [showDate, setShowDate] = useState(true);
  const [stickerSet, setStickerSet] = useState('cute');
  const [tab, setTab] = useState('layout');
  const [saved, setSaved] = useState(loadSavedTemplates);
  const [tplName, setTplName] = useState('');
  const [stickers, setStickers] = useState(() => defaultStickers('split', 'cute'));
  const stickersRef = useRef(stickers);
  stickersRef.current = stickers;
  const [selectedId, setSelectedId] = useState(null);
  const [frameUrl, setFrameUrl] = useState(null);
  const [frameImg, setFrameImg] = useState(null);
  const [frameMode, setFrameMode] = useState('over');
  const [plainPhotos, setPlainPhotos] = useState(false);

  const [photos, setPhotos] = useState([null]);
  const [photoImgs, setPhotoImgs] = useState([null]);
  const [timer, setTimer] = useState(3);
  const [filter, setFilter] = useState('normal');
  const [facing, setFacing] = useState('user');
  const [camOn, setCamOn] = useState(false);
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const shots = LAYOUTS[layout].shots;
  const filled = photos.filter(Boolean).length;

  // Pilihan layout dari bagian Template di halaman atas
  useEffect(() => {
    const h = (e) => { setLayout(e.detail); setTab('layout'); };
    window.addEventListener('pick-layout', h);
    return () => window.removeEventListener('pick-layout', h);
  }, []);

  // Stiker diatur ulang saat layout atau set stiker berganti (posisi tiap layout berbeda)
  useEffect(() => {
    setStickers(defaultStickers(layout, stickerSet));
    setSelectedId(null);
  }, [layout, stickerSet]);

  // Hapus stiker terpilih dengan tombol Delete / Backspace
  useEffect(() => {
    const h = (e) => {
      if (!selectedId || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
      setStickers((prev) => prev.filter((st) => st.id !== selectedId));
      setSelectedId(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedId]);

  // Sesuaikan jumlah slot foto saat layout berganti
  useEffect(() => {
    setPhotos((prev) => Array.from({ length: shots }, (_, i) => prev[i] || null));
  }, [shots]);

  // Muat gambar dari data URL
  useEffect(() => {
    let alive = true;
    Promise.all(photos.map(loadImage)).then((imgs) => alive && setPhotoImgs(imgs));
    return () => { alive = false; };
  }, [photos]);

  useEffect(() => {
    let alive = true;
    Promise.all(memeUrls.map(loadImage)).then((imgs) => alive && setMemeImgs(imgs));
    return () => { alive = false; };
  }, [memeUrls]);

  useEffect(() => {
    let alive = true;
    loadImage(frameUrl).then((img) => alive && setFrameImg(img));
    return () => { alive = false; };
  }, [frameUrl]);

  const renderOpts = (sel) => ({
    layout, theme, photos: photoImgs, memes, memeImgs, caption, showDate,
    stickers, selectedId: sel, frameImg, frameMode, plainPhotos,
  });

  // Gambar ulang preview setiap ada perubahan
  useEffect(() => {
    const token = ++renderToken.current;
    const off = document.createElement('canvas');
    renderBooth(off, renderOpts(selectedId)).then(() => {
      if (token !== renderToken.current || !previewRef.current) return;
      const c = previewRef.current;
      c.width = off.width;
      c.height = off.height;
      c.getContext('2d').drawImage(off, 0, 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, theme, photoImgs, memes, memeImgs, caption, showDate, stickers, selectedId, frameImg, frameMode, plainPhotos]);

  // Kamera
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }, []);

  const startCamera = useCallback(async (mode) => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini belum mendukung kamera. Kamu tetap bisa upload foto lewat tombol di bawah.');
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamOn(true);
    } catch {
      setCamOn(false);
      setError('Kamera tidak bisa dibuka. Cek izin kamera di browser (ikon gembok di address bar), atau upload foto saja.');
    }
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const switchCamera = async () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    if (camOn) await startCamera(next);
  };

  const captureFrame = () => {
    const v = videoRef.current;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    ctx.filter = FILTERS[filter].css;
    if (facing === 'user') {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    return c.toDataURL('image/jpeg', 0.92);
  };

  const runSession = async () => {
    if (busy || !camOn) return;
    const empty = photos.map((p, i) => (p ? null : i)).filter((i) => i !== null);
    if (!empty.length) return;
    setBusy(true);
    for (const idx of empty) {
      for (let n = timer; n > 0; n--) {
        setCount(n);
        await sleep(1000);
      }
      setCount(0);
      setFlash(true);
      const data = captureFrame();
      setPhotos((prev) => prev.map((p, i) => (i === idx ? data : p)));
      setTimeout(() => setFlash(false), 350);
      await sleep(800);
    }
    setBusy(false);
  };

  const onUploadPhotos = async (e) => {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    const urls = await Promise.all(files.map(readFile));
    setPhotos((prev) => {
      const next = [...prev];
      for (const url of urls) {
        const slot = next.findIndex((p) => !p);
        if (slot === -1 || !url) break;
        next[slot] = url;
      }
      return next;
    });
  };

  // --- Meme ---
  const memeSlots = layout === 'trio' ? 3 : layout === 'split' ? 1 : 0;
  const slot = Math.min(memeSlot, Math.max(memeSlots - 1, 0));
  const cur = memes[slot];
  const updateMeme = (patch) => setMemes((prev) => prev.map((m, i) => (i === slot ? { ...m, ...patch } : m)));
  const setUrl = (url) => setMemeUrls((prev) => prev.map((u, i) => (i === slot ? url : u)));

  const onUploadMeme = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    const url = await readFile(f);
    if (!url) return;
    setUrl(url);
    updateMeme({ kind: 'upload' });
  };

  const pickEmojiMeme = (i) => {
    const m = memesData[i];
    updateMeme({ kind: 'emoji', emoji: m.emoji, top: m.top, bottom: m.bottom });
  };

  const randomMeme = () => {
    let i = Math.floor(Math.random() * memesData.length);
    if (memesData[i].emoji === cur.emoji && memesData.length > 1) i = (i + 1) % memesData.length;
    pickEmojiMeme(i);
  };

  const pickTemplate = (id) => updateMeme({ kind: 'template', tpl: id, texts: [...MEME_TEMPLATES.find((t) => t.id === id).defaults] });
  const setTemplateText = (idx, val) => updateMeme({ texts: cur.texts.map((t, i) => (i === idx ? val : t)) });

  const download = async () => {
    const c = document.createElement('canvas');
    await renderBooth(c, renderOpts(null)); // tanpa lingkaran seleksi stiker
    c.toBlob((blob) => saveBlob(blob, `cekrek-booth-${Date.now()}.png`), 'image/png');
  };

  const downloadGuide = () => {
    const c = document.createElement('canvas');
    renderGuide(c, layout);
    c.toBlob((blob) => saveBlob(blob, `panduan-frame-${layout}.png`), 'image/png');
  };

  const onUploadFrame = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    setFrameUrl(await readFile(f));
  };

  // Stiker: tambah, ubah, geser
  const addSticker = (icon) => {
    const L = LAYOUTS[layout];
    const st = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      icon, x: L.W / 2, y: L.H / 2, size: 130, rot: 0,
    };
    setStickers((prev) => [...prev, st]);
    setSelectedId(st.id);
  };
  const selected = stickers.find((st) => st.id === selectedId);
  const updateSelected = (patch) => setStickers((prev) => prev.map((st) => (st.id === selectedId ? { ...st, ...patch } : st)));
  const removeSelected = () => {
    setStickers((prev) => prev.filter((st) => st.id !== selectedId));
    setSelectedId(null);
  };
  const duplicateSelected = () => {
    if (!selected) return;
    const copy = { ...selected, id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, x: selected.x + 40, y: selected.y + 40 };
    setStickers((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  // --- Geser stiker ---
  // Mouse: pointer events. Sentuhan (HP): touch events non-passive, supaya halaman hanya
  // berhenti scroll kalau jari menyentuh stiker. Di luar stiker, layar tetap bisa di-scroll.
  const toCanvasPoint = (clientX, clientY) => {
    const c = previewRef.current;
    const r = c.getBoundingClientRect();
    return { x: ((clientX - r.left) * c.width) / r.width, y: ((clientY - r.top) * c.height) / r.height };
  };
  const startDrag = (clientX, clientY, touchPx) => {
    const c = previewRef.current;
    const r = c.getBoundingClientRect();
    const p = toCanvasPoint(clientX, clientY);
    // area sentuh minimal (px layar) diubah ke piksel canvas, biar stiker kecil tetap mudah kena
    const hit = hitSticker(stickersRef.current, p.x, p.y, touchPx * (c.width / r.width));
    if (!hit) {
      setSelectedId(null);
      return false;
    }
    setSelectedId(hit.id);
    setStickers((prev) => [...prev.filter((st) => st.id !== hit.id), hit]); // naik ke paling atas
    dragRef.current = { id: hit.id, dx: hit.x - p.x, dy: hit.y - p.y };
    return true;
  };
  const moveDrag = (clientX, clientY) => {
    const d = dragRef.current;
    if (!d) return;
    const c = previewRef.current;
    const p = toCanvasPoint(clientX, clientY);
    setStickers((prev) => prev.map((st) => (st.id === d.id
      ? { ...st, x: Math.min(c.width, Math.max(0, p.x + d.dx)), y: Math.min(c.height, Math.max(0, p.y + d.dy)) }
      : st)));
  };
  const endDrag = () => { dragRef.current = null; };

  const onCanvasDown = (e) => {
    if (e.pointerType === 'touch') return;
    if (startDrag(e.clientX, e.clientY, 14)) {
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  };
  const onCanvasMove = (e) => {
    if (e.pointerType !== 'touch') moveDrag(e.clientX, e.clientY);
  };
  const onCanvasUp = (e) => {
    if (e.pointerType !== 'touch') endDrag();
  };

  useEffect(() => {
    const c = previewRef.current;
    if (!c) return undefined;
    const onStart = (e) => {
      if (e.touches.length !== 1) {
        endDrag();
        return;
      }
      const t = e.touches[0];
      if (startDrag(t.clientX, t.clientY, 30)) e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    };
    c.addEventListener('touchstart', onStart, { passive: false });
    c.addEventListener('touchmove', onMove, { passive: false });
    c.addEventListener('touchend', endDrag);
    c.addEventListener('touchcancel', endDrag);
    return () => {
      c.removeEventListener('touchstart', onStart);
      c.removeEventListener('touchmove', onMove);
      c.removeEventListener('touchend', endDrag);
      c.removeEventListener('touchcancel', endDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Template (warna + tulisan) ---
  const applyPreset = (t) => {
    setTheme({ id: t.id, name: t.name, bg1: t.bg1, bg2: t.bg2, accent: t.accent, ink: t.ink, pattern: t.pattern });
    if (t.caption !== undefined) setCaption(t.caption);
    if (t.stickerSet) setStickerSet(t.stickerSet);
    if (t.showDate !== undefined) setShowDate(t.showDate);
  };
  const persistSaved = (list) => {
    setSaved(list);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch {
      /* penyimpanan browser tidak tersedia */
    }
  };
  const saveCurrentTemplate = () => {
    const item = {
      id: `mine-${Date.now()}`,
      name: tplName.trim() || `Template ${saved.length + 1}`,
      bg1: theme.bg1, bg2: theme.bg2, accent: theme.accent, ink: theme.ink, pattern: theme.pattern,
      caption, stickerSet, showDate,
    };
    persistSaved([...saved, item]);
    setTheme((t) => ({ ...t, id: item.id, name: item.name }));
    setTplName('');
  };
  const templateCard = (t, removable) => (
    <div key={t.id} className="relative">
      <button
        aria-pressed={theme.id === t.id}
        onClick={() => applyPreset(t)}
        className={`block w-full overflow-hidden rounded-2xl border-[3px] border-ink text-left transition ${theme.id === t.id ? 'shadow-pop-sm' : ''}`}
      >
        <span className="block h-14" style={{ background: `linear-gradient(120deg, ${t.bg1}, ${t.bg2})` }} />
        <span className="block bg-white px-3 py-2">
          <span className="flex items-center gap-2 font-display text-sm font-semibold">
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-ink" style={{ background: t.accent }} />
            {t.name}
          </span>
          {t.caption ? <span className="mt-0.5 block truncate text-xs font-bold text-ink/60">{t.caption}</span> : null}
        </span>
      </button>
      {removable && (
        <button
          aria-label={`Hapus template ${t.name}`}
          onClick={() => persistSaved(saved.filter((x) => x.id !== t.id))}
          className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-white text-xs font-bold"
        >×</button>
      )}
    </div>
  );

  const setColor = (key) => (e) => setTheme((t) => ({ ...t, [key]: e.target.value, id: 'custom' }));

  return (
    <section id="booth" className="relative scroll-mt-20 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-4xl font-bold sm:text-5xl">Masuk bilik, langsung cekrek</h2>
          <p className="mt-3 text-lg font-semibold text-ink/75">
            Nyalakan kamera atau upload foto, atur template di sebelah kanan, lalu download hasilnya. Foto tidak dikirim ke server mana pun.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* KAMERA */}
          <div className="relative rounded-[2rem] border-[3px] border-ink bg-sky p-5 shadow-pop-lg">
            <Sparkle className="absolute -right-5 -top-6 h-12 w-12 animate-wiggle" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-[3px] border-ink bg-ink">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${camOn ? '' : 'hidden'} ${facing === 'user' ? '-scale-x-100' : ''}`}
                style={{ filter: FILTERS[filter].css }}
              />
              {!camOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-peri to-bubble p-6 text-center">
                  <Camera className="h-16 w-16 animate-float text-white" strokeWidth={2.2} aria-hidden="true" />
                  <p className="font-display text-xl font-semibold text-white">Kamera belum menyala</p>
                </div>
              )}
              {count > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                  <span key={count} className="animate-pop font-display text-[9rem] font-bold leading-none text-white [text-shadow:6px_6px_0_#2B1B5A]">{count}</span>
                </div>
              )}
              {flash && <div className="pointer-events-none absolute inset-0 animate-flash bg-white" />}
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-2xl border-[3px] border-ink bg-butter px-4 py-3 text-sm font-bold">{error}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {!camOn ? (
                <button className="btn bg-bubble text-white" onClick={() => startCamera(facing)}>Nyalakan kamera</button>
              ) : (
                <>
                  <button className="btn bg-butter" onClick={runSession} disabled={busy || filled === shots}>
                    {busy ? 'Siap-siap...' : filled === shots ? 'Slot penuh' : shots > 1 ? `Mulai ${shots - filled} pose` : 'Cekrek!'}
                  </button>
                  <button className="btn bg-white" onClick={switchCamera} disabled={busy}>Balik kamera</button>
                  <button className="btn bg-white" onClick={stopCamera} disabled={busy}>Matikan</button>
                </>
              )}
              <button className="btn bg-white" onClick={() => fileRef.current?.click()} disabled={busy}>Upload foto</button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onUploadPhotos} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="label">Hitung mundur</span>
                <div className="flex gap-2">
                  {[3, 5, 8].map((s) => (
                    <button key={s} className="chip" aria-pressed={timer === s} onClick={() => setTimer(s)}>{s} detik</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="label">Filter kamera</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(FILTERS).map(([k, f]) => (
                    <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{f.name}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <span className="label">Hasil foto ({filled}/{shots})</span>
              <div className="flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative h-20 w-24 overflow-hidden rounded-xl border-[3px] border-ink bg-white/70">
                    {p ? (
                      <>
                        <img src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          aria-label={`Hapus foto ${i + 1}`}
                          disabled={busy}
                          onClick={() => setPhotos((prev) => prev.map((x, j) => (j === i ? null : x)))}
                          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-bubble text-xs font-bold text-white"
                        >×</button>
                      </>
                    ) : (
                      <span className="grid h-full place-items-center font-display text-sm font-semibold text-ink/50">Kosong</span>
                    )}
                  </div>
                ))}
                {filled > 0 && (
                  <button className="chip self-center" disabled={busy} onClick={() => setPhotos(Array(shots).fill(null))}>Ulang semua</button>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW + KONTROL */}
          <div className="relative rounded-[2rem] border-[3px] border-ink bg-white p-5 shadow-pop-lg">
            <Star className="absolute -left-6 -top-7 h-14 w-14 animate-float" style={{ '--r': '-10deg' }} />
            <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-milk">
              <canvas
                ref={previewRef}
                onPointerDown={onCanvasDown}
                onPointerMove={onCanvasMove}
                onPointerUp={onCanvasUp}
                onPointerCancel={onCanvasUp}
                className="mx-auto block h-auto max-h-[70vh] w-auto max-w-full cursor-grab active:cursor-grabbing"
                aria-label="Preview hasil photobooth. Stiker bisa digeser."
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} aria-pressed={tab === t.id} className="chip" onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
            </div>

            <div className="mt-5 min-h-[190px]">
              {tab === 'layout' && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.values(LAYOUTS).map((l) => (
                    <button
                      key={l.id}
                      aria-pressed={layout === l.id}
                      onClick={() => setLayout(l.id)}
                      className={`rounded-2xl border-[3px] border-ink p-4 text-left transition ${layout === l.id ? 'bg-butter shadow-pop-sm' : 'bg-white hover:bg-milk'}`}
                    >
                      <span className="block font-display text-lg font-semibold">{l.name}</span>
                      <span className="text-sm font-semibold text-ink/70">{l.desc}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'tema' && (
                <div>
                  <label className="mb-4 block">
                    <span className="label">Tulisan di bawah template</span>
                    <input className="field" value={caption} maxLength={40} onChange={(e) => setCaption(e.target.value)} placeholder="Contoh: Reuni kelas 2026" />
                  </label>

                  <span className="label">Template siap pakai (warna + tulisan)</span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{THEMES.map((t) => templateCard(t, false))}</div>

                  <span className="label mt-5">Template saya</span>
                  {saved.length ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{saved.map((t) => templateCard(t, true))}</div>
                  ) : (
                    <p className="text-sm font-bold text-ink/65">Belum ada. Atur warna di tab Custom, isi tulisan di atas, lalu simpan di sini.</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    <label className="min-w-[10rem] grow">
                      <span className="label">Nama template baru</span>
                      <input className="field" value={tplName} maxLength={24} onChange={(e) => setTplName(e.target.value)} placeholder="Contoh: Kelas 4A" />
                    </label>
                    <button className="chip bg-mint" onClick={saveCurrentTemplate}>Simpan pengaturan sekarang</button>
                  </div>
                  <p className="mt-2 text-xs font-bold text-ink/55">Template sendiri hanya tersimpan di browser ini. Untuk template permanen, silahkan hubungi IG @revidaerobi</p>
                </div>
              )}

              {tab === 'meme' && (
                <div>
                  {memeSlots === 0 ? (
                    <p className="rounded-2xl border-[3px] border-ink bg-butter px-4 py-3 text-sm font-bold">
                      Meme tampil di layout &quot;Aku × Meme&quot; dan &quot;Aku × 3 Meme&quot;.
                      <span className="mt-2 flex flex-wrap gap-2">
                        <button className="chip" onClick={() => setLayout('split')}>Pakai Aku × Meme</button>
                        <button className="chip" onClick={() => setLayout('trio')}>Pakai Aku × 3 Meme</button>
                      </span>
                    </p>
                  ) : (
                    <>
                      {memeSlots > 1 && (
                        <div className="mb-4">
                          <span className="label">Kotak meme yang diedit</span>
                          <div className="flex gap-2">
                            {memes.slice(0, memeSlots).map((_, i) => (
                              <button key={i} className="chip" aria-pressed={slot === i} onClick={() => setMemeSlot(i)}>Meme {i + 1}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <span className="label">Jenis meme</span>
                        <div className="flex flex-wrap gap-2">
                          {MEME_KINDS.map((k) => (
                            <button key={k.id} className="chip" aria-pressed={cur.kind === k.id} onClick={() => updateMeme({ kind: k.id })}>{k.label}</button>
                          ))}
                        </div>
                      </div>

                      {cur.kind === 'emoji' && (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {memesData.map((m, i) => (
                              <button key={m.id} className="chip" aria-pressed={cur.emoji === m.emoji && cur.top === m.top} onClick={() => pickEmojiMeme(i)} aria-label={`Meme ${m.top}`}>
                                <span className="text-lg">{m.emoji}</span>
                              </button>
                            ))}
                            <button className="chip inline-flex items-center gap-1.5 bg-mint" onClick={randomMeme}><Dices className="h-4 w-4" aria-hidden="true" /> Acak meme</button>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="label">Teks atas</span>
                              <input className="field" value={cur.top} maxLength={40} onChange={(e) => updateMeme({ top: e.target.value })} />
                            </label>
                            <label>
                              <span className="label">Teks bawah</span>
                              <input className="field" value={cur.bottom} maxLength={40} onChange={(e) => updateMeme({ bottom: e.target.value })} />
                            </label>
                          </div>
                        </div>
                      )}

                      {cur.kind === 'template' && (
                        <div>
                          <div className="grid grid-cols-2 gap-2">
                            {MEME_TEMPLATES.map((t) => (
                              <button
                                key={t.id}
                                aria-pressed={cur.tpl === t.id}
                                onClick={() => pickTemplate(t.id)}
                                className={`rounded-2xl border-[3px] border-ink px-3 py-2.5 text-left font-display text-sm font-semibold transition ${cur.tpl === t.id ? 'bg-butter shadow-pop-sm' : 'bg-white hover:bg-milk'}`}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {MEME_TEMPLATES.find((t) => t.id === cur.tpl).fields.map((label, i) => (
                              <label key={`${cur.tpl}-${i}`}>
                                <span className="label">{label}</span>
                                <input className="field" value={cur.texts[i] || ''} maxLength={60} onChange={(e) => setTemplateText(i, e.target.value)} />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {cur.kind === 'upload' && (
                        <div>
                          <span className="label">Galeri meme</span>
                          {MEME_IMAGES.length ? (
                            <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                              {MEME_IMAGES.map((img) => (
                                <button
                                  key={img.id}
                                  aria-pressed={memeUrls[slot] === img.url}
                                  aria-label={img.name}
                                  onClick={() => { setUrl(img.url); updateMeme({ kind: 'upload' }); }}
                                  className={`overflow-hidden rounded-xl border-[3px] border-ink bg-white transition ${memeUrls[slot] === img.url ? 'shadow-pop-sm ring-2 ring-bubble' : 'hover:-translate-y-0.5'}`}
                                >
                                  <img src={img.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                                  <span className="block truncate px-1.5 py-1 text-xs font-bold">{img.name}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-ink/65">Belum ada gambar. Taruh file di folder src/assets/memes/ lalu refresh.</p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button className="chip bg-sky" onClick={() => memeFileRef.current?.click()}>Upload dari perangkat</button>
                            {memeUrls[slot] && <button className="chip" onClick={() => { setUrl(null); updateMeme({ kind: 'emoji' }); }}>Lepas gambar</button>}
                          </div>
                          <p className="mt-2 text-xs font-bold text-ink/55">Gambar dipotong otomatis supaya memenuhi kotak meme.</p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="label">Teks atas (opsional)</span>
                              <input className="field" value={cur.capTop} maxLength={40} onChange={(e) => updateMeme({ capTop: e.target.value })} />
                            </label>
                            <label>
                              <span className="label">Teks bawah (opsional)</span>
                              <input className="field" value={cur.capBottom} maxLength={40} onChange={(e) => updateMeme({ capBottom: e.target.value })} />
                            </label>
                          </div>
                        </div>
                      )}
                      <input ref={memeFileRef} type="file" accept="image/*" hidden onChange={onUploadMeme} />
                    </>
                  )}
                </div>
              )}

              {tab === 'stiker' && (
                <div>
                  <p className="mb-3 text-sm font-bold text-ink/75">
                    Geser stiker langsung di preview (di HP, sentuh dan geser). Pilih stiker untuk mengatur ukuran dan putarannya, atau tekan Delete untuk menghapus.
                  </p>
                  <span className="label">Tambah stiker</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(STICKER_ICONS).map(([id, ic]) => (
                      <button key={id} className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-ink bg-white transition hover:-translate-y-0.5 hover:bg-butter" onClick={() => addSticker(id)} aria-label={`Tambah stiker ${ic.name}`}>
                        <StickerIcon id={id} className="h-8 w-8" />
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border-[3px] border-ink bg-milk p-4">
                    {selected ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label>
                          <span className="label">Ukuran ({Math.round(selected.size)})</span>
                          <input type="range" min="50" max="300" value={selected.size} onChange={(e) => updateSelected({ size: +e.target.value })} className="w-full accent-bubble" />
                        </label>
                        <label>
                          <span className="label">Putar ({Math.round(selected.rot)}°)</span>
                          <input type="range" min="-180" max="180" value={selected.rot} onChange={(e) => updateSelected({ rot: +e.target.value })} className="w-full accent-bubble" />
                        </label>
                        <div className="flex gap-2 sm:col-span-2">
                          <button className="chip" onClick={duplicateSelected}>Gandakan</button>
                          <button className="chip bg-bubble text-white" onClick={removeSelected}>Hapus stiker</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-ink/65">Belum ada stiker yang dipilih. Klik salah satu stiker di preview.</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="label">Isi ulang dengan set bawaan (posisi stiker direset)</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STICKER_SETS).map(([k, st]) => (
                        <button key={k} className="chip" aria-pressed={stickerSet === k} onClick={() => (stickerSet === k ? setStickers(defaultStickers(layout, k)) : setStickerSet(k))}>{st.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'frame' && (
                <div>
                  <p className="mb-3 text-sm font-bold text-ink/75">
                    Upload frame buatanmu (PNG transparan paling pas). Gambar akan diregangkan sebesar template: {LAYOUTS[layout].W} × {LAYOUTS[layout].H} px untuk layout ini.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="chip bg-sky" onClick={() => frameFileRef.current?.click()}>{frameUrl ? 'Ganti frame' : 'Upload frame'}</button>
                    {frameUrl && <button className="chip" onClick={() => setFrameUrl(null)}>Hapus frame</button>}
                    <button className="chip bg-butter" onClick={downloadGuide}>Unduh panduan ukuran</button>
                    <input ref={frameFileRef} type="file" accept="image/*" hidden onChange={onUploadFrame} />
                  </div>

                  <div className="mt-4">
                    <span className="label">Posisi frame</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="chip" aria-pressed={frameMode === 'over'} onClick={() => setFrameMode('over')}>Di atas foto (ada lubang transparan)</button>
                      <button className="chip" aria-pressed={frameMode === 'under'} onClick={() => setFrameMode('under')}>Sebagai latar</button>
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-3">
                    <input type="checkbox" checked={plainPhotos} onChange={(e) => setPlainPhotos(e.target.checked)} className="h-5 w-5 accent-bubble" />
                    <span className="font-display text-sm font-semibold">Hilangkan garis dan bayangan di sekitar foto</span>
                  </label>
                </div>
              )}

              {tab === 'custom' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="label">Tulisan di template</span>
                    <input className="field" value={caption} maxLength={40} onChange={(e) => setCaption(e.target.value)} placeholder="Contoh: Reuni kelas 2026" />
                  </label>
                  {[
                    ['bg1', 'Warna latar 1'],
                    ['bg2', 'Warna latar 2'],
                    ['accent', 'Warna aksen'],
                    ['ink', 'Warna garis & teks'],
                  ].map(([k, label]) => (
                    <label key={k} className="flex items-center gap-3">
                      <input type="color" value={theme[k]} onChange={setColor(k)} className="h-11 w-14 cursor-pointer rounded-xl border-[3px] border-ink bg-white p-0.5" />
                      <span className="font-display text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                  <div>
                    <span className="label">Pola latar</span>
                    <div className="flex gap-2">
                      {[['dots', 'Titik'], ['stripes', 'Garis'], ['none', 'Polos']].map(([k, n]) => (
                        <button key={k} className="chip" aria-pressed={theme.pattern === k} onClick={() => setTheme((t) => ({ ...t, pattern: k, id: 'custom' }))}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 sm:col-span-2">
                    <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} className="h-5 w-5 accent-bubble" />
                    <span className="font-display text-sm font-semibold">Tampilkan tanggal hari ini</span>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button className="btn bg-mint" onClick={download}>Download PNG</button>
              {filled < shots && <span className="text-sm font-bold text-ink/65">Slot foto yang kosong akan tampil sebagai kotak kamera.</span>}
            </div>
          </div>
        </div>
      </div>
      <Flower className="pointer-events-none absolute -left-10 bottom-6 hidden h-28 w-28 animate-spin360 md:block" color="#6EE7C0" />
    </section>
  );
}
