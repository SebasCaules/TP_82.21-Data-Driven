import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Presentación interactiva del E3 (24/10). Mismo patrón que vite.e2.config.js: base './' para
// file:// y Pages, un solo archivo sin red, y su propia carpeta hermana (dist-e3/) para que ningún
// build vacíe la de otro. scripts/armar-sitio.mjs la copia a /e3/ del sitio.
export default defineConfig({
  root: 'e3',
  base: './',
  plugins: [react(), viteSingleFile()],
  server: { port: 5179 },
  build: {
    outDir: '../dist-e3',
    emptyOutDir: true,
    modulePreload: false,
    target: 'es2022',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 100000,
  },
})
