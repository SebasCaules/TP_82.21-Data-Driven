// Textos nuevos de V12 (fase 8 y 9), mezclados en textosDe('V12'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// breves: el título corto de cada épica, por su número en la tabla backlog (spec V12); es lo único que lleva la fila.
// columnas: el encabezado de cada estado (nombra el color de sus fichas). ficha: qué es cada ficha.
export default {
  breves: {
    1: 'Relevamiento',
    2: 'Datos',
    3: 'Modelo',
    4: 'Lista',
    5: 'Tablero',
    6: 'Piloto',
    7: 'Legal',
    8: 'Handoff',
  },
  columnas: { hecha: 'Hechas', piloto: 'En el piloto', despues: 'Si el piloto pasa' },
  ficha: '1 ficha = 1 historia de usuario',
}
