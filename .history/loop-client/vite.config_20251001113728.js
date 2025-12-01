import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 extend: {
      colors: {
        // Define your custom color
        'bgc': {
          500: '#00fa21ff', // example hex
        },
      },
    },
  
 
  plugins: 
  [react(), tailwindcss()],

   
})
