// V15 · Cierre (Sebastian C.), a pantalla completa (meta.plena, spec 1.5): sin riel, sin encabezado, sin banda y sin
// tarjeta verde. Es el fondo de los seis minutos de preguntas (spec 2, V15). Cuatro bloques:
//   1. El título (la pregunta de CF) con la marca de Casa Óga.
//   2. Lo que mostramos: una pieza por sección (1 Datos … 5 Gestión) con su número y nombre (del rótulo del riel del
//      bloque), una cifra grande de DF, el punto clave y un dibujo mínimo que recuerda el gráfico de la sección: el flujo
//      de V02 (C20), las dos barras de V05 contra la práctica actual (J03, J17), la cuadrícula de V07 (G54 sobre G39), los
//      hitos de V10 hacia la primera lista (legal_previas) y el plan de V14 con la decisión al final (plan). En todos, el
//      acento es lo que cuenta la cifra grande y el gris, el resto (leyenda); lo demás lleva su rótulo al lado.
//   3. Lo que nos llevamos: el balance de CF (aprendimos, falló, supuesto, limitación).
//   4. Lo que pedimos, en el panel de más contraste (tinta llena, texto blanco): la idea fuerza, la comparación a escala
//      del piloto (G64, para saberlo) contra el proyecto entero el primer año (G39, para apostarlo) con su eje en dólares,
//      el pedido en dos pasos con su desenlace (semana del acuerdo y G63.semana_decision) y por qué con este equipo.
// Dos versiones (variante('V15')):
//   a  Tablero resumen: título arriba, la fila de las cinco piezas y, abajo, el balance a la izquierda y el panel del
//      pedido a la derecha, más ancho (la comparación en barras horizontales).
//   b  Camino: las cinco piezas como estaciones de un recorrido que avanza hacia la derecha (arriba y abajo de la línea,
//      alternadas) y entra con su punta en el panel del pedido, a toda la altura (la comparación en columnas); el
//      balance, debajo del recorrido, en cuatro columnas.
// Todo en u (useU); las cifras, de DF con formato.js; los textos, de textosDe('V15') y de CF (título y secciones).

import { VistaPlena } from '../Plantilla.jsx'
import { CF } from '../contenido_final.js'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo, pct, usd } from '../../../e3/src/formato.js'
import { variante } from '../variantes.js'
import {
  ACC, CTX, EJE, FIN_GRIS, INK, PISTA, SUP, TRAZO, Compuerta, Leyenda, LlaveH, Muestra, ancho, envolver, escalaLinda,
  escalaSemanas, punteado, rectRedondo, tam, useU,
} from '../svg.jsx'

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
const MINI_MAX = 132
const MONO = { fontFamily: 'var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }

export const meta = { id: ID, plena: true }

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

// ---------------------------------------------------------------- dibujos mínimos (uno por sección)
// Cada uno dibuja dentro de su caja (x, y, w, h, en px) y rotula sus marcas con letra de 20 u.

/** 1 Datos: el flujo de V02. La banda del extracto (C20.crudo) se parte: baja lo que queda afuera y sigue, en acento,
 *  lo que entra a la lista (C20.positivas). El alto de cada tramo es proporcional a sus filas. */
function MiniFlujo({ u, x, y, w, h }) {
  const L = P.datos.mini
  const f = tam(20, u)
  const crudo = v('C20.crudo')
  const pos = v('C20.positivas')
  const yb = y + f * 1.5
  const ri = 8 * u
  const Hb = Math.min(60 * u, h - f * 1.5 - ri - 22 * u)
  const hr = Hb * (pos / crudo)
  const td = Hb - hr
  const ro = ri + td
  const xd = x + w * 0.38
  const punta = 18 * u
  const gap = 2 * u
  const yFin = y + h
  return (
    <g>
      <text x={x} y={y} fontSize={f} fill={CTX} dominantBaseline="hanging">{L.extracto}</text>
      <rect x={x} y={yb} width={xd - x - gap} height={Hb} fill={FIN_GRIS} />
      <path d={`M${xd} ${yb} H${x + w - punta} L${x + w} ${yb + hr / 2} L${x + w - punta} ${yb + hr - gap / 2} H${xd} Z`}
            fill={ACC} />
      <path d={`M${xd} ${yb + hr + gap / 2} A${ro - gap / 2} ${ro - gap / 2} 0 0 1 ${xd + ro - gap / 2} ${yb + Hb + ri} `
        + `V${yFin} H${xd + ri} V${yb + Hb + ri} A${ri} ${ri} 0 0 0 ${xd} ${yb + Hb} Z`} fill={FIN_GRIS} />
      <text x={xd + ro + 10 * u} y={yFin} fontSize={f} fill={CTX} dominantBaseline="auto">{L.afuera}</text>
    </g>
  )
}

/** 2 Regla y piloto: las dos barras de V05 (regla en acento, modelo en gris, cada una con su nombre a la izquierda) sobre un
 *  eje de 0 a 100 % con su título, y la práctica actual (J17) como línea punteada rotulada arriba. */
function MiniRegla({ u, x, y, w, h }) {
  const L = P.modelo.mini
  const f = tam(20, u)
  const cero = pct(0, 0), cien = pct(1, 0)
  const lw = Math.max(ancho(L.regla, f, 600), ancho(L.modelo, f, 600)) + 12 * u
  const xa = x + Math.max(lw, ancho(cero, f) / 2)
  const xb = x + w - ancho(cien, f) / 2
  const sx = (q) => xa + q * (xb - xa)
  const yNum = y + h - f
  const yEje = yNum - 9 * u
  // las dos barras con paso de al menos 1,15 renglones, para que «regla» y «modelo» no se toquen en una caja baja (b)
  const y1 = y + f * 1.25
  const disp = yEje - 7 * u - y1
  const tb = Math.min(30 * u, (disp - 6 * u) / 2, disp - f * 1.15)
  const gap = Math.max(6 * u, f * 1.15 - tb)
  const filas = [
    { t: L.regla, q: v('J03.regla'), c: ACC },
    { t: L.modelo, q: v('J03.logistica'), c: FIN_GRIS },
  ]
  const xj = sx(v('J17'))
  // el título del eje, centrado entre los números de los extremos (si no entra, queda solo la unidad de las marcas)
  const libre0 = xa + ancho(cero, f) / 2 + 14 * u
  const libre1 = xb - ancho(cien, f) / 2 - 14 * u
  const xEje = (libre0 + libre1) / 2
  const entraEje = ancho(L.eje, f, 600) <= libre1 - libre0
  return (
    <g>
      <text x={xj} y={y} fontSize={f} fontWeight={600} fill={INK} textAnchor="middle" dominantBaseline="hanging">{L.base}</text>
      {filas.map((r, i) => {
        const yy = y1 + i * (tb + gap)
        return (
          <g key={r.t}>
            <path d={rectRedondo(xa, yy, sx(r.q) - xa, tb, TRAZO.radio * u)} fill={r.c} />
            <text x={xa - 12 * u} y={yy + tb / 2} fontSize={f} fontWeight={600} fill={INK} textAnchor="end"
                  dominantBaseline="central">{r.t}</text>
          </g>
        )
      })}
      <line x1={xj} x2={xj} y1={y1 - 2 * u} y2={yEje} stroke={INK} strokeWidth={2.5 * u} strokeDasharray={punteado(u)} />
      <line x1={xa} x2={xb} y1={yEje} y2={yEje} stroke={EJE} strokeWidth={TRAZO.base * u} />
      {[0, 1].map((q) => (
        <g key={q}>
          <line x1={sx(q)} x2={sx(q)} y1={yEje} y2={yEje + 6 * u} stroke={EJE} strokeWidth={TRAZO.base * u} />
          <text x={sx(q)} y={yNum} fontSize={f} fill={CTX} textAnchor="middle" dominantBaseline="hanging">{q ? cien : cero}</text>
        </g>
      ))}
      {entraEje && (
        <text x={xEje} y={yNum} fontSize={f} fontWeight={600} fill={CTX} textAnchor="middle"
              dominantBaseline="hanging">{L.eje}</text>
      )}
    </g>
  )
}

/** 3 Economía: la cuadrícula de V07. Los cien cuadros son el costo del primer año (G39); lo lleno en acento, lo que
 *  deja la lista en un año (G54), con la parte de un cuadro que le toca. Sin rótulo arriba: «deja la lista» ya está en
 *  el punto clave y la leyenda dice qué es el acento. Los cien van en 25 × 4 (como V07) o en 20 × 5, lo que deje el
 *  cuadro más grande en la caja. */
function MiniCuadros({ u, x, y, w, h }) {
  const L = P.economia.mini
  const f = tam(20, u)
  const g = 2.5 * u
  const yg = y
  const yPie = y + h - f * 1.15
  const altoLibre = yPie - 14 * u - yg
  const lado = ([c, r]) => Math.min((w - (c - 1) * g) / c, (altoLibre - (r - 1) * g) / r)
  const [cols, filas] = [[25, 4], [20, 5]].reduce((a, b) => (lado(b) > lado(a) ? b : a))
  const s = lado([cols, filas])
  const anchoG = cols * s + (cols - 1) * g
  const altoG = filas * s + (filas - 1) * g
  const llenos = (v('G54') / v('G39')) * cols * filas
  const n = Math.floor(llenos)
  const resto = llenos - n
  const cx = (i) => x + (i % cols) * (s + g)
  const cy = (i) => yg + Math.floor(i / cols) * (s + g)
  return (
    <g>
      {Array.from({ length: cols * filas }, (_, i) => (
        <rect key={i} x={cx(i)} y={cy(i)} width={s} height={s} rx={1.5 * u} fill={i < n ? ACC : FIN_GRIS} />
      ))}
      {resto > 0 && <rect x={cx(n)} y={cy(n)} width={s * resto} height={s} fill={ACC} />}
      <LlaveH u={u} x1={x} x2={x + anchoG} y={yg + altoG + 6 * u} lado="abajo" />
      <text x={x + anchoG / 2} y={Math.min(y + h, yg + altoG + 18 * u + f)} fontSize={f} fill={CTX} textAnchor="middle"
            dominantBaseline="auto">{L.costo}</text>
    </g>
  )
}

/** Columnas de semanas de un dibujo mínimo, con «semana» a la izquierda de los números. */
function semanasMini({ u, x, w, desde, hasta, f, rotulo }) {
  const lw = ancho(rotulo, f) + 12 * u
  return escalaSemanas({ x0: x + lw, x1: x + w, desde, hasta })
}

/** 4 Legal y adopción: los hitos de V10. Cada acción previa (legal_previas) es un rombo en acento en la semana en que
 *  vence (las de la misma semana, apiladas), sobre una línea que avanza hasta la compuerta de la primera lista. */
function MiniHitos({ u, x, y, w, h }) {
  const L = P.legal.mini
  const f = tam(20, u)
  const acc = T.legal_previas.acciones
  const S = semanasMini({ u, x, w, desde: SEM_1, hasta: SEM_LISTA, f, rotulo: L.semana })
  const xc = S.centro(SEM_LISTA)
  const yNum = y + h - f
  const yBase = yNum - 10 * u
  const porSemana = {}
  for (const a of acc) porSemana[a.semana] = (porSemana[a.semana] ?? 0) + 1
  const pila = Math.max(...Object.values(porSemana))
  const yTop = y + f * 1.5
  const s = Math.min(26, ((yBase - 6 * u - yTop) / pila) / u)
  const vistos = {}
  const semanas = Array.from({ length: SEM_LISTA - SEM_1 + 1 }, (_, i) => SEM_1 + i)
  return (
    <g>
      <text x={xc + 4 * u} y={y} fontSize={f} fontWeight={600} fill={INK} textAnchor="end" dominantBaseline="hanging">{L.compuerta}</text>
      <line x1={S.centro(SEM_1) - 8 * u} x2={xc} y1={yBase} y2={yBase} stroke={EJE} strokeWidth={2 * u} />
      {acc.map((a) => {
        const k = vistos[a.semana] = (vistos[a.semana] ?? 0) + 1
        const yc = yBase - 4 * u - (k - 0.5) * s * u
        return <Compuerta key={a.codigo} u={u} x={S.centro(a.semana)} y={yc} s={s * 0.95} estado="hecho" />
      })}
      <line x1={xc} x2={xc} y1={yTop - 2 * u} y2={yBase + 4 * u} stroke={INK} strokeWidth={6 * u} />
      <text x={x} y={yNum} fontSize={f} fill={CTX} dominantBaseline="hanging">{L.semana}</text>
      {semanas.map((s2) => (
        <text key={s2} x={S.centro(s2)} y={yNum} fontSize={f} fill={s2 === SEM_LISTA ? INK : CTX}
              fontWeight={s2 === SEM_LISTA ? 700 : 400} textAnchor="middle" dominantBaseline="hanging">{fijo(s2)}</text>
      ))}
    </g>
  )
}

/** 5 Gestión: el plan de V14. Una barra en acento por fase, de su semana `desde` a su semana `hasta`, y la compuerta
 *  de la decisión al final (G63.semana_decision). */
function MiniPlan({ u, x, y, w, h }) {
  const L = P.gestion.mini
  const f = tam(20, u)
  const fases = T.plan.fases
  const S = semanasMini({ u, x, w: w - 6 * u, desde: SEM_1, hasta: SEM_FIN, f, rotulo: L.semana })
  const xc = S.fin(SEM_FIN)
  const yr0 = y + f * 1.5
  const yNum = y + h - f
  const yr1 = yNum - 8 * u
  const p = (yr1 - yr0) / fases.length
  const t = Math.min(12 * u, p * 0.7)
  return (
    <g>
      <text x={xc + 4 * u} y={y} fontSize={f} fontWeight={600} fill={INK} textAnchor="end" dominantBaseline="hanging">{L.compuerta}</text>
      {fases.map((fa, i) => {
        const yc = yr0 + (i + 0.5) * p
        const x1 = S.inicio(fa.desde)
        return <path key={fa.n} d={rectRedondo(x1, yc - t / 2, S.fin(fa.hasta) - x1, t, 2 * u, 'todos')} fill={ACC} />
      })}
      <line x1={xc} x2={xc} y1={yr0 - 4 * u} y2={yr1 + 2 * u} stroke={INK} strokeWidth={6 * u} />
      <text x={x} y={yNum} fontSize={f} fill={CTX} dominantBaseline="hanging">{L.semana}</text>
      {[SEM_1, SEM_FIN].map((s2) => (
        <text key={s2} x={S.centro(s2)} y={yNum} fontSize={f} fill={s2 === SEM_FIN ? INK : CTX}
              fontWeight={s2 === SEM_FIN ? 700 : 400} textAnchor="middle" dominantBaseline="hanging">{fijo(s2)}</text>
      ))}
    </g>
  )
}

const PIEZAS = [
  { ...seccion('datos'), ...P.datos, ...partes(fijo(v('C20.positivas'))), Mini: MiniFlujo },
  { ...seccion('modelo'), ...P.modelo, ...partes(pct(v('J03.regla'))), Mini: MiniRegla },
  { ...seccion('economia'), ...partes(usd(v('G54'))), ...P.economia, Mini: MiniCuadros },
  { ...seccion('legal'), ...P.legal, ...partes(fijo(T.legal_previas.n)), Mini: MiniHitos },
  { ...seccion('gestion'), ...partes(fijo(T.plan.semanas)), ...P.gestion, Mini: MiniPlan },
]

// ---------------------------------------------------------------- piezas

/** La cifra grande con lo que va antes (USD, al 0,5) y después (%, «por año», al 0,45), sobre la línea de base y. */
function Cifra({ x, y, f, p, color = INK }) {
  return (
    <text x={x} y={y} fontSize={f} fontWeight={700} fill={color} letterSpacing={-0.02 * f}>
      {p.antes && <tspan fontSize={f * 0.5} fontWeight={600}>{`${p.antes}${NBSP}`}</tspan>}
      {p.num}
      {p.despues && <tspan fontSize={f * 0.45} fontWeight={600}>{`${NBSP}${p.despues}`}</tspan>}
    </text>
  )
}

/** Los renglones del punto clave de una pieza: la descripción de la cifra (tinta, 600) y lo que se concluye (CTX). */
function lineasPieza(p, w, f) {
  return [
    ...envolver(p.desc, w, f, 600).map((t) => ({ t, peso: 600, color: INK })),
    ...envolver(p.clave, w, f, 400).map((t) => ({ t, peso: 400, color: CTX })),
  ]
}

/** Medidas de una pieza (en px): relleno, letras, renglones reservados del punto clave (los mismos en las cinco) y
 *  alto del dibujo mínimo. `alto` es el total. */
function medirPieza(u, w, { pad, fCifra, fTexto, altoMini }) {
  const nLineas = Math.max(...PIEZAS.map((p) => lineasPieza(p, w - 2 * pad, fTexto).length))
  const rN = 17 * u
  const yCifra = pad + 2 * rN + 12 * u + 0.74 * fCifra
  const yTexto = yCifra + 14 * u
  const yMini = yTexto + nLineas * fTexto * 1.2 + 14 * u
  return { pad, fCifra, fTexto, altoMini, nLineas, rN, yCifra, yTexto, yMini, alto: yMini + altoMini + pad }
}

/** Una pieza en su caja (x, y, w; alto m.alto): el número de la sección en un círculo (si `numero`), su nombre, la
 *  cifra, el punto clave y el dibujo mínimo abajo. */
function Pieza({ u, p, x, y, w, m, numero = true }) {
  const cw = w - 2 * m.pad
  const x0 = x + m.pad
  const yN = y + m.pad + m.rN
  const M = p.Mini
  return (
    <g>
      {numero && (
        <>
          <circle cx={x0 + m.rN} cy={yN} r={m.rN} fill={INK} />
          <text x={x0 + m.rN} y={yN} fontSize={tam(22, u)} fontWeight={700} fill={SUP} textAnchor="middle"
                dominantBaseline="central">{p.n}</text>
        </>
      )}
      <text x={numero ? x0 + 2 * m.rN + 12 * u : x0} y={yN} fontSize={tam(24, u)} fontWeight={700} fill={INK}
            dominantBaseline="central">{p.nombre}</text>
      <Cifra x={x0} y={y + m.yCifra} f={m.fCifra} p={p} />
      {lineasPieza(p, cw, m.fTexto).map((l, i) => (
        <text key={i} x={x0} y={y + m.yTexto + i * m.fTexto * 1.2} fontSize={m.fTexto} fontWeight={l.peso} fill={l.color}
              dominantBaseline="hanging">{l.t}</text>
      ))}
      <M u={u} x={x0} y={y + m.yMini} w={cw} h={m.altoMini} />
    </g>
  )
}

/** La tarjeta blanca de una pieza o un bloque, con su filete de tinta arriba (o abajo, con `abajo`). */
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

/** La misma leyenda en columna, para un hueco angosto de ancho w (b): un ítem debajo del otro, el texto envuelto a la
 *  derecha de su muestra. (x, y): la esquina de arriba a la izquierda. */
function LeyendaColumna({ u, x, y, w, items, f = 22 }) {
  const fz = tam(f, u)
  const xt = fz + 10 * u
  let yy = y
  return (
    <g>
      {items.map((it, i) => {
        const ls = envolver(it.texto, w - xt, fz)
        const c = yy + fz * 0.6
        yy += ls.length * fz * 1.2 + 14 * u
        return (
          <g key={i}>
            <Muestra u={u} marca={it.marca} x={x + fz / 2} y={c} s={fz} />
            {ls.map((l, j) => (
              <text key={j} x={x + xt} y={c + j * fz * 1.2} fontSize={fz} fill={INK} dominantBaseline="central">{l}</text>
            ))}
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- panel del pedido (tinta llena, texto blanco)

const BLANCO_2 = 0.8 // opacidad del texto secundario sobre tinta
const LINEA_2 = 0.55 // opacidad de los ejes y guías sobre tinta

/** Las marcas de un eje en dólares hasta G39: de 5.000 en 5.000, con número cada `cada`. */
function escalaDolares() {
  return escalaLinda(v('G39'), 5)
}
const conNumero = (esc, i, cada) => i % cada === 0

/** La comparación a escala en barras horizontales (a): piloto mínimo (G64, blanco) contra el proyecto entero el primer
 *  año (G39, gris), con su eje en dólares abajo. Devuelve { alto, el(x, y) }. */
function medirCompararH(u, w) {
  const C = X.comparar
  const f = tam(24, u), fN = tam(20, u), fV = tam(26, u), fE = tam(20, u)
  const lw = Math.max(ancho(C.saberlo, f, 700), ancho(C.apostarlo, f, 700), ancho(C.saberloNota, fN),
    ancho(C.apostarloNota, fN)) + 24 * u
  const tb = 42 * u, gap = 16 * u
  const esc = escalaDolares()
  const altoEje = 8 * u + 6 * u + fE * 1.2
  const alto = 2 * tb + gap + 8 * u + altoEje
  const el = (x, y) => {
    const xa = x + lw
    const xb = x + w - ancho(fijo(esc.tope), fE) / 2
    const sx = (q) => xa + (q / esc.tope) * (xb - xa)
    const yEje = y + 2 * tb + gap + 8 * u
    const paso = (xb - xa) / (esc.marcas.length - 1)
    const cada = paso > ancho(fijo(esc.tope), fE) + 18 * u ? 1 : 2
    const filas = [
      { t: C.saberlo, nota: C.saberloNota, q: v('G64'), fill: SUP },
      { t: C.apostarlo, nota: C.apostarloNota, q: v('G39'), fill: FIN_GRIS },
    ]
    return (
      <g>
        {esc.marcas.map((m) => (
          <line key={`g${m}`} x1={sx(m)} x2={sx(m)} y1={y - 6 * u} y2={yEje} stroke={SUP} strokeOpacity={0.16}
                strokeWidth={TRAZO.guia * u} />
        ))}
        {filas.map((r, i) => {
          const yy = y + i * (tb + gap)
          const xe = sx(r.q)
          const val = usd(r.q)
          const fuera = ancho(val, fV, 700) + 28 * u > xe - xa
          return (
            <g key={r.t}>
              <text x={x} y={yy + tb / 2 - 2 * u} fontSize={f} fontWeight={700} fill={SUP}>{r.t}</text>
              <text x={x} y={yy + tb / 2 + 4 * u} fontSize={fN} fill={SUP} fillOpacity={BLANCO_2}
                    dominantBaseline="hanging">{r.nota}</text>
              <path d={rectRedondo(xa, yy, xe - xa, tb, TRAZO.radio * u)} fill={r.fill} />
              <text x={fuera ? xe + 12 * u : xe - 14 * u} y={yy + tb / 2} fontSize={fV} fontWeight={700}
                    fill={fuera ? SUP : INK} textAnchor={fuera ? 'start' : 'end'} dominantBaseline="central">{val}</text>
            </g>
          )
        })}
        <line x1={xa} x2={xb} y1={yEje} y2={yEje} stroke={SUP} strokeOpacity={LINEA_2} strokeWidth={TRAZO.base * u} />
        {esc.marcas.map((m, i) => (
          <g key={m}>
            <line x1={sx(m)} x2={sx(m)} y1={yEje} y2={yEje + 8 * u} stroke={SUP} strokeOpacity={LINEA_2}
                  strokeWidth={TRAZO.base * u} />
            {conNumero(esc, i, cada) && (
              <text x={sx(m)} y={yEje + 14 * u} fontSize={fE} fill={SUP} fillOpacity={BLANCO_2} textAnchor="middle"
                    dominantBaseline="hanging">{fijo(m)}</text>
            )}
          </g>
        ))}
        <text x={xa - 18 * u} y={yEje + 14 * u} fontSize={fE} fontWeight={600} fill={SUP} fillOpacity={BLANCO_2}
              textAnchor="end" dominantBaseline="hanging">{C.eje}</text>
      </g>
    )
  }
  return { alto, el }
}

/** La comparación a escala en columnas (b), para el panel alto: eje vertical en dólares a la izquierda, la columna del
 *  piloto (blanca) y la del proyecto entero (gris), el monto arriba de cada una y su rótulo abajo. Alto total `alto`. */
function medirCompararV(u, w, alto) {
  const C = X.comparar
  const f = tam(24, u), fN = tam(20, u), fV = tam(26, u), fE = tam(20, u)
  const esc = escalaDolares()
  const izq = Math.max(...esc.marcas.map((m) => ancho(fijo(m), fE))) + 14 * u
  const ranura = (w - izq) / 2
  const notas = [C.saberloNota, C.apostarloNota].map((t) => envolver(t, ranura - 16 * u, fN))
  const nNotas = Math.max(...notas.map((l) => l.length))
  const altoPie = 12 * u + f * 1.2 + nNotas * fN * 1.2
  const altoTit = fE * 1.2 + 14 * u
  const el = (x, y) => {
    const yBase = y + alto - altoPie
    // el tope del eje, lo más arriba posible sin que el monto de la columna alta se suba al título del eje
    const alta = Math.max(v('G64'), v('G39')) / esc.tope
    const yTope = Math.max(y + altoTit + 8 * u, (y + altoTit + 6 * u + 10 * u + 0.8 * fV - (1 - alta) * yBase) / alta)
    const sy = (q) => yBase - (q / esc.tope) * (yBase - yTope)
    const xe = x + izq
    const cw = Math.min(130 * u, ranura * 0.6)
    const cols = [
      { t: C.saberlo, nota: notas[0], q: v('G64'), fill: SUP },
      { t: C.apostarlo, nota: notas[1], q: v('G39'), fill: FIN_GRIS },
    ]
    return (
      <g>
        <text x={x} y={y} fontSize={fE} fontWeight={600} fill={SUP} fillOpacity={BLANCO_2} dominantBaseline="hanging">{C.eje}</text>
        {esc.marcas.map((m) => (
          <g key={m}>
            <line x1={xe} x2={x + w} y1={sy(m)} y2={sy(m)} stroke={SUP} strokeOpacity={m ? 0.16 : LINEA_2}
                  strokeWidth={TRAZO.guia * u} />
            <line x1={xe - 8 * u} x2={xe} y1={sy(m)} y2={sy(m)} stroke={SUP} strokeOpacity={LINEA_2}
                  strokeWidth={TRAZO.base * u} />
            <text x={xe - 14 * u} y={sy(m)} fontSize={fE} fill={SUP} fillOpacity={BLANCO_2} textAnchor="end"
                  dominantBaseline="central">{fijo(m)}</text>
          </g>
        ))}
        <line x1={xe} x2={xe} y1={yBase} y2={sy(esc.tope)} stroke={SUP} strokeOpacity={LINEA_2} strokeWidth={TRAZO.base * u} />
        {cols.map((c, i) => {
          const xc = xe + (i + 0.5) * ranura
          const yt = sy(c.q)
          return (
            <g key={c.t}>
              <path d={rectRedondo(xc - cw / 2, yt, cw, yBase - yt, TRAZO.radio * u, 'arr')} fill={c.fill} />
              <text x={xc} y={yt - 10 * u} fontSize={fV} fontWeight={700} fill={SUP} textAnchor="middle">{usd(c.q)}</text>
              <text x={xc} y={yBase + 12 * u} fontSize={f} fontWeight={700} fill={SUP} textAnchor="middle"
                    dominantBaseline="hanging">{c.t}</text>
              {c.nota.map((l, j) => (
                <text key={j} x={xc} y={yBase + 12 * u + f * 1.2 + j * fN * 1.2} fontSize={fN} fill={SUP}
                      fillOpacity={BLANCO_2} textAnchor="middle" dominantBaseline="hanging">{l}</text>
              ))}
            </g>
          )
        })}
      </g>
    )
  }
  return { alto, el, minimo: altoTit + fV * 1.3 + 120 * u + altoPie }
}

/** El pedido en dos pasos y el desenlace: un círculo numerado por paso y el rombo de la decisión, unidos por una
 *  línea; la acción en blanco 700 y el dato detrás (o abajo, si no entra). */
function medirPasos(u, w) {
  const f = tam(24, u)
  const r = 17 * u
  const xt = 2 * r + 16 * u
  const items = [
    ...X.pasos.map((p, i) => ({ ...p, marca: fijo(i + 1), sep: `${NBSP}${X.separador}${NBSP}` })),
    { ...X.desenlace, marca: null, sep: NBSP },
  ].map((p) => ({ ...p, una: ancho(p.accion, f, 700) + ancho(`${p.sep}${p.dato}`, f) <= w - xt }))
  const fila = (p) => Math.max(p.una ? f * 1.25 : f * 2.45, 2 * r)
  const gap = 16 * u
  const alto = items.reduce((s, p) => s + fila(p), 0) + gap * (items.length - 1)
  const el = (x, y) => {
    let yy = y
    const centros = items.map((p) => {
      const c = yy + (p.una ? fila(p) / 2 : r)
      yy += fila(p) + gap
      return c
    })
    return (
      <g>
        <line x1={x + r} x2={x + r} y1={centros[0]} y2={centros[centros.length - 1]} stroke={SUP} strokeOpacity={0.45}
              strokeWidth={3 * u} />
        {items.map((p, i) => {
          const c = centros[i]
          return (
            <g key={p.accion}>
              {p.marca
                ? (
                  <>
                    <circle cx={x + r} cy={c} r={r} fill={SUP} />
                    <text x={x + r} y={c} fontSize={tam(22, u)} fontWeight={700} fill={INK} textAnchor="middle"
                          dominantBaseline="central">{p.marca}</text>
                  </>
                )
                : <path d={`M${x + r} ${c - r * 1.15} L${x + r * 2.15} ${c} L${x + r} ${c + r * 1.15} L${x - r * 0.15} ${c} Z`}
                        fill={SUP} />}
              {p.una
                ? (
                  <text x={x + xt} y={c} fontSize={f} fill={SUP} dominantBaseline="central">
                    <tspan fontWeight={700}>{p.accion}</tspan>
                    <tspan fillOpacity={BLANCO_2}>{`${p.sep}${p.dato}`}</tspan>
                  </text>
                )
                : (
                  <>
                    <text x={x + xt} y={c} fontSize={f} fontWeight={700} fill={SUP} dominantBaseline="central">{p.accion}</text>
                    <text x={x + xt} y={c + f * 1.2} fontSize={f} fill={SUP} fillOpacity={BLANCO_2}
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
  const el = (x, y) => {
    let yy = y
    return (
      <g>
        {items.map((ls, i) => {
          const y0 = yy
          yy += ls.length * f * 1.22 + gap
          return (
            <g key={i}>
              <rect x={x} y={y0 + f * 0.1} width={5 * u} height={ls.length * f * 1.22 - f * 0.2} fill={SUP} fillOpacity={0.6} />
              {ls.map((l, j) => (
                <text key={j} x={x + xt} y={y0 + j * f * 1.22} fontSize={f} fontWeight={l.peso} fill={SUP}
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

/** La idea fuerza: dos frases, cada una en su renglón, blanco 700, con la letra más grande entre `piso` y `desde` en
 *  la que las dos entran en w; si no entran ni en el piso, en renglones parejos. */
function medirIdea(u, w, desde, piso = tam(30, u)) {
  let f = desde
  while (f > piso && X.idea.some((t) => ancho(t, f, 700) > w)) f -= 0.5 * u
  const lineas = X.idea.flatMap((t) => parejo(t, w, f, 700))
  const alto = lineas.length * f * 1.18
  const el = (x, y) => lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * 1.18} fontSize={f} fontWeight={700} fill={SUP} letterSpacing={-0.01 * f}
          dominantBaseline="hanging">{l}</text>
  ))
  return { alto, el }
}

/** El rótulo de un bloque dentro del panel oscuro. */
const RotuloPanel = ({ u, x, y, texto }) => <RotuloBloque u={u} x={x} y={y} texto={texto} color={SUP} filete={SUP} />

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
const Titulo = ({ x, y, f }) => (
  <text x={x} y={y} fontSize={f} fontWeight={700} fill={INK} letterSpacing={-0.02 * f}>{VISTA.pregunta}</text>
)

// ---------------------------------------------------------------- a · tablero resumen

function Tablero({ w, h, u }) {
  const M = 48 * u
  const extra = Math.max(0, h - 1080 * u)
  const top = 42 * u + extra * 0.1
  const bot = 42 * u + extra * 0.1
  // título a la izquierda y marca a la derecha, en un renglón
  const mar = medirMarca(u)
  const fT = letraTitulo(u, w - 2 * M - mar.ancho - 48 * u, 58)
  const yTit = top + mar.alto * 0.5 + fT * 0.36
  // lo que mostramos: rótulo y leyenda, y la fila de piezas
  const yCab = top + mar.alto + 36 * u + extra * 0.05
  const yPiezas = yCab + 24 * u
  const n = PIEZAS.length
  const gapP = 22 * u
  const wP = (w - 2 * M - (n - 1) * gapP) / n
  const mp = medirPieza(u, wP, { pad: 20 * u, fCifra: tam(56, u), fTexto: tam(24, u), altoMini: Math.min(MINI_MAX * u, 116 * u + extra * 0.18) })
  // abajo: balance a la izquierda y el panel del pedido a la derecha
  const yAbajo = yPiezas + mp.alto + 24 * u + extra * 0.05
  const hAb = h - bot - yAbajo
  const wPanel = 1240 * u
  const xPanel = w - M - wPanel
  const wBal = xPanel - 24 * u - M
  // panel: rótulo, idea fuerza y dos columnas (comparación y pasos | por qué)
  const padP = 34 * u
  const inner = wPanel - 2 * padP
  const idea = medirIdea(u, inner, tam(38, u))
  const colI = inner * 0.58
  const gCol = 44 * u
  const colD = inner - colI - gCol
  const comp = medirCompararH(u, colI)
  const pasos = medirPasos(u, colI)
  const porq = medirPorque(u, colD)
  const altoIzq = comp.alto + pasos.alto
  const altoDer = 24 * u + porq.alto
  const libreP = hAb - 2 * padP - (20 * u + idea.alto + Math.max(altoIzq + 22 * u, altoDer))
  const gP = Math.max(12 * u, Math.min(libreP / 2, 40 * u))
  const yP0 = yAbajo + padP + Math.max(0, libreP - 2 * gP) / 2
  const yIdea = yP0 + 20 * u + gP
  const yCols = yIdea + idea.alto + gP
  const gIzq = Math.max(22 * u, altoDer - altoIzq)
  const xD = xPanel + padP + colI + gCol
  // balance: rótulo y cuatro renglones repartidos en el alto
  const fB = tam(24, u)
  const padB = 28 * u
  const lwB = Math.max(...X.balance.map((b) => ancho(b.que, fB, 700))) + 22 * u
  const filasB = X.balance.map((b) => ({ ...b, lineas: parejo(b.texto, wBal - 2 * padB - lwB, fB) }))
  const altoB = filasB.reduce((s, r) => s + r.lineas.length * fB * 1.22, 0)
  const yB0 = yAbajo + padB + 20 * u
  const gB = Math.max(16 * u, (hAb - padB - 20 * u - padB - altoB) / filasB.length)
  let yB = yB0 + gB * 0.8
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Titulo x={M} y={yTit} f={fT} />
      {mar.el(w - M - mar.ancho, top)}
      {/* lo que mostramos */}
      <RotuloBloque u={u} x={M} y={yCab} texto={X.mostramos} />
      <Leyenda u={u} x={w - M} y={yCab} items={LEY} anchor="end" f={22} />
      {PIEZAS.map((p, i) => {
        const x = M + i * (wP + gapP)
        return (
          <g key={p.n}>
            <Tarjeta u={u} x={x} y={yPiezas} w={wP} h={mp.alto} />
            <Pieza u={u} p={p} x={x} y={yPiezas} w={wP} m={mp} />
          </g>
        )
      })}
      {/* lo que nos llevamos */}
      <Tarjeta u={u} x={M} y={yAbajo} w={wBal} h={hAb} />
      <RotuloBloque u={u} x={M + padB} y={yAbajo + padB + 10 * u} texto={X.llevamos} />
      {filasB.map((r) => {
        const y0 = yB
        yB += r.lineas.length * fB * 1.22 + gB
        return (
          <g key={r.que}>
            <text x={M + padB} y={y0} fontSize={fB} fontWeight={700} fill={INK} dominantBaseline="hanging">{r.que}</text>
            {r.lineas.map((l, j) => (
              <text key={j} x={M + padB + lwB} y={y0 + j * fB * 1.22} fontSize={fB} fill={CTX}
                    dominantBaseline="hanging">{l}</text>
            ))}
          </g>
        )
      })}
      {/* lo que pedimos */}
      <path d={rectRedondo(xPanel, yAbajo, wPanel, hAb, 6 * u, 'todos')} fill={INK} />
      <RotuloPanel u={u} x={xPanel + padP} y={yP0 + 10 * u} texto={X.pedimos} />
      {idea.el(xPanel + padP, yIdea)}
      {comp.el(xPanel + padP, yCols)}
      {pasos.el(xPanel + padP, yCols + comp.alto + gIzq)}
      <RotuloPanel u={u} x={xD} y={yCols + 10 * u} texto={X.porque.titulo} />
      {porq.el(xD, yCols + 24 * u + 14 * u)}
    </svg>
  )
}

// ---------------------------------------------------------------- b · camino

function Camino({ w, h, u }) {
  const M = 48 * u
  const extra = Math.max(0, h - 1080 * u)
  const top = 42 * u + extra * 0.08
  const bot = 42 * u + extra * 0.08
  const wPanel = 680 * u
  const xPanel = w - M - wPanel
  const xIzq1 = xPanel - 44 * u
  const wIzq = xIzq1 - M
  // marca y título
  const mar = medirMarca(u)
  const fT = letraTitulo(u, wIzq - mar.ancho - 36 * u, 54)
  const yTit = top + mar.alto * 0.5 + fT * 0.36
  // estaciones: arriba la 1, la 3 y la 5; abajo la 2 y la 4; cada nodo en el centro de su caja
  const n = PIEZAS.length
  const nArr = Math.ceil(n / 2)
  const gapE = 28 * u
  const wE = (wIzq - (nArr - 1) * gapE) / nArr
  const paso = (wE + gapE) / 2
  const xNodo = (i) => M + wE / 2 + i * paso
  const rN = 24 * u
  const tallo = 12 * u
  // balance en cuatro columnas
  const fB = tam(24, u)
  const gapB = 26 * u
  const colB = (wIzq - 3 * gapB) / 4
  const filasB = X.balance.map((b) => ({ ...b, lineas: parejo(b.texto, colB, fB) }))
  const altoBal = 22 * u + 14 * u + 3 * u + 12 * u + fB * 1.3 + Math.max(...filasB.map((b) => b.lineas.length)) * fB * 1.22
  // alto de las estaciones: lo que queda entre el título y el balance
  const yArr = top + mar.alto + 24 * u + extra * 0.04
  const libre = h - bot - altoBal - 26 * u - extra * 0.04 - yArr - 2 * (rN + tallo)
  const base = medirPieza(u, wE, { pad: 16 * u, fCifra: tam(48, u), fTexto: tam(24, u), altoMini: 0 })
  const mp = medirPieza(u, wE, { pad: 16 * u, fCifra: tam(48, u), fTexto: tam(24, u),
    altoMini: Math.min(MINI_MAX * u, Math.max(80 * u, libre / 2 - base.alto)) })
  const hE = mp.alto
  const holgura = Math.max(0, libre - 2 * hE) / 4 // lo que sobra con el dibujo en su tope: a los tallos y a los bordes
  const yRuta = yArr + holgura + hE + tallo + holgura + rN
  const yAba = yRuta + rN + tallo + holgura
  const yBal = yAba + hE + 26 * u + extra * 0.04 + holgura / 2
  // panel: rótulo, idea fuerza, comparación en columnas, pasos, por qué
  const padP = 34 * u
  const inner = wPanel - 2 * padP
  const hPanel = h - top - bot
  const idea = medirIdea(u, inner, tam(36, u))
  const pasos = medirPasos(u, inner)
  const porq = medirPorque(u, inner)
  const fijos = 20 * u + idea.alto + pasos.alto + 38 * u + porq.alto
  const gP = 18 * u
  const altoComp = Math.max(200 * u, hPanel - 2 * padP - fijos - 4 * gP)
  const comp = medirCompararV(u, inner, altoComp)
  const ys = []
  let yy = top + padP
  for (const b of [20 * u, idea.alto, altoComp, pasos.alto, 38 * u + porq.alto]) { ys.push(yy); yy += b + gP }
  // la leyenda de los dibujos va junto a las estaciones (no sobre el balance, que no tiene colores): en el hueco de
  // abajo, a la derecha de la última estación de abajo, a la altura de los dibujos; si no entra, en la fila del balance
  const iAbajo = n % 2 ? n - 2 : n - 1
  const xLey = xNodo(iAbajo) + wE / 2 + gapE
  const enHueco = xIzq1 - xLey >= 120 * u
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {mar.el(M, top)}
      <Titulo x={M + mar.ancho + 36 * u} y={yTit} f={fT} />
      {/* recorrido: la línea avanza hasta el panel y entra con su punta */}
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
            <Pieza u={u} p={p} x={x} y={y} w={wE} m={mp} numero={false} />
            <circle cx={xc} cy={yRuta} r={rN} fill={INK} stroke={SUP} strokeWidth={4 * u} />
            <text x={xc} y={yRuta} fontSize={tam(26, u)} fontWeight={700} fill={SUP} textAnchor="middle"
                  dominantBaseline="central">{p.n}</text>
          </g>
        )
      })}
      {/* lo que nos llevamos */}
      {enHueco
        ? <LeyendaColumna u={u} x={xLey} y={yAba + mp.yMini} w={xIzq1 - xLey} items={LEY} />
        : <Leyenda u={u} x={xIzq1} y={yBal + 11 * u} items={LEY} anchor="end" f={22} />}
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
      {/* lo que pedimos, a toda la altura */}
      <path d={rectRedondo(xPanel, top, wPanel, hPanel, 6 * u, 'todos')} fill={INK} />
      <RotuloPanel u={u} x={xPanel + padP} y={ys[0] + 10 * u} texto={X.pedimos} />
      {idea.el(xPanel + padP, ys[1])}
      {comp.el(xPanel + padP, ys[2])}
      {pasos.el(xPanel + padP, ys[3])}
      <RotuloPanel u={u} x={xPanel + padP} y={ys[4] + 10 * u} texto={X.porque.titulo} />
      {porq.el(xPanel + padP, ys[4] + 38 * u)}
    </svg>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  return variante(ID) === 'b' ? <Camino w={w} h={h} u={u} /> : <Tablero w={w} h={h} u={u} />
}

export default function V15Cierre() {
  return <VistaPlena id={ID}>{({ w, h }) => <Dibujo w={w} h={h} />}</VistaPlena>
}
