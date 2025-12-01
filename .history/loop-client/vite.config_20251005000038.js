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
  
 server: {
    host: true,  
    port: 3000, // change this to your preferred port
  },


  plugins: 
  [react(), tailwindcss()],

   
})
