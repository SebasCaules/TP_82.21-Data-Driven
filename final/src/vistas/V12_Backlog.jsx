// V12 · El backlog (gestión, Sebastian C.). Las épicas del backlog (tabla backlog de DF, leída por build_final.py de
// EPICAS e HISTORIAS de la Parte A del E4), una por fila, con un cuadro por historia de usuario pegado a la izquierda
// del nombre (spec de dataviz f.8, 18/11). El estado usa ESTADO de svg.jsx, el mismo de V13: hecha en acento (el título
// habla de las hechas), en el piloto en gris y si el piloto pasa en contorno punteado. La leyenda, encima de los cuadros,
// cuenta las historias de la misma tabla que dibuja; los throws contra K02, K04, K05 y K06 se conservan. Banda sola.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { Cuadro, INK, ancho, envolver, tam, useU } from '../svg.jsx'

const ID = 'V12'
const A = DF.anclas
const BL = DF.tablas.backlog
const X = textosDe(ID)
const GRUPOS = ['hecha', 'piloto', 'despues']
const CUANTAS = Object.fromEntries(GRUPOS.map((g) => [g, BL.historias.filter((h) => h.grupo === g).length]))
const ANCLA = { hecha: 'K04', piloto: 'K05', despues: 'K06' }
for (const g of GRUPOS) {
  if (CUANTAS[g] !== A[ANCLA[g]].valor) throw new Error(`V12: la tabla del backlog y ${ANCLA[g]} no cuentan lo mismo`)
}
if (BL.historias.length !== A.K02.valor) throw new Error('V12: la tabla del backlog y K02 no cuentan lo mismo')

// grupo de la tabla → estado de svg.jsx (spec b.6)
const ESTADO_DE = { hecha: 'hecha', piloto: 'piloto', despues: 'condicional' }

export const meta = { id: ID }

function medir(w, u) {
  const s = 40 * u                 // cuadro
  const gapC = 10 * u
  const lugares = Math.max(...BL.epicas.map((e) => BL.historias.filter((h) => h.epica === e.n).length))
  const xNombre = lugares * s + (lugares - 1) * gapC + 24 * u
  const f = tam('fila', u)
  const fila = 56 * u
  const fL = tam('sec', u)
  const sL = 20 * u                // cuadro de la leyenda
  const altoLey = Math.max(sL, fL * 1.25)
  const yFilas = altoLey + 24 * u
  const filas = BL.epicas.map((e) => ({
    ...e,
    lt: envolver(e.nombre, w - xNombre, f, 400),
    hus: BL.historias.filter((h) => h.epica === e.n),
  }))
  return { s, gapC, xNombre, f, fila, fL, sL, altoLey, yFilas, filas, alto: yFilas + filas.length * fila }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  // la leyenda, en una fila encima de los cuadros, alineada a su borde izquierdo
  const items = GRUPOS.map((g) => ({ g, t: `${X.estados[g]} · ${fijo(CUANTAS[g])}` }))
  let xl = 0
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {items.map((x) => {
          const x0 = xl
          xl += m.sL + 8 * u + ancho(x.t, m.fL, 600) + 32 * u
          return (
            <g key={x.g}>
              <Cuadro u={u} x={x0} y={(m.altoLey - m.sL) / 2} s={m.sL} estado={ESTADO_DE[x.g]} />
              <text x={x0 + m.sL + 8 * u} y={m.altoLey / 2} fontSize={m.fL} fontWeight={600} fill={INK}
                    dominantBaseline="central">{x.t}</text>
            </g>
          )
        })}
        {m.filas.map((e, i) => {
          const yc = m.yFilas + i * m.fila + m.fila / 2
          return (
            <g key={e.n}>
              <title>{`${e.nombre}: ${e.hus.map((x) => `${x.id}, ${X.estados[x.grupo]}`).join('; ')}`}</title>
              {e.hus.map((x, j) => (
                <Cuadro key={x.id} u={u} x={j * (m.s + m.gapC)} y={yc - m.s / 2} s={m.s} estado={ESTADO_DE[x.grupo]} />
              ))}
              {e.lt.map((l, j) => (
                <text key={j} x={m.xNombre} y={yc + (j - (e.lt.length - 1) / 2) * m.f * 1.25} fontSize={m.f}
                      fontWeight={400} fill={INK} dominantBaseline="central">{l}</text>
              ))}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function V12Backlog() {
  return (
    <Vista id={ID} hibrido items={[{ clave: 'historias', valor: fijo(A.K02.valor) }]}
           cifras={[fijo(A.K05.valor), fijo(A.K06.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
