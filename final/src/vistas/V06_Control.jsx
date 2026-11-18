// V06 · Cómo se mide (modelo, Francisco C.). La lista de muestra al corte de agosto de 2025 (K16 a K19, tabla
// lista_muestra de DF, que build_final.py controla contra la lista generada): el grupo de mayor facturación, que se
// contacta entero; el control, en --acc, que es lo que permite medir; y las dos ramas.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'

const ID = 'V06'
const A = DF.anclas
const LM = DF.tablas.lista_muestra
const B = textosDe(ID).barras

export const meta = { id: ID }

export default function V06Control() {
  const datos = [
    { etiqueta: B.alto, valor: LM.alto_valor, nota: B.nota_alto },
    { etiqueta: B.control, valor: LM.control, enfasis: true },
    { etiqueta: B.con, valor: LM.con_descuento },
    { etiqueta: B.sin, valor: LM.sin_descuento },
  ]
  return (
    <Vista id={ID}
           items={[
             { clave: 'control', valor: fijo(A['G49.control_mes'].valor) },
             { clave: 'lista', valor: fijo(A['G49.lista_mes'].valor) },
             { clave: 'meses', valor: fijo(A['G49.meses'].valor) },
           ]}
           cifras={[pct(A['G49.alto_valor'].valor, 0)]}>
      {barras({ datos, formato: (x) => fijo(x, 0), tituloEje: B.eje })}
    </Vista>
  )
}
