// Textos nuevos de V11 (fase 8), mezclados en textosDe('V11'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// tipos: la clase de cada riesgo de `filas`, en el mismo orden (las notas de V11 los dicen así: económico, adopción,
// legal). ley: la leyenda de los colores (a y b) y de las flechas (b). Los rótulos de los campos y de las columnas son
// los de `columnas`.
export default {
  // subfila de la banda: las horas de Marketing en las tres listas del piloto (G64.horas_marketing)
  piloto: { rotulo: 'En las tres listas', linea: 'de la misma persona', unidad: 'horas' },
  tipos: ['Económico', 'Adopción', 'Legal'],
  ley: {
    foco: 'Riesgo de adopción: si Marketing sostiene la lista',
    otros: 'Riesgos económico y legal',
    flecha: 'Cada fila se lee de izquierda a derecha',
  },
}
