// V14 · El plan (gestión, Sebastian C.). Las fases del plan (tabla plan de DF, leída por build_final.py del canon y
// controlada contra la Parte A del E4) como Gantt sobre las semanas desde la aprobación, de la 1 a la de la decisión
// (G63.semana_decision; lo que pase de ahí se recorta), cada fase con su responsable (spec de dataviz f.10, 18/11).
// Fases en gris; la fase que termina en la decisión, en acento. Arriba, la fila «semanas con hito»: un círculo con
// contorno por semana con hito y su número; el de la decisión, lleno en acento. Una sola vertical, la de la decisión. El
// hito de la aprobación va «antes de la semana 1» (canon v1.4, PN0-02): no tiene marca. Banda sola. Las semanas salen
// de DF; los rótulos, de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, FIN_GRIS, INK, SUP, TRAZO, Umbral, ancho, duro, rectRedondo, tam, useU }
  from '../svg.jsx'

const ID = 'V14'
const PL = DF.tablas.plan
const X = textosDe(ID)
const SEM_FIN = DF.anclas['G63.semana_decision'].valor
const SEMANAS_HITO = [...new Set(PL.hitos.map((h) => h.semana).filter((s) => typeof s === 'number' && s <= SEM_FIN))]
  .sort((a, b) => a - b)

export const meta = { id: ID }

function medir(w, u) {
  const fF = tam(24, u), fR = tam('sec', u), fH = tam('sec', u)
  const col = Math.max(...PL.fases.map((x) => ancho(x.fase, fF, 600)), ancho(X.hito, fH, 400))
  const x0 = col + 32 * u
  const dw = (w - x0) / SEM_FIN
  const xs = (s) => x0 + (s - 0.5) * dw
  const r = Math.min(16 * u, 0.45 * dw)
  const yHitos = Math.max(r, fH * 0.6)
  const fila = fF * 1.25 + fR * 1.25
  const gap = 16 * u
  const yFilas = yHitos + r + 24 * u
  return { fF, fR, fH, col, x0, dw, xs, r, yHitos, fila, gap, yFilas, alto: yFilas + PL.fases.length * (fila + gap) - gap }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const hb = 32 * u
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        <text x={0} y={m.yHitos} fontSize={m.fH} fontWeight={400} fill={CTX} dominantBaseline="central">{X.hito}</text>
        <Umbral u={u} x1={m.xs(SEM_FIN)} x2={m.xs(SEM_FIN)} y1={m.yHitos} y2={m.alto} color={ACC} ancho={2} punteada />
        {SEMANAS_HITO.map((s) => {
          const fin = s === SEM_FIN
          return (
            <g key={s}>
              <title>{`${X.semana} ${s}: ${PL.hitos.filter((x) => x.semana === s).map((x) => x.responsable).join('; ')}`}</title>
              <circle cx={m.xs(s)} cy={m.yHitos} r={m.r} fill={fin ? ACC : SUP} stroke={fin ? ACC : CONTORNO}
                      strokeWidth={TRAZO.contorno * u} />
              <text x={m.xs(s)} y={m.yHitos} fontSize={tam('piso', u)} fontWeight={fin ? 700 : 600} fill={fin ? SUP : INK}
                    textAnchor="middle" dominantBaseline="central">{fijo(s)}</text>
            </g>
          )
        })}
        {PL.fases.map((x, i) => {
          const yf = m.yFilas + i * (m.fila + m.gap)
          const foco = x.desde <= SEM_FIN && x.hasta >= SEM_FIN
          const desde = Math.max(1, x.desde), hasta = Math.min(SEM_FIN, x.hasta)
          const xa = m.xs(desde) - m.dw / 2
          const xb = hasta === SEM_FIN ? m.xs(SEM_FIN) + u : m.xs(hasta) + m.dw / 2   // la última termina en la vertical
          return (
            <g key={x.n}>
              <title>{`${x.fase}: ${X.semana} ${x.desde} a ${x.hasta}, ${x.responsable}`}</title>
              <text x={0} y={yf} fontSize={m.fF} fontWeight={foco ? 600 : 400} fill={INK} dominantBaseline="hanging">{x.fase}</text>
              <text x={0} y={yf + m.fF * 1.25} fontSize={m.fR} fill={CTX} dominantBaseline="hanging">{duro(x.responsable)}</text>
              {hasta >= desde && (
                <path d={rectRedondo(xa + u, yf + (m.fila - hb) / 2, Math.max(4 * u, xb - xa - 2 * u), hb, TRAZO.radio * u, 'todos')}
                      fill={foco ? ACC : FIN_GRIS} />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function V14Plan() {
  return (
    <Vista id={ID}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
