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
        // Enhanced palette
        'warm-cream': '#FFF8E7',
        'peach': '#FFE5D9',
        'rose-gold': '#E8B4A8',
        'caramel': '#C68642',
        'espresso': '#4A2C2A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        elegant: ['Playfair Display', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 209, 220, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 209, 220, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
