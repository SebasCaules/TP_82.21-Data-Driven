// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo,
// operación mínima si una rama pasa y producción completa si el efecto la paga. Cuatro cajas con flechas: la PoC
// resuelta (--sem-meta), el MVP en --acc (lo que se pide) y las dos siguientes en gris, cada una con su condición. Los
// costos van en la banda (G64, G66, G65); el texto de cada caja, en CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct, usd } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, BORDE, CTX, HECHO, INK, SUP, TINTE, Renglones, envolver, envolverMono, letra } from '../svg.jsx'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
const TONO = [HECHO, ACC, CTX, CTX]

export const meta = { id: ID }

function medir(w, f, k) {
  const flecha = 22 * k
  const n = X.etapas.length
  const bw = (w - flecha * (n - 1)) / n
  const pad = 0.8 * f
  const fT = f * 1.15
  const fE = f * 0.9
  const cajas = X.etapas.map((e) => {
    const ln = envolver(e.nombre, bw - 2 * pad, fT, 700)
    const le = envolverMono(e.estado, bw - 2 * pad, fE)
    const lq = envolver(e.que, bw - 2 * pad, f)
    return { ...e, ln, le, lq, alto: pad + ln.length * fT * 1.25 + 0.3 * f + le.length * fE * 1.3 + 0.6 * f + lq.length * f * 1.25 + pad }
  })
  return { flecha, bw, pad, fT, fE, cajas, alto: Math.max(...cajas.map((c) => c.alto)) }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 16 * k)
  const m = medir(w, f, k)
  const yTop = Math.max(0, (h - m.alto) / 2)
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${X.etapas.map((e) => `${e.nombre}, ${e.estado}`).join('; ')}`}>
      {m.cajas.map((c, i) => {
        const x0 = i * (m.bw + m.flecha)
        const tono = TONO[i]
        const yE = yTop + m.pad + c.ln.length * m.fT * 1.25 + 0.3 * f
        const yQ = yE + c.le.length * m.fE * 1.3 + 0.6 * f
        return (
          <g key={c.nombre}>
            <title>{`${c.nombre} (${c.estado}): ${c.que}`}</title>
            <rect x={x0} y={yTop} width={m.bw} height={m.alto} fill={i === 1 ? TINTE : SUP}
                  stroke={i === 1 ? ACC : i === 0 ? HECHO : BORDE} strokeWidth={i < 2 ? 1.5 : 1} />
            <rect x={x0} y={yTop} width={m.bw} height={3 * k} fill={i < 2 ? tono : 'var(--azul3)'} />
            <Renglones lineas={c.ln} x={x0 + m.pad} y={yTop + m.pad} f={m.fT} peso={700} color={i === 1 ? ACC : INK} />
            {c.le.map((l, j) => (
              <text key={j} x={x0 + m.pad} y={yE + j * m.fE * 1.3} fontSize={m.fE} fontWeight={600} fill={tono}
                    fontFamily="var(--mono)" letterSpacing={0.08 * m.fE} dominantBaseline="hanging"
                    style={{ textTransform: 'uppercase' }}>{l}</text>
            ))}
            <Renglones lineas={c.lq} x={x0 + m.pad} y={yQ} f={f} />
            {i < m.cajas.length - 1 && (
              <path d={`M${x0 + m.bw + 4 * k},${yTop + m.alto / 2} h${m.flecha - 9 * k} l-${4 * k},-${4 * k} m${4 * k},${4 * k} l-${4 * k},${4 * k}`}
                    fill="none" stroke={INK} strokeWidth={1.5} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function V13Etapas() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'mvp', valor: usd(A.G64.valor) },
             { clave: 'minima', valor: fijo(A['G66.recurrente'].valor) },
             { clave: 'completa', valor: fijo(A['G65.primer_anio'].valor) },
           ]}
           cifras={[pct(A['J03.regla'].valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
