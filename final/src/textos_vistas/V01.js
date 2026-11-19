// Textos nuevos de V01 (fase 8), mezclados en textosDe('V01'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// La leyenda dice qué es cada color y cada forma del gráfico (spec 0.6 y ficha V01): el azul es el piloto (sola y como
// primer tramo del proyecto), el gris la producción completa y el contorno lo que deja la lista, que es un beneficio.
// (revisión) La leyenda nombra al piloto igual que su barra («Piloto mínimo»): un nombre por cosa. El rótulo del beneficio
// pasa a «Lo que deja la lista, por año»: «Deja la lista» se podía leer como imperativo.
export default {
  leyenda: {
    piloto: 'Piloto mínimo',
    produccion: 'Producción completa',
    deja: 'Beneficio, no costo',
  },
  barras: {
    deja: 'Lo que deja la lista, por año',
  },
  si_pasa: 'Solo si el piloto pasa',
}
