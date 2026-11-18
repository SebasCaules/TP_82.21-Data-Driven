// V09 · Cuándo pasa (economía, Juan Manuel R.). El umbral de pase del piloto por rama (G67) contra lo que se espera con
// la tasa observada (G62), con la potencia de cada rama al costado (G68). Los umbrales en --acc; lo observado, en gris.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const ID = 'V09'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V09Umbral() {
  const datos = [
    { etiqueta: B.hoy, valor: A['G62.tasa_observada'].valor, anchoMin: 3 },
    { etiqueta: B.sin, valor: A['G67.sin_descuento'].valor, enfasis: true, nota: B.nota_sin },
    { etiqueta: B.con, valor: A['G67.con_descuento'].valor, enfasis: true, nota: B.nota_con },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'con', valor: fijo(A['G67.con_descuento'].valor, 2) },
             { clave: 'sin', valor: fijo(A['G67.sin_descuento'].valor, 2) },
             { clave: 'hoy', valor: fijo(A['G62.tasa_observada'].valor, 2) },
           ]}
           cifras={[usd(A.G64.valor), usd(A.G39.valor)]}>
      {barras({ datos, formato: (x) => fijo(x, 2), formatoEje: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
