// V05 · Regla contra modelo (modelo, Francisco C.). Precisión de la lista mensual en la prueba final: regla (J03.regla),
// modelo (J03.logistica) y práctica actual (J17); la diferencia modelo menos regla (J09).
// (18/11, fase 8) El usuario eligió la versión b, un eje de 0 a 100 % con lupa. (19/11, fase 9, spec 4 V05) «que primero
// sea la barra de 0 a 100 principalmente y al pasar se corre arriba y se abre este tramo ampliado con un mejor diseño».
// Dos pasos, con cambio de composición:
//   1  la recta de 0 a 100 % sola, grande (K1 veces el tamaño del paso 2) y centrada en el alto: la práctica actual en
//      gris y el punto donde coinciden regla y modelo en el acento, cada uno con su rótulo directo; eje con su título.
//   2  la recta sube y se achica (transición propia sobre transform, sin movimiento si el sistema lo pide) y se abre el
//      tramo ampliado: una ventana exacta sobre la recta (de LO a HI, viaja con ella), dos guías finas (tallo y abanico)
//      hasta el panel, y en el panel la misma recta ampliada con regla y modelo separados, cada uno con su valor (las dos
//      marcas en el acento: la idea es que empatan; la práctica actual, en gris); la llave entre los dos lleva la
//      diferencia (J09, sin signo, como en la conclusión) y la palabra del empate (31.1 del informe: «la logística
//      empata»). En el ampliado los valores van con dos decimales (el texto de J03 en DF): 86,13 − 85,88 da los 0,25
//      puntos de la llave, que con un decimal (86,1 − 85,9) no cerrarían.
// Salieron (fase 9, menos información): la leyenda, «ampliado abajo», «Tramo ampliado», «línea de base» y «dentro del
// margen de error». Banda: solo J03.regla; conclusión con |J09|.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { usePaso } from '../pasos.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import {
  ACC, EJE, FIN_GRIS, INK, REALCE, TRAZO, EjeX, LlaveH, Paso, altoEjeX, ancho, escalaLinda, tam, useU,
} from '../svg.jsx'

const ID = 'V05'
const A = DF.anclas
const T = textosDe(ID)
const X = T.lupa

const REGLA = A['J03.regla'].valor
const MODELO = A['J03.logistica'].valor
const HOY = A.J17.valor
const DIF = A.J09.valor
const PUNTOS = T.dif.unidad

export const meta = { id: ID, pasos: 2 }

/** Cuánto más grande es la recta en el paso 1 que en el 2 (como mucho: baja si la ventana no entraría). */
const K1 = 1.3
const LETRA_EJE = 23
const FMT = (v) => pct(v, 0)
const FMT_Z = (v) => pct(v, 1)
const ESC = escalaLinda(1)
/** Tramo ampliado: medio punto de cada lado de regla y modelo, redondeado al punto. */
const LO = Math.floor(Math.min(REGLA, MODELO) * 100 - 0.5) / 100
const HI = Math.ceil(Math.max(REGLA, MODELO) * 100 + 0.5) / 100
const ESC_Z = escalaLinda(HI, 4, LO)

const sinMovimiento = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Nombre (600) y valor (700, más grande) en un renglón. */
function NombreValor({ x, y, anchor, nombre, valor, fN, fV, u, base = 'auto' }) {
  return (
    <text x={x} y={y} fontSize={fN} fill={INK} textAnchor={anchor} dominantBaseline={base}>
      <tspan fontWeight={600}>{nombre}</tspan>
      <tspan dx={10 * u} fontWeight={700} fontSize={fV}>{valor}</tspan>
    </text>
  )
}

/** La recta de 0 a 100 % en coordenadas propias: la línea del eje en y = 0, de x = 0 a x = W; rótulos arriba (en yRot),
 *  números y título abajo. La vista la ubica y la escala; el radio de las marcas cambia con el paso (`r`, con su
 *  transición en `trans`). */
function Recta({ u, W, r, yRot, fN, fV, trans, hv }) {
  const xs = (v) => v * W
  const marca = (v, fill) => <circle key={v} cx={xs(v)} cy={0} r={r} fill={fill} style={{ r: `${r}px`, transition: trans }} />
  return (
    <g>
      <EjeX u={u} x0={0} x1={W} y={0} min={0} max={ESC.tope} marcas={ESC.marcas} formato={FMT} titulo={T.barras.eje}
            anclaTitulo="start" />
      {marca(HOY, FIN_GRIS)}
      <NombreValor x={xs(HOY)} y={yRot} anchor="middle" nombre={X.hoy} valor={pct(HOY)} fN={fN} fV={fV} u={u} />
      {[MODELO, REGLA].map((v) => marca(v, ACC))}
      <text x={xs((REGLA + MODELO) / 2)} y={yRot} fontSize={fN} fontWeight={600} fill={INK}
            textAnchor="middle">{X.juntos}</text>
      {/* la ventana del tramo ampliado (paso 2): viaja con la recta, así no se corre durante la transición */}
      <Paso n={2} oculto>
        <rect x={xs(LO)} y={-hv} width={xs(HI) - xs(LO)} height={2 * hv} rx={3 * u} fill="none" stroke={INK}
              strokeWidth={2 * u} />
      </Paso>
    </g>
  )
}

function Lupa({ w, h }) {
  const u = useU()
  const abre = usePaso() >= 2
  const fEje = tam(LETRA_EJE, u)
  const fN = tam(26, u)
  const fV = tam(30, u)
  // radio de las marcas de la recta: grande en el paso 1 (la recta sola), chico en el 2 (entra en la ventana, de medio
  // alto hv)
  const r1 = 10 * u
  const r2 = 5 * u
  const hv = r2 + 8 * u
  const mY = 0.035 * h
  const abajo = altoEjeX(u, true)
  const yRot = -(r1 + 20 * u)
  const arriba = -yRot + fV * 0.74
  const curva = 'var(--fin-paso-t, 350ms) cubic-bezier(0.2, 0, 0, 1)'
  const quieto = sinMovimiento()

  // la recta mide W en el paso 2; en el paso 1, k veces más, a todo el ancho y centrada en el alto. La ventana del
  // tramo ampliado (exacta: de LO a HI) tiene que abrazar las dos marcas con aire, y eso fija un W mínimo.
  const m0 = ancho(FMT(ESC.min), fEje, 400) / 2 + 4 * u
  const m1 = ancho(FMT(ESC.tope), fEje, 400) / 2 + 4 * u
  const holgura = 4 * u
  const wMin = (2 * r2 + 2 * holgura) / ((HI - LO) - Math.abs(REGLA - MODELO))
  const k = Math.max(1, Math.min(K1, w / (wMin + m0 + m1)))
  const W = w / k - m0 - m1
  const p1 = { x: k * m0, y: h / 2 - (k * (abajo - arriba)) / 2, k }

  // el paso 2 de arriba abajo: la recta (rótulos, eje y título), el abanico y el panel. El panel lleva «Empate», la
  // diferencia, la llave, regla y modelo (con su tallo hasta la recta ampliada) y su eje. El abanico toma lo que sobra,
  // entre 48 u y 120 u; si todavía sobra (ventanas altas), el conjunto se centra en el alto.
  const fZN = tam(28, u)
  const fZV = tam('valFoco', u)
  const fDif = tam(30, u)
  const fEmp = tam(26, u)
  const rZ = 15 * u
  const tallo = 52 * u
  const bloque = fEmp + 8 * u + fDif * 0.74 + 22 * u + 18 * u + rZ + tallo + abajo
  const padP = 30 * u
  const altoRecta = arriba + abajo + 6 * u
  const altoPanel = bloque + 2 * padP
  const libre = h - 2 * mY
  const abanico = Math.min(120 * u, Math.max(48 * u, libre - altoRecta - altoPanel))
  const corre = Math.max(0, (libre - altoRecta - abanico - altoPanel) / 2)

  const p2 = { x: (w - (m0 + W + m1)) / 2 + m0, y: mY + corre + arriba, k: 1 }
  const p = abre ? p2 : p1
  const mover = {
    transform: `translate(${p.x}px, ${p.y}px) scale(${p.k})`,
    transition: quieto ? 'none' : `transform ${curva}`,
  }

  // la lupa: ventana sobre la recta (exacta, de LO a HI), dos guías finas (tallo hasta debajo del eje y abanico) y el
  // panel
  const fx0 = p2.x + LO * W
  const fx1 = p2.x + HI * W
  const fy1 = p2.y + hv
  const yTallo = p2.y + abajo + 6 * u
  const py0 = yTallo + abanico
  const py1 = Math.max(py0 + altoPanel, h - mY - corre)
  const top = py0 + padP + Math.max(0, (py1 - py0 - altoPanel) / 2)

  const padZ = Math.max(...ESC_Z.marcas.map((v) => ancho(FMT_Z(v), fEje, 400))) / 2 + 48 * u
  const zx0 = padZ
  const zx1 = w - padZ
  const zs = (v) => zx0 + ((v - LO) / (HI - LO)) * (zx1 - zx0)
  const yEmp = top + fEmp * 0.74
  const yDif = yEmp + fEmp * 0.26 + 8 * u + fDif * 0.74
  const yLlave = yDif + 22 * u
  const yPts = yLlave + 18 * u + rZ
  const zy = yPts + tallo
  const xm = zs(MODELO)
  const xr = zs(REGLA)
  const rp = 10 * u
  const panel = `M0 ${py0} H${w} V${py1 - rp} Q${w} ${py1} ${w - rp} ${py1} H${rp} Q0 ${py1} 0 ${py1 - rp} Z`
  const guias = `M${fx0} ${fy1} V${yTallo} L0 ${py0} M${fx1} ${fy1} V${yTallo} L${w} ${py0}`

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Paso n={2} oculto>
        <path d={panel} fill={REALCE} />
        <path d={guias} fill="none" stroke={EJE} strokeWidth={TRAZO.guia * u} />
      </Paso>

      <g style={mover}>
        <Recta u={u} W={W} r={abre ? r2 : r1} yRot={yRot} fN={fN} fV={fV} trans={quieto ? 'none' : `r ${curva}`}
               hv={hv} />
      </g>

      <Paso n={2} oculto>
        <EjeX u={u} x0={zx0} x1={zx1} y={zy} min={LO} max={ESC_Z.tope} marcas={ESC_Z.marcas} formato={FMT_Z}
              titulo={X.ejeZoom} />
        {[MODELO, REGLA].map((v) => (
          <g key={v}>
            <line x1={zs(v)} x2={zs(v)} y1={yPts} y2={zy} stroke={ACC} strokeWidth={3 * u} />
            <circle cx={zs(v)} cy={yPts} r={rZ} fill={ACC} />
          </g>
        ))}
        <NombreValor x={xm - rZ - 14 * u} y={yPts} base="central" anchor="end" nombre={X.modelo}
                     valor={pct(MODELO, 2)} fN={fZN} fV={fZV} u={u} />
        <NombreValor x={xr + rZ + 14 * u} y={yPts} base="central" anchor="start" nombre={X.regla}
                     valor={pct(REGLA, 2)} fN={fZN} fV={fZV} u={u} />
        <LlaveH u={u} x1={xm} x2={xr} y={yLlave} lado="arriba" />
        <text x={(xm + xr) / 2} y={yDif} fontSize={fDif} fontWeight={700} fill={INK} textAnchor="middle">
          {`${fijo(Math.abs(DIF), 2)}${NBSP}${PUNTOS}`}
        </text>
        <text x={(xm + xr) / 2} y={yEmp} fontSize={fEmp} fontWeight={600} fill={INK}
              textAnchor="middle">{X.empate}</text>
      </Paso>
    </svg>
  )
}

export default function V05ReglaModelo() {
  return (
    <Vista id={ID} items={[{ clave: 'regla', valor: pct(REGLA) }]} cifras={[fijo(Math.abs(DIF), 2)]}>
      {({ w, h }) => <Lupa w={w} h={h} />}
    </Vista>
  )
}
