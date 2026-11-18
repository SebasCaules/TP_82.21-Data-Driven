// V03 · Qué meses entran (datos, Matías S.). Las operaciones de cada mes de 2025 sobre las del mismo mes de 2024 (D28,
// tabla ventas_2025 de DF, contada por build_final.py desde el extracto crudo) con la línea del control del mes (H46).
// Los meses que no pasan, en --acc: es lo que la vista dice. Los que pasan, en gris.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V03'
const A = DF.anclas
const VT = DF.tablas.ventas_2025
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V03Meses() {
  const datos = VT.meses.map((m) => ({
    etiqueta: m.rotulo, valor: m.parte, enfasis: !m.se_usa,
  }))
  return (
    <Vista id={ID} lienzo="fin-ref"
           items={[
             { clave: 'fuera', span: 3, valor: fijo(A['D28.meses_fuera'].valor) },
             { clave: 'control', span: 3, valor: pct(VT.umbral, 0) },
           ]}
           cifras={[pct(VT.umbral, 0)]}>
      {barras({
        datos, formato: (x) => pct(x, 0), tituloEje: B.eje,
        referencia: { valor: VT.umbral, etiqueta: `${B.control} ${pct(VT.umbral, 0)}` },
      })}
    </Vista>
  )
}
