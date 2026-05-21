import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
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
