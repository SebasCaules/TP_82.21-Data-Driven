// V04 · Qué es irse (modelo, Francisco C.). Spec de dataviz g V04 (18/11): las dos tarjetas son los dos parámetros del
// umbral del cliente (C03: el mayor entre un mínimo de días y un múltiplo de su ritmo), única vista con dos. El gráfico:
// la tasa de cruce en validación por tramo de días que faltan (F04, tabla tramos_de_cruce de DF), en escala de 0 a 100 %
// y con un decimal, como la fila F04 (decisión CH-01). Sin el tramo de 90 días o más, que no tiene positivos por
// definición. El tramo más cercano en --acc, con «cruzan su umbral» pegado a su valor (CH-06). Sin conclusión ni eje.

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
  const datos = TR.map((t, i) => ({
    etiqueta: `${t.tramo} ${B.dias}`, valor: t.tasa, texto: pct(t.tasa, 1), foco: i === 0,
    nota: i === 0 ? B.eje.charAt(0).toLowerCase() + B.eje.slice(1) : undefined,
  }))
  return (
    <Vista id={ID}
           items={[
             { clave: 'minimo', valor: fijo(A['C03.minimo_dias'].valor) },
             { clave: 'factor', valor: fijo(A['C03.factor'].valor, 1) },
           ]}>
      {barras({ datos, maximo: 1 })}
    </Vista>
  )
}
