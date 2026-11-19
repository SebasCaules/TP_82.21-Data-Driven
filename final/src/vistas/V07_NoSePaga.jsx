// V07 · No se paga (economía, Juan Manuel R.). El costo del primer año con la regla (G39, piloto mínimo más producción
// completa) contra lo que deja la lista en un año (G54). En la banda, solo el ROI de la regla (G54.roi) (decisión CH-05).
// (18/11, fase 8, spec V07: «no se entiende qué son las cajas, falta leyenda y se podría repartir más rectangularmente»)
// (19/11, fase 9, spec 4: el usuario eligió la cuadrícula; leyenda en un renglón corto y nada más que los 100 cuadros, lo
// que deja la lista y el costo. Salen la versión b, la subfila del ROI del modelo y los renglones del gris y del azul:
// cada color ya lleva su rótulo directo.)
//
// Cuadrícula de 25 × 4 a todo el ancho (20 × 5 en ventanas más altas): los 100 cuadros son el costo del primer año y lo
// lleno en ACC, lo que deja la lista en un año (100 × G54 / G39 cuadros, desde arriba a la izquierda; el último, parcial
// por ancho). Arriba a la izquierda, el rótulo de lo que deja, con una llave chica sobre lo lleno y su guía; a la derecha,
// la leyenda de un renglón (qué vale un cuadro). Abajo, una llave de punta a punta con el costo del primer año.
// Pasos: 1, los 100 cuadros con el costo; 2, lo que deja la lista (lo lleno, oculto antes porque se superpone a los
// cuadros grises, y su rótulo, atenuado antes).
// Las cifras son las de la conclusión (usd con 0 decimales). Ninguna cifra nueva: los cuadros son proporción.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pctDirecto, usd } from '../../../e3/src/formato.js'
import { ACC, FIN_GRIS, INK, Guia, Leyenda, LlaveH, Paso, TRAZO, ancho, tam, useU } from '../svg.jsx'

const ID = 'V07'
const A = DF.anclas
const X = textosDe(ID)
const DEJA = A.G54.valor
const COSTO = A.G39.valor
/** Lo que deja la lista, en centésimas del costo del primer año (cuadros llenos). */
const LLENOS = (100 * DEJA) / COSTO
const T_DEJA = usd(DEJA, 0)
const T_COSTO = usd(COSTO, 0)

export const meta = { id: ID, pasos: 2 }

// Los dos rótulos llevan el mismo trato: nombre en tinta 600 (cat) y cifra en tinta 700 (valFoco).
const fNom = (u) => tam('cat', u)
const fCif = (u) => tam('valFoco', u)

/** Alto del rótulo de lo que deja (nombre arriba, cifra abajo). */
const altoRotulo = (u) => fNom(u) * 1.3 + fCif(u) * 1.05

/** El rótulo de lo que deja, en dos renglones, con el borde superior en y. */
function Rotulo({ u, x, y, nombre, cifra }) {
  return (
    <g>
      <text x={x} y={y + fNom(u) * 0.8} fontSize={fNom(u)} fontWeight={600} fill={INK}>{nombre}</text>
      <text x={x} y={y + fNom(u) * 1.3 + fCif(u) * 0.8} fontSize={fCif(u)} fontWeight={700} fill={INK}>{cifra}</text>
    </g>
  )
}

const GUIA = 42                                               // del rótulo al dibujo: la guía
const Y_LLAVE = 18                                            // del dibujo a la llave del costo
const altoAbajo = (u) => (Y_LLAVE + 8 + 16) * u + fCif(u)

/** Abajo del dibujo: la llave de punta a punta (x1 a x2, en y) y, centrado debajo de su pico, el costo del primer año
 *  (nombre y cifra en un renglón). */
function Costo({ u, x1, x2, y, nombre }) {
  const wNom = ancho(nombre, fNom(u), 600)
  const wCif = ancho(T_COSTO, fCif(u), 700)
  const sep = 16 * u
  const x = (x1 + x2) / 2 - (wNom + sep + wCif) / 2
  const yT = y + 8 * u + 16 * u + fCif(u) * 0.8
  return (
    <g>
      <LlaveH u={u} x1={x1} x2={x2} y={y} lado="abajo" />
      <text x={x} y={yT} fontSize={fNom(u)} fontWeight={600} fill={INK}>{nombre}</text>
      <text x={x + wNom + sep} y={yT} fontSize={fCif(u)} fontWeight={700} fill={INK}>{T_COSTO}</text>
    </g>
  )
}

/** Las dos formas de la cuadrícula de 100 cuadros. Va 25 × 4 (a todo el ancho en 16:9); 20 × 5 solo si da cuadros un
 *  10 % más grandes (ventanas más altas). */
const FORMAS = [[25, 4], [20, 5]]

function Cuadricula({ w, h }) {
  const u = useU()
  const C = X.cuadros
  const gap = 8 * u
  const r = TRAZO.radio * u
  const arriba = altoRotulo(u)
  const guia = GUIA * u
  const abajo = altoAbajo(u)
  // el lado del cuadro: a todo el ancho, salvo que el alto no alcance (el dibujo, a lo sumo el 90 % del lienzo)
  const disp = 0.9 * h - arriba - guia - abajo
  const lado = ([c, f]) => Math.max(12 * u, Math.min((w - (c - 1) * gap) / c, (disp - (f - 1) * gap) / f))
  const [COLS, FILAS] = lado(FORMAS[1]) > 1.1 * lado(FORMAS[0]) ? FORMAS[1] : FORMAS[0]
  const s = lado([COLS, FILAS])
  const gw = COLS * s + (COLS - 1) * gap
  const gh = FILAS * s + (FILAS - 1) * gap
  const total = arriba + guia + gh + abajo
  const y0 = Math.max(0, (h - total) / 2)
  const xG = (w - gw) / 2
  const yG = y0 + arriba + guia
  const cuadros = Array.from({ length: COLS * FILAS }, (_, i) => ({
    i,
    x: xG + (i % COLS) * (s + gap),
    y: yG + Math.floor(i / COLS) * (s + gap),
    parte: Math.max(0, Math.min(1, LLENOS - i)),
  }))
  const llenos = cuadros.filter((c) => c.parte > 0)
  // una llave chica abarca lo lleno (el primer cuadro entero y la parte del segundo) y la guía sube de su pico al rótulo
  const nLlenos = Math.floor(LLENOS)
  const xFinAzul = xG + nLlenos * (s + gap) + (LLENOS - nLlenos) * s
  const xGuia = (xG + xFinAzul) / 2
  const yLlaveChica = yG - 12 * u
  // la leyenda, a la derecha, a la altura de la cifra del rótulo
  const yLeyenda = y0 + fNom(u) * 1.3 + fCif(u) * 0.5
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${C.deja}: ${T_DEJA} · ${C.costo}: ${T_COSTO}`}</title>
      <defs>
        {llenos.filter((c) => c.parte < 1).map((c) => (
          <clipPath key={c.i} id={`v07-c${c.i}`}>
            <rect x={c.x} y={c.y} width={s} height={s} rx={r} />
          </clipPath>
        ))}
      </defs>
      {/* paso 1: los 100 cuadros son el costo del primer año, con la llave de punta a punta y la leyenda */}
      {cuadros.map((c) => (
        <rect key={c.i} x={c.x} y={c.y} width={s} height={s} rx={r} fill={FIN_GRIS} />
      ))}
      <Costo u={u} x1={xG} x2={xG + gw} y={yG + gh + Y_LLAVE * u} nombre={C.costo} />
      <Leyenda u={u} x={xG + gw} y={yLeyenda} anchor="end" items={[{ marca: 'contexto', texto: C.cuadro }]} />
      {/* paso 2: lo que deja la lista, lleno en ACC sobre los cuadros grises, y su rótulo con la llave chica */}
      <Paso n={2} oculto>
        {llenos.map((c) => (c.parte >= 1
          ? <rect key={c.i} x={c.x} y={c.y} width={s} height={s} rx={r} fill={ACC} />
          : <rect key={c.i} x={c.x} y={c.y} width={s * c.parte} height={s} fill={ACC} clipPath={`url(#v07-c${c.i})`} />))}
      </Paso>
      <Paso n={2}>
        <Rotulo u={u} x={xG} y={y0} nombre={C.deja} cifra={T_DEJA} />
        <LlaveH u={u} x1={xG} x2={xFinAzul} y={yLlaveChica} lado="arriba" />
        <Guia u={u} x1={xGuia} y1={y0 + altoRotulo(u) + 6 * u} x2={xGuia} y2={yLlaveChica - 8 * u} />
      </Paso>
    </svg>
  )
}

export default function V07NoSePaga() {
  return (
    <Vista id={ID}
           items={[{ clave: 'roi', valor: pctDirecto(A['G54.roi'].valor, 1) }]}
           cifras={[T_COSTO, T_DEJA]}>
      {({ w, h }) => <Cuadricula w={w} h={h} />}
    </Vista>
  )
}
