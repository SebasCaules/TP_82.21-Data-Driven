// Textos nuevos de V14 (fase 8), mezclados en textosDe('V14'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos del plan por semanas (spec 2 V14): título del eje de semanas, el rótulo corto de cada hito del
// carril de arriba (las semanas salen de DF: plan.hitos y calendario), la leyenda (qué es cada forma y cada color) y el
// texto de ayuda de cada fase y de cada hito (title, al pasar el mouse).
import { fijo } from '../../../e3/src/formato.js'

export default {
  grafico: {
    eje: 'Semanas desde la aprobación',
    hoy: 'Hoy: aprobar el piloto',
    hitos: {
      acuerdo: 'Acuerdo',
      primera: 'Primera lista',
      tercera: 'Tercera lista',
      preliminar: 'Informe preliminar',
      decision: 'Decisión',
    },
    ley: {
      fase: 'Fase y su dueño',
      sigue: 'Arranca al terminar la anterior',
      hito: 'Hito, con su semana',
      decision: 'Decisión de María G.',
    },
    ayuda: (fase, desde, hasta, quien) => (desde === hasta
      ? `${fase}: semana ${fijo(desde)}; ${quien}`
      : `${fase}: semanas ${fijo(desde)} a ${fijo(hasta)}; ${quien}`),
    ayudaHito: (hito, semana) => `${hito}: semana ${fijo(semana)}`,
  },
}
