// V03 · Qué meses entran (datos, Matías S.). Las operaciones de cada mes de 2025 sobre las del mismo mes de 2024 (D28,
// tabla ventas_2025 de DF, contada por build_final.py desde el extracto crudo) como 12 columnas de enero a diciembre.
// (18/11, fase 8, ficha V03: «Poner eje vertical para poder contextualizar el resto de barras») Eje Y de 0 a 100 % con
// marcas cada 20, grilla fina y su título con la unidad; la línea punteada del control del mes (H46.umbral_mes) encima de
// la grilla del 60 %, rotulada sobre su extremo derecho; el valor de cada columna. Los meses que pasan el control van en
// gris con su valor arriba en CTX 600; los cuatro que quedan debajo, en --acc con su valor en blanco 700 dentro de la
// columna: así ningún valor toca la línea (el de septiembre, arriba, quedaría pegado a ella). Valores con la unidad chica,
// como en la banda. El título del eje Y va 32 u arriba del 100 %, con la leyenda de los dos colores en su renglón; debajo
// de los meses, el título del eje X («Mes de 2025»).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import { useU } from '../escala.js'
import {
  CTX, INK, SUP, Columna, EjeY, LineaBase, Leyenda, Umbral, ancho, anchoLeyenda, margenEjeY, tam,
} from '../svg.jsx'

const ID = 'V03'
const A = DF.anclas
const VT = DF.tablas.ventas_2025
const B = textosDe(ID).barras
const UMBRAL = A['H46.umbral_mes'].valor
// foco: los meses que no se usan (se_usa de DF, el mismo corte que H46.umbral_mes)
const MESES = VT.meses.map((m) => ({ ...m, foco: !m.se_usa, valor: pct(m.parte, 0) }))
const MARCAS = [0, 0.2, 0.4, 0.6, 0.8, 1]
const fmtEje = (v) => pct(v, 0)

export const meta = { id: ID }

/** «53 %» con la unidad chica: [número, unidad], los dos de pct() de formato.js. */
const partes = (t) => {
  const i = t.lastIndexOf(NBSP)
  return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i)]
}
const anchoValor = (t, f, fu, peso) => ancho(partes(t)[0], f, peso) + ancho(partes(t)[1], fu, peso)

/** El valor de una columna: el número a `f` y la unidad a `fu`. `halo` (los que van arriba de la columna): un borde del
 *  color de la tarjeta que tapa la grilla del 100 % donde la cruza (enero y febrero), como en barras.jsx. */
function Valor({ x, y, texto, f, fu, peso, color, base = 'auto', halo }) {
  const [n, un] = partes(texto)
  return (
    <text x={x} y={y} fontSize={f} fontWeight={peso} fill={color} textAnchor="middle" dominantBaseline={base}
          {...halo}>
      {n}<tspan fontSize={fu}>{un}</tspan>
    </text>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const fMes = tam('cat', u)
  const fGris = tam('cat', u)
  const fFoco = tam(30, u)
  const fUni = tam('piso', u)
  const fCtl = tam(24, u)
  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }
  const ley = [
    { marca: 'contexto', texto: B.entra },
    { marca: 'hecho', texto: B.no_entra },
  ]

  const fTit = 23 * u
  // la leyenda va a la derecha del título del eje Y si entra; si no, en un renglón propio arriba de él
  const anchoTit = ancho(B.eje, fTit, 600)
  const anchoLey = anchoLeyenda(u, ley)
  const leyAlLado = anchoTit + 48 * u + anchoLey <= w

  // vertical: margen, renglón del título del eje Y (y la leyenda), columnas de 0 a 100 %, meses y título del eje X
  const pad = 0.03 * h
  const yTope = pad + (leyAlLado ? 54 : 94) * u
  const yMes = 16 * u
  const yTitX = yMes + fMes + 12 * u
  const yBase = h - pad - yTitX - fTit - 4 * u
  const alto = Math.max(0, yBase - yTope)
  const y = (v) => yBase - v * alto
  const yCtl = y(UMBRAL)

  // horizontal: números del eje a la izquierda; las 12 columnas en el resto
  const m = margenEjeY(u, { marcas: MARCAS, formato: fmtEje })
  const xEje = m.izq + 2 * u
  const xFin = w - 2 * u
  const paso = (xFin - xEje) / MESES.length
  const anchoFoco = Math.max(...MESES.filter((x) => x.foco).map((x) => anchoValor(x.valor, fFoco, fUni, 700)))
  const anchoBarra = Math.min(0.8 * paso, Math.max(0.62 * paso, anchoFoco + 16 * u))
  const xCol = (i) => xEje + i * paso + (paso - anchoBarra) / 2

  // el título del eje Y va 32 u arriba del 100 % (más aire que el de EjeY, por los valores de las columnas altas)
  const yTit = yTope - 32 * u
  const yLey = leyAlLado ? yTit - 8 * u : yTit - 48 * u

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeY u={u} x={xEje} y0={yBase} y1={yTope} min={0} max={1} marcas={MARCAS} formato={fmtEje} grilla
            xGrilla={xFin} />
      <text x={0} y={yTit} fontSize={fTit} fontWeight={600} fill={CTX}>{B.eje}</text>
      <Leyenda u={u} x={leyAlLado ? xFin : 0} y={yLey} items={ley} anchor={leyAlLado ? 'end' : 'start'} />

      {MESES.map((x, i) => {
        const x0 = xCol(i)
        const cx = x0 + anchoBarra / 2
        const hCol = x.parte * alto
        const adentro = x.foco && hCol >= fFoco + 20 * u
        return (
          <g key={x.mes}>
            <title>{`${x.rotulo} · ${x.valor}`}</title>
            <Columna u={u} x={x0} yBase={yBase} w={anchoBarra} h={hCol} foco={x.foco} />
            {adentro ? (
              <Valor x={cx} y={yBase - hCol + 10 * u + 0.74 * fFoco} texto={x.valor} f={fFoco} fu={fUni} peso={700}
                     color={SUP} />
            ) : (
              <Valor x={cx} y={yBase - hCol - 8 * u} texto={x.valor} f={x.foco ? fFoco : fGris} fu={fUni}
                     peso={x.foco ? 700 : 600} color={x.foco ? INK : CTX} halo={halo} />
            )}
            <text x={cx} y={yBase + yMes} fontSize={fMes} fontWeight={x.foco ? 700 : 400} fill={x.foco ? INK : CTX}
                  textAnchor="middle" dominantBaseline="hanging">{x.rotulo}</text>
          </g>
        )
      })}

      <LineaBase u={u} y={yBase} x1={xEje} x2={xFin} />
      <text x={(xEje + xFin) / 2} y={yBase + yTitX} fontSize={fTit} fontWeight={600} fill={CTX} textAnchor="middle"
            dominantBaseline="hanging">{B.eje_x}</text>

      <Umbral u={u} x1={xEje} y1={yCtl} x2={xFin} y2={yCtl} punteada />
      <text x={xFin} y={yCtl - 10 * u} fontSize={fCtl} fontWeight={600} fill={INK} textAnchor="end">
        {B.control}
        <tspan fontWeight={800}>{` ${pct(UMBRAL, 0)}`}</tspan>
      </text>
    </svg>
  )
}

export default function V03Meses() {
  return (
    <Vista id={ID} hibrido
           items={[
             { clave: 'fuera', valor: fijo(A['D28.meses_fuera'].valor) },
             { clave: 'control', valor: pct(UMBRAL, 0) },
           ]}
           cifras={[pct(UMBRAL, 0)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
