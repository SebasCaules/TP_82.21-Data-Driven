// El HTML de /final/ con una sola vista (18/11, fase 8 de la auditoría de dataviz), para scripts/captura_vista.py. Es la
// configuración de vite.final.config.js con un plugin que, con FINAL_VISTA=V05, cambia el módulo de toda otra vista
// final/src/vistas/V*.jsx por uno vacío: final/src/vistas/index.jsx la registra como esqueleto, y un archivo roto de otro
// agente no rompe el armado (ni se lee). Sin FINAL_VISTA arma las quince, como vite.final.config.js.
//
//   FINAL_VISTA=V05 npx vite build --config scripts/vite.final-vista.config.js --outDir <carpeta absoluta>
//
// Sin --outDir escribe en dist-final-vista/ (fuera del control de versiones). No vacía la carpeta de salida: el script
// le pasa una carpeta temporal nueva en cada corrida, así pueden correr varias a la vez.
import base from '../vite.final.config.js'

const VISTA = (process.env.FINAL_VISTA ?? '').trim().toUpperCase()
const RUTA = /\/final\/src\/vistas\/(V\d+)[^/]*\.jsx$/

function soloUnaVista() {
  return {
    name: 'final-vista-sola',
    enforce: 'pre',
    load(id) {
      if (!VISTA) return null
      const m = id.split('?')[0].replace(/\\/g, '/').match(RUTA)
      if (!m || m[1].toUpperCase() === VISTA) return null
      // sin default: index.jsx no la registra y dibuja el esqueleto en su lugar
      return `export const meta = { id: ${JSON.stringify(m[1])} }\n`
    },
  }
}

if (VISTA && !/^V\d{2}$/.test(VISTA)) throw new Error(`vite.final-vista: FINAL_VISTA=«${VISTA}» no es un id de vista (V01 a V15)`)

export default {
  ...base,
  plugins: [soloUnaVista(), ...base.plugins],
  logLevel: 'warn',
  build: { ...base.build, outDir: '../dist-final-vista', emptyOutDir: false },
}
