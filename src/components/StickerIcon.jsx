import { iconDataUrl } from '../lib/stickers.js';

// Ikon stiker sebagai gambar SVG (pengganti emoji di UI)
export default function StickerIcon({ id, className = 'h-8 w-8', ink }) {
  return <img src={iconDataUrl(id, ink)} alt="" aria-hidden="true" draggable={false} className={className} />;
}
