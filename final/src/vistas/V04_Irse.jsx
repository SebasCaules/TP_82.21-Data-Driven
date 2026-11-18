// V04 · Qué es irse (modelo, Francisco C.). El umbral del cliente (C03: el mayor entre un mínimo de días y un múltiplo de
// su ritmo) en la banda, y por qué la regla ordena por la distancia a ese umbral: la tasa de cruce por tramo de días que
// faltan (F04, tabla tramos_de_cruce de DF). El tramo más cercano en --acc.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V04'
const A = DF.anclas
const TR = DF.tablas.tramos_de_cruce
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V04Irse() {
  const datos = TR.map((t, i) => ({ etiqueta: `${t.tramo} ${B.dias}`, valor: t.tasa, enfasis: i === 0, anchoMin: 3 }))
  return (
    <Vista id={ID}
           items={[
             { clave: 'minimo', valor: fijo(A['C03.minimo_dias'].valor) },
             { clave: 'factor', valor: fijo(A['C03.factor'].valor, 1) },
             { clave: 'tasa', valor: pct(A['J02.tasa'].valor) },
           ]}
           cifras={[pct(TR[0].tasa)]}>
      {barras({ datos, formato: (x) => pct(x), formatoEje: (x) => pct(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
