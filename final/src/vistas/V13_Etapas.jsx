// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo,
// operación mínima si una rama pasa y producción completa si el efecto la paga. El texto de cada etapa sale de CF
// (etapas: nombre, estado, que); el costo, de DF donde hay ancla (G64, G66.primer_anio y G65.primer_anio).
// (18/11, fase 8, spec 2 V13) El usuario: «le falta dinamismo; la audiencia debe comprender el flujo, qué falta, qué
// hay; debe ser como ver algo en movimiento pero siendo estático». Gramática de flujo de spec 1.4 (la de V10 y V14):
// hecho lleno en ACC, lo que se pide ahora con contorno ACC grueso, lo que depende de pasar con contorno punteado, la
// compuerta como rombo en tinta. Dos versiones (variante('V13')):
//   a  Escalera: cuatro escalones del mismo ancho que suben de izquierda a derecha (el alto no es una magnitud: cada
//      escalón sube lo mismo). Un camino recorre la escalera por encima: lleno en ACC sobre la PoC hasta «estamos acá»,
//      punteado de ahí en adelante, con punta de flecha al final. En las dos subidas que dependen de un resultado, la
//      compuerta con su condición. Dentro de cada escalón: nombre, qué es y, abajo, su costo.
//   b  Cadena: cuatro flechas (chevrones) encadenadas con el mismo código de estados; entre flechas, la compuerta con su
//      condición; debajo de cada flecha, qué es y su costo.
// Leyenda arriba a la izquierda. Al entrar a la vista, los escalones (o las flechas) aparecen en orden, el camino
// avanza y caen las compuertas y el marcador (CSS_ENTRADA; solo en pantalla y sin movimiento reducido: la impresión y
// las capturas ven el estado final). La banda y la conclusión no cambian.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { variante } from '../variantes.js'
import { pct, usd } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, INK, SUP, TRAZO, Aqui, Compuerta, EJE, Renglones, altoAqui, ancho, envolver, marcaFlujo,
  tam, useU } from '../svg.jsx'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
const G = X.grafico
const VAR = variante(ID)

// etapa → estado de FLUJO (spec 1.4): PoC hecha, MVP pedido ahora, las dos siguientes dependen de pasar
const ESTADOS = ['hecho', 'ahora', 'condicional', 'condicional']
// costo de cada etapa donde hay ancla; la PoC ya está hecha y no lleva
const COSTOS = [
  null,
  { valor: usd(A.G64.valor), rotulo: G.costo.mvp },
  { valor: usd(A['G66.primer_anio'].valor), rotulo: G.costo.minima },
  { valor: usd(A['G65.primer_anio'].valor), rotulo: G.costo.completa },
]
const ETAPAS = X.etapas.map((e, i) => ({ ...e, i, flujo: ESTADOS[i], costo: COSTOS[i] }))
if (ETAPAS.length !== 4) throw new Error('V13: la escalera dibuja cuatro etapas y CF trae otra cantidad')
// las compuertas: entre la etapa i y la i + 1, con la condición de la etapa i + 1 (la PoC → MVP es el pedido de hoy:
// la marca «estamos acá», sin rombo)
const COMPUERTAS = [1, 2].map((i) => ({ i, texto: ETAPAS[i + 1].estado }))

export const meta = { id: ID }

// Entrada (solo en pantalla y sin movimiento reducido). ANIMAR = false la apaga. Dura menos de dos segundos.
const ANIMAR = true
const CSS_ENTRADA = `@media screen and (prefers-reduced-motion: no-preference) {
  .v13-paso { animation: v13-sube 520ms cubic-bezier(.16, 1, .3, 1) var(--d) both; }
  .v13-corre { animation: v13-corre 520ms cubic-bezier(.16, 1, .3, 1) var(--d) both; }
  .v13-camino { animation: v13-crece 820ms cubic-bezier(.33, 1, .68, 1) var(--d) both; transform-box: fill-box; transform-origin: left center; }
  .v13-pop { animation: v13-entra 380ms cubic-bezier(.16, 1, .3, 1) var(--d) both; transform-box: fill-box; transform-origin: center; }
}
@keyframes v13-sube { from { opacity: 0; transform: translateY(var(--dy)); } to { opacity: 1; transform: none; } }
@keyframes v13-corre { from { opacity: 0; transform: translateX(var(--dx)); } to { opacity: 1; transform: none; } }
@keyframes v13-crece { from { transform: scaleX(0); } to { transform: none; } }
@keyframes v13-entra { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: none; } }`
const anim = (d, extra = {}) => ({ '--d': `${d}s`, ...extra })

// ---------------------------------------------------------------- leyenda

/** Un renglón de leyenda por fila: cada ítem con su muestra (de ancho propio `a`, en px) y su texto (24 u, CTX: la
 *  leyenda queda detrás de los rótulos del dibujo, que van en tinta). */
function anchoItem(u, it, f) { return it.a + 10 * u + ancho(it.texto, f, 400) }
function anchoFila(u, fila, f) { return fila.reduce((s, it, i) => s + anchoItem(u, it, f) + (i ? 32 * u : 0), 0) }

/** Reparte los ítems en filas de no más de `max` px, en orden. */
function enFilas(u, items, f, max) {
  const filas = [[]]
  for (const it of items) {
    const fila = filas[filas.length - 1]
    if (fila.length && anchoFila(u, [...fila, it], f) > max) filas.push([it])
    else fila.push(it)
  }
  return filas
}

function LeyendaFilas({ u, x, y, filas, f, alto }) {
  return (
    <g>
      {filas.map((fila, r) => {
        let cx = x
        const yc = y + r * alto + alto / 2
        return fila.map((it, i) => {
          if (i) cx += 32 * u
          const x0 = cx
          cx += anchoItem(u, it, f)
          return (
            <g key={`${r}-${i}`}>
              {it.muestra({ x: x0, y: yc, s: f })}
              <text x={x0 + it.a + 10 * u} y={yc} fontSize={f} fill={CTX} dominantBaseline="central">{it.texto}</text>
            </g>
          )
        })
      })}
    </g>
  )
}

/** Rectángulo con la marca de un estado de FLUJO, con el trazo hacia adentro. */
function CajaFlujo({ u, x, y, w, h, estado, r = TRAZO.radio }) {
  const m = marcaFlujo(estado, u)
  const t = m.trazo
  return <rect x={x + t / 2} y={y + t / 2} width={w - t} height={h - t} rx={r * u} {...m.attrs} />
}

/** Chevrón (flecha encadenada): de x a x + w, de y a y + h, punta de `d` px a la derecha y muesca de `d` a la izquierda
 *  (sin muesca si `primero`). */
function caminoChevron(x, y, w, h, d, primero) {
  const ym = y + h / 2
  return `M${x} ${y} H${x + w - d} L${x + w} ${ym} L${x + w - d} ${y + h} H${x} ${primero ? '' : `L${x + d} ${ym} `}Z`
}

function Chevron({ u, x, y, w, h, d, primero, estado }) {
  const m = marcaFlujo(estado, u)
  const t = m.trazo
  // el trazo va hacia adentro: el contorno se achica la mitad del trazo por lado
  return <path d={caminoChevron(x + t / 2, y + t / 2, w - t, h - t, Math.max(0, d - t / 2), primero)}
               strokeLinejoin="round" {...m.attrs} />
}

/** Los ítems de la leyenda. `forma`: 'caja' (escalera) o 'chevron' (cadena); la escalera suma el camino. */
function itemsLeyenda(u, f, forma) {
  const s = f
  const forma1 = (estado) => ({ x, y }) => (forma === 'chevron'
    ? <Chevron u={u} x={x} y={y - s * 0.42} w={s * 1.5} h={s * 0.84} d={s * 0.36} primero={false} estado={estado} />
    : <CajaFlujo u={u} x={x} y={y - s / 2} w={s} h={s} estado={estado} />)
  const a = forma === 'chevron' ? s * 1.5 : s
  const items = [
    { muestra: forma1('hecho'), a, texto: G.ley.hecha },
    { muestra: forma1('ahora'), a, texto: G.ley.ahora },
    { muestra: forma1('condicional'), a, texto: G.ley.condicional },
    { muestra: ({ x, y }) => <Compuerta u={u} x={x + s / 2} y={y} s={s / u} estado="curso" />, a: s, texto: G.ley.compuerta },
  ]
  if (forma === 'caja') {
    const l = s * 1.8
    items.push(
      { muestra: ({ x, y }) => <line x1={x + 3 * u} x2={x + l - 3 * u} y1={y} y2={y} stroke={ACC} strokeWidth={M.hecho * u}
                                     strokeLinecap="round" />, a: l, texto: G.ley.hecho },
      { muestra: ({ x, y }) => (
        <g>
          <line x1={x} x2={x + l - 12 * u} y1={y} y2={y} stroke={CONTORNO} strokeWidth={M.falta * u}
                strokeDasharray={`${8 * u} ${6 * u}`} />
          <path d={`M${x + l - 14 * u} ${y - 9 * u} L${x + l} ${y} L${x + l - 14 * u} ${y + 9 * u} Z`} fill={CONTORNO} />
        </g>
      ), a: l, texto: G.ley.falta },
    )
  }
  return items
}

// ---------------------------------------------------------------- a · escalera

/** «Estamos acá» de costado: la pastilla de Aqui (INK, texto blanco a 22 u, 600) a la izquierda de (x, y), con el pico
 *  hacia la derecha tocando el punto: donde termina el camino hecho y empieza lo que se pide. */
function AquiIzq({ u, x, y, texto }) {
  const f = tam(22, u)
  const w = ancho(texto, f, 600) + 28 * u
  const h = f * 1.6
  const pico = 10 * u
  const xr = x - pico
  return (
    <g>
      <path d={`M${xr} ${y - pico} L${x} ${y} L${xr} ${y + pico} Z`} fill={INK} />
      <rect x={xr - w} y={y - h / 2} width={w + 1} height={h} rx={h / 2} fill={INK} />
      <text x={xr - w / 2} y={y} fontSize={f} fontWeight={600} fill={SUP} textAnchor="middle"
            dominantBaseline="central">{texto}</text>
    </g>
  )
}

// Medidas en u.
const M = {
  hueco: 56, sobre: 28, pad: 22, nombre: 34, que: 24, rotulo: 22, valor: 34, ley: 24, cond: 26, marca: 22,
  rombo: 44, hecho: 8, falta: 4, punta: 22, subeMax: 150, subeMin: 44,
}
const LLENA = 0.92

/** Lo que ocupa cada escalón con una letra dada: lo de arriba (marca, nombre y qué es) y lo de abajo (su costo). */
function medirPasos(u, bw, fN, fQ) {
  const pad = M.pad * u
  const inner = bw - 2 * pad
  const fR = tam(M.rotulo, u), fV = tam(M.valor, u), fM = tam(M.marca, u)
  const hMarca = fM * 1.5
  return ETAPAS.map((e) => {
    const ln = envolver(e.nombre, inner, fN, 700)
    const lq = envolver(e.que, inner, fQ)
    const marca = e.flujo === 'hecho'
    const arriba = pad + (marca ? hMarca + 14 * u : 0) + ln.length * fN * 1.15 + 12 * u + lq.length * fQ * 1.25
    const abajo = e.costo ? 20 * u + fR * 1.3 + fV + pad : pad
    return { ...e, ln, lq, marca, need: arriba + abajo }
  })
}

function planEscalera(w, h, u) {
  const g = M.hueco * u
  const bw = (w - 3 * g) / 4
  const xs = [0, 1, 2, 3].map((i) => i * (bw + g))
  const gc = [0, 1, 2].map((i) => xs[i] + bw + g / 2)
  const sobre = M.sobre * u
  const fL = tam(M.ley, u), fC = tam(M.cond, u)
  const altoL = fL * 1.5
  const total = LLENA * h
  const yA = (h - total) / 2
  const yB = yA + total
  const anchoAqui = ancho(G.aqui, tam(22, u), 600) + 28 * u
  const anchosC = COMPUERTAS.map((c) => ancho(c.texto, fC, 600))

  // la letra más grande con la que cada escalón sube al menos subeMin
  let fN = tam(M.nombre, u), fQ = tam(M.que, u), pasos, sube, T, filas
  const items = itemsLeyenda(u, fL, 'caja')
  for (let intento = 0; intento < 12; intento++) {
    pasos = medirPasos(u, bw, fN, fQ)
    // la leyenda: en las filas que hagan falta antes del rótulo de la última compuerta
    filas = enFilas(u, items, fL, gc[2] - (M.rombo * u) / 2 - 12 * u - anchosC[1] - 32 * u)
    // arriba del escalón más alto: solo el camino y su punta (los rótulos de las compuertas van a su izquierda)
    const reserva = sobre + 14 * u
    const subida = (t) => Math.min(M.subeMax * u, ...pasos.slice(0, 3).map((p, i) => (yB - t - p.need) / (3 - i)))
    let libre = false
    for (let extra = 0; extra <= 200 * u && !libre; extra += 4 * u) {
      T = yA + reserva + extra
      sube = subida(T)
      const ys = [0, 1, 2, 3].map((i) => T + (3 - i) * sube - sobre)
      // cajas [x0, x1, y0, y1]: la leyenda contra el marcador, los rótulos, las compuertas y el camino
      const ley = filas.map((f, r) => [0, anchoFila(u, f, fL), yA + r * altoL, yA + (r + 1) * altoL])
      const rr = (M.rombo * u) / 2
      const otras = [
        [gc[0] - 2 * u - anchoAqui - 10 * u, gc[0], ys[1] - altoAqui(u) / 2, ys[1] + altoAqui(u) / 2],
        [0, 20 * u, ys[0] - 10 * u, ys[0] + 10 * u],
        [gc[0], gc[1], ys[1] - 6 * u, ys[1] + 6 * u],
        [gc[1], gc[2], ys[2] - 6 * u, ys[2] + 6 * u],
        [gc[2], w, ys[3] - 12 * u, ys[3] + 12 * u],
        ...COMPUERTAS.flatMap((c, k) => {
          const yc = (ys[c.i] + ys[c.i + 1]) / 2
          const xR = gc[c.i] - rr - 12 * u
          return [[xR - anchosC[k], xR, yc - 0.6 * fC, yc + 0.6 * fC], [gc[c.i] - rr, gc[c.i] + rr, ys[c.i + 1], ys[c.i]]]
        }),
      ]
      const m = 8 * u
      const corta = (a, b) => a[0] < b[1] + m && b[0] < a[1] + m && a[2] < b[3] + m && b[2] < a[3] + m
      libre = !(ley.some((l) => otras.some((o) => corta(l, o))) || corta(otras[0], otras[5]))
    }
    if (!libre) { T = yA + reserva; sube = subida(T) }
    if (libre && sube >= M.subeMin * u && pasos[3].need <= yB - T) break
    if (fN > tam(28, u)) fN -= 2 * u
    else if (fQ > tam(22, u)) fQ -= u
    else break
  }
  sube = Math.max(sube, 0)
  const tops = [0, 1, 2, 3].map((i) => T + (3 - i) * sube)
  const ys = tops.map((t) => t - sobre)
  return { g, bw, xs, gc, sobre, fL, fC, altoL, yA, yB, fN, fQ, pasos, sube, tops, ys, filas, anchosC }
}

function Escalera({ w, h }) {
  const u = useU()
  const P = planEscalera(w, h, u)
  const pad = M.pad * u
  const fR = tam(M.rotulo, u), fV = tam(M.valor, u), fM = tam(M.marca, u)
  const hMarca = fM * 1.5
  const { xs, gc, ys, tops, yB } = P
  const punta = M.punta * u
  const r0 = 9 * u
  // el camino: lleno sobre la PoC hasta la subida al MVP; punteado de ahí a la punta
  const hecho = `M${r0} ${ys[0]} H${gc[0]} V${ys[1]}`
  const falta = `M${gc[0]} ${ys[1]} H${gc[1]} V${ys[2]} H${gc[2]} V${ys[3]} H${w - punta + 2 * u}`
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {ANIMAR && <style>{CSS_ENTRADA}</style>}
      <LeyendaFilas u={u} x={0} y={P.yA} filas={P.filas} f={P.fL} alto={P.altoL} />

      {/* los escalones */}
      {P.pasos.map((p, i) => {
        const x0 = xs[i]
        const xt = x0 + pad
        const lleno = p.flujo === 'hecho'
        let y = tops[i] + pad
        const yMarca = y
        if (p.marca) y += hMarca + 14 * u
        const yN = y
        const yQ = yN + p.ln.length * P.fN * 1.15 + 12 * u
        return (
          <g key={p.nombre} className="v13-paso" style={anim(0.1 + i * 0.16, { '--dy': `${36 * u}px` })}>
            <title>{`${p.nombre} (${p.estado}): ${p.que}`}</title>
            <CajaFlujo u={u} x={x0} y={tops[i]} w={P.bw} h={yB - tops[i]} estado={p.flujo} />
            {p.marca && (
              <g>
                <rect x={xt} y={yMarca} width={ancho(G.hecha, fM, 700) + 28 * u} height={hMarca} rx={hMarca / 2} fill={SUP} />
                <text x={xt + 14 * u} y={yMarca + hMarca / 2} fontSize={fM} fontWeight={700} fill={INK}
                      dominantBaseline="central">{G.hecha}</text>
              </g>
            )}
            <Renglones lineas={p.ln} x={xt} y={yN} f={P.fN} peso={700} color={lleno ? SUP : INK} inter={1.15} />
            <Renglones lineas={p.lq} x={xt} y={yQ} f={P.fQ} color={lleno ? SUP : CTX} />
            {p.costo && (
              <g>
                <text x={xt} y={yB - pad - fV - 8 * u} fontSize={fR} fill={CTX}>{p.costo.rotulo}</text>
                <text x={xt} y={yB - pad} fontSize={fV} fontWeight={700} fill={INK}>{p.costo.valor}</text>
              </g>
            )}
          </g>
        )
      })}

      {/* el camino que recorre la escalera */}
      <g className="v13-camino" style={anim(0.75)}>
        <path d={falta} fill="none" stroke={CONTORNO} strokeWidth={M.falta * u} strokeDasharray={`${10 * u} ${7 * u}`} />
        <path d={`M${w - punta} ${ys[3] - 11 * u} L${w} ${ys[3]} L${w - punta} ${ys[3] + 11 * u} Z`} fill={CONTORNO} />
        <path d={hecho} fill="none" stroke={ACC} strokeWidth={M.hecho * u} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={r0} cy={ys[0]} r={r0} fill={ACC} />
      </g>

      {/* las compuertas, en las subidas que dependen de un resultado */}
      {COMPUERTAS.map((c, k) => {
        const x = gc[c.i]
        const yc = (ys[c.i] + ys[c.i + 1]) / 2
        return (
          <g key={c.i} className="v13-pop" style={anim(1.05 + k * 0.18)}>
            <Compuerta u={u} x={x} y={yc} s={M.rombo} estado="curso" />
            <text x={x - (M.rombo * u) / 2 - 12 * u} y={yc} fontSize={P.fC} fontWeight={600} fill={INK}
                  textAnchor="end" dominantBaseline="central">{c.texto}</text>
          </g>
        )
      })}

      {/* estamos acá: donde termina lo hecho y empieza lo que se pide */}
      <g className="v13-pop" style={anim(0.95)}>
        <AquiIzq u={u} x={gc[0] - 2 * u} y={ys[1]} texto={G.aqui} />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- b · cadena de flechas

const MB = {
  punta: 34, hueco: 96, pad: 22, nombre: 34, que: 24, rotulo: 22, valor: 34, ley: 24, cond: 26, rombo: 44,
  bandaMax: 250,
}

function planCadena(w, h, u) {
  const d = MB.punta * u
  const g = MB.hueco * u
  const cw = (w - 3 * (g - d)) / 4
  const xs = [0, 1, 2, 3].map((i) => i * (cw + g - d))
  const gx = [0, 1, 2].map((i) => xs[i] + cw + g / 2)        // centro del canal entre flechas, a media altura
  const pad = MB.pad * u
  const fL = tam(MB.ley, u), fC = tam(MB.cond, u), fR = tam(MB.rotulo, u), fV = tam(MB.valor, u)
  const altoL = fL * 1.5
  const total = LLENA * h
  const yA = (h - total) / 2
  const yB = yA + total
  const items = itemsLeyenda(u, fL, 'chevron')
  const filas = enFilas(u, items, fL, w)
  const colW = cw - d - 12 * u
  const hMarca = tam(22, u) * 1.5
  let fN = tam(MB.nombre, u), fQ = tam(MB.que, u)
  let flechas, banda, debajo, arriba
  for (let intento = 0; intento < 10; intento++) {
    const innerN = cw - 1.4 * d - 32 * u
    flechas = ETAPAS.map((e) => ({ ...e, ln: envolver(e.nombre, innerN, fN, 700), lq: envolver(e.que, colW, fQ) }))
    const lineasN = Math.max(...flechas.map((f) => f.ln.length))
    const lineasQ = Math.max(...flechas.map((f) => f.lq.length))
    arriba = filas.length * altoL + 24 * u + Math.max(altoAqui(u), fC * 1.3) + 12 * u
    debajo = 26 * u + lineasQ * fQ * 1.25 + 22 * u + fR * 1.3 + fV
    const minBanda = Math.max(lineasN * fN * 1.15, flechas[0].ln.length * fN * 1.15 + hMarca + 12 * u) + 2 * pad
    banda = Math.min(MB.bandaMax * u, total - arriba - debajo)
    if (banda >= minBanda && lineasN <= 2) break
    if (fN > tam(28, u)) fN -= 2 * u
    else if (fQ > tam(22, u)) fQ -= u
    else { banda = minBanda; break }
  }
  // lo que sobra (ventanas más altas que 16:9), mitad arriba y mitad abajo: el costo sigue a «qué es», no al pie
  const sobra = Math.max(0, total - arriba - banda - debajo)
  const yLey = yA + sobra / 2
  const yBanda = yLey + arriba
  const yCosto = yBanda + banda + debajo
  return { d, g, cw, xs, gx, pad, fL, fC, fR, fV, altoL, yLey, yCosto, filas, fN, fQ, flechas, banda, yBanda, colW }
}

function Cadena({ w, h }) {
  const u = useU()
  const P = planCadena(w, h, u)
  const { d, g, cw, xs, gx, pad, yBanda, banda } = P
  const ym = yBanda + banda / 2
  const yDebajo = yBanda + banda + 26 * u
  const xAqui = xs[0] + cw - d + g / 2                        // el canal PoC → MVP, en el borde de arriba
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {ANIMAR && <style>{CSS_ENTRADA}</style>}
      <LeyendaFilas u={u} x={0} y={P.yLey} filas={P.filas} f={P.fL} alto={P.altoL} />

      {P.flechas.map((f, i) => {
        const x0 = xs[i]
        const lleno = f.flujo === 'hecho'
        // el nombre, centrado en la parte llena de la flecha a media altura
        const xc = i === 0 ? x0 + (cw - d) / 2 + pad / 2 : x0 + (cw + d) / 2
        const hN = f.ln.length * P.fN * 1.15
        // la PoC lleva arriba del nombre la marca «hecha»; el bloque (marca y nombre) va centrado a media altura
        const fM = tam(22, u)
        const hMarca = fM * 1.5
        const conMarca = lleno
        const hBloque = hN + (conMarca ? hMarca + 12 * u : 0)
        const yBloque = ym - hBloque / 2
        const wMarca = ancho(G.hecha, fM, 700) + 28 * u
        return (
          <g key={f.nombre} className="v13-corre" style={anim(0.1 + i * 0.16, { '--dx': `${-40 * u}px` })}>
            <title>{`${f.nombre} (${f.estado}): ${f.que}`}</title>
            <Chevron u={u} x={x0} y={yBanda} w={cw} h={banda} d={d} primero={i === 0} estado={f.flujo} />
            {conMarca && (
              <g>
                <rect x={xc - wMarca / 2} y={yBloque} width={wMarca} height={hMarca} rx={hMarca / 2} fill={SUP} />
                <text x={xc} y={yBloque + hMarca / 2} fontSize={fM} fontWeight={700} fill={INK} textAnchor="middle"
                      dominantBaseline="central">{G.hecha}</text>
              </g>
            )}
            <Renglones lineas={f.ln} x={xc} y={yBloque + (conMarca ? hMarca + 12 * u : 0) + P.fN * 0.07} f={P.fN}
                       peso={700} color={lleno ? SUP : INK} inter={1.15} anchor="middle" />
            <Renglones lineas={f.lq} x={x0 + 6 * u} y={yDebajo} f={P.fQ} color={CTX} />
            {f.costo && (
              <g>
                <text x={x0 + 6 * u} y={P.yCosto - P.fV - 8 * u} fontSize={P.fR} fill={CTX}>{f.costo.rotulo}</text>
                <text x={x0 + 6 * u} y={P.yCosto} fontSize={P.fV} fontWeight={700} fill={INK}>{f.costo.valor}</text>
              </g>
            )}
          </g>
        )
      })}

      {/* las compuertas, en el canal entre flechas, con su condición arriba */}
      {COMPUERTAS.map((c, k) => {
        const x = gx[c.i]
        const rr = (MB.rombo * u) / 2
        return (
          <g key={c.i} className="v13-pop" style={anim(0.9 + k * 0.18)}>
            <line x1={x} x2={x} y1={yBanda - 8 * u} y2={ym - rr} stroke={EJE} strokeWidth={TRAZO.guia * u} />
            <Compuerta u={u} x={x} y={ym} s={MB.rombo} estado="curso" />
            <text x={x} y={yBanda - 16 * u} fontSize={P.fC} fontWeight={600} fill={INK} textAnchor="middle">{c.texto}</text>
          </g>
        )
      })}

      <g className="v13-pop" style={anim(0.8)}>
        <Aqui u={u} x={xAqui} y={yBanda - 4 * u} texto={G.aqui} />
      </g>
    </svg>
  )
}

function Dibujo({ w, h }) {
  return VAR === 'b' ? <Cadena w={w} h={h} /> : <Escalera w={w} h={h} />
}

export default function V13Etapas() {
  return (
    <Vista id={ID}
           items={[
             { clave: 'mvp', valor: usd(A.G64.valor) },
             { clave: 'minima', valor: usd(A['G66.primer_anio'].valor) },
           ]}
           cifras={[pct(A['J03.regla'].valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
