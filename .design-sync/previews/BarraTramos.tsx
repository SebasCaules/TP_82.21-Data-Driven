import { BarraTramos } from 'tablero-casa-oga'

const millones = (v: number) => `ARS ${(v / 1e6).toFixed(1).replace('.', ',')} M`

/** Una barra partida en tramos que suman el total, con el tramo en riesgo en el unico
 *  color de enfasis y el resto en trama: ninguna lectura depende solo del color.
 *  La exposicion anual contra el gasto anual estimado de toda la base. */
export const SobreGastoAnual = () => (
  <BarraTramos
    tramos={[
      { etiqueta: 'Exposicion (en riesgo)', valor: 94925989, enfasis: true },
      { etiqueta: 'Resto del gasto estimado', valor: 109710286 },
    ]}
    w={900} h={170} alturaBarra={92} formato={millones}
  />
)

/** La misma forma sobre la otra base posible: lo facturado desde 2022. Las dos barras
 *  se normalizan contra su PROPIO total, asi que miden lo mismo en pantalla aunque una
 *  base sea 2,7 veces la otra. Por eso la base va escrita al lado, no dibujada. */
export const SobreHistoricoAcumulado = () => (
  <BarraTramos
    tramos={[
      { etiqueta: 'Facturacion en riesgo', valor: 262755280, enfasis: true },
      { etiqueta: 'Resto facturado', valor: 287438813 },
    ]}
    w={900} h={170} alturaBarra={92} formato={millones}
  />
)
