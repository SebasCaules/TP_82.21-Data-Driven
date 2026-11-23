// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo y,
// en la semana 28, una decisión con tres salidas (cerrar, operación mínima o producción completa). El nombre de cada
// etapa y de cada salida sale de CF (etapas y salidas); la línea corta, la condición y los rótulos, de
// textos_vistas/V13.js (grafico); el costo, de DF (G64, G66.primer_anio y G65.primer_anio).
// (18/11, fase 8) Escalera con compuertas, con la gramática de flujo de spec 1.4 (la de V10 y V14): hecho lleno en ACC,
// lo que se pide ahora con contorno ACC grueso, lo que depende de pasar con contorno punteado, la compuerta como rombo en
// tinta. Cuatro escalones del mismo ancho que suben de izquierda a derecha (el alto no es una magnitud: cada escalón sube
// lo mismo). Un camino recorre la escalera por encima: lleno en ACC sobre la PoC hasta «estamos acá», punteado de ahí en
// adelante, con punta de flecha al final. En las dos subidas que dependen de un resultado, la compuerta con su condición.
// (19/11, fase 9, spec 4 V13) Sin leyenda: cada estado lleva su rótulo directo («hecha», «estamos aquí» y la condición
// junto a su rombo). En cada escalón, nombre, una línea y a lo sumo un costo. Avance en cuatro pasos, una
// etapa por paso, en el orden en que habla el orador: la PoC; el MVP y el marcador; la primera compuerta y la operación
// mínima; la segunda compuerta y la producción completa. Lo que falta se ve atenuado (Paso).
// (19/11, fase 10, spec 4 V13) Lo que falta es boceto: el contorno de cada escalón, los tramos punteados, los rombos y la
// punta, sin ningún texto (nombre, línea, costo y condición aparecen en su paso, lo resuelve Paso). Las dos pastillas
// («hecha» y «estamos aquí») llevan data-txt: en boceto no quedan como cápsulas vacías. La forma no cambia.
// (23/11) Sale la escalera: se leía como un camino en orden (operación mínima antes de producción completa) y la Parte A
// del E4, sección 3.2, dice otra cosa: en la semana 28 una sola decisión elige entre tres salidas, y la más probable,
// cerrar, no estaba en el dibujo. Queda, de izquierda a derecha: la PoC (llena en ACC, «hecha»), una flecha en ACC, el MVP
// en piloto mínimo (contorno ACC grueso, «estamos aquí» arriba, su costo), una flecha punteada al rombo de la semana 28
// (en tinta, con su pregunta y la convención del par de cifras debajo, unidos por una guía) y, desde el rombo, tres
// flechas punteadas que salen juntas, cada una a su caja, apiladas a la derecha: producción completa arriba y operación
// mínima al medio (punteadas, con nombre, línea, costo y condición) y el cierre abajo (lleno en REALCE, sin costo nuevo:
// «se gastaron USD 4.485»). Ninguna flecha une dos salidas: a la producción completa no se llega por la operación
// mínima. Las condiciones son G67 (umbral de pase por rama y efecto que paga la producción completa), con descuento /
// sin descuento. Pasos (siguen en 4): 1 la PoC; 2 el MVP y «estamos aquí»; 3 el rombo, el cierre y la operación mínima;
// 4 la producción completa. Lo que falta, boceto (Paso), como antes.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pct, usd } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, EJE, INK, REALCE, SUP, TRAZO, Compuerta, Paso, Renglones, ancho, envolver, marcaFlujo, tam,
  useU } from '../svg.jsx'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
const G = X.grafico

// las dos etapas en orden: la PoC hecha y el MVP que se pide ahora
const ETAPAS = [
  { ...X.etapas[0], linea: G.linea.poc, flujo: 'hecho', costo: null, paso: 1 },
  { ...X.etapas[1], linea: G.linea.mvp, flujo: 'ahora', costo: { valor: usd(A.G64.valor), rotulo: G.costo.mvp }, paso: 2 },
]
// las tres salidas de la semana 28, de arriba hacia abajo, con el paso en que aparece cada una
const CLAVES = ['completa', 'minima', 'cierra']
const COSTOS = {
  completa: { valor: usd(A['G65.primer_anio'].valor), rotulo: G.costo.completa },
  minima: { valor: usd(A['G66.primer_anio'].valor), rotulo: G.costo.minima },
  cierra: null,
}
const PASOS = { completa: 4, minima: 3, cierra: 3 }
const SALIDAS = (X.salidas ?? []).map((s, i) => {
  const k = CLAVES[i]
  return { ...s, clave: k, linea: G.linea[k], condicion: G.condicion[k], costo: COSTOS[k], paso: PASOS[k],
    flujo: k === 'cierra' ? 'cierre' : 'condicional' }
})
if (X.etapas.length !== 2 || SALIDAS.length !== 3 || SALIDAS.some((s) => !s.linea || !s.condicion)) {
  throw new Error('V13: CF tiene que traer dos etapas y tres salidas (completa, mínima, cierra), cada una con su línea y su condición')
}

// la PoC en el 1, el MVP en el 2, el rombo con el cierre y la operación mínima en el 3, la producción completa en el 4
export const meta = { id: ID, pasos: 4 }

/** Rectángulo con la marca de un estado de FLUJO (o 'cierre': lleno en REALCE, sin trazo), con el trazo hacia adentro. */
function CajaFlujo({ u, x, y, w, h, estado, r = TRAZO.radio }) {
  if (estado === 'cierre') return <rect x={x} y={y} width={w} height={h} rx={r * u} fill={REALCE} />
  const m = marcaFlujo(estado, u)
  const t = m.trazo
  return <rect x={x + t / 2} y={y + t / 2} width={w - t} height={h - t} rx={r * u} {...m.attrs} />
}

/** «Estamos aquí» arriba de (x, y): una pastilla en INK con el texto en blanco y el pico hacia abajo tocando el punto. */
function AquiArriba({ u, x, y, texto, f }) {
  const w = ancho(texto, f, 600) + 28 * u
  const h = f * 1.6
  const pico = 10 * u
  const yc = y - pico - h / 2
  return (
    <g data-txt="">
      <path d={`M${x - pico} ${y - pico - 1} L${x} ${y} L${x + pico} ${y - pico - 1} Z`} fill={INK} />
      <rect x={x - w / 2} y={yc - h / 2} width={w} height={h} rx={h / 2} fill={INK} />
      <text x={x} y={yc} fontSize={f} fontWeight={600} fill={SUP} textAnchor="middle" dominantBaseline="central">{texto}</text>
    </g>
  )
}

/** Punta de flecha hacia la derecha que termina en (x, y). */
const punta = (x, y, l, a, color) => <path d={`M${x - l} ${y - a} L${x} ${y} L${x - l} ${y + a} Z`} fill={color} />

// Medidas en u.
const M = {
  pad: 20, nombre: 32, que: 24, rotulo: 22, valor: 34, cond: 26, cap: 26, conv: 24, marca: 24, aqui: 24,
  rombo: 56, hecho: 6, falta: 4, punta: 18, ala: 10, curva: 18,
  flechaL: 64,   // hueco entre la PoC y el MVP, y entre el MVP y el rombo (la flecha)
  ramaA: 40,     // del vértice derecho del rombo a donde doblan las ramas
  ramaB: 56,     // de donde doblan las ramas a las cajas de salida
  colGap: 28, huecoV: 18,
}
// el dibujo ocupa este tanto del alto del lienzo, centrado (spec 0.7: del 70 % al 95 %)
const LLENA = 0.92

function plan(w, h, u) {
  const pad = M.pad * u
  const fN = tam(M.nombre, u), fQ = tam(M.que, u), fR = tam(M.rotulo, u), fV = tam(M.valor, u), fC = tam(M.cond, u)
  const fCap = tam(M.cap, u), fConv = tam(M.conv, u), fM = tam(M.marca, u), fA = tam(M.aqui, u)
  const colGap = M.colGap * u
  // ancho de las cajas de salida: renglón del nombre con la cifra, el de la línea con su rótulo y el de la condición
  const necesita = Math.max(...SALIDAS.map((s) => Math.max(
    ancho(s.nombre, fN, 700) + (s.costo ? colGap + ancho(s.costo.valor, fV, 700) : 0),
    ancho(s.linea, fQ) + (s.costo ? colGap + ancho(s.costo.rotulo, fR) : 0),
    ancho(s.condicion, fC, 600),
  ))) + 2 * pad
  const We = Math.min(Math.max(necesita, 0.4 * w), 0.5 * w)
  const xE = w - We
  const huecoV = M.huecoV * u
  const hB = (h - 2 * huecoV) / 3
  const ysB = [0, 1, 2].map((i) => i * (hB + huecoV))
  const yR = ysB[1] + hB / 2
  const rr = (M.rombo * u) / 2
  const xF = xE - M.ramaB * u
  const xR = xF - M.ramaA * u - rr
  const xMd = xR - rr - M.flechaL * u
  // las dos etapas: la PoC algo más angosta que el MVP
  const gL = M.flechaL * u
  const bwP = 0.42 * (xMd - gL)
  const bwM = xMd - gL - bwP
  const xsL = [0, bwP + gL]
  const bwL = [bwP, bwM]
  // arriba, lugar para «estamos aquí»; abajo, para el rótulo del rombo (pregunta y convención)
  const yTopL = fA * 1.6 + 10 * u + 10 * u
  const hCap = fCap * 1.25 + fConv * 1.25
  const yMaxL = h - hCap - 22 * u
  const hMarca = fM * 1.5
  const medir = (fNL, fQL) => ETAPAS.map((e, i) => {
    const inner = bwL[i] - 2 * pad
    const ln = envolver(e.nombre, inner, fNL, 700)
    const lq = envolver(e.linea, inner, fQL)
    const lr = e.costo ? envolver(e.costo.rotulo, inner, fR) : []
    const arriba = pad + (e.flujo === 'hecho' ? hMarca + 14 * u : 0) + ln.length * fNL * 1.15 + 10 * u + lq.length * fQL * 1.25
    const abajo = e.costo ? 20 * u + lr.length * fR * 1.25 + fV + pad : pad
    return { ...e, ln, lq, lr, need: arriba + abajo }
  })
  let fNL = fN, fQL = fQ, et = medir(fNL, fQL)
  for (let k = 0; k < 8 && Math.max(...et.map((e) => e.need)) > yMaxL - yTopL; k++) {
    if (fNL > tam(26, u)) fNL -= 2 * u
    else if (fQL > tam(20, u)) fQL -= 1 * u
    et = medir(fNL, fQL)
  }
  const yBotL = Math.min(yMaxL, Math.max(yTopL + Math.max(...et.map((e) => e.need)), yR + rr + 20 * u))
  return { pad, fN, fQ, fR, fV, fC, fCap, fConv, fM, fA, hMarca, fNL, fQL, We, xE, hB, ysB, yR, rr, xF, xR, xsL, bwL,
    yTopL, yBotL, et, colGap }
}

function Dibujo({ w, h: hTotal }) {
  const u = useU()
  const h = LLENA * hTotal
  const P = plan(w, h, u)
  const { pad, xE, We, hB, ysB, yR, rr, xF, xR, xsL, bwL, yTopL, yBotL } = P
  const lp = M.punta * u, la = M.ala * u, cv = M.curva * u
  const raya = `${10 * u} ${7 * u}`
  const finFlecha = (x) => x - 2 * u
  // las tres ramas salen juntas del vértice derecho del rombo y cada una dobla hacia su caja: ninguna pasa por otra
  // (el tramo común, del rombo a donde doblan, se dibuja una sola vez con el rombo)
  const x0 = xF - cv
  const rama = (yc) => {
    if (Math.abs(yc - yR) < 1) return `M${x0} ${yR} H${finFlecha(xE) - lp + 1}`
    const s = yc < yR ? -1 : 1
    return `M${x0} ${yR} Q${xF} ${yR} ${xF} ${yR + s * cv} V${yc - s * cv} Q${xF} ${yc} ${xF + cv} ${yc} `
      + `H${finFlecha(xE) - lp + 1}`
  }
  const yCap = yBotL + 22 * u
  return (
    <svg width={w} height={hTotal} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0 ${(hTotal - h) / 2})`}>
      {/* pasos 1 y 2: la PoC y el MVP, cada una en su caja; el MVP con «estamos aquí» y la flecha que llega desde la PoC */}
      {P.et.map((e, i) => {
        const x = xsL[i]
        const xt = x + pad
        const lleno = e.flujo === 'hecho'
        let y = yTopL + pad
        const yMarca = y
        if (lleno) y += P.hMarca + 14 * u
        const yQ = y + e.ln.length * P.fNL * 1.15 + 10 * u
        const yV = yBotL - pad
        return (
          <Paso key={e.nombre} n={e.paso}>
            <CajaFlujo u={u} x={x} y={yTopL} w={bwL[i]} h={yBotL - yTopL} estado={e.flujo} />
            {lleno && (
              <g data-txt="">
                <rect x={xt} y={yMarca} width={ancho(G.hecha, P.fM, 700) + 28 * u} height={P.hMarca} rx={P.hMarca / 2}
                      fill={SUP} />
                <text x={xt + 14 * u} y={yMarca + P.hMarca / 2} fontSize={P.fM} fontWeight={700} fill={INK}
                      dominantBaseline="central">{G.hecha}</text>
              </g>
            )}
            <Renglones lineas={e.ln} x={xt} y={y} f={P.fNL} peso={700} color={lleno ? SUP : INK} inter={1.15} />
            <Renglones lineas={e.lq} x={xt} y={yQ} f={P.fQL} color={lleno ? SUP : CTX} />
            {e.costo && (
              <g>
                <Renglones lineas={e.lr} x={xt} y={yV - P.fV - 8 * u - e.lr.length * P.fR * 1.25} f={P.fR} color={CTX} />
                <text x={xt} y={yV} fontSize={P.fV} fontWeight={700} fill={INK}>{e.costo.valor}</text>
              </g>
            )}
            {i === 1 && (
              <g>
                <line x1={xsL[0] + bwL[0] + 4 * u} x2={x - lp + 1} y1={yR} y2={yR} stroke={ACC} strokeWidth={M.hecho * u} />
                {punta(x - 2 * u, yR, lp, la, ACC)}
                <AquiArriba u={u} x={x + bwL[1] / 2} y={yTopL - 4 * u} texto={G.aqui} f={P.fA} />
              </g>
            )}
          </Paso>
        )
      })}

      {/* paso 3: la flecha del MVP al rombo de la semana 28, el rombo con el tramo común de las ramas y su rótulo debajo,
          unido por una guía */}
      <Paso n={3}>
        <line x1={xsL[1] + bwL[1] + 4 * u} x2={xR - rr - lp - 2 * u} y1={yR} y2={yR} stroke={CONTORNO}
              strokeWidth={M.falta * u} strokeDasharray={raya} />
        {punta(xR - rr - 4 * u, yR, lp, la, CONTORNO)}
        <line x1={xR + rr} x2={x0} y1={yR} y2={yR} stroke={CONTORNO} strokeWidth={M.falta * u} strokeDasharray={raya} />
        <Compuerta u={u} x={xR} y={yR} s={M.rombo} estado="curso" />
        <line x1={xR} x2={xR} y1={yR + rr + 6 * u} y2={yCap - 8 * u} stroke={EJE} strokeWidth={TRAZO.guia * u} />
        <text x={xF - 16 * u} y={yCap} fontSize={P.fCap} fontWeight={700} fill={INK} textAnchor="end"
              dominantBaseline="hanging">{G.decide}</text>
        <text x={xF - 16 * u} y={yCap + P.fCap * 1.25} fontSize={P.fConv} fill={CTX} textAnchor="end"
              dominantBaseline="hanging">{G.convencion}</text>
      </Paso>

      {/* pasos 3 y 4: cada salida con su rama desde el rombo; arriba producción completa, al medio operación mínima y
          abajo el cierre */}
      {SALIDAS.map((s, i) => {
        const y = ysB[i]
        const yc = y + hB / 2
        const xt = xE + pad
        const xd = xE + We - pad
        const yN = yc - (P.fN * 1.15 + 6 * u + P.fQ * 1.25 + 10 * u + P.fC * 1.2) / 2
        const yQ = yN + P.fN * 1.15 + 6 * u
        const yC = yQ + P.fQ * 1.25 + 10 * u
        return (
          <Paso key={s.clave} n={s.paso}>
            <path d={rama(yc)} fill="none" stroke={CONTORNO} strokeWidth={M.falta * u} strokeDasharray={raya} />
            {punta(finFlecha(xE), yc, lp, la, CONTORNO)}
            <CajaFlujo u={u} x={xE} y={y} w={We} h={hB} estado={s.flujo} />
            <text x={xt} y={yN} fontSize={P.fN} fontWeight={700} fill={INK} dominantBaseline="hanging">{s.nombre}</text>
            <text x={xt} y={yQ} fontSize={P.fQ} fill={CTX} dominantBaseline="hanging">{s.linea}</text>
            <text x={xt} y={yC} fontSize={P.fC} fontWeight={600} fill={INK} dominantBaseline="hanging">{s.condicion}</text>
            {s.costo && (
              <g>
                <text x={xd} y={yN} fontSize={P.fV} fontWeight={700} fill={INK} textAnchor="end"
                      dominantBaseline="hanging">{s.costo.valor}</text>
                <text x={xd} y={yQ} fontSize={P.fR} fill={CTX} textAnchor="end" dominantBaseline="hanging">{s.costo.rotulo}</text>
              </g>
            )}
          </Paso>
        )
      })}
      </g>
    </svg>
  )
}

export default function V13Etapas() {
  return (
    <Vista id={ID}
           items={[{ clave: 'mvp', valor: usd(A.G64.valor) }]}
           cifras={[pct(A['J03.regla'].valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
