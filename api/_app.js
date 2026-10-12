// Aplikasi Express. Di Vercel dipakai lewat api/index.js dan api/[...path].js,
// di lokal dijalankan lewat server.js. Awalan underscore = bukan function Vercel.
import express from 'express';
import cors from 'cors';
import { createRequire } from 'node:module';

// createRequire supaya Vercel ikut menyertakan memes.json ke dalam function
const memes = createRequire(import.meta.url)('../shared/memes.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'cekrek-booth', time: new Date().toISOString() });
});

// Daftar meme bawaan. Tambah/ubah lewat shared/memes.json
app.get('/api/memes', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json(memes);
});

// Meme acak untuk tombol "Acak meme"
app.get('/api/memes/random', (_req, res) => {
  res.json(memes[Math.floor(Math.random() * memes.length)]);
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));

export default app;
