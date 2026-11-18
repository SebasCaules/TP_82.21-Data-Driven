// V09 · Cuándo pasa (economía, Juan Manuel R.). El umbral de pase del piloto por rama (G67) contra lo que se espera con
// la tasa observada (G62). Los umbrales en --acc; lo observado, en gris. En la banda, enteros («menos de 1»: build_final.py
// controla que G62 esté entre 0 y 1); los dos decimales, solo en las barras. La potencia de cada rama (G68), en la
// conclusión, con sujeto.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'

const ID = 'V09'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V09Umbral() {
  const datos = [
    { etiqueta: B.hoy, valor: A['G62.tasa_observada'].valor, anchoMin: 3 },
    { etiqueta: B.sin, valor: A['G67.sin_descuento'].valor, enfasis: true },
    { etiqueta: B.con, valor: A['G67.con_descuento'].valor, enfasis: true },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'con', valor: fijo(A['G67.con_descuento'].valor) },
             { clave: 'sin', valor: fijo(A['G67.sin_descuento'].valor) },
             { clave: 'hoy', valor: fijo(Math.ceil(A['G62.tasa_observada'].valor)) },
           ]}
           cifras={[fijo(A['G68.potencia_con_descuento'].valor), fijo(A['G68.potencia_sin_descuento'].valor)]}>
      {barras({ datos, formato: (x) => fijo(x, 2), formatoEje: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
