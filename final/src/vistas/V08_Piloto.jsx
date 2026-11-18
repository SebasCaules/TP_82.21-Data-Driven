// V08 · Qué cuesta el piloto (economía, Juan Manuel R.). El piloto mínimo por línea (G64: medición, planilla, taller,
// legal y contingencia), con BarrasFin (spec f.1 y g V08): la medición en --acc, que es para lo que se hace el piloto; las
// demás en gris. En la banda, solo las horas de Marketing (G64.horas_marketing): el total es el título. Sin conclusión.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const ID = 'V08'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

const linea = (etiqueta, ancla, foco = false) => ({
  etiqueta, valor: A[ancla].valor, texto: usd(A[ancla].valor, 0), foco,
})

const Dibujo = barras({
  datos: [
    linea(B.medicion, 'G64.medicion', true),
    linea(B.planilla, 'G64.planilla'),
    linea(B.taller, 'G64.taller'),
    linea(B.legal, 'G64.legal'),
    linea(B.contingencia, 'G64.contingencia'),
  ],
})

export default function V08Piloto() {
  return (
    <Vista id={ID} items={[{ clave: 'horas', valor: fijo(A['G64.horas_marketing'].valor) }]}>
      {Dibujo}
    </Vista>
  )
}
