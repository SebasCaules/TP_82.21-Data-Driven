// V10 · Qué va antes (legal, Tomas F.). Las acciones legales que se hacen antes de la primera lista, con la semana del
// plan en que vence cada una (tabla legal_previas de DF, leída por build_final.py de la tabla «Precondiciones de la
// primera lista» de la Parte A del E4) y la semana de la primera lista (calendario).
// (19/11, fase 9, spec 4 V10) El usuario: «cada acción espera a la lista como si fueran personas en un equipo cuando en
// realidad son decisiones escalonadas que para pasar a la siguiente hay que cumplir la anterior». Una escalera:
//   - un escalón por semana en que vence algo (1, 2 y 4), con sus acciones escritas encima en nombre corto; el escalón
//     sube desde la semana en que vence (no hay fecha de comienzo: el borde izquierdo es el vencimiento, spec 0.8 de la
//     fase 8) y llega hasta la semana del escalón siguiente, que no se pisa sin cumplir este;
//   - arriba de todo, en la semana de la primera lista, el último escalón: la primera lista, el único acento;
//   - el eje de semanas abajo, con su título. Sin leyenda: cada escalón y la lista llevan su rótulo.
// Pasos (spec 2): 1, el eje, la primera lista y el escalón de la semana 1; 2 y 3, un escalón cada uno; 4, la capa de
// responsables: una lámina clara con borde sobre los tres escalones, como la de V14 (el eje y la primera lista quedan
// nítidos), y el nombre debajo de cada acción, en el renglón que el escalón le guarda.
// La banda lleva solo el puntaje legal (H40); la conclusión, las acciones previas (legal_previas.n) y la semana de la
// primera lista.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import {
  ACC, EJE, FIN_GRIS, INK, PISTA, SUP, TRAZO, EjeX, Paso, altoEjeX, ancho, duro, envolver, inicial, tam, useU,
} from '../svg.jsx'

const ID = 'V10'
const A = DF.anclas
const T = DF.tablas
const TX = textosDe(ID)
const G = TX.grafico
const ACCIONES = T.legal_previas.acciones.map((a) => {
  const t = { ...a, ...TX.acciones[a.codigo] }
  if (!t.corta || !t.quien) throw new Error(`V10: la acción ${a.codigo} no trae nombre corto o responsable`)
  return { ...t, quien: inicial(duro(t.quien)) }
})
const SEM_LISTA = T.calendario.primera_lista.semana
const sobre = (n, d = 0) => `${fijo(n, d)}[[/${fijo(T.escala_tecnica.hasta)}]]`

// Un escalón por semana de vencimiento, en orden; cada uno con sus acciones en el orden de la tabla. El escalón i se
// enciende en el paso i; la capa de responsables, en el paso siguiente al último escalón.
const SEMANAS = [...new Set(ACCIONES.map((a) => a.semana))].sort((a, b) => a - b)
const ESCALONES = SEMANAS.map((s, i) => ({
  semana: s, hasta: SEMANAS[i + 1] ?? SEM_LISTA, nivel: i + 1, acciones: ACCIONES.filter((a) => a.semana === s),
}))
const NIVELES = ESCALONES.length + 1
const PASO_CAPA = ESCALONES.length + 1

if (ACCIONES.length !== T.legal_previas.n) throw new Error('V10: la conclusión y el gráfico no cuentan las mismas acciones')
if (SEMANAS[SEMANAS.length - 1] >= SEM_LISTA) throw new Error('V10: una acción previa vence después de la primera lista')

export const meta = { id: ID, pasos: PASO_CAPA }

// Medidas en u.
const M = {
  accion: 26, accionMin: 24, quien: 24, primera: 26,
  margen: 14, remate: 64, hueco: 4, borde: 6, rotulo: 14,
  padL: 14, padR: 8, padT: 12, padB: 8, entre: 10, nivelMax: 175,
  lamina: 10, radio: 8,
}
const LLENA = 0.9
/** Opacidad de la lámina de responsables: la misma de V14, las acciones se siguen leyendo debajo. */
const VELO = 0.45
const INTER_A = 1.15
const INTER_Q = 1.2

/** Los renglones de un escalón con la letra f: por acción, su nombre (hasta dos renglones) y debajo el renglón del
 *  responsable. alto: lo que ocupan; entra: si cada renglón cabe en el ancho. */
function renglones(e, f, fQ, wi, u) {
  const out = []
  let y = 0
  let entra = true
  e.acciones.forEach((a, j) => {
    if (j) y += M.entre * u
    const lineas = envolver(a.corta, wi, f, 600)
    if (lineas.length > 2 || lineas.some((l) => ancho(l, f, 600) > wi)) entra = false
    for (const l of lineas) {
      out.push({ t: l, y, quien: false })
      y += f * INTER_A
    }
    out.push({ t: a.quien, y, quien: true })
    y += fQ * INTER_Q
  })
  return { lineas: out, alto: y, entra }
}

function Dibujo({ w, h }) {
  const u = useU()
  const fQ = tam(M.quien, u)
  const fP = tam(M.primera, u)
  const hEje = altoEjeX(u)

  // semanas: la 1 a M.margen del borde y la de la primera lista dejando el ancho del último escalón
  const xL = M.margen * u
  const col = (w - xL - M.remate * u) / (SEM_LISTA - 1)
  const xSem = (s) => xL + (s - 1) * col

  // alto de un nivel: los niveles y el eje llenan LLENA del lienzo (con un tope, para las ventanas altas)
  const nivel = Math.min(M.nivelMax * u, (LLENA * h - hEje) / NIVELES)
  const ancho1 = (e) => xSem(e.hasta) - xSem(e.semana) - M.hueco * u - (M.padL + M.padR) * u
  const altoLibre = (e) => e.nivel * nivel - (M.borde + M.padT + M.padB) * u

  // la letra de las acciones: la más grande, de 26 u a 24 u, con la que todos los escalones entran
  let fA = tam(M.accionMin, u)
  for (let f = M.accion * u; f >= M.accionMin * u; f -= 0.25 * u) {
    if (ESCALONES.every((e) => { const r = renglones(e, f, fQ, ancho1(e), u); return r.entra && r.alto <= altoLibre(e) })) {
      fA = f
      break
    }
  }

  const total = NIVELES * nivel + hEje
  const yTop = Math.max(0, (h - total) / 2)
  const yBase = yTop + NIVELES * nivel
  const techo = (k) => yBase - k * nivel
  const xLista = xSem(SEM_LISTA)
  // la lámina: de un poco arriba del escalón más alto hasta el eje, y del borde hasta la primera lista
  const lam = {
    x: TRAZO.guia * u, y: techo(ESCALONES.length) - M.lamina * u,
    x1: xLista - (M.hueco / 2) * u,
  }

  const esc = ESCALONES.map((e) => {
    const x0 = xSem(e.semana)
    const x1 = xSem(e.hasta) - M.hueco * u
    const y0 = techo(e.nivel)
    const r = renglones(e, fA, fQ, ancho1(e), u)
    const yT = y0 + (M.borde + M.padT) * u
    return { ...e, x0, x1, y0, xT: x0 + M.padL * u, lineas: r.lineas.map((l) => ({ ...l, y: yT + l.y })) }
  })

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* los escalones: el bloque, el borde de arriba y las acciones */}
      {esc.map((e) => (
        <Paso key={e.semana} n={e.nivel}>
          <rect x={e.x0} y={e.y0} width={e.x1 - e.x0} height={yBase - e.y0} fill={PISTA} />
          <rect x={e.x0} y={e.y0} width={e.x1 - e.x0} height={M.borde * u} fill={FIN_GRIS} />
          {e.lineas.filter((l) => !l.quien).map((l, i) => (
            <text key={i} x={e.xT} y={l.y} fontSize={fA} fontWeight={600} fill={INK} dominantBaseline="hanging">{l.t}</text>
          ))}
        </Paso>
      ))}

      {/* la primera lista: el último escalón, en el acento, con su rótulo al lado */}
      <rect x={xLista} y={techo(NIVELES)} width={w - xLista} height={yBase - techo(NIVELES)} fill={ACC} />
      <text x={xLista - M.rotulo * u} y={techo(NIVELES) + nivel / 2} fontSize={fP} fontWeight={700} fill={INK}
            textAnchor="end" dominantBaseline="central">{G.primera}</text>

      {/* la capa de responsables: lámina clara con borde sobre los escalones y el nombre debajo de cada acción */}
      <Paso n={PASO_CAPA} oculto>
        <rect x={lam.x} y={lam.y} width={lam.x1 - lam.x} height={yBase - lam.y} rx={M.radio * u}
              fill={SUP} fillOpacity={VELO} stroke={EJE} strokeWidth={TRAZO.guia * u} />
        {esc.flatMap((e) => e.lineas.filter((l) => l.quien).map((l, i) => (
          <text key={`${e.semana}-${i}`} x={e.xT} y={l.y} fontSize={fQ} fontWeight={700} fill={INK}
                dominantBaseline="hanging">{l.t}</text>
        )))}
      </Paso>

      {/* el eje, encima de la lámina: queda nítido en el último paso */}
      <EjeX u={u} x0={0} x1={w} y={yBase} min={1 - xL / col} max={1 + (w - xL) / col}
            marcas={Array.from({ length: SEM_LISTA }, (_, i) => i + 1)} titulo={G.eje} />
    </svg>
  )
}

export default function V10Previas() {
  return (
    <Vista id={ID}
           items={[{ clave: 'puntaje', valor: sobre(A.H40.valor, 1) }]}
           cifras={[fijo(T.legal_previas.n), fijo(SEM_LISTA)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
