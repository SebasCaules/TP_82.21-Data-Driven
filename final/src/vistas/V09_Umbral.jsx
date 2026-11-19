// V09 · Cuándo pasa (economía, Juan Manuel R.). (18/11, fase 8, spec V09) El usuario la vio «insulsa»: rehecha como
// escala con eje, zonas y potencia. Dos versiones (variante('V09')):
//   a  Una escala de diferencia de cruce (EjeX, marcas cada 2, título con unidad) con tres zonas de fondo rotuladas:
//      no pasa ninguna rama, pasa la rama sin descuento (desde G67.sin_descuento) y pasan las dos (desde
//      G67.con_descuento). Va de 0 a 14 y no a 12: a 12 la tercera zona medía el 8 % del eje y su rótulo se partía en
//      cuatro renglones. Lo observado (G62.tasa_observada) es la barra en ACC con su asta y su rótulo; la llave (LlaveH,
//      sin cifra) marca lo que falta hasta el primer umbral. Cada umbral lleva su bandera: valor, 10 círculos llenos en
//      la proporción de G68 (1 círculo = 10 veces de cada 100; el último, lleno en parte) y «el piloto lo ve n de cada
//      100». Las dos banderas de los umbrales miran hacia afuera (sin descuento a la izquierda de su línea, con
//      descuento a la derecha) para que ninguna línea cruce un rótulo; la leyenda de los círculos va en el renglón de
//      las banderas, a la izquierda.
//   b  Dos carriles, uno por rama, con la misma recta de 0 a 12 puntos: zonas «no pasa» y «pasa», lo observado en ACC
//      con su pastilla, el umbral con su pastilla en INK, la llave debajo del renglón de las zonas y, a la izquierda, el
//      nombre de la rama y su «de cada 100». Leyenda arriba: lo observado, umbral y círculo.
// La banda (umbral de pase, sin descuento, «menos de 1») y la conclusión (0,79 puntos) no cambian.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import {
  ACC, CONTORNO, CTX, INK, PISTA, REALCE, SUP, TRAZO, EjeX, Leyenda, LlaveH, Umbral, altoEjeX, ancho, envolver,
  escalaLinda, tam, useU,
} from '../svg.jsx'
import { fijo } from '../../../e3/src/formato.js'

const ID = 'V09'
const A = DF.anclas
const B = textosDe(ID).barras
const HOY = A['G62.tasa_observada'].valor
const SIN = A['G67.sin_descuento'].valor
const CON = A['G67.con_descuento'].valor
const POT_SIN = A['G68.potencia_sin_descuento'].valor
const POT_CON = A['G68.potencia_con_descuento'].valor
// 0 a 12 con marcas cada 2 (spec V09): la escala linda de seis tramos que cubre el umbral más alto
const ESC = escalaLinda(CON, 6)
const TOPE = ESC.tope
// versión a: un tramo más (0 a 14) para que la zona «pasan las dos» tenga lugar para su rótulo y su bandera encima;
// a 12 medía el 8 % del eje y el rótulo se partía en cuatro renglones
const PASO_ESC = ESC.marcas[1] - ESC.marcas[0]
const ESC_A = { tope: TOPE + PASO_ESC, marcas: [...ESC.marcas, TOPE + PASO_ESC] }

export const meta = { id: ID }

const LLENA = 0.9
// los diez círculos de cada umbral: radio y paso en u; cada círculo vale 10 de cada 100
const PUNTOS = 10
const R_P = 9
const PASO_P = 24
const EJE_F = 23 // letra de los números del eje (la de EjeX), para reservar su medio ancho en los bordes

const conUnidad = (v) => `${fijo(v, 2)} ${B.unidad}`
const veces = (p) => `${B.ve} ${fijo(p)} ${B.de_cada}`
const anchoPuntos = (u) => (PUNTOS - 1) * PASO_P * u + 2 * R_P * u

/** Segmento de un círculo lleno desde la izquierda hasta la fracción f de su diámetro. */
function segmento(cx, cy, r, f) {
  const xc = cx - r + 2 * r * f
  const hh = Math.sqrt(Math.max(0, r * r - (xc - cx) ** 2))
  return `M${xc} ${cy - hh} A${r} ${r} 0 ${f > 0.5 ? 1 : 0} 0 ${xc} ${cy + hh} Z`
}

/** Diez círculos en fila con centro vertical en y: llenos en INK los valor / 10 primeros (el último en parte), vacíos
 *  con contorno los demás. anchor 'end' los alinea a la derecha de x. */
function Puntos({ u, x, y, valor, anchor = 'start' }) {
  const r = R_P * u
  const sw = TRAZO.contorno * u
  const x0 = anchor === 'end' ? x - anchoPuntos(u) : x
  const llenos = (valor / 100) * PUNTOS
  return (
    <g>
      {Array.from({ length: PUNTOS }, (_, i) => {
        const cx = x0 + r + i * PASO_P * u
        const f = Math.max(0, Math.min(1, llenos - i))
        return (
          <g key={i}>
            {f < 1 && <circle cx={cx} cy={y} r={r - sw / 2} fill={SUP} stroke={CONTORNO} strokeWidth={sw} />}
            {f >= 1 && <circle cx={cx} cy={y} r={r} fill={INK} />}
            {f > 0 && f < 1 && <path d={segmento(cx, y, r, f)} fill={INK} />}
          </g>
        )
      })}
    </g>
  )
}

const muestraPunto = ({ u, x, y }) => <circle cx={x} cy={y} r={R_P * u} fill={INK} />
const muestraHoy = ({ x, y, s }) => <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={ACC} />

/** Bandera de un valor: rótulo (CTX 600), valor (INK 700) y, si hay potencia, los diez círculos y «el piloto lo ve…».
 *  (x, y): el borde superior y el lado del asta; anchor 'start' (a la derecha del asta) o 'end'. */
function Bandera({ u, x, y, rotulo, valor, potencia, anchor = 'start', m }) {
  return (
    <g>
      <text x={x} y={y} fontSize={m.fR} fontWeight={600} fill={CTX} textAnchor={anchor}
            dominantBaseline="hanging">{rotulo}</text>
      <text x={x} y={y + m.hL1} fontSize={m.fV} fontWeight={700} fill={INK} textAnchor={anchor}
            dominantBaseline="hanging">{valor}</text>
      {potencia != null && (
        <>
          <Puntos u={u} x={x} y={y + m.hL1 + m.hL2 + m.hL3 / 2} valor={potencia} anchor={anchor} />
          <text x={x} y={y + m.hL1 + m.hL2 + m.hL3} fontSize={m.fR} fill={INK} textAnchor={anchor}
                dominantBaseline="hanging">{veces(potencia)}</text>
        </>
      )}
    </g>
  )
}

// ---------------------------------------------------------------- versión a: una escala con zonas

function DibujoA({ w, h }) {
  const u = useU()
  const fR = tam(24, u)
  const fV = tam('valFoco', u)
  const gap = 14 * u
  const m = { fR, fV, hL1: fR * 1.3, hL2: fV * 1.2, hL3: 2 * R_P * u + 16 * u }
  const altoBandera = m.hL1 + m.hL2 + m.hL3 + fR * 1.15
  const anchoBandera = (rot, val, pot) =>
    Math.max(ancho(rot, fR, 600), ancho(val, fV, 700), anchoPuntos(u), ancho(veces(pot), fR, 400))
  const wCon = anchoBandera(B.con, conUnidad(CON), POT_CON)

  // horizontal: el 0 en x0; el tope donde entra la bandera de la rama con descuento a la derecha de su línea
  const TOPE_A = ESC_A.tope
  const fEje = EJE_F * u
  const x0 = ancho(fijo(0), fEje) / 2 + 4 * u
  const finEje = w - ancho(fijo(TOPE_A), fEje) / 2 - 4 * u
  const L = Math.min(finEje - x0, ((w - 4 * u - wCon - gap - x0) * TOPE_A) / CON)
  const xs = (v) => x0 + (v / TOPE_A) * L
  const x1 = xs(TOPE_A)

  // vertical: banderas (la leyenda va en su renglón, a la izquierda), la escala (zonas) y el eje
  const hEje = altoEjeX(u)
  const arriba = altoBandera + 24 * u
  const pista = Math.min(400 * u, Math.max(150 * u, LLENA * h - arriba - hEje))
  const total = arriba + pista + hEje
  const y0 = Math.max(0, (h - total) / 2)
  const yBan = y0
  const yP = y0 + arriba
  const yE = yP + pista
  const yHoy = yBan + m.hL3 + fR * 1.15 // la bandera de lo observado, abajo en el renglón: cerca de su barra

  // zonas: desde, hasta, capas de gris (más oscura cuantas más ramas pasan) y rótulo
  const zonas = [
    { a: 0, b: SIN, capas: [REALCE], rot: B.zona_no },
    { a: SIN, b: CON, capas: [PISTA, REALCE], rot: B.zona_sin },
    { a: CON, b: TOPE_A, capas: [PISTA, PISTA, REALCE], rot: B.zona_dos },
  ]
  const fZ = fR
  const xHoy = xs(HOY)
  // la llave: de lo observado al primer umbral, a dos tercios de la pista
  const yLl = yP + pista * 0.66
  const xLl = (xHoy + xs(SIN)) / 2

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${B.hoy}: ${conUnidad(HOY)} · ${B.sin}: ${conUnidad(SIN)} · ${B.con}: ${conUnidad(CON)}`}</title>
      <Leyenda u={u} x={0} y={yBan + fR * 0.55} items={[{ marca: muestraPunto, texto: B.ley_punto }]} />

      {/* zonas de fondo */}
      {zonas.map((z, i) => z.capas.map((c, k) => (
        <rect key={`${i}-${k}`} x={xs(z.a)} y={yP} width={xs(z.b) - xs(z.a)} height={pista} fill={c} />
      )))}
      {/* rótulos de las zonas, arriba de cada una (la primera, después de la barra de lo observado) */}
      {zonas.map((z, i) => {
        const xa = i === 0 ? xHoy + gap : xs(z.a) + gap
        const disp = xs(z.b) - xa - (i === 0 ? gap : gap * 0.6)
        const lineas = envolver(z.rot, disp, fZ, 600)
        return lineas.map((l, k) => (
          <text key={`${i}-${k}`} x={xa} y={yP + 14 * u + k * fZ * 1.2} fontSize={fZ} fontWeight={600} fill={INK}
                dominantBaseline="hanging">{l}</text>
        ))
      })}

      {/* lo observado: barra en ACC de 0 a su valor y asta hasta su bandera */}
      <rect x={x0} y={yP} width={xHoy - x0} height={pista} fill={ACC} />
      <Umbral u={u} x1={xHoy - (TRAZO.umbral * u) / 2} x2={xHoy - (TRAZO.umbral * u) / 2} y1={yHoy} y2={yP}
              color={ACC} />
      <Bandera u={u} x={xHoy + gap} y={yHoy} rotulo={B.hoy} valor={conUnidad(HOY)} m={m} />

      {/* umbrales: línea de la bandera al eje */}
      <Umbral u={u} x1={xs(SIN)} x2={xs(SIN)} y1={yBan} y2={yE} />
      <Umbral u={u} x1={xs(CON)} x2={xs(CON)} y1={yBan} y2={yE} />
      <Bandera u={u} x={xs(SIN) - gap} y={yBan} rotulo={B.sin} valor={conUnidad(SIN)} potencia={POT_SIN} anchor="end"
               m={m} />
      <Bandera u={u} x={xs(CON) + gap} y={yBan} rotulo={B.con} valor={conUnidad(CON)} potencia={POT_CON} m={m} />

      {/* lo que falta: llave de lo observado al primer umbral */}
      <LlaveH u={u} x1={xHoy + 4 * u} x2={xs(SIN) - 4 * u} y={yLl} lado="arriba" />
      <text x={xLl} y={yLl - 18 * u} fontSize={fR} fontWeight={600} fill={INK} textAnchor="middle">{B.llave}</text>

      <EjeX u={u} x0={x0} x1={x1} y={yE} min={0} max={TOPE_A} marcas={ESC_A.marcas} formato={(v) => fijo(v)}
            titulo={B.eje} />
    </svg>
  )
}

// ---------------------------------------------------------------- versión b: un carril por rama

function Pastilla({ u, x, y, texto, fill, f, min = -Infinity, max = Infinity }) {
  const wP = ancho(texto, f, 700) + 24 * u
  const hP = f * 1.5
  const xc = Math.min(max - wP / 2, Math.max(min + wP / 2, x))
  const pico = 8 * u
  return (
    <g>
      <rect x={xc - wP / 2} y={y} width={wP} height={hP} rx={hP / 2} fill={fill} />
      <path d={`M${x - pico} ${y + hP - 1} L${x} ${y + hP + pico} L${x + pico} ${y + hP - 1} Z`} fill={fill} />
      <text x={xc} y={y + hP / 2} fontSize={f} fontWeight={700} fill={SUP} textAnchor="middle"
            dominantBaseline="central">{texto}</text>
    </g>
  )
}

function DibujoB({ w, h }) {
  const u = useU()
  const fN = tam('nombre', u)
  const fR = tam(24, u)
  const fP = tam(24, u)
  const gap = 14 * u
  const carriles = [
    { nombre: B.rama_con, umbral: CON, pot: POT_CON },
    { nombre: B.rama_sin, umbral: SIN, pot: POT_SIN },
  ]
  const wCol = Math.max(...carriles.map((c) => Math.max(ancho(c.nombre, fN, 700), anchoPuntos(u), ancho(veces(c.pot), fR, 400))))
  const fEje = EJE_F * u
  const xA = wCol + 56 * u
  const xB = w - ancho(fijo(TOPE), fEje) / 2 - 4 * u
  const xs = (v) => xA + (v / TOPE) * (xB - xA)

  // vertical: leyenda; por carril, pastillas, pista y eje (sin título); el título del eje al final
  const altoLey = fR * 1.2
  const hPill = fP * 1.5 + 8 * u
  const hEje = altoEjeX(u, false)
  const hTit = altoEjeX(u, true) - hEje
  const entre = 22 * u
  const fijoAlto = altoLey + 18 * u + 2 * (hPill + 8 * u + hEje) + entre + hTit
  const pista = Math.min(220 * u, Math.max(100 * u, (LLENA * h - fijoAlto) / 2))
  const alto = hPill + 8 * u + pista + hEje
  const total = fijoAlto + 2 * pista
  const y0 = Math.max(0, (h - total) / 2)
  const yC = (i) => y0 + altoLey + 18 * u + i * (alto + entre)

  const ley = [
    { marca: muestraHoy, texto: B.ley_hoy },
    { marca: 'linea', texto: B.ley_umbral },
    { marca: muestraPunto, texto: B.ley_punto },
  ]

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${B.hoy}: ${conUnidad(HOY)} · ${B.sin}: ${conUnidad(SIN)} · ${B.con}: ${conUnidad(CON)}`}</title>
      <Leyenda u={u} x={0} y={y0 + altoLey / 2} items={ley} />
      {carriles.map((c, i) => {
        const yTop = yC(i)
        const yP = yTop + hPill + 8 * u
        const yE = yP + pista
        const xU = xs(c.umbral)
        const xHoy = xs(HOY)
        const yMid = yP + pista / 2
        const bloque = fN * 1.25 + 2 * R_P * u + 18 * u + fR * 1.2
        const yN = yMid - bloque / 2
        // la llave, debajo del renglón de las zonas; su rótulo, debajo del pico
        const yLl = yP + 12 * u + fR * 1.2 + 6 * u
        const ultimo = i === carriles.length - 1
        return (
          <g key={i}>
            {/* nombre de la rama y su de cada 100 */}
            <text x={0} y={yN} fontSize={fN} fontWeight={700} fill={INK} dominantBaseline="hanging">{c.nombre}</text>
            <Puntos u={u} x={0} y={yN + fN * 1.25 + R_P * u + 4 * u} valor={c.pot} />
            <text x={0} y={yN + fN * 1.25 + 2 * R_P * u + 18 * u} fontSize={fR} fill={INK}
                  dominantBaseline="hanging">{veces(c.pot)}</text>

            {/* zonas */}
            <rect x={xA} y={yP} width={xU - xA} height={pista} fill={REALCE} />
            <rect x={xU} y={yP} width={xB - xU} height={pista} fill={PISTA} />
            <rect x={xU} y={yP} width={xB - xU} height={pista} fill={PISTA} />
            <text x={xU - gap} y={yP + 12 * u} fontSize={fR} fontWeight={600} fill={INK} textAnchor="end"
                  dominantBaseline="hanging">{B.no_pasa}</text>
            <text x={(xU + xB) / 2} y={yP + 12 * u} fontSize={fR} fontWeight={600} fill={INK} textAnchor="middle"
                  dominantBaseline="hanging">{B.pasa}</text>

            {/* lo observado */}
            <rect x={xA} y={yP} width={xHoy - xA} height={pista} fill={ACC} />
            <Pastilla u={u} x={xHoy} y={yTop} texto={conUnidad(HOY)} fill={ACC} f={fP} min={xA} max={w} />

            {/* umbral */}
            <Umbral u={u} x1={xU} x2={xU} y1={yTop + hPill - 8 * u} y2={yE} />
            <Pastilla u={u} x={xU} y={yTop} texto={conUnidad(c.umbral)} fill={INK} f={fP} min={xA} max={w} />

            {/* lo que falta: llave de lo observado al umbral, con su rótulo en cada carril (cada uno se lee solo) */}
            <LlaveH u={u} x1={xHoy + 4 * u} x2={xU - 4 * u} y={yLl} lado="abajo" />
            <text x={(xHoy + xU) / 2} y={yLl + 12 * u} fontSize={fR} fontWeight={600} fill={INK}
                  textAnchor="middle" dominantBaseline="hanging">{B.llave}</text>

            <EjeX u={u} x0={xA} x1={xB} y={yE} min={0} max={TOPE} marcas={ESC.marcas} formato={(v) => fijo(v)}
                  titulo={ultimo ? B.eje : undefined} />
          </g>
        )
      })}
    </svg>
  )
}

export default function V09Umbral() {
  const Dibujo = variante(ID) === 'b' ? DibujoB : DibujoA
  return (
    <Vista id={ID} hibrido
           items={[
             { clave: 'con', valor: fijo(CON, 2) },
             { clave: 'sin', valor: fijo(SIN, 2) },
             { clave: 'hoy', valor: fijo(Math.ceil(HOY)) },
           ]}
           cifras={[fijo(HOY, 2)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
