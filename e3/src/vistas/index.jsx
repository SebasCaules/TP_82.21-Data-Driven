// Registro de vistas de /e3/ (27/10, W1). Mismo patrón que e2/src/vistas/index.jsx: el orden ES el
// recorrido, cada vista es un archivo `Vnn_Nombre.jsx` (o `An_Nombre.jsx` para el respaldo) que exporta
// `default` (el componente) y `meta = { id }`. Ningún builder toca este archivo para sumar la suya:
// alcanza con crear el archivo. Una vista sin archivo se muestra como esqueleto con su pregunta.
//
// La historia (PLAN.md del E3, «La historia»): nueve vistas presentadas y el grupo «Respaldo» con los
// anexos A1 a A7 de C3. `de` dice de qué diapositivas de C3 sale cada vista: de ahí toman el guion las
// notas del orador (N). La pregunta va en una línea de hasta 74 caracteres (regla 12 del E2).

import { C3 } from '../contenido_e3.js'
import Esqueleto from './Esqueleto.jsx'

const modulos = import.meta.glob(['./V*.jsx', './A*.jsx'], { eager: true })
const porId = {}
for (const [ruta, m] of Object.entries(modulos)) {
  const id = m.meta?.id ?? ruta.replace(/^\.\/([VA]\d+[a-z]?).*$/, '$1')
  if (typeof m.default === 'function') porId[id] = m
}

const HISTORIA = [
  { id: 'V01', corto: 'La respuesta', pregunta: '¿Conviene anticipar a quien deja de comprar?', de: [2] },
  { id: 'V02', corto: 'Quién se va', pregunta: '¿Quién se va?', de: [3] },
  { id: 'V03', corto: 'Se puede hacer', pregunta: '¿Se puede hacer?', de: [4, 5] },
  { id: 'V04', corto: 'Modelo o regla', pregunta: '¿El modelo mejora a la regla?', de: [6, 7] },
  { id: 'V05', corto: 'Se paga', pregunta: '¿Se paga?', de: [8, 9] },
  { id: 'V06', corto: 'Legal y seguro', pregunta: '¿Es legal y seguro?', de: [10, 11] },
  { id: 'V07', corto: 'Qué dice el test', pregunta: '¿Qué dice el test?', de: [] },
  { id: 'V08', corto: 'Paso a producción', pregunta: '¿Cómo llega a producción?', de: [] },
  { id: 'V09', corto: 'Qué decide María G.', pregunta: '¿Qué decide María G.?', de: [12] },
]
// El respaldo: un anexo de C3 por vista. El nombre corto es el título del anexo hasta los dos puntos.
const PREGUNTA_ANEXO = {
  A1: '¿Cómo se parten los datos en el tiempo?',
  A2: '¿Dónde se corta la lista?',
  A3: '¿Qué supuesto mueve el ROI?',
  A4: '¿Qué riesgos hay y qué se hace con cada uno?',
  A5: '¿El error es parejo entre segmentos?',
  A6: '¿Cuánto cuesta el año 1?',
  A7: '¿Cómo se equivocan la logística y la regla?',
}
const RESPALDO = C3.ANEXOS.map((a) => ({
  id: a.n, corto: a.titulo.split(':')[0], pregunta: PREGUNTA_ANEXO[a.n] ?? a.titulo, de: [], anexo: a,
}))

// Grupos del riel, como en el E2: la respuesta va sola y sin rótulo; después, las partes A a C, la
// Parte D con la propuesta y el respaldo.
const GRUPOS = [
  { nombre: null, ids: ['V01'] },
  { nombre: 'Partes A a C', ids: ['V02', 'V03', 'V04', 'V05', 'V06'] },
  { nombre: 'Parte D y propuesta', ids: ['V07', 'V08', 'V09'] },
  { nombre: 'Respaldo', ids: RESPALDO.map((a) => a.id) },
]

export const VISTAS = [...HISTORIA, ...RESPALDO].map((v) => ({
  ...v,
  respaldo: !!v.anexo,
  esqueleto: !porId[v.id],
  dc: porId[v.id]?.meta?.dc,
  Componente: porId[v.id]?.default ?? Esqueleto,
}))

/** «05» para la quinta vista, «A3» para un anexo: el mismo rótulo en el riel y en el encabezado. */
export const etiquetaDe = (v) => (v.respaldo ? v.id : v.id.slice(1))
export const grupoDe = (v) => GRUPOS.find((g) => g.ids.includes(v.id)) ?? GRUPOS[GRUPOS.length - 1]
/** Vistas presentadas (sin el respaldo): el «de 9» del encabezado. */
export const TOTAL_VISTAS = HISTORIA.length
export const indiceDe = (id) => VISTAS.findIndex((v) => v.id === id)
/** Las diapositivas de C3 de las que sale la vista (guion, quién, segundos y fuente). */
export const diapositivasDe = (v) => C3.DIAPOSITIVAS.filter((d) => v.de.includes(d.n))
