// V05 · Regla contra modelo (modelo, Francisco C.). La precisión de la lista mensual en la prueba final (J03, J17): la
// regla en --acc, el modelo y la práctica actual en gris. La diferencia modelo menos regla (J09) va en la banda y en la
// conclusión.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V05'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V05ReglaModelo() {
  const datos = [
    { etiqueta: B.regla, valor: A['J03.regla'].valor, enfasis: true },
    { etiqueta: B.modelo, valor: A['J03.logistica'].valor },
    { etiqueta: B.hoy, valor: A.J17.valor },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'regla', valor: pct(A['J03.regla'].valor) },
             { clave: 'dif', valor: fijo(A.J09.valor, 2) },
             { clave: 'hoy', valor: pct(A.J17.valor) },
           ]}
           cifras={[fijo(A.J09.valor, 2)]}>
      {barras({ datos, formato: (x) => pct(x), formatoEje: (x) => pct(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
