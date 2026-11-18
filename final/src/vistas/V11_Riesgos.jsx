// V11 · Qué puede fallar (legal, riesgos y adopción, Tomas F.). Los tres riesgos críticos de la C 6.3 (tabla TOP3 de
// contenido_c.py; DF cuenta cuántos son en riesgos_criticos.n) en tres columnas: el riesgo, la señal que se mira y qué se
// hace. El de adopción (quién corre la planilla) lleva el énfasis: es el que este bloque cuenta. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, BORDE, INK, Renglones, Titulo, envolver, letra } from '../svg.jsx'

const ID = 'V11'
const A = DF.anclas
const X = textosDe(ID)
const C = X.columnas
const ENFASIS = 1   // la fila de adopción

if (X.filas.length !== DF.tablas.riesgos_criticos.n) throw new Error('V11: la tarjeta y el gráfico no cuentan los mismos riesgos')

export const meta = { id: ID }

function medir(w, f, k) {
  const gap = 22 * k
  const barra = 5 * k
  const util = w - barra - 12 * k - 2 * gap
  const anchos = [0.28, 0.33, 0.39].map((p) => p * util)
  const xs = [barra + 12 * k, barra + 12 * k + anchos[0] + gap, barra + 12 * k + anchos[0] + anchos[1] + 2 * gap]
  const pad = 0.75 * f
  const filas = X.filas.map((r, i) => {
    const ls = [envolver(r.riesgo, anchos[0], f * 1.05, 700), envolver(r.senal, anchos[1], f), envolver(r.respuesta, anchos[2], f)]
    const alto = Math.max(ls[0].length * f * 1.05 * 1.25, ls[1].length * f * 1.25, ls[2].length * f * 1.25) + 2 * pad
    return { ...r, ls, alto, i }
  })
  const yCab = f * 1.1
  const yFilas = yCab + f * 0.9
  return { gap, barra, anchos, xs, pad, filas, yCab, yFilas, alto: yFilas + filas.reduce((s, x) => s + x.alto, 0) }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 15 * k)
  const m = medir(w, f, k)
  let y = m.yFilas
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${X.filas.map((r) => r.riesgo).join('; ')}`}>
      {[C.riesgo, C.senal, C.respuesta].map((t, j) => (
        <Titulo key={t} x={m.xs[j]} y={m.yCab} f={f * 0.9} texto={t} max={m.anchos[j]} />
      ))}
      {m.filas.map((r) => {
        const y0 = y
        y += r.alto
        const fuerte = r.i === ENFASIS
        return (
          <g key={r.riesgo}>
            <title>{`${r.riesgo}. ${C.senal}: ${r.senal}. ${C.respuesta}: ${r.respuesta}.`}</title>
            <line x1={0} x2={w} y1={y0} y2={y0} stroke={BORDE} strokeWidth={1} />
            <rect x={0} y={y0 + m.pad * 0.6} width={m.barra} height={r.alto - m.pad * 1.2} fill={fuerte ? ACC : 'var(--azul3)'} />
            <Renglones lineas={r.ls[0]} x={m.xs[0]} y={y0 + m.pad} f={f * 1.05} peso={700} color={fuerte ? ACC : INK} />
            <Renglones lineas={r.ls[1]} x={m.xs[1]} y={y0 + m.pad} f={f} />
            <Renglones lineas={r.ls[2]} x={m.xs[2]} y={y0 + m.pad} f={f} />
          </g>
        )
      })}
      <line x1={0} x2={w} y1={y} y2={y} stroke={BORDE} strokeWidth={1} />
    </svg>
  )
}

export default function V11Riesgos() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'riesgos', valor: fijo(DF.tablas.riesgos_criticos.n) },
             { clave: 'horas', valor: fijo(A['G64.horas_por_lista'].valor) },
             { clave: 'tasa', valor: pct(A.G31.valor, 2) },
           ]}
           cifras={[fijo(A['G64.horas_por_lista'].valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
