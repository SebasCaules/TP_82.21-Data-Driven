// V05 · Regla contra modelo (modelo, Francisco C.). Precisión de la lista mensual en la prueba final: regla (J03.regla),
// modelo (J03.logistica) y práctica actual (J17); la diferencia modelo menos regla (J09).
// (18/11, fase 8) El usuario eligió la versión b, un eje de 0 a 100 % con lupa. (19/11, fase 9, spec 4 V05) «que primero
// sea la barra de 0 a 100 principalmente y al pasar se corre arriba y se abre este tramo ampliado con un mejor diseño».
// (19/11, fase 10, spec 4 V05) «el zoom in sea mas estetico haciendo enfasis en que parte estamos zoomeando y que no sea
// tan gris». Dos pasos, con cambio de composición:
//   1  (como en la fase 9) la recta de 0 a 100 % sola, grande (K1 veces el tamaño del paso 2) y centrada en el alto: la
//      práctica actual en gris y el punto donde coinciden regla y modelo en el acento, cada uno con su rótulo directo;
//      eje con su título.
//   2  la recta sube y se achica, y se abre la lupa, una sola silueta en el acento: la ventana sobre la recta (exacta,
//      de LO a HI; relleno del tinte más fuerte y borde en el acento, viaja con la recta), el cuello que baja recto por
//      donde no hay números del eje y se abre en curva hasta las esquinas del detalle, y el detalle, blanco con el mismo
//      borde, que sigue al del cuello (no hay línea entre el cuello y el detalle). El tinte del cuello se aclara al
//      abrirse y se apaga en el borde de arriba del detalle: nada queda gris. En el detalle, la misma recta ampliada con
//      regla y modelo separados, cada uno con su valor (las dos marcas en el acento: la idea es que empatan); la llave
//      entre los dos lleva la diferencia (J09, sin signo, como en la conclusión) y la palabra del empate (31.1 del
//      informe: «la logística empata»). En el ampliado los valores van con dos decimales (el texto de J03 en DF):
//      86,13 − 85,88 da los 0,25 puntos de la llave, que con un decimal (86,1 − 85,9) no cerrarían.
// La apertura se anima solo al llegar al paso 2 avanzando (useAnima): la recta sube (0 a 450 ms), la ventana se abre
// sobre ella (250 a 550), la silueta se descubre de arriba abajo desde la ventana (400 a 850), entra el contenido del
// detalle (750 a 1050) y al final la llave con la diferencia (880 a 1180). Al retroceder, al abrir completa y con
// movimiento reducido, todo aparece en su lugar, sin movimiento.
// Salieron (fase 9, menos información): la leyenda, «ampliado abajo», «Tramo ampliado», «línea de base» y «dentro del
// margen de error». Banda: solo J03.regla; conclusión con |J09|.

import { useId } from 'react'
import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { useAnima, usePaso } from '../pasos.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'
import {
  ACC, CTX, FIN_GRIS, INK, Anima, EjeX, LlaveH, Paso, altoEjeX, ancho, escalaLinda, rectRedondo, tam, useU,
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

/** Tintes del acento de la lupa (opacidad del relleno sobre la tarjeta blanca). La ventana, la más fuerte; el cuello
 *  arranca un poco más claro, lo sostiene en el tramo recto y se aclara al abrirse, hasta el borde de arriba del
 *  detalle, que queda blanco con el borde en el acento. */
const TINTE_VENTANA = 0.42
const TINTE_CUELLO = [0.32, 0.26, 0.15]
const TINTE_DETALLE = [0.05, 0]
/** Tiempos de la apertura (paso 2), en ms: [desde, duración]. Termina a los 1180 ms. */
const T_RECTA = [0, 450]
const T_VENTANA = [250, 300]
const T_SILUETA = [400, 450]
const T_DETALLE = [750, 300]
const T_LLAVE = [880, 300]
const CURVA = 'cubic-bezier(0.2, 0, 0, 1)'

/** Nombre (600) y valor (700, en fV) en un renglón. */
function NombreValor({ x, y, anchor, nombre, valor, fN, fV, u, base = 'auto', color = INK }) {
  return (
    <text x={x} y={y} fontSize={fN} fill={color} textAnchor={anchor} dominantBaseline={base}>
      <tspan fontWeight={600}>{nombre}</tspan>
      <tspan dx={10 * u} fontWeight={700} fontSize={fV}>{valor}</tspan>
    </text>
  )
}

/** La recta de 0 a 100 % en coordenadas propias: la línea del eje en y = 0, de x = 0 a x = W; rótulos arriba (en yRot),
 *  números y título abajo. La vista la ubica y la escala; el radio de las marcas cambia con el paso (`r`, con su
 *  transición en `trans`). La ventana del tramo ampliado (paso 2) va detrás de la línea y de las marcas, y viaja con la
 *  recta: no se corre durante la transición. */
function Recta({ u, W, r, yRot, fN, fV, trans, hv, sw }) {
  const xs = (v) => v * W
  const marca = (v, fill) => <circle key={v} cx={xs(v)} cy={0} r={r} fill={fill} style={{ r: `${r}px`, transition: trans }} />
  return (
    <g>
      <Paso n={2} oculto entrada={false}>
        <Anima n={2} efecto="escala" i={1} escalon={T_VENTANA[0]} dur={T_VENTANA[1]}>
          <path d={rectRedondo(xs(LO), -hv, xs(HI) - xs(LO), 2 * hv, 5 * u, 'arr')} fill={ACC}
                fillOpacity={TINTE_VENTANA} stroke={ACC} strokeWidth={sw} strokeLinejoin="round" />
        </Anima>
      </Paso>
      <EjeX u={u} x0={0} x1={W} y={0} min={0} max={ESC.tope} marcas={ESC.marcas} formato={FMT} titulo={T.barras.eje}
            anclaTitulo="start" />
      {/* la práctica actual es contexto: gris y del tamaño del nombre; el foco es el punto de regla y modelo */}
      {marca(HOY, FIN_GRIS)}
      <NombreValor x={xs(HOY)} y={yRot} anchor="middle" nombre={X.hoy} valor={pct(HOY)} fN={fN} fV={fN} u={u}
                   color={CTX} />
      {[MODELO, REGLA].map((v) => marca(v, ACC))}
      <text x={xs((REGLA + MODELO) / 2)} y={yRot} fontSize={fV} fontWeight={700} fill={INK}
            textAnchor="middle">{X.juntos}</text>
    </g>
  )
}

function Lupa({ w, h }) {
  const u = useU()
  const abre = usePaso() >= 2
  const anima = useAnima(2)
  const uid = 'v05' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const fEje = tam(LETRA_EJE, u)
  const fN = tam(26, u)
  const fV = tam(30, u)
  // radio de las marcas de la recta: grande en el paso 1 (la recta sola), chico en el 2 (entra en la ventana, de medio
  // alto hv)
  const r1 = 10 * u
  const r2 = 5 * u
  const hv = r2 + 12 * u
  const sw = 3 * u
  const mY = 0.035 * h
  const abajo = altoEjeX(u, true)
  const yRot = -(r1 + 24 * u)
  const arriba = -yRot + fV * 0.74
  const trans = (prop) => (anima ? `${prop} ${T_RECTA[1]}ms ${CURVA} ${T_RECTA[0]}ms` : 'none')

  // la recta mide W en el paso 2; en el paso 1, k veces más, a todo el ancho y centrada en el alto. La ventana del
  // tramo ampliado (exacta: de LO a HI) tiene que abrazar las dos marcas con aire, y eso fija un W mínimo.
  const m0 = ancho(FMT(ESC.min), fEje, 400) / 2 + 4 * u
  const m1 = ancho(FMT(ESC.tope), fEje, 400) / 2 + 4 * u
  const holgura = 4 * u
  const wMin = (2 * r2 + 2 * holgura) / ((HI - LO) - Math.abs(REGLA - MODELO))
  const k = Math.max(1, Math.min(K1, w / (wMin + m0 + m1)))
  const W = w / k - m0 - m1
  const p1 = { x: k * m0, y: h / 2 - (k * (abajo - arriba)) / 2, k }

  // el paso 2 de arriba abajo: la recta (rótulos, eje y título), el cuello de la lupa y el detalle. El detalle lleva
  // «Empate», la diferencia, la llave, regla y modelo (con su tallo hasta la recta ampliada) y su eje. La parte que se
  // abre del cuello toma lo que sobra, entre 64 u y 200 u; si todavía sobra (ventanas altas), el conjunto se centra en
  // el alto.
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
  const abanico = Math.min(200 * u, Math.max(64 * u, libre - altoRecta - altoPanel))
  const corre = Math.max(0, (libre - altoRecta - abanico - altoPanel) / 2)

  const p2 = { x: (w - (m0 + W + m1)) / 2 + m0, y: mY + corre + arriba, k: 1 }
  const p = abre ? p2 : p1
  const mover = { transform: `translate(${p.x}px, ${p.y}px) scale(${p.k})`, transition: trans('transform') }

  // la silueta de la lupa: desde el borde de abajo de la ventana (exacta, de LO a HI), el cuello baja recto hasta
  // debajo del título del eje (por ahí no hay números: 80 % y 100 % quedan a los costados) y se abre en curva hasta los
  // bordes del detalle, que siguen hacia abajo. Un solo trazo en el acento la rodea, abierto arriba (lo cierra la
  // ventana).
  const fx0 = p2.x + LO * W
  const fx1 = p2.x + HI * W
  const vy = p2.y + hv
  const yCuello = p2.y + abajo + 6 * u
  const py0 = yCuello + abanico
  const py1 = Math.max(py0 + altoPanel, h - mY - corre)
  const top = py0 + padP + Math.max(0, (py1 - py0 - altoPanel) / 2)
  const xa = sw / 2
  const xb = w - sw / 2
  const yb = py1 - sw / 2
  const rp = 14 * u
  // cada lado del cuello sale vertical y llega horizontal al borde de arriba del detalle, justo donde empieza la
  // esquina: la silueta no tiene quiebres
  const c = abanico * 0.7
  const ga = 0.45 * (fx0 - xa - rp)
  const gb = 0.45 * (xb - rp - fx1)
  const ida = `M${fx0} ${vy} V${yCuello} C${fx0} ${yCuello + c} ${xa + rp + ga} ${py0} ${xa + rp} ${py0} ` +
    `Q${xa} ${py0} ${xa} ${py0 + rp} V${yb - rp} Q${xa} ${yb} ${xa + rp} ${yb} H${xb - rp} Q${xb} ${yb} ${xb} ${yb - rp} ` +
    `V${py0 + rp} Q${xb} ${py0} ${xb - rp} ${py0} C${xb - rp - gb} ${py0} ${fx1} ${yCuello + c} ${fx1} ${yCuello} V${vy}`
  // dónde cambia el tinte, en fracciones del alto de la silueta (el degradé va de su borde de arriba al de abajo)
  const recto = (yCuello - vy) / Math.max(1, yb - vy)
  const corte = (py0 - vy) / Math.max(1, yb - vy)
  const espejo = `translate(0 ${vy + yb}) scale(1 -1)`

  const padZ = Math.max(...ESC_Z.marcas.map((v) => ancho(FMT_Z(v), fEje, 400))) / 2 + 56 * u
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

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACC} stopOpacity={TINTE_CUELLO[0]} />
          <stop offset={recto} stopColor={ACC} stopOpacity={TINTE_CUELLO[1]} />
          <stop offset={(recto + corte) / 2} stopColor={ACC} stopOpacity={TINTE_CUELLO[2]} />
          <stop offset={corte} stopColor={ACC} stopOpacity={TINTE_DETALLE[0]} />
          <stop offset="1" stopColor={ACC} stopOpacity={TINTE_DETALLE[1]} />
        </linearGradient>
      </defs>

      {/* la silueta se descubre de arriba abajo, desde la ventana hasta el pie del detalle, sin deformarse: revela-y
          descubre de abajo hacia arriba, así que va entre dos espejos verticales (el de afuera da vuelta el sentido del
          efecto y el de adentro deja el dibujo derecho) */}
      <Paso n={2} oculto entrada={false}>
        <g transform={espejo}>
          <Anima n={2} efecto="revela-y" i={1} escalon={T_SILUETA[0]} dur={T_SILUETA[1]}>
            <g transform={espejo}>
              <path d={`${ida} Z`} fill={`url(#${uid}t)`} />
              <path d={ida} fill="none" stroke={ACC} strokeWidth={sw} strokeLinejoin="round" />
            </g>
          </Anima>
        </g>
      </Paso>

      <g style={mover}>
        <Recta u={u} W={W} r={abre ? r2 : r1} yRot={yRot} fN={fN} fV={fV} trans={trans('r')} hv={hv} sw={sw} />
      </g>

      <Paso n={2} oculto entrada={false}>
        <Anima n={2} efecto="aparece" i={1} escalon={T_DETALLE[0]} dur={T_DETALLE[1]}>
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
        </Anima>
        <Anima n={2} efecto="funde" i={1} escalon={T_LLAVE[0]} dur={T_LLAVE[1]}>
          <LlaveH u={u} x1={xm} x2={xr} y={yLlave} lado="arriba" />
          <text x={(xm + xr) / 2} y={yDif} fontSize={fDif} fontWeight={700} fill={INK} textAnchor="middle">
            {`${fijo(Math.abs(DIF), 2)}${NBSP}${PUNTOS}`}
          </text>
          <text x={(xm + xr) / 2} y={yEmp} fontSize={fEmp} fontWeight={600} fill={INK}
                textAnchor="middle">{X.empate}</text>
        </Anima>
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
