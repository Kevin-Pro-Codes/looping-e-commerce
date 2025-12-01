import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 3000,
  },

  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'src/components/main.jsx'),
    },
  },
});
