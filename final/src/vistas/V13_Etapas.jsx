// V13 · PoC y MVP (gestión, Sebastian C.). El camino del canon (poc_y_mvp.camino): PoC hecha, MVP en piloto mínimo y,
// si el piloto funciona, en la semana de la decisión, operación mínima o producción completa. El nombre de cada etapa y
// de cada salida sale de CF (etapas y salidas); la línea corta, la condición y los rótulos, de textos_vistas/V13.js
// (grafico); el costo, de DF (G64, G66.primer_anio y G65.primer_anio).
// Historia: escalera con compuertas (18/11, fase 8; 19/11, fases 9 y 10, con boceto); decisión de la semana 28 con tres
// salidas apiladas y sus umbrales en puntos (23/11, mañana).
// (23/11, tarde) Más breve y dado el éxito: una tira horizontal de tres piezas unidas por flechas, con la gramática de
// flujo de spec 1.4 (hecho lleno en ACC, lo que se pide ahora con contorno ACC grueso, lo que depende de pasar con
// contorno punteado, la compuerta como rombo en tinta):
//   1 la PoC (llena en ACC, «hecha»), sin cifras;
//   2 el MVP en piloto mínimo (contorno ACC, «estamos aquí» arriba), con su costo y su horizonte, unido por una flecha;
//   3 la bifurcación: una flecha punteada al rombo, a su derecha «Si el piloto funciona» y la semana, y dos ramas que
//     salen del vértice de arriba y del de abajo, cada una a su caja: operación mínima arriba y producción completa
//     abajo, con línea, costo del primer año y la condición en palabras (los umbrales en puntos están en V09).
// El cierre no se dibuja: queda implícito en «si funciona». Ninguna flecha une las dos salidas.
// Movimiento (como una cámara que sigue a la pieza nueva): en cada paso la pieza nueva aparece escalando desde su centro
// en su lugar final y lo anterior se corre a la izquierda (Anima «corre», 560 ms, ease-out cúbica). La PoC entra centrada;
// el MVP entra en el centro del lienzo (la PoC a su izquierda); en el 3 la tira entera queda centrada. Lo que todavía no llegó no se dibuja (Paso oculto, sin boceto). Cada pieza se dibuja corrida
// hasta donde va a estar cuando aparezca (dx del paso máx(paso, el suyo)), así lo oculto nunca queda fuera del lienzo.
// Con ?paso=k, al abrir completa, al retroceder y con movimiento reducido se ve terminado (regla de Anima).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { pct, usd } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, INK, SUP, TRAZO, Anima, Compuerta, Paso, Renglones, ancho, envolver, marcaFlujo, tam,
  useU } from '../svg.jsx'
import { escalonado, usePaso } from '../pasos.js'

const ID = 'V13'
const A = DF.anclas
const X = textosDe(ID)
const G = X.grafico

// las dos etapas en orden: la PoC hecha y el MVP que se pide ahora
const POC = { ...X.etapas[0], linea: G.linea.poc }
const MVP = { ...X.etapas[1], linea: G.linea.mvp, costo: { valor: usd(A.G64.valor), rotulo: G.costo.mvp } }
// las dos salidas si el piloto funciona, de arriba hacia abajo (CF las trae en ese orden)
const CLAVES = ['minima', 'completa']
const COSTOS = { minima: usd(A['G66.primer_anio'].valor), completa: usd(A['G65.primer_anio'].valor) }
const SALIDAS = (X.salidas ?? []).map((s, i) => {
  const k = CLAVES[i]
  return { ...s, clave: k, linea: G.linea[k], condicion: G.condicion[k], costo: { valor: COSTOS[k], rotulo: G.costo[k] } }
})
if (X.etapas.length !== 2 || SALIDAS.length !== 2 || SALIDAS.some((s) => !s.linea || !s.condicion || !s.costo.rotulo)) {
  throw new Error('V13: CF tiene que traer dos etapas y dos salidas (mínima y completa), cada una con su línea y su condición')
}

// la PoC en el 1, el MVP en el 2, la bifurcación en el 3
export const meta = { id: ID, pasos: 3 }

/** Rectángulo con la marca de un estado de FLUJO, con el trazo hacia adentro. */
function CajaFlujo({ u, x, y, w, h, estado, r = TRAZO.radio }) {
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
    <g>
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
  pad: 22, nombre: 32, que: 24, rotulo: 22, valor: 34, cond: 24, marca: 24, aqui: 24, nodo: 28, semana: 22,
  rombo: 52, hecho: 6, falta: 4, punta: 18, ala: 10, curva: 16,
  poc: 230,      // ancho mínimo de la PoC
  flecha: 72,    // hueco entre la PoC y el MVP, y entre el MVP y el rombo (la flecha)
  rama: 84,      // del centro del rombo al borde izquierdo de las salidas
  colGap: 28, huecoNodo: 20, margen: 24,
}
// el dibujo ocupa este tanto del alto del lienzo, centrado (spec 0.7: del 70 % al 95 %)
const LLENA = 0.8
const CORRE = 560   // ms del corrimiento a la izquierda
// su curva: ease-out cúbica, más pareja que --fin-curva (que hace casi todo el recorrido en el primer tercio)
const CURVA_CORRE = 'cubic-bezier(0.33, 1, 0.68, 1)'

function plan(w, h, u) {
  let P
  // las letras bajan de a 4 % (hasta el 80 %) si la tira no entra en el ancho con sus márgenes o el alto no alcanza
  for (let s = 1; s >= 0.8 - 1e-9; s -= 0.04) {
    P = medir(w, h, u, s)
    if (P.cabe) break
  }
  return P
}

function medir(w, h, u, s) {
  const t = (k) => tam(M[k] * s, u)
  const fN = t('nombre'), fQ = t('que'), fR = t('rotulo'), fV = t('valor'), fC = t('cond'), fM = t('marca'),
    fA = t('aqui'), fNo = t('nodo'), fS = t('semana')
  const pad = M.pad * u
  const colGap = M.colGap * u
  const rr = (M.rombo * u) / 2
  const hMarca = fM * 1.6
  const anchoMarca = ancho(G.hecha, fM, 700) + 28 * u
  // anchos: la PoC, el MVP con su nombre en un renglón, y las salidas con nombre y cifra, línea y horizonte, condición
  const bwP = Math.max(M.poc * u * s, ancho(POC.nombre, fN, 700) + 2 * pad, anchoMarca + 2 * pad)
  const bwM = Math.max(ancho(MVP.nombre, fN, 700), ancho(MVP.costo.valor, fV, 700), ancho(G.aqui, fA, 600) + 28 * u)
    + 2 * pad
  const We = Math.max(...SALIDAS.map((x) => Math.max(
    ancho(x.nombre, fN, 700) + colGap + ancho(x.costo.valor, fV, 700),
    ancho(x.linea, fQ) + colGap + ancho(x.costo.rotulo, fR),
    ancho(x.condicion, fC, 600),
  ))) + 2 * pad
  const gF = M.flecha * u
  const xP = 0
  const xM = xP + bwP + gF
  const xR = xM + bwM + gF + rr
  const xE = xR + M.rama * u
  const ext = [bwP, xM + bwM, xE + We]
  // dx[k]: el corrimiento de la tira en el paso k. En el 1 y el 3 la composición queda centrada; en el 2 el MVP entra en
  // el centro del lienzo (la PoC queda a su izquierda, sin pasar del margen)
  const dx = [0, (w - ext[0]) / 2, Math.max(M.margen * u, w / 2 - (xM + bwM / 2)), (w - ext[2]) / 2]
  // alto: dos salidas con el rótulo del nodo en el hueco entre ellas; la PoC y el MVP centrados en la misma línea
  const H = LLENA * h
  const yR = h / 2
  const hNodo = fNo * 1.2 + fS * 1.25
  const gapV = hNodo + 2 * M.huecoNodo * u
  const hE = (H - gapV) / 2
  const ysE = [yR - gapV / 2 - hE, yR + gapV / 2]
  const lqP = envolver(POC.linea, bwP - 2 * pad, fQ)
  const lqM = envolver(MVP.linea, bwM - 2 * pad, fQ)
  const necP = hMarca + 12 * u + fN * 1.15 + 8 * u + lqP.length * fQ * 1.25 + 2 * pad
  const necM = fN * 1.15 + 8 * u + lqM.length * fQ * 1.25 + 18 * u + fV + 6 * u + fR * 1.25 + 2 * pad
  const necE = fN * 1.15 + 8 * u + fQ * 1.25 + 12 * u + fC * 1.2 + 2 * pad
  const hAqui = fA * 1.6 + 10 * u + 4 * u
  const hL = Math.min(Math.max(hE, necP, necM), H - 2 * hAqui)
  const cabe = ext[2] <= w - 2 * M.margen * u && necE <= hE && Math.max(necP, necM) <= hL
  return { cabe, fN, fQ, fR, fV, fC, fM, fA, fNo, fS, pad, colGap, rr, hMarca, anchoMarca, bwP, bwM, We, xP, xM, xR, xE,
    dx, yR, hNodo, hE, ysE, hL, lqP, lqM, necP, necM, necE }
}

/** Una pieza de la tira, llegada en el paso `j`: se dibuja corrida hasta donde está en el paso máx(paso, j) y, en cada
 *  paso posterior que llega avanzando, se corre desde donde estaba (Anima «corre»; el translate va en el <g> de afuera,
 *  el de Anima no puede llevar transform propio). */
function Pieza({ j, dx, paso, children }) {
  let el = children
  for (let n = j + 1; n < dx.length; n++) {
    el = (
      <Anima n={n} efecto="corre" dx={dx[n - 1] - dx[n]} dur={CORRE}
             style={{ animationTimingFunction: CURVA_CORRE }}>{el}</Anima>
    )
  }
  return <g transform={`translate(${dx[Math.min(dx.length - 1, Math.max(paso, j))]} 0)`}>{el}</g>
}

function Dibujo({ w, h }) {
  const u = useU()
  const paso = usePaso()
  const P = plan(w, h, u)
  const { pad, bwP, bwM, We, xP, xM, xR, xE, yR, hE, ysE, hL, rr, dx } = P
  const lp = M.punta * u, la = M.ala * u, cv = M.curva * u
  const raya = `${10 * u} ${7 * u}`
  const yL = yR - hL / 2

  // 1 · la PoC: la marca «hecha», el nombre y la línea, centrados en vertical
  const yP = yR - P.necP / 2 + pad
  const yPN = yP + P.hMarca + 12 * u
  const yPQ = yPN + P.fN * 1.15 + 8 * u
  // 2 · el MVP: nombre, línea, la cifra y su horizonte
  const yMN = yR - P.necM / 2 + pad
  const yMQ = yMN + P.fN * 1.15 + 8 * u
  const yMV = yMQ + P.lqM.length * P.fQ * 1.25 + 18 * u
  const yMR = yMV + P.fV + 6 * u
  // 3 · las ramas salen del vértice de arriba y del de abajo del rombo y doblan hacia su caja
  const rama = (yc) => {
    const sgn = yc < yR ? -1 : 1
    return `M${xR} ${yR + sgn * rr} V${yc - sgn * cv} Q${xR} ${yc} ${xR + cv} ${yc} H${xE - 2 * u - lp + 1}`
  }

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* 3 · la bifurcación: la flecha punteada del MVP al rombo, el rombo con su rótulo a la derecha, las dos ramas y
          las dos salidas */}
      <Paso n={3} oculto entrada={false}>
        <Pieza j={3} dx={dx} paso={paso}>
          <Anima n={3} efecto="revela-x" dur={320} style={{ '--fin-anima-base': '160ms' }}>
            <line x1={xM + bwM + 4 * u} x2={xR - rr - lp - 2 * u} y1={yR} y2={yR} stroke={CONTORNO}
                  strokeWidth={M.falta * u} strokeDasharray={raya} />
            {punta(xR - rr - 4 * u, yR, lp, la, CONTORNO)}
          </Anima>
          <Anima n={3} efecto="escala" dur={420} style={{ '--fin-anima-base': '320ms' }}>
            <Compuerta u={u} x={xR} y={yR} s={M.rombo} estado="curso" />
          </Anima>
          <Anima n={3} efecto="funde" dur={360} style={{ '--fin-anima-base': '480ms' }}>
            <text x={xR + rr + 16 * u} y={yR - P.hNodo / 2} fontSize={P.fNo} fontWeight={700} fill={INK}
                  dominantBaseline="hanging">{G.nodo}</text>
            <text x={xR + rr + 16 * u} y={yR - P.hNodo / 2 + P.fNo * 1.2} fontSize={P.fS} fill={CTX}
                  dominantBaseline="hanging">{G.semana}</text>
            {SALIDAS.map((x, i) => (
              <g key={x.clave}>
                <path d={rama(ysE[i] + hE / 2)} fill="none" stroke={CONTORNO} strokeWidth={M.falta * u}
                      strokeDasharray={raya} />
                {punta(xE - 2 * u, ysE[i] + hE / 2, lp, la, CONTORNO)}
              </g>
            ))}
          </Anima>
          <g style={{ ...escalonado(2, { total: 520, dur: 420 }), '--fin-anima-base': '560ms' }}>
            {SALIDAS.map((x, i) => {
              const y = ysE[i]
              const yN = y + hE / 2 - P.necE / 2 + pad
              const yQ = yN + P.fN * 1.15 + 8 * u
              const yC = yQ + P.fQ * 1.25 + 12 * u
              const xt = xE + pad
              const xd = xE + We - pad
              return (
                <Anima key={x.clave} n={3} efecto="escala" i={i}>
                  <CajaFlujo u={u} x={xE} y={y} w={We} h={hE} estado="condicional" />
                  <text x={xt} y={yN} fontSize={P.fN} fontWeight={700} fill={INK} dominantBaseline="hanging">{x.nombre}</text>
                  <text x={xd} y={yN} fontSize={P.fV} fontWeight={700} fill={INK} textAnchor="end"
                        dominantBaseline="hanging">{x.costo.valor}</text>
                  <text x={xt} y={yQ} fontSize={P.fQ} fill={CTX} dominantBaseline="hanging">{x.linea}</text>
                  <text x={xd} y={yQ} fontSize={P.fR} fill={CTX} textAnchor="end"
                        dominantBaseline="hanging">{x.costo.rotulo}</text>
                  <text x={xt} y={yC} fontSize={P.fC} fontWeight={600} fill={INK}
                        dominantBaseline="hanging">{x.condicion}</text>
                </Anima>
              )
            })}
          </g>
        </Pieza>
      </Paso>

      {/* 2 · el MVP en piloto mínimo, con «estamos aquí» y la flecha que llega desde la PoC */}
      <Paso n={2} oculto entrada={false}>
        <Pieza j={2} dx={dx} paso={paso}>
          <Anima n={2} efecto="escala" dur={460} style={{ '--fin-anima-base': '140ms' }}>
            <CajaFlujo u={u} x={xM} y={yL} w={bwM} h={hL} estado="ahora" />
            <text x={xM + pad} y={yMN} fontSize={P.fN} fontWeight={700} fill={INK}
                  dominantBaseline="hanging">{MVP.nombre}</text>
            <Renglones lineas={P.lqM} x={xM + pad} y={yMQ} f={P.fQ} color={CTX} />
            <text x={xM + pad} y={yMV} fontSize={P.fV} fontWeight={700} fill={INK}
                  dominantBaseline="hanging">{MVP.costo.valor}</text>
            <text x={xM + pad} y={yMR} fontSize={P.fR} fill={CTX} dominantBaseline="hanging">{MVP.costo.rotulo}</text>
            <AquiArriba u={u} x={xM + bwM / 2} y={yL - 4 * u} texto={G.aqui} f={P.fA} />
          </Anima>
          <Anima n={2} efecto="revela-x" dur={300} style={{ '--fin-anima-base': '420ms' }}>
            <line x1={xP + bwP + 4 * u} x2={xM - lp - 1 * u} y1={yR} y2={yR} stroke={ACC} strokeWidth={M.hecho * u} />
            {punta(xM - 2 * u, yR, lp, la, ACC)}
          </Anima>
        </Pieza>
      </Paso>

      {/* 1 · la PoC, hecha */}
      <Pieza j={1} dx={dx} paso={paso}>
        <Anima n={1} efecto="escala" dur={460}>
          <CajaFlujo u={u} x={xP} y={yL} w={bwP} h={hL} estado="hecho" />
          <rect x={xP + pad} y={yP} width={P.anchoMarca} height={P.hMarca} rx={P.hMarca / 2} fill={SUP} />
          <text x={xP + pad + 14 * u} y={yP + P.hMarca / 2} fontSize={P.fM} fontWeight={700} fill={INK}
                dominantBaseline="central">{G.hecha}</text>
          <text x={xP + pad} y={yPN} fontSize={P.fN} fontWeight={700} fill={SUP}
                dominantBaseline="hanging">{POC.nombre}</text>
          <Renglones lineas={P.lqP} x={xP + pad} y={yPQ} f={P.fQ} color={SUP} />
        </Anima>
      </Pieza>
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
