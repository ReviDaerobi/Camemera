// ============================================================
//  TEMPLATE SIAP PAKAI (warna + tulisan di bawah foto)
//  Tambah template barumu di sini: salin satu blok, ganti isinya.
//
//  id         nama unik (huruf kecil, tanpa spasi)
//  name       nama yang tampil di tombol
//  bg1, bg2   dua warna gradasi latar
//  accent     warna aksen (latar meme, placeholder foto)
//  ink        warna garis tepi dan teks
//  pattern    'dots' | 'stripes' | 'none'
//  caption    tulisan di bawah template
//  stickerSet 'cute' | 'food' | 'space' | 'fun' | 'none'
//  showDate   true/false, tampilkan tanggal hari ini
// ============================================================
export const TEMPLATE_PRESETS = [
  {
    id: 'bubblegum', name: 'Permen karet',
    bg1: '#FFB3D6', bg2: '#C9B8FF', accent: '#FF7EB6', ink: '#2B1B5A',
    pattern: 'dots', caption: 'Cekrek bareng!', stickerSet: 'cute', showDate: true,
  },
  {
    id: 'matcha', name: 'Matcha',
    bg1: '#B9F3D8', bg2: '#FFF3A8', accent: '#6EE7C0', ink: '#1F3B2E',
    pattern: 'stripes', caption: 'Hari yang tenang', stickerSet: 'food', showDate: true,
  },
  {
    id: 'sunset', name: 'Senja',
    bg1: '#FFD08A', bg2: '#FF8FB1', accent: '#FF9A5C', ink: '#4A1D3A',
    pattern: 'dots', caption: 'Golden hour squad', stickerSet: 'fun', showDate: true,
  },
  {
    id: 'grape', name: 'Anggur',
    bg1: '#B7A6FF', bg2: '#7FD6FF', accent: '#9C8CFF', ink: '#241552',
    pattern: 'stripes', caption: 'Squad goals', stickerSet: 'space', showDate: true,
  },
  {
    id: 'ocean', name: 'Laut',
    bg1: '#A5E3FF', bg2: '#B9F3D8', accent: '#6CC8FF', ink: '#10345A',
    pattern: 'dots', caption: 'Liburan dulu', stickerSet: 'fun', showDate: true,
  },
  {
    id: 'lemon', name: 'Lemon',
    bg1: '#FFF2A0', bg2: '#FFC6A5', accent: '#FFD84D', ink: '#4A3510',
    pattern: 'none', caption: 'Good vibes only', stickerSet: 'cute', showDate: false,
  },
  {
    id: 'maroon', name: 'Maroon',
    bg1: '#9c0404', bg2: '#6d0000', accent: '#831008', ink: '#ebe7e7',
    pattern: 'dots', caption: 'M For Maroon', stickerSet: 'cute', showDate: true,
  },
  {
    id: 'workshop', name: 'Workshop',
    bg1: '#0026ff', bg2: '#070b3b', accent: '#002dc0', ink: '#ebe7e7',
    pattern: 'dots', caption: 'Workshop', stickerSet: 'fun', showDate: true,
  },
  {
    id: 'himakom', name: 'Himakom',
    bg1: '#b700ff', bg2: '#b700ff', accent: '#ae00ff', ink: '#fcfcfc',
    pattern: 'dots', caption: 'Unguu? HIMAKOM!!', stickerSet: 'space', showDate: true,
  },
];
