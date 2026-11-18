// V01 · La recomendación (apertura, Tomas F.). Spec de dataviz g V01 (18/11): una tarjeta, la semana de la decisión
// (G63), y la tarjeta de decisión con «No viable como proyecto.»; el veredicto entero queda en su title y en la voz. El
// gráfico: el piloto mínimo (G64) en --acc contra el proyecto entero el primer año (G39) en gris y, separado, lo que deja
// la lista por año (G54) en contorno, porque es un beneficio y no un costo. Sin conclusión ni eje.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const ID = 'V01'
const A = DF.anclas
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V01Recomendacion() {
  const datos = [
    { etiqueta: B.piloto, valor: A.G64.valor, texto: usd(A.G64.valor), foco: true },
    { etiqueta: B.cuesta, valor: A.G39.valor, texto: usd(A.G39.valor) },
    { etiqueta: B.deja, valor: A.G54.valor, texto: usd(A.G54.valor), contorno: true, separado: true },
  ]
  return (
    <Vista id={ID} items={[{ clave: 'semana', valor: fijo(A['G63.semana_decision'].valor) }]}>
      {barras({ datos, maximo: A.G39.valor })}
    </Vista>
  )
}
