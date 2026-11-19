// V11 · Qué puede fallar (legal, riesgos y adopción, Tomas F.). Los tres riesgos críticos de la C 6.3 (tabla TOP3 de
// contenido_c.py; DF cuenta cuántos son en riesgos_criticos.n) como lista de dos columnas: el riesgo y qué se hace
// (spec de dataviz f.7, 18/11). Sin cabeceras ni columna de señal (la señal queda en el title de cada fila). La fila de
// adopción (quién corre la planilla) es la que nombra el título: fondo de realce y texto en tinta; las otras dos en
// --e3-ctx. La tarjeta de la banda es la de las horas por lista. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, BORDE, CTX, INK, REALCE, Renglones, TRAZO, envolver, tam, useU } from '../svg.jsx'

const ID = 'V11'
const A = DF.anclas
const X = textosDe(ID)
const C = X.columnas
const FOCO = 1   // la fila de adopción

if (X.filas.length !== DF.tablas.riesgos_criticos.n) throw new Error('V11: la tarjeta y el gráfico no cuentan los mismos riesgos')

export const meta = { id: ID }

// (18/11, intermedio) La lista llena el 90 % del alto del lienzo (el texto visible, un 76 %): el relleno de cada fila y el aire entre filas crecen
// juntos con lo que sobra (entre 24 y 72 u); la letra no cambia.
const LLENA = 0.9
// (cierre CF-07) Tope del relleno: 115 u (1,6 veces 72) para que en 4:3 la lista también llene; en 16:9 no llega al tope.
const PAD_MAX = 115

function medir(w, h, u) {
  const f = tam('nombre', u)
  const gap = 48 * u          // entre columnas
  const pad0 = 24 * u
  const util = w - 2 * pad0 - gap
  const anchos = [0.4 * util, 0.6 * util]
  const xs = [pad0, pad0 + anchos[0] + gap]
  const lineas = X.filas.map((r, i) => {
    const foco = i === FOCO
    return { ...r, foco, ls: [envolver(r.riesgo, anchos[0], f, foco ? 700 : 400), envolver(r.respuesta, anchos[1], f)] }
  })
  const texto = lineas.reduce((s, r) => s + Math.max(r.ls[0].length, r.ls[1].length) * f * 1.25, 0)
  const n = lineas.length
  // relleno arriba y abajo de cada fila (2n) y aire entre filas (n - 1), todos del mismo tamaño
  const pad = Math.min(PAD_MAX * u, Math.max(24 * u, (LLENA * h - texto) / (3 * n - 1)))
  const sep = pad             // aire entre filas
  const filas = lineas.map((r) => ({ ...r, alto: Math.max(r.ls[0].length, r.ls[1].length) * f * 1.25 + 2 * pad }))
  return { f, pad, xs, filas, sep, alto: filas.reduce((s, x) => s + x.alto, 0) + sep * (filas.length - 1) }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, h, u)
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
            {r.foco && <rect x={0} y={y0} width={6 * u} height={r.alto} fill={ACC} />}
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
    <Vista id={ID} hibrido
           items={[
             { clave: 'horas', valor: fijo(A['G64.horas_por_lista'].valor) },
             { clave: 'riesgos', valor: fijo(DF.tablas.riesgos_criticos.n) },
           ]}
           cifras={[fijo(DF.tablas.riesgos_criticos.n)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
