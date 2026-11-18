// Prototipo híbrido (18/11, fase 6 de la auditoría de dataviz): el marco y el gráfico del rediseño con la banda de tres
// tarjetas, la tarjeta verde con su fila «Decisión · área · estado», el bloque de qué mide y la conclusión de la versión
// anterior (8e633e8). Se prueba en estas vistas antes de llevarlo a las otras trece. App.jsx lo lee para el encabezado
// (la fuente vuelve debajo de «n / 15»); cada vista de la lista pasa `hibrido` a Plantilla.jsx.

export const HIBRIDAS = new Set(['V01', 'V09'])

export const esHibrida = (id) => HIBRIDAS.has(id)
