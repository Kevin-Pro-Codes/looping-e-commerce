/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgglblack: '#0000003d', // your custom semi-transparent black
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],

function ({ addUtilities }) {
      addUtilities({
        /* Chrome, Safari, Opera */
        '.no-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        /* Firefox */
        '.no-scrollbar': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none', // IE and Edge
        },
      })
    }
  

}