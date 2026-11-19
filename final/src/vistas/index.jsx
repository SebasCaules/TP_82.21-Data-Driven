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
//
// (19/11, fase 11, spec 2.3) Cada vista trae `informe`, las claves de las secciones del informe donde está su detalle
// (contenido_final.js). Acá se resuelven contra INFORME (informe.js, que escribe pipeline/informe_paginas.py desde el
// PDF del consolidado): VISTAS[i].referencia = { rotulo, enlaces: [{ clave, nombre, pagina, href }] }. El rótulo
// («Informe, secciones 31.1 y 23.2») y los enlaces los usan el botón de información del encabezado (App.jsx) y las
// notas. Una clave que no esté en INFORME.secciones corta el armado con su motivo.

import { CF } from '../contenido_final.js'
import { INFORME } from '../informe.js'
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
      if (!Array.isArray(v.informe) || !v.informe.length) throw new Error(`contenido_final.js: la vista «${v.id}» no trae informe (las secciones del informe)`)
      for (const k of v.informe) {
        if (!Number.isInteger(INFORME.secciones[k])) {
          throw new Error(`contenido_final.js: la vista «${v.id}» cita la sección «${k}», que no está en informe.js (corra pipeline/informe_paginas.py)`)
        }
      }
      vistos.add(v.id)
    }
  }
}
validar(CF.BLOQUES)

/** «a», «a y b», «a, b y c». */
const juntar = (xs) => (xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`)
const ANEXO = /^A(\d+)\./

/** El rótulo de unas claves del informe, en su orden: «Informe, sección 23.6», «Informe, secciones 31.1 y 23.2»,
 *  «Informe, sección 21.1 y Anexo 1, A1.2», «Informe, Anexo 1, A1.12». */
export function rotuloInforme(claves) {
  const secciones = claves.filter((k) => !ANEXO.test(k))
  const anexos = new Map()
  for (const k of claves.filter((x) => ANEXO.test(x))) {
    const n = k.match(ANEXO)[1]
    anexos.set(n, [...(anexos.get(n) ?? []), k])
  }
  const partes = []
  if (secciones.length) partes.push(`${secciones.length > 1 ? 'secciones' : 'sección'} ${juntar(secciones)}`)
  for (const [n, ks] of anexos) partes.push(`Anexo ${n}, ${juntar(ks)}`)
  return `Informe, ${juntar(partes)}`
}

/** La referencia de una vista: el rótulo y un enlace por clave, a la hoja donde empieza la sección. */
function referencia(claves) {
  return {
    rotulo: rotuloInforme(claves),
    enlaces: claves.map((k) => {
      const pagina = INFORME.secciones[k]
      const n = k.match(ANEXO)?.[1]
      return { clave: k, nombre: n ? `Anexo ${n}, ${k}` : `Sección ${k}`, pagina, href: `${INFORME.url}#page=${pagina}` }
    }),
  }
}

const HISTORIA = CF.BLOQUES.flatMap((b) => b.vistas.map((v) => ({
  ...v,
  bloque: b.id,
  integrante: v.integrante ?? b.integrante ?? '',
  referencia: referencia(v.informe),
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

