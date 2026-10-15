# Cekrek Booth

Photobooth online: foto kamu di kiri, meme di kanan, atau template custom.
React + Vite + Tailwind (frontend), Express (API), siap deploy gratis di Vercel.

## Jalankan di komputer

```bash
npm install
npm run dev
```

Buka http://localhost:5173 (API Express jalan di port 3001, otomatis di-proxy).
Kamera hanya bisa dipakai di `localhost` atau HTTPS.

## Deploy gratis ke Vercel

1. Upload folder ini ke GitHub (repo baru).
2. Buka https://vercel.com, login dengan GitHub, klik **Add New > Project**, pilih repo tadi.
3. Biarkan pengaturan default (Vite terdeteksi otomatis), klik **Deploy**.
4. Selesai. Folder `api/` otomatis menjadi serverless function, dan `vercel.json` mengarahkan `/api/*` ke Express.

Atau lewat terminal: `npm i -g vercel` lalu jalankan `vercel` di folder ini.

## Struktur

```
api/_app.js           Express app (endpoint /api/health, /api/memes, /api/memes/random)
api/index.js          Entry Vercel untuk /api
api/[...path].js      Entry Vercel untuk semua /api/* (jangan dihapus)
shared/memes.json     Daftar meme bawaan (dipakai frontend dan API), tambah sendiri di sini
server.js             Server lokal untuk development
src/lib/composer.js   Mesin Canvas: layout, tema, filter, penggambaran stiker
src/lib/stickers.js   Ikon stiker SVG (tanpa emoji) dan set stiker
src/templates.config.js Template siap pakai (warna + tulisan)
src/assets/memes/     Gambar meme milikmu (otomatis masuk galeri)
src/components/       Booth (kamera + editor), Decor (elemen grafis SVG)
src/App.jsx           Landing page
```

## Logo

Timpa file `public/logo.png` dengan logomu (PNG transparan, sebaiknya persegi atau melebar; tinggi ditampilkan 44 px). Kalau file hilang, navbar otomatis memakai ikon kamera. Kalau logomu sudah memuat tulisan nama, hapus teks "Cekrek Booth" di komponen `Navbar` pada `src/App.jsx`.

## Meme

Tiap kotak meme punya tiga jenis: **Emoji + teks**, **Template gambar** (kucing kaget, dua tombol, tolak & terima, breaking news; semua digambar sendiri lewat kode, bisa ditambah di `MEME_TEMPLATES` dan `drawTemplate` pada `src/lib/composer.js`), dan **Foto sendiri** (upload + teks atas/bawah opsional).
Layout **Aku × 3 Meme** punya tiga kotak meme yang bisa diatur satu per satu.

## Gambar meme sendiri

Taruh file gambar (png, jpg, jpeg, webp, gif, avif) di `src/assets/memes/`. Semuanya otomatis muncul di tab Meme > Gambar meme > Galeri meme, tanpa mengubah kode. Nama file jadi nama gambar. File `contoh-*.png` boleh dihapus.

## Stiker dan frame

- **Stiker**: buka tab Stiker, tambah dari palet, geser langsung di preview, atur ukuran/putaran, Delete untuk menghapus.
- **Frame sendiri**: buka tab Frame, klik "Unduh panduan ukuran" untuk melihat posisi foto/meme per layout, desain di Canva/Figma dengan ukuran itu (PNG transparan), lalu upload.

## Cara menambah

- **Meme baru**: tambah objek `{ "id", "emoji", "top", "bottom" }` di `shared/memes.json`.
- **Template (warna + tulisan)**: tambah blok baru di `src/templates.config.js`. Tiap template membawa warna, pola, tulisan di bawah foto, set stiker, dan tanggal. Template buatan sendiri di aplikasi (tab Tema > Template saya) tersimpan di browser.
- **Layout baru**: tambah di `LAYOUTS` dan `getSlots()` pada file yang sama.
- **Ikon stiker baru**: tambah entri di `STICKER_ICONS` pada `src/lib/stickers.js` (SVG viewBox 0 0 64 64), lalu masukkan ke `STICKER_SETS`. Emoji hanya dipakai untuk meme.

## Catatan

- Semua foto diproses di browser lewat Canvas, tidak diunggah ke server.
- Filter kamera memakai `ctx.filter`, yang belum didukung Safari lama (filter diabaikan, foto tetap normal).
