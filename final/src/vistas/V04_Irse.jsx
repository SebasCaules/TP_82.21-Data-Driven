// V04 · Qué es irse (modelo, Francisco C.). Las dos tarjetas son los dos parámetros del umbral del cliente (C03: el mayor
// entre un mínimo de días y un múltiplo de su ritmo). El gráfico: la parte de los casos de validación que cruza su umbral
// en los F04.horizonte días siguientes, por tramo de días que le faltan (tabla tramos_de_cruce de DF). Sin el tramo de
// 90 días o más, que no tiene positivos por definición. Un caso es un cliente en un mes de corte de validación.
// (18/11, fase 8, spec 2 V04) Dos versiones, por variante('V04'):
//   a  Escalera hacia el umbral: eje X de días que faltan, de F04.horizonte (izquierda) a 0 (derecha), con el umbral como
//      línea vertical a la derecha; un escalón por tramo, de alto la parte que cruza (eje Y de 0 a 100 %), el valor
//      arriba y abajo, dentro, los positivos sobre las filas del tramo. Foco (ACC) en el tramo de menos de 30 días.
//   b  De cada cien: una cuadrícula de 10 × 10 por tramo, de lejos a cerca, con los que cruzan llenos en ACC (el ancla
//      redondeada al entero) desde abajo, como un nivel que sube; leyenda arriba.
// Las dos con la flecha «más cerca del umbral». Ninguna cifra nueva: tasas (F04) y filas y positivos de la tabla.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import {
  ACC, CTX, INK, PISTA, SUP, TRAZO,
  Columna, EjeX, EjeY, Leyenda, Umbral, ancho, anchoLeyenda, margenEjeY, tam, useU,
} from '../svg.jsx'

const ID = 'V04'
const A = DF.anclas
const T = textosDe(ID)
const DIAS = T.barras.dias
const HORIZONTE = A['F04.horizonte'].valor

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

export const meta = { id: ID }

const halo = (u) => ({ stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' })

/** Flecha fina hacia la derecha: línea de 3 u en tinta de x1 a x2 en y, con punta llena. */
function FlechaFina({ u, x1, x2, y }) {
  const p = 16 * u
  return (
    <g>
      <line x1={x1} x2={x2 - p + 2 * u} y1={y} y2={y} stroke={INK} strokeWidth={3 * u} />
      <path d={`M${x2 - p} ${y - 9 * u} L${x2} ${y} L${x2 - p} ${y + 9 * u} Z`} fill={INK} />
    </g>
  )
}

// ---------------------------------------------------------------- a · escalera hacia el umbral

function Escalera({ w, h }) {
  const u = useU()
  const X = T.escalera
  const marcasY = [0, 0.2, 0.4, 0.6, 0.8, 1]
  const fmtY = (v) => pct(v, 0)
  const m = margenEjeY(u, { marcas: marcasY, formato: fmtY, titulo: X.ejeY })
  const fEje = 23 * u
  const fUm = tam(26, u)
  const fUm2 = tam(24, u)
  const fFl = tam(24, u)
  const fTr = tam('cat', u)
  // la cuenta va debajo del porcentaje en jerarquía: más chica y sin negrita plena
  const fN = tam(24, u)
  const fC = tam(22, u)

  // derecha: el rótulo del umbral; abajo: números del eje y el renglón del título con la flecha
  const anchoUm = Math.max(ancho(X.umbral, fUm, 700), ancho(X.umbral2, fUm2, 400))
  const pad = 0.045 * h
  const xL = m.izq
  const xR = w - anchoUm - 18 * u
  const yNum = (8 + 6) * u
  const altoAbajo = yNum + fEje * 1.2 + 16 * u + fFl * 1.2
  const yTitY = pad
  const y1 = yTitY + m.arriba
  const yBase = h - pad - altoAbajo
  const altoP = yBase - y1
  const xD = (d) => xR - (d / HORIZONTE) * (xR - xL)
  const marcasX = [...new Set(TR.flatMap((t) => t.lim))].sort((p, q) => p - q)
  const sep = TRAZO.separacion * u

  // renglón del título del eje X y la flecha
  const yFila = yBase + yNum + fEje * 1.2 + 16 * u + fFl * 0.6
  const anchoTit = ancho(X.ejeX, fEje, 600)
  const anchoFl = ancho(X.flecha, fFl, 600)
  const xFl1 = xL + anchoTit + 56 * u + anchoFl + 14 * u
  const yUm0 = yTitY
  // el título del eje Y empieza donde EjeY lo pone: a la izquierda del número más ancho
  const xTitY = xL - (8 + 6) * u - Math.max(...marcasY.map((v) => ancho(fmtY(v), fEje, 400)))

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeY u={u} x={xL} y0={yBase} y1={y1} min={0} max={1} marcas={marcasY} formato={fmtY} titulo={X.ejeY}
            grilla xGrilla={xR} />
      {/* qué es un caso, en el renglón del título del eje Y */}
      <text x={xTitY + ancho(X.ejeY, fEje, 600) + 28 * u} y={y1 - fEje / 2 - 12 * u} fontSize={fC} fill={CTX}>{X.caso}</text>
      {TR.map((t, i) => {
        const foco = i === 0
        const xa = xD(t.lim[1])
        const xb = xD(t.lim[0])
        const ancho_ = xb - xa
        const cx = (xa + xb) / 2
        const alto = t.tasa * altoP
        const yc = yBase - alto
        const tinta = foco ? SUP : INK
        const fVal = tam(foco ? 'valFoco' : 'val', u)
        const yCuenta = yBase - 16 * u - fC * 1.25 - fN
        return (
          <g key={t.tramo}>
            <Columna u={u} x={xa + (i === TR.length - 1 ? 0 : sep / 2)} yBase={yBase}
                     w={ancho_ - sep / 2 - (i === TR.length - 1 ? 0 : sep / 2)} h={alto} foco={foco} />
            <text x={cx} y={yc - 12 * u} fontSize={fVal} fontWeight={foco ? 700 : 600} fill={INK} textAnchor="middle"
                  {...halo(u)}>{pct(t.tasa, 1)}</text>
            <text x={cx} y={yc + 16 * u} fontSize={fTr} fontWeight={foco ? 700 : 600} fill={tinta} textAnchor="middle"
                  dominantBaseline="hanging">{`${t.tramo} ${DIAS}`}</text>
            <text x={cx} y={yCuenta} fontSize={fN} fontWeight={600} fill={tinta} textAnchor="middle"
                  dominantBaseline="hanging">{`${fijo(t.positivos)} ${X.de} ${fijo(t.filas)}`}</text>
            <text x={cx} y={yCuenta + fN * 1.15} fontSize={fC} fill={tinta} textAnchor="middle"
                  dominantBaseline="hanging">{X.casos}</text>
          </g>
        )
      })}
      <EjeX u={u} x0={xR} x1={xL} y={yBase} min={0} max={HORIZONTE} marcas={marcasX} formato={(v) => fijo(v)} />
      {/* el umbral: día 0, a la derecha */}
      <Umbral u={u} x1={xR} x2={xR} y1={yUm0} y2={yBase} />
      <text x={xR + 14 * u} y={yUm0} fontSize={fUm} fontWeight={700} fill={INK} dominantBaseline="hanging">{X.umbral}</text>
      <text x={xR + 14 * u} y={yUm0 + fUm * 1.2} fontSize={fUm2} fill={CTX} dominantBaseline="hanging">{X.umbral2}</text>
      {/* título del eje X y la flecha hacia el umbral */}
      <text x={xL} y={yFila} fontSize={fEje} fontWeight={600} fill={CTX} dominantBaseline="central">{X.ejeX}</text>
      <text x={xFl1 - 14 * u} y={yFila} fontSize={fFl} fontWeight={600} fill={INK} textAnchor="end"
            dominantBaseline="central">{X.flecha}</text>
      <FlechaFina u={u} x1={xFl1} x2={xR - 6 * u} y={yFila} />
    </svg>
  )
}

// ---------------------------------------------------------------- b · de cada cien

function Cuadricula({ u, x, y, s, llenos }) {
  const gap = Math.max(3 * u, s * 0.012)
  const c = (s - 9 * gap) / 10
  const r = Math.min(3 * u, c / 4)
  const celdas = []
  for (let k = 0; k < 100; k++) {
    const fila = Math.floor(k / 10)
    const col = k % 10
    celdas.push(
      <rect key={k} x={x + col * (c + gap)} y={y + (9 - fila) * (c + gap)} width={c} height={c} rx={r}
            fill={k < llenos ? ACC : PISTA} />,
    )
  }
  return <g>{celdas}</g>
}

function Cuadros({ w, h }) {
  const u = useU()
  const Y = T.cuadros
  const orden = [...TR].reverse() // de lejos (izquierda) a cerca (derecha)
  const fLey = tam(24, u)
  const fTr = tam('cat', u)
  const fPct = tam(40, u)
  const fC = tam(24, u)
  const fFl = tam(24, u)
  const pad = 0.04 * h

  const yLey = pad + fLey / 2
  const yTr = yLey + fLey / 2 + 30 * u
  const yGrid = yTr + fTr * 1.2 + 14 * u
  const altoBajo = 18 * u + fPct * 1.05 + 8 * u + fC * 1.2 + 30 * u + fFl * 1.2
  const sAlto = h - pad - altoBajo - yGrid
  const gapMin = 110 * u
  const sAncho = (w - 2 * gapMin) / 3
  const s = Math.max(60 * u, Math.min(sAlto, sAncho))
  const gapG = (w - 3 * s) / 4
  const xG = (i) => gapG + i * (s + gapG)
  const yPct = yGrid + s + 18 * u
  const yC = yPct + fPct * 1.05 + 8 * u
  const yFl = yC + fC * 1.2 + 30 * u + fFl * 0.6
  // si el ancho limita las cuadrículas (ventanas 4:3), el bloque se centra en el alto
  const dy = Math.max(0, (h - pad - (yFl + fFl * 0.6)) / 2)

  const celda = (fill) => function MuestraCelda({ x, y, s: lado }) {
    return <rect x={x - lado / 2} y={y - lado / 2} width={lado} height={lado} rx={3 * u} fill={fill} />
  }
  const items = [{ marca: celda(ACC), texto: Y.cruza }, { marca: celda(PISTA), texto: Y.noCruza }]
  // la leyenda y qué es un cuadro, en un renglón centrado sobre todo el ancho
  const anchoL = anchoLeyenda(u, items)
  const anchoRenglon = anchoL + 48 * u + ancho(Y.unidad, fLey, 400) + 36 * u + ancho(Y.caso, fLey, 400)
  const xLey = Math.max(0, (w - anchoRenglon) / 2)
  const xUni = xLey + anchoL + 48 * u
  const xCaso = xUni + ancho(Y.unidad, fLey, 400) + 36 * u

  const anchoFl = ancho(Y.flecha, fFl, 600)
  const xFlTxt = xG(0)
  const xFl1 = xFlTxt + anchoFl + 16 * u
  const xFl2 = xG(2) + s

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0 ${dy})`}>
      <Leyenda u={u} x={xLey} y={yLey} items={items} />
      <text x={xUni} y={yLey} fontSize={fLey} fill={INK} dominantBaseline="central">{Y.unidad}</text>
      <text x={xCaso} y={yLey} fontSize={fLey} fill={CTX} dominantBaseline="central">{Y.caso}</text>
      {orden.map((t, i) => {
        const foco = i === orden.length - 1
        const cx = xG(i) + s / 2
        return (
          <g key={t.tramo}>
            <text x={cx} y={yTr} fontSize={fTr} fontWeight={foco ? 700 : 600} fill={foco ? INK : CTX} textAnchor="middle"
                  dominantBaseline="hanging">{`${t.tramo} ${DIAS}`}</text>
            <Cuadricula u={u} x={xG(i)} y={yGrid} s={s} llenos={Math.round(t.tasa * 100)} />
            <text x={cx} y={yPct} fontSize={fPct} fontWeight={700} fill={INK} textAnchor="middle"
                  dominantBaseline="hanging">{pct(t.tasa, 1)}</text>
            <text x={cx} y={yC} fontSize={fC} fill={CTX} textAnchor="middle" dominantBaseline="hanging">
              {`${fijo(t.positivos)} ${Y.de} ${fijo(t.filas)} ${Y.casos}`}
            </text>
          </g>
        )
      })}
      <text x={xFlTxt} y={yFl} fontSize={fFl} fontWeight={600} fill={INK} dominantBaseline="central">{Y.flecha}</text>
      <FlechaFina u={u} x1={xFl1} x2={xFl2} y={yFl} />
      </g>
    </svg>
  )
}

export default function V04Irse() {
  const v = variante(ID)
  return (
    <Vista id={ID}
           items={[
             { clave: 'minimo', valor: fijo(A['C03.minimo_dias'].valor) },
             { clave: 'factor', valor: fijo(A['C03.factor'].valor, 1) },
           ]}
           cifras={[]}>
      {v === 'b' ? Cuadros : Escalera}
    </Vista>
  )
}
