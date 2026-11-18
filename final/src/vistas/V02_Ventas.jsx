// V02 · Qué ventas entran (datos, Matías S.). Spec de dataviz g V02 (18/11): el extracto de ventas paso a paso (C20) como
// cascada con fantasma. Cada barra es lo que queda y su tramo fantasma, lo que se fue en ese paso; todas en gris, y el
// foco es la caída sin cliente (fantasma en --acc con su nota adentro), la que explica la tarjeta (C19). Los puntajes de
// datos y calidad y la conclusión salen de la pantalla: los dice la voz. Sin eje.
// (18/11, intermedio) Vuelven de 8e633e8 la tarjeta central (ventas sin cliente, C19) y la conclusión con su cifra
// (C20.positivas); la cascada llena el lienzo (llenar).

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V02'
const A = DF.anclas
const B = textosDe(ID).barras
const v = (k) => A[k].valor
const filas = (x) => fijo(x, 0)

export const meta = { id: ID }

export default function V02Ventas() {
  const datos = [
    { etiqueta: B.crudo, valor: v('C20.crudo'), texto: filas(v('C20.crudo')) },
    { etiqueta: B.unicas, valor: v('C20.unicas'), texto: filas(v('C20.unicas')),
      fantasma: v('C20.crudo'), nota: B.nota_repetidas },
    { etiqueta: B.con_cliente, valor: v('C20.con_cliente'), texto: filas(v('C20.con_cliente')),
      fantasma: v('C20.unicas'), fantasmaFoco: true, notaFantasma: B.nota_sin_cliente },
    { etiqueta: B.positivas, valor: v('C20.positivas'), texto: filas(v('C20.positivas')),
      fantasma: v('C20.con_cliente'), nota: B.nota_no_positivas },
  ]
  return (
    <Vista id={ID} hibrido items={[{ clave: 'sin_cliente', valor: pct(A.C19.valor / 100) }]}
           cifras={[filas(v('C20.positivas'))]}>
      {barras({ datos, llenar: true })}
    </Vista>
  )
}
