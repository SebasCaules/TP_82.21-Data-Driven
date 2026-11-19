// V07 · No se paga (economía, Juan Manuel R.). El costo del primer año con la regla (G39, piloto mínimo más producción
// completa) contra lo que deja la lista en un año (G54). En la banda, el ROI de la regla (G54.roi) y, en la subfila, el
// del modelo (G40.roi) (decisión CH-05).
// (18/11, fase 8, spec V07: «no se entiende qué son las cajas, falta leyenda y se podría repartir más rectangularmente»)
//   a  Cuadrícula de 25 × 4 a todo el ancho (20 × 5 en ventanas más altas): los 100 cuadros son el costo del primer año
//      y lo lleno en ACC, lo que deja la lista en un año (100 × G54 / G39 cuadros, desde arriba a la izquierda; el último,
//      parcial por ancho). Arriba, a la izquierda, el rótulo de lo que deja, con una llave chica sobre lo lleno y su guía;
//      a la derecha, la leyenda (qué vale un cuadro, qué es el gris y qué es el azul). Abajo, una llave de punta a punta
//      con el costo del primer año.
//   b  Dos áreas a escala: un cuadrado grande (el costo del primer año) y, en su esquina superior izquierda, uno chico
//      con un área de G54 / G39 la del grande (lo que deja la lista). El rótulo de lo que deja, a la izquierda del chico
//      con su guía; el costo, colgado de una llave a la derecha del grande; la leyenda, arriba.
// Las cifras son las de la conclusión (usd con 0 decimales). Ninguna cifra nueva: los cuadros y las áreas son proporción.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import { pctDirecto, usd } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, Guia, Leyenda, Llave, LlaveH, TRAZO, anchoLeyenda, ancho, tam, useU } from '../svg.jsx'

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
function Rotulo({ u, x, y, nombre, cifra, anchor = 'start', colorNombre = INK, pesoNombre = 600 }) {
  const fN = tam('cat', u)
  const fC = tam('valFoco', u)
  return (
    <g>
      <text x={x} y={y + fN * 0.8} fontSize={fN} fontWeight={pesoNombre} fill={colorNombre} textAnchor={anchor}>{nombre}</text>
      <text x={x} y={y + fN * 1.3 + fC * 0.8} fontSize={fC} fontWeight={700} fill={INK} textAnchor={anchor}>{cifra}</text>
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

// ---------------------------------------------------------------- a: cuadrícula de 25 × 4 (o 20 × 5)

/** Las dos formas de la cuadrícula de 100 cuadros. Va 25 × 4 (a todo el ancho en 16:9); 20 × 5 solo si da cuadros un
 *  10 % más grandes (ventanas más altas, como 4:3). */
const FORMAS = [[25, 4], [20, 5]]

function Cuadricula({ w, h }) {
  const u = useU()
  const C = X.cuadros
  const gap = 8 * u
  const r = TRAZO.radio * u
  const fCat = tam('cat', u)
  const fVal = tam('valFoco', u)
  const items = [{ marca: 'contexto', texto: C.gris }, { marca: 'hecho', texto: C.azul }]
  const wLey = anchoLeyenda2(u, C.cuadro, items)
  const altoArriba = Math.max(altoRotulo(u), altoLeyenda2(u))
  const guia = 42 * u                                         // del rótulo a la cuadrícula: guía y llave chica
  const yLlave = 18 * u                                       // de la cuadrícula a la llave
  const altoAbajo = yLlave + 8 * u + 16 * u + fVal
  // el lado del cuadro: a todo el ancho, salvo que el alto no alcance (el dibujo, a lo sumo el 90 % del lienzo)
  const disp = 0.9 * h - altoArriba - guia - altoAbajo
  const lado = ([c, f]) => Math.max(12 * u, Math.min((w - (c - 1) * gap) / c, (disp - (f - 1) * gap) / f))
  const [COLS, FILAS] = lado(FORMAS[1]) > 1.1 * lado(FORMAS[0]) ? FORMAS[1] : FORMAS[0]
  const s = lado([COLS, FILAS])
  const gw = COLS * s + (COLS - 1) * gap
  const gh = FILAS * s + (FILAS - 1) * gap
  const total = altoArriba + guia + gh + altoAbajo
  const y0 = Math.max(0, (h - total) / 2)
  const xG = (w - gw) / 2
  const yG = y0 + altoArriba + guia
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
  const yL = yG + gh + yLlave
  // el costo, centrado debajo del pico de la llave: nombre en CTX y cifra en tinta, en un renglón
  const wNom = ancho(C.costo, fCat, 400)
  const wCif = ancho(T_COSTO, fVal, 700)
  const sep = 16 * u
  const xCosto = xG + gw / 2 - (wNom + sep + wCif) / 2
  const yCosto = yL + 8 * u + 16 * u + fVal * 0.8
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
      {/* lo que deja la lista, arriba a la izquierda: llave chica sobre lo lleno y guía hasta el rótulo */}
      <Rotulo u={u} x={xG} y={y0} nombre={C.deja} cifra={T_DEJA} />
      <LlaveH u={u} x1={xG} x2={xFinAzul} y={yLlaveChica} lado="arriba" />
      <Guia u={u} x1={xGuia} y1={y0 + altoRotulo(u) + 6 * u} x2={xGuia} y2={yLlaveChica - 8 * u} />
      {/* la leyenda, arriba a la derecha */}
      <Leyenda2 u={u} x={xG + gw - wLey} y={y0} nota={C.cuadro} items={items} />
      {/* el costo del primer año: los 100 cuadros, con la llave de punta a punta */}
      <LlaveH u={u} x1={xG} x2={xG + gw} y={yL} lado="abajo" />
      <text x={xCosto} y={yCosto} fontSize={fCat} fill={CTX}>{C.costo}</text>
      <text x={xCosto + wNom + sep} y={yCosto} fontSize={fVal} fontWeight={700} fill={INK}>{T_COSTO}</text>
    </svg>
  )
}

// ---------------------------------------------------------------- b: dos áreas a escala

function Areas({ w, h }) {
  const u = useU()
  const R = X.areas
  const r = TRAZO.radio * u
  const fCat = tam('cat', u)
  const fVal = tam('valFoco', u)
  const items = [{ marca: 'contexto', texto: R.gris }, { marca: 'hecho', texto: R.azul }]
  // tres columnas: el rótulo de lo que deja (a la izquierda del rectángulo chico), el cuadrado grande, y la llave con
  // el costo; la leyenda va arriba, sobre el cuadrado y la columna del costo
  const colIzq = Math.max(ancho(R.deja, fCat, 600), ancho(T_DEJA, fVal, 700))
  const hIzq = 36 * u
  const colDer = 16 * u + 16 * u + 16 * u + Math.max(ancho(R.costo, fCat, 400), ancho(T_COSTO, fVal, 700))
  const wLey = anchoLeyenda2(u, R.escala, items)
  const altoArriba = altoLeyenda2(u)
  const hArriba = 28 * u
  const lado = Math.max(40 * u, Math.min(0.9 * h - altoArriba - hArriba, w - colIzq - hIzq - colDer))
  const anchoTotal = colIzq + hIzq + Math.max(lado + colDer, wLey)
  const x0 = Math.max(0, (w - anchoTotal) / 2)
  const xR = x0 + colIzq + hIzq
  const total = altoArriba + hArriba + lado
  const y0 = Math.max(0, (h - total) / 2)
  const yR = y0 + altoArriba + hArriba
  // lo que deja: un cuadrado en la esquina, con un área de DEJA / COSTO la del grande
  const ls = lado * Math.sqrt(DEJA / COSTO)
  const xLlave = xR + lado + 16 * u
  const xDer = xLlave + 32 * u
  const yChico = yR + ls / 2
  const yRot = Math.max(y0 + altoArriba + 6 * u, yChico - altoRotulo(u) / 2)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${R.azul}: ${T_DEJA} · ${R.costo}: ${T_COSTO}`}</title>
      <rect x={xR} y={yR} width={lado} height={lado} rx={r} fill={FIN_GRIS} />
      <rect x={xR} y={yR} width={ls} height={ls} rx={r} fill={ACC} />
      {/* la leyenda, arriba, desde el borde izquierdo del cuadrado grande */}
      <Leyenda2 u={u} x={xR} y={y0} nota={R.escala} items={items} />
      {/* lo que deja la lista, a la izquierda del cuadrado chico, con su guía */}
      <Rotulo u={u} x={xR - hIzq} y={yRot} nombre={R.deja} cifra={T_DEJA} anchor="end" />
      <Guia u={u} x1={xR - hIzq + 10 * u} y1={yChico} x2={xR - 4 * u} y2={yChico} />
      {/* el costo del primer año: el cuadrado grande entero, con la llave a la derecha */}
      <Llave u={u} x={xLlave} y1={yR} y2={yR + lado} lado="der" />
      <Rotulo u={u} x={xDer} y={yR + lado / 2 - altoRotulo(u) / 2} nombre={R.costo} cifra={T_COSTO} colorNombre={CTX}
              pesoNombre={400} />
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
