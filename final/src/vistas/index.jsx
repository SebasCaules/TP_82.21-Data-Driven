// Registro de vistas de /final/ (17/11). Mismo patrón que e3/src/vistas/index.jsx, con una diferencia: el orden, los
// bloques y los tiempos no se escriben acá, salen de un solo arreglo, CF.BLOQUES de contenido_final.js. De ese arreglo
// derivan HISTORIA (el recorrido), los grupos del riel (uno por bloque), el número de cada vista (su posición) y los
// tiempos de las notas (de la vista, acumulado del bloque y total).
//
// Cada vista es un archivo `Vnn_Nombre.jsx` que exporta `default` (el componente) y `meta = { id }`; con
// `meta = { id, plena: true }` (18/11, spec 1.5) App.jsx la dibuja sin riel ni encabezado, con la ventana lógica entera
// (VISTAS[i].plena). (19/11, fase 9, spec 2; fase 10, regla 4) `meta.pasos`, entero de 1 a 6 (MAX_PASOS de pasos.js),
// son los pasos de su avance (VISTAS[i].pasos; sin él, 1; otro valor corta el armado con su motivo, pasosDe de
// pasos.js). Una vista con lienzo y esqueleto (VistaLienzo de Plantilla.jsx) no declara nada: es una vista común para
// App.jsx. Ningún builder toca
// este archivo para sumar la suya: alcanza con crear el archivo y listar la vista en CF.BLOQUES. Una vista listada sin
// archivo se muestra como esqueleto (e3/src/vistas/Esqueleto.jsx). Un `V*.jsx` sin `default` no se registra.
//
// scripts/vite.final-sobre.config.js filtra VISTAS con las dos líneas marcadas abajo: si cambian, ese plugin corta.

import { CF } from '../contenido_final.js'
import Esqueleto from '../../../e3/src/vistas/Esqueleto.jsx'
import { pasosDe } from '../pasos.js'

const modulos = import.meta.glob('./V*.jsx', { eager: true })
const porId = {}
for (const [ruta, m] of Object.entries(modulos)) {
  const id = m.meta?.id ?? ruta.replace(/^\.\/(V\d+[a-z]?).*$/, '$1')
  if (typeof m.default === 'function') porId[id] = m
}

// Un error de forma en CF corta acá, con su motivo, en vez de dibujar un tablero a medias.
function validar(bloques) {
  const vistos = new Set()
  for (const b of bloques) {
    if (!b.id || !b.titulo || !Array.isArray(b.vistas)) throw new Error(`contenido_final.js: el bloque «${b.id ?? '?'}» necesita id, titulo y vistas`)
    for (const v of b.vistas) {
      if (!v.id || !v.titulo || !v.pregunta) throw new Error(`contenido_final.js: la vista «${v.id ?? '?'}» necesita id, titulo y pregunta`)
      if (vistos.has(v.id)) throw new Error(`contenido_final.js: la vista «${v.id}» está dos veces`)
      if (!(Number.isFinite(v.segundos) && v.segundos >= 0)) throw new Error(`contenido_final.js: la vista «${v.id}» no tiene segundos`)
      vistos.add(v.id)
    }
  }
}
validar(CF.BLOQUES)

const HISTORIA = CF.BLOQUES.flatMap((b) => b.vistas.map((v) => ({
  ...v,
  bloque: b.id,
  integrante: v.integrante ?? b.integrante ?? '',
})))

// (sobre) las dos líneas que filtra scripts/vite.final-sobre.config.js
export const VISTAS = HISTORIA.map((v) => ({
  ...v,
  esqueleto: !porId[v.id],
  plena: porId[v.id]?.meta?.plena === true,
  pasos: pasosDe({ id: v.id, ...porId[v.id]?.meta }),
  Componente: porId[v.id]?.default ?? Esqueleto,
}))
export const TOTAL_VISTAS = HISTORIA.length

/** Los bloques con sus vistas (las que quedaron en VISTAS) y sus segundos; los que se quedan sin vistas no van. */
export const BLOQUES = CF.BLOQUES.map((b) => {
  const vs = VISTAS.filter((v) => v.bloque === b.id)
  return { ...b, nombre: b.riel ?? b.titulo, ids: vs.map((v) => v.id), segundos: vs.reduce((s, v) => s + v.segundos, 0) }
}).filter((b) => b.ids.length)

/** «05» para la quinta vista: el mismo rótulo en el riel y en el encabezado. Sale de la posición, no del id. */
export const etiquetaDe = (v) => String(VISTAS.findIndex((x) => x.id === v.id) + 1).padStart(2, '0')
/** El grupo del riel de la vista: su bloque (`nombre` es el rótulo del riel). */
export const grupoDe = (v) => BLOQUES.find((b) => b.ids.includes(v.id)) ?? BLOQUES[BLOQUES.length - 1]
export const indiceDe = (id) => VISTAS.findIndex((v) => v.id === id)
export const TOTAL_S = VISTAS.reduce((s, v) => s + v.segundos, 0)

/** Los tiempos de la vista para las notas: el suyo, el acumulado del bloque hasta ella (incluida) contra el total del
 *  bloque, y el acumulado de la presentación hasta ella contra el total. */
export function tiemposDe(v) {
  const i = indiceDe(v.id)
  const b = grupoDe(v)
  const hasta = (xs) => xs.slice(0, xs.findIndex((x) => x.id === v.id) + 1).reduce((s, x) => s + x.segundos, 0)
  return {
    vista: v.segundos,
    bloqueHasta: hasta(VISTAS.filter((x) => x.bloque === b.id)),
    bloque: b.segundos,
    totalHasta: hasta(VISTAS.slice(0, i + 1)),
    total: TOTAL_S,
  }
}

