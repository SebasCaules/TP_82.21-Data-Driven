// Registro de vistas del tablero E2. El orden ES el recorrido (un solo riel, sin corte ni
// filtros: cada vista compara "antes" y "después" sobre el mismo corte fijo, CORTE_REF).
//
// Registro por glob: cada vista es un archivo `Vnn_Nombre.jsx` en esta carpeta que exporta
// `default` (el componente) y `meta = { id, corto, titulo, pie? }`. Ningún builder toca este
// archivo: alcanza con crear el suyo. El orden es alfabético por nombre de archivo, que es
// el orden V01..V12 del diseño (app/e2/DISENO.md). V00 es el placeholder del andamiaje y se
// oculta en cuanto existe una vista real.

const modulos = import.meta.glob('./V*.jsx', { eager: true })

// (24/09) La pregunta que responde cada vista, la columna «Pregunta» de e2/DISENO.md. El
// encabezado la muestra al lado del número de vista, para que el directorio sepa qué mira
// antes de leer el título. V07 cambia la suya: la vista no dice qué oferta convierte más
// sino que resolver los duplicados no mueve ninguna tasa.
const PREGUNTA = {
  V01: '¿qué cambió y qué falta?',
  V02: '¿por qué un corte común?',
  V03: '¿qué meses no se pueden leer?',
  V04: '¿qué cambia al unir identidades?',
  V05: '¿cómo se cuentan las devoluciones?',
  V06: '¿a quién se le puede escribir?',
  V06b: '¿cambia el embudo sin los envíos repetidos?',
  V07: '¿cambian las tasas por oferta al resolver los duplicados?',
  V07b: '¿qué es un cliente Gold?',
  V08: '¿por qué no se deflacta?',
  V09: '¿cuánto vale el NPS?',
  V10: '¿cambió la cifra del directorio?',
  V11: '¿cómo se entrena y se elige el modelo?',
  V12: '¿qué falta del lado del negocio?',
}

const todas = Object.entries(modulos)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([ruta, m]) => ({
    id: m.meta?.id ?? ruta.replace(/^\.\/(V\d+).*$/, '$1'),
    corto: m.meta?.corto ?? ruta,
    titulo: m.meta?.titulo ?? '',
    pie: m.meta?.pie,
    pregunta: PREGUNTA[m.meta?.id],
    // (25/09) La decisión que muestra la vista (una sola por tarjeta): con esto V01 lleva cada
    // decisión a su pantalla aunque V06 y V07 ahora tengan dos (V06b, V07b).
    dc: m.meta?.dc,
    Componente: m.default,
  }))
  .filter((v) => typeof v.Componente === 'function')

const reales = todas.filter((v) => v.id !== 'V00')

export const VISTAS = reales.length ? reales : todas

// (25/09) El número de una vista sale de su id, no de su posición: «06b» es la segunda pantalla
// de la vista 6. Así las referencias de los textos («vista 12», «vista 3») siguen valiendo con
// las 14 pantallas.
export const etiquetaDe = (v) => v.id.slice(1)
// (26/09, revisión UX H2) Grupos del riel, con el nombre de los pilares de V01: las tres vistas que
// mueven la cifra central (2 a 4), las otras decisiones (5 a 9) y el cierre (10 a 12). La vista 1
// va sola y sin rótulo («Resumen» encima de «01 Resumen» lo diría dos veces).
const GRUPOS = [
  { nombre: null, hasta: 1 },
  { nombre: 'Afectan la cifra', hasta: 4 },
  { nombre: 'Otras decisiones', hasta: 9 },
  { nombre: 'Cierre', hasta: 12 },
]
export const grupoDe = (v) => GRUPOS.find((g) => +v.id.slice(1, 3) <= g.hasta) ?? GRUPOS[GRUPOS.length - 1]
export const TOTAL_VISTAS = new Set(VISTAS.map((v) => v.id.slice(1, 3))).size
/** Índice de la pantalla de una vista («V12») o de la que muestra una decisión («DC-05»). */
export function indiceDe(ref) {
  const i = ref && ref.startsWith('DC-')
    ? VISTAS.findIndex((v) => v.dc === ref)
    : VISTAS.findIndex((v) => v.id === ref)
  return i
}
