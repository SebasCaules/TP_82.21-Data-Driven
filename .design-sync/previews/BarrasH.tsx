import { BarrasH } from 'tablero-casa-oga'

const millones = (v: number) => `ARS ${(v / 1e6).toFixed(1).replace('.', ',')} M`

/** Barra horizontal simple desde cero, ordenada por valor. La exposicion anual repartida
 *  por region al corte 31/12/2025. AMBA va en acento; "Solo online" va en excepcion porque
 *  no es una region sino la ausencia de una: son los clientes sin ninguna compra fisica. */
export const ExposicionPorRegion = () => (
  <BarrasH
    datos={[
      { etiqueta: 'AMBA', valor: 40514582, nota: '1.005 en riesgo', enfasis: true },
      { etiqueta: 'Centro', valor: 19671043, nota: '521 en riesgo' },
      { etiqueta: 'NOA', valor: 16082440, nota: '423 en riesgo' },
      { etiqueta: 'Cuyo', valor: 14970513, nota: '399 en riesgo' },
      { etiqueta: 'Patagonia', valor: 2490553, nota: '63 en riesgo' },
      { etiqueta: 'Solo online', valor: 1196858, nota: '41 en riesgo', excepcion: true }
    ]}
    w={900} h={300} anchoEtiqueta={110}
    formato={millones} formatoEje={millones}
    tituloEje="Exposicion anual por region"
  />
)

/** La misma forma con una linea de referencia: el promedio por region. */
export const ConReferencia = () => (
  <BarrasH
    datos={[
      { etiqueta: 'AMBA', valor: 40514582, nota: '1.005 en riesgo', enfasis: true },
      { etiqueta: 'Centro', valor: 19671043, nota: '521 en riesgo' },
      { etiqueta: 'NOA', valor: 16082440, nota: '423 en riesgo' },
      { etiqueta: 'Cuyo', valor: 14970513, nota: '399 en riesgo' },
      { etiqueta: 'Patagonia', valor: 2490553, nota: '63 en riesgo' },
      { etiqueta: 'Solo online', valor: 1196858, nota: '41 en riesgo', excepcion: true }
    ]}
    w={900} h={300} anchoEtiqueta={110}
    formato={millones} formatoEje={millones}
    tituloEje="Exposicion anual por region"
    referencia={{ valor: 15820998, etiqueta: 'promedio' }}
  />
)
