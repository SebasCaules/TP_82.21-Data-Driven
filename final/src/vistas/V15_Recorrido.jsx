// V15 · El recorrido (Integrante 1). (19/11, fase 11, spec 2.2) El cierre se parte en dos vistas y esta lleva el paneo de
// la presentación: el recorrido de las cinco secciones y lo que nos llevamos. La segunda mitad (lo que pedimos, por qué
// con este equipo y el contacto) es V16_Pedido.jsx. Riel y encabezado los pone App.jsx; el cuerpo entero es lienzo
// (VistaLienzo), sin banda ni tarjeta de decisión. El contenido es el que aprobó el usuario en la fase 10 (V15, camino),
// ahora a todo el ancho del lienzo (1540 × 895 u a 1920 × 1080):
//   - arriba, el recorrido: las cinco secciones como estaciones de una línea que avanza hacia la derecha (arriba y abajo,
//     alternadas) y sigue hacia la vista siguiente. Cada estación: número (en la línea), nombre (del rótulo del riel de
//     su bloque), una cifra de DF, una línea y un dibujo mínimo sin rótulos que recuerda el gráfico de la sección: el
//     flujo de V02 (C20), la regla sobre el 100 % (J03.regla), la cuadrícula de V07 (G54 sobre G39), la escalera de V10
//     hacia la primera lista (legal_previas) y el plan de V14 hacia la decisión (plan). En todos, el acento es lo que
//     cuenta la cifra y el gris, el resto (la leyenda, en el hueco junto a la estación 4);
//   - abajo, lo que nos llevamos: el balance de CF en una fila de cuatro.
// Pasos (spec 2 de la fase 10), en el orden en que habla el orador: 1 el recorrido; 2 lo que nos llevamos. Nada se
// boceta: estaciones y piezas del balance no se ven hasta su paso (Paso oculto) y entran de a una (orden). En el paso 1
// la línea se traza de izquierda a derecha y cada estación entra cuando la línea llega a su número. Todo en u (useU); las
// cifras, de DF con formato.js; los textos, de textosDe('V15') y de CF.

import { VistaLienzo } from '../Plantilla.jsx'
import { CF } from '../contenido_final.js'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct, usd } from '../../../e3/src/formato.js'
import {
  ACC, CTX, EJE, FIN_GRIS, INK, PISTA, SUP, TRAZO, Anima, Muestra, Paso, ancho, envolver, escalaSemanas, rectRedondo,
  tam, useU,
} from '../svg.jsx'
import { escalonado } from '../pasos.js'
import './V15_cierre.css'

const ID = 'V15'
const A = DF.anclas
const T = DF.tablas
const X = textosDe(ID)
const P = X.piezas
const v = (id) => A[id].valor
const SEM_LISTA = T.calendario.primera_lista.semana
const SEM_FIN = v('G63.semana_decision')
const SEM_1 = Math.min(...T.plan.fases.map((f) => f.desde))
/** El dibujo mínimo no crece más que esto (en u): en 4:3 el alto que sobra va a los espacios, no a estirarlo. */
const MINI_MAX = 130
const MONO = { fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }
/** Tiempos del paso 1, en ms: la línea se traza en RUTA_MS (lineal, V15_cierre.css) y la estación i entra a los
 *  (i + 1) × RUTA_ESC, cuando la línea llega a su número; la leyenda y la punta, al final. Todo termina antes de 1,2 s. */
const RUTA_MS = 900
const RUTA_ESC = 145

export const meta = { id: ID, pasos: 2 }

/** El número y el nombre de una sección, del rótulo del riel de su bloque («1 · Datos»). */
function seccion(id) {
  const b = CF.BLOQUES.find((x) => x.id === id)
  const [n, ...resto] = (b.riel ?? b.titulo).split(' · ')
  return { n, nombre: resto.join(' · ') }
}

/** Una cifra de formato.js partida en lo que va antes del número (USD) y lo que va después (%). */
function partes(s) {
  const t = String(s).split(NBSP)
  if (t.length === 1) return { num: t[0] }
  return /^\D+$/.test(t[0]) ? { antes: t[0], num: t[1] } : { num: t[0], despues: t[1] }
}

/** Renglones parejos: los mismos que envolver() en w, pero con el ancho más chico que no agrega renglones (sin una
 *  palabra sola al final). */
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

// ---------------------------------------------------------------- dibujos mínimos (uno por estación, sin rótulos)
// Cada uno dibuja dentro de su caja (x, y, w, h, en px), a escala de su dato.

/** 1 Datos: el flujo de V02. La banda del extracto (C20.crudo) se parte: baja lo que queda afuera y sigue, en acento,
 *  lo que entra a la lista (C20.positivas). El alto de cada tramo es proporcional a sus filas. */
function MiniFlujo({ u, x, y, w, h }) {
  const crudo = v('C20.crudo')
  const pos = v('C20.positivas')
  const ri = 8 * u
  const Hb = Math.min(64 * u, (h - ri) * 0.55)
  const yb = y
  const hr = Hb * (pos / crudo)
  const td = Hb - hr
  const ro = ri + td
  const xd = x + w * 0.38
  const punta = 20 * u
  const gap = 2 * u
  const yFin = y + h
  return (
    <g>
      <rect x={x} y={yb} width={xd - x - gap} height={Hb} fill={FIN_GRIS} />
      <path d={`M${xd} ${yb} H${x + w - punta} L${x + w} ${yb + hr / 2} L${x + w - punta} ${yb + hr - gap / 2} H${xd} Z`}
            fill={ACC} />
      <path d={`M${xd} ${yb + hr + gap / 2} A${ro - gap / 2} ${ro - gap / 2} 0 0 1 ${xd + ro - gap / 2} ${yb + Hb + ri} `
        + `V${yFin} H${xd + ri} V${yb + Hb + ri} A${ri} ${ri} 0 0 0 ${xd} ${yb + Hb} Z`} fill={FIN_GRIS} />
    </g>
  )
}

/** 2 Regla y piloto: lo que acierta la regla (J03.regla) sobre el 100 % de la lista, una barra en acento sobre la pista
 *  gris entera. */
function MiniRegla({ u, x, y, w, h }) {
  const t = Math.min(44 * u, h * 0.4)
  const yt = y + (h - t) / 2
  const r = TRAZO.radio * u
  return (
    <g>
      <path d={rectRedondo(x, yt, w, t, r, 'todos')} fill={FIN_GRIS} />
      <path d={rectRedondo(x, yt, w * v('J03.regla'), t, r, 'todos')} fill={ACC} />
    </g>
  )
}

/** 3 Economía: la cuadrícula de V07. Los cien cuadros son el costo del primer año (G39); lo lleno en acento, lo que
 *  deja la lista en un año (G54), con la parte de un cuadro que le toca. Los cien van en 25 × 4 o en 20 × 5, lo que
 *  deje el cuadro más grande en la caja. */
function MiniCuadros({ u, x, y, w, h }) {
  const g = 2.5 * u
  const lado = ([c, r]) => Math.min((w - (c - 1) * g) / c, (h - (r - 1) * g) / r)
  const [cols, filas] = [[25, 4], [20, 5]].reduce((a, b) => (lado(b) > lado(a) ? b : a))
  const s = lado([cols, filas])
  const altoG = filas * s + (filas - 1) * g
  const y0 = y + (h - altoG) / 2
  const llenos = (v('G54') / v('G39')) * cols * filas
  const n = Math.floor(llenos)
  const resto = llenos - n
  const cx = (i) => x + (i % cols) * (s + g)
  const cy = (i) => y0 + Math.floor(i / cols) * (s + g)
  return (
    <g>
      {Array.from({ length: cols * filas }, (_, i) => (
        <rect key={i} x={cx(i)} y={cy(i)} width={s} height={s} rx={1.5 * u} fill={i < n ? ACC : FIN_GRIS} />
      ))}
      {resto > 0 && <rect x={cx(n)} y={cy(n)} width={s * resto} height={s} fill={ACC} />}
    </g>
  )
}

/** 4 Legal y adopción: la escalera de V10. Un escalón por semana en que vence una acción previa (legal_previas), del
 *  vencimiento a la semana del escalón siguiente y más alto cada vez (el siguiente no se pisa sin cumplir este); al
 *  final, la barra de la primera lista. Cada acción es un cuadro en acento dentro de su escalón, arriba, como en V10:
 *  las de la misma semana, una al lado de la otra. La x es lineal en semanas, como el eje de V10. */
function MiniEscalera({ u, x, y, w, h }) {
  const acc = T.legal_previas.acciones
  const semanas = [...new Set(acc.map((a) => a.semana))].sort((a, b) => a - b)
  const wLista = 7 * u
  const xs = (s) => x + ((s - SEM_1) / (SEM_LISTA - SEM_1)) * (w - wLista)
  const yBase = y + h
  const dh = h / (semanas.length + 1)
  const g = 4 * u
  const pad = 6 * u
  const esc = semanas.map((s, i) => ({
    s, x0: xs(s), x1: xs(semanas[i + 1] ?? SEM_LISTA) - g, y0: yBase - (i + 1) * dh,
    n: acc.filter((a) => a.semana === s).length,
  }))
  const lado = Math.min(24 * u, dh * 0.7, ...esc.map((e) => (e.x1 - e.x0 - 2 * pad - (e.n - 1) * g) / e.n))
  return (
    <g>
      {esc.map((e) => (
        <g key={e.s}>
          <rect x={e.x0} y={e.y0} width={e.x1 - e.x0} height={yBase - e.y0} fill={PISTA} />
          <rect x={e.x0} y={e.y0} width={e.x1 - e.x0} height={3 * u} fill={FIN_GRIS} />
          {Array.from({ length: e.n }, (_, j) => (
            <rect key={j} x={e.x0 + pad + j * (lado + g)} y={e.y0 + (dh - lado) / 2 + 1.5 * u} width={lado} height={lado}
                  rx={1.5 * u} fill={ACC} />
          ))}
        </g>
      ))}
      <line x1={x} x2={x + w} y1={yBase} y2={yBase} stroke={EJE} strokeWidth={2 * u} />
      <rect x={x + w - wLista} y={y} width={wLista} height={h} fill={INK} />
    </g>
  )
}

/** 5 Gestión: el plan de V14. Una barra en acento por fase, de su semana `desde` a su semana `hasta`, y la barra de la
 *  decisión al final (G63.semana_decision). */
function MiniPlan({ u, x, y, w, h }) {
  const fases = T.plan.fases
  const S = escalaSemanas({ x0: x, x1: x + w - 7 * u, desde: SEM_1, hasta: SEM_FIN })
  const xc = S.fin(SEM_FIN)
  const yr0 = y + 4 * u
  const yr1 = y + h - 4 * u
  const p = (yr1 - yr0) / fases.length
  const t = Math.min(16 * u, p * 0.7)
  return (
    <g>
      {fases.map((fa, i) => {
        const yc = yr0 + (i + 0.5) * p
        const x1 = S.inicio(fa.desde)
        return <path key={fa.n} d={rectRedondo(x1, yc - t / 2, S.fin(fa.hasta) - x1, t, 2 * u, 'todos')} fill={ACC} />
      })}
      <line x1={xc} x2={xc} y1={y} y2={y + h} stroke={INK} strokeWidth={7 * u} />
    </g>
  )
}

const PIEZAS = [
  { ...seccion('datos'), ...P.datos, ...partes(fijo(v('C20.positivas'))), Mini: MiniFlujo },
  { ...seccion('modelo'), ...P.modelo, ...partes(pct(v('J03.regla'))), Mini: MiniRegla },
  { ...seccion('economia'), ...partes(usd(v('G54'))), ...P.economia, Mini: MiniCuadros },
  { ...seccion('legal'), ...partes(fijo(T.legal_previas.n)), ...P.legal, Mini: MiniEscalera },
  { ...seccion('gestion'), ...partes(fijo(T.plan.semanas)), ...P.gestion, Mini: MiniPlan },
]

// ---------------------------------------------------------------- estaciones

/** Lo que va antes del número (USD), al 0,5 de la cifra, y lo que va después (%, «por año»), al 0,45: con la cifra en
 *  44,5 u o más, ninguno baja de 20 u. */
const ANTES = 0.5
const DESPUES = 0.45

/** Ancho de la cifra de una estación con su letra f. */
const anchoCifra = (p, f) => (p.antes ? ancho(`${p.antes}${NBSP}`, f * ANTES, 600) : 0) + ancho(p.num, f, 700) * 0.98
  + (p.despues ? ancho(`${NBSP}${p.despues}`, f * DESPUES, 600) : 0)

/** La cifra grande con lo que va antes y después, sobre la línea de base y. */
function Cifra({ x, y, f, p }) {
  return (
    <text x={x} y={y} fontSize={f} fontWeight={700} fill={INK} letterSpacing={-0.02 * f}>
      {p.antes && <tspan fontSize={f * ANTES} fontWeight={600}>{`${p.antes}${NBSP}`}</tspan>}
      {p.num}
      {p.despues && <tspan fontSize={f * DESPUES} fontWeight={600}>{`${NBSP}${p.despues}`}</tspan>}
    </text>
  )
}

/** Medidas de una estación de ancho w (en px): relleno, letras, renglones y alto del dibujo mínimo. La cifra va con la
 *  letra más grande, de 60 u a 46 u, con la que entran las cinco; el nombre a 28 u y la línea a 26 u, en renglones
 *  parejos, y todas reservan los renglones de la más larga (así los dibujos quedan alineados). `alto` es el total. */
function medirPieza(u, w, altoMini) {
  const pad = 20 * u
  const cw = w - 2 * pad
  const fNombre = tam(28, u)
  const fTexto = tam(26, u)
  let fCifra = 60 * u
  while (fCifra > 46 * u && PIEZAS.some((p) => anchoCifra(p, fCifra) > cw)) fCifra -= 0.5 * u
  const descs = PIEZAS.map((p) => parejo(p.desc, cw, fTexto, 600))
  const nDesc = Math.max(...descs.map((d) => d.length))
  const yCifra = pad + fNombre * 1.15 + 10 * u + 0.74 * fCifra
  const yTexto = yCifra + 14 * u
  const yMini = yTexto + nDesc * fTexto * 1.2 + 18 * u
  return { pad, fNombre, fCifra, fTexto, descs, altoMini, yCifra, yTexto, yMini, alto: yMini + altoMini + pad }
}

/** Una estación en su caja (x, y, w; alto m.alto): nombre, cifra, la línea y el dibujo mínimo abajo. Las cajas tienen
 *  todas el mismo alto; si la línea de la estación ocupa menos renglones que la más larga, el dibujo toma ese lugar. */
function Pieza({ u, p, i, x, y, w, m }) {
  const x0 = x + m.pad
  const M = p.Mini
  const yMini = m.yTexto + m.descs[i].length * m.fTexto * 1.2 + 18 * u
  return (
    <g>
      <text x={x0} y={y + m.pad} fontSize={m.fNombre} fontWeight={700} fill={INK} dominantBaseline="hanging">{p.nombre}</text>
      <Cifra x={x0} y={y + m.yCifra} f={m.fCifra} p={p} />
      {m.descs[i].map((l, j) => (
        <text key={j} x={x0} y={y + m.yTexto + j * m.fTexto * 1.2} fontSize={m.fTexto} fontWeight={600} fill={INK}
              dominantBaseline="hanging">{l}</text>
      ))}
      <M u={u} x={x0} y={y + yMini} w={w - 2 * m.pad} h={m.alto - m.pad - yMini} />
    </g>
  )
}

/** La tarjeta blanca de una estación, con su filete de tinta del lado de la línea (abajo, con `abajo`). */
const Tarjeta = ({ u, x, y, w, h, abajo = false }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={SUP} stroke={PISTA} strokeWidth={u} />
    <rect x={x} y={abajo ? y + h - 5 * u : y} width={w} height={5 * u} fill={INK} />
  </g>
)

/** Rótulo de bloque: mono, mayúsculas, 22 u, con un filete corto a la izquierda (como la sección del encabezado). */
function RotuloBloque({ u, x, y, texto }) {
  return (
    <g>
      <line x1={x} x2={x + 28 * u} y1={y} y2={y} stroke={INK} strokeWidth={3 * u} />
      <text x={x + 40 * u} y={y} fontSize={tam(22, u)} fontWeight={600} fill={CTX} dominantBaseline="central"
            style={MONO}>{texto}</text>
    </g>
  )
}

/** La leyenda de los dibujos mínimos: acento, lo que mide la cifra; gris, el resto. */
const LEY = [{ marca: 'hecho', texto: X.ley.cifra }, { marca: 'contexto', texto: X.ley.resto }]

/** La leyenda en columna, para el hueco angosto junto a la estación 4: un ítem debajo del otro, el texto envuelto a la
 *  derecha de su muestra. (x, y): la esquina de arriba a la izquierda. Devuelve { alto, el }. */
function medirLeyenda(u, w, f = 24) {
  const fz = tam(f, u)
  const xt = fz + 12 * u
  const items = LEY.map((it) => ({ ...it, ls: envolver(it.texto, w - xt, fz) }))
  const alto = items.reduce((s, it) => s + it.ls.length * fz * 1.2, 0) + 16 * u * (items.length - 1)
  const el = (x, y) => {
    let yy = y
    return (
      <g>
        {items.map((it, i) => {
          const c = yy + fz * 0.6
          yy += it.ls.length * fz * 1.2 + 16 * u
          return (
            <g key={i}>
              <Muestra u={u} marca={it.marca} x={x + fz / 2} y={c} s={fz} />
              {it.ls.map((l, j) => (
                <text key={j} x={x + xt} y={c + j * fz * 1.2} fontSize={fz} fill={INK} dominantBaseline="central">{l}</text>
              ))}
            </g>
          )
        })}
      </g>
    )
  }
  return { alto, el }
}

// ---------------------------------------------------------------- lo que nos llevamos (una fila de cuatro)

/** El balance de CF en una fila de cuatro piezas: un filete fino arriba, lo que es (700, tinta) y el texto debajo (CTX),
 *  en renglones parejos. La letra es 26 u, o la más grande de 26 a 22 con la que ningún texto pasa de tres renglones.
 *  Devuelve el alto, el rótulo y una función (x, y) → dibujo por pieza. */
function medirBalance(u, w) {
  const items = X.balance
  const gap = 36 * u
  const wT = (w - gap * (items.length - 1)) / items.length
  let f = tam(26, u)
  while (f > tam(22, u) && items.some((b) => envolver(b.texto, wT, f).length > 3)) f -= 0.5 * u
  const fQue = tam(28, u)
  const textos = items.map((b) => parejo(b.texto, wT, f, 400))
  const n = Math.max(...textos.map((t) => t.length))
  const yRot = 11 * u
  const yPiezas = yRot + 11 * u + 28 * u
  const yQue = 18 * u
  const yTxt = yQue + fQue * 1.2 + 8 * u
  const alto = yPiezas + yTxt + n * f * 1.3
  const rotulo = (x, y) => <RotuloBloque u={u} x={x} y={y + yRot} texto={X.llevamos} />
  const piezas = items.map((b, i) => (x, y) => {
    const x0 = x + i * (wT + gap)
    const y0 = y + yPiezas
    return (
      <g>
        <line x1={x0} x2={x0 + wT} y1={y0} y2={y0} stroke={INK} strokeWidth={2 * u} />
        <text x={x0} y={y0 + yQue} fontSize={fQue} fontWeight={700} fill={INK} dominantBaseline="hanging">{b.que}</text>
        {textos[i].map((l, j) => (
          <text key={j} x={x0} y={y0 + yTxt + j * f * 1.3} fontSize={f} fill={CTX} dominantBaseline="hanging">{l}</text>
        ))}
      </g>
    )
  })
  return { alto, rotulo, piezas }
}

// ---------------------------------------------------------------- el lienzo

function Dibujo({ w, h }) {
  const u = useU()
  // estaciones: arriba la 1, la 3 y la 5; abajo la 2 y la 4; cada nodo en el centro de su caja. Las tres de arriba
  // ocupan el ancho entero con dos huecos de gapE
  const gapE = 40 * u
  const wE = (w - 2 * gapE) / 3
  const medioPaso = (wE + gapE) / 2
  const xNodo = (i) => wE / 2 + i * medioPaso
  const rN = 26 * u
  const bal = medirBalance(u, w)
  // alto: lo fijo, y lo que sobra hasta el 92 % del lienzo va primero al dibujo mínimo (hasta MINI_MAX), después a los
  // tallos y al espacio antes del balance; lo que queda se reparte arriba y abajo
  const tallo0 = 14 * u
  const gapBal0 = 36 * u
  const base = medirPieza(u, wE, 0)
  const fijos = 2 * base.alto + 2 * tallo0 + 2 * rN + gapBal0 + bal.alto
  const H0 = h * 0.92
  const altoMini = Math.max(56 * u, Math.min(MINI_MAX * u, (H0 - fijos) / 2))
  const mp = medirPieza(u, wE, altoMini)
  const resto = Math.max(0, H0 - fijos - 2 * altoMini)
  const tallo = tallo0 + Math.min(resto * 0.2, 40 * u)
  const gapBal = gapBal0 + Math.min(resto * 0.4, 80 * u)
  const hE = mp.alto
  const H = 2 * hE + 2 * tallo + 2 * rN + gapBal + bal.alto
  const yArr = Math.max(0, (h - H) / 2)
  const yRuta = yArr + hE + tallo + rN
  const yAba = yRuta + rN + tallo
  const yBal = yAba + hE + gapBal
  const xFinRuta = w - 28 * u
  // la leyenda de los dibujos, en el hueco a la derecha de la última estación de abajo, a la altura de los dibujos
  const n = PIEZAS.length
  const iAbajo = n % 2 ? n - 2 : n - 1
  const xLey = xNodo(iAbajo) + wE / 2 + gapE
  const ley = medirLeyenda(u, w - xLey)
  const yLey = yAba + mp.yMini + Math.max(0, (mp.altoMini - ley.alto) / 2)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* paso 1: el recorrido. La línea se traza de izquierda a derecha y sigue hacia la vista siguiente; cada estación
          entra cuando la línea llega a su número, y al final la leyenda y la punta */}
      <g className="v15-ruta" style={{ '--fin-escalon': `${RUTA_ESC}ms` }}>
        <Anima n={1} efecto="traza" dur={RUTA_MS}>
          <path d={`M0 ${yRuta} H${xFinRuta}`} pathLength={1} fill="none" stroke={INK} strokeWidth={6 * u} />
        </Anima>
        <Anima n={1} efecto="funde" i={6} dur={200}>
          <path d={`M${w - 30 * u} ${yRuta - 18 * u} L${w} ${yRuta} L${w - 30 * u} ${yRuta + 18 * u} Z`} fill={INK} />
        </Anima>
        {PIEZAS.map((p, i) => {
          const arriba = i % 2 === 0
          const xc = xNodo(i)
          const x = xc - wE / 2
          const y = arriba ? yArr : yAba
          return (
            <Paso key={p.n} n={1} oculto orden={i + 1}>
              <line x1={xc} x2={xc} y1={arriba ? y + hE : yRuta} y2={arriba ? yRuta : y} stroke={INK} strokeWidth={3 * u} />
              <Tarjeta u={u} x={x} y={y} w={wE} h={hE} abajo={arriba} />
              <Pieza u={u} p={p} i={i} x={x} y={y} w={wE} m={mp} />
              <circle cx={xc} cy={yRuta} r={rN} fill={INK} stroke={SUP} strokeWidth={4 * u} />
              <text x={xc} y={yRuta} fontSize={tam(28, u)} fontWeight={700} fill={SUP} textAnchor="middle"
                    dominantBaseline="central">{p.n}</text>
            </Paso>
          )
        })}
        <Paso n={1} oculto orden={5.8}>{ley.el(xLey, yLey)}</Paso>
      </g>

      {/* paso 2: lo que nos llevamos, el rótulo y una pieza detrás de otra */}
      <g style={escalonado(bal.piezas.length + 1, { total: 900, dur: 320 })}>
        <Paso n={2} oculto orden={0}>{bal.rotulo(0, yBal)}</Paso>
        {bal.piezas.map((el, i) => <Paso key={i} n={2} oculto orden={i + 1}>{el(0, yBal)}</Paso>)}
      </g>
    </svg>
  )
}

export default function V15Recorrido() {
  return <VistaLienzo id={ID}>{({ w, h }) => <Dibujo w={w} h={h} />}</VistaLienzo>
}
