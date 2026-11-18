// V02 · Qué ventas entran (datos, Matías S.). El extracto de ventas paso a paso (C20): las filas como llegaron, sin
// repetidas, con cliente y con monto positivo, que es lo que usa la lista (en --acc). Cada paso dice al costado cuántas
// filas salen. La banda: ventas sin cliente (C19) y los puntajes de datos y calidad de la A 1.2.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V02'
const A = DF.anclas
const T = DF.tablas
const B = textosDe(ID).barras
const cond = (id) => T.condiciones.find((x) => x.id === id).puntaje
const sobre = (n) => `${fijo(n)}[[/${fijo(T.escala_tecnica.hasta)}]]`

export const meta = { id: ID }

export default function V02Ventas() {
  const datos = [
    { etiqueta: B.crudo, valor: A['C20.crudo'].valor },
    { etiqueta: B.unicas, valor: A['C20.unicas'].valor, nota: B.nota_repetidas },
    { etiqueta: B.con_cliente, valor: A['C20.con_cliente'].valor, nota: B.nota_sin_cliente },
    { etiqueta: B.positivas, valor: A['C20.positivas'].valor, nota: B.nota_no_positivas, enfasis: true },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'sin_cliente', valor: pct(A.C19.valor / 100) },
             { clave: 'datos', valor: sobre(cond('datos')) },
             { clave: 'calidad', valor: sobre(cond('calidad')) },
           ]}
           cifras={[fijo(A['C20.positivas'].valor)]}>
      {barras({ datos, formato: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
