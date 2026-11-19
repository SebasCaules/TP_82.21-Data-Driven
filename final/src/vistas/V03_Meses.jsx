// V03 · Qué meses entran (datos, Matías S.). Las operaciones de cada mes de 2025 sobre las del mismo mes de 2024 (D28,
// tabla ventas_2025 de DF, contada por build_final.py desde el extracto crudo) como 12 columnas de enero a diciembre, con
// el eje Y de 0 a 100 % (línea, marcas cada 20 con su valor y título con la unidad) y la línea punteada del control del
// mes (H46.umbral_mes), rotulada sobre su extremo derecho con el nombre del informe («Control de mes completo», A1.12).
// Sin grilla (fase 9, spec 1): cada columna lleva su valor y la única referencia horizontal que se dice en voz alta es el
// control. La leyenda dice solo «Mes completo» y «Mes incompleto», las palabras del título y de la decisión.
// (19/11, fase 9, ficha V03: «me choca que no haya tanta consistencia de diseño entre las barras en azul y las grises»)
// Las doce columnas se escriben igual: el valor arriba de la columna, mismo tamaño, peso y color (INK 700), y el mes
// debajo en CTX; lo único que cambia entre los meses que entran y los que no es el color de la columna (FIN_GRIS o el
// acento). Ningún valor toca la línea de control: la letra del valor es la más grande, de 28 u a 24 u, con la que el de
// septiembre (el más alto debajo del control) deja 8 u de aire bajo la línea; en el lienzo de 16:9 (570 u de alto) no
// alcanza y queda en 24 u con unas 6 u de aire. Para ganar alto, el año del eje X pasa al título del eje Y (sale el renglón
// «Mes de 2025») y los márgenes del título y de los meses se ajustan.
// Pasos (spec 2, en el orden de las notas): 1, el eje, los ocho meses que entran, la línea de control y la leyenda de los
// meses completos; 2, los cuatro meses que quedan debajo, en el acento, con su renglón de la leyenda. Los meses del eje X
// están desde el paso 1 (son el eje).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import { useU } from '../escala.js'
import {
  CTX, INK, TRAZO, Columna, EjeY, LineaBase, Leyenda, Paso, Umbral, ancho, anchoLeyenda, margenEjeY, tam,
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
// la columna más alta (fija el tope del dibujo) y la más alta debajo del control (su valor no puede tocar la línea)
const MAX = Math.max(...MESES.map((m) => m.parte))
const MAX_DEBAJO = Math.max(0, ...MESES.filter((m) => m.parte < UMBRAL).map((m) => m.parte))

export const meta = { id: ID, pasos: 2 }

/** «53 %» con la unidad chica: [número, unidad], los dos de pct() de formato.js. */
const partes = (t) => {
  const i = t.lastIndexOf(NBSP)
  return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i)]
}

/** El valor de una columna, centrado en x con la base del renglón en y: el número a `f` y la unidad a `fu`. */
function Valor({ x, y, texto, f, fu }) {
  const [n, un] = partes(texto)
  return (
    <text x={x} y={y} fontSize={f} fontWeight={700} fill={INK} textAnchor="middle">
      {n}<tspan fontSize={fu}>{un}</tspan>
    </text>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const fMes = tam('cat', u)
  const fUni = tam('piso', u)
  const fCtl = tam(24, u)
  const fTit = tam(23, u)
  const gapV = 4 * u // de la punta de la columna a la base del valor
  const cap = (f) => 0.74 * f // alto de las cifras sobre su base
  const aireCtl = 8 * u // aire mínimo entre el valor de septiembre y la línea de control

  const leyIt = [
    { marca: 'contexto', texto: B.completo },
    { marca: 'hecho', texto: B.incompleto },
  ]
  const anchoLey2 = anchoLeyenda(u, [leyIt[1]])
  const anchoLey = anchoLeyenda(u, leyIt)
  const anchoTit = ancho(B.eje, fTit, 600)
  const leyAlLado = anchoTit + 48 * u + anchoLey <= w

  // vertical: margen, renglón del título del eje Y (con la leyenda al lado, o arriba si no entra), columnas de 0 a
  // 100 % y los meses
  const pad = 0.035 * h
  const yLeyArriba = pad + 12 * u
  const yTit = leyAlLado ? pad + 0.8 * fTit : yLeyArriba + 44 * u
  const yLey = leyAlLado ? yTit - 8 * u : yLeyArriba
  const piso = yTit + 0.25 * fTit + 6 * u // nada del dibujo sube de acá
  const yMes = 12 * u
  const yBase = h - pad - yMes - fMes

  // el tope (100 %) baja lo justo para que el número «100 %» del eje y el valor de la columna más alta no toquen el título
  const geometria = (f) => {
    const a = 1 - MAX
    const porValor = (piso + gapV + cap(f) - a * yBase) / (1 - a)
    const yTope = Math.max(piso + 0.5 * 23 * u + 2 * u, porValor)
    const alto = Math.max(0, yBase - yTope)
    const aire = (UMBRAL - MAX_DEBAJO) * alto - gapV - cap(f) - (TRAZO.umbral * u) / 2
    return { yTope, alto, aire }
  }
  // la letra del valor: la más grande de 28 u a 24 u con la que el valor de septiembre deja su aire bajo la línea
  let fVal = 28 * u
  while (fVal > 24 * u && geometria(fVal).aire < aireCtl) fVal -= 0.5 * u
  const { yTope, alto } = geometria(fVal)
  const y = (v) => yBase - v * alto
  const yCtl = y(UMBRAL)

  // horizontal: números del eje a la izquierda; las 12 columnas en el resto
  const m = margenEjeY(u, { marcas: MARCAS, formato: fmtEje })
  const xEje = m.izq + 2 * u
  const xFin = w - 2 * u
  const paso = (xFin - xEje) / MESES.length
  const anchoBarra = 0.66 * paso
  const xCol = (i) => xEje + i * paso + (paso - anchoBarra) / 2
  const xLey = leyAlLado ? xFin : 0
  const anclaLey = leyAlLado ? 'end' : 'start'

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeY u={u} x={xEje} y0={yBase} y1={yTope} min={0} max={1} marcas={MARCAS} formato={fmtEje} />
      <text x={0} y={yTit} fontSize={fTit} fontWeight={600} fill={CTX}>{B.eje}</text>

      {/* la leyenda: el renglón de los meses que no entran se enciende con sus columnas */}
      <Leyenda u={u} x={leyAlLado ? xFin - anchoLey2 - 32 * u : xLey} y={yLey} items={[leyIt[0]]} anchor={anclaLey} />
      <Paso n={2}>
        <Leyenda u={u} x={leyAlLado ? xFin : xLey + anchoLey - anchoLey2} y={yLey} items={[leyIt[1]]}
                 anchor={anclaLey} />
      </Paso>

      {MESES.map((x, i) => {
        const x0 = xCol(i)
        const hCol = x.parte * alto
        return (
          <Paso key={x.mes} n={x.foco ? 2 : 1}>
            <Columna u={u} x={x0} yBase={yBase} w={anchoBarra} h={hCol} foco={x.foco} />
            <Valor x={x0 + anchoBarra / 2} y={yBase - hCol - gapV} texto={x.valor} f={fVal} fu={fUni} />
          </Paso>
        )
      })}

      {MESES.map((x, i) => (
        <text key={x.mes} x={xCol(i) + anchoBarra / 2} y={yBase + yMes} fontSize={fMes} fill={CTX}
              textAnchor="middle" dominantBaseline="hanging">{x.rotulo}</text>
      ))}
      <LineaBase u={u} y={yBase} x1={xEje} x2={xFin} />

      <Umbral u={u} x1={xEje} y1={yCtl} x2={xFin} y2={yCtl} punteada />
      <text x={xFin} y={yCtl - 12 * u} fontSize={fCtl} fontWeight={600} fill={INK} textAnchor="end">
        {B.control}
        <tspan fontWeight={800}>{` ${pct(UMBRAL, 0)}`}</tspan>
      </text>
    </svg>
  )
}

export default function V03Meses() {
  return (
    <Vista id={ID}
           items={[{ clave: 'fuera', valor: fijo(A['D28.meses_fuera'].valor) }]}
           cifras={[pct(UMBRAL, 0)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
