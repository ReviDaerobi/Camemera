// Kumpulan elemen grafis SVG yang dipakai berulang di seluruh halaman.
const INK = '#2B1B5A';

export function Sparkle({ color = '#FFD84D', className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 0C13 7 17 11 24 12 17 13 13 17 12 24 11 17 7 13 0 12 7 11 11 7 12 0Z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Star({ color = '#FFD84D', className = '', style }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <polygon points="50,6 62,38 96,38 68,59 79,92 50,72 21,92 32,59 4,38 38,38" fill={color} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    </svg>
  );
}

export function Heart({ color = '#FF7EB6', className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" fill={color} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function Flower({ color = '#FF7EB6', center = '#FFD84D', className = '', style }) {
  const petals = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      {petals.map((a) => (
        <circle key={a} cx={50 + 26 * Math.cos((a * Math.PI) / 180)} cy={50 + 26 * Math.sin((a * Math.PI) / 180)} r="19" fill={color} stroke={INK} strokeWidth="4" />
      ))}
      <circle cx="50" cy="50" r="16" fill={center} stroke={INK} strokeWidth="4" />
    </svg>
  );
}

export function Blob({ color = '#9C8CFF', className = '', style, variant = 0 }) {
  const paths = [
    'M43.7,-57.3C55.6,-48.9,63.5,-34.4,67.6,-18.6C71.7,-2.8,72,14.3,64.6,27.3C57.2,40.3,42.2,49.2,26.9,56.1C11.6,63,-4,68,-19.6,65.1C-35.2,62.2,-50.8,51.4,-60.1,37C-69.4,22.6,-72.4,4.6,-68.2,-10.9C-64,-26.4,-52.6,-39.3,-39.9,-47.6C-27.2,-55.9,-13.6,-59.6,1.2,-61.2C16,-62.8,31.9,-65.7,43.7,-57.3Z',
    'M39.9,-52.4C51.6,-43.9,60.9,-31.7,65.2,-17.5C69.5,-3.4,68.8,12.7,61.9,25.4C55,38.1,41.9,47.4,27.9,53.6C13.9,59.8,-1.1,62.9,-15.6,59.8C-30.1,56.7,-44.1,47.4,-53.4,34.5C-62.7,21.6,-67.3,5.1,-64.3,-9.6C-61.3,-24.3,-50.7,-37.2,-38.2,-45.6C-25.7,-54,-12.9,-57.9,0.9,-59.1C14.6,-60.3,28.3,-60.9,39.9,-52.4Z',
  ];
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden="true">
      <path d={paths[variant % paths.length]} fill={color} stroke={INK} strokeWidth="3" />
    </svg>
  );
}

export function Squiggle({ color = '#FF7EB6', className = '', style }) {
  return (
    <svg viewBox="0 0 120 20" className={className} style={style} aria-hidden="true">
      <path d="M2 10 Q 12 0 22 10 T 42 10 T 62 10 T 82 10 T 102 10 T 118 10" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function Ring({ color = '#6CC8FF', className = '', style }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <circle cx="50" cy="50" r="38" fill="none" stroke={INK} strokeWidth="5" />
      <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="16" strokeDasharray="22 14" />
    </svg>
  );
}

export function Cloud({ color = '#fff', className = '', style }) {
  return (
    <svg viewBox="0 0 120 70" className={className} style={style} aria-hidden="true">
      <path d="M30 62a22 22 0 0 1-2-43 28 28 0 0 1 52-6 24 24 0 0 1 14 49z" fill={color} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}
