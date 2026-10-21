import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
const backendTarget = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8888';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/register': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/google-auth': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/addresses': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/forgot-password': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/reset-password': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/email': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/api/infos': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.jsx'),
    },
  },
});
