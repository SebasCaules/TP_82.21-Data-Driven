// Arma dist-site/ para publicar: landing en /, tablero E1 en /e1/, tablero E2 en /e2/.
//
// dist/ y dist-e2/ no se mezclan acá adentro porque cada build vacía su propia carpeta
// (emptyOutDir) y dist/ es además el archivo que se entrega del E1 por doble clic: si este
// script escribiera dentro de dist/, un "npm run build" corrido después lo borraría sin
// aviso. Por eso arma un tercer directorio, dist-site/, copiando el resultado de los dos
// builds sin tocarlos (ver vite.e2.config.js, que explica lo mismo para dist-e2/).
//
// Solo módulos nativos: nada de dependencias nuevas.

import { existsSync, mkdirSync, copyFileSync, statSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sitio = path.join(raiz, 'dist-site')

const archivos = [
  { origen: path.join(raiz, 'landing', 'index.html'), destino: path.join(sitio, 'index.html'), comando: null },
  { origen: path.join(raiz, 'dist', 'index.html'), destino: path.join(sitio, 'e1', 'index.html'), comando: 'npm run build' },
  { origen: path.join(raiz, 'dist-e2', 'index.html'), destino: path.join(sitio, 'e2', 'index.html'), comando: 'npm run build:e2' },
]

for (const { origen, comando } of archivos) {
  if (!existsSync(origen)) {
    const relativo = path.relative(raiz, origen)
    // Se valida ANTES de borrar dist-site/: si esto quedara después del rmSync, un
    // origen faltante dejaría el sitio publicado a medio armar (sin index.html, sin
    // e1/ ni e2/) en lugar de conservar la versión anterior.
    if (comando) {
      console.error(`Falta ${relativo}: se genera con "${comando}".`)
    } else {
      console.error(`Falta ${relativo}.`)
    }
    process.exit(1)
  }
}

if (existsSync(sitio)) rmSync(sitio, { recursive: true, force: true })
mkdirSync(sitio, { recursive: true })

for (const { origen, destino } of archivos) {
  mkdirSync(path.dirname(destino), { recursive: true })
  copyFileSync(origen, destino)
}

console.log('dist-site/ listo:')
for (const { destino } of archivos) {
  const bytes = statSync(destino).size
  console.log(`  ${path.relative(raiz, destino)}  (${bytes.toLocaleString('es-AR')} bytes)`)
}
