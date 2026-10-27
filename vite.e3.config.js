import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
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
//
// (27/10, W2.0, decisión N0-13) La letra no sigue esa regla: mide contra la ventana real. Las
// declaraciones de letra (font, font-size, line-height, letter-spacing y las variables que alguna hoja
// usa en ellas, como --e2-txt o --e2-rot) conservan sus vw y vh, que bajo el zoom valen k veces lo que
// valen en /e2/ en la misma ventana; dentro de un @media de ancho o alto, esas declaraciones quedan en
// un @media aparte, evaluado contra la ventana real, y el resto pasa al @container. Resultado: la caja
// de cada cosa es la de /e2/ a W/k × H/k, ampliada k veces, y cada texto mide k veces lo que mide en
// /e2/ en la misma ventana W × H. Lo miden scripts/paridad_e3.py y scripts/verificar_e3.py. Las hojas
// fuente no cambian: dist-e2/ y dist/ siguen idénticos.
const RAIZ_LOGICA = '.e3-vp-dentro'
const APP = fileURLToPath(new URL('.', import.meta.url))
const HOJAS = ['src', 'e2/src', 'e3/src']
const PROP_LETRA = /^(font|font-size|line-height|letter-spacing)$/

/** Las variables que fijan un tamaño de letra: las que alguna hoja del tablero usa en una propiedad de
 *  letra. Se leen de las fuentes al cargar la configuración, así no dependen del orden de las hojas. */
function variablesDeLetra() {
  const nombres = new Set()
  for (const dir of HOJAS) {
    for (const f of readdirSync(join(APP, dir), { recursive: true })) {
      if (!String(f).endsWith('.css')) continue
      const css = readFileSync(join(APP, dir, String(f)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const m of css.matchAll(/(?:^|[;{\s])(?:font|font-size|line-height|letter-spacing)\s*:([^;}]*)/g)) {
        for (const v of m[1].matchAll(/var\(\s*(--[\w-]+)/g)) nombres.add(v[1])
      }
    }
  }
  return nombres
}

function ventanaLogica() {
  const UNIDAD = /(\d*\.?\d+)(vw|vh)\b/g
  const RASGO = /\((?:min|max)-(?:width|height)\s*:/
  const letra = variablesDeLetra()
  const esLetra = (d) => PROP_LETRA.test(d.prop) || letra.has(d.prop)
  // Deja solo las declaraciones que cumplen `queda` y borra las reglas que quedan vacías.
  const filtrar = (bloque, queda) => {
    bloque.walkDecls((d) => { if (!queda(d)) d.remove() })
    bloque.walkComments((c) => c.remove())
    bloque.walkRules((r) => { if (!r.nodes.length) r.remove() })
    return bloque.nodes.length > 0
  }
  return {
    postcssPlugin: 'e3-ventana-logica',
    Once(root) {
      root.walkAtRules('media', (at) => {
        if (!RASGO.test(at.params) || /\bprint\b/.test(at.params)) return
        const consultas = at.params.split(',').map((q) => q.trim()
          .replace(/^(only\s+)?screen\s+and\s+/i, '')
          .replace(/^(only\s+)?all\s+and\s+/i, ''))
        if (consultas.some((q) => /\b(screen|print|all)\b/.test(q) || !q.startsWith('('))) return
        // La letra queda en un @media contra la ventana real, en el mismo lugar de la cascada.
        const real = at.clone()
        if (filtrar(real, esLetra)) at.before(real)
        if (!filtrar(at, (d) => !esLetra(d))) { at.remove(); return }
        at.name = 'container'
        at.params = 'e3vp ' + consultas.map((q) => (consultas.length > 1 ? `(${q})` : q)).join(' or ')
        at.walkRules((r) => {
          r.selectors = r.selectors.map((s) => s.replace(/^(:root|html|body)(?=$|[\s.:[>+~])/, RAIZ_LOGICA))
        })
      })
      root.walkDecls((decl) => {
        if (esLetra(decl) || !/\d(vw|vh)\b/.test(decl.value)) return
        decl.value = decl.value.replace(UNIDAD, (_, n, u) => n + (u === 'vw' ? 'cqw' : 'cqh'))
      })
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
