import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Mismo patrón que vite.config.js (E1): base './' para file:// y Pages, un solo archivo
// sin red. `root: 'e2'` apunta el build a la SPA de calidad de datos sin tocar la del E1.
//
// outDir NO cuelga de dist/: vite.config.js (E1) no declara emptyOutDir, y el default de
// Vite (true, porque outDir queda dentro de la raíz del proyecto) vacía dist/ entero antes
// de escribir. Si el build de E2 escribiera en dist/e2, cualquier 'npm run build' (E1)
// corrido después lo borra sin aviso, en cualquier orden que alguien los encadene. Con
// dist-e2 como hermano de dist/, ninguno de los dos build toca el directorio del otro. La
// unión en un solo sitio de Pages (dist/index.html + dist/e2/index.html) queda para cuando
// la branch se integre a main (ver N0-1 en wiki/entregables/plan-entregable-2.md): ese paso
// deberá copiar dist-e2/ a dist/e2/ DESPUES de 'npm run build', nunca antes.
export default defineConfig({
  root: 'e2',
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../dist-e2',
    emptyOutDir: true,
    modulePreload: false,
    target: 'es2022',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 100000,
  },
})
