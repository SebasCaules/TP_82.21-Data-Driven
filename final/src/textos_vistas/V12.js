// Textos nuevos de V12 (fase 8), mezclados en textosDe('V12'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// breves: el título corto de cada épica, por su número en la tabla backlog (spec V12); el nombre completo sale de
// DF.tablas.backlog.epicas[].nombre y va debajo, en chico. columnas: el encabezado de cada estado (versión a) y el rótulo
// de la leyenda (versión b). ficha: qué es cada ficha.
export default {
  // subfila de la banda: criterios de aceptación del backlog (K03), tres por historia
  criterios: { rotulo: 'Criterios de aceptación', linea: 'tres por historia' },
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
  columnas: { hecha: 'Hecha', piloto: 'En el piloto', despues: 'Si el piloto pasa' },
  ficha: '1 ficha = 1 historia de usuario',
  // el texto de la ficha de muestra de la leyenda: el prefijo de los códigos, sin repetir una historia real
  muestra: 'HU',
  // entre el estado y su total, en la leyenda de la versión b («Hecha · 9»)
  separador: ' · ',
}
