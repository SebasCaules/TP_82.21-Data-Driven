// Registro de vistas de /e3/ (27/10, W1). Mismo patrón que e2/src/vistas/index.jsx: el orden ES el
// recorrido, cada vista es un archivo `Vnn_Nombre.jsx` (o `R_An_Nombre.jsx` para el respaldo) que exporta
// `default` (el componente) y `meta = { id }`. Ningún builder toca este archivo para sumar la suya:
// alcanza con crear el archivo. Una vista sin archivo se muestra como esqueleto con su pregunta. Un
// `V*.jsx` sin `default` (V05_Simulador.jsx, una pieza de la vista 5) no se registra.
//
// La historia (PLAN.md del E3, «La historia»): siete vistas presentadas (ocho desde el 01/11, diez con las dos de la corrección) y el grupo «Respaldo» con los
// anexos A1 a A7 de C3. Desde W3 (27/10), las vistas 7 a 9 de la tabla del plan van en una sola, la V07
// («7 a 9 en una»): con las dos o tres de la corrección al otro grupo (W5) quedan nueve como mucho. Desde
// la crítica del W3 (hallazgo 5), el test (la 7 del plan) va en la vista 4, que decide con él, y la V07
// responde una sola pregunta: qué decide María G. con el piloto. (01/11) La V08 muestra lo que hasta ese día iba
// detrás de un botón en la V07: el flujo de cada mes, el plan de 20 semanas y lo que decide María G. `de`
// dice de qué diapositivas de C3 sale cada vista: de ahí toman el guion las notas del orador (N). La
// pregunta va en una línea de hasta 74 caracteres (regla 12 del E2). `fuente` reemplaza la que el
// encabezado arma con las diapositivas cuando la vista sale de una Parte que C3 todavía no tiene (la D).
// (01/11, W5) La V09 y la V10 son la corrección del Grupo 2 al consolidado del E3 del Grupo 5, en su grupo del riel. Sus
// datos salen de D3.correccion (correcciones.json de _build/E/, copiado por exportar_web.py); su fuente es la planilla.
// El «(v2.0)» de la fuente lo controla build_e3.py (ancla W5 de la versión; la v1.0, de 56 filas, quedó archivada).

import { C3 } from '../contenido_e3.js'
import Esqueleto from './Esqueleto.jsx'

const modulos = import.meta.glob(['./V*.jsx', './A*.jsx', './R_*.jsx'], { eager: true })
const porId = {}
for (const [ruta, m] of Object.entries(modulos)) {
  const id = m.meta?.id ?? ruta.replace(/^\.\/(?:R_)?([VA]\d+[a-z]?).*$/, '$1')
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
    fuente: 'Planilla de correcciones al Grupo 5 (v2.0)' },
  { id: 'V10', corto: 'Lo que hacen bien', pregunta: '¿Qué está bien y qué nos deja?', de: [15],
    fuente: 'Planilla de correcciones al Grupo 5 (v2.0)' },
]
// El respaldo: un anexo de C3 por vista. El nombre corto es el título del anexo hasta los dos puntos. Los
// anexos que suman lo medido en test nombran también la sección de la Parte D de donde sale.
const PREGUNTA_ANEXO = {
  A1: '¿Cómo se parten los datos en el tiempo?',
  A2: '¿Dónde se corta la lista?',
  A3: '¿Qué supuesto mueve el ROI?',
  A4: '¿Qué riesgos hay y qué se hace con cada uno?',
  A5: '¿El error es parejo entre segmentos?',
  A6: '¿Cuánto cuesta el año 1?',
  A7: '¿Dónde fallan el modelo y la regla?',
}
// El A4 cita la D 11.2 en el title de la tarjeta y de la fila 12, no acá: con «Partes C 6.2 · D 11.2» en el
// encabezado, a 1366 × 768 la pregunta del A4 pasaba a dos renglones (paridad_e3.py, regla 12 del E2).
const FUENTE_D = { A1: 'D 8.1 y 8.3', A3: 'D 11.2', A5: 'D 11.2', A7: 'D 8.1' }
const RESPALDO = C3.ANEXOS.map((a) => ({
  id: a.n, corto: a.titulo.split(':')[0], pregunta: PREGUNTA_ANEXO[a.n] ?? a.titulo, de: [], anexo: a,
  fuente: FUENTE_D[a.n] ? `${a.fuente.replace(/^Parte /, 'Partes ')} · ${FUENTE_D[a.n]}` : a.fuente,
}))

// Grupos del riel, como en el E2: la respuesta va sola y sin rótulo; después, las partes A a C, la
// Parte D con la propuesta (una vista) y el respaldo. «Partes A, B y C» y no «Partes A a C»: el riel va en
// mayúsculas y «PARTES A A C» no se lee (crítica del W3, hallazgo 6).
const GRUPOS = [
  { nombre: null, ids: ['V01'] },
  { nombre: 'Partes A, B y C', ids: ['V02', 'V03', 'V04', 'V05', 'V06'] },
  { nombre: 'Parte D y propuesta', ids: ['V07', 'V08'] },
  { nombre: 'Corrección Grupo 5', ids: ['V09', 'V10'] },
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
/** Vistas presentadas (sin el respaldo): el «/ 7» del encabezado. */
export const TOTAL_VISTAS = HISTORIA.length
export const indiceDe = (id) => VISTAS.findIndex((v) => v.id === id)
/** Las diapositivas de C3 de las que sale la vista (guion, quién, segundos y fuente). */
export const diapositivasDe = (v) => C3.DIAPOSITIVAS.filter((d) => v.de.includes(d.n))
