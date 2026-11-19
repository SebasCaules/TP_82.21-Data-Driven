// V16 · Lo que pedimos (Integrante 1). (19/11, fase 11, spec 2.2) La segunda mitad del cierre: el pedido, por qué con
// este equipo y el cierre con el contacto y el QR al informe. La primera mitad (el recorrido y lo que nos llevamos) es
// V15_Recorrido.jsx. Riel y encabezado los pone App.jsx; el cuerpo entero es lienzo (VistaLienzo), sin banda ni tarjeta
// de decisión (1540 × 895 u a 1920 × 1080):
//   - a la izquierda, el panel de tinta llena que aprobó el usuario en la fase 10: lo que pedimos (la idea, el pedido en
//     tres renglones y los dos montos, G64 para saberlo y G39 para apostarlo, escritos y sin eje) y, abajo, por qué con
//     este equipo;
//   - a la derecha, el cierre en una tarjeta blanca: el contacto (una sola persona: nombre, su rol en el plan y el mail
//     de la facultad, que se puede seleccionar) y el QR que lleva al informe (INFORME.url), dibujado en SVG desde la
//     matriz que deja pipeline/informe_paginas.py en informe.js (INFORME_QR: nivel M, sin red ni imagen externa), con
//     su margen blanco de cuatro módulos; al lado, qué abre y la dirección, sacada de INFORME.url.
// Pasos (spec 2 de la fase 10), en el orden en que habla el orador: 1 lo que pedimos; 2 por qué con este equipo; 3 el
// contacto y el QR. Nada se boceta: el panel se abre de izquierda a derecha y sus renglones entran de a uno (Paso
// oculto, orden); los motivos y las piezas del cierre, lo mismo. Todo en u (useU); las cifras, de DF con formato.js; los
// textos, de textosDe('V16').

import { VistaLienzo } from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { INFORME, INFORME_QR } from '../informe.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, usd } from '../../../e3/src/formato.js'
import { CTX, INK, PISTA, SUP, TRAZO, Anima, Paso, ancho, envolver, rectRedondo, tam, useU } from '../svg.jsx'
import { escalonado } from '../pasos.js'
import './V15_cierre.css'

const ID = 'V16'
const A = DF.anclas
const X = textosDe(ID)
const v = (id) => A[id].valor
const MONO = { fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }
/** Paso 1: el panel se abre en PANEL_MS y sus renglones entran uno detrás de otro cada PANEL_ESC. */
const PANEL_MS = 450
const PANEL_ESC = 95
/** El margen blanco del QR, en módulos (la norma pide cuatro). */
const MARGEN_QR = 4

export const meta = { id: ID, pasos: 3 }

/** Una cifra de formato.js partida en lo que va antes del número (USD) y el número. */
function partes(s) {
  const t = String(s).split(NBSP)
  if (t.length === 1) return { num: t[0] }
  return /^\D+$/.test(t[0]) ? { antes: t[0], num: t[1] } : { num: t[0], despues: t[1] }
}

/** Renglones parejos: los mismos que envolver() en w, pero con el ancho más chico que no agrega renglones. */
function parejo(texto, w, f, peso) {
  const n = envolver(texto, w, f, peso).length
  let lo = w / n, hi = w
  for (let i = 0; i < 18; i++) {
    const m = (lo + hi) / 2
    if (envolver(texto, m, f, peso).length > n) lo = m
    else hi = m
  }
  return envolver(texto, hi, f, peso)
}

/** Rótulo de bloque: mono, mayúsculas, 22 u, con un filete corto a la izquierda (como la sección del encabezado). */
function RotuloBloque({ u, x, y, texto, color = CTX, filete = INK }) {
  return (
    <g>
      <line x1={x} x2={x + 28 * u} y1={y} y2={y} stroke={filete} strokeWidth={3 * u} />
      <text x={x + 40 * u} y={y} fontSize={tam(22, u)} fontWeight={600} fill={color} dominantBaseline="central"
            style={MONO}>{texto}</text>
    </g>
  )
}

// ---------------------------------------------------------------- panel del pedido (tinta llena, texto blanco)
// Cada medida devuelve su alto y sus partes: una función (x, y) → dibujo por renglón, para que cada uno entre en su
// lugar del escalonado. (x, y) es la esquina de arriba a la izquierda del bloque entero.

const BLANCO = SUP
const BLANCO_2 = 0.8 // opacidad del texto secundario sobre tinta

/** La idea: dos frases, una debajo de la otra, blanco 700, con la letra más grande entre `piso` y `desde` en la que
 *  las dos entran en w; si no entran ni en el piso, en renglones parejos. Una parte por frase. */
function medirIdea(u, w, desde, piso) {
  let f = desde
  while (f > piso && X.idea.some((t) => ancho(t, f, 700) > w)) f -= 0.5 * u
  const frases = X.idea.map((t) => parejo(t, w, f, 700))
  const inter = f * 1.18
  const alto = frases.reduce((s, ls) => s + ls.length, 0) * inter
  let n = 0
  const partesIdea = frases.map((ls) => {
    const desdeRenglon = n
    n += ls.length
    return (x, y) => (
      <g>
        {ls.map((l, i) => (
          <text key={i} x={x} y={y + (desdeRenglon + i) * inter} fontSize={f} fontWeight={700} fill={BLANCO}
                letterSpacing={-0.01 * f} dominantBaseline="hanging">{l}</text>
        ))}
      </g>
    )
  })
  return { alto, inter, partes: partesIdea }
}

/** El pedido en tres renglones: un círculo numerado por paso y el rombo de la decisión, unidos por una línea; la acción
 *  en blanco 700 y el dato detrás, más tenue (o debajo, si no entra en el renglón). La letra es la más grande, de 28 u a
 *  24 u (por k), con la que cada uno entra en su renglón. Cada renglón lleva el tramo de línea que lo une con el de arriba. */
function medirPedido(u, w, k = 1) {
  const r = 19 * k * u
  const xt = 2 * r + 16 * u
  const crudos = [
    ...X.pedido.map((p, i) => ({ ...p, marca: fijo(i + 1), sep: `${NBSP}${X.separador}${NBSP}` })),
    { ...X.desenlace, marca: null, sep: NBSP },
  ]
  const largo = (p, f) => ancho(p.accion, f, 700) + (p.dato ? ancho(`${p.sep}${p.dato}`, f) : 0)
  let f = tam(28 * k, u)
  while (f > tam(24 * k, u) && crudos.some((p) => largo(p, f) > w - xt)) f -= 0.5 * u
  const items = crudos.map((p) => ({ ...p, una: largo(p, f) <= w - xt }))
  const fila = (p) => Math.max(p.una ? f * 1.25 : f * 2.45, 2 * r)
  const gap = 20 * u
  const alto = items.reduce((s, p) => s + fila(p), 0) + gap * (items.length - 1)
  const centros = []
  let yy = 0
  for (const p of items) {
    centros.push(yy + (p.una ? fila(p) / 2 : r))
    yy += fila(p) + gap
  }
  const medio = (p) => (p.marca ? r : r * 1.15)
  const partesPedido = items.map((p, i) => (x, y) => {
    const c = y + centros[i]
    return (
      <g>
        {i > 0 && (
          <line x1={x + r} x2={x + r} y1={y + centros[i - 1] + medio(items[i - 1])} y2={c - medio(p)} stroke={BLANCO}
                strokeOpacity={0.45} strokeWidth={3 * u} />
        )}
        {p.marca
          ? (
            <>
              <circle cx={x + r} cy={c} r={r} fill={BLANCO} />
              <text x={x + r} y={c} fontSize={tam(22, u)} fontWeight={700} fill={INK} textAnchor="middle"
                    dominantBaseline="central">{p.marca}</text>
            </>
          )
          : <path d={`M${x + r} ${c - r * 1.15} L${x + r * 2.15} ${c} L${x + r} ${c + r * 1.15} L${x - r * 0.15} ${c} Z`}
                  fill={BLANCO} />}
        {p.una
          ? (
            <text x={x + xt} y={c} fontSize={f} fill={BLANCO} dominantBaseline="central">
              <tspan fontWeight={700}>{p.accion}</tspan>
              {p.dato && <tspan fillOpacity={BLANCO_2}>{`${p.sep}${p.dato}`}</tspan>}
            </text>
          )
          : (
            <>
              <text x={x + xt} y={c} fontSize={f} fontWeight={700} fill={BLANCO} dominantBaseline="central">{p.accion}</text>
              <text x={x + xt} y={c + f * 1.2} fontSize={f} fill={BLANCO} fillOpacity={BLANCO_2}
                    dominantBaseline="central">{p.dato}</text>
            </>
          )}
      </g>
    )
  })
  return { alto, partes: partesPedido }
}

/** Los dos montos, escritos y sin eje: lo que cuesta saberlo (G64, piloto mínimo) y lo que costaría apostarlo (G39,
 *  proyecto entero el primer año), en dos columnas separadas por un filete (que entra con la segunda). Cada una: el
 *  monto, para qué y qué es. */
function medirMontos(u, w, k = 1) {
  const C = X.comparar
  const f = tam(26 * k, u), fN = tam(24 * k, u)
  const gapC = 44 * u
  const col = (w - gapC) / 2
  // el monto, de 56 u (por k) para abajo hasta que el más ancho entra en su columna
  const anchoMonto = (q, fv) => {
    const p = partes(usd(q))
    return (p.antes ? ancho(`${p.antes}${NBSP}`, fv * 0.5, 600) : 0) + ancho(p.num, fv, 700) * 0.98
  }
  let fV = tam(56 * k, u)
  while (fV > tam(40, u) && [v('G64'), v('G39')].some((q) => anchoMonto(q, fV) > col)) fV -= u
  const cols = [
    { q: v('G64'), t: C.saberlo, nota: parejo(C.saberloNota, col, fN, 400) },
    { q: v('G39'), t: C.apostarlo, nota: parejo(C.apostarloNota, col, fN, 400) },
  ]
  const nNota = Math.max(...cols.map((c) => c.nota.length))
  const yT = fV * 0.74 + 14 * u
  const yN = yT + f * 1.25
  const alto = yN + nNota * fN * 1.2
  const partesMontos = cols.map((c, i) => (x, y) => {
    const xc = x + i * (col + gapC)
    const p = partes(usd(c.q))
    return (
      <g>
        {i > 0 && (
          <line x1={xc - gapC / 2} x2={xc - gapC / 2} y1={y} y2={y + alto} stroke={BLANCO} strokeOpacity={0.3}
                strokeWidth={TRAZO.guia * u} />
        )}
        <text x={xc} y={y + fV * 0.74} fontSize={fV} fontWeight={700} fill={BLANCO} letterSpacing={-0.02 * fV}>
          {p.antes && <tspan fontSize={fV * 0.5} fontWeight={600}>{`${p.antes}${NBSP}`}</tspan>}
          {p.num}
        </text>
        <text x={xc} y={y + yT} fontSize={f} fontWeight={700} fill={BLANCO} dominantBaseline="hanging">{c.t}</text>
        {c.nota.map((l, j) => (
          <text key={j} x={xc} y={y + yN + j * fN * 1.2} fontSize={fN} fill={BLANCO} fillOpacity={BLANCO_2}
                dominantBaseline="hanging">{l}</text>
        ))}
      </g>
    )
  })
  return { alto, partes: partesMontos }
}

/** Por qué con este equipo: tres motivos, cada uno con un filete blanco a la izquierda; la cabeza en blanco 700 y el
 *  resto debajo, más tenue, en renglones parejos (sin una palabra sola al final). Una parte por motivo. */
function medirPorque(u, w, f) {
  const xt = 24 * u
  const items = X.porque.items.map((it) => [
    ...parejo(it.cabeza, w - xt, f, 700).map((t) => ({ t, peso: 700, op: 1 })),
    ...parejo(it.resto, w - xt, f, 400).map((t) => ({ t, peso: 400, op: BLANCO_2 })),
  ])
  const inter = f * 1.22
  const gap = 18 * u
  const alto = items.reduce((s, l) => s + l.length * inter, 0) + gap * (items.length - 1)
  const desde = []
  let yy = 0
  for (const ls of items) { desde.push(yy); yy += ls.length * inter + gap }
  const partesPorque = items.map((ls, i) => (x, y) => {
    const y0 = y + desde[i]
    return (
      <g>
        <rect x={x} y={y0 + f * 0.1} width={5 * u} height={ls.length * inter - f * 0.2} fill={BLANCO} fillOpacity={0.6} />
        {ls.map((l, j) => (
          <text key={j} x={x + xt} y={y0 + j * inter} fontSize={f} fontWeight={l.peso} fill={BLANCO}
                fillOpacity={l.op} dominantBaseline="hanging">{l.t}</text>
        ))}
      </g>
    )
  })
  return { alto, partes: partesPorque }
}

/** El rótulo de un bloque dentro del panel, en blanco. */
const RotuloPanel = ({ u, x, y, texto }) => <RotuloBloque u={u} x={x} y={y} texto={texto} color={BLANCO} filete={BLANCO} />

/** El panel de ancho w y alto h: arriba el pedido (rótulo, idea, pedido, montos), abajo, pegado al borde, por qué. Prueba
 *  de la letra más grande (por kMax, que crece con el alto del lienzo) a la más chica hasta que todo entra con espacios de
 *  al menos 16 u. */
function medirPanel(u, w, h, kMax = 1) {
  const pad = 38 * u
  const inner = w - 2 * pad
  const altoRot = 22 * u
  const escalas = []
  for (let k = kMax; k > 0.85 + 1e-6; k -= 0.05) escalas.push(k)
  escalas.push(0.85)
  let r = null
  for (const k of escalas) {
    const idea = medirIdea(u, inner, tam(42 * k, u), tam(30 * k, u))
    const pedido = medirPedido(u, inner, Math.max(1, k))
    const montos = medirMontos(u, inner, Math.max(1, k))
    const porq = medirPorque(u, inner, tam(26 * k, u))
    const altoPorque = altoRot + 24 * u + porq.alto
    const fijos = altoRot + idea.alto + pedido.alto + montos.alto
    const libre = h - 2 * pad - fijos - altoPorque
    r = { pad, inner, altoRot, idea, pedido, montos, porq, altoPorque, libre }
    // alcanza si cada frase de la idea va en un renglón y el espacio común (libre / 5,1) es de al menos 24 u (por k)
    const unaPorFrase = idea.partes.length === X.idea.length && idea.alto <= X.idea.length * idea.inter + 0.5
    if (unaPorFrase && libre >= 24 * u * k * 5.1) break
  }
  // tres espacios en el bloque del pedido (del rótulo a la idea, el más corto; de la idea al pedido, el más largo) y uno,
  // de al menos 2,2 veces el común, antes de por qué
  const PESOS = [0.6, 1.3, 1]
  const gP = Math.max(16 * u, Math.min(52 * u * kMax, r.libre / (PESOS.reduce((s, x) => s + x, 0) + 2.2)))
  const ys = []
  let yy = r.pad
  ;[r.altoRot, r.idea.alto, r.pedido.alto, r.montos.alto].forEach((b, i) => { ys.push(yy); yy += b + (PESOS[i] ?? 0) * gP })
  const yPorque = h - r.pad - r.altoPorque
  return { ...r, ys, yPorque, yFilete: (yy + yPorque) / 2 }
}

// ---------------------------------------------------------------- el cierre: contacto y QR

/** La dirección del informe sin el protocolo, partida después de cada «/»: los tramos se juntan en renglones de hasta w
 *  con la letra f. Si un tramo solo no entra, devuelve null. */
function renglonesDireccion(url, w, f) {
  const tramos = url.replace(/^https?:\/\//, '').split(/(?<=\/)/)
  if (tramos.some((t) => ancho(t, f) > w)) return null
  const out = []
  let linea = ''
  for (const t of tramos) {
    if (linea && ancho(linea + t, f) > w) { out.push(linea); linea = t } else linea += t
  }
  if (linea) out.push(linea)
  return out
}

/** El QR de INFORME_QR en un cuadrado de lado s (con su margen blanco de MARGEN_QR módulos), esquina en (x, y): un fondo
 *  blanco y un solo trazado con los módulos oscuros, en tinta. */
function QR({ x, y, s }) {
  const filas = INFORME_QR.filas
  const n = filas.length
  const m = s / (n + 2 * MARGEN_QR)
  const x0 = x + MARGEN_QR * m
  const y0 = y + MARGEN_QR * m
  let d = ''
  filas.forEach((fila, f) => {
    for (let c = 0; c < n; c++) {
      if (fila[c] !== '1') continue
      let k = c
      while (k + 1 < n && fila[k + 1] === '1') k++   // un rectángulo por tramo oscuro de la fila
      d += `M${x0 + c * m} ${y0 + f * m}h${(k - c + 1) * m}v${m}h${-(k - c + 1) * m}z`
      c = k
    }
  })
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill={SUP} />
      <path d={d} fill={INK} shapeRendering="crispEdges" />
    </g>
  )
}

/** La tarjeta del cierre de x0 a x0 + w y de y0 a y0 + h: arriba el contacto (rótulo, nombre, rol y mail); abajo, pegado
 *  al borde, el QR con lo que abre y la dirección. Dos formas, y gana la del QR más grande: lo que abre y la dirección al
 *  lado del QR (el QR de hasta 320 u, con la dirección en 22 u o en 20 u, la que deje el QR más grande) o debajo (de
 *  hasta 440 u; solo si el QR crece 60 u o más, como pasa con el alto de una ventana 4:3). k agranda la letra con el alto
 *  del lienzo. Devuelve las piezas en orden de entrada. */
function medirCierre(u, x0, y0, w, h, k = 1) {
  const C = X.contacto
  const pad = 36 * u
  const inner = w - 2 * pad
  const gapQ = 30 * u
  const fTit = tam(28 * k, u)
  const fNom = tam(42 * k, u), fRol = tam(26 * k, u), fMail = tam(30 * k, u)
  const xT = x0 + pad
  const yRot = y0 + pad + 11 * u
  const yNom = yRot + 11 * u + 30 * u
  const yRol = yNom + fNom * 1.18 + 8 * u
  const yMail = yRol + fRol * 1.3 + 22 * u
  const finContacto = yMail + fMail * 1.2
  const sinProto = INFORME.url.replace(/^https?:\/\//, '')
  const tramos = sinProto.split(/(?<=\/)/)
  const anchoTramos = (f) => Math.max(...tramos.map((t) => ancho(t, f)))
  const altoTexto = (f, n) => fTit * 1.3 + 12 * u + n * f * 1.3
  const libre = y0 + h - pad - (finContacto + 60 * u) // del contacto (más 60 u) al borde de abajo
  let qr = null
  for (const f of [tam(22 * k, u), tam(20, u)]) {
    const s = Math.min(320 * u, libre, inner - gapQ - Math.max(anchoTramos(f), ancho(X.qr.titulo, fTit, 700)))
    if (!qr || s > qr.s) qr = { lado: true, f, s, dir: renglonesDireccion(INFORME.url, inner - gapQ - s + 0.5 * u, f) }
  }
  {
    const f = tam(22 * k, u)
    const dir = renglonesDireccion(INFORME.url, inner, f) ?? [sinProto]
    const s = Math.min(440 * u, inner, libre - 20 * u - altoTexto(f, dir.length))
    if (s >= qr.s + 60 * u) qr = { lado: false, f, s, dir }
  }
  const { lado: alLado, f: fDir, s, dir } = qr
  const altoDebajo = alLado ? 0 : 20 * u + altoTexto(fDir, dir.length)
  const yQ = y0 + h - pad - altoDebajo - s
  const yFilete = (finContacto + yQ) / 2
  const modulo = s / (INFORME_QR.filas.length + 2 * MARGEN_QR)
  // lo que abre y la dirección: al lado, a la altura del primer módulo oscuro; o debajo, alineados con él
  const xL = alLado ? xT + s + gapQ : xT + MARGEN_QR * modulo
  const yL = alLado ? yQ + MARGEN_QR * modulo : yQ + s + 20 * u
  const piezas = [
    <RotuloBloque key="rot" u={u} x={xT} y={yRot} texto={C.titulo} />,
    <text key="nom" x={xT} y={yNom} fontSize={fNom} fontWeight={700} fill={INK} letterSpacing={-0.01 * fNom}
          dominantBaseline="hanging">{C.nombre}</text>,
    <text key="rol" x={xT} y={yRol} fontSize={fRol} fill={CTX} dominantBaseline="hanging">{C.rol}</text>,
    <text key="mail" className="v16-seleccionable" x={xT} y={yMail} fontSize={fMail} fontWeight={600} fill={INK}
          dominantBaseline="hanging">{C.mail}</text>,
    <g key="qr">
      <line x1={xT} x2={xT + inner} y1={yFilete} y2={yFilete} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
      <QR x={xT} y={yQ} s={s} />
    </g>,
    <g key="dir">
      <text x={xL} y={yL} fontSize={fTit} fontWeight={700} fill={INK} dominantBaseline="hanging">{X.qr.titulo}</text>
      {dir.map((l, j) => (
        <text key={j} className="v16-seleccionable" x={xL} y={yL + fTit * 1.3 + 12 * u + j * fDir * 1.3} fontSize={fDir}
              fill={CTX} dominantBaseline="hanging">{l}</text>
      ))}
    </g>,
  ]
  return { piezas }
}

// ---------------------------------------------------------------- el lienzo

function Dibujo({ w, h }) {
  const u = useU()
  const gap = 36 * u
  // con más alto que el de 16:9 (895 u), la letra crece hasta un 30 %: en 4:3 el lienzo mide 1255 u de alto y casi
  // el mismo ancho
  const k = Math.min(1.3, Math.max(1, h / (895 * u)))
  // el panel, de 740 a 800 u en 16:9: lo más ancho que deje 720 u a la tarjeta del cierre (el QR y la dirección a su
  // lado); con más alto, el QR va debajo de la dirección y la tarjeta se angosta hasta 560 u (k = 1,3)
  const wTarjeta = (720 - ((k - 1) / 0.3) * 160) * u
  const wPanel = k > 1.15 ? w - wTarjeta - gap : Math.max(740 * u, Math.min(800 * u, w - wTarjeta - gap))
  const xCierre = wPanel + gap
  const wCierre = w - xCierre
  const H = h * 0.92
  const y0 = (h - H) / 2
  const pn = medirPanel(u, wPanel, H, k)
  const xP = pn.pad
  const ci = medirCierre(u, xCierre, y0, wCierre, H, k)
  // el orden de entrada de los renglones del panel (paso 1): rótulo, las dos frases, los tres del pedido, los dos montos
  const panel = [
    (x) => <RotuloPanel u={u} x={x} y={y0 + pn.ys[0] + 11 * u} texto={X.pedimos} />,
    ...pn.idea.partes.map((el) => (x) => el(x, y0 + pn.ys[1])),
    ...pn.pedido.partes.map((el) => (x) => el(x, y0 + pn.ys[2])),
    ...pn.montos.partes.map((el) => (x) => el(x, y0 + pn.ys[3])),
  ]
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* paso 1: lo que pedimos. El panel se abre de izquierda a derecha y después entran sus renglones */}
      <g style={{ '--fin-escalon': `${PANEL_ESC}ms` }}>
        <Paso n={1} oculto entrada={false}>
          <Anima n={1} efecto="revela-x" dur={PANEL_MS}>
            <path d={rectRedondo(0, y0, wPanel, H, 6 * u, 'todos')} fill={INK} />
          </Anima>
        </Paso>
        {panel.map((el, i) => <Paso key={i} n={1} oculto orden={i + 1}>{el(xP)}</Paso>)}
      </g>

      {/* paso 2: por qué con este equipo, el rótulo y un motivo detrás de otro */}
      <g style={escalonado(pn.porq.partes.length + 1, { total: 800, dur: 320 })}>
        <Paso n={2} oculto orden={0}>
          <line x1={xP} x2={wPanel - pn.pad} y1={y0 + pn.yFilete} y2={y0 + pn.yFilete} stroke={BLANCO} strokeOpacity={0.3}
                strokeWidth={TRAZO.guia * u} />
          <RotuloPanel u={u} x={xP} y={y0 + pn.yPorque + 11 * u} texto={X.porque.titulo} />
        </Paso>
        {pn.porq.partes.map((el, i) => (
          <Paso key={i} n={2} oculto orden={i + 1}>{el(xP, y0 + pn.yPorque + pn.altoRot + 24 * u)}</Paso>
        ))}
      </g>

      {/* paso 3: el cierre. Entra la tarjeta y, una detrás de otra, el contacto, el QR y lo que abre */}
      <g style={escalonado(ci.piezas.length + 1, { total: 1000, dur: 320 })}>
        <Paso n={3} oculto orden={0}>
          <rect x={xCierre} y={y0} width={wCierre} height={H} fill={SUP} stroke={PISTA} strokeWidth={u} />
          <rect x={xCierre} y={y0} width={wCierre} height={5 * u} fill={INK} />
        </Paso>
        {ci.piezas.map((el, i) => <Paso key={i} n={3} oculto orden={i + 1}>{el}</Paso>)}
      </g>
    </svg>
  )
}

export default function V16Pedido() {
  return <VistaLienzo id={ID}>{({ w, h }) => <Dibujo w={w} h={h} />}</VistaLienzo>
}
