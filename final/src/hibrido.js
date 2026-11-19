// (18/11, fases 6 y 7) El modo híbrido: el marco del rediseño con la banda, la tarjeta verde con su fila y la conclusión
// de 8e633e8. Desde la fase 8 hay una sola forma de vista (Plantilla.jsx) y este archivo solo queda para App.jsx, que lo
// lee para el encabezado («n / 15 · fuente» debajo de la barra de avance): las quince vistas son híbridas.

export const HIBRIDAS = new Set(['V01', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07', 'V08', 'V09', 'V10', 'V11', 'V12', 'V13',
  'V14', 'V15'])

export const esHibrida = (id) => HIBRIDAS.has(id)
