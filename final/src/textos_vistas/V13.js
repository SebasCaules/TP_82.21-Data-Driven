// Textos nuevos de V13 (fase 8), mezclados en textosDe('V13'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos de la escalera (V13.a) y de la cadena de flechas (V13.b): la marca de la PoC hecha, el marcador
// «estamos acá», el rótulo de cada costo (la cifra sale de DF) y la leyenda (qué es cada forma y cada color). Las
// condiciones de las compuertas son los `estado` de las etapas de CF («si una rama pasa», «si el efecto la paga»).

export default {
  grafico: {
    hecha: 'hecha',
    aqui: 'estamos acá · se pide ahora',
    costo: {
      mvp: 'costo de los tres meses',
      minima: 'costo del primer año',
      completa: 'costo del primer año',
    },
    ley: {
      hecha: 'hecha',
      ahora: 'se pide ahora',
      condicional: 'depende de la condición',
      compuerta: 'condición para pasar',
      hecho: 'camino hecho',
      falta: 'camino que falta',
    },
  },
}
