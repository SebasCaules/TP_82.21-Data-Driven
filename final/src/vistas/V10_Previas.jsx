// V10 · Qué va antes (legal, Tomas F.). Las acciones legales que se hacen antes de la primera lista, una por fila, con su
// semana del plan (tabla legal_previas de DF, leída por build_final.py de la tabla «Precondiciones de la primera lista» de
// la Parte A del E4) y la semana de la primera lista (calendario) como línea en --acc. La tarjeta «Acciones previas»
// cuenta las mismas filas que dibuja el gráfico (legal_previas.n): el pendiente 198. Puntaje legal 1,8 y protección de
// datos en 1 (H40 y tabla legal), el pendiente 182.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, BORDE, CTX, EJE, INK, SUP, Renglones, Titulo, ancho, duro, envolver, letra } from '../svg.jsx'

const ID = 'V10'
const A = DF.anclas
const T = DF.tablas
const X = textosDe(ID)
const ACCIONES = T.legal_previas.acciones.map((a) => ({ ...a, ...X.acciones[a.codigo] }))
const SEM_LISTA = T.calendario.primera_lista.semana
const proteccion = T.legal.find((x) => x.id === 'proteccion_datos').puntaje
const sobre = (n, d = 0) => `${fijo(n, d)}[[/${fijo(T.escala_tecnica.hasta)}]]`

if (ACCIONES.length !== T.legal_previas.n) throw new Error('V10: la tarjeta y el gráfico no cuentan las mismas acciones')

export const meta = { id: ID }

function medir(w, f, k) {
  const fQ = f * 0.92
  const col = Math.min(w * 0.5, Math.max(...ACCIONES.map((a) => ancho(a.que, f, 600))) + 12 * k)
  const x0 = col + 24 * k
  const dw = (w - x0) / SEM_LISTA
  const xs = (s) => x0 + (s - 0.5) * dw
  const gap = 0.7 * f
  const filas = ACCIONES.map((a) => {
    const lt = envolver(a.que, col, f, 600)
    return { ...a, lt, alto: lt.length * f * 1.25 + fQ * 1.3 }
  })
  const yTit = f * 1.1
  const yEje = yTit + f * 1.9
  const yFilas = yEje + f * 1.1
  const alto = yFilas + filas.reduce((s, x) => s + x.alto + gap, 0) - gap
  return { fQ, col, x0, dw, xs, gap, filas, yTit, yEje, yFilas, alto }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 15 * k)
  const m = medir(w, f, k)
  const r = Math.min(f * 0.55, m.dw * 0.3)
  const xL = m.xs(SEM_LISTA)
  let y = m.yFilas
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${ACCIONES.map((a) => `${a.que}, ${X.semana} ${a.semana}`).join('; ')}`}>
      <Titulo x={m.x0} y={m.yTit} f={f} texto={X.semana} max={xL - m.x0 - 8 * k} />
      <text x={w} y={m.yTit} fontSize={f} fontWeight={700} fill={ACC} textAnchor="end">{X.primera}</text>
      {Array.from({ length: SEM_LISTA }, (_, i) => i + 1).map((s) => (
        <text key={s} x={m.xs(s)} y={m.yEje} fontSize={f} fontWeight={s === SEM_LISTA ? 700 : 500}
              fill={s === SEM_LISTA ? ACC : CTX} textAnchor="middle" className="tabular">{fijo(s)}</text>
      ))}
      <line x1={m.x0} x2={w} y1={m.yEje + f * 0.45} y2={m.yEje + f * 0.45} stroke={EJE} strokeWidth={1} />
      {m.filas.map((a) => {
        const y0 = y
        y += a.alto + m.gap
        const yc = y0 + a.alto / 2
        return (
          <g key={a.codigo}>
            <title>{`${a.que}: ${X.semana} ${a.semana}, ${a.quien}`}</title>
            <Renglones lineas={a.lt} x={0} y={y0} f={f} peso={600} />
            <text x={0} y={y0 + a.lt.length * f * 1.25 + m.fQ * 0.1} fontSize={m.fQ} fontWeight={500} fill={CTX}
                  dominantBaseline="hanging">{duro(a.quien)}</text>
            <line x1={m.x0} x2={m.xs(a.semana)} y1={yc} y2={yc} stroke={BORDE} strokeWidth={2} />
            <circle cx={m.xs(a.semana)} cy={yc} r={r} fill={INK} stroke={SUP} strokeWidth={1.5} />
          </g>
        )
      })}
      <line x1={xL} x2={xL} y1={m.yEje + f * 0.45} y2={y - m.gap} stroke={ACC} strokeWidth={2} strokeDasharray="4 3" />
    </svg>
  )
}

export default function V10Previas() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'puntaje', valor: sobre(A.H40.valor, 1) },
             { clave: 'proteccion', valor: sobre(proteccion) },
             { clave: 'previas', valor: fijo(T.legal_previas.n) },
           ]}
           cifras={[fijo(SEM_LISTA)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
