/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        milk: '#FFF4FA',
        ink: '#2B1B5A',
        bubble: '#FF7EB6',
        peri: '#9C8CFF',
        mint: '#6EE7C0',
        butter: '#FFD84D',
        sky: '#6CC8FF',
        tangerine: '#FF9A5C',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
        meme: ['Anton', 'Impact', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        pop: '6px 6px 0 0 #2B1B5A',
        'pop-sm': '3px 3px 0 0 #2B1B5A',
        'pop-lg': '10px 10px 0 0 #2B1B5A',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' },
          '50%': { transform: 'translateY(-14px) rotate(calc(var(--r,0deg) + 4deg))' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        spin360: { to: { transform: 'rotate(360deg)' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
        pop: {
          '0%': { transform: 'scale(.4)', opacity: 0 },
          '60%': { transform: 'scale(1.15)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        flash: { '0%': { opacity: 0.95 }, '100%': { opacity: 0 } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
        spin360: 'spin360 18s linear infinite',
        marquee: 'marquee 28s linear infinite',
        pop: 'pop .45s ease-out both',
        flash: 'flash .35s ease-out forwards',
      },
    },
  },
  plugins: [],
};
