// V01 · La recomendación (apertura, Tomas F.). El veredicto del canon partido en dos: «No viable como proyecto.» en la
// tarjeta de decisión y el resto en la conclusión, con sus dos cifras. La banda lleva tres de las cinco cifras del resumen
// ejecutivo de la D v3.0 (piloto mínimo, umbral de pase contra menos de un punto esperado, semana de la decisión); el
// gráfico, las otras dos (lo que deja la lista por año contra el costo del primer año), con el piloto entre ellas en --acc.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const ID = 'V01'
const A = DF.anclas
const B = textosDe(ID).barras
const monto = (x) => usd(x, 0)

export const meta = { id: ID }

export default function V01Recomendacion() {
  const datos = [
    { etiqueta: B.deja, valor: A.G54.valor, anchoMin: 3 },
    { etiqueta: B.piloto, valor: A.G64.valor, enfasis: true },
    { etiqueta: B.cuesta, valor: A.G39.valor },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'umbral', valor: fijo(A['G67.con_descuento'].valor) },
             { clave: 'semana', valor: fijo(A['G63.semana_decision'].valor) },
           ]}
           cifras={[usd(A.G64.valor), fijo(A['G63.semana_decision'].valor)]}>
      {barras({ datos, formato: monto, formatoEje: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
