import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'RN Donat — Donat Premium Payakumbuh',
        short_name: 'RN Donat',
        description: 'Donat premium dengan 5 varian rasa. 1 kotak isi 6 donat hanya Rp 15.000.',
        theme_color: '#8B4513',
        background_color: '#FDF5E6',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split charts library
          if (id.includes('node_modules/recharts')) return 'charts';
          
          // Split animation library
          if (id.includes('node_modules/framer-motion')) return 'motion';
          
          // Split router
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          
          // Split Firebase by feature
          if (id.includes('node_modules/firebase/analytics')) return 'firebase-analytics';
          if (id.includes('node_modules/firebase/firestore')) return 'firebase-db';
          if (id.includes('node_modules/firebase/auth')) return 'firebase-auth';
          if (id.includes('node_modules/firebase/')) return 'firebase-core';
          
          // Split export libraries (lazy loaded)
          if (id.includes('node_modules/xlsx')) return 'xlsx';
          if (id.includes('node_modules/jspdf')) return 'jspdf';
          if (id.includes('node_modules/html2canvas')) return 'html2canvas';
          
          // Split React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // Everything else from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Enable source maps for debugging
    sourcemap: false, // Disable in production for smaller builds
  },
});
