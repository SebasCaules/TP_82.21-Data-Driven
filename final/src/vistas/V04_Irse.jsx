// V04 · Qué es irse (modelo, Francisco C.). La banda trae el umbral mínimo del cliente (C03.minimo_dias); el factor de su
// ritmo (C03.factor) lo dice el orador y queda en el texto largo de la decisión. El gráfico: la parte de los casos de
// validación que cruza su umbral en los F04.horizonte días siguientes, por tramo de días que le faltan (tabla
// tramos_de_cruce de DF). Sin el tramo de 90 días o más, que no tiene positivos por definición.
// (18/11, fase 8) Escalera hacia el umbral: eje X de días que faltan, de F04.horizonte (izquierda) a 0 (derecha), con el
// umbral como línea vertical a la derecha; un escalón por tramo, de alto la parte que cruza (eje Y de 0 a 100 %).
// (19/11, fase 9, ficha V04: «trata de declutearla») Quedan los tres escalones con su porcentaje, los dos ejes y la línea
// del umbral. Salieron los conteos por tramo, la nota de qué es un caso, el rótulo del tramo dentro de cada escalón (lo
// dice el eje), la flecha «más cerca del umbral» (la dice la conclusión) y la grilla. Los tres porcentajes con el mismo
// tamaño y peso; solo el escalón más cercano va en el acento.
// Pasos (spec 2): un escalón por paso, de lejos a cerca. Los ejes y el umbral están desde el paso 1.
// Ninguna cifra nueva: las tasas son las de la tabla (las mismas que F04.menos30, F04.30a59 y F04.60a89).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import {
  CTX, INK, SUP, TRAZO, Columna, EjeX, EjeY, Paso, Umbral, altoEjeX, ancho, margenEjeY, tam, useU,
} from '../svg.jsx'
import { useEstadoPaso } from '../pasos.js'

const ID = 'V04'
const A = DF.anclas
const T = textosDe(ID)
const HORIZONTE = A['F04.horizonte'].valor
const MARCAS_Y = [0, 0.2, 0.4, 0.6, 0.8, 1]
const fmtY = (v) => pct(v, 0)

/** Límites en días de un tramo, para dibujar: «menos de 30» → [0, 30]; «30 a 59» → [30, 60]. */
function limites(tramo) {
  const n = (String(tramo).match(/\d+/g) ?? []).map(Number)
  if (n.length === 1) return [0, n[0]]
  if (n.length === 2) return [n[0], n[1] + 1]
  throw new Error(`V04: no se leen los días del tramo «${tramo}»`)
}

/** Los tramos donde se puede cruzar (a F04.horizonte días o más el cruce es cero por definición), de cerca a lejos. */
const TR = DF.tablas.tramos_de_cruce
  .filter((t) => t.positivos > 0)
  .map((t) => ({ ...t, lim: limites(t.tramo) }))
  .sort((p, q) => p.lim[0] - q.lim[0])

export const meta = { id: ID, pasos: TR.length }

/** «91,7 %» en dos piezas: el número y la unidad (con su espacio duro), las dos de pct() de formato.js. */
const partes = (t) => {
  const i = t.lastIndexOf(NBSP)
  return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i)]
}

/** Un escalón: la columna y su porcentaje arriba, encendidos en el paso `n`. El foco va en el acento solo encendido:
 *  atenuado, se ve como los otros escalones que todavía no se dijeron. */
function Escalon({ u, n, x, w, yBase, alto, foco, texto, f, fu, halo }) {
  const encendido = useEstadoPaso(n) === 'on'
  const [num, uni] = partes(texto)
  return (
    <Paso n={n}>
      <Columna u={u} x={x} yBase={yBase} w={w} h={alto} foco={foco && encendido} />
      <text x={x + w / 2} y={yBase - alto - 14 * u} fontSize={f} fontWeight={700} fill={INK} textAnchor="middle" {...halo}>
        {num}<tspan fontSize={fu}>{uni}</tspan>
      </text>
    </Paso>
  )
}

function Escalera({ w, h }) {
  const u = useU()
  const X = T.escalera
  const m = margenEjeY(u, { marcas: MARCAS_Y, formato: fmtY, titulo: X.ejeY })
  const fVal = tam(36, u)
  const fUni = tam(24, u)
  const fUm = tam(26, u)
  const fUm2 = tam(24, u)
  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }

  // derecha: el rótulo del umbral; abajo: los números del eje X y su título
  const anchoUm = Math.max(ancho(X.umbral, fUm, 700), ancho(X.umbral2, fUm2, 400))
  const pad = 0.05 * h
  const xL = m.izq
  const xR = w - anchoUm - 18 * u
  const yTop = pad
  const y1 = yTop + m.arriba
  const yBase = h - pad - altoEjeX(u)
  const altoP = yBase - y1
  const xD = (d) => xR - (d / HORIZONTE) * (xR - xL)
  const marcasX = [...new Set(TR.flatMap((t) => t.lim))].sort((p, q) => p - q)
  const sep = TRAZO.separacion * u
  const ultimo = TR.length - 1

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeY u={u} x={xL} y0={yBase} y1={y1} min={0} max={1} marcas={MARCAS_Y} formato={fmtY} titulo={X.ejeY} />
      {TR.map((t, i) => {
        const xa = xD(t.lim[1]) + (i === ultimo ? 0 : sep / 2)
        const xb = xD(t.lim[0]) - sep / 2
        // de lejos a cerca: el tramo más lejano en el paso 1, el más cercano (el foco) en el último
        return (
          <Escalon key={t.tramo} u={u} n={TR.length - i} x={xa} w={xb - xa} yBase={yBase} alto={t.tasa * altoP}
                   foco={i === 0} texto={pct(t.tasa, 1)} f={fVal} fu={fUni} halo={halo} />
        )
      })}
      <EjeX u={u} x0={xR} x1={xL} y={yBase} min={0} max={HORIZONTE} marcas={marcasX} formato={(v) => fijo(v)}
            titulo={X.ejeX} />
      {/* el umbral: día 0, a la derecha */}
      <Umbral u={u} x1={xR} x2={xR} y1={yTop} y2={yBase} />
      <text x={xR + 14 * u} y={yTop} fontSize={fUm} fontWeight={700} fill={INK} dominantBaseline="hanging">{X.umbral}</text>
      <text x={xR + 14 * u} y={yTop + fUm * 1.2} fontSize={fUm2} fill={CTX} dominantBaseline="hanging">{X.umbral2}</text>
    </svg>
  )
}

export default function V04Irse() {
  return (
    <Vista id={ID} items={[{ clave: 'minimo', valor: fijo(A['C03.minimo_dias'].valor) }]} cifras={[]}>
      {Escalera}
    </Vista>
  )
}
