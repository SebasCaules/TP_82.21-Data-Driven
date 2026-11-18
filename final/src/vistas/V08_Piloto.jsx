// V08 · Qué cuesta el piloto (economía, Juan Manuel R.). El piloto mínimo por línea (G64: medición, planilla, taller,
// legal y contingencia). La medición en --acc: es lo que el piloto viene a saber.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const ID = 'V08'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V08Piloto() {
  const datos = [
    { etiqueta: B.medicion, valor: A['G64.medicion'].valor, enfasis: true },
    { etiqueta: B.planilla, valor: A['G64.planilla'].valor },
    { etiqueta: B.taller, valor: A['G64.taller'].valor },
    { etiqueta: B.legal, valor: A['G64.legal'].valor },
    { etiqueta: B.contingencia, valor: A['G64.contingencia'].valor },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'horas', span: 3, valor: fijo(A['G64.horas_marketing'].valor) },
           ]}
           cifras={[fijo(A['G64.horas_equipo'].valor)]}>
      {barras({ datos, formato: (x) => usd(x, 0), formatoEje: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
