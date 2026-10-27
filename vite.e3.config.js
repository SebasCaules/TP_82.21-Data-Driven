import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Presentación interactiva del E3 (24/10). Mismo patrón que vite.e2.config.js: base './' para
// file:// y Pages, un solo archivo sin red, y su propia carpeta hermana (dist-e3/) para que ningún
// build vacíe la de otro. scripts/armar-sitio.mjs la copia a /e3/ del sitio.
//
// (27/10, W1, decisión N0-5) /e3/ es el tablero del E2 con la letra más grande: un zoom uniforme de
// toda la página con factor k (e3/src/zoom.js). Hacerlo con `zoom` de CSS sobre una caja tiene un
// problema: las hojas del E1 y del E2 miden casi todo en vw y vh, y esas unidades siguen mirando la
// ventana real (y además se multiplican por el zoom), así que la página se saldría de la ventana. El
// navegador, con su propio zoom, achica la ventana lógica a ancho / k; esto hace lo mismo sin tocar
// src/** ni e2/**: al empaquetar el E3, este plugin de PostCSS reescribe en las hojas
//   - vw → cqw y vh → cqh, medidas contra la caja .e3-vp (container-type: size), que mide la ventana
//     lógica (ancho / k × alto / k);
//   - los @media de ancho o alto → @container e3vp, evaluados contra la misma caja; `:root`, `html` y
//     `body` dentro de esos bloques pasan a .e3-vp-dentro (una consulta de contenedor no alcanza al
//     contenedor ni a sus ancestros). @media print, screen y prefers-* quedan como están.
// Resultado: /e3/ a W × H se ve exactamente como /e2/ a W/k × H/k, ampliado k veces. Lo mide
// scripts/paridad_e3.py. Las hojas fuente no cambian: dist-e2/ y dist/ siguen idénticos.
const RAIZ_LOGICA = '.e3-vp-dentro'

function ventanaLogica() {
  const UNIDAD = /(\d*\.?\d+)(vw|vh)\b/g
  const RASGO = /\((?:min|max)-(?:width|height)\s*:/
  return {
    postcssPlugin: 'e3-ventana-logica',
    Declaration(decl) {
      if (/\d(vw|vh)\b/.test(decl.value)) {
        decl.value = decl.value.replace(UNIDAD, (_, n, u) => n + (u === 'vw' ? 'cqw' : 'cqh'))
      }
    },
    AtRule: {
      media(at) {
        if (!RASGO.test(at.params) || /\bprint\b/.test(at.params)) return
        const consultas = at.params.split(',').map((q) => q.trim()
          .replace(/^(only\s+)?screen\s+and\s+/i, '')
          .replace(/^(only\s+)?all\s+and\s+/i, ''))
        if (consultas.some((q) => /\b(screen|print|all)\b/.test(q) || !q.startsWith('('))) return
        at.name = 'container'
        at.params = 'e3vp ' + consultas.map((q) => (consultas.length > 1 ? `(${q})` : q)).join(' or ')
        at.walkRules((r) => {
          r.selectors = r.selectors.map((s) => s.replace(/^(:root|html|body)(?=$|[\s.:[>+~])/, RAIZ_LOGICA))
        })
      },
    },
  }
}
ventanaLogica.postcss = true

export default defineConfig({
  root: 'e3',
  base: './',
  plugins: [react(), viteSingleFile()],
  css: { postcss: { plugins: [ventanaLogica()] } },
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
