// V14 · El plan (gestión, Sebastian C.). Las seis fases del plan (tabla plan de DF, leída por build_final.py del canon
// y controlada contra la Parte A del E4) como barras sobre las semanas desde la aprobación, cada una con su responsable,
// y arriba un marcador por semana con hito. La semana de la decisión, en --acc. Las semanas salen de DF; los rótulos, de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, CTX, EJE, INK, SUP, TINTE, Renglones, Titulo, ancho, duro, envolver, letra } from '../svg.jsx'

const ID = 'V14'
const T = DF.tablas
const PL = T.plan
const CAL = T.calendario
const X = textosDe(ID)
const SEM_FIN = DF.anclas['G63.semana_decision'].valor
const SEMANAS_HITO = [...new Set(PL.hitos.map((h) => h.semana))].sort((a, b) => a - b)

export const meta = { id: ID }

function medir(w, f, k) {
  const fQ = f * 0.92
  const col = Math.min(w * 0.36, Math.max(...PL.fases.map((x) => ancho(x.fase, f, 600))) + 8 * k)
  const x0 = col + 18 * k
  const dw = (w - x0) / PL.semanas
  const xs = (s) => x0 + (s - 0.5) * dw
  const gap = 0.5 * f
  const filas = PL.fases.map((x) => {
    const lt = envolver(x.fase, col, f, 600)
    return { ...x, lt, alto: lt.length * f * 1.25 + fQ * 1.3 }
  })
  const r = Math.min(f * 0.78, dw * 0.62)
  const yHitos = f * 1.0 + r
  const yFilas = yHitos + r + f * 0.9
  const yEje = yFilas + filas.reduce((s, x) => s + x.alto + gap, 0) - gap + f * 0.6
  return { fQ, col, x0, dw, xs, gap, filas, r, yHitos, yFilas, yEje, alto: yEje + f * 2.6 }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 15 * k)
  const m = medir(w, f, k)
  let y = m.yFilas
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${PL.fases.map((x) => `${x.fase}, ${X.semana} ${x.desde} a ${x.hasta}, ${x.responsable}`).join('; ')}`}>
      <Titulo x={0} y={m.yHitos + f * 0.35} f={f * 0.9} texto={X.hito} max={m.col} />
      <line x1={m.x0} x2={w} y1={m.yHitos} y2={m.yHitos} stroke={EJE} strokeWidth={1} />
      {SEMANAS_HITO.map((s) => {
        const fin = s === SEM_FIN
        return (
          <g key={s}>
            <title>{`${X.semana} ${s}: ${PL.hitos.filter((x) => x.semana === s).map((x) => x.responsable).join('; ')}`}</title>
            <line x1={m.xs(s)} x2={m.xs(s)} y1={m.yHitos} y2={m.yEje} stroke={fin ? ACC : EJE} strokeWidth={fin ? 1.5 : 0.75}
                  strokeDasharray={fin ? '0' : '2 3'} />
            <circle cx={m.xs(s)} cy={m.yHitos} r={m.r} fill={fin ? ACC : INK} stroke={SUP} strokeWidth={1.5} />
            <text x={m.xs(s)} y={m.yHitos} fontSize={Math.min(f * 0.85, m.r * 1.25)} fontWeight={700} fill="#fff"
                  textAnchor="middle" dominantBaseline="central" className="tabular">{fijo(s)}</text>
          </g>
        )
      })}
      {m.filas.map((x) => {
        const y0 = y
        y += x.alto + m.gap
        const xa = m.xs(x.desde) - m.dw / 2
        const xb = m.xs(x.hasta) + m.dw / 2
        const hb = Math.min(x.alto * 0.62, f * 1.5)
        return (
          <g key={x.n}>
            <Renglones lineas={x.lt} x={0} y={y0} f={f} peso={600} />
            <text x={0} y={y0 + x.lt.length * f * 1.25 + m.fQ * 0.1} fontSize={m.fQ} fontWeight={500} fill={CTX}
                  dominantBaseline="hanging">{duro(x.responsable)}</text>
            <rect x={xa} y={y0 + (x.alto - hb) / 2} width={Math.max(2, xb - xa)} height={hb} fill={TINTE}
                  stroke="var(--azul3)" strokeWidth={1} />
          </g>
        )
      })}
      <line x1={m.x0} x2={w} y1={m.yEje} y2={m.yEje} stroke={EJE} strokeWidth={1} />
      {[1, CAL.primera_lista.semana, CAL.tercera_lista.semana, CAL.preliminar.semana, PL.semanas].map((s) => (
        <text key={s} x={m.xs(s)} y={m.yEje + f * 0.25} fontSize={f * 0.9} fill={CTX} textAnchor="middle"
              dominantBaseline="hanging" className="tabular">{fijo(s)}</text>
      ))}
      <Titulo x={w} y={m.yEje + f * 2.1} f={f * 0.85} texto={X.eje} anchor="end" max={w - m.x0} />
    </svg>
  )
}

export default function V14Plan() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'decide', valor: fijo(SEM_FIN) },
             { clave: 'lista', valor: fijo(CAL.primera_lista.semana) },
             { clave: 'hitos', valor: fijo(PL.hitos.length) },
           ]}
           cifras={[fijo(CAL.preliminar.semana), fijo(SEM_FIN)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
