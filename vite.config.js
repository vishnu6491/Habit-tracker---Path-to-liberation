import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // CRITICAL: Fixes asset 404s on GitHub Pages / PWA deployment
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Habit Quest: Path to Liberation',
        short_name: 'Habit Quest',
        description: 'A spiritual discipline RPG habit tracker',
        theme_color: '#1a1a1a',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
