import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 extend: {
      colors: {
        bgglblack: '#0000003d', 
    
      
      },
    },
  
  host: true,   
  port: 5173,    

  plugins: 
  [react(), tailwindcss()],

   
})
