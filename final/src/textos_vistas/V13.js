// Textos de V13 (fase 8; 19/11, fase 9; 23/11), mezclados en textosDe('V13'); puede importar DF de '../datos_final.js' y
// formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos del dibujo: la marca de la PoC hecha, el marcador «estamos aquí», la línea corta de cada etapa y
// de cada salida (reemplaza al `que` de CF en pantalla), el horizonte de cada costo (la cifra sale de DF), el rótulo del
// nodo de la bifurcación y la condición de cada salida, en palabras. Los nombres salen de CF (etapas y salidas).
// (23/11, tarde) Dado el éxito: el nodo dice «Si el piloto funciona» y la semana de la decisión; el cierre no se dibuja
// (queda implícito) y las condiciones van sin puntos (los umbrales están en V09, «Cuándo pasa»).

import { DF } from '../datos_final.js'
import { fijo } from '../../../e3/src/formato.js'

const A = DF.anclas

export default {
  grafico: {
    hecha: 'hecha',
    aqui: 'estamos aquí',
    nodo: 'Si el piloto funciona',
    semana: `en la semana ${fijo(A['G63.semana_decision'].valor)}`,
    linea: {
      poc: 'la regla sobre el extracto histórico',
      mvp: 'la regla en una planilla mensual',
      minima: 'la misma planilla, cada mes',
      completa: 'exportación automática y soporte',
    },
    condicion: {
      minima: 'si contactar paga la lista',
      completa: 'si el efecto paga la automatización',
    },
    costo: {
      mvp: 'los tres meses',
      minima: 'el primer año',
      completa: 'el primer año',
    },
  },
}
