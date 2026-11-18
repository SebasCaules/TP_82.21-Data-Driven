// V11 · Qué puede fallar (legal, riesgos y adopción, Tomas F.). Los tres riesgos críticos de la C 6.3 (tabla TOP3 de
// contenido_c.py; DF cuenta cuántos son en riesgos_criticos.n) como lista de dos columnas: el riesgo y qué se hace
// (spec de dataviz f.7, 18/11). Sin cabeceras ni columna de señal (la señal queda en el title de cada fila). La fila de
// adopción (quién corre la planilla) es la que nombra el título: fondo de realce y texto en tinta; las otras dos en
// --e3-ctx. La tarjeta de la banda es la de las horas por lista. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { BORDE, CTX, INK, REALCE, Renglones, TRAZO, envolver, tam, useU } from '../svg.jsx'

const ID = 'V11'
const A = DF.anclas
const X = textosDe(ID)
const C = X.columnas
const FOCO = 1   // la fila de adopción

if (X.filas.length !== DF.tablas.riesgos_criticos.n) throw new Error('V11: la tarjeta y el gráfico no cuentan los mismos riesgos')

export const meta = { id: ID }

function medir(w, u) {
  const f = tam('fila', u)
  const pad = 16 * u          // relleno de cada fila
  const gap = 48 * u          // entre columnas
  const util = w - 2 * pad - gap
  const anchos = [0.4 * util, 0.6 * util]
  const xs = [pad, pad + anchos[0] + gap]
  const filas = X.filas.map((r, i) => {
    const foco = i === FOCO
    const ls = [envolver(r.riesgo, anchos[0], f, foco ? 700 : 400), envolver(r.respuesta, anchos[1], f)]
    const alto = Math.max(ls[0].length, ls[1].length) * f * 1.25 + 2 * pad
    return { ...r, ls, alto, foco }
  })
  const sep = 16 * u          // aire entre filas
  return { f, pad, xs, filas, sep, alto: filas.reduce((s, x) => s + x.alto, 0) + sep * (filas.length - 1) }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, u)
  let y = Math.max(0, (h - m.alto) / 2)   // la lista, centrada en el alto
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {m.filas.map((r, i) => {
        const y0 = y
        y += r.alto + m.sep
        const previa = m.filas[i - 1]
        const color = r.foco ? INK : CTX
        return (
          <g key={r.riesgo}>
            <title>{`${r.riesgo}. ${C.senal}: ${r.senal}. ${C.respuesta}: ${r.respuesta}.`}</title>
            {r.foco && <rect x={0} y={y0} width={w} height={r.alto} rx={TRAZO.radio * u} fill={REALCE} />}
            {i > 0 && !r.foco && !previa.foco && (
              <line x1={0} x2={w} y1={y0 - m.sep / 2} y2={y0 - m.sep / 2} stroke={BORDE} strokeWidth={u} />
            )}
            <Renglones lineas={r.ls[0]} x={m.xs[0]} y={y0 + m.pad} f={m.f} peso={r.foco ? 700 : 400} color={color} />
            <Renglones lineas={r.ls[1]} x={m.xs[1]} y={y0 + m.pad} f={m.f} peso={400} color={color} />
          </g>
        )
      })}
    </svg>
  )
}

export default function V11Riesgos() {
  return (
    <Vista id={ID} items={[{ clave: 'horas', valor: fijo(A['G64.horas_por_lista'].valor) }]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
