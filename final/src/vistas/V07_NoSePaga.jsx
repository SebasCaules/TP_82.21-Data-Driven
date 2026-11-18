// V07 · No se paga (economía, Juan Manuel R.). Cuadrícula de 10 × 10 (spec f.4 y g V07): los 100 cuadros son el costo del
// primer año con la regla (G39, piloto mínimo más producción completa) y lo que deja la lista por año (G54) llena
// 100 × G54 / G39 cuadros en --acc, desde arriba a la izquierda; el último, parcial por ancho. Como barra, el dato del
// título medía 9 px; como parte de 100 cuadros se ve. La vista ya no repite el gráfico de V01 (sale el costo con modelo).
// En la banda, el ROI de la regla (G54.roi), que es lo que dibuja la cuadrícula (decisión CH-05); el del modelo (G40.roi)
// lo dice la voz.
// (18/11, intermedio) Vuelven de 8e633e8 la tarjeta central (ROI de la regla, G54.roi) y la conclusión con lo que deja
// la lista (G54); la cuadrícula ocupa el 86 % del alto del lienzo.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pctDirecto, usd } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, Guia, Llave, ancho, tam, useU } from '../svg.jsx'

const ID = 'V07'
const A = DF.anclas
const B = textosDe(ID).barras
const DEJA = A.G54.valor
const COSTO = A.G39.valor
const LLENOS = (100 * DEJA) / COSTO

export const meta = { id: ID }

function Dibujo({ w, h }) {
  const u = useU()
  const lado = Math.min(0.86 * h, 560 * u)   // (18/11, intermedio) el 86 % del lienzo
  const gap = 6 * u
  const s = (lado - 9 * gap) / 10
  const r = 4 * u
  const fCat = tam('cat', u)
  const fFoco = tam('valFoco', u)
  const fVal = tam('val', u)
  // a la izquierda, lo que deja (con su guía al primer cuadro); a la derecha, la llave del alto entero y el costo
  const colIzq = Math.max(ancho(B.deja, fCat, 600), ancho(usd(DEJA, 0), fFoco, 700))
  const colDer = Math.max(ancho(B.costo_regla, fCat, 400), ancho(usd(COSTO, 0), fVal, 600))
  const hueco = 48 * u
  const total = colIzq + hueco + lado + hueco + colDer
  const x0 = Math.max(0, (w - total) / 2)
  const xG = x0 + colIzq + hueco
  const yG = Math.max(0, (h - lado) / 2)
  const xLlave = xG + lado + 16 * u
  const xDer = xLlave + 32 * u
  const yFila1 = yG + s / 2
  const yMedio = yG + lado / 2
  const cuadros = Array.from({ length: 100 }, (_, i) => {
    const x = xG + (i % 10) * (s + gap)
    const y = yG + Math.floor(i / 10) * (s + gap)
    const parte = Math.max(0, Math.min(1, LLENOS - i))
    return { i, x, y, parte }
  })
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <defs>
        {cuadros.filter((c) => c.parte > 0 && c.parte < 1).map((c) => (
          <clipPath key={c.i} id={`v07-c${c.i}`}>
            <rect x={c.x} y={c.y} width={s} height={s} rx={r} />
          </clipPath>
        ))}
      </defs>
      {cuadros.map((c) => (
        <g key={c.i}>
          <rect x={c.x} y={c.y} width={s} height={s} rx={r} fill={c.parte >= 1 ? ACC : FIN_GRIS} />
          {c.parte > 0 && c.parte < 1 && (
            <rect x={c.x} y={c.y} width={s * c.parte} height={s} fill={ACC} clipPath={`url(#v07-c${c.i})`} />
          )}
        </g>
      ))}
      <title>{`${B.deja}: ${usd(DEJA, 0)} · ${B.costo_regla}: ${usd(COSTO, 0)}`}</title>
      {/* lo que deja la lista, a la altura de la primera fila, con su guía hasta el primer cuadro */}
      <text x={x0} y={yFila1 - 10 * u} fontSize={fCat} fontWeight={600} fill={INK}>{B.deja}</text>
      <text x={x0} y={yFila1 + 6 * u} fontSize={fFoco} fontWeight={700} fill={INK}
            dominantBaseline="hanging">{usd(DEJA, 0)}</text>
      <Guia u={u} x1={x0 + colIzq + 16 * u} y1={yFila1} x2={xG - 8 * u} y2={yFila1} />
      {/* el costo del primer año, colgado de la llave que recorre el alto de la cuadrícula */}
      <Llave u={u} x={xLlave} y1={yG} y2={yG + lado} lado="der" />
      <text x={xDer} y={yMedio - 10 * u} fontSize={fCat} fill={CTX}>{B.costo_regla}</text>
      <text x={xDer} y={yMedio + 6 * u} fontSize={fVal} fontWeight={600} fill={INK}
            dominantBaseline="hanging">{usd(COSTO, 0)}</text>
    </svg>
  )
}

export default function V07NoSePaga() {
  return (
    <Vista id={ID} hibrido
           items={[
             { clave: 'roi', valor: pctDirecto(A['G54.roi'].valor, 1) },
             { clave: 'roi_modelo', valor: pctDirecto(A['G40.roi'].valor, 1) },
           ]}
           cifras={[usd(DEJA, 0)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
