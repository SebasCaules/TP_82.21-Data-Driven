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
  V01: '¿qué se decidió y con qué alcance?',
  V02: '¿por qué un corte común?',
  V03: '¿qué meses no se pueden leer?',
  V04: '¿qué cambia al unir identidades?',
  V05: '¿cómo se cuentan las devoluciones?',
  V06: '¿a quién se le puede escribir?',
  V07: '¿cambian las tasas por oferta al resolver los duplicados?',
  V08: '¿por qué no se deflacta?',
  V09: '¿cuánto vale el NPS?',
  V10: '¿cambió la cifra del directorio?',
  V11: '¿con qué se entrena el modelo?',
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
    Componente: m.default,
  }))
  .filter((v) => typeof v.Componente === 'function')

const reales = todas.filter((v) => v.id !== 'V00')

export const VISTAS = reales.length ? reales : todas
