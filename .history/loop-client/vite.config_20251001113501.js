import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: 
  [react(), tailwindcss()],

    colors: {
        'bg': '#e7e7e7ff',
      },
})
