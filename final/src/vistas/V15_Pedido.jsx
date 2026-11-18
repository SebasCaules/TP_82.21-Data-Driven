// V15 · Lo que pedimos (cierre, Sebastian C.). Lo que se le pide a Casa Óga en la banda (el piloto mínimo, G64; el
// acuerdo de confidencialidad en la semana del hito 1; la decisión en la semana 28) y, en el gráfico, el balance que el
// canon pide para el cierre (presentacion.bloques, cierre): qué se aprendió, qué falló, el supuesto y la limitación, una
// fila cada uno con su rótulo y un fragmento (J-WEB-08: reemplaza el árbol de la semana 28, que ya dicen V09 y V13). La
// afirmación para recordar va en la conclusión. Nada se da por firmado ni aprobado: es lo que se pide. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { BORDE, CTX, INK, Renglones, anchoMono, envolver, envolverMono, letra } from '../svg.jsx'

const ID = 'V15'
const A = DF.anclas
const X = textosDe(ID)
const BAL = X.balance
const SEM_FIN = A['G63.semana_decision'].valor
const SEM_ACUERDO = DF.tablas.plan.hitos.find((h) => h.n === 1).semana

export const meta = { id: ID }

function medir(w, f, k) {
  const fR = f * 0.8
  const barra = 5 * k
  const col = Math.min(w * 0.3, Math.max(...BAL.map((b) => anchoMono(b.que, fR))) + 28 * k)
  const xT = barra + 14 * k + col
  const pad = 0.7 * f
  const filas = BAL.map((b) => {
    const lr = envolverMono(b.que, col - 14 * k, fR)
    const lt = envolver(b.texto, w - xT, f, 500)
    return { ...b, lr, lt, alto: Math.max(lr.length * fR * 1.3, lt.length * f * 1.25) + 2 * pad }
  })
  return { fR, barra, col, xT, pad, filas, alto: filas.reduce((s, x) => s + x.alto, 0) }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 26 * k)
  const m = medir(w, f, k)
  let y = Math.max(0, (h - m.alto) / 2)
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${BAL.map((b) => `${b.que}, ${b.texto}`).join('; ')}`}>
      {m.filas.map((b, i) => {
        const y0 = y
        y += b.alto
        const yT = y0 + (b.alto - b.lt.length * f * 1.25) / 2
        const yR = y0 + (b.alto - b.lr.length * m.fR * 1.3) / 2
        return (
          <g key={b.que}>
            <title>{`${b.que}: ${b.texto}`}</title>
            {i > 0 && <line x1={0} x2={w} y1={y0} y2={y0} stroke={BORDE} strokeWidth={1} />}
            <rect x={0} y={y0 + m.pad * 0.6} width={m.barra} height={b.alto - m.pad * 1.2} fill="var(--azul3)" />
            {b.lr.map((l, j) => (
              <text key={j} x={m.barra + 14 * k} y={yR + j * m.fR * 1.3} fontSize={m.fR} fontWeight={600} fill={CTX}
                    fontFamily="var(--mono)" letterSpacing={0.08 * m.fR} dominantBaseline="hanging"
                    style={{ textTransform: 'uppercase' }}>{l}</text>
            ))}
            <Renglones lineas={b.lt} x={m.xT} y={yT} f={f} peso={500} color={INK} />
          </g>
        )
      })}
    </svg>
  )
}

export default function V15Pedido() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'acuerdo', valor: fijo(SEM_ACUERDO) },
             { clave: 'decide', valor: fijo(SEM_FIN) },
           ]}
           cifras={[usd(A.G64.valor), usd(A.G39.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
