// V10 · Qué va antes (legal, Tomas F.). Las acciones legales que se hacen antes de la primera lista, una por fila, con la
// semana del plan en que vence cada una (tabla legal_previas de DF, leída por build_final.py de la tabla «Precondiciones
// de la primera lista» de la Parte A del E4) y la semana de la primera lista (calendario).
// (18/11, fase 8, spec 2 V10) El usuario: «la falta de guías visuales como líneas dificulta asignarle al punto una
// categoría; debe mostrarle el dinamismo de las semanas». Gramática de tiempo de spec 1.4, la misma de V13 y V14:
//   - eje de semanas arriba, de 1 a la semana de la primera lista, como una tira de cuadros en forma de flecha (el tiempo
//     avanza a la derecha) con su número y su título; líneas guía verticales en el borde de cada semana;
//   - una franja por acción (FranjasFila, alternadas) con la acción y su responsable a la izquierda y una guía punteada
//     de la acción a su hito;
//   - el hito (rombo en tinta) en la semana en que vence: no hay fecha de comienzo, así que nada se dibuja antes (spec
//     0.8); desde el hito, la flecha gris «hecha, espera la primera lista» hasta la compuerta;
//   - la compuerta, el foco y el único acento: la semana de la primera lista llena en ACC en la tira y una barra vertical
//     fuerte que baja hasta la última fila, a la que llegan las cinco flechas.
// Leyenda arriba a la izquierda (rombo y flecha; la barra lleva su rótulo encima). Al pasar el mouse por una fila, la franja se realza; al entrar a
// la vista, los hitos aparecen semana a semana y sus flechas corren a la compuerta (CSS_ENTRADA, abajo). La banda y la
// conclusión no cambian: puntaje legal (H40), datos personales (tabla legal) y las acciones previas (legal_previas.n).

import { useState } from 'react'
import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CTX, EJE, INK, PISTA, SUP, Compuerta, Flecha, FranjasFila, Leyenda, anchoLeyenda, ancho, duro,
  escalaSemanas, inicial, tam, useU } from '../svg.jsx'

const ID = 'V10'
const A = DF.anclas
const T = DF.tablas
const X = textosDe(ID)
const G = X.grafico
// rotuloQuien: el responsable como rótulo de fila, con mayúscula inicial («Asesor legal de Casa Óga», como «María G.»)
const ACCIONES = T.legal_previas.acciones.map((a) => {
  const t = { ...a, ...X.acciones[a.codigo] }
  return { ...t, rotuloQuien: inicial(duro(t.quien)) }
})
const SEM_LISTA = T.calendario.primera_lista.semana
const proteccion = T.legal.find((x) => x.id === 'proteccion_datos').puntaje
const sobre = (n, d = 0) => `${fijo(n, d)}[[/${fijo(T.escala_tecnica.hasta)}]]`

if (ACCIONES.length !== T.legal_previas.n) throw new Error('V10: la tarjeta y el gráfico no cuentan las mismas acciones')

export const meta = { id: ID }

// Medidas en u.
const M = {
  accion: 26, quien: 24, numero: 24, titulo: 22, primera: 26,
  pad: 16, hueco: 64, tira: 40, pico: 14, barra: 12, rombo: 36, flecha: 18, punta: 22,
}
const LLENA = 0.9

// Entrada (solo en pantalla y sin movimiento reducido; impresión y capturas ven el estado final): la barra de la
// compuerta baja desde la semana de la primera lista, después cada hito aparece en el orden de su semana y su flecha
// corre hasta la compuerta. Dura menos de un segundo y medio. ANIMAR = false la apaga.
const ANIMAR = false
const CSS_ENTRADA = `@media screen and (prefers-reduced-motion: no-preference) {
  .v10-compuerta { animation: v10-baja 420ms cubic-bezier(.33, 1, .68, 1) both; transform-box: fill-box; transform-origin: center top; }
  .v10-hito { animation: v10-entra 380ms cubic-bezier(.16, 1, .3, 1) var(--d) both; transform-box: fill-box; transform-origin: center; }
  .v10-flecha { animation: v10-crece 560ms cubic-bezier(.33, 1, .68, 1) var(--d) both; transform-box: fill-box; transform-origin: left center; }
}
@keyframes v10-baja { from { transform: scaleY(0); } to { transform: none; } }
@keyframes v10-entra { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: none; } }
@keyframes v10-crece { from { transform: scaleX(0); } to { transform: none; } }`
/** Demora de la entrada de un hito (s), por su semana; la flecha sale 0,18 s después. */
const demora = (semana) => 0.3 + (semana - 1) * 0.16

/** Muestras de la leyenda: el rombo del hito en tinta y la flecha gris. La compuerta no va en la leyenda: lleva su rótulo
 *  («Primera lista») encima, y repetirlo en la leyenda, en el mismo renglón, se leía dos veces. */
const muestraRombo = ({ u, x, y, s }) => <Compuerta u={u} x={x} y={y} s={s / u} estado="curso" />
const muestraFlecha = ({ u, x, y, s }) => (
  <Flecha u={u} x1={x - s * 0.8} x2={x + s / 2} y={y} grosor={s / u / 2} punta={s / u / 2.2} estado="contexto" />
)

/** Tira de semanas: un cuadro en forma de flecha por semana, con su número; la semana de la compuerta llena en ACC con el
 *  número en blanco. */
function TiraSemanas({ u, S, y, alto, foco }) {
  const k = M.pico * u
  const sep = 4 * u
  const f = tam(M.numero, u)
  return (
    <g aria-hidden="true">
      {Array.from({ length: S.n }, (_, i) => i + 1).map((s) => {
        const xa = S.inicio(s) + sep / 2
        const xb = S.fin(s) - sep / 2
        const ym = y + alto / 2
        const muesca = s === 1 ? 0 : k
        const d = `M${xa} ${y} H${xb - k} L${xb} ${ym} L${xb - k} ${y + alto} H${xa} L${xa + muesca} ${ym} Z`
        const es = s === foco
        return (
          <g key={s}>
            <path d={d} fill={es ? ACC : PISTA} />
            <text x={(xa + muesca + xb - k) / 2 + k / 2} y={ym} fontSize={f} fontWeight={es ? 700 : 400}
                  fill={es ? SUP : INK} textAnchor="middle" dominantBaseline="central">{fijo(s)}</text>
          </g>
        )
      })}
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const [sobreFila, setSobreFila] = useState(-1)
  const fA = tam(M.accion, u)
  const fQ = tam(M.quien, u)
  const fT = tam(M.titulo, u)
  const fP = tam(M.primera, u)
  const pad = M.pad * u

  // columna de acciones: la acción más larga (o su responsable) y el hueco mínimo para la guía punteada
  const anchoAccion = (a) => ancho(a.que, fA, 600)
  const col = pad + Math.max(...ACCIONES.map((a) => Math.max(anchoAccion(a), ancho(a.rotuloQuien, fQ, 400))))
  const x0 = col + M.hueco * u
  // el rótulo de la compuerta, centrado en la semana de la primera lista, entra en el lienzo
  const anchoPrimera = ancho(G.primera, fP, 700)
  const colW = Math.min((w - x0) / SEM_LISTA, (w - x0 - anchoPrimera / 2) / (SEM_LISTA - 0.5))
  const S = escalaSemanas({ x0, x1: x0 + colW * SEM_LISTA, desde: 1, hasta: SEM_LISTA })
  const xG = S.centro(SEM_LISTA)

  // leyenda arriba a la izquierda; si no entra antes del rótulo de la compuerta, va debajo de las filas
  const ley = [
    { marca: muestraRombo, texto: G.ley.vence },
    { marca: muestraFlecha, texto: G.ley.hecha },
  ]
  const leyArriba = anchoLeyenda(u, ley) + 32 * u <= xG - anchoPrimera / 2

  // alto: renglón de leyenda y rótulo, tira de semanas y las filas, que reparten LLENA del lienzo
  const hCab = fP * 1.3
  const hTira = M.tira * u
  const hLeyAbajo = leyArriba ? 0 : 24 * u + fT * 1.3
  const bloque = fA * 1.2 + 6 * u + fQ
  const cab = hCab + 10 * u + hTira + 10 * u
  const n = ACCIONES.length
  const alto = Math.max(bloque + 14 * u, Math.min(140 * u, (LLENA * h - cab - hLeyAbajo) / n))
  const total = cab + alto * n + hLeyAbajo
  const yTop = Math.max(0, (h - total) / 2)
  const yTira = yTop + hCab + 10 * u
  const yFilas = yTira + hTira + 10 * u
  const yFin = yFilas + alto * n
  const xFin = S.fin(SEM_LISTA)

  // títulos de la columna y del eje, en el renglón de la tira
  const yT = yTira + hTira / 2
  const titCol = pad + ancho(G.columna, fT, 600) + 24 * u <= x0 - 22 * u - ancho(G.eje, fT, 600)

  const filas = ACCIONES.map((a, i) => {
    const yb = yFilas + i * alto + (alto - bloque) / 2
    return { ...a, i, yA: yb + fA * 0.6, yQ: yb + fA * 1.2 + 6 * u, xS: S.centro(a.semana) }
  })
  const r = (M.rombo * u) / 2

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {ANIMAR && <style>{CSS_ENTRADA}</style>}
      <FranjasFila u={u} x0={0} x1={xFin} y0={yFilas} filas={n} alto={alto} desdeX={0} guia={false} foco={sobreFila} />
      {/* guías verticales en el borde de cada semana */}
      {Array.from({ length: SEM_LISTA + 1 }, (_, i) => i + 1).map((s) => (
        <line key={s} x1={S.inicio(s)} x2={S.inicio(s)} y1={yTira + hTira} y2={yFin} stroke={PISTA} strokeWidth={1.5 * u} />
      ))}

      {/* cabecera: leyenda, rótulo de la compuerta, títulos y tira de semanas */}
      {leyArriba && <Leyenda u={u} x={0} y={yTop + hCab / 2} items={ley} />}
      <text x={xG} y={yTop + hCab / 2} fontSize={fP} fontWeight={700} fill={INK} textAnchor="middle"
            dominantBaseline="central">{G.primera}</text>
      {titCol && (
        <text x={pad} y={yT} fontSize={fT} fontWeight={600} fill={CTX} dominantBaseline="central">{G.columna}</text>
      )}
      <text x={x0 - 22 * u} y={yT} fontSize={fT} fontWeight={600} fill={CTX} textAnchor="end"
            dominantBaseline="central">{G.eje}</text>
      <TiraSemanas u={u} S={S} y={yTira} alto={hTira} foco={SEM_LISTA} />

      {/* filas: acción, responsable, guía punteada, hito y flecha hasta la compuerta */}
      {filas.map((a) => {
        const xGuia = pad + anchoAccion(a) + 14 * u
        return (
          <g key={a.codigo} onMouseEnter={() => setSobreFila(a.i)} onMouseLeave={() => setSobreFila(-1)}>
            <title>{G.ayuda(a.que, a.semana, a.quien)}</title>
            <rect x={0} y={yFilas + a.i * alto} width={xFin} height={alto} fill="transparent" />
            <text x={pad} y={a.yA} fontSize={fA} fontWeight={600} fill={INK} dominantBaseline="central">{a.que}</text>
            <text x={pad} y={a.yQ} fontSize={fQ} fill={CTX} dominantBaseline="hanging">{a.rotuloQuien}</text>
            {a.xS - r - 8 * u > xGuia && (
              <line x1={xGuia} x2={a.xS - r - 8 * u} y1={a.yA} y2={a.yA} stroke={EJE} strokeWidth={2 * u}
                    strokeDasharray={`${0.1 * u} ${7 * u}`} strokeLinecap="round" />
            )}
            {xG - a.xS > r && (
              <g className="v10-flecha" style={{ '--d': `${demora(a.semana) + 0.18}s` }}>
                <Flecha u={u} x1={a.xS} x2={xG - (M.barra * u) / 2} y={a.yA} grosor={M.flecha} punta={M.punta}
                        estado="contexto" />
              </g>
            )}
            <g className="v10-hito" style={{ '--d': `${demora(a.semana)}s` }}>
              <Compuerta u={u} x={a.xS} y={a.yA} s={M.rombo} estado="curso" />
            </g>
          </g>
        )
      })}

      {/* la compuerta: barra vertical en ACC desde la semana de la primera lista hasta la última fila */}
      <rect className="v10-compuerta" x={xG - (M.barra * u) / 2} y={yTira + hTira} width={M.barra * u}
            height={yFin - yTira - hTira} fill={ACC} />

      {!leyArriba && <Leyenda u={u} x={0} y={yFin + 24 * u + (fT * 1.3) / 2} items={ley} />}
    </svg>
  )
}

export default function V10Previas() {
  return (
    <Vista id={ID}
           items={[
             { clave: 'puntaje', valor: sobre(A.H40.valor, 1) },
             { clave: 'proteccion', valor: sobre(proteccion) },
             { clave: 'previas', valor: fijo(T.legal_previas.n) },
           ]}
           cifras={[fijo(T.legal_previas.n), fijo(SEM_LISTA)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
