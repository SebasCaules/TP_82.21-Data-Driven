// V03 · Qué meses entran (datos, Matías S.). Las operaciones de cada mes de 2025 sobre las del mismo mes de 2024 (D28,
// tabla ventas_2025 de DF, contada por build_final.py desde el extracto crudo) con la línea del control del mes (H46).
// Los meses que no pasan, en --acc y con su nota: es lo que la vista dice. Los que pasan, en gris.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V03'
const A = DF.anclas
const VT = DF.tablas.ventas_2025
const B = textosDe(ID).barras
const ultimo = [...VT.meses].reverse().find((m) => m.se_usa)

export const meta = { id: ID }

export default function V03Meses() {
  const datos = VT.meses.map((m) => ({
    etiqueta: m.rotulo, valor: m.parte, enfasis: !m.se_usa, nota: m.se_usa ? undefined : B.no_se_usa,
  }))
  return (
    <Vista id={ID} lienzo="fin-ref"
           items={[
             { clave: 'fuera', valor: fijo(A['D28.meses_fuera'].valor) },
             { clave: 'control', valor: pct(VT.umbral, 0) },
             { clave: 'agosto', valor: pct(ultimo.parte, 0) },
           ]}
           cifras={[pct(VT.umbral, 0)]}>
      {barras({
        datos, formato: (x) => pct(x, 0), tituloEje: B.eje,
        referencia: { valor: VT.umbral, etiqueta: `${B.control} ${pct(VT.umbral, 0)}` },
      })}
    </Vista>
  )
}
