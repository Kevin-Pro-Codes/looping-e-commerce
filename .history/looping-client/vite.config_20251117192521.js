import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    proxy: {
      // TODAS as requisições que começarem com /api vão para o Laravel
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Opcional: mostra no terminal quando o proxy é usado
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy →', req.method, req.url);
          });
        },
      },
    },
  },

  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'src/components/main.jsx'),
    },
  },
});