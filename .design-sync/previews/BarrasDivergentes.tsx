import { BarrasDivergentes } from 'tablero-casa-oga'

const conSigno = (v: number) => `${v > 0 ? '+' : v < 0 ? '\u2212' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`
const marcaEje = (v: number) => (v < 0 ? `\u2212${Math.abs(v)}` : v > 0 ? `+${v}` : '0')

/** Desvio alrededor de cero: cuanto pesa cada segmento RFM en la facturacion menos cuanto
 *  pesa en la exposicion, en puntos de participacion. Como las dos participaciones suman
 *  100 cada una, los desvios suman cero y siempre hay al menos uno de cada lado.
 *  Campeones es el mas subexpuesto: mucha plata, poco riesgo. */
export const DesvioPorSegmento = () => (
  <BarrasDivergentes
    datos={[
      { etiqueta: 'Campeones', valor: 12.73, nota: 'ARS 15,5 M', notaValor: 15527175, enfasis: true },
      { etiqueta: 'Perdidos', valor: 6.63, nota: 'ARS 8,7 M', notaValor: 8676965 },
      { etiqueta: 'Potenciales', valor: 5.24, nota: 'ARS 1,1 M', notaValor: 1141960 },
      { etiqueta: 'Nuevos', valor: 0.10, nota: 'ARS 0,0 M', notaValor: 0 },
      { etiqueta: 'Hibernando', valor: -0.80, nota: 'ARS 12,3 M', notaValor: 12298313 },
      { etiqueta: 'Leales', valor: -5.99, nota: 'ARS 21,3 M', notaValor: 21326573 },
      { etiqueta: 'En riesgo', valor: -17.90, nota: 'ARS 36,0 M', notaValor: 35955003, notaSuf: 'circular' }
    ]}
    w={940} h={330} anchoEtiqueta={106}
    formato={conSigno} formatoEje={marcaEje}
    tituloEje="Facturacion menos exposicion, en puntos de participacion"
    encabezadoNota="exposicion del segmento (ARS)"
    rotuloPos="mas plata que riesgo →"
    rotuloNeg="← mas riesgo que plata (trama)"
  />
)
