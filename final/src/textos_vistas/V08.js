// Textos nuevos de V08 (fase 8), mezclados en textosDe('V08'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// partida: la barra partida en las cinco líneas del piloto mínimo (spec 2, V08). Los nombres de cada tramo siguen en
// barras (contenido_final.js); acá van el rótulo del total, el título del eje, qué compra cada línea y la leyenda. Las
// cifras las pone la vista con formato.js.
export default {
  barras: {
    // espacio duro en «de corrida»: el renglón no corta entre las dos
    planilla: 'Planilla y guía de\u00a0corrida',
  },
  partida: {
    total: 'Total',
    eje: 'Costo acumulado, en USD',
    desc: {
      medicion: 'control y dos ramas, sorteados cada\u00a0mes',
      planilla: 'la regla mensual que corre Marketing',
      taller: 'equipo de Sofía R. y quien corre la planilla',
      legal: 'acuerdo, borrado y consentimiento',
      contingencia: 'se calcula sobre las otras cuatro',
    },
    ley: {
      foco: 'Medición, el motivo del piloto',
      resto: 'Otras líneas del costo',
      reserva: 'Reserva para imprevistos',
    },
  },
}
