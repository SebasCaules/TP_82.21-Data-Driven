// V10 · Qué va antes (legal, Tomas F.). Las acciones legales que se hacen antes de la primera lista, agrupadas por la
// semana del plan en que vence cada una (tabla legal_previas de DF, leída por build_final.py de la tabla «Precondiciones
// de la primera lista» de la Parte A del E4) y la semana de la primera lista (calendario).
// (19/11, fase 10, spec 4 V10) El usuario: «sigue sin conllevar el mensaje de procesos escalonados parece un grafico con
// un eje y que representa algo que no esta». Sale el eje y sale la forma de columnas. Queda un proceso:
//   - tres etapas encadenadas, una por semana en que vence algo (1, 2 y 4): cada una, una tarjeta con su semana escrita
//     en el encabezado («Semana 1») y sus acciones adentro, en nombre corto. Las tarjetas miden lo mismo (el ancho no es
//     tiempo y el alto no es cantidad) y las acciones van en filas, de una tarjeta a otra;
//   - al final, la primera lista con su semana, el único acento (encabezado en ACC, cuerpo en realce y trazo de 4 u, como
//     la tarjeta foco de V11, la vista siguiente del mismo orador);
//   - entre una tarjeta y la siguiente, una flecha a la altura de los encabezados: la anterior habilita la siguiente.
//     Leída de corrido, la fila de encabezados dice «Semana 1 → Semana 2 → Semana 4 → Semana 6».
// Pasos (spec 2 y reglas 2 y 3 de la fase 10), en el orden del guion: 1, la primera lista sola, en el centro (el orador
// dice adónde se llega y que el orden es por dependencia); 2, la primera lista se corre a su lugar, al final de la fila,
// y entra la semana 1; 3 y 4, una etapa por paso: se descubre la flecha que llega y entra la tarjeta (la última suma la
// flecha que llega a la primera lista); 5, la capa de responsables: una lámina clara con borde sobre las tres etapas,
// como la de V14 (la primera lista queda nítida), y el nombre debajo de cada acción, en el renglón que la tarjeta le
// guarda. Nada se boceta: son tarjetas, y no se ven hasta su paso.
// La banda lleva solo el puntaje legal (H40); la conclusión, las acciones previas (legal_previas.n) y la semana de la
// primera lista.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { NBSP, fijo } from '../../../e3/src/formato.js'
import { usePaso } from '../pasos.js'
import {
  ACC, EJE, INK, PISTA, REALCE, SUP, TRAZO, Anima, Paso, ancho, duro, envolver, inicial, rectRedondo, tam, useU,
} from '../svg.jsx'

const ID = 'V10'
const A = DF.anclas
const T = DF.tablas
const TX = textosDe(ID)
const G = TX.grafico
/** El responsable con su cola («de Casa Óga») pegada: si no entra en un renglón, corta antes del «de». */
const pegarCola = (t) => t.replace(/ (de|del) (.+)$/, (_, p, resto) => ` ${p}${NBSP}${resto.replaceAll(' ', NBSP)}`)
const ACCIONES = T.legal_previas.acciones.map((a) => {
  const t = { ...a, ...TX.acciones[a.codigo] }
  if (!t.corta || !t.quien) throw new Error(`V10: la acción ${a.codigo} no trae nombre corto o responsable`)
  return { ...t, quien: pegarCola(inicial(duro(t.quien))) }
})
const SEM_LISTA = T.calendario.primera_lista.semana
const sobre = (n, d = 0) => `${fijo(n, d)}[[/${fijo(T.escala_tecnica.hasta)}]]`
/** «Semana 1»: el encabezado de una tarjeta. */
const cabecera = (s) => `${G.semana} ${fijo(s)}`

// Una etapa por semana de vencimiento, en orden; cada una con sus acciones en el orden de la tabla. La primera lista
// entra en el paso 1; la etapa i, en el paso i + 2; la capa de responsables, en el paso siguiente a la última etapa.
const SEMANAS = [...new Set(ACCIONES.map((a) => a.semana))].sort((a, b) => a - b)
const ETAPAS = SEMANAS.map((s, i) => ({ semana: s, paso: i + 2, acciones: ACCIONES.filter((a) => a.semana === s) }))
const PASO_CAPA = ETAPAS.length + 2

if (ACCIONES.length !== T.legal_previas.n) throw new Error('V10: la conclusión y el gráfico no cuentan las mismas acciones')
if (SEMANAS[SEMANAS.length - 1] >= SEM_LISTA) throw new Error('V10: una acción previa vence después de la primera lista')
if (PASO_CAPA > 6) throw new Error('V10: más de cuatro semanas de vencimiento no entran en seis pasos')

export const meta = { id: ID, pasos: PASO_CAPA }

// Medidas en u.
const M = {
  cab: 30, lista: 32, accion: 28, accionMin: 24, quien: 24,
  cabAlto: 2.2,            // alto del encabezado, en letras de «Semana n»
  padX: 22, padY: 26,      // relleno del cuerpo de cada tarjeta
  entre: 20,               // aire a cada lado de la línea que separa dos acciones
  sobreQuien: 8,           // de la acción a su responsable
  hueco: 80,               // entre dos tarjetas: la flecha
  flechaAire: 12, flechaTrazo: 5, flechaPunta: 24, flechaAncho: 28,
  radio: 10, borde: 2, bordeLista: 4,
  lamina: 14,
  altoMax: 520,
}
/** Parte del alto del lienzo que ocupa el dibujo con la lámina (con un tope, para las ventanas altas). */
const LLENA = 0.76
/** Opacidad de la lámina de responsables: la misma de V14, las acciones se siguen leyendo debajo. */
const VELO = 0.45
const INTER_A = 1.18
const INTER_Q = 1.2

/** Los bloques de una etapa con la letra f, uno por acción: su nombre corto (hasta `max` renglones) y debajo el renglón
 *  del responsable, con la y de cada renglón desde el borde de arriba del bloque. entra: si todo cabe en el ancho. */
function bloques(e, f, fQ, wi, u, max) {
  let entra = true
  const bs = e.acciones.map((a) => {
    let y = 0
    const ls = envolver(a.corta, wi, f, 600)
    if (ls.length > max || ls.some((l) => ancho(l, f, 600) > wi)) entra = false
    const lineas = ls.map((t) => { const l = { t, y }; y += f * INTER_A; return l })
    y += M.sobreQuien * u
    const lq = envolver(a.quien, wi, fQ, 700)
    if (lq.length > 2 || lq.some((l) => ancho(l, fQ, 700) > wi)) entra = false
    const lineasQ = lq.map((t) => { const l = { t, y }; y += fQ * INTER_Q; return l })
    return { lineas, lineasQ, alto: y }
  })
  return { bs, entra }
}

/** Las medidas del dibujo: letras, anchos de las tarjetas, alto común y bloques de cada etapa. */
function medir(w, h, u) {
  const fC = tam(M.cab, u)
  const fL = tam(M.lista, u)
  const fQ = tam(M.quien, u)
  const padX = M.padX * u
  const padY = M.padY * u
  const hCab = fC * M.cabAlto
  const hueco = M.hueco * u
  const lam = M.lamina * u
  const E = ETAPAS.length
  // la primera lista, tan ancha como su nombre; las etapas se reparten el resto en partes iguales
  const wLista = Math.max(ancho(G.primera, fL, 700), ancho(cabecera(SEM_LISTA), fC, 700)) + 2 * padX
  const x0 = lam + 2 * u   // a cada lado, lugar para el borde de la lámina de responsables
  const wE = (w - 2 * x0 - wLista - E * hueco) / E
  const wi = wE - 2 * padX
  // la letra de las acciones: la más grande, de 28 u a 24 u, con la que cada acción entra en dos renglones (o en tres,
  // si en dos no hay manera)
  let fA = M.accionMin * u
  let r = null
  for (const max of [2, 3]) {
    for (let f = M.accion * u; f >= M.accionMin * u - 1e-6; f -= 0.25 * u) {
      const prueba = ETAPAS.map((e) => bloques(e, f, fQ, wi, u, max))
      if (prueba.every((x) => x.entra)) { fA = f; r = prueba; break }
    }
    if (r) break
  }
  if (!r) r = ETAPAS.map((e) => bloques(e, fA, fQ, wi, u, 3))
  // el cuerpo se parte en tantas partes iguales como acciones tenga la etapa más cargada; cada parte tiene que alojar el
  // bloque más alto, y entre dos partes va la línea con su aire
  const nMax = Math.max(...r.map(({ bs }) => bs.length))
  const cuerpo = nMax * Math.max(...r.flatMap(({ bs }) => bs.map((b) => b.alto))) + (nMax - 1) * 2 * M.entre * u
  const necesita = hCab + 2 * padY + cuerpo
  const hT = Math.max(necesita, Math.min(LLENA * h - 2 * lam, M.altoMax * u))
  return { fC, fL, fQ, fA, padX, padY, hCab, hueco, x0, wLista, wE, hT, r }
}

/** Una tarjeta: el cuerpo con su trazo y el encabezado lleno, con la semana en blanco. */
function Tarjeta({ u, x, y, w, h, hCab, fC, padX, texto, color, fondo, sw }) {
  const rx = M.radio * u
  return (
    <g>
      <rect x={x + sw / 2} y={y + sw / 2} width={w - sw} height={h - sw} rx={rx} fill={fondo} stroke={color}
            strokeWidth={sw} />
      <path d={rectRedondo(x, y, w, hCab, rx, 'arr')} fill={color} />
      <text x={x + padX} y={y + hCab / 2} fontSize={fC} fontWeight={700} fill={SUP}
            dominantBaseline="central">{texto}</text>
    </g>
  )
}

/** La flecha de una tarjeta a la siguiente, a la altura de los encabezados: un trazo y su punta, en tinta. */
function Flecha({ u, x1, x2, y }) {
  const p = M.flechaPunta * u
  const a = (M.flechaAncho * u) / 2
  return (
    <g>
      <line x1={x1} x2={x2 - p + 1} y1={y} y2={y} stroke={INK} strokeWidth={M.flechaTrazo * u} />
      <path d={`M${x2 - p} ${y - a} L${x2} ${y} L${x2 - p} ${y + a} Z`} fill={INK} />
    </g>
  )
}

function Dibujo({ w, h }) {
  const u = useU()
  const paso = usePaso()
  const m = medir(w, h, u)
  const E = ETAPAS.length
  const yTop = Math.max(0, (h - m.hT) / 2)
  const yFl = yTop + m.hCab / 2
  const yB0 = yTop + m.hCab + m.padY        // el cuerpo, sin su relleno
  const yB1 = yTop + m.hT - m.padY
  const xEt = (k) => m.x0 + k * (m.wE + m.hueco)
  const xLista = xEt(E)
  // en el paso 1 la primera lista está sola, en el centro; desde el paso 2, al final de la fila (la vista completa es la
  // del último paso)
  const xCentro = (w - m.wLista) / 2
  const xL = paso >= 2 ? xLista : xCentro
  const aire = M.flechaAire * u
  // la flecha que llega a la tarjeta k (k = E: la primera lista) desde la anterior
  const flecha = (k) => <Flecha u={u} x1={xEt(k - 1) + m.wE + aire} x2={xEt(k) - aire} y={yFl} />
  const lam = M.lamina * u
  const entre = M.entre * u

  // el cuerpo de cada tarjeta, en tantas partes iguales como acciones tenga la etapa más cargada: la acción j va en la
  // parte j de su tarjeta, y en todas arranca a la misma altura (se centra en la parte el bloque j más alto de la fila),
  // así las acciones quedan en filas de una tarjeta a otra. La línea que separa dos acciones, en el borde entre partes
  const nMax = Math.max(...m.r.map(({ bs }) => bs.length))
  const parte = (yB1 - yB0 - (nMax - 1) * 2 * entre) / nMax
  const altoFila = (j) => Math.max(...m.r.filter(({ bs }) => bs.length > j).map(({ bs }) => bs[j].alto))
  const etapas = ETAPAS.map((e, k) => {
    const { bs } = m.r[k]
    const ys = bs.map((_, j) => yB0 + j * (parte + 2 * entre) + (parte - altoFila(j)) / 2)
    const separa = bs.slice(1).map((_, j) => yB0 + (j + 1) * parte + (2 * j + 1) * entre)
    return { ...e, x: xEt(k), bs, ys, separa }
  })

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* la primera lista: adonde se llega, el único acento. Entra con el paso 1, sola en el centro; en el paso 2 se
          corre a su lugar */}
      <Paso n={1} oculto>
        <Anima n={2} efecto="corre" dx={xCentro - xLista} dur={520}>
          <Tarjeta u={u} x={xL} y={yTop} w={m.wLista} h={m.hT} hCab={m.hCab} fC={m.fC} padX={m.padX}
                   texto={cabecera(SEM_LISTA)} color={ACC} fondo={REALCE} sw={M.bordeLista * u} />
          <text x={xL + m.padX} y={(yB0 + yB1) / 2} fontSize={m.fL} fontWeight={700} fill={INK}
                dominantBaseline="central">{G.primera}</text>
        </Anima>
      </Paso>

      {/* las etapas, de a una: se descubre la flecha que llega y entra la tarjeta; la última suma la flecha que llega a
          la primera lista. La semana 1 entra mientras la primera lista se corre */}
      {etapas.map((e, k) => (
        <Paso key={e.semana} n={e.paso} oculto entrada={false}>
          {k > 0 && <Anima n={e.paso} efecto="revela-x" dur={320}>{flecha(k)}</Anima>}
          <Anima n={e.paso} efecto="aparece" dur={380} i={1} escalon={k > 0 ? 220 : 300}>
            <Tarjeta u={u} x={e.x} y={yTop} w={m.wE} h={m.hT} hCab={m.hCab} fC={m.fC} padX={m.padX}
                     texto={cabecera(e.semana)} color={INK} fondo={SUP} sw={M.borde * u} />
            {e.separa.map((ys) => (
              <line key={ys} x1={e.x + m.padX} x2={e.x + m.wE - m.padX} y1={ys} y2={ys}
                    stroke={PISTA} strokeWidth={TRAZO.guia * u} />
            ))}
            {e.bs.flatMap((b, j) => b.lineas.map((l, i) => (
              <text key={`${j}-${i}`} x={e.x + m.padX} y={e.ys[j] + l.y} fontSize={m.fA} fontWeight={600} fill={INK}
                    dominantBaseline="hanging">{l.t}</text>
            )))}
          </Anima>
          {k === E - 1 && <Anima n={e.paso} efecto="revela-x" dur={320} i={2} escalon={300}>{flecha(E)}</Anima>}
        </Paso>
      ))}

      {/* la capa de responsables: lámina clara con borde sobre las etapas y el nombre debajo de cada acción */}
      <Paso n={PASO_CAPA} oculto>
        <rect x={xEt(0) - lam} y={yTop - lam} width={xEt(E - 1) + m.wE - xEt(0) + 2 * lam}
              height={m.hT + 2 * lam} rx={(M.radio + 4) * u}
              fill={SUP} fillOpacity={VELO} stroke={EJE} strokeWidth={TRAZO.guia * u} />
        {etapas.flatMap((e) => e.bs.flatMap((b, j) => b.lineasQ.map((l, i) => (
          <text key={`${e.semana}-${j}-${i}`} x={e.x + m.padX} y={e.ys[j] + l.y} fontSize={m.fQ} fontWeight={700}
                fill={INK} dominantBaseline="hanging">{l.t}</text>
        ))))}
      </Paso>
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
