import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Saat development, request /api diteruskan ke Express di port 3001
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
});
