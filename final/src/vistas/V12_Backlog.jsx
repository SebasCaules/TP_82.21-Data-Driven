// V12 · El backlog (gestión, Sebastian C.). Las épicas del backlog (tabla backlog de DF, leída por build_final.py de
// EPICAS e HISTORIAS de la Parte A del E4) y sus historias de usuario, una ficha por historia con su código (HU-n-nn).
// (18/11, fase 8, spec V12) El usuario no entendía qué eran los cuadros ni a qué épica atacaba cada uno, y los nombres
// de fila eran largos: cada épica lleva ahora un título breve (textos_vistas/V12.js) que es lo que más pesa, y debajo,
// en chico, su nombre completo. Dos versiones (variante('V12')):
//   a  tablero por estado: una fila por épica y tres columnas (hecha, en el piloto, si el piloto pasa) con encabezado
//      lleno y su total (K04, K05, K06); cada ficha va en la celda de su épica y su estado. Leyenda en la esquina.
//   b  ocho tarjetas en 4 × 2, una por épica, con sus fichas del color del estado y la leyenda de estados arriba.
// El estado usa FLUJO de svg.jsx (el mismo código que V13): hecha en acento (el título habla de las hechas), en el piloto
// en gris y si el piloto pasa en contorno punteado. Los totales salen de K04 a K06 y se controlan contra la tabla.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { variante } from '../variantes.js'
import {
  CTX, INK, PISTA, SUP, TRAZO, FranjasFila, Leyenda, anchoLeyenda, ancho, envolver, marcaFlujo, rectRedondo, tam, useU,
} from '../svg.jsx'

const ID = 'V12'
const A = DF.anclas
const BL = DF.tablas.backlog
const X = textosDe(ID)
const GRUPOS = ['hecha', 'piloto', 'despues']
const ANCLA = { hecha: 'K04', piloto: 'K05', despues: 'K06' }
const CUANTAS = Object.fromEntries(GRUPOS.map((g) => [g, BL.historias.filter((h) => h.grupo === g).length]))
for (const g of GRUPOS) {
  if (CUANTAS[g] !== A[ANCLA[g]].valor) throw new Error(`V12: la tabla del backlog y ${ANCLA[g]} no cuentan lo mismo`)
}
if (BL.historias.length !== A.K02.valor) throw new Error('V12: la tabla del backlog y K02 no cuentan lo mismo')

// grupo de la tabla → estado de FLUJO (svg.jsx): hecha → lleno en ACC, piloto → gris, después → punteado
const ESTADO_DE = { hecha: 'hecha', piloto: 'piloto', despues: 'condicional' }

const EPICAS = BL.epicas.map((e) => {
  const breve = X.breves?.[e.n]
  if (!breve) throw new Error(`V12: falta el título breve de la épica ${e.n} en textos_vistas/V12.js`)
  const hus = BL.historias.filter((x) => x.epica === e.n)
  return { ...e, breve, hus, por: Object.fromEntries(GRUPOS.map((g) => [g, hus.filter((x) => x.grupo === g)])) }
})
const MAX_CELDA = Object.fromEntries(GRUPOS.map((g) => [g, Math.max(1, ...EPICAS.map((e) => e.por[g].length))]))
const MAX_EPICA = Math.max(...EPICAS.map((e) => e.hus.length))
// la ficha de la leyenda de la versión a: una historia real, en gris para no sumar otra marca en acento
const MUESTRA = BL.historias.find((x) => x.grupo === 'piloto') ?? BL.historias[0]
const TOTAL = (g) => fijo(A[ANCLA[g]].valor)

export const meta = { id: ID }

const entre = (v, a, b) => Math.min(b, Math.max(a, v))
const anchoFicha = (f) => Math.max(...BL.historias.map((x) => ancho(x.id, f, 600)))

/** Renglones de hasta `w` px, parejos: si el texto va en dos renglones, corta donde el más largo de los dos es más
 *  corto (no deja una palabra sola abajo). Con más de dos, como envolver. */
function parejo(texto, w, f) {
  const base = envolver(texto, w, f, 400)
  if (base.length !== 2) return base
  const p = String(texto).split(' ')
  let mejor = base
  let largo = Math.max(...base.map((l) => ancho(l, f, 400)))
  for (let i = 1; i < p.length; i++) {
    const par = [p.slice(0, i).join(' '), p.slice(i).join(' ')]
    const m = Math.max(...par.map((l) => ancho(l, f, 400)))
    if (m <= w && m < largo) { mejor = par; largo = m }
  }
  return mejor
}

/** Una ficha: un rectángulo con el estado de la historia (marcaFlujo) y su código centrado. */
function Ficha({ u, x, y, w, h, hu, f }) {
  const m = marcaFlujo(ESTADO_DE[hu.grupo], u)
  const a = m.trazo / 2
  return (
    <g>
      <rect x={x + a} y={y + a} width={w - 2 * a} height={h - 2 * a} rx={TRAZO.radio * u} {...m.attrs} />
      <text x={x + w / 2} y={y + h / 2} fontSize={f} fontWeight={600} fill={m.texto} textAnchor="middle"
            dominantBaseline="central">{hu.id}</text>
    </g>
  )
}

const tituloEpica = (e) => `${e.breve}: ${e.nombre}. ${e.hus.map((x) => `${x.id}, ${X.estados[x.grupo]}`).join('; ')}`

// ------------------------------------------------------------------ a · tablero por estado

function medirA(w, h, u) {
  const n = EPICAS.length
  const hEnc = entre(0.088 * h, 46 * u, 62 * u)        // encabezado de las columnas
  const gEnc = 8 * u
  const R = entre((0.945 * h - hEnc - gEnc) / n, 46 * u, 92 * u)
  // la fila: título breve (lo que más pesa) y, debajo, el nombre completo en chico; el resto de la fila queda de aire
  let fT = entre(0.5 * R, 26 * u, 36 * u)
  let fD = entre(0.34 * R, 20 * u, 24 * u)
  const sep = () => 0.5 * fT + 0.5 * fD + 3 * u         // de centro a centro de los dos renglones
  while (0.38 * fT + sep() + 0.38 * fD > R - 12 * u && fT > 24 * u) fT -= 0.25 * u
  const lado = entre(R - 14 * u, 34 * u, 54 * u)        // círculo del número de la épica
  const xTexto = lado + 16 * u
  const hF = entre(R - 16 * u, 30 * u, 50 * u)
  const gF = 10 * u
  const pad = 16 * u
  const fH = tam(24, u)
  const fN = tam(32, u)
  const gCol = 12 * u
  const holgura = GRUPOS.length * 16 * u
  // fichas y columnas; si no entra todo a lo ancho (4:3), bajan primero el código, después la descripción y el título
  let fC = tam(R >= 66 * u ? 22 : 20, u)
  let wF, necesita, T0, suma
  for (;;) {
    wF = anchoFicha(fC) + 26 * u
    necesita = GRUPOS.map((g) => Math.max(
      MAX_CELDA[g] * wF + (MAX_CELDA[g] - 1) * gF + 2 * pad,
      ancho(X.columnas[g], fH, 700) + 36 * u + ancho(TOTAL(g), fN, 700) + 2 * pad,
    ))
    suma = necesita.reduce((s, y) => s + y, 0) + (GRUPOS.length - 1) * gCol
    T0 = xTexto + Math.max(...EPICAS.map((e) => Math.max(ancho(e.breve, fT, 700), ancho(e.nombre, fD, 400)))) + 32 * u
    if (T0 + suma + holgura <= w) break
    if (fC > 20 * u) fC = 20 * u
    else if (fD > 20 * u) fD = Math.max(20 * u, fD - 0.5 * u)
    else if (fT > 26 * u) fT = Math.max(26 * u, fT - 0.5 * u)
    else break
  }
  // la columna de las épicas se ensancha, si sobra lugar, para que la leyenda de la esquina entre en un renglón
  const fL = tam(22, u)
  const conLeyenda = wF + 12 * u + ancho(X.ficha, fL, 400) + 24 * u
  const tope = w - suma - holgura
  const T = Math.max(T0, Math.min(conLeyenda, tope))
  const libre = w - T - (GRUPOS.length - 1) * gCol
  const igual = libre / GRUPOS.length
  const anchos = necesita.every((x) => x <= igual)
    ? necesita.map(() => igual)
    : necesita.map((x) => x + (libre - necesita.reduce((s, y) => s + y, 0)) / GRUPOS.length)
  const xs = []
  anchos.reduce((x, a) => { xs.push(x); return x + a + gCol }, T)
  // la leyenda, en la esquina de arriba a la izquierda: en un renglón si entra, si no en dos
  const anchoL = T - wF - 12 * u - 24 * u + 1
  const igualdad = X.ficha.indexOf(' = ')
  const lineasL = ancho(X.ficha, fL, 400) <= anchoL ? [X.ficha]
    : igualdad > 0 ? [X.ficha.slice(0, igualdad + 2), X.ficha.slice(igualdad + 3)] // corta después del «=»
      : parejo(X.ficha, anchoL, fL)
  const alto = hEnc + gEnc + n * R
  return { n, hEnc, gEnc, R, fT, fD, sep: sep(), lado, xTexto, fC, hF, wF, gF, pad, fH, fN, T, anchos, xs, fL, lineasL, alto }
}

function DibujoA({ w, h }) {
  const u = useU()
  const m = medirA(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const yCuerpo = m.hEnc + m.gEnc
  const yLey = m.hEnc / 2
  const hLey = Math.min(m.hF, m.hEnc - 4 * u)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {/* leyenda: qué es una ficha */}
        <Ficha u={u} x={0} y={yLey - hLey / 2} w={m.wF} h={hLey} hu={MUESTRA} f={m.fC} />
        {m.lineasL.map((l, i) => (
          <text key={i} x={m.wF + 12 * u} y={yLey + (i - (m.lineasL.length - 1) / 2) * m.fL * 1.2} fontSize={m.fL}
                fill={INK} dominantBaseline="central">{l}</text>
        ))}
        {/* encabezados llenos: el estado y su total */}
        {GRUPOS.map((g, i) => {
          const f = marcaFlujo(ESTADO_DE[g], u)
          const a = f.trazo / 2
          return (
            <g key={g}>
              <path d={rectRedondo(m.xs[i] + a, a, m.anchos[i] - 2 * a, m.hEnc - 2 * a, 6 * u, 'todos')} {...f.attrs} />
              <text x={m.xs[i] + m.pad} y={m.hEnc / 2} fontSize={m.fH} fontWeight={700} fill={f.texto}
                    dominantBaseline="central">{X.columnas[g]}</text>
              <text x={m.xs[i] + m.anchos[i] - m.pad} y={m.hEnc / 2} fontSize={m.fN} fontWeight={700} fill={f.texto}
                    textAnchor="end" dominantBaseline="central">{TOTAL(g)}</text>
            </g>
          )
        })}
        {/* filas: franja alterna y guía de punta a punta, para leer a qué épica va cada ficha */}
        <FranjasFila u={u} x0={m.T - 12 * u} x1={w} y0={yCuerpo} filas={m.n} alto={m.R} desdeX={0} />
        {m.xs.slice(1).map((x, i) => (
          <line key={i} x1={x - 6 * u} x2={x - 6 * u} y1={yCuerpo} y2={yCuerpo + m.n * m.R} stroke={PISTA}
                strokeWidth={TRAZO.guia * u} />
        ))}
        {EPICAS.map((e, i) => {
          const yc = yCuerpo + (i + 0.5) * m.R
          return (
            <g key={e.n}>
              <title>{tituloEpica(e)}</title>
              {/* el número de la épica, en contorno: no se confunde con una ficha (que va llena y con código) */}
              <circle cx={m.lado / 2} cy={yc} r={m.lado / 2 - 1.5 * u} fill={SUP} stroke={INK} strokeWidth={3 * u} />
              <text x={m.lado / 2} y={yc} fontSize={entre(0.52 * m.lado, 20 * u, 28 * u)} fontWeight={700} fill={INK}
                    textAnchor="middle" dominantBaseline="central">{fijo(e.n)}</text>
              <text x={m.xTexto} y={yc - m.sep / 2} fontSize={m.fT} fontWeight={700} fill={INK}
                    dominantBaseline="central">{e.breve}</text>
              <text x={m.xTexto} y={yc + m.sep / 2} fontSize={m.fD} fill={CTX} dominantBaseline="central">{e.nombre}</text>
              {GRUPOS.map((g, k) => e.por[g].map((hu, j) => (
                <Ficha key={hu.id} u={u} x={m.xs[k] + m.pad + j * (m.wF + m.gF)} y={yc - m.hF / 2} w={m.wF} h={m.hF}
                       hu={hu} f={m.fC} />
              )))}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ------------------------------------------------------------------ b · ocho tarjetas

function medirB(w, h, u) {
  const nc = 4
  const nf = Math.ceil(EPICAS.length / nc)
  const fL = tam(24, u)
  const hLey = 36 * u
  const gLey = 24 * u
  const gx = 14 * u
  const gy = 22 * u
  const cw = (w - (nc - 1) * gx) / nc
  const ch = entre((0.93 * h - hLey - gLey - (nf - 1) * gy) / nf, 170 * u, 290 * u)
  const hb = entre(0.26 * ch, 52 * u, 70 * u)          // franja del título
  const fT = entre(0.54 * hb, 26 * u, 36 * u)
  const pad = 12 * u
  const gF = 6 * u
  const lugar = (cw - 2 * pad - (MAX_EPICA - 1) * gF) / MAX_EPICA
  const fC = tam(ch >= 260 * u && anchoFicha(tam(22, u)) + 20 * u <= lugar ? 22 : 20, u)
  const wF = Math.min(anchoFicha(fC) + 26 * u, lugar)
  let fD = entre(0.11 * ch, 20 * u, 24 * u)
  let hF = entre(0.22 * ch, 36 * u, 60 * u)
  const lineas = (f) => EPICAS.map((e) => parejo(e.nombre, cw - 2 * pad, f))
  const cabe = (f, hf) => hb + pad + Math.max(...lineas(f).map((l) => l.length)) * f * 1.25 + pad + hf + pad <= ch
  while (!cabe(fD, hF) && fD > 20 * u) fD = Math.max(20 * u, fD - 0.5 * u)
  while (!cabe(fD, hF) && hF > 34 * u) hF = Math.max(34 * u, hF - 1 * u)
  const r = entre(0.3 * hb, 16 * u, 21 * u)            // disco del número
  const alto = hLey + gLey + nf * ch + (nf - 1) * gy
  return { nc, nf, fL, hLey, gLey, gx, gy, cw, ch, hb, fT, pad, fC, gF, wF, fD, hF, r, lineas: lineas(fD), alto }
}

function DibujoB({ w, h }) {
  const u = useU()
  const m = medirB(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const ley = GRUPOS.map((g) => ({ marca: ESTADO_DE[g], texto: `${X.columnas[g]}${X.separador}${TOTAL(g)}` }))
  const yTarjetas = m.hLey + m.gLey
  const cabeFicha = anchoLeyenda(u, ley) + 48 * u + ancho(X.ficha, m.fL, 400) <= w
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {/* leyenda de estados (con su total) y qué es una ficha */}
        <Leyenda u={u} x={0} y={m.hLey / 2} items={ley} />
        {cabeFicha && (
          <text x={w} y={m.hLey / 2} fontSize={m.fL} fill={INK} textAnchor="end" dominantBaseline="central">{X.ficha}</text>
        )}
        {EPICAS.map((e, i) => {
          const x = (i % m.nc) * (m.cw + m.gx)
          const y = yTarjetas + Math.floor(i / m.nc) * (m.ch + m.gy)
          const yF = y + m.ch - m.pad - m.hF
          return (
            <g key={e.n}>
              <title>{tituloEpica(e)}</title>
              <rect x={x} y={y} width={m.cw} height={m.ch} rx={8 * u} fill={PISTA} fillOpacity={0.4} />
              <path d={rectRedondo(x, y, m.cw, m.hb, 8 * u, 'arr')} fill={INK} />
              <circle cx={x + m.pad + m.r} cy={y + m.hb / 2} r={m.r} fill={SUP} />
              <text x={x + m.pad + m.r} y={y + m.hb / 2} fontSize={entre(1.15 * m.r, 20 * u, 26 * u)} fontWeight={700}
                    fill={INK} textAnchor="middle" dominantBaseline="central">{fijo(e.n)}</text>
              <text x={x + m.pad + 2 * m.r + 14 * u} y={y + m.hb / 2} fontSize={m.fT} fontWeight={700} fill={SUP}
                    dominantBaseline="central">{e.breve}</text>
              {m.lineas[i].map((l, j) => (
                <text key={j} x={x + m.pad} y={y + m.hb + m.pad + (j + 0.5) * m.fD * 1.25} fontSize={m.fD} fill={CTX}
                      dominantBaseline="central">{l}</text>
              ))}
              {e.hus.map((hu, j) => (
                <Ficha key={hu.id} u={u} x={x + m.pad + j * (m.wF + m.gF)} y={yF} w={m.wF} h={m.hF} hu={hu} f={m.fC} />
              ))}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export default function V12Backlog() {
  const Dibujo = variante(ID) === 'b' ? DibujoB : DibujoA
  return (
    <Vista id={ID}
           items={[
             { clave: 'historias', valor: fijo(A.K02.valor) },
             { clave: 'hechas', valor: fijo(A.K04.valor) },
             { clave: 'horas', valor: fijo(A.K07.valor) },
           ]}
           cifras={[fijo(A.K04.valor), fijo(A.K05.valor), fijo(A.K06.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
