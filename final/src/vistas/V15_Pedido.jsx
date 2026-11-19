// V15 · Cierre (Sebastian C.), a pantalla completa (meta.plena, spec 1.5 de la fase 8): sin riel, sin encabezado, sin
// banda y sin tarjeta verde. Es el fondo de los seis minutos de preguntas. La versión que eligió el usuario es el camino
// (fase 8, b), «mucho más digerible» (fase 9, spec 4, V15):
//   - arriba, la marca de Casa Óga, el título (la pregunta de CF) y, a la derecha, la sección del informe (CF.fuente),
//     como en el encabezado de las otras vistas;
//   - el recorrido: las cinco secciones como estaciones de una línea que avanza hacia la derecha (arriba y abajo,
//     alternadas) y entra con su punta en el panel del pedido. Cada estación: número (en la línea), nombre (del rótulo
//     del riel del bloque), una cifra de DF, una línea y un dibujo mínimo sin rótulos que recuerda el gráfico de la
//     sección: el flujo de V02 (C20), la regla sobre el 100 % (J03.regla), la cuadrícula de V07 (G54 sobre G39), las
//     acciones previas de V10 hacia la primera lista (legal_previas) y el plan de V14 hacia la decisión (plan). En todos,
//     el acento es lo que cuenta la cifra y el gris, el resto (la leyenda, en el hueco junto a la estación 4);
//   - lo que nos llevamos: el balance de CF en una fila de cuatro;
//   - lo que pedimos, en el panel de tinta llena: la idea, el pedido en tres renglones y los dos montos (G64 para
//     saberlo, G39 para apostarlo), escritos y sin eje; abajo, por qué con este equipo.
// Pasos (spec 2), en el orden en que habla el orador: 1 el recorrido; 2 el balance; 3 el pedido; 4 por qué con este
// equipo. Todo en u (useU); las cifras, de DF con formato.js; los textos, de textosDe('V15') y de CF.

import { VistaPlena } from '../Plantilla.jsx'
import { CF } from '../contenido_final.js'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct, usd } from '../../../e3/src/formato.js'
import {
  ACC, CTX, EJE, FIN_GRIS, INK, PISTA, SUP, TRAZO, Compuerta, Muestra, Paso, ancho, envolver, escalaSemanas,
  rectRedondo, tam, useU,
} from '../svg.jsx'
import { useEstadoPaso } from '../pasos.js'
import './V15_cierre.css'

const ID = 'V15'
const A = DF.anclas
const T = DF.tablas
const X = textosDe(ID)
const P = X.piezas
const v = (id) => A[id].valor
const VISTA = CF.BLOQUES.flatMap((b) => b.vistas).find((x) => x.id === ID)
const SEM_LISTA = T.calendario.primera_lista.semana
const SEM_FIN = v('G63.semana_decision')
const SEM_1 = Math.min(...T.plan.fases.map((f) => f.desde))
/** El dibujo mínimo no crece más que esto (en u): en 4:3 el alto que sobra va a los espacios, no a estirarlo. */
const MINI_MAX = 120
const MONO = { fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }

export const meta = { id: ID, plena: true, pasos: 4 }

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

// ---------------------------------------------------------------- dibujos mínimos (uno por estación, sin rótulos)
// Cada uno dibuja dentro de su caja (x, y, w, h, en px), a escala de su dato.

/** 1 Datos: el flujo de V02. La banda del extracto (C20.crudo) se parte: baja lo que queda afuera y sigue, en acento,
 *  lo que entra a la lista (C20.positivas). El alto de cada tramo es proporcional a sus filas. */
function MiniFlujo({ u, x, y, w, h }) {
  const crudo = v('C20.crudo')
  const pos = v('C20.positivas')
  const ri = 8 * u
  const Hb = Math.min(56 * u, (h - ri) * 0.55)
  const yb = y
  const hr = Hb * (pos / crudo)
  const td = Hb - hr
  const ro = ri + td
  const xd = x + w * 0.38
  const punta = 18 * u
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
  const t = Math.min(40 * u, h * 0.4)
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

/** 4 Legal y adopción: las acciones de V10. Cada acción previa (legal_previas) es un rombo en acento en la semana en que
 *  vence (las de la misma semana, apiladas), sobre una línea que avanza hasta la barra de la primera lista. */
function MiniHitos({ u, x, y, w, h }) {
  const acc = T.legal_previas.acciones
  const S = escalaSemanas({ x0: x, x1: x + w, desde: SEM_1, hasta: SEM_LISTA })
  const xc = S.centro(SEM_LISTA)
  const yBase = y + h - 4 * u
  const porSemana = {}
  for (const a of acc) porSemana[a.semana] = (porSemana[a.semana] ?? 0) + 1
  const pila = Math.max(...Object.values(porSemana))
  const s = Math.min(30, ((yBase - 6 * u - y) / pila) / u)
  const vistos = {}
  return (
    <g>
      <line x1={S.inicio(SEM_1)} x2={xc} y1={yBase} y2={yBase} stroke={EJE} strokeWidth={2 * u} />
      {acc.map((a) => {
        const k = vistos[a.semana] = (vistos[a.semana] ?? 0) + 1
        const yc = yBase - 4 * u - (k - 0.5) * s * u
        return <Compuerta key={a.codigo} u={u} x={S.centro(a.semana)} y={yc} s={s * 0.95} estado="hecho" />
      })}
      <line x1={xc} x2={xc} y1={y} y2={yBase + 4 * u} stroke={INK} strokeWidth={6 * u} />
    </g>
  )
}

/** 5 Gestión: el plan de V14. Una barra en acento por fase, de su semana `desde` a su semana `hasta`, y la barra de la
 *  decisión al final (G63.semana_decision). */
function MiniPlan({ u, x, y, w, h }) {
  const fases = T.plan.fases
  const S = escalaSemanas({ x0: x, x1: x + w - 6 * u, desde: SEM_1, hasta: SEM_FIN })
  const xc = S.fin(SEM_FIN)
  const yr0 = y + 4 * u
  const yr1 = y + h - 4 * u
  const p = (yr1 - yr0) / fases.length
  const t = Math.min(14 * u, p * 0.7)
  return (
    <g>
      {fases.map((fa, i) => {
        const yc = yr0 + (i + 0.5) * p
        const x1 = S.inicio(fa.desde)
        return <path key={fa.n} d={rectRedondo(x1, yc - t / 2, S.fin(fa.hasta) - x1, t, 2 * u, 'todos')} fill={ACC} />
      })}
      <line x1={xc} x2={xc} y1={y} y2={y + h} stroke={INK} strokeWidth={6 * u} />
    </g>
  )
}

const PIEZAS = [
  { ...seccion('datos'), ...P.datos, ...partes(fijo(v('C20.positivas'))), Mini: MiniFlujo },
  { ...seccion('modelo'), ...P.modelo, ...partes(pct(v('J03.regla'))), Mini: MiniRegla },
  { ...seccion('economia'), ...partes(usd(v('G54'))), ...P.economia, Mini: MiniCuadros },
  { ...seccion('legal'), ...partes(fijo(T.legal_previas.n)), ...P.legal, Mini: MiniHitos },
  { ...seccion('gestion'), ...partes(fijo(T.plan.semanas)), ...P.gestion, Mini: MiniPlan },
]

// ---------------------------------------------------------------- estaciones

/** La cifra grande con lo que va antes (USD, al 0,5) y después (%, «por año», al 0,45), sobre la línea de base y. */
function Cifra({ x, y, f, p }) {
  return (
    <text x={x} y={y} fontSize={f} fontWeight={700} fill={INK} letterSpacing={-0.02 * f}>
      {p.antes && <tspan fontSize={f * 0.5} fontWeight={600}>{`${p.antes}${NBSP}`}</tspan>}
      {p.num}
      {p.despues && <tspan fontSize={f * 0.45} fontWeight={600}>{`${NBSP}${p.despues}`}</tspan>}
    </text>
  )
}

/** Medidas de una estación (en px): relleno, letras, renglones y alto del dibujo mínimo. La línea de cada estación va
 *  en un renglón: la letra es la más grande, de 24 u para abajo, con la que entran las cinco. `alto` es el total. */
function medirPieza(u, w, { pad, fNombre, fCifra, altoMini }) {
  const cw = w - 2 * pad
  const f24 = tam(24, u)
  const fTexto = Math.max(tam(20, u), Math.min(f24, ...PIEZAS.map((p) => f24 * (cw / Math.max(cw, ancho(p.desc, f24, 600))))))
  const yCifra = pad + fNombre * 1.15 + 8 * u + 0.74 * fCifra
  const yTexto = yCifra + 12 * u
  const yMini = yTexto + fTexto * 1.2 + 18 * u
  return { pad, fNombre, fCifra, fTexto, altoMini, yCifra, yTexto, yMini, alto: yMini + altoMini + pad }
}

/** Una estación en su caja (x, y, w; alto m.alto): nombre, cifra, la línea y el dibujo mínimo abajo. */
function Pieza({ u, p, x, y, w, m }) {
  const x0 = x + m.pad
  const M = p.Mini
  return (
    <g>
      <text x={x0} y={y + m.pad} fontSize={m.fNombre} fontWeight={700} fill={INK} dominantBaseline="hanging">{p.nombre}</text>
      <Cifra x={x0} y={y + m.yCifra} f={m.fCifra} p={p} />
      <text x={x0} y={y + m.yTexto} fontSize={m.fTexto} fontWeight={600} fill={INK} dominantBaseline="hanging">{p.desc}</text>
      <M u={u} x={x0} y={y + m.yMini} w={w - 2 * m.pad} h={m.altoMini} />
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

/** Rótulo de bloque: mono, mayúsculas, 20 u, con un filete corto a la izquierda (como la sección del marco). */
function RotuloBloque({ u, x, y, texto, color = CTX, filete = ACC }) {
  return (
    <g>
      <line x1={x} x2={x + 26 * u} y1={y} y2={y} stroke={filete} strokeWidth={3 * u} />
      <text x={x + 38 * u} y={y} fontSize={tam(20, u)} fontWeight={600} fill={color} dominantBaseline="central"
            style={MONO}>{texto}</text>
    </g>
  )
}

/** La leyenda de los dibujos mínimos: acento, lo que mide la cifra; gris, el resto. */
const LEY = [{ marca: 'hecho', texto: X.ley.cifra }, { marca: 'contexto', texto: X.ley.resto }]

/** La leyenda en columna, para el hueco angosto junto a la estación 4: un ítem debajo del otro, el texto envuelto a la
 *  derecha de su muestra. (x, y): la esquina de arriba a la izquierda. Devuelve { alto, el }. */
function medirLeyenda(u, w, f = 22) {
  const fz = tam(f, u)
  const xt = fz + 10 * u
  const items = LEY.map((it) => ({ ...it, ls: envolver(it.texto, w - xt, fz) }))
  const alto = items.reduce((s, it) => s + it.ls.length * fz * 1.2, 0) + 14 * u * (items.length - 1)
  const el = (x, y) => {
    let yy = y
    return (
      <g>
        {items.map((it, i) => {
          const c = yy + fz * 0.6
          yy += it.ls.length * fz * 1.2 + 14 * u
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

// ---------------------------------------------------------------- panel del pedido (tinta llena, texto blanco)
// Cada pieza dibuja con el tono `k` que le pasa la vista: { t: texto y marcas, f: lo que va encima de una marca }. Desde
// el paso 3 es blanco sobre tinta; antes, tinta (atenuada por Paso) sobre el fondo. «Blanco», abajo, es k.t.

const BLANCO_2 = 0.8 // opacidad del texto secundario sobre tinta

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

/** La idea: dos frases, cada una en su renglón, blanco 700, con la letra más grande entre `piso` y `desde` en la que
 *  las dos entran en w; si no entran ni en el piso, en renglones parejos. */
function medirIdea(u, w, desde, piso = tam(30, u)) {
  let f = desde
  while (f > piso && X.idea.some((t) => ancho(t, f, 700) > w)) f -= 0.5 * u
  const lineas = X.idea.flatMap((t) => parejo(t, w, f, 700))
  const alto = lineas.length * f * 1.18
  const el = (x, y, k) => lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * 1.18} fontSize={f} fontWeight={700} fill={k.t} letterSpacing={-0.01 * f}
          dominantBaseline="hanging">{l}</text>
  ))
  return { alto, el }
}

/** El pedido en tres renglones: un círculo numerado por paso y el rombo de la decisión, unidos por una línea; la acción
 *  en blanco 700 y el dato detrás, más tenue. La letra es la más grande, de 26 u a 24 u, con la que cada uno entra en
 *  su renglón. */
function medirPedido(u, w) {
  const r = 17 * u
  const xt = 2 * r + 14 * u
  const crudos = [
    ...X.pedido.map((p, i) => ({ ...p, marca: fijo(i + 1), sep: `${NBSP}${X.separador}${NBSP}` })),
    { ...X.desenlace, marca: null, sep: NBSP },
  ]
  const largo = (p, f) => ancho(p.accion, f, 700) + (p.dato ? ancho(`${p.sep}${p.dato}`, f) : 0)
  let f = tam(26, u)
  while (f > tam(24, u) && crudos.some((p) => largo(p, f) > w - xt)) f -= 0.5 * u
  const items = crudos.map((p) => ({ ...p, una: largo(p, f) <= w - xt }))
  const fila = (p) => Math.max(p.una ? f * 1.25 : f * 2.45, 2 * r)
  const gap = 18 * u
  const alto = items.reduce((s, p) => s + fila(p), 0) + gap * (items.length - 1)
  const el = (x, y, k) => {
    let yy = y
    const centros = items.map((p) => {
      const c = yy + (p.una ? fila(p) / 2 : r)
      yy += fila(p) + gap
      return c
    })
    return (
      <g>
        <line x1={x + r} x2={x + r} y1={centros[0]} y2={centros[centros.length - 1]} stroke={k.t} strokeOpacity={0.45}
              strokeWidth={3 * u} />
        {items.map((p, i) => {
          const c = centros[i]
          return (
            <g key={p.accion}>
              {p.marca
                ? (
                  <>
                    <circle cx={x + r} cy={c} r={r} fill={k.t} />
                    <text x={x + r} y={c} fontSize={tam(22, u)} fontWeight={700} fill={k.f} textAnchor="middle"
                          dominantBaseline="central">{p.marca}</text>
                  </>
                )
                : <path d={`M${x + r} ${c - r * 1.15} L${x + r * 2.15} ${c} L${x + r} ${c + r * 1.15} L${x - r * 0.15} ${c} Z`}
                        fill={k.t} />}
              {p.una
                ? (
                  <text x={x + xt} y={c} fontSize={f} fill={k.t} dominantBaseline="central">
                    <tspan fontWeight={700}>{p.accion}</tspan>
                    {p.dato && <tspan fillOpacity={BLANCO_2}>{`${p.sep}${p.dato}`}</tspan>}
                  </text>
                )
                : (
                  <>
                    <text x={x + xt} y={c} fontSize={f} fontWeight={700} fill={k.t} dominantBaseline="central">{p.accion}</text>
                    <text x={x + xt} y={c + f * 1.2} fontSize={f} fill={k.t} fillOpacity={BLANCO_2}
                          dominantBaseline="central">{p.dato}</text>
                  </>
                )}
            </g>
          )
        })}
      </g>
    )
  }
  return { alto, el }
}

/** Los dos montos, escritos y sin eje: lo que cuesta saberlo (G64, piloto mínimo) y lo que costaría apostarlo (G39,
 *  proyecto entero el primer año), en dos columnas separadas por un filete. Cada una: el monto, para qué y qué es. */
function medirMontos(u, w) {
  const C = X.comparar
  const fV = tam(48, u), f = tam(24, u), fN = tam(22, u)
  const gapC = 40 * u
  const col = (w - gapC) / 2
  const cols = [
    { q: v('G64'), t: C.saberlo, nota: envolver(C.saberloNota, col, fN) },
    { q: v('G39'), t: C.apostarlo, nota: envolver(C.apostarloNota, col, fN) },
  ]
  const nNota = Math.max(...cols.map((c) => c.nota.length))
  const yT = fV * 0.74 + 14 * u
  const yN = yT + f * 1.25
  const alto = yN + nNota * fN * 1.2
  const el = (x, y, k) => (
    <g>
      <line x1={x + col + gapC / 2} x2={x + col + gapC / 2} y1={y} y2={y + alto} stroke={k.t} strokeOpacity={0.3}
            strokeWidth={TRAZO.guia * u} />
      {cols.map((c, i) => {
        const xc = x + i * (col + gapC)
        const p = partes(usd(c.q))
        return (
          <g key={c.t}>
            <text x={xc} y={y + fV * 0.74} fontSize={fV} fontWeight={700} fill={k.t} letterSpacing={-0.02 * fV}>
              {p.antes && <tspan fontSize={fV * 0.5} fontWeight={600}>{`${p.antes}${NBSP}`}</tspan>}
              {p.num}
            </text>
            <text x={xc} y={y + yT} fontSize={f} fontWeight={700} fill={k.t} dominantBaseline="hanging">{c.t}</text>
            {c.nota.map((l, j) => (
              <text key={j} x={xc} y={y + yN + j * fN * 1.2} fontSize={fN} fill={k.t} fillOpacity={BLANCO_2}
                    dominantBaseline="hanging">{l}</text>
            ))}
          </g>
        )
      })}
    </g>
  )
  return { alto, el }
}

/** Por qué con este equipo: tres motivos, cada uno con un filete blanco a la izquierda; la cabeza en blanco 700 y el
 *  resto debajo, más tenue, en renglones parejos (sin una palabra sola al final). */
function medirPorque(u, w, f = tam(24, u)) {
  const xt = 22 * u
  const items = X.porque.items.map((it) => [
    ...parejo(it.cabeza, w - xt, f, 700).map((t) => ({ t, peso: 700, op: 1 })),
    ...parejo(it.resto, w - xt, f, 400).map((t) => ({ t, peso: 400, op: BLANCO_2 })),
  ])
  const gap = 16 * u
  const alto = items.reduce((s, l) => s + l.length * f * 1.22, 0) + gap * (items.length - 1)
  const el = (x, y, k) => {
    let yy = y
    return (
      <g>
        {items.map((ls, i) => {
          const y0 = yy
          yy += ls.length * f * 1.22 + gap
          return (
            <g key={i}>
              <rect x={x} y={y0 + f * 0.1} width={5 * u} height={ls.length * f * 1.22 - f * 0.2} fill={k.t} fillOpacity={0.6} />
              {ls.map((l, j) => (
                <text key={j} x={x + xt} y={y0 + j * f * 1.22} fontSize={f} fontWeight={l.peso} fill={k.t}
                      fillOpacity={l.op} dominantBaseline="hanging">{l.t}</text>
              ))}
            </g>
          )
        })}
      </g>
    )
  }
  return { alto, el }
}

/** El rótulo de un bloque dentro del panel, en el tono `k.t` del panel. */
const RotuloPanel = ({ u, x, y, texto, k }) => <RotuloBloque u={u} x={x} y={y} texto={texto} color={k.t} filete={k.t} />

// ---------------------------------------------------------------- marca y título

/** La marca de Casa Óga (el favicon 4b del riel) en tinta y blanco, de lado s px, con su esquina en (x, y). */
function Marca({ x, y, s }) {
  const k = s / 32
  return (
    <g transform={`translate(${x},${y}) scale(${k})`}>
      <path d="M16 1.5 L31 13 L31 30.5 L1 30.5 L1 13 Z" fill={INK} />
      <rect x="6" y="17" width="5" height="9" fill={SUP} />
      <rect x="13.5" y="20" width="5" height="6" fill={SUP} fillOpacity={0.75} />
      <rect x="21" y="23.5" width="5" height="2.5" fill={SUP} fillOpacity={0.5} />
    </g>
  )
}

/** El bloque de marca: la casa, «Casa Óga» y, debajo, el subtítulo del tablero en mono. { ancho, alto, el(x, y) }. */
function medirMarca(u) {
  const s = 46 * u
  const f1 = tam(26, u), f2 = tam(20, u)
  const xt = s + 14 * u
  const w = xt + Math.max(ancho(X.marca, f1, 700), ancho(CF.SUBTITULO.toUpperCase(), f2, 600, true) * 1.08)
  const el = (x, y) => (
    <g>
      <Marca x={x} y={y} s={s} />
      <text x={x + xt} y={y + s * 0.44} fontSize={f1} fontWeight={700} fill={INK}>{X.marca}</text>
      <text x={x + xt} y={y + s * 0.62} fontSize={f2} fontWeight={600} fill={CTX} dominantBaseline="hanging"
            style={MONO}>{CF.SUBTITULO}</text>
    </g>
  )
  return { ancho: w, alto: s, el }
}

/** La letra del título (la pregunta de CF), 700: la más grande entre 40 y `desde` u con la que entra en w. */
function letraTitulo(u, w, desde) {
  let f = desde * u
  while (f > 40 * u && ancho(VISTA.pregunta, f, 700) * 0.98 > w) f -= u
  return f
}

// ---------------------------------------------------------------- el camino

function Dibujo({ w, h }) {
  const u = useU()
  const M = 48 * u
  const extra = Math.max(0, h - 1080 * u)
  const top = 42 * u + extra * 0.08
  const bot = 42 * u + extra * 0.08
  const wPanel = 700 * u
  const xPanel = w - M - wPanel
  const xIzq1 = xPanel - 44 * u
  const wIzq = xIzq1 - M
  // encabezado: marca, título y, a la derecha, la sección del informe (como «n / 15 · fuente» en las otras vistas)
  const mar = medirMarca(u)
  const fF = tam(22, u)
  const fuente = VISTA.fuente ?? ''
  const xTit = M + mar.ancho + 36 * u
  const anchoFuente = fuente ? ancho(fuente, fF) + 40 * u : 0
  const fT = letraTitulo(u, w - M - anchoFuente - xTit, 54)
  const yTit = top + mar.alto * 0.5 + fT * 0.36
  const yCab = top + mar.alto
  // estaciones: arriba la 1, la 3 y la 5; abajo la 2 y la 4; cada nodo en el centro de su caja
  const n = PIEZAS.length
  const nArr = Math.ceil(n / 2)
  const gapE = 28 * u
  const wE = (wIzq - (nArr - 1) * gapE) / nArr
  const paso = (wE + gapE) / 2
  const xNodo = (i) => M + wE / 2 + i * paso
  const rN = 24 * u
  const tallo = 12 * u
  // balance en una fila de cuatro
  const fB = tam(24, u)
  const gapB = 26 * u
  const colB = (wIzq - 3 * gapB) / 4
  const filasB = X.balance.map((b) => ({ ...b, lineas: parejo(b.texto, colB, fB) }))
  const altoBal = 22 * u + 14 * u + 3 * u + 12 * u + fB * 1.3 + Math.max(...filasB.map((b) => b.lineas.length)) * fB * 1.22
  // alto de las estaciones: lo que queda entre el encabezado y el balance
  const yArr = yCab + 30 * u + extra * 0.04
  const libre = h - bot - altoBal - 30 * u - extra * 0.04 - yArr - 2 * (rN + tallo)
  const dims = { pad: 18 * u, fNombre: tam(26, u), fCifra: tam(52, u) }
  const base = medirPieza(u, wE, { ...dims, altoMini: 0 })
  const mp = medirPieza(u, wE, { ...dims, altoMini: Math.min(MINI_MAX * u, Math.max(70 * u, libre / 2 - base.alto)) })
  const hE = mp.alto
  const holgura = Math.max(0, libre - 2 * hE) / 4 // lo que sobra con el dibujo en su tope: a los tallos y a los bordes
  const yRuta = yArr + holgura + hE + tallo + holgura + rN
  const yAba = yRuta + rN + tallo + holgura
  const yBal = yAba + hE + 30 * u + extra * 0.04 + holgura / 2
  // la leyenda de los dibujos, en el hueco a la derecha de la última estación de abajo, a la altura de los dibujos
  const iAbajo = n % 2 ? n - 2 : n - 1
  const xLey = xNodo(iAbajo) + wE / 2 + gapE
  const ley = medirLeyenda(u, xIzq1 - xLey)
  const yLey = yAba + mp.yMini + Math.max(0, (mp.altoMini - ley.alto) / 2)
  // panel: desde el borde de arriba de las estaciones hasta abajo; arriba el pedido (rótulo, idea, pedido, montos),
  // abajo por qué
  const yPanel = yArr + holgura
  const hPanel = h - bot - yPanel
  const padP = 34 * u
  const inner = wPanel - 2 * padP
  const idea = medirIdea(u, inner, tam(38, u))
  const pedido = medirPedido(u, inner)
  const montos = medirMontos(u, inner)
  const porq = medirPorque(u, inner)
  const altoRot = 20 * u
  const altoPorque = altoRot + 22 * u + porq.alto
  const fijos = altoRot + idea.alto + pedido.alto + montos.alto
  const libreP = hPanel - 2 * padP - fijos - altoPorque
  // tres espacios en el bloque del pedido y uno, más grande, antes de por qué
  const gP = Math.max(18 * u, Math.min(44 * u, libreP / 5))
  const ys = []
  let yy = yPanel + padP
  for (const b of [altoRot, idea.alto, pedido.alto, montos.alto]) { ys.push(yy); yy += b + gP }
  const yPorque = yPanel + hPanel - padP - altoPorque
  const yFilete = (yy - gP + yPorque) / 2
  // el tono del panel: blanco sobre tinta desde su paso (y en la vista completa); antes, tinta sobre el fondo
  const k = useEstadoPaso(3) === 'on' ? { t: SUP, f: INK } : { t: INK, f: SUP }
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* encabezado, siempre */}
      {mar.el(M, top)}
      <text x={xTit} y={yTit} fontSize={fT} fontWeight={700} fill={INK} letterSpacing={-0.02 * fT}>{VISTA.pregunta}</text>
      {fuente && <text x={w - M} y={yTit} fontSize={fF} fill={CTX} textAnchor="end">{fuente}</text>}

      {/* paso 1: el recorrido; la línea avanza hasta el panel y entra con su punta */}
      <line x1={M} x2={xPanel - 20 * u} y1={yRuta} y2={yRuta} stroke={INK} strokeWidth={6 * u} />
      <path d={`M${xPanel - 26 * u} ${yRuta - 16 * u} L${xPanel} ${yRuta} L${xPanel - 26 * u} ${yRuta + 16 * u} Z`} fill={INK} />
      {PIEZAS.map((p, i) => {
        const arriba = i % 2 === 0
        const xc = xNodo(i)
        const x = xc - wE / 2
        const y = arriba ? yArr + holgura : yAba
        return (
          <g key={p.n}>
            <line x1={xc} x2={xc} y1={arriba ? y + hE : yRuta} y2={arriba ? yRuta : y} stroke={INK} strokeWidth={3 * u} />
            <Tarjeta u={u} x={x} y={y} w={wE} h={hE} abajo={arriba} />
            <Pieza u={u} p={p} x={x} y={y} w={wE} m={mp} />
            <circle cx={xc} cy={yRuta} r={rN} fill={INK} stroke={SUP} strokeWidth={4 * u} />
            <text x={xc} y={yRuta} fontSize={tam(26, u)} fontWeight={700} fill={SUP} textAnchor="middle"
                  dominantBaseline="central">{p.n}</text>
          </g>
        )
      })}
      {ley.el(xLey, yLey)}

      {/* paso 2: lo que nos llevamos */}
      <Paso n={2}>
        <RotuloBloque u={u} x={M} y={yBal + 11 * u} texto={X.llevamos} />
        {filasB.map((b, i) => {
          const x = M + i * (colB + gapB)
          const y0 = yBal + 22 * u + 14 * u
          return (
            <g key={b.que}>
              <rect x={x} y={y0} width={colB} height={3 * u} fill={INK} />
              <text x={x} y={y0 + 15 * u} fontSize={fB} fontWeight={700} fill={INK} dominantBaseline="hanging">{b.que}</text>
              {b.lineas.map((l, j) => (
                <text key={j} x={x} y={y0 + 15 * u + fB * 1.3 + j * fB * 1.22} fontSize={fB} fill={CTX}
                      dominantBaseline="hanging">{l}</text>
              ))}
            </g>
          )
        })}
      </Paso>

      {/* paso 3: lo que pedimos. Antes de su paso, el panel es solo su borde y su texto va en tinta (atenuado, como el
          resto de lo que falta); en su paso aparece la tinta llena y el texto pasa a blanco (V15_cierre.css). */}
      <path d={rectRedondo(xPanel, yPanel, wPanel, hPanel, 6 * u, 'todos')} fill="none" stroke={PISTA} strokeWidth={2 * u} />
      <Paso n={3} oculto>
        <path d={rectRedondo(xPanel, yPanel, wPanel, hPanel, 6 * u, 'todos')} fill={INK} />
      </Paso>
      <g className="v15-panel">
        <Paso n={3}>
          <RotuloPanel u={u} x={xPanel + padP} y={ys[0] + 10 * u} texto={X.pedimos} k={k} />
          {idea.el(xPanel + padP, ys[1], k)}
          {pedido.el(xPanel + padP, ys[2], k)}
          {montos.el(xPanel + padP, ys[3], k)}
        </Paso>

        {/* paso 4: por qué con este equipo */}
        <Paso n={4}>
          <line x1={xPanel + padP} x2={xPanel + wPanel - padP} y1={yFilete} y2={yFilete} stroke={k.t} strokeOpacity={0.3}
                strokeWidth={TRAZO.guia * u} />
          <RotuloPanel u={u} x={xPanel + padP} y={yPorque + 10 * u} texto={X.porque.titulo} k={k} />
          {porq.el(xPanel + padP, yPorque + altoRot + 22 * u, k)}
        </Paso>
      </g>
    </svg>
  )
}

export default function V15Cierre() {
  return <VistaPlena id={ID}>{({ w, h }) => <Dibujo w={w} h={h} />}</VistaPlena>
}
