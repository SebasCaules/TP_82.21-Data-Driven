// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo,
// operación mínima si una rama pasa y producción completa si el efecto la paga. Cuatro cajas del mismo ancho y del alto
// del contenido, centradas en vertical, con un chevrón entre cajas (spec de dataviz f.9, 18/11). El estado de cada caja
// usa ESTADO de svg.jsx, el mismo de V12: la PoC hecha con borde superior en acento, el MVP con borde superior gris y las
// dos condicionales con el borde entero punteado. Banda sola; la conclusión (única en /final/) dice qué probó la PoC y
// qué falta, con J03.regla. El texto de cada caja, en CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pct } from '../../../e3/src/formato.js'
import { BORDE, CTX, Chevron, ESTADO, INK, Renglones, SUP, TRAZO, envolver, inicial, marcaEstado, rectRedondo, tam, useU }
  from '../svg.jsx'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
// etapa → estado (spec b.6): PoC hecha, MVP en el piloto, las dos siguientes condicionales
const ESTADOS = ['hecha', 'piloto', 'condicional', 'condicional']

export const meta = { id: ID }

function medir(w, u) {
  const n = X.etapas.length
  const paso = 64 * u                       // entre cajas, con el chevrón de 32 u en el medio
  const bw = (w - paso * (n - 1)) / n
  const pad = 24 * u
  const borde = 6 * u                       // marca de estado arriba
  const fN = tam('nombre', u), fE = tam('sec', u), fQ = tam(24, u)
  const cajas = X.etapas.map((e, i) => {
    const ln = envolver(e.nombre, bw - 2 * pad, fN, 700)
    const le = envolver(inicial(e.estado), bw - 2 * pad, fE, 600)
    const lq = envolver(e.que, bw - 2 * pad, fQ)
    const alto = borde + pad + ln.length * fN * 1.25 + 8 * u + le.length * fE * 1.25 + 16 * u + lq.length * fQ * 1.25 + pad
    return { ...e, ln, le, lq, alto, marca: ESTADOS[i] }
  })
  return { paso, bw, pad, borde, fN, fE, fQ, cajas, alto: Math.max(...cajas.map((c) => c.alto)) }
}

function Caja({ u, x, y, w, h, estado, borde }) {
  if (estado === 'condicional') {
    const m = marcaEstado('condicional', u)
    const sw = m.strokeWidth
    return <rect x={x + sw / 2} y={y + sw / 2} width={w - sw} height={h - sw} rx={TRAZO.radio * u} {...m} fill={SUP} />
  }
  return (
    <g>
      <rect x={x + u / 2} y={y + u / 2} width={w - u} height={h - u} rx={TRAZO.radio * u} fill={SUP} stroke={BORDE}
            strokeWidth={u} />
      <path d={rectRedondo(x, y, w, borde, TRAZO.radio * u, 'arr')} fill={ESTADO[estado].fill} />
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, u)
  const yTop = Math.max(0, (h - m.alto) / 2)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {m.cajas.map((c, i) => {
        const x0 = i * (m.bw + m.paso)
        const xT = x0 + m.pad
        const yN = yTop + m.borde + m.pad
        const yE = yN + c.ln.length * m.fN * 1.25 + 8 * u
        const yQ = yE + c.le.length * m.fE * 1.25 + 16 * u
        return (
          <g key={c.nombre}>
            <title>{`${c.nombre} (${c.estado}): ${c.que}`}</title>
            <Caja u={u} x={x0} y={yTop} w={m.bw} h={m.alto} estado={c.marca} borde={m.borde} />
            <Renglones lineas={c.ln} x={xT} y={yN} f={m.fN} peso={700} color={INK} />
            <Renglones lineas={c.le} x={xT} y={yE} f={m.fE} peso={600} color={CTX} />
            <Renglones lineas={c.lq} x={xT} y={yQ} f={m.fQ} peso={400} color={CTX} />
            {i < m.cajas.length - 1 && <Chevron u={u} x={x0 + m.bw + m.paso / 2} y={yTop + m.alto / 2} />}
          </g>
        )
      })}
    </svg>
  )
}

export default function V13Etapas() {
  return (
    <Vista id={ID} conclusion cifras={[pct(A['J03.regla'].valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
