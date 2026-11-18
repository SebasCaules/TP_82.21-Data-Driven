// V15 · Lo que pedimos (cierre, Sebastian C.). Arriba del lienzo, el pedido a Casa Óga en dos filas grandes con filete
// en acento (spec de dataviz f.11, 18/11): el piloto mínimo (G64) y el acuerdo de confidencialidad en la semana del
// hito 1; los dos pesan igual. Debajo, chico y separado, el balance que el canon pide para el cierre
// (presentacion.bloques, cierre): qué se aprendió, qué falló, el supuesto y la limitación. La banda lleva solo la semana
// de la decisión (G63.semana_decision). Nada se da por firmado ni aprobado: es lo que se pide. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, BORDE, CTX, INK, ancho, tam, useU } from '../svg.jsx'

const ID = 'V15'
const A = DF.anclas
const X = textosDe(ID)
const BAL = X.balance
const SEM_FIN = A['G63.semana_decision'].valor
const SEM_ACUERDO = DF.tablas.plan.hitos.find((h) => h.n === 1).semana

// las dos filas del pedido: rótulo y fragmento de CF; la cifra con su palabra delante (unidad de DF o «antes» de CF)
const PEDIDO = [
  { ...X.piloto, antes: A.G64.unidad, cifra: fijo(A.G64.valor) },
  { ...X.acuerdo, cifra: fijo(SEM_ACUERDO) },
]

export const meta = { id: ID }

function medir(w, u) {
  const fR = tam('fila', u), fC = tam(48, u), fA = 0.6 * fC, fL = tam(24, u)
  const fB = tam('sec', u), fT = tam(24, u)
  const filete = 8 * u
  const xR = filete + 24 * u
  const espacio = ancho(' ', fC, 700)
  const anchoCifra = (p) => (p.antes ? ancho(p.antes, fA, 600) + espacio : 0) + ancho(p.cifra, fC, 700)
  const xC = xR + Math.max(...PEDIDO.map((p) => ancho(p.rotulo, fR, 600))) + 48 * u
  const xL = xC + Math.max(...PEDIDO.map(anchoCifra)) + 48 * u
  const filaP = 140 * u, gapP = 16 * u
  const ySep = PEDIDO.length * filaP + (PEDIDO.length - 1) * gapP + 32 * u
  const yBal = ySep + 32 * u
  const filaB = 44 * u
  const xT = xR + Math.max(...BAL.map((b) => ancho(b.que, fB, 600))) + 32 * u
  return { fR, fC, fA, fL, fB, fT, filete, xR, xC, xL, filaP, gapP, ySep, yBal, filaB, xT,
    alto: yBal + BAL.length * filaB }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {PEDIDO.map((p, i) => {
          const y = i * (m.filaP + m.gapP)
          const yb = y + m.filaP / 2 + 0.35 * m.fC   // línea de base común de los tres textos
          return (
            <g key={p.rotulo}>
              <title>{`${p.rotulo}: ${p.antes ? `${p.antes} ` : ''}${p.cifra}, ${p.linea}`}</title>
              <rect x={0} y={y} width={m.filete} height={m.filaP} fill={ACC} />
              <text x={m.xR} y={yb} fontSize={m.fR} fontWeight={600} fill={CTX}>{p.rotulo}</text>
              <text x={m.xC} y={yb} fontSize={m.fC} fontWeight={700} fill={INK}>
                {p.antes && <tspan fontSize={m.fA} fontWeight={600}>{`${p.antes} `}</tspan>}
                {p.cifra}
              </text>
              <text x={m.xL} y={yb} fontSize={m.fL} fill={CTX}>{p.linea}</text>
            </g>
          )
        })}
        <line x1={0} x2={w} y1={m.ySep} y2={m.ySep} stroke={BORDE} strokeWidth={u} />
        {BAL.map((b, i) => {
          const yc = m.yBal + i * m.filaB + m.filaB / 2
          return (
            <g key={b.que}>
              <title>{`${b.que}: ${b.texto}`}</title>
              <text x={m.xR} y={yc} fontSize={m.fB} fontWeight={600} fill={CTX} dominantBaseline="central">{b.que}</text>
              <text x={m.xT} y={yc} fontSize={m.fT} fill={CTX} dominantBaseline="central">{b.texto}</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function V15Pedido() {
  return (
    <Vista id={ID} items={[{ clave: 'decide', valor: fijo(SEM_FIN) }]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
