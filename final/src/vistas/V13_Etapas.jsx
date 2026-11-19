// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo,
// operación mínima si una rama pasa y producción completa si el efecto la paga. El nombre y la condición de cada etapa
// salen de CF (etapas: nombre, estado); la línea corta de cada una, de textos_vistas/V13.js (grafico.linea); el costo,
// de DF donde hay ancla (G64, G66.primer_anio y G65.primer_anio).
// (18/11, fase 8) Escalera con compuertas, con la gramática de flujo de spec 1.4 (la de V10 y V14): hecho lleno en ACC,
// lo que se pide ahora con contorno ACC grueso, lo que depende de pasar con contorno punteado, la compuerta como rombo en
// tinta. Cuatro escalones del mismo ancho que suben de izquierda a derecha (el alto no es una magnitud: cada escalón sube
// lo mismo). Un camino recorre la escalera por encima: lleno en ACC sobre la PoC hasta «estamos acá», punteado de ahí en
// adelante, con punta de flecha al final. En las dos subidas que dependen de un resultado, la compuerta con su condición.
// (19/11, fase 9, spec 4 V13) Sin leyenda: cada estado lleva su rótulo directo («hecha», «estamos acá · se pide ahora» y
// la condición junto a su rombo). En cada escalón, nombre, una línea y a lo sumo un costo. Avance en cuatro pasos, una
// etapa por paso, en el orden en que habla el orador: la PoC; el MVP y el marcador; la primera compuerta y la operación
// mínima; la segunda compuerta y la producción completa. Lo que falta se ve atenuado (Paso).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pct, usd } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, INK, SUP, TRAZO, Compuerta, Paso, Renglones, ancho, envolver, marcaFlujo, tam,
  useU } from '../svg.jsx'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
const G = X.grafico

// etapa → estado de FLUJO (spec 1.4): PoC hecha, MVP pedido ahora, las dos siguientes dependen de pasar
const ESTADOS = ['hecho', 'ahora', 'condicional', 'condicional']
// costo de cada etapa donde hay ancla; la PoC ya está hecha y no lleva
const COSTOS = [
  null,
  { valor: usd(A.G64.valor), rotulo: G.costo.mvp },
  { valor: usd(A['G66.primer_anio'].valor), rotulo: G.costo.minima },
  { valor: usd(A['G65.primer_anio'].valor), rotulo: G.costo.completa },
]
const ETAPAS = X.etapas.map((e, i) => ({ ...e, linea: G.linea[i], i, flujo: ESTADOS[i], costo: COSTOS[i] }))
if (ETAPAS.length !== 4 || G.linea.length !== 4) throw new Error('V13: la escalera dibuja cuatro etapas y CF trae otra cantidad')
// las compuertas: entre la etapa i y la i + 1, con la condición de la etapa i + 1 (la PoC → MVP es el pedido de hoy:
// la marca «estamos acá», sin rombo)
const COMPUERTAS = [1, 2].map((i) => ({ i, texto: ETAPAS[i + 1].estado }))

// una etapa por paso: la PoC en el 1, el MVP en el 2, la operación mínima en el 3 y la producción completa en el 4
export const meta = { id: ID, pasos: 4 }

/** Como envolver, con los renglones parejos: la misma cantidad de renglones que envolver, cortados donde el sobrante de
 *  cada uno (al cuadrado) suma menos, y evitando un renglón de una palabra sola. */
function envolverParejo(texto, w, f, peso = 400) {
  const base = envolver(texto, w, f, peso)
  const n = base.length
  if (n < 2) return base
  const p = String(texto).split(' ')
  const memo = new Map()
  const sola = (palabras) => (palabras === 1 ? 4 * w * w : 0)
  // el mejor reparto de las palabras desde i en k renglones: { costo, cortes }
  const mejor = (i, k) => {
    const clave = `${i},${k}`
    if (memo.has(clave)) return memo.get(clave)
    let r = { costo: Infinity, cortes: null }
    if (k === 1) {
      const a = ancho(p.slice(i).join(' '), f, peso)
      if (a <= w) r = { costo: (w - a) ** 2 + sola(p.length - i), cortes: [p.length] }
    } else {
      for (let j = i + 1; j <= p.length - (k - 1); j++) {
        const a = ancho(p.slice(i, j).join(' '), f, peso)
        if (a > w) break
        const resto = mejor(j, k - 1)
        const c = (w - a) ** 2 + sola(j - i) + resto.costo
        if (c < r.costo) r = { costo: c, cortes: [j, ...resto.cortes] }
      }
    }
    memo.set(clave, r)
    return r
  }
  const r = mejor(0, n)
  if (!r.cortes) return base
  let i = 0
  return r.cortes.map((j) => { const l = p.slice(i, j).join(' '); i = j; return l })
}

/** Rectángulo con la marca de un estado de FLUJO, con el trazo hacia adentro. */
function CajaFlujo({ u, x, y, w, h, estado, r = TRAZO.radio }) {
  const m = marcaFlujo(estado, u)
  const t = m.trazo
  return <rect x={x + t / 2} y={y + t / 2} width={w - t} height={h - t} rx={r * u} {...m.attrs} />
}

/** «Estamos acá» de costado: una pastilla en INK con el texto en blanco a la izquierda de (x, y), con el pico hacia la
 *  derecha tocando el punto: donde termina el camino hecho y empieza lo que se pide. */
function AquiIzq({ u, x, y, texto, f }) {
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
  hueco: 56, sobre: 28, pad: 22, nombre: 34, que: 24, rotulo: 24, valor: 34, cond: 26, marca: 24, aqui: 24,
  rombo: 44, hecho: 8, falta: 4, punta: 22, subeMax: 150, subeMin: 44,
}
const LLENA = 0.92

/** Lo que ocupa cada escalón con una letra dada: lo de arriba (marca, nombre y su línea) y lo de abajo (su costo). */
function medirPasos(u, bw, fN, fQ) {
  const pad = M.pad * u
  const inner = bw - 2 * pad
  const fR = tam(M.rotulo, u), fV = tam(M.valor, u), fM = tam(M.marca, u)
  const hMarca = fM * 1.5
  return ETAPAS.map((e) => {
    const ln = envolver(e.nombre, inner, fN, 700)
    const lq = envolverParejo(e.linea, inner, fQ)
    const marca = e.flujo === 'hecho'
    const arriba = pad + (marca ? hMarca + 14 * u : 0) + ln.length * fN * 1.15 + 12 * u + lq.length * fQ * 1.25
    const abajo = e.costo ? 24 * u + fR * 1.3 + fV + pad : pad
    return { ...e, ln, lq, marca, need: arriba + abajo }
  })
}

function planEscalera(w, h, u) {
  const g = M.hueco * u
  const bw = (w - 3 * g) / 4
  const xs = [0, 1, 2, 3].map((i) => i * (bw + g))
  const gc = [0, 1, 2].map((i) => xs[i] + bw + g / 2)
  const sobre = M.sobre * u
  const fC = tam(M.cond, u)
  const total = LLENA * h
  const yA = (h - total) / 2
  const yB = yA + total
  // arriba del escalón más alto: solo el camino y su punta (los rótulos de las compuertas van a su izquierda)
  const T = yA + sobre + 14 * u
  const subida = (pasos) => Math.min(M.subeMax * u, ...pasos.slice(0, 3).map((p, i) => (yB - T - p.need) / (3 - i)))
  // la letra más grande con la que cada escalón sube al menos subeMin
  let fN = tam(M.nombre, u), fQ = tam(M.que, u), pasos, sube
  for (let intento = 0; intento < 12; intento++) {
    pasos = medirPasos(u, bw, fN, fQ)
    sube = subida(pasos)
    if (sube >= M.subeMin * u && pasos[3].need <= yB - T) break
    if (fN > tam(28, u)) fN -= 2 * u
    else break
  }
  sube = Math.max(sube, 0)
  const tops = [0, 1, 2, 3].map((i) => T + (3 - i) * sube)
  const ys = tops.map((t) => t - sobre)
  return { bw, xs, gc, fC, yB, fN, fQ, pasos, tops, ys }
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
  const rr = (M.rombo * u) / 2
  const raya = `${10 * u} ${7 * u}`
  // el camino, por tramos: lo hecho sobre la PoC hasta la subida al MVP (paso 1); lo que falta sobre el MVP (paso 2); la
  // subida de la primera compuerta y el tramo sobre la operación mínima (paso 3); la subida de la segunda y la punta (4)
  const tramos = [
    `M${gc[0] + 4 * u} ${ys[1]} H${gc[1]}`,
    `M${gc[1]} ${ys[1]} V${ys[2]} H${gc[2]}`,
    `M${gc[2]} ${ys[2]} V${ys[3]} H${w - punta + 2 * u}`,
  ]
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* los escalones, uno por paso */}
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
          <Paso key={p.nombre} n={i + 1}>
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
                <text x={xt} y={yB - pad - fV - 10 * u} fontSize={fR} fill={CTX}>{p.costo.rotulo}</text>
                <text x={xt} y={yB - pad} fontSize={fV} fontWeight={700} fill={INK}>{p.costo.valor}</text>
              </g>
            )}
          </Paso>
        )
      })}

      {/* paso 1: el camino hecho, sobre la PoC hasta la subida al MVP */}
      <path d={`M${r0} ${ys[0]} H${gc[0]} V${ys[1]}`} fill="none" stroke={ACC} strokeWidth={M.hecho * u}
            strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={r0} cy={ys[0]} r={r0} fill={ACC} />

      {/* paso 2: el tramo que falta sobre el MVP y «estamos acá»: donde termina lo hecho y empieza lo que se pide */}
      <Paso n={2}>
        <path d={tramos[0]} fill="none" stroke={CONTORNO} strokeWidth={M.falta * u} strokeDasharray={raya} />
        <AquiIzq u={u} x={gc[0] - 2 * u} y={ys[1]} texto={G.aqui} f={tam(M.aqui, u)} />
      </Paso>

      {/* pasos 3 y 4: cada compuerta con su condición, su subida y el tramo que sigue (el último, con la punta) */}
      {COMPUERTAS.map((c, k) => {
        const x = gc[c.i]
        const yc = (ys[c.i] + ys[c.i + 1]) / 2
        const ultimo = k === COMPUERTAS.length - 1
        return (
          <Paso key={c.i} n={c.i + 2}>
            <path d={tramos[k + 1]} fill="none" stroke={CONTORNO} strokeWidth={M.falta * u} strokeDasharray={raya} />
            {ultimo && (
              <path d={`M${w - punta} ${ys[3] - 11 * u} L${w} ${ys[3]} L${w - punta} ${ys[3] + 11 * u} Z`} fill={CONTORNO} />
            )}
            <Compuerta u={u} x={x} y={yc} s={M.rombo} estado="curso" />
            <text x={x - rr - 12 * u} y={yc} fontSize={P.fC} fontWeight={600} fill={INK}
                  textAnchor="end" dominantBaseline="central">{c.texto}</text>
          </Paso>
        )
      })}
    </svg>
  )
}

export default function V13Etapas() {
  return (
    <Vista id={ID}
           items={[{ clave: 'mvp', valor: usd(A.G64.valor) }]}
           cifras={[pct(A['J03.regla'].valor)]}>
      {({ w, h }) => <Escalera w={w} h={h} />}
    </Vista>
  )
}
