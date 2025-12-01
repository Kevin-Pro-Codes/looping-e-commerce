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
  plugins: [],
}