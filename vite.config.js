import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' para que el mismo archivo sirva desde Pages y desde file://
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    // sin polyfill de modulepreload: es el unico fetch() que quedaba en el bundle.
    // Con todo inlineado no llegaba a disparar, pero asi "cero red" es estructural.
    modulePreload: false,
    target: 'es2022',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 100000,
  },
})
