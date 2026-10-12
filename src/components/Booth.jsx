import { useCallback, useEffect, useRef, useState } from 'react';
import memesData from '../../shared/memes.json';
import { FILTERS, LAYOUTS, STICKER_SETS, THEMES, defaultStickers, hitSticker, renderBooth, renderGuide } from '../lib/composer.js';
import { Flower, Sparkle, Star } from './Decor.jsx';

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

const TABS = [
  { id: 'layout', label: 'Layout' },
  { id: 'tema', label: 'Tema' },
  { id: 'meme', label: 'Meme' },
  { id: 'stiker', label: 'Stiker' },
  { id: 'frame', label: 'Frame' },
  { id: 'custom', label: 'Custom' },
];

const EMOJI_PALETTE = ['🌸', '⭐', '💖', '🎀', '✨', '🍓', '🍩', '🧋', '🍒', '🍪', '🍭', '🚀', '🌙', '👾', '🪐', '💀', '🗿', '😭', '🤡', '🔥', '😎', '🦋', '🐱', '🌈', '👑', '💌', '🎉', '🫶'];

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
  const [memeIdx, setMemeIdx] = useState(0);
  const [meme, setMeme] = useState({ ...memesData[0] });
  const [memeUrl, setMemeUrl] = useState(null);
  const [memeImg, setMemeImg] = useState(null);
  const [caption, setCaption] = useState('Cekrek bareng!');
  const [showDate, setShowDate] = useState(true);
  const [stickerSet, setStickerSet] = useState('cute');
  const [tab, setTab] = useState('layout');
  const [stickers, setStickers] = useState(() => defaultStickers('split', 'cute'));
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
    loadImage(memeUrl).then((img) => alive && setMemeImg(img));
    return () => { alive = false; };
  }, [memeUrl]);

  useEffect(() => {
    let alive = true;
    loadImage(frameUrl).then((img) => alive && setFrameImg(img));
    return () => { alive = false; };
  }, [frameUrl]);

  const renderOpts = (sel) => ({
    layout, theme, photos: photoImgs, meme, memeImg, caption, showDate,
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
  }, [layout, theme, photoImgs, meme, memeImg, caption, showDate, stickers, selectedId, frameImg, frameMode, plainPhotos]);

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

  const onUploadMeme = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    setMemeUrl(await readFile(f));
  };

  const pickMeme = (i) => {
    setMemeIdx(i);
    setMeme({ ...memesData[i] });
    setMemeUrl(null);
  };

  const randomMeme = () => {
    let i = Math.floor(Math.random() * memesData.length);
    if (i === memeIdx && memesData.length > 1) i = (i + 1) % memesData.length;
    pickMeme(i);
  };

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
  const addSticker = (emoji) => {
    const L = LAYOUTS[layout];
    const st = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji, x: L.W / 2, y: L.H / 2, size: 120, rot: 0,
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

  const toCanvasPoint = (e) => {
    const c = previewRef.current;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };
  const onCanvasDown = (e) => {
    const p = toCanvasPoint(e);
    const hit = hitSticker(stickers, p.x, p.y);
    if (!hit) {
      setSelectedId(null);
      return;
    }
    setSelectedId(hit.id);
    setStickers((prev) => [...prev.filter((st) => st.id !== hit.id), hit]); // naik ke paling atas
    dragRef.current = { id: hit.id, dx: hit.x - p.x, dy: hit.y - p.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onCanvasMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const c = previewRef.current;
    const p = toCanvasPoint(e);
    setStickers((prev) => prev.map((st) => (st.id === d.id
      ? { ...st, x: Math.min(c.width, Math.max(0, p.x + d.dx)), y: Math.min(c.height, Math.max(0, p.y + d.dy)) }
      : st)));
  };
  const endDrag = () => { dragRef.current = null; };

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
                  <span className="text-6xl animate-float" aria-hidden="true">📷</span>
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
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                style={{ touchAction: tab === 'stiker' ? 'none' : 'auto' }}
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      aria-pressed={theme.id === t.id}
                      onClick={() => setTheme({ ...t })}
                      className={`overflow-hidden rounded-2xl border-[3px] border-ink text-left transition ${theme.id === t.id ? 'shadow-pop-sm' : ''}`}
                    >
                      <span className="block h-14" style={{ background: `linear-gradient(120deg, ${t.bg1}, ${t.bg2})` }} />
                      <span className="flex items-center gap-2 bg-white px-3 py-2 font-display text-sm font-semibold">
                        <span className="h-4 w-4 rounded-full border-2 border-ink" style={{ background: t.accent }} />
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'meme' && (
                <div>
                  {layout !== 'split' && (
                    <p className="mb-3 rounded-2xl border-[3px] border-ink bg-butter px-4 py-2 text-sm font-bold">
                      Meme hanya tampil di layout &quot;Aku × Meme&quot;.{' '}
                      <button className="underline" onClick={() => setLayout('split')}>Pindah ke layout itu</button>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {memesData.map((m, i) => (
                      <button key={m.id} className="chip" aria-pressed={!memeUrl && memeIdx === i} onClick={() => pickMeme(i)} aria-label={`Meme ${m.top}`}>
                        <span className="text-lg">{m.emoji}</span>
                      </button>
                    ))}
                    <button className="chip bg-mint" onClick={randomMeme}>🎲 Acak meme</button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="label">Teks atas</span>
                      <input className="field" value={meme.top} maxLength={40} disabled={!!memeUrl} onChange={(e) => setMeme({ ...meme, top: e.target.value })} />
                    </label>
                    <label>
                      <span className="label">Teks bawah</span>
                      <input className="field" value={meme.bottom} maxLength={40} disabled={!!memeUrl} onChange={(e) => setMeme({ ...meme, bottom: e.target.value })} />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button className="chip bg-sky" onClick={() => memeFileRef.current?.click()}>Pakai gambar meme sendiri</button>
                    {memeUrl && <button className="chip" onClick={() => setMemeUrl(null)}>Kembali ke meme bawaan</button>}
                    <input ref={memeFileRef} type="file" accept="image/*" hidden onChange={onUploadMeme} />
                  </div>
                </div>
              )}

              {tab === 'stiker' && (
                <div>
                  <p className="mb-3 text-sm font-bold text-ink/75">
                    Geser stiker langsung di preview. Klik stiker untuk mengatur ukuran dan putarannya, atau tekan Delete untuk menghapus.
                  </p>
                  <span className="label">Tambah stiker</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_PALETTE.map((em) => (
                      <button key={em} className="grid h-11 w-11 place-items-center rounded-xl border-[3px] border-ink bg-white text-2xl transition hover:-translate-y-0.5 hover:bg-butter" onClick={() => addSticker(em)} aria-label={`Tambah stiker ${em}`}>{em}</button>
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
              {filled < shots && <span className="text-sm font-bold text-ink/65">Slot foto yang kosong akan tampil sebagai kotak 📸.</span>}
            </div>
          </div>
        </div>
      </div>
      <Flower className="pointer-events-none absolute -left-10 bottom-6 hidden h-28 w-28 animate-spin360 md:block" color="#6EE7C0" />
    </section>
  );
}
