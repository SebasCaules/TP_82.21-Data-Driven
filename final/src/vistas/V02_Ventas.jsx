// V02 · Qué ventas entran (datos, Matías S.). El extracto de ventas paso a paso (C20): de las filas que llegan a las que
// usa la lista. (18/11, fase 8, spec 2 V02) El usuario pidió otra forma, visual, de mostrar la poda; hay dos versiones
// (variante('V02')):
//   a  Flujo: una banda de C20.crudo filas entra por la izquierda; en cada paso se desprende hacia abajo lo que sale
//      (repetidas, sin cliente, devoluciones) con su cantidad, y sigue lo que queda, hasta la banda en --acc que entra a
//      la lista (C20.positivas, la cifra de la conclusión). Las bandas van alineadas arriba y su alto es proporcional a
//      las filas, con el eje de filas junto a la banda de entrada: baja desde 0 en el borde de arriba, así el borde de
//      abajo de cada banda cae en su cantidad. Las salidas de 250 y 330 filas medirían menos de 2 u:
//      llevan un grosor mínimo, pasan por debajo de la banda que sigue (la banda conserva su alto real) y la leyenda lo
//      dice.
//   b  Cascada: columnas sobre un eje de filas; el extracto entero, cada salida flotando desde donde quedó la anterior y
//      lo que entra a la lista en --acc. Mismo grosor mínimo para las salidas chicas.
// La banda (C19 y los puntajes de datos y calidad) y la conclusión no cambian. Los textos, en textos_vistas/V02.js.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useU } from '../escala.js'
import { variante } from '../variantes.js'
import { ACC, CTX, EJE, FIN_GRIS, INK, SUP, TRAZO, Columna, EjeY, Leyenda, ancho, anchoLeyenda, escalaLinda,
  margenEjeY, punteado, tam } from '../svg.jsx'

const ID = 'V02'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras
const F = T.flujo
const C = T.cascada
const v = (k) => A[k].valor
const filas = (x) => fijo(x, 0)

/** Lo que queda después de cada paso (extracto, sin repetidas, con cliente, con monto positivo) y lo que sale en cada
 *  uno (repetidas, sin cliente, devoluciones). */
const QUEDAN = [v('C20.crudo'), v('C20.unicas'), v('C20.con_cliente'), v('C20.positivas')]
const SALEN = [v('C20.repetidas'), v('C20.sin_cliente'), v('C20.no_positivas')]
const N0 = QUEDAN[0]
SALEN.forEach((s, i) => {
  if (QUEDAN[i] - s !== QUEDAN[i + 1]) {
    throw new Error(`V02: C20 no cierra en el paso ${i + 1} (${QUEDAN[i]} − ${s} ≠ ${QUEDAN[i + 1]})`)
  }
})

/** Grosor mínimo de una salida, en u: 250 y 330 filas medirían menos de 2 u. */
const MINIMO = 10

export const meta = { id: ID }

// ---------------------------------------------------------------- muestras de la leyenda

/** Relleno de lo que sale: rayado fino en gris sobre blanco (un patrón por SVG, con su id). */
const RAYA = 'v02-raya'
const RELLENO_SALE = `url(#${RAYA})`
function Raya({ u }) {
  const p = 11 * u
  return (
    <defs>
      <pattern id={RAYA} width={p} height={p} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width={p} height={p} fill={SUP} />
        <line x1={0} y1={0} x2={0} y2={p} stroke={FIN_GRIS} strokeWidth={3 * u} />
      </pattern>
    </defs>
  )
}
const muestraSale = ({ u, x, y, s }) => (
  <rect x={x - s / 2 + 0.75 * u} y={y - s / 2 + 0.75 * u} width={s - 1.5 * u} height={s - 1.5 * u}
        rx={TRAZO.radio * u} fill={RELLENO_SALE} stroke={FIN_GRIS} strokeWidth={1.5 * u} />
)
const muestraMinimo = ({ u, x, y, s }) => (
  <rect x={x - s / 2 + 0.75 * u} y={y - (MINIMO * u) / 2} width={s - 1.5 * u} height={MINIMO * u}
        fill={RELLENO_SALE} stroke={FIN_GRIS} strokeWidth={1.5 * u} />
)
const muestraAlto = ({ u, x, y, s }) => (
  <path d={`M${x - s / 4} ${y - s / 2} H${x + s / 4} M${x} ${y - s / 2} V${y + s / 2} M${x - s / 4} ${y + s / 2} H${x + s / 4}`}
        fill="none" stroke={INK} strokeWidth={2.5 * u} strokeLinecap="round" />
)

/** Una leyenda en columna: un renglón por ítem, separados `paso`, desde el centro del primero en y. */
function LeyendaColumna({ u, x, y, paso, items }) {
  return items.map((it, i) => <Leyenda key={i} u={u} x={x} y={y + i * paso} items={[it]} />)
}

// ---------------------------------------------------------------- a · flujo

/** Una salida: sale de la banda en xs con grosor td (su borde de abajo en yb), dobla hacia abajo con radio interior r y
 *  baja hasta yE. */
function trazoSalida({ xs, yb, td, r, yE }) {
  const ro = r + td
  return `M${xs} ${yb - td} A${ro} ${ro} 0 0 1 ${xs + ro} ${yb + r} V${yE} H${xs + r} V${yb + r} ` +
    `A${r} ${r} 0 0 0 ${xs} ${yb} Z`
}

function Flujo({ w, h }) {
  const u = useU()
  const fEt = tam('cat', u)
  const fNum = tam(40, u)
  const fFin = tam(52, u)
  const fFinT = tam(28, u)
  const fSal = tam(30, u)
  const fSalT = tam('sec', u)
  const fLey = tam(24, u)
  const fEje = tam(23, u)
  const g = 3 * u
  const r = 40 * u
  const min = MINIMO * u

  // eje de filas a la izquierda de la banda de entrada
  const marcas = escalaLinda(N0, 6).marcas.filter((m) => m <= N0)
  const mEje = margenEjeY(u, { marcas, formato: filas })
  const xEje = mEje.izq
  const xa = xEje + 14 * u

  // en horizontal: tres etapas grises iguales y la última, más ancha, con lugar debajo para la última salida con su
  // rótulo y, a su derecha, la leyenda
  const leyenda = [
    { marca: 'contexto', texto: F.ley.quedan },
    { marca: muestraSale, texto: F.ley.salen },
    { marca: 'hecho', texto: F.ley.entran },
    { marca: muestraAlto, texto: F.ley.alto },
    { marca: muestraMinimo, texto: F.ley.minimo },
  ]
  const anchoLey = Math.max(...leyenda.map((it) => anchoLeyenda(u, [it], 24)))
  const medioRot = SALEN.map((n, i) => Math.max(ancho(filas(n), fSal, 700), ancho(F.salidas[i], fSalT, 400)) / 2)
  const L = w - xa
  const ultima = Math.max(0.3 * L, g / 2 + r + min / 2 + medioRot[2] + 48 * u + anchoLey)
  const tramo = (L - ultima) / 3
  const X = [xa, xa + tramo, xa + 2 * tramo, xa + 3 * tramo, w]

  // en vertical: rótulos de etapa, banda (el título del eje va debajo, en la caída), caída de las salidas y sus rótulos. La
  // banda no pasa del alto con el que la salida más grande todavía entra en su etapa; si sobra alto, las salidas bajan más.
  const arriba = 23.5 * u + fEt * 0.82
  const rotSal = 10 * u + fSal * 1.15 + fSalT * 1.1
  const caidaMin = r + 50 * u
  const hMaxSalida = ((tramo - r - 70 * u) * N0) / Math.max(...SALEN)
  const H = Math.max(120 * u, Math.min(0.92 * h - arriba - caidaMin - rotSal, hMaxSalida))
  const caida = Math.max(caidaMin, 0.92 * h - arriba - H - rotSal)
  const total = arriba + H + caida + rotSal
  const yT = Math.max(0, (h - total) / 2) + arriba
  const yE = yT + H + caida
  const alto = (n) => (n / N0) * H
  // salidas: grosor real o el mínimo; el rótulo (cantidad y qué sale) va centrado debajo de cada una
  const grosor = SALEN.map((n) => Math.max(alto(n), min))
  const salidas = SALEN.map((n, i) => {
    const xs = X[i + 1] + g / 2
    return { n, td: grosor[i], xs, yb: yT + alto(QUEDAN[i]), xc: xs + r + grosor[i] / 2 }
  })

  // la banda que entra a la lista, con punta de flecha
  const hF = alto(QUEDAN[3])
  const pF = Math.min(0.35 * hF, 56 * u)
  const xF0 = X[3] + g / 2
  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }

  // leyenda debajo de la banda final, a la derecha de la última salida, alineada abajo con los rótulos de las salidas
  const pasoLey = 38 * u
  const yLeyFin = yE + rotSal - fLey * 0.6
  const yLey0 = yLeyFin - (leyenda.length - 1) * pasoLey
  const xLey = Math.max(salidas[2].xc + medioRot[2] + 48 * u, w - anchoLey)

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Raya u={u} />
      {/* eje que baja: 0 en el borde de arriba, donde empiezan todas las bandas, así el borde de abajo de cada banda cae
          en su cantidad de filas. El título va debajo del eje, en la punta de los valores altos. */}
      <EjeY u={u} x={xEje} y0={yT} y1={yT + H} min={0} max={N0} marcas={marcas} formato={filas} />
      <text x={0} y={yT + H + fEje / 2 + 12 * u} fontSize={fEje} fontWeight={600} fill={CTX}
            dominantBaseline="hanging">{B.eje}</text>

      {/* salidas primero: pasan por debajo de la banda que sigue */}
      {salidas.map((s, i) => (
        <g key={`s${i}`}>
          <title>{`${filas(s.n)} ${F.salidas[i]}`}</title>
          <path d={trazoSalida({ ...s, r, yE })} fill={RELLENO_SALE} stroke={FIN_GRIS} strokeWidth={1.5 * u}
                strokeLinejoin="round" />
        </g>
      ))}

      {/* etapas grises: lo que queda */}
      {[0, 1, 2].map((i) => {
        const x0 = X[i] + (i ? g / 2 : 0)
        const x1 = X[i + 1] - g / 2
        const hh = alto(QUEDAN[i])
        return (
          <g key={`e${i}`}>
            <title>{`${F.etapas[i]} · ${filas(QUEDAN[i])}`}</title>
            <rect x={x0} y={yT} width={x1 - x0} height={hh} fill={FIN_GRIS} />
            <text x={(x0 + x1) / 2} y={yT + hh / 2} fontSize={fNum} fontWeight={700} fill={INK} textAnchor="middle"
                  dominantBaseline="central">{filas(QUEDAN[i])}</text>
            <text x={(x0 + x1) / 2} y={yT - 23.5 * u} fontSize={fEt} fill={CTX} textAnchor="middle">{F.etapas[i]}</text>
          </g>
        )
      })}

      {/* lo que entra a la lista */}
      <g>
        <title>{`${F.etapas[3]} · ${filas(QUEDAN[3])} ${F.final}`}</title>
        <path d={`M${xF0} ${yT} H${w - pF} L${w} ${yT + hF / 2} L${w - pF} ${yT + hF} H${xF0} Z`} fill={ACC}
              strokeLinejoin="round" />
        <text x={(xF0 + w - pF) / 2} y={yT + hF / 2 - fFinT * 0.55} fontSize={fFin} fontWeight={700} fill={SUP}
              textAnchor="middle" dominantBaseline="central">{filas(QUEDAN[3])}</text>
        <text x={(xF0 + w - pF) / 2} y={yT + hF / 2 + fFin * 0.55} fontSize={fFinT} fontWeight={600} fill={SUP}
              textAnchor="middle" dominantBaseline="central">{F.final}</text>
        <text x={(xF0 + w - pF) / 2} y={yT - 23.5 * u} fontSize={fEt} fontWeight={600} fill={INK}
              textAnchor="middle">{F.etapas[3]}</text>
      </g>

      {/* cuánto sale en cada paso */}
      {salidas.map((s, i) => (
        <g key={`r${i}`}>
          <text x={s.xc} y={yE + 10 * u} fontSize={fSal} fontWeight={700} fill={INK} textAnchor="middle"
                dominantBaseline="hanging" {...halo}>{filas(s.n)}</text>
          <text x={s.xc} y={yE + 10 * u + fSal * 1.15} fontSize={fSalT} fill={CTX} textAnchor="middle"
                dominantBaseline="hanging" {...halo}>{F.salidas[i]}</text>
        </g>
      ))}

      <LeyendaColumna u={u} x={xLey} y={yLey0} paso={pasoLey} items={leyenda} />
    </svg>
  )
}

// ---------------------------------------------------------------- b · cascada

function Cascada({ w, h }) {
  const u = useU()
  const fCat = tam('cat', u)
  const fVal = tam('val', u)
  const fFoco = tam('valFoco', u)
  const min = MINIMO * u

  const { marcas, tope } = escalaLinda(N0, 6)
  const mEje = margenEjeY(u, { marcas, formato: filas, titulo: B.eje })
  const xEje = mEje.izq
  const bajo = 14 * u + fCat * 1.1
  const bloque = 0.92 * h
  const yArr = (h - bloque) / 2 + mEje.arriba
  const yBase = (h + bloque) / 2 - bajo
  const y = (n) => yBase - (n / tope) * (yBase - yArr)

  const n = 5
  const x0 = xEje + 16 * u
  const slot = (w - x0) / n
  const colW = Math.min(170 * u, 0.56 * slot)
  const xCol = (i) => x0 + i * slot + (slot - colW) / 2

  // columnas: el extracto entero, las tres salidas flotando y lo que entra
  const cols = [
    { tipo: 'total', arr: QUEDAN[0], aba: 0, n: QUEDAN[0] },
    ...SALEN.map((s, i) => ({ tipo: 'sale', arr: QUEDAN[i], aba: QUEDAN[i + 1], n: s })),
    { tipo: 'entra', arr: QUEDAN[3], aba: 0, n: QUEDAN[3] },
  ].map((c, i) => {
    const yA = y(c.arr)
    const yB = y(c.aba)
    const hh = yB - yA
    // salida chica: grosor mínimo centrado en su tramo real
    const extra = c.tipo === 'sale' && hh < min ? (min - hh) / 2 : 0
    return { ...c, i, x: xCol(i), yA: yA - extra, yB: yB + extra }
  })

  const ley = [
    { marca: 'contexto', texto: C.ley.total },
    { marca: muestraSale, texto: C.ley.salen },
    { marca: 'hecho', texto: C.ley.entran },
    { marca: muestraMinimo, texto: C.ley.minimo },
  ]
  const yTitulo = yArr - (23 * u) / 2 - 12 * u
  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Raya u={u} />
      <EjeY u={u} x={xEje} y0={yBase} y1={yArr} min={0} max={tope} marcas={marcas} formato={filas} titulo={B.eje}
            grilla xGrilla={w} />
      <Leyenda u={u} x={w} y={yTitulo - 23 * u * 0.32} items={ley} anchor="end" />

      {/* conectores: el nivel que queda después de cada columna */}
      {[0, 1, 2, 3].map((i) => (
        <line key={`c${i}`} x1={cols[i].x + colW} x2={cols[i + 1].x} y1={y(QUEDAN[i])} y2={y(QUEDAN[i])}
              stroke={EJE} strokeWidth={TRAZO.guia * u} strokeDasharray={punteado(u)} />
      ))}

      {cols.map((c) => {
        const cx = c.x + colW / 2
        const foco = c.tipo === 'entra'
        return (
          <g key={c.i}>
            <title>{`${C.columnas[c.i]} · ${filas(c.n)}`}</title>
            {c.tipo === 'sale'
              ? <rect x={c.x + 0.75 * u} y={c.yA} width={colW - 1.5 * u} height={c.yB - c.yA} fill={RELLENO_SALE}
                      stroke={FIN_GRIS} strokeWidth={1.5 * u} />
              : <Columna u={u} x={c.x} yBase={yBase} w={colW} h={yBase - c.yA} foco={foco} />}
            <text x={cx} y={c.yA - 12 * u} fontSize={foco ? fFoco : fVal} fontWeight={foco ? 700 : 600} fill={INK}
                  textAnchor="middle" {...halo}>{filas(c.n)}</text>
            <text x={cx} y={yBase + 14 * u} fontSize={fCat} fontWeight={foco ? 600 : 400} fill={foco ? INK : CTX}
                  textAnchor="middle" dominantBaseline="hanging">{C.columnas[c.i]}</text>
          </g>
        )
      })}
      <line x1={xEje} x2={w} y1={yBase} y2={yBase} stroke={EJE} strokeWidth={TRAZO.base * u} />
    </svg>
  )
}

export default function V02Ventas() {
  const Dibujo = variante(ID) === 'b' ? Cascada : Flujo
  return (
    <Vista id={ID}
           items={[
             { clave: 'sin_cliente', valor: pct(A.C19.valor / 100) },
             { clave: 'datos', valor: `${fijo(DF.tablas.condiciones.find((x) => x.id === 'datos').puntaje)}[[/${fijo(DF.tablas.escala_tecnica.hasta)}]]` },
             { clave: 'calidad', valor: `${fijo(DF.tablas.condiciones.find((x) => x.id === 'calidad').puntaje)}[[/${fijo(DF.tablas.escala_tecnica.hasta)}]]` },
           ]}
           cifras={[filas(v('C20.crudo')), filas(v('C20.positivas'))]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
