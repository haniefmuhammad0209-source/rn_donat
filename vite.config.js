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
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) return 'router';
          if (id.includes('node_modules/firebase/analytics')) return 'firebase-analytics';
          if (id.includes('node_modules/firebase/firestore')) return 'firebase-db';
          if (id.includes('node_modules/firebase/auth')) return 'firebase-auth';
          if (id.includes('node_modules/firebase/')) return 'firebase-core';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
