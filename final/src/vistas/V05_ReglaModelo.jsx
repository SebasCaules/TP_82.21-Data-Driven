// V05 · Regla contra modelo (modelo, Francisco C.). Spec de dataviz g V05 (18/11): la precisión de la lista mensual en la
// prueba final (J03, J17), en escala de 0 a 100 %. Regla y modelo con el mismo tratamiento, las dos en --acc, dicen «lo
// mismo»; la práctica actual, gris y corta, dice «y mucho mejor que hoy». La diferencia modelo menos regla (J09) es la
// única tarjeta; el intervalo queda en el title de la decisión. Sin conclusión ni eje.
// (18/11, intermedio) Vuelven de 8e633e8 la tarjeta central (acierta la regla, J03.regla) y la conclusión con la
// diferencia en valor absoluto (J09); las barras llenan el lienzo (llenar).

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
    { etiqueta: B.regla, valor: A['J03.regla'].valor, texto: pct(A['J03.regla'].valor), foco: true },
    { etiqueta: B.modelo, valor: A['J03.logistica'].valor, texto: pct(A['J03.logistica'].valor), foco: true },
    { etiqueta: B.hoy, valor: A.J17.valor, texto: pct(A.J17.valor) },
  ]
  return (
    <Vista id={ID} hibrido items={[{ clave: 'regla', valor: pct(A['J03.regla'].valor) }]}
           cifras={[fijo(Math.abs(A.J09.valor), 2)]}>
      {barras({ datos, maximo: 1, llenar: true })}
    </Vista>
  )
}
