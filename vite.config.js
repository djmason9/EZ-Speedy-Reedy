import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EZ Speedy Reedy',
        short_name: 'SpeedyReedy',
        description: 'Speed reading with Optimal Recognition Point (ORP) technique',
        theme_color: '#5b8a6e',
        background_color: '#fdf6e3',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          // apple-touch-icon: included here so vite-plugin-pwa caches it exactly once
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Cache all built assets.
        // Root-level icon files are excluded here because vite-plugin-pwa already
        // adds them to the precache via the manifest icons list above — letting the
        // glob pick them up too creates duplicates that can silently break SW install.
        globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,woff,woff2,md}'],
        globIgnores: [
          '**/icon.svg',
          '**/icon-192.png',
          '**/icon-512.png',
          '**/apple-touch-icon.png',
        ],
        // pdf.js worker is ~2–4 MB — raise the limit so it gets cached
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            // Cache the corsproxy requests so recently-fetched articles work offline
            urlPattern: /^https:\/\/corsproxy\.io\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'url-articles',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 1 week
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    // pdfjs-dist must NOT be pre-bundled — its worker references `self`
    // (a browser global) and Vite's CJS transform would break it
    exclude: ['pdfjs-dist']
  },
  worker: {
    // Bundle PDF.js worker as ES module so the ?url import resolves correctly
    format: 'es'
  }
})
