// Registro de vistas de /e3/ (27/10, W1). Mismo patrón que e2/src/vistas/index.jsx: el orden ES el
// recorrido, cada vista es un archivo `Vnn_Nombre.jsx` que exporta
// `default` (el componente) y `meta = { id }`. Ningún builder toca este archivo para sumar la suya:
// alcanza con crear el archivo. Una vista sin archivo se muestra como esqueleto con su pregunta. Un
// `V*.jsx` sin `default` (V05Grafico.jsx, una pieza de la vista 5) no se registra.
//
// La historia (PLAN.md del E3, «La historia»): siete vistas presentadas (ocho desde el 01/11, diez con las dos de la
// corrección). (02/11) Sale el grupo «Respaldo» con los anexos A1 a A7 de C3: lo vital de cada uno quedó en las vistas 4,
// 5 y 6 (entregas/entregable-3/_build/F/presentacion/respaldo-cobertura.md). Desde W3 (27/10), las vistas 7 a 9 de la tabla del plan van en una sola, la V07
// («7 a 9 en una»): con las dos o tres de la corrección al otro grupo (W5) quedan nueve como mucho. Desde
// la crítica del W3 (hallazgo 5), el test (la 7 del plan) va en la vista 4, que decide con él, y la V07
// responde una sola pregunta: qué decide María G. con el piloto. (01/11) La V08 muestra lo que hasta ese día iba
// detrás de un botón en la V07: el flujo de cada mes, el plan de 20 semanas y lo que decide María G. `de`
// dice de qué diapositivas de C3 sale cada vista: de ahí toman el guion las notas del orador (N). La
// pregunta va en una línea de hasta 74 caracteres (regla 12 del E2). `fuente` reemplaza la que el
// encabezado arma con las diapositivas cuando la vista sale de una Parte que C3 todavía no tiene (la D).
// (01/11, W5) La V09 y la V10 son la corrección del Grupo 2 al consolidado del E3 del Grupo 5, en su grupo del riel. Sus
// datos salen de D3.correccion (correcciones.json de _build/E/, copiado por exportar_web.py); su fuente es la planilla.
// El «(v2.2)» de la fuente (02/11, W7) lo controla build_e3.py (ancla W5 de la versión; la v1.0, de 56 filas, quedó archivada).

import { C3 } from '../contenido_e3.js'
import Esqueleto from './Esqueleto.jsx'

const modulos = import.meta.glob('./V*.jsx', { eager: true })
const porId = {}
for (const [ruta, m] of Object.entries(modulos)) {
  const id = m.meta?.id ?? ruta.replace(/^\.\/(V\d+[a-z]?).*$/, '$1')
  if (typeof m.default === 'function') porId[id] = m
}

const HISTORIA = [
  { id: 'V01', corto: 'La respuesta', pregunta: '¿Conviene anticipar a quien deja de comprar?', de: [2] },
  { id: 'V02', corto: 'Quién se va', pregunta: '¿Quién se va?', de: [3] },
  { id: 'V03', corto: 'Se puede hacer', pregunta: '¿Se puede hacer?', de: [4, 5] },
  { id: 'V04', corto: 'Modelo o regla', pregunta: '¿El modelo mejora a la regla?', de: [6, 7],
    fuente: 'Partes A, B, C y D' },
  { id: 'V05', corto: 'Se paga', pregunta: '¿Se paga?', de: [8, 9] },
  { id: 'V06', corto: 'Legal y seguro', pregunta: '¿Es legal y seguro?', de: [10, 11] },
  { id: 'V07', corto: 'El piloto', pregunta: '¿Qué decide María G. con el piloto?', de: [12],
    fuente: 'Parte D 11.1 y 12.2' },
  { id: 'V08', corto: 'Cada mes y semana', pregunta: '¿Cómo funciona cada mes y en qué semana?', de: [13],
    fuente: 'Parte D 9.2 y 12' },
  { id: 'V09', corto: 'Lo que corregimos', pregunta: '¿Qué le corregimos al Grupo 5?', de: [14],
    fuente: 'Planilla de correcciones al Grupo 5 (v2.2)' },
  { id: 'V10', corto: 'Lo que hacen bien', pregunta: '¿Qué está bien y qué nos deja?', de: [15],
    fuente: 'Planilla de correcciones al Grupo 5 (v2.2)' },
]
// Grupos del riel, como en el E2: la respuesta va sola y sin rótulo; después, las partes A a C, la
// Parte D con la propuesta y la corrección al Grupo 5 (sin respaldo desde el 02/11). «Partes A, B y C» y no «Partes A a C»: el riel va en
// mayúsculas y «PARTES A A C» no se lee (crítica del W3, hallazgo 6).
const GRUPOS = [
  { nombre: null, ids: ['V01'] },
  { nombre: 'Partes A, B y C', ids: ['V02', 'V03', 'V04', 'V05', 'V06'] },
  { nombre: 'Parte D y propuesta', ids: ['V07', 'V08'] },
  { nombre: 'Corrección Grupo 5', ids: ['V09', 'V10'] },
]

export const VISTAS = HISTORIA.map((v) => ({
  ...v,
  esqueleto: !porId[v.id],
  dc: porId[v.id]?.meta?.dc,
  Componente: porId[v.id]?.default ?? Esqueleto,
}))

/** «05» para la quinta vista: el mismo rótulo en el riel y en el encabezado. */
export const etiquetaDe = (v) => v.id.slice(1)
export const grupoDe = (v) => GRUPOS.find((g) => g.ids.includes(v.id)) ?? GRUPOS[GRUPOS.length - 1]
/** Vistas presentadas: el «/ 10» del encabezado. */
export const TOTAL_VISTAS = HISTORIA.length
export const indiceDe = (id) => VISTAS.findIndex((v) => v.id === id)
/** Las diapositivas de C3 de las que sale la vista (guion, quién, segundos y fuente). */
export const diapositivasDe = (v) => C3.DIAPOSITIVAS.filter((d) => v.de.includes(d.n))
