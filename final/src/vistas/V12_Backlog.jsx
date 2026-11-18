// V12 · El backlog (gestión, Sebastian C.). Las épicas del backlog (tabla backlog de DF, leída por build_final.py de
// EPICAS e HISTORIAS de la Parte A del E4), una por fila, con un cuadrado por historia de usuario según su estado:
// hecha (resuelta, en --sem-meta), del piloto (en --acc, lo que se pide) y solo si el piloto pasa (contorno gris). La
// leyenda cuenta las historias de la misma tabla que dibuja: la tarjeta y el gráfico dicen lo mismo.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, CTX, HECHO, INK, RELLENO, Renglones, ancho, envolver, letra } from '../svg.jsx'

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

export const meta = { id: ID }

function Cuadro({ x, y, s, grupo }) {
  if (grupo === 'despues') {
    return <rect x={x + 0.75} y={y + 0.75} width={s - 1.5} height={s - 1.5} fill="none" stroke={RELLENO} strokeWidth={1.5} />
  }
  return <rect x={x} y={y} width={s} height={s} fill={grupo === 'hecha' ? HECHO : ACC} />
}

function medir(w, f, k) {
  const s = f * 1.15
  const gapC = s * 0.35
  const maxHU = Math.max(...BL.epicas.map((e) => BL.historias.filter((h) => h.epica === e.n).length))
  const anchoC = maxHU * s + (maxHU - 1) * gapC
  const col = w - anchoC - 20 * k
  const gap = 0.45 * f
  const filas = BL.epicas.map((e) => {
    const lt = envolver(e.nombre, col, f, 500)
    return { ...e, lt, hus: BL.historias.filter((h) => h.epica === e.n), alto: Math.max(lt.length * f * 1.25, s) }
  })
  const yLey = 0
  const yFilas = f * 2.2
  return { s, gapC, col, gap, filas, yLey, yFilas, xC: w - anchoC, alto: yFilas + filas.reduce((a, x) => a + x.alto + gap, 0) - gap }
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 18 * k)
  const m = medir(w, f, k)
  // la leyenda, a la derecha, en una fila
  const items = GRUPOS.map((g) => ({ g, t: `${X.estados[g]} · ${fijo(CUANTAS[g])}` }))
  const anchosLey = items.map((x) => m.s + 6 * k + ancho(x.t, f, 600))
  let xl = w - anchosLey.reduce((a, b) => a + b, 0) - 18 * k * (items.length - 1)
  let y = m.yFilas
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${items.map((x) => x.t).join(', ')}`}>
      {items.map((x, i) => {
        const x0 = xl
        xl += anchosLey[i] + 18 * k
        return (
          <g key={x.g}>
            <Cuadro x={x0} y={m.yLey} s={m.s} grupo={x.g} />
            <text x={x0 + m.s + 6 * k} y={m.yLey + m.s / 2} fontSize={f} fontWeight={600} dominantBaseline="central"
                  fill={x.g === 'hecha' ? HECHO : x.g === 'piloto' ? ACC : CTX}>{x.t}</text>
          </g>
        )
      })}
      {m.filas.map((e) => {
        const y0 = y
        y += e.alto + m.gap
        const yc = y0 + e.alto / 2
        return (
          <g key={e.n}>
            <title>{`${e.nombre}: ${e.hus.map((u) => `${u.id}, ${X.estados[u.grupo]}`).join('; ')}`}</title>
            <Renglones lineas={e.lt} x={0} y={y0 + (e.alto - e.lt.length * f * 1.25) / 2} f={f} peso={500} color={INK} />
            {e.hus.map((u, j) => (
              <Cuadro key={u.id} x={m.xC + j * (m.s + m.gapC)} y={yc - m.s / 2} s={m.s} grupo={u.grupo} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export default function V12Backlog() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'historias', valor: fijo(A.K02.valor) },
             { clave: 'hechas', valor: fijo(A.K04.valor) },
             { clave: 'horas', valor: fijo(A.K07.valor) },
           ]}
           cifras={[fijo(A.K05.valor), fijo(A.K06.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
