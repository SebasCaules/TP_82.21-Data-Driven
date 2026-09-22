// Registro de vistas del tablero E2. El orden ES el recorrido (un solo riel, sin corte ni
// filtros: cada vista compara "antes" y "después" sobre el mismo corte fijo, CORTE_REF).
//
// Registro por glob: cada vista es un archivo `Vnn_Nombre.jsx` en esta carpeta que exporta
// `default` (el componente) y `meta = { id, corto, titulo, pie? }`. Ningún builder toca este
// archivo: alcanza con crear el suyo. El orden es alfabético por nombre de archivo, que es
// el orden V01..V12 del diseño (app/e2/DISENO.md). V00 es el placeholder del andamiaje y se
// oculta en cuanto existe una vista real.

const modulos = import.meta.glob('./V*.jsx', { eager: true })

const todas = Object.entries(modulos)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([ruta, m]) => ({
    id: m.meta?.id ?? ruta.replace(/^\.\/(V\d+).*$/, '$1'),
    corto: m.meta?.corto ?? ruta,
    titulo: m.meta?.titulo ?? '',
    pie: m.meta?.pie,
    Componente: m.default,
  }))
  .filter((v) => typeof v.Componente === 'function')

const reales = todas.filter((v) => v.id !== 'V00')

export const VISTAS = reales.length ? reales : todas
