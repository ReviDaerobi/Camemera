// Semua gambar di src/assets/memes/ otomatis jadi pilihan di Galeri meme.
// Tidak perlu mengubah kode: cukup taruh file gambar di folder itu.
const files = import.meta.glob('/src/assets/memes/*.{png,jpg,jpeg,webp,gif,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const MEME_IMAGES = Object.entries(files)
  .map(([path, url]) => ({
    id: path,
    url,
    name: path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
