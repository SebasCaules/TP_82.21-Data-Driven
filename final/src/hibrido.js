// Modo híbrido (18/11, fases 6 y 7 de la auditoría de dataviz): el marco y el gráfico del rediseño con la banda, la tarjeta
// verde con su fila «Decisión · área · estado» y la conclusión de la versión anterior (8e633e8). Probado en V01 y V09 y
// llevado a las quince en la fase 7, con MODO 'medio' (el intermedio que eligió el usuario). App.jsx lo lee para el
// encabezado (la fuente vuelve debajo de «n / 15»); cada vista de la lista pasa `hibrido` a Plantilla.jsx.

export const HIBRIDAS = new Set([
  'V01',
  'V02',
  'V03',
  'V04',
  'V05',
  'V06',
  'V07',
  'V08',
  'V09',
  'V10',
  'V11',
  'V12',
  'V13',
  'V14',
  'V15',
])

export const esHibrida = (id) => HIBRIDAS.has(id)

// Qué dibuja el modo híbrido en las vistas de HIBRIDAS. 'completo': las tres tarjetas, qué mide y la conclusión (04b791f).
// 'medio': solo la tarjeta central a 5/12 y la verde con su fila a 7/12, y solo la conclusión; qué mide queda como
// aria-label del lienzo. Plantilla.jsx lo traduce a la clase fin-hib-medio (estilos_final.css).
export const MODO = 'medio'
