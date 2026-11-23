// Textos de V13 (fase 8; 19/11, fase 9; 23/11), mezclados en textosDe('V13'); puede importar DF de '../datos_final.js' y
// formato.js de '../../../e3/src/formato.js'.
// grafico: los rótulos del dibujo: la marca de la PoC hecha, el marcador «estamos aquí», la línea corta de cada etapa y
// de cada salida (reemplaza al `que` de CF en pantalla), el rótulo de cada costo (la cifra sale de DF), el rótulo del
// rombo de la semana de la decisión con la convención del par de cifras, y la condición de cada salida. Los nombres
// salen de CF (etapas y salidas). Sin leyenda: cada estado tiene su rótulo directo.
// (19/11, fase 10) En el boceto ninguno de estos se ve; cada uno aparece en el paso de su caja.
// (23/11) Las salidas de la semana 28 (E4 A 3.2): las condiciones son los umbrales de pase (G67.con_descuento y
// G67.sin_descuento) y el efecto que paga la producción completa el primer año (G67.completa_*), en puntos de diferencia
// de cruce; el par va siempre con descuento / sin descuento, y lo dice una sola vez el rótulo del rombo.

import { DF } from '../datos_final.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const A = DF.anclas
const puntos = (k) => fijo(A[k].valor, 2)
const PASE = `${puntos('G67.con_descuento')} / ${puntos('G67.sin_descuento')} puntos`
const PAGA = `${puntos('G67.completa_con_descuento')} / ${puntos('G67.completa_sin_descuento')} puntos`

export default {
  grafico: {
    hecha: 'hecha',
    aqui: 'estamos aquí',
    decide: `Semana ${fijo(A['G63.semana_decision'].valor)}: ¿cuánto bajó el cruce?`,
    convencion: 'en puntos: con descuento / sin descuento',
    linea: {
      poc: 'la regla sobre el extracto histórico',
      mvp: 'la regla en una planilla mensual',
      completa: 'exportación automática y soporte',
      minima: 'la misma planilla, cada mes',
      cierra: `se gastaron ${usd(A.G64.valor)}`,
    },
    condicion: {
      completa: `desde ${PAGA}`,
      minima: `desde ${PASE}`,
      cierra: `menos de ${PASE}`,
    },
    costo: {
      mvp: 'costo de los tres meses',
      minima: 'costo del primer año',
      completa: 'costo del primer año',
    },
  },
}
