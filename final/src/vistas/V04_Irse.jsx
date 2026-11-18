// V04 · Qué es irse (modelo, Francisco C.). El umbral del cliente (C03: el mayor entre un mínimo de días y un múltiplo de
// su ritmo) en la banda, y por qué la regla ordena por la distancia a ese umbral: la tasa de cruce en validación por tramo
// de días que faltan (F04, tabla tramos_de_cruce de DF). Sin el tramo de 90 días o más, que no tiene positivos por
// definición (no es un hallazgo; va en la nota). El tramo más cercano en --acc.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V04'
const A = DF.anclas
const TR = DF.tablas.tramos_de_cruce.filter((t) => t.positivos > 0)
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V04Irse() {
  const datos = TR.map((t, i) => ({ etiqueta: `${t.tramo} ${B.dias}`, valor: t.tasa, enfasis: i === 0, anchoMin: 3 }))
  return (
    <Vista id={ID}
           items={[
             { clave: 'minimo', span: 3, valor: fijo(A['C03.minimo_dias'].valor) },
             { clave: 'factor', span: 3, valor: fijo(A['C03.factor'].valor, 1) },
           ]}
           cifras={[pct(TR[0].tasa)]}>
      {barras({ datos, formato: (x) => pct(x), formatoEje: (x) => pct(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
