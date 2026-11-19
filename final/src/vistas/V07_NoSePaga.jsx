// V07 · No se paga (economía, Juan Manuel R.). El costo del primer año con la regla (G39, piloto mínimo más producción
// completa) contra lo que deja la lista en un año (G54). En la banda, el ROI de la regla (G54.roi) y, en la subfila, el
// del modelo (G40.roi) (decisión CH-05).
// (18/11, fase 8, spec V07: «no se entiende qué son las cajas, falta leyenda y se podría repartir más rectangularmente»)
//   a  Cuadrícula de 25 × 4 a todo el ancho (20 × 5 en ventanas más altas): los 100 cuadros son el costo del primer año
//      y lo lleno en ACC, lo que deja la lista en un año (100 × G54 / G39 cuadros, desde arriba a la izquierda; el último,
//      parcial por ancho). Arriba, a la izquierda, el rótulo de lo que deja, con una llave chica sobre lo lleno y su guía;
//      a la derecha, la leyenda (qué vale un cuadro, qué es el gris y qué es el azul). Abajo, una llave de punta a punta
//      con el costo del primer año.
//   b  Dos áreas a escala: un rectángulo a todo el ancho (el costo del primer año) y, en su esquina superior izquierda,
//      otro con la misma proporción de lados y un área de G54 / G39 la del grande (lo que deja la lista). Arriba y abajo,
//      lo mismo que en a: el rótulo de lo que deja con su guía, la leyenda y la llave del costo.
//      (Revisión: la b era un cuadrado en el centro, la misma composición que el intermedio objetado; ahora reparte a lo
//      ancho como pidió el usuario.)
// Las cifras son las de la conclusión (usd con 0 decimales). Ninguna cifra nueva: los cuadros y las áreas son proporción.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import { pctDirecto, usd } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, Guia, Leyenda, LlaveH, TRAZO, anchoLeyenda, ancho, tam, useU } from '../svg.jsx'

const ID = 'V07'
const A = DF.anclas
const X = textosDe(ID)
const DEJA = A.G54.valor
const COSTO = A.G39.valor
/** Lo que deja la lista, en centésimas del costo del primer año (cuadros llenos de la versión a). */
const LLENOS = (100 * DEJA) / COSTO
const T_DEJA = usd(DEJA, 0)
const T_COSTO = usd(COSTO, 0)

export const meta = { id: ID }

/** El rótulo de una cifra en dos renglones (nombre arriba, cifra abajo), con el borde superior en y. Devuelve el alto. */
function altoRotulo(u) {
  return tam('cat', u) * 1.3 + tam('valFoco', u) * 1.05
}
function Rotulo({ u, x, y, nombre, cifra }) {
  const fN = tam('cat', u)
  const fC = tam('valFoco', u)
  return (
    <g>
      <text x={x} y={y + fN * 0.8} fontSize={fN} fontWeight={600} fill={INK}>{nombre}</text>
      <text x={x} y={y + fN * 1.3 + fC * 0.8} fontSize={fC} fontWeight={700} fill={INK}>{cifra}</text>
    </g>
  )
}

/** La leyenda en dos renglones, alineada a la izquierda en x: arriba, qué vale una forma (texto en CTX 600, como el
 *  título de un eje); abajo, las muestras del gris y del azul. Su ancho, con anchoLeyenda2. */
const F_LEY = 24
function anchoLeyenda2(u, nota, items) {
  return Math.max(ancho(nota, tam(F_LEY, u), 600), anchoLeyenda(u, items, F_LEY))
}
const altoLeyenda2 = (u) => tam(F_LEY, u) * 1.5 * 2
function Leyenda2({ u, x, y, nota, items }) {
  const f = tam(F_LEY, u)
  return (
    <g>
      <text x={x} y={y + f * 0.75} fontSize={f} fontWeight={600} fill={CTX} dominantBaseline="central">{nota}</text>
      <Leyenda u={u} x={x} y={y + f * 1.5 + f * 0.75} items={items} f={F_LEY} />
    </g>
  )
}

// ---------------------------------------------------------------- lo común: arriba el rótulo y la leyenda, abajo el costo

const GUIA = 42                                               // del rótulo al dibujo: la guía
const Y_LLAVE = 18                                            // del dibujo a la llave del costo
const altoArriba = (u) => Math.max(altoRotulo(u), altoLeyenda2(u))
const altoAbajo = (u) => (Y_LLAVE + 8 + 16) * u + tam('valFoco', u)

/** Arriba del dibujo (de x1 a x2, desde y): el rótulo de lo que deja a la izquierda y la leyenda a la derecha. La
 *  leyenda sube 6 u para que sus dos renglones queden a la altura de los dos del rótulo. */
function Arriba({ u, x1, x2, y, nombre, nota, items }) {
  return (
    <g>
      <Rotulo u={u} x={x1} y={y} nombre={nombre} cifra={T_DEJA} />
      <Leyenda2 u={u} x={x2 - anchoLeyenda2(u, nota, items)} y={y - 6 * u} nota={nota} items={items} />
    </g>
  )
}

/** Abajo del dibujo: la llave de punta a punta (x1 a x2, en y) y, centrado debajo de su pico, el costo del primer año
 *  (nombre en CTX y cifra en tinta, en un renglón). */
function Costo({ u, x1, x2, y, nombre }) {
  const fCat = tam('cat', u)
  const fVal = tam('valFoco', u)
  const wNom = ancho(nombre, fCat, 400)
  const wCif = ancho(T_COSTO, fVal, 700)
  const sep = 16 * u
  const x = (x1 + x2) / 2 - (wNom + sep + wCif) / 2
  const yT = y + 8 * u + 16 * u + fVal * 0.8
  return (
    <g>
      <LlaveH u={u} x1={x1} x2={x2} y={y} lado="abajo" />
      <text x={x} y={yT} fontSize={fCat} fill={CTX}>{nombre}</text>
      <text x={x + wNom + sep} y={yT} fontSize={fVal} fontWeight={700} fill={INK}>{T_COSTO}</text>
    </g>
  )
}

// ---------------------------------------------------------------- a: cuadrícula de 25 × 4 (o 20 × 5)

/** Las dos formas de la cuadrícula de 100 cuadros. Va 25 × 4 (a todo el ancho en 16:9); 20 × 5 solo si da cuadros un
 *  10 % más grandes (ventanas más altas, como 4:3). */
const FORMAS = [[25, 4], [20, 5]]

function Cuadricula({ w, h }) {
  const u = useU()
  const C = X.cuadros
  const gap = 8 * u
  const r = TRAZO.radio * u
  const items = [{ marca: 'contexto', texto: C.gris }, { marca: 'hecho', texto: C.azul }]
  const arriba = altoArriba(u)
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
  // una llave chica abarca lo lleno (el primer cuadro entero y la parte del segundo) y la guía sube de su pico al rótulo
  const nLlenos = Math.floor(LLENOS)
  const xFinAzul = xG + nLlenos * (s + gap) + (LLENOS - nLlenos) * s
  const xGuia = (xG + xFinAzul) / 2
  const yLlaveChica = yG - 12 * u
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${C.azul}: ${T_DEJA} · ${C.costo}: ${T_COSTO}`}</title>
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
      <Arriba u={u} x1={xG} x2={xG + gw} y={y0} nombre={C.deja} nota={C.cuadro} items={items} />
      {/* lo que deja la lista: llave chica sobre lo lleno y guía hasta el rótulo */}
      <LlaveH u={u} x1={xG} x2={xFinAzul} y={yLlaveChica} lado="arriba" />
      <Guia u={u} x1={xGuia} y1={y0 + altoRotulo(u) + 6 * u} x2={xGuia} y2={yLlaveChica - 8 * u} />
      {/* el costo del primer año: los 100 cuadros, con la llave de punta a punta */}
      <Costo u={u} x1={xG} x2={xG + gw} y={yG + gh + Y_LLAVE * u} nombre={C.costo} />
    </svg>
  )
}

// ---------------------------------------------------------------- b: dos áreas a escala, a lo ancho

function Areas({ w, h }) {
  const u = useU()
  const R = X.areas
  const r = TRAZO.radio * u
  const items = [{ marca: 'contexto', texto: R.gris }, { marca: 'hecho', texto: R.azul }]
  const arriba = altoArriba(u)
  const guia = GUIA * u
  const abajo = altoAbajo(u)
  // el rectángulo del costo: a todo el ancho; su alto, lo que deje el resto (el dibujo, a lo sumo el 90 % del lienzo),
  // y nunca más de la mitad del ancho, para que siga siendo un rectángulo apaisado
  const W = w
  const H = Math.max(60 * u, Math.min(0.9 * h - arriba - guia - abajo, W / 2))
  const total = arriba + guia + H + abajo
  const y0 = Math.max(0, (h - total) / 2)
  const xR = (w - W) / 2
  const yR = y0 + arriba + guia
  // lo que deja: la misma proporción de lados, con un área de DEJA / COSTO la del grande
  const k = Math.sqrt(DEJA / COSTO)
  const ws = W * k
  const hs = H * k
  const xGuia = xR + ws / 2
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${R.azul}: ${T_DEJA} · ${R.costo}: ${T_COSTO}`}</title>
      <rect x={xR} y={yR} width={W} height={H} rx={r} fill={FIN_GRIS} />
      <rect x={xR} y={yR} width={ws} height={hs} rx={r} fill={ACC} />
      <Arriba u={u} x1={xR} x2={xR + W} y={y0} nombre={R.deja} nota={R.escala} items={items} />
      {/* lo que deja la lista: guía del rótulo al rectángulo chico */}
      <Guia u={u} x1={xGuia} y1={y0 + altoRotulo(u) + 6 * u} x2={xGuia} y2={yR - 6 * u} />
      {/* el costo del primer año: el rectángulo grande entero, con la llave de punta a punta */}
      <Costo u={u} x1={xR} x2={xR + W} y={yR + H + Y_LLAVE * u} nombre={R.costo} />
    </svg>
  )
}

export default function V07NoSePaga() {
  const Dibujo = variante(ID) === 'b' ? Areas : Cuadricula
  return (
    <Vista id={ID}
           items={[
             { clave: 'roi', valor: pctDirecto(A['G54.roi'].valor, 1) },
             { clave: 'roi_modelo', valor: pctDirecto(A['G40.roi'].valor, 1) },
           ]}
           cifras={[T_COSTO, T_DEJA]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
