// V02 · Qué ventas entran (datos, Matías S.). El extracto de ventas paso a paso (C20): de las filas que llegan a las que
// usa la lista. (18/11, fase 8) Quedó la versión a, el flujo; (19/11, fase 9, spec 4 V02) sin leyenda y por pasos.
//   Una banda de C20.crudo filas entra por la izquierda; en cada etapa se desprende hacia abajo lo que sale (repetidas,
//   sin cliente, compras devueltas) con su cantidad, y sigue lo que queda, hasta la banda en --acc, la base de la lista
//   (C20.positivas, la cifra de la conclusión). Las bandas van alineadas arriba y su alto es proporcional a las filas, con
//   el eje de filas junto a la banda de entrada: baja desde 0 en el borde de arriba, así el borde de abajo de cada banda
//   cae en su cantidad. Las salidas chicas (250 y 330 filas) se dibujan a escala, como un trazo fino con su número.
//   Cifras en pantalla: la entrada, lo que sale en cada etapa y lo que entra (las etapas intermedias se leen en el eje).
// Pasos, en el orden de las notas: 1 el extracto; 2 lo que sale sin ser venta de un cliente (repetidas y sin cliente);
// 3 las compras devueltas y lo que entra a la lista. La banda (C19) y la conclusión están desde el inicio. Los textos, en
// textos_vistas/V02.js.
// (19/11, fase 10, spec 4 V02) Boceto: antes de su paso, las bandas y las salidas que faltan son solo su forma (lo
//   resuelve Paso: tenues, sin acento y sin texto); 250, 22.394, 330 y 27.276 y los nombres de etapa aparecen en su paso.
//   El eje y su título van fuera de todo Paso. El <title> de cada forma (el globo al pasar el mouse) existe solo desde su
//   paso, para que ninguna cifra se adelante.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useU } from '../escala.js'
import { usePasos } from '../pasos.js'
import { ACC, CTX, FIN_GRIS, INK, SUP, EjeY, Paso, escalaLinda, margenEjeY, tam } from '../svg.jsx'

const ID = 'V02'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras
const F = T.flujo
const v = (k) => A[k].valor
const filas = (x) => fijo(x, 0)

/** Lo que queda después de cada etapa (extracto, sin repetidas, con cliente, con monto positivo) y lo que sale en cada
 *  una (repetidas, sin cliente, compras devueltas). */
const QUEDAN = [v('C20.crudo'), v('C20.unicas'), v('C20.con_cliente'), v('C20.positivas')]
const SALEN = [v('C20.repetidas'), v('C20.sin_cliente'), v('C20.no_positivas')]
const N0 = QUEDAN[0]
SALEN.forEach((s, i) => {
  if (QUEDAN[i] - s !== QUEDAN[i + 1]) {
    throw new Error(`V02: C20 no cierra en el paso ${i + 1} (${QUEDAN[i]} − ${s} ≠ ${QUEDAN[i + 1]})`)
  }
})

/** Paso en que se enciende cada etapa (la banda de lo que queda) y cada salida. */
const PASO_ETAPA = [1, 2, 2, 3]
const PASO_SALIDA = [2, 2, 3]

export const meta = { id: ID, pasos: 3 }

/** Relleno de lo que sale: rayado fino en gris sobre blanco (un patrón por SVG, con su id). */
const RAYA = 'v02-raya'
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

/** Una salida: sale de la banda en xs con grosor td (su borde de abajo en yb), dobla hacia abajo con radio interior r y
 *  baja hasta yE. */
function trazoSalida({ xs, yb, td, r, yE }) {
  const ro = r + td
  return `M${xs} ${yb - td} A${ro} ${ro} 0 0 1 ${xs + ro} ${yb + r} V${yE} H${xs + r} V${yb + r} ` +
    `A${r} ${r} 0 0 0 ${xs} ${yb} Z`
}

/** La forma de una salida a escala. Una salida chica es un trazo lleno de su grosor real, sin contorno; una grande va
 *  rayada con contorno de 1,5 u, metido hacia adentro para que el ancho de afuera siga siendo el real. */
function Salida({ u, s, r, yE }) {
  const sw = 1.5 * u
  if (s.td < 6 * u) return <path d={trazoSalida({ ...s, r, yE })} fill={FIN_GRIS} />
  return (
    <path d={trazoSalida({ xs: s.xs, yb: s.yb - sw / 2, td: s.td - sw, r: r + sw / 2, yE })} fill={`url(#${RAYA})`}
          stroke={FIN_GRIS} strokeWidth={sw} strokeLinejoin="round" />
  )
}

function Flujo({ w, h }) {
  const u = useU()
  const { paso, completa } = usePasos()
  const ya = (k) => completa || paso >= k
  const fEt = tam('cat', u)
  const fNum = tam(40, u)
  const fFin = tam(52, u)
  const fFinT = tam(28, u)
  const fSal = tam(30, u)
  const fSalT = tam('sec', u)
  const fEje = tam(23, u)
  const g = 3 * u
  const r = 40 * u

  // eje de filas a la izquierda de la banda de entrada
  const marcas = escalaLinda(N0, 6).marcas.filter((m) => m <= N0)
  const mEje = margenEjeY(u, { marcas, formato: filas })
  const xEje = mEje.izq
  const xa = xEje + 14 * u

  // en horizontal: cuatro etapas del mismo ancho; la última termina en punta de flecha
  const tramo = (w - xa) / 4
  const X = [xa, xa + tramo, xa + 2 * tramo, xa + 3 * tramo, w]

  // en vertical: rótulos de etapa, banda (el título del eje va debajo), caída de las salidas y sus rótulos. La banda no
  // pasa del alto con el que la salida más grande todavía entra en su etapa; si sobra alto, las salidas bajan más.
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
  const salidas = SALEN.map((n, i) => {
    const td = alto(n)
    const xs = X[i + 1] + g / 2
    return { n, td, xs, yb: yT + alto(QUEDAN[i]), xc: xs + r + td / 2 }
  })

  // la banda que entra a la lista, con punta de flecha
  const hF = alto(QUEDAN[3])
  const pF = Math.min(0.35 * hF, 56 * u)
  const xF0 = X[3] + g / 2
  const xFc = (xF0 + w - pF) / 2

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Raya u={u} />
      {/* eje que baja: 0 en el borde de arriba, donde empiezan todas las bandas, así el borde de abajo de cada banda cae
          en su cantidad de filas. El título va debajo del eje. */}
      <EjeY u={u} x={xEje} y0={yT} y1={yT + H} min={0} max={N0} marcas={marcas} formato={filas} />
      <text x={0} y={yT + H + fEje / 2 + 12 * u} fontSize={fEje} fontWeight={600} fill={CTX}
            dominantBaseline="hanging">{B.eje}</text>

      {/* salidas primero, con su cantidad debajo */}
      {salidas.map((s, i) => (
        <Paso key={`s${i}`} n={PASO_SALIDA[i]}>
          {ya(PASO_SALIDA[i]) && <title>{`${filas(s.n)} ${F.salidas[i]}`}</title>}
          <Salida u={u} s={s} r={r} yE={yE} />
          <text x={s.xc} y={yE + 10 * u} fontSize={fSal} fontWeight={700} fill={INK} textAnchor="middle"
                dominantBaseline="hanging">{filas(s.n)}</text>
          <text x={s.xc} y={yE + 10 * u + fSal * 1.15} fontSize={fSalT} fill={CTX} textAnchor="middle"
                dominantBaseline="hanging">{F.salidas[i]}</text>
        </Paso>
      ))}

      {/* etapas grises: lo que queda. Solo la entrada lleva su cantidad; las intermedias se leen en el eje */}
      {[0, 1, 2].map((i) => {
        const x0 = X[i] + (i ? g / 2 : 0)
        const x1 = X[i + 1] - g / 2
        const hh = alto(QUEDAN[i])
        return (
          <Paso key={`e${i}`} n={PASO_ETAPA[i]}>
            {ya(PASO_ETAPA[i]) && <title>{`${F.etapas[i]} · ${filas(QUEDAN[i])}`}</title>}
            <rect x={x0} y={yT} width={x1 - x0} height={hh} fill={FIN_GRIS} />
            {i === 0 && (
              <text x={(x0 + x1) / 2} y={yT + hh / 2} fontSize={fNum} fontWeight={700} fill={INK} textAnchor="middle"
                    dominantBaseline="central">{filas(QUEDAN[i])}</text>
            )}
            <text x={(x0 + x1) / 2} y={yT - 23.5 * u} fontSize={fEt} fill={CTX} textAnchor="middle">{F.etapas[i]}</text>
          </Paso>
        )
      })}

      {/* lo que entra a la lista */}
      <Paso n={PASO_ETAPA[3]}>
        {ya(PASO_ETAPA[3]) && <title>{`${F.etapas[3]} · ${filas(QUEDAN[3])} ${F.final}`}</title>}
        <path d={`M${xF0} ${yT} H${w - pF} L${w} ${yT + hF / 2} L${w - pF} ${yT + hF} H${xF0} Z`} fill={ACC} />
        <text x={xFc} y={yT + hF / 2 - fFinT * 0.55} fontSize={fFin} fontWeight={700} fill={SUP}
              textAnchor="middle" dominantBaseline="central">{filas(QUEDAN[3])}</text>
        <text x={xFc} y={yT + hF / 2 + fFin * 0.55} fontSize={fFinT} fontWeight={600} fill={SUP}
              textAnchor="middle" dominantBaseline="central">{F.final}</text>
        <text x={xFc} y={yT - 23.5 * u} fontSize={fEt} fontWeight={600} fill={INK}
              textAnchor="middle">{F.etapas[3]}</text>
      </Paso>
    </svg>
  )
}

export default function V02Ventas() {
  return (
    <Vista id={ID}
           items={[{ clave: 'sin_cliente', valor: pct(A.C19.valor / 100) }]}
           cifras={[filas(v('C20.crudo')), filas(v('C20.positivas'))]}>
      {({ w, h }) => <Flujo w={w} h={h} />}
    </Vista>
  )
}
