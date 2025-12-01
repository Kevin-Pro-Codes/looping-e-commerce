import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 extend: {
      colors: {
        // Define your custom color
        'bggreen': {
          500: '#00fa2aff', // example hex
        },
      },
    },
  
 
  plugins: 
  [react(), tailwindcss()],

   
})
