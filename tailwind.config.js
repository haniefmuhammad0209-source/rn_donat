/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FDF5E6',
        'light-brown': '#D2B48C',
        'pastel-pink': '#FFD1DC',
        'chocolate': '#8B4513',
        'dark-chocolate': '#5D3A1A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        elegant: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
