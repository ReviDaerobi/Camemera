import { Blob, Cloud, Flower, Heart, Ring, Sparkle, Squiggle, Star } from './components/Decor.jsx';
import Booth from './components/Booth.jsx';

function pickLayout(id) {
  window.dispatchEvent(new CustomEvent('pick-layout', { detail: id }));
  document.getElementById('booth')?.scrollIntoView({ behavior: 'smooth' });
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-milk/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-display text-2xl font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-bubble text-xl shadow-pop-sm" aria-hidden="true">📸</span>
          Cekrek Booth
        </a>
        <div className="hidden items-center gap-7 font-display text-lg font-medium md:flex">
          <a className="hover:text-bubble" href="#cara">Cara kerja</a>
          <a className="hover:text-bubble" href="#template">Template</a>
          <a className="hover:text-bubble" href="#kenapa">Kenapa Cekrek</a>
        </div>
        <a href="#booth" className="btn bg-butter px-5 py-2 text-base">Mulai cekrek</a>
      </nav>
    </header>
  );
}

function HeroCard() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <Blob className="absolute -inset-10 h-[130%] w-[130%] -translate-x-6 -translate-y-8 animate-spin360 opacity-90" color="#9C8CFF" />
      <Blob variant={1} className="absolute -bottom-16 -right-10 h-64 w-64 animate-float-slow" color="#6EE7C0" />

      <div className="relative rotate-[-4deg] rounded-[2rem] border-[3px] border-ink bg-gradient-to-br from-[#FFB3D6] to-[#C9B8FF] p-5 shadow-pop-lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-[3px] border-ink bg-butter shadow-pop-sm">
            <div className="absolute inset-0 grid place-items-center text-[5.5rem]" aria-hidden="true">🥰</div>
            <span className="absolute bottom-2 left-2 rounded-full border-2 border-ink bg-white px-3 py-0.5 font-display text-sm font-semibold">kamu</span>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-[3px] border-ink bg-gradient-to-b from-white to-mint shadow-pop-sm">
            <p className="absolute inset-x-0 top-2 px-2 text-center font-meme text-[1.05rem] leading-tight text-white [-webkit-text-stroke:5px_#2B1B5A] [paint-order:stroke_fill]">LAGI MIKIRIN</p>
            <div className="absolute inset-0 grid place-items-center text-[5.5rem]" aria-hidden="true">🗿</div>
            <p className="absolute inset-x-0 bottom-2 px-2 text-center font-meme text-[1.05rem] leading-tight text-white [-webkit-text-stroke:5px_#2B1B5A] [paint-order:stroke_fill]">MAU MAKAN APA</p>
          </div>
        </div>
        <p className="mt-4 text-center font-display text-2xl font-bold">Cekrek bareng!</p>
        <span className="absolute left-1/2 top-[44%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-butter font-display text-2xl font-bold shadow-pop-sm">×</span>
      </div>

      <Sparkle className="absolute -right-4 -top-8 h-14 w-14 animate-wiggle" />
      <Heart className="absolute -left-8 bottom-16 h-16 w-16 animate-float" style={{ '--r': '-12deg' }} />
      <Star className="absolute -bottom-8 left-1/3 h-14 w-14 animate-float-slow" color="#FF9A5C" style={{ '--r': '10deg' }} />
      <Flower className="absolute -right-10 top-1/2 h-20 w-20 animate-spin360" color="#6CC8FF" />
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-14 sm:px-8 sm:pt-20">
      <Cloud className="absolute left-[6%] top-10 hidden h-16 w-28 animate-float-slow md:block" />
      <Cloud className="absolute right-[8%] top-24 hidden h-12 w-24 animate-float md:block" color="#E6F6FF" />
      <Ring className="absolute bottom-10 left-[44%] hidden h-20 w-20 animate-spin360 lg:block" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            Photobooth online yang bikin kamu bersanding dengan meme
          </h1>
          <Squiggle className="mt-5 h-5 w-40" />
          <p className="mt-6 max-w-xl text-xl font-semibold leading-relaxed text-ink/80">
            Cekrek lewat browser, pilih template lucu atau rancang sendiri, lalu simpan hasilnya. Gratis dan tanpa daftar akun.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#booth" className="btn bg-bubble text-white">Mulai cekrek</a>
            <a href="#template" className="btn bg-white">Lihat template</a>
          </div>
        </div>
        <HeroCard />
      </div>
    </section>
  );
}

function Marquee() {
  const words = ['Gratis selamanya', 'Tanpa akun', 'Foto kiri, meme kanan', 'Template bisa kamu desain', 'Hasil tetap di perangkatmu'];
  const colors = ['#FFD84D', '#FF7EB6', '#6EE7C0', '#6CC8FF', '#9C8CFF'];
  const row = [...words, ...words];
  return (
    <div className="-rotate-1 overflow-hidden border-y-[3px] border-ink bg-ink py-3 text-white" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-xl font-semibold">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w}
            <Sparkle className="h-6 w-6" color={colors[i % colors.length]} />
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: 'Pilih template', text: 'Foto kiri meme kanan, photo strip, polaroid, atau kotak 2×2. Warna dan stiker bisa diganti.', bg: 'bg-butter', rot: '-rotate-2', radius: 'rounded-[2.5rem]', deco: <Star className="h-14 w-14" color="#FF7EB6" /> },
    { n: 2, title: 'Cekrek', text: 'Nyalakan kamera, atur hitung mundur, lalu tersenyum. Tidak ada kamera? Upload foto saja.', bg: 'bg-sky', rot: 'rotate-1', radius: 'rounded-[2rem_3rem_2rem_3rem]', deco: <Heart className="h-14 w-14" /> },
    { n: 3, title: 'Download', text: 'Hasil jadi berupa PNG beresolusi tinggi, siap dikirim ke grup atau dicetak.', bg: 'bg-mint', rot: '-rotate-1', radius: 'rounded-[3rem_2rem_3rem_2rem]', deco: <Sparkle className="h-14 w-14" color="#9C8CFF" /> },
  ];
  return (
    <section id="cara" className="scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-xl text-4xl font-bold sm:text-5xl">Tiga langkah, selesai sebelum es teh habis</h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className={`relative border-[3px] border-ink p-8 shadow-pop ${s.bg} ${s.rot} ${s.radius}`}>
              <span className="absolute -right-4 -top-6 animate-wiggle">{s.deco}</span>
              <span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-white font-display text-2xl font-bold">{s.n}</span>
              <h3 className="mt-5 text-3xl font-bold">{s.title}</h3>
              <p className="mt-3 text-lg font-semibold leading-relaxed text-ink/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Mini({ children, className = '' }) {
  return <div className={`rounded-lg border-[3px] border-ink ${className}`}>{children}</div>;
}

function Templates() {
  return (
    <section id="template" className="relative scroll-mt-20 overflow-hidden border-y-[3px] border-ink bg-peri/40 px-4 py-24 sm:px-8">
      <Blob className="absolute -right-24 -top-24 h-80 w-80 opacity-60" color="#FFD84D" />
      <Blob variant={1} className="absolute -bottom-28 -left-20 h-72 w-72 opacity-60" color="#FF7EB6" />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-4xl font-bold sm:text-5xl">Empat layout, warna dan stikernya terserah kamu</h2>
        <p className="mt-4 max-w-2xl text-lg font-semibold text-ink/75">
          Tiap layout punya enam tema siap pakai. Mau lebih personal? Ganti warna, pola, stiker, dan tulisannya di tab Custom.
        </p>

        <div className="mt-14 grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => pickLayout('split')} className="group text-left">
            <div className="rotate-2 rounded-[2rem] border-[3px] border-ink bg-bubble p-4 shadow-pop transition group-hover:-translate-y-1 group-hover:rotate-0">
              <div className="grid grid-cols-2 gap-2">
                <Mini className="grid aspect-[4/5] place-items-center bg-butter text-4xl">🥰</Mini>
                <Mini className="grid aspect-[4/5] place-items-center bg-white text-4xl">🗿</Mini>
              </div>
              <div className="mx-auto mt-3 h-3 w-1/2 rounded-full bg-ink/80" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">Aku × Meme</h3>
            <p className="font-semibold text-ink/75">Foto kamu di kiri, meme di kanan. Bisa pakai gambar meme sendiri.</p>
          </button>

          <button onClick={() => pickLayout('strip')} className="group text-left">
            <div className="mx-auto w-3/5 -rotate-3 rounded-[1.5rem] border-[3px] border-ink bg-mint p-3 shadow-pop transition group-hover:-translate-y-1 group-hover:rotate-0 sm:w-4/5">
              <div className="grid gap-2">
                {['😎', '🤪', '😝', '🥳'].map((e) => (
                  <Mini key={e} className="grid h-14 place-items-center bg-white text-3xl">{e}</Mini>
                ))}
              </div>
              <div className="mx-auto mt-3 h-3 w-1/2 rounded-full bg-ink/80" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">Photo strip</h3>
            <p className="font-semibold text-ink/75">Empat pose berurutan, klasik seperti bilik foto di mal.</p>
          </button>

          <button onClick={() => pickLayout('polaroid')} className="group text-left">
            <div className="mx-auto w-4/5 rotate-3 rounded-2xl border-[3px] border-ink bg-white p-3 pb-8 shadow-pop transition group-hover:-translate-y-1 group-hover:rotate-0">
              <Mini className="grid aspect-square place-items-center bg-sky text-5xl">🌷</Mini>
              <p className="mt-3 text-center font-hand text-2xl font-bold">bestie day</p>
            </div>
            <h3 className="mt-5 text-2xl font-bold">Polaroid</h3>
            <p className="font-semibold text-ink/75">Satu foto, satu kalimat tulisan tangan.</p>
          </button>

          <button onClick={() => pickLayout('grid')} className="group text-left">
            <div className="-rotate-2 rounded-[2rem] border-[3px] border-ink bg-tangerine p-4 shadow-pop transition group-hover:-translate-y-1 group-hover:rotate-0">
              <div className="grid grid-cols-2 gap-2">
                {['😋', '😍', '🤭', '😆'].map((e) => (
                  <Mini key={e} className="grid aspect-square place-items-center bg-butter text-3xl">{e}</Mini>
                ))}
              </div>
              <div className="mx-auto mt-3 h-3 w-1/2 rounded-full bg-ink/80" />
            </div>
            <h3 className="mt-5 text-2xl font-bold">Kotak 2×2</h3>
            <p className="font-semibold text-ink/75">Empat ekspresi dalam satu kartu persegi.</p>
          </button>
        </div>
      </div>
    </section>
  );
}

function Why() {
  const items = [
    { t: 'Gratis', d: 'Tidak ada langganan, tidak ada watermark.', bg: 'bg-butter', rot: 'rotate-2', e: '🎁' },
    { t: 'Foto tetap di perangkatmu', d: 'Semua diproses di browser. Tidak ada foto yang diunggah.', bg: 'bg-sky', rot: '-rotate-2', e: '🔒' },
    { t: 'Template bisa kamu desain', d: 'Warna, pola, stiker, tulisan, bahkan gambar meme sendiri.', bg: 'bg-bubble', rot: 'rotate-1', e: '🎨' },
    { t: 'Hasil tajam', d: 'Diunduh sebagai PNG, cukup besar untuk dicetak.', bg: 'bg-mint', rot: '-rotate-1', e: '🖼️' },
  ];
  return (
    <section id="kenapa" className="scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-xl text-4xl font-bold sm:text-5xl">Dibuat supaya kamu tinggal gaya</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {items.map((it, i) => (
            <div key={it.t} className={`flex items-start gap-5 border-[3px] border-ink p-6 shadow-pop ${it.bg} ${it.rot} ${i % 2 ? 'rounded-[2.5rem_1.2rem_2.5rem_1.2rem]' : 'rounded-[1.2rem_2.5rem_1.2rem_2.5rem]'}`}>
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-white text-3xl" aria-hidden="true">{it.e}</span>
              <div>
                <h3 className="text-2xl font-bold">{it.t}</h3>
                <p className="mt-1 text-lg font-semibold text-ink/80">{it.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-[3px] border-ink bg-ink px-4 py-14 text-white sm:px-8">
      <Sparkle className="absolute right-10 top-8 h-10 w-10 animate-wiggle" />
      <Heart className="absolute bottom-6 left-[12%] h-8 w-8 animate-float" />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-3xl font-bold">Cekrek Booth</p>
        <p className="max-w-md font-semibold text-white/80">Photobooth online gratis. Foto diproses di browsermu dan tidak disimpan di server.</p>
        <a href="#top" className="btn bg-butter text-ink">Kembali ke atas</a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Templates />
        <Booth />
        <Why />
      </main>
      <Footer />
    </>
  );
}
