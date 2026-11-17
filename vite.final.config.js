// Presentación final (17/11): /final/, hermana de /e3/. La configuración de vite.e3.config.js tal cual (base './' para
// file:// y Pages, un solo archivo sin red, el plugin de PostCSS de la ventana lógica que deja el zoom uniforme de /e3/)
// con su raíz, su puerto y su carpeta propia (dist-final/), para que ningún build vacíe la de otro.
// scripts/armar-sitio.mjs la copia a /final/ del sitio. Las variables de letra se leen también de final/src: el armado
// de /e3/ no cambia (su lista de hojas sigue siendo la suya).
import base, { HOJAS, ventanaLogica } from './vite.e3.config.js'

export default {
  ...base,
  root: 'final',
  css: { postcss: { plugins: [ventanaLogica([...HOJAS, 'final/src'])] } },
  server: { port: 5180 },
  build: { ...base.build, outDir: '../dist-final' },
}
