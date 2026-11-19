// V09 · Cuándo pasa (economía, Juan Manuel R.). (18/11, fase 8, spec V09) Rehecha como escala con eje y zonas.
// (19/11, fase 9, spec V09: versión a, «devuelta decluttea») Una escala de diferencia de cruce de 0 a 14 puntos (EjeX,
// marcas cada 2, título con unidad) con tres zonas de fondo, más oscuras cuantas más ramas pasan, cada una con un rótulo
// corto (ninguna, una, las dos). Va hasta 14 y no hasta 12 para que la bandera del umbral con descuento entre a la derecha
// de su línea. Los dos umbrales (G67) son líneas en tinta con su bandera: rótulo y valor; la del umbral sin descuento
// mira a la izquierda y la del umbral con descuento a la derecha, así ninguna línea cruza un rótulo. Lo observado
// (G62.tasa_observada) es la barra en ACC con su asta y su bandera, y la llave (LlaveH, sin cifra) marca lo que falta
// hasta el primer umbral. Salieron los círculos «de cada 100» (G68) y su leyenda: están en la 23.6 del informe.
// Pasos (las notas de la vista): 1, la escala con las zonas y los dos umbrales; 2, lo observado; 3, lo que falta.
// La banda lleva solo el umbral de pase (11,04); la conclusión (0,79 puntos) no cambia.
// (19/11, revisión) La barra de lo observado va oculta en el paso 1 (atenuada parecía una zona más); el título del eje
// pierde la fórmula; la pista llega a 500 u para que en 4:3 el dibujo no quede en el 60 % del alto.
// (19/11, fase 10, spec V09: «boceto: lo observado y la llave, sin rótulo hasta su paso») Lo observado deja de ir oculto:
// su boceto es el contorno de la barra y el asta, sin bandera; en el paso 2 la barra llena crece desde el 0 dentro del
// contorno (Anima crece-x, 600 ms). La llave sigue en boceto hasta el paso 3, sin su rótulo (lo resuelve Paso).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import {
  ACC, CTX, INK, PISTA, REALCE, TRAZO, Anima, EjeX, LlaveH, Paso, Umbral, altoEjeX, ancho, envolver, tam, useU,
} from '../svg.jsx'
import { fijo } from '../../../e3/src/formato.js'

const ID = 'V09'
const A = DF.anclas
const B = textosDe(ID).barras
const HOY = A['G62.tasa_observada'].valor
const SIN = A['G67.sin_descuento'].valor
const CON = A['G67.con_descuento'].valor
// 0 a 14 con marcas cada 2: el umbral más alto (11,04) y un tramo de aire para su bandera
const PASO_ESC = 2
const TOPE = (Math.ceil(CON / PASO_ESC) + 1) * PASO_ESC
const MARCAS = Array.from({ length: TOPE / PASO_ESC + 1 }, (_, i) => i * PASO_ESC)

export const meta = { id: ID, pasos: 3 }

const LLENA = 0.8
const EJE_F = 23 // letra de los números del eje (la de EjeX), para reservar su medio ancho en los bordes

const conUnidad = (v) => `${fijo(v, 2)} ${B.unidad}`

/** Bandera de un valor: rótulo (CTX 600) y valor (INK 700). (x, y): el borde superior y el lado del asta; anchor
 *  'start' (a la derecha del asta) o 'end'. */
function Bandera({ x, y, rotulo, valor, anchor = 'start', m }) {
  return (
    <g>
      <text x={x} y={y} fontSize={m.fR} fontWeight={600} fill={CTX} textAnchor={anchor}
            dominantBaseline="hanging">{rotulo}</text>
      <text x={x} y={y + m.hL1} fontSize={m.fV} fontWeight={700} fill={INK} textAnchor={anchor}
            dominantBaseline="hanging">{valor}</text>
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const fR = tam(24, u)
  const fV = tam('valFoco', u)
  const gap = 14 * u
  const sC = TRAZO.contorno * u // trazo del contorno de la barra de lo observado (su boceto)
  const m = { fR, fV, hL1: fR * 1.3 }
  const altoBandera = m.hL1 + fV * 1.15
  const anchoBandera = (rot, val) => Math.max(ancho(rot, fR, 600), ancho(val, fV, 700))
  const wCon = anchoBandera(B.con, conUnidad(CON))

  // horizontal: el 0 en x0; el tope donde entra la bandera del umbral con descuento a la derecha de su línea
  const fEje = EJE_F * u
  const x0 = ancho(fijo(0), fEje) / 2 + 4 * u
  const finEje = w - ancho(fijo(TOPE), fEje) / 2 - 4 * u
  const L = Math.min(finEje - x0, ((w - 4 * u - wCon - gap - x0) * TOPE) / CON)
  const xs = (v) => x0 + (v / TOPE) * L
  const x1 = xs(TOPE)
  const xHoy = xs(HOY)

  // vertical: el renglón de las banderas, la escala (zonas) y el eje
  const hEje = altoEjeX(u)
  const arriba = altoBandera + 24 * u
  const pista = Math.min(500 * u, Math.max(150 * u, LLENA * h - arriba - hEje))
  const total = arriba + pista + hEje
  const y0 = Math.max(0, (h - total) / 2)
  const yBan = y0
  const yP = y0 + arriba
  const yE = yP + pista

  // zonas: desde, hasta, capas de gris (más oscura cuantas más ramas pasan) y rótulo
  const zonas = [
    { a: 0, b: SIN, capas: [REALCE], rot: B.zona_no },
    { a: SIN, b: CON, capas: [PISTA, REALCE], rot: B.zona_una },
    { a: CON, b: TOPE, capas: [PISTA, PISTA, REALCE], rot: B.zona_dos },
  ]
  // la llave: de lo observado al primer umbral, un poco debajo de la mitad de la pista; su rótulo encima del pico
  const yLl = yP + pista * 0.58
  const xLl = (xHoy + xs(SIN)) / 2

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${B.hoy}: ${conUnidad(HOY)} · ${B.sin}: ${conUnidad(SIN)} · ${B.con}: ${conUnidad(CON)}`}</title>

      {/* paso 1: la escala, sus zonas y los dos umbrales */}
      {zonas.map((z, i) => z.capas.map((c, k) => (
        <rect key={`${i}-${k}`} x={xs(z.a)} y={yP} width={xs(z.b) - xs(z.a)} height={pista} fill={c} />
      )))}
      {zonas.map((z, i) => {
        // la primera zona se rotula después de la barra de lo observado
        const xa = i === 0 ? xHoy + gap : xs(z.a) + gap
        const lineas = envolver(z.rot, xs(z.b) - xa - gap * 0.6, fR, 600)
        return lineas.map((l, k) => (
          <text key={`${i}-${k}`} x={xa} y={yP + 14 * u + k * fR * 1.2} fontSize={fR} fontWeight={600} fill={INK}
                dominantBaseline="hanging">{l}</text>
        ))
      })}
      <Umbral u={u} x1={xs(SIN)} x2={xs(SIN)} y1={yBan} y2={yE} />
      <Umbral u={u} x1={xs(CON)} x2={xs(CON)} y1={yBan} y2={yE} />
      <Bandera x={xs(SIN) - gap} y={yBan} rotulo={B.sin} valor={conUnidad(SIN)} anchor="end" m={m} />
      <Bandera x={xs(CON) + gap} y={yBan} rotulo={B.con} valor={conUnidad(CON)} m={m} />
      <EjeX u={u} x0={x0} x1={x1} y={yE} min={0} max={TOPE} marcas={MARCAS} formato={(v) => fijo(v)} titulo={B.eje} />

      {/* paso 2: lo observado, barra en ACC de 0 a su valor y asta hasta su bandera. Boceto antes de su paso: el
          contorno de la barra y el asta, sin bandera (la barra llena, atenuada, se leía como otra zona). El contorno va
          hacia adentro, así la barra llena lo tapa entero; al llegar el paso, la barra crece desde el 0 dentro de él */}
      <Paso n={2}>
        <rect x={x0 + sC / 2} y={yP + sC / 2} width={Math.max(0, xHoy - x0 - sC)} height={pista - sC} fill="none"
              stroke={ACC} strokeWidth={sC} />
        <Umbral u={u} x1={xHoy - (TRAZO.umbral * u) / 2} x2={xHoy - (TRAZO.umbral * u) / 2} y1={yBan} y2={yP}
                color={ACC} />
        <Bandera x={xHoy + gap} y={yBan} rotulo={B.hoy} valor={conUnidad(HOY)} m={m} />
      </Paso>
      <Paso n={2} oculto entrada={false}>
        <Anima n={2} efecto="crece-x" dur={600}>
          <rect x={x0} y={yP} width={xHoy - x0} height={pista} fill={ACC} />
        </Anima>
      </Paso>

      {/* paso 3: lo que falta, llave de lo observado al primer umbral */}
      <Paso n={3}>
        <LlaveH u={u} x1={xHoy + 4 * u} x2={xs(SIN) - 4 * u} y={yLl} lado="arriba" />
        <text x={xLl} y={yLl - 18 * u} fontSize={fR} fontWeight={600} fill={INK} textAnchor="middle">{B.llave}</text>
      </Paso>
    </svg>
  )
}

export default function V09Umbral() {
  return (
    <Vista id={ID} items={[{ clave: 'con', valor: fijo(CON, 2) }]} cifras={[fijo(HOY, 2)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
