// V14 · El plan (gestión, Sebastian C.). Las fases del plan (tabla plan de DF, leída por build_final.py del canon y
// controlada contra la Parte A del E4) sobre las semanas desde la aprobación, de la 1 a la última del plan (plan.semanas),
// cada fase con su responsable.
// (18/11, fase 8, spec 2 V14) El usuario: «el dinamismo, mismas aclaraciones que las slides 10 y 13». Gramática de tiempo
// y flujo de spec 1.4, la misma de V10 y V13:
//   - eje de semanas arriba: un número por semana, la línea del eje con sus marcas, líneas guía verticales en el borde de
//     cada semana y el título «Semanas desde la aprobación» a la izquierda, en dos renglones;
//   - carril de hitos en el mismo renglón de los números: en la semana de cada hito (acuerdo, primera lista, tercera
//     lista, informe preliminar; plan.hitos y calendario de DF), un rombo en tinta con su número adentro y su rótulo
//     corto arriba. Un hito no tiene duración: solo el rombo (spec 0.8);
//   - una franja por fase (FranjasFila, con su guía horizontal); cada fase es una Flecha en tinta de la semana `desde` a
//     la `hasta` y, al lado, su nombre y su dueño: adentro en blanco si entran, si no a la derecha (o a la izquierda, si
//     a la derecha está la decisión), sobre un fondo del color de su franja para que las guías no crucen la letra. Sin
//     columna de nombres, las semanas tienen todo el ancho y las fases bajan en escalera, de arriba a la izquierda a
//     abajo a la derecha;
//   - conectores finos donde una fase arranca la semana después de que termina otra (por el borde entre filas, sin
//     pisar rótulos);
//   - antes de la semana 1, la pastilla «Hoy: aprobar el piloto»: lo que se pide para que el plan arranque (la semana 1
//     empieza el lunes siguiente a la aprobación escrita de María G., calendario.regla; plan.hitos n = 2);
//   - el foco y el único acento: la decisión (G63.semana_decision), rombo grande en ACC con su número, la pastilla
//     «Decisión» arriba y una barra vertical que baja hasta la última fila, a la que llega la última flecha.
// Leyenda arriba (flecha, conector, rombo, decisión). Al pasar el mouse por una fila, la franja se realza; al entrar a la
// vista, las flechas corren semana a semana y la barra de la decisión baja al final (CSS_ENTRADA). Las semanas salen de
// DF; los textos, de CF y de textos_vistas/V14.js.

import { useState } from 'react'
import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CTX, EJE, INK, PISTA, REALCE, SUP, TRAZO, Compuerta, Flecha, FranjasFila, Leyenda, ancho, duro,
  escalaSemanas, tam, useU } from '../svg.jsx'

const ID = 'V14'
const PL = DF.tablas.plan
const CAL = DF.tablas.calendario
const X = textosDe(ID)
const G = X.grafico
const SEM = PL.semanas
const SEM_DEC = DF.anclas['G63.semana_decision'].valor
const FASES = PL.fases
const HITOS = [
  { clave: 'acuerdo', semana: PL.hitos.find((x) => x.n === 1).semana },
  { clave: 'primera', semana: CAL.primera_lista.semana },
  { clave: 'tercera', semana: CAL.tercera_lista.semana },
  { clave: 'preliminar', semana: CAL.preliminar.semana },
  { clave: 'decision', semana: SEM_DEC, dec: true },
].map((x) => ({ ...x, texto: G.hitos[x.clave] }))

for (const x of HITOS) {
  if (!Number.isInteger(x.semana) || x.semana < 1 || x.semana > SEM) throw new Error(`V14: el hito «${x.clave}» no cae en una semana del plan`)
}
for (const f of FASES) {
  if (!(f.desde >= 1 && f.hasta <= SEM && f.hasta >= f.desde)) throw new Error(`V14: la fase «${f.fase}» se sale del plan`)
}
const SEM_HITO = new Set(HITOS.map((x) => x.semana))
/** Pares [i, j] de fases donde la j arranca la semana siguiente a la que termina la i. */
const CADENA = FASES.flatMap((a, i) => FASES.flatMap((b, j) => (b.desde === a.hasta + 1 ? [[i, j]] : [])))

export const meta = { id: ID }

// Medidas en u.
const M = {
  fase: 26, quien: 24, hito: 24, dec: 24, num: 22, numHito: 20, eje: 22, hoy: 22,
  pad: 12, col: 40, rombo: 44, romboDec: 50, barra: 6, hueco: 3, punta: 18, conector: 2.5,
}
const LLENA = 0.9

// Entrada (solo en pantalla y sin movimiento reducido; impresión y capturas ven el estado final): los rombos aparecen
// en el orden de su semana, cada flecha corre desde su semana de arranque, los conectores y los dueños se encienden
// detrás, y al final baja la barra de la decisión. Menos de dos segundos. ANIMAR = false la apaga.
const ANIMAR = true
const CSS_ENTRADA = `@media screen and (prefers-reduced-motion: no-preference) {
  .v14-flecha { animation: v14-crece var(--t) cubic-bezier(.33, 1, .68, 1) var(--d) both; transform-box: fill-box; transform-origin: left center; }
  .v14-sale { animation: v14-aparece 260ms ease-out var(--d) both; }
  .v14-rombo { animation: v14-entra 340ms cubic-bezier(.16, 1, .3, 1) var(--d) both; transform-box: fill-box; transform-origin: center; }
  .v14-barra { animation: v14-baja 460ms cubic-bezier(.33, 1, .68, 1) var(--d) both; transform-box: fill-box; transform-origin: center top; }
}
@keyframes v14-crece { from { transform: scaleX(0); } to { transform: none; } }
@keyframes v14-aparece { from { opacity: 0; } to { opacity: 1; } }
@keyframes v14-entra { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: none; } }
@keyframes v14-baja { from { transform: scaleY(0); } to { transform: none; } }`
/** Demora (s) de lo que pasa en una semana. */
const demora = (s) => 0.15 + (s - 1) * 0.045

/** Muestras de la leyenda: la flecha de una fase, el conector, el rombo de un hito y la decisión (rombo y barra en ACC). */
const muestraFlecha = ({ u, x, y, s }) => (
  <Flecha u={u} x1={x - s / 2 - 6 * u} x2={x + s / 2 + 4 * u} y={y} grosor={(s / u) * 0.7} punta={(s / u) * 0.45} estado="curso" />
)
const muestraConector = ({ u, x, y, s }) => (
  <path d={`M${x - s / 2} ${y - s * 0.35} H${x + s * 0.1} Q${x + s * 0.3} ${y - s * 0.35} ${x + s * 0.3} ${y - s * 0.15} V${y + s * 0.45}`}
        fill="none" stroke={INK} strokeWidth={M.conector * u} strokeLinecap="round" />
)
const muestraHito = ({ u, x, y, s }) => <Compuerta u={u} x={x} y={y} s={(s / u) * 1.05} estado="curso" />
const muestraDecision = ({ u, x, y, s }) => (
  <Compuerta u={u} x={x} y={y} s={(s / u) * 1.05} estado="hecho" y1={y - s * 0.62} y2={y + s * 0.62} />
)

/** El texto en dos renglones del ancho más parejo (cortando en un espacio): el título del eje, a la izquierda. */
function dosRenglones(texto, f, peso) {
  const p = String(texto).split(' ')
  let mejor = [texto]
  let ancho2 = ancho(texto, f, peso)
  for (let k = 1; k < p.length; k++) {
    const l = [p.slice(0, k).join(' '), p.slice(k).join(' ')]
    const m = Math.max(...l.map((x) => ancho(x, f, peso)))
    if (m < ancho2) { mejor = l; ancho2 = m }
  }
  return mejor
}

/** Pastilla llena en ACC con el texto en blanco, centrada en (x, y): el rótulo de la decisión. */
const medidaPastilla = (texto, f, u) => ({ w: ancho(texto, f, 700) + 32 * u, h: f * 1.55 })
function Pastilla({ u, x, y, texto, f }) {
  const p = medidaPastilla(texto, f, u)
  return (
    <g>
      <rect x={x - p.w / 2} y={y - p.h / 2} width={p.w} height={p.h} rx={p.h / 2} fill={ACC} />
      <text x={x} y={y} fontSize={f} fontWeight={700} fill={SUP} textAnchor="middle" dominantBaseline="central">{texto}</text>
    </g>
  )
}

/** «Hoy»: pastilla en tinta con el texto en blanco y un pico a la derecha que apunta a (x, y), el arranque de la semana 1. */
const medidaHoy = (texto, f, u) => ({ w: ancho(texto, f, 600) + 28 * u, h: f * 1.6, pico: 12 * u })
function Hoy({ u, x, y, texto, f }) {
  const p = medidaHoy(texto, f, u)
  const xb = x - p.pico
  return (
    <g>
      <path d={`M${xb - 1} ${y - p.pico} L${x} ${y} L${xb - 1} ${y + p.pico} Z`} fill={INK} />
      <rect x={xb - p.w} y={y - p.h / 2} width={p.w} height={p.h} rx={p.h / 2} fill={INK} />
      <text x={xb - p.w / 2} y={y} fontSize={f} fontWeight={600} fill={SUP} textAnchor="middle" dominantBaseline="central">{texto}</text>
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const [foco, setFoco] = useState(-1)
  const fF = tam(M.fase, u), fQ = tam(M.quien, u), fH = tam(M.hito, u), fD = tam(M.dec, u)
  const fN = tam(M.num, u), fNH = tam(M.numHito, u), fE = tam(M.eje, u)
  const pad = M.pad * u
  const g = M.hueco * u
  const rH = (M.rombo * u) / 2
  const rD = (M.romboDec * u) / 2
  const sep = 14 * u

  // a la izquierda, solo el título del eje en dos renglones (en el renglón de los números); el resto del ancho es de las
  // semanas. La pastilla de la decisión, centrada en su semana, entra a la derecha.
  const titulo = dosRenglones(G.eje, fE, 600)
  const fHoy = tam(M.hoy, u)
  const pHoy = medidaHoy(G.hoy, fHoy, u)
  const x0 = Math.max(Math.max(...titulo.map((l) => ancho(l, fE, 600))) + M.col * u, pHoy.w + pHoy.pico + 8 * u)
  const pD = medidaPastilla(G.hitos.decision, fD, u)
  const medio = Math.max(pD.w / 2, rD) + 2 * u
  const dw = Math.min((w - x0) / SEM, (w - x0 - medio) / (SEM_DEC - 0.5))
  const S = escalaSemanas({ x0, x1: x0 + dw * SEM, desde: 1, hasta: SEM })
  const xFin = S.fin(SEM)
  const xDec = S.centro(SEM_DEC)
  const mBarra = (M.barra * u) / 2

  // rótulos de los hitos: centrados en su semana; si dos se pisan, el segundo sube un renglón
  const rot = HITOS.map((x) => {
    const wl = x.dec ? pD.w : ancho(x.texto, fH, 600)
    const xc = Math.min(Math.max(S.centro(x.semana), wl / 2), w - wl / 2)
    return { ...x, xc, wl, nivel: 0 }
  })
  const borde = []
  for (const r of [...rot].sort((a, b) => a.xc - b.xc)) {
    let k = 0
    while (borde[k] != null && r.xc - r.wl / 2 < borde[k] + 20 * u) k++
    r.nivel = k
    borde[k] = r.xc + r.wl / 2
  }
  const niveles = Math.max(...rot.map((r) => r.nivel)) + 1

  // alto: leyenda, renglones de rótulos, renglón de números y rombos, y las filas, que reparten LLENA del lienzo
  const hLey = tam(24, u) * 1.3
  const hRot = Math.max(fH * 1.3, pD.h)
  const cab = hLey + 22 * u + niveles * hRot + 8 * u + 2 * rD + 10 * u
  const n = FASES.length
  const fila = Math.max(50 * u, Math.min(100 * u, (LLENA * h - cab) / n))
  const total = cab + n * fila
  const yTop = Math.max(0, (h - total) / 2)
  const yLey = yTop + hLey / 2
  const yRot = (k) => yTop + hLey + 22 * u + (niveles - 1 - k) * hRot + hRot / 2
  const yAx = yTop + hLey + 22 * u + niveles * hRot + 8 * u + rD
  const y0 = yAx + rD + 10 * u
  const yFin = y0 + n * fila
  const t = Math.max(30 * u, Math.min(44 * u, fila * 0.62))
  const yc = (i) => y0 + (i + 0.5) * fila

  // cada fase: su flecha y, al lado, nombre y dueño: adentro (en blanco) si entran; si no, a la derecha (sin pasar la
  // barra de la decisión) o a la izquierda
  const filas = FASES.map((f, i) => {
    const x1 = S.inicio(f.desde) + g
    const x2 = f.hasta === SEM_DEC ? xDec - mBarra : S.fin(f.hasta) - g
    const quien = duro(f.responsable)
    const wN = ancho(f.fase, fF, 400)
    const largo = wN + sep + ancho(quien, fQ, 600)
    const tope = f.hasta < SEM_DEC ? xDec - mBarra - 16 * u : w
    let lugar = 'der'
    if (largo + 2 * pad + M.punta * u <= x2 - x1) lugar = 'dentro'
    else if (x2 + 12 * u + largo > tope && x1 - 12 * u - largo >= x0) lugar = 'izq'
    const xt = lugar === 'dentro' ? x1 + pad : lugar === 'der' ? x2 + 12 * u : x1 - 12 * u - largo
    return { ...f, i, x1, x2, quien, lugar, xt, xq: xt + wN + sep, largo }
  })

  const ley = [
    { marca: muestraFlecha, texto: G.ley.fase },
    { marca: muestraConector, texto: G.ley.sigue },
    { marca: muestraHito, texto: G.ley.hito },
    { marca: muestraDecision, texto: G.ley.decision },
  ]

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {ANIMAR && <style>{CSS_ENTRADA}</style>}
      <FranjasFila u={u} x0={x0} x1={xFin} y0={y0} filas={n} alto={fila} foco={foco} />

      {/* eje de semanas: guías verticales en el borde de cada semana, la línea del eje con sus marcas y el título */}
      {Array.from({ length: SEM + 1 }, (_, i) => i + 1).map((s) => (
        <g key={`g${s}`}>
          <line x1={S.inicio(s)} x2={S.inicio(s)} y1={y0} y2={yFin} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
          <line x1={S.inicio(s)} x2={S.inicio(s)} y1={y0 - 8 * u} y2={y0} stroke={EJE} strokeWidth={TRAZO.base * u} />
        </g>
      ))}
      <line x1={x0} x2={xFin} y1={y0} y2={y0} stroke={EJE} strokeWidth={TRAZO.base * u} />
      {titulo.map((l, k) => (
        <text key={`t${k}`} x={x0 - 18 * u} y={yAx + (k - (titulo.length - 1) / 2) * fE * 1.15} fontSize={fE}
              fontWeight={600} fill={CTX} textAnchor="end" dominantBaseline="central">{l}</text>
      ))}
      {Array.from({ length: SEM }, (_, i) => i + 1).filter((s) => !SEM_HITO.has(s)).map((s) => (
        <text key={`n${s}`} x={S.centro(s)} y={yAx} fontSize={fN} fill={CTX} textAnchor="middle"
              dominantBaseline="central">{fijo(s)}</text>
      ))}

      {/* filas: flecha de la semana de arranque a la de cierre, con el nombre de la fase y su dueño */}
      {filas.map((f) => {
        const color = f.lugar === 'dentro' ? SUP : INK
        return (
          <g key={f.n} onMouseEnter={() => setFoco(f.i)} onMouseLeave={() => setFoco(-1)}>
            <title>{G.ayuda(f.fase, f.desde, f.hasta, f.responsable)}</title>
            <rect x={x0} y={y0 + f.i * fila} width={xFin - x0} height={fila} fill="transparent" />
            <g className="v14-flecha" style={{ '--d': `${demora(f.desde)}s`, '--t': `${0.2 + (f.hasta - f.desde) * 0.045}s` }}>
              <Flecha u={u} x1={f.x1} x2={f.x2} y={yc(f.i)} grosor={t / u} punta={M.punta} estado="curso" />
            </g>
            <g className="v14-sale" style={{ '--d': `${demora(f.lugar === 'izq' ? f.desde : f.hasta) + 0.15}s` }}>
              {f.lugar !== 'dentro' && (
                // fondo del rótulo con el mismo color de su franja: las guías no le pasan por detrás a la letra
                <g>
                  <rect x={f.xt - 6 * u} y={yc(f.i) - fF * 0.62} width={f.largo + 12 * u} height={fF * 1.24} fill={SUP} />
                  {(f.i === foco || f.i % 2 === 0) && (
                    <rect x={f.xt - 6 * u} y={yc(f.i) - fF * 0.62} width={f.largo + 12 * u} height={fF * 1.24}
                          fill={f.i === foco ? REALCE : PISTA} fillOpacity={f.i === foco ? 1 : 0.4} />
                  )}
                </g>
              )}
              <text x={f.xt} y={yc(f.i)} fontSize={fF} fontWeight={400} fill={color} dominantBaseline="central">{f.fase}</text>
              <text x={f.xq} y={yc(f.i)} fontSize={fQ} fontWeight={700} fill={color} dominantBaseline="central">{f.quien}</text>
            </g>
          </g>
        )
      })}

      {/* conectores: del cuerpo de la fase que termina, por el borde entre filas, a la que arranca la semana siguiente */}
      {CADENA.map(([i, j]) => {
        const a = filas[i], b = filas[j]
        const baja = j > i ? 1 : -1
        const xa = Math.max(a.x1 + 4 * u, a.x2 - M.punta * u - 6 * u)
        const xb = b.x1 + 12 * u
        const ya = yc(i) + baja * (t / 2)
        const ym = (yc(i) + yc(j)) / 2
        const yb = yc(j) - baja * (t / 2)
        const r = Math.min(6 * u, Math.abs(ym - ya), Math.abs(yb - ym), (xb - xa) / 2)
        const d = `M${xa} ${ya} V${ym - baja * r} Q${xa} ${ym} ${xa + r} ${ym} H${xb - r} Q${xb} ${ym} ${xb} ${ym + baja * r} V${yb}`
        return (
          <path key={`c${i}-${j}`} className="v14-sale" style={{ '--d': `${demora(a.hasta) + 0.2}s` }} d={d} fill="none"
                stroke={INK} strokeWidth={M.conector * u} strokeLinecap="round" strokeLinejoin="round" />
        )
      })}

      {/* la decisión: barra en ACC de los rombos a la última fila (la última flecha llega a ella) */}
      <g className="v14-barra" style={{ '--d': `${demora(SEM_DEC) + 0.1}s` }}>
        <rect x={xDec - mBarra} y={yAx} width={M.barra * u} height={yFin - yAx} fill={ACC} />
      </g>

      {/* carril de hitos: rombo con su número en el renglón del eje y el rótulo corto arriba */}
      {rot.map((x) => {
        const xs = S.centro(x.semana)
        const y = yRot(x.nivel)
        const r = x.dec ? rD : rH
        return (
          <g key={x.clave} className="v14-rombo" style={{ '--d': `${demora(x.semana)}s` }}>
            <title>{G.ayudaHito(x.texto, x.semana)}</title>
            {x.nivel > 0 && (
              <line x1={xs} x2={xs} y1={y + hRot / 2 - 4 * u} y2={yAx - r - 2 * u} stroke={EJE} strokeWidth={TRAZO.guia * u} />
            )}
            {x.dec
              ? <Pastilla u={u} x={x.xc} y={y} texto={x.texto} f={fD} />
              : <text x={x.xc} y={y} fontSize={fH} fontWeight={600} fill={INK} textAnchor="middle"
                      dominantBaseline="central">{x.texto}</text>}
            <Compuerta u={u} x={xs} y={yAx} s={x.dec ? M.romboDec : M.rombo} estado={x.dec ? 'hecho' : 'curso'} />
            <text x={xs} y={yAx} fontSize={fNH} fontWeight={700} fill={SUP} textAnchor="middle"
                  dominantBaseline="central">{fijo(x.semana)}</text>
          </g>
        )
      })}

      {/* hoy: lo que se pide para que arranque la semana 1 */}
      <g className="v14-sale" style={{ '--d': '0s' }}>
        <Hoy u={u} x={x0 - 4 * u} y={yc(0)} texto={G.hoy} f={fHoy} />
      </g>

      <Leyenda u={u} x={0} y={yLey} items={ley} />
    </svg>
  )
}

export default function V14Plan() {
  return (
    <Vista id={ID}
           items={[
             { clave: 'decide', valor: fijo(SEM_DEC) },
             { clave: 'lista', valor: fijo(CAL.primera_lista.semana) },
           ]}
           cifras={[fijo(CAL.primera_lista.semana), fijo(CAL.preliminar.semana), fijo(SEM_DEC)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
