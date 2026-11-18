// V07 · No se paga (economía, Juan Manuel R.). La estructura de la vista 5 del E3 (tres cifras en la banda, costo contra
// beneficio con BarrasH y la línea del presupuesto): es la vista que scripts/check_final_f6.py le pasa a paridad_final.py
// (--vista v07) para compararla con la vista 4 del E2. Central: el ROI de la regla que sale (G54, piloto mínimo más
// producción completa) y al lado, en la otra mitad de la banda, el del modelo (G40), como pedía el pendiente 190 (con
// tres tarjetas, «−99,95 %» no entra en una secundaria). Lo que deja la lista, en --acc.

import Vista from '../Plantilla.jsx'
import { barras } from '../barras.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pctDirecto, usd } from '../../../e3/src/formato.js'

const ID = 'V07'
const A = DF.anclas
const B = textosDe(ID).barras
const monto = (x) => usd(x, 0)
/** La letra de los valores de BarrasH (src/graficos.jsx, con título de eje: 48 de eje y 8 arriba). */
const valoresDe = (h, n) => Math.max(10.5, Math.min(13, ((h - 8 - 48) / n) * 0.42))

export const meta = { id: ID }

const DATOS = [
  { etiqueta: B.costo_modelo, valor: A.G38.valor },
  { etiqueta: B.costo_regla, valor: A.G39.valor },
  { etiqueta: B.deja, valor: A.G54.valor, enfasis: true, anchoMin: 3 },
]
const Dibujo = barras({
  datos: DATOS, formato: monto, formatoEje: (x) => fijo(x, 0), tituloEje: B.eje,
  referencia: { valor: A.C28.valor, etiqueta: `${B.presupuesto} ${monto(A.C28.valor)}` },
})

export default function V07NoSePaga() {
  return (
    <Vista id={ID} lienzo="fin-ref"
           items={[
             { clave: 'roi', span: 3, valor: pctDirecto(A['G54.roi'].valor, 2) },
             { clave: 'roi_modelo', span: 3, valor: pctDirecto(A['G40.roi'].valor, 2) },
           ]}
           cifras={[monto(A.G54.valor)]}>
      {({ w, h }) => (
        <div style={{ '--fin-ref': valoresDe(h, DATOS.length) / 10 }}>
          <Dibujo w={w} h={h} />
        </div>
      )}
    </Vista>
  )
}
