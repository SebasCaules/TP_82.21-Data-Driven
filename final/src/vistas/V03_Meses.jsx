// V03 · Qué meses entran (datos, Matías S.). Spec de dataviz f.2 y g V03 (18/11): las operaciones de cada mes de 2025
// sobre las del mismo mes de 2024 (D28, tabla ventas_2025 de DF, contada por build_final.py desde el extracto crudo) como
// 12 columnas de enero a diciembre, en escala de 0 a 100 %, con la línea punteada del control del mes (H46) y su rótulo a
// la derecha de diciembre. Los meses que quedan debajo del control, en --acc y con su valor: es lo que dice el título.
// Los que pasan, en gris y sin valor (la línea da la escala). Banda sola: sin tarjetas, sin conclusión, sin eje.
// (18/11, intermedio) Vuelven de 8e633e8 la tarjeta central (meses que no se usan, D28.meses_fuera) y la conclusión con
// el control (H46.umbral_mes).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useU } from '../escala.js'
import { CTX, INK, SUP, Columna, LineaBase, Texto, Umbral, ancho, tam } from '../svg.jsx'

const ID = 'V03'
const A = DF.anclas
const VT = DF.tablas.ventas_2025
const B = textosDe(ID).barras
const UMBRAL = A['H46.umbral_mes'].valor
const MESES = VT.meses.map((m) => ({ ...m, foco: m.parte < UMBRAL }))

export const meta = { id: ID }

function Dibujo({ w, h }) {
  const u = useU()
  const rotulo = `${B.control} ${pct(UMBRAL, 0)}`
  const fRot = tam(24, u)
  const fVal = tam('val', u)
  const fMes = tam('sec', u)
  // a la derecha queda el rótulo del control; el resto es para las 12 columnas
  const anchoCol = Math.max(0, w - ancho(rotulo, fRot, 600) - 16 * u)
  const paso = anchoCol / MESES.length
  const anchoBarra = Math.min(64 * u, 0.6 * paso)
  // bloque: columnas (80 % del lienzo) + mes debajo; centrado en vertical
  const alto = 0.8 * h
  const bajo = 12 * u + fMes
  const yBase = Math.max(0, (h - alto - bajo) / 2) + alto
  const yCtl = yBase - UMBRAL * alto
  const xIni = (paso - anchoBarra) / 2
  const xFin = (MESES.length - 1) * paso + (paso + anchoBarra) / 2
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {MESES.map((m, i) => {
        const x = i * paso + (paso - anchoBarra) / 2
        const cx = x + anchoBarra / 2
        return (
          <g key={m.mes}>
            <title>{`${m.rotulo} · ${pct(m.parte, 0)}`}</title>
            <Columna u={u} x={x} yBase={yBase} w={anchoBarra} h={m.parte * alto} foco={m.foco} />
            <Texto u={u} papel="sec" x={cx} y={yBase + 12 * u} base="hanging" anchor="middle"
                   color={m.foco ? INK : CTX} peso={m.foco ? 600 : 400}>{m.rotulo}</Texto>
          </g>
        )
      })}
      <Umbral u={u} x1={xIni} y1={yCtl} x2={xFin} y2={yCtl} ancho={2} punteada />
      {MESES.filter((m) => m.foco).map((m) => {
        const i = MESES.indexOf(m)
        const cx = i * paso + paso / 2
        return (
          <text key={m.mes} x={cx} y={yBase - m.parte * alto - 8 * u} fontSize={fVal} fontWeight={700} fill={INK}
                textAnchor="middle" stroke={SUP} strokeWidth={6 * u} paintOrder="stroke"
                strokeLinejoin="round">{pct(m.parte, 0)}</text>
        )
      })}
      <Texto u={u} papel={24} peso={600} x={xFin + 16 * u} y={yCtl} base="central">{rotulo}</Texto>
      <LineaBase u={u} y={yBase} x1={0} x2={xFin + (paso - anchoBarra) / 2} />
    </svg>
  )
}

export default function V03Meses() {
  return (
    <Vista id={ID} hibrido items={[{ clave: 'fuera', valor: fijo(A['D28.meses_fuera'].valor) }]}
           cifras={[pct(UMBRAL, 0)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
