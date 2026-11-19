// Textos nuevos de V10 (fase 8), mezclados en textosDe('V10'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos del plan de semanas (spec 2 V10): título de la columna de acciones, título del eje de semanas
// (el mismo de V14), el rótulo de la compuerta, la leyenda (el rombo y la flecha; la compuerta lleva su rótulo al lado)
// y el texto de ayuda de cada fila (title).
import { fijo } from '../../../e3/src/formato.js'

export default {
  grafico: {
    columna: 'Acción y responsable',
    eje: 'Semanas desde la aprobación',
    primera: 'Primera lista',
    ley: {
      vence: 'Vence esa semana',
      hecha: 'Hecha, espera la primera lista',
    },
    ayuda: (que, semana, quien) => `${que}: vence en la semana ${fijo(semana)}; ${quien}`,
  },
}
