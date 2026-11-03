// El tablero del sobre del E3 (03/11, fase W9): el mismo /e3/ con las vistas 1 a 8, sin las dos de la corrección al
// Grupo 5 (V09 y V10), que van en su propia planilla (E-). No toca los componentes: al empaquetar, un plugin filtra
// HISTORIA en e3/src/vistas/index.jsx (VISTAS y TOTAL_VISTAS salen de ahí, y de VISTAS salen el riel, el avance, las
// notas y el recorrido). El resto es la configuración de vite.e3.config.js tal cual.
//
//   npx vite build --config scripts/vite.e3-sobre.config.js --outDir <carpeta>   (relativa a e3/, la raíz de vite)
//
// Sin --outDir escribe en dist-e3-sobre/ (fuera del control de versiones solo si se agrega a .gitignore: mejor pasar
// una carpeta de entregas/entregable-3/_build/F/tmp/). El HTML resultante se copia a
// entregas/entregable-3/finales/Entregable 3 - Tablero - GRUPO 2.html.
import base from '../vite.e3.config.js'

const FUERA = ['V09', 'V10']
const PASE = ' Ahora, nuestra corrección al Grupo 5.'   // final del guion de la diapositiva 13 (vista 8)
const ULTIMA = 13                                       // última diapositiva de la vista 8

function sinCorreccion() {
  return {
    name: 'e3-sobre-sin-correccion',
    enforce: 'pre',
    transform(code, id) {
      const ruta = id.replace(/\\/g, '/')
      // (V6, vuelta 1) Las notas de la vista 8 no anuncian la corrección al Grupo 5, que el sobre no trae.
      if (ruta.endsWith('/e3/src/contenido_e3.js')) {
        if (!code.includes(PASE)) throw new Error('vite.e3-sobre: contenido_e3.js ya no trae el pase a la corrección')
        // (V6, re-verificación) El total de las notas es el de las diapositivas 2 a 13 (vistas 1 a 8), no el de la
        // presentación entera con la corrección.
        let propia = 0
        for (const m of code.matchAll(/"diapositivas":\s*\[([\d,\s]+)\],\s*"segundos":\s*(\d+)/g)) {
          if (Math.max(...m[1].split(',').map(Number)) <= ULTIMA) propia += Number(m[2])
        }
        if (!propia || !/"total_s":\s*\d+/.test(code)) throw new Error('vite.e3-sobre: no encuentro los tiempos')
        return code.replace(PASE, '').replace(/"total_s":\s*\d+/, `"total_s": ${propia}`)
      }
      if (!ruta.endsWith('/e3/src/vistas/index.jsx')) return null
      const a = 'export const VISTAS = HISTORIA.map('
      const b = 'export const TOTAL_VISTAS = HISTORIA.length'
      if (!code.includes(a) || !code.includes(b)) {
        throw new Error('vite.e3-sobre: index.jsx cambió; no encuentro VISTAS o TOTAL_VISTAS para filtrar')
      }
      return code
        .replace(a, `export const VISTAS = HISTORIA.filter((v) => !${JSON.stringify(FUERA)}.includes(v.id)).map(`)
        .replace(b, 'export const TOTAL_VISTAS = VISTAS.length')
    },
  }
}

export default {
  ...base,
  plugins: [sinCorreccion(), ...base.plugins],
  build: { ...base.build, outDir: '../dist-e3-sobre' },
}
