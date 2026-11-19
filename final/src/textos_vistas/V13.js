// Textos de V13 (fase 8; 19/11, fase 9), mezclados en textosDe('V13'); puede importar DF de '../datos_final.js' y
// formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos de la escalera: la marca de la PoC hecha, el marcador «estamos aquí», la línea corta de cada etapa
// (en el orden de etapas de CF; reemplaza al `que` de CF en pantalla) y el rótulo de cada costo (la cifra sale de DF).
// Los nombres de las etapas y las condiciones de las compuertas son los `nombre` y `estado` de las etapas de CF («si una
// rama pasa», «si el efecto la paga»). Sin leyenda: cada estado tiene su rótulo directo.

export default {
  grafico: {
    hecha: 'hecha',
    aqui: 'estamos aquí',
    linea: [
      'la regla sobre el extracto histórico',
      'la regla en una planilla mensual',
      'la misma planilla, cada mes',
      'exportación automática y soporte',
    ],
    costo: {
      mvp: 'costo de los tres meses',
      minima: 'costo del primer año',
      completa: 'costo del primer año',
    },
  },
}
