// El HTML de un solo archivo de /final/ para mandar o abrir con doble clic (17/11), con el mismo método que
// scripts/vite.e3-sobre.config.js: la configuración de vite.final.config.js y un plugin que, al empaquetar, puede sacar
// vistas del recorrido sin tocar los componentes. Filtra VISTAS en final/src/vistas/index.jsx (de VISTAS salen el riel,
// el avance, las notas, los tiempos y el recorrido). Hoy no saca ninguna: FUERA está vacío.
//
//   npx vite build --config scripts/vite.final-sobre.config.js [--outDir <carpeta>]   (relativa a final/, la raíz)
//
// Sin --outDir escribe en dist-final-sobre/ (fuera del control de versiones). Una carpeta del vault se pasa con
// ../../<ruta> desde final/ (con ../<ruta> escribe dentro de app/: es la trampa del sobre del E3).
import base from '../vite.final.config.js'

const FUERA = []   // ids de las vistas que el sobre no lleva, por ejemplo ['V07']

function sinVistas() {
  return {
    name: 'final-sobre-sin-vistas',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replace(/\\/g, '/').endsWith('/final/src/vistas/index.jsx')) return null
      const a = 'export const VISTAS = HISTORIA.map('
      const b = 'export const TOTAL_VISTAS = HISTORIA.length'
      if (!code.includes(a) || !code.includes(b)) {
        throw new Error('vite.final-sobre: index.jsx cambió; no encuentro VISTAS o TOTAL_VISTAS para filtrar')
      }
      return code
        .replace(a, `export const VISTAS = HISTORIA.filter((v) => !${JSON.stringify(FUERA)}.includes(v.id)).map(`)
        .replace(b, 'export const TOTAL_VISTAS = VISTAS.length')
    },
  }
}

export default {
  ...base,
  plugins: [sinVistas(), ...base.plugins],
  build: { ...base.build, outDir: '../dist-final-sobre' },
}
