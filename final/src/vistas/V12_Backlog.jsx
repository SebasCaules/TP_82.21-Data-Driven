// V12 · El backlog (gestión, Sebastian C.). Las épicas del backlog (tabla backlog de DF, leída por build_final.py de
// EPICAS e HISTORIAS de la Parte A del E4) y sus historias de usuario, una ficha por historia.
// (18/11, fase 8) Tablero por estado: una fila por épica con su título breve (textos_vistas/V12.js) y tres columnas
// (hechas, en el piloto, si el piloto pasa) con encabezado lleno; cada ficha va en la celda de su épica y su estado.
// (19/11, fase 9, spec V12) Lo que pidió el usuario: sin el subtítulo de cada fila (el nombre completo de la épica) ni el
// código de cada ficha (HU-n-nn), que daban pie a preguntas. Las fichas van lisas, del color de su estado; sale también el
// número de la épica, y el total de cada columna, que ya dice la conclusión. Queda la leyenda «1 ficha = 1 historia de
// usuario» en la esquina. Los encabezados nombran el color de cada estado (FLUJO de svg.jsx, el mismo código que V13):
// hechas en acento (el título habla de las hechas), en el piloto en gris y si el piloto pasa en contorno punteado.
// Pasos (spec 2, en el orden de las notas): 1, las épicas y las hechas; 2, las del piloto; 3, las que van si el piloto
// pasa. Lo que no se reveló se ve atenuado (Paso). Los totales se controlan contra K02, K04, K05 y K06.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { CONTORNO, INK, PISTA, Paso, TRAZO, FranjasFila, ancho, envolver, marcaFlujo, rectRedondo, tam, useU } from '../svg.jsx'

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
  return { ...e, breve, por: Object.fromEntries(GRUPOS.map((g) => [g, hus.filter((x) => x.grupo === g)])) }
})
const MAX_CELDA = Object.fromEntries(GRUPOS.map((g) => [g, Math.max(1, ...EPICAS.map((e) => e.por[g].length))]))

export const meta = { id: ID, pasos: 3 }

const entre = (v, a, b) => Math.min(b, Math.max(a, v))

/** Una ficha: un rectángulo liso con el estado de la historia (marcaFlujo). */
function Ficha({ u, x, y, w, h, estado }) {
  const m = marcaFlujo(estado, u)
  const a = m.trazo / 2
  return <rect x={x + a} y={y + a} width={w - 2 * a} height={h - 2 * a} rx={TRAZO.radio * u} {...m.attrs} />
}

function medir(w, h, u) {
  const n = EPICAS.length
  const hEnc = entre(0.085 * h, 44 * u, 56 * u)       // encabezado de las columnas
  const gEnc = 8 * u
  const R = entre((0.9 * h - hEnc - gEnc) / n, 44 * u, 84 * u)
  const fH = tam(24, u)
  const fL = tam(24, u)
  const pad = 16 * u                                    // sangría del título de la fila y de las fichas en su celda
  const gF = 12 * u
  const gCol = 12 * u
  const hF = entre(R - 18 * u, 26 * u, 42 * u)
  const minF = 1.2 * hF
  const maxF = 2.2 * hF
  // lo mínimo que pide cada columna: sus fichas más angostas y su encabezado
  const necesita = GRUPOS.map((g) => Math.max(MAX_CELDA[g] * minF + (MAX_CELDA[g] - 1) * gF, ancho(X.columnas[g], fH, 700)) + 2 * pad)
  const suma = necesita.reduce((s, y) => s + y, 0) + (GRUPOS.length - 1) * gCol
  // el título de la fila: lo que más pesa; baja hasta 26 u si no entra todo a lo ancho
  let fT = entre(0.54 * R, 26 * u, 34 * u)
  const anchoT = (f) => pad + Math.max(...EPICAS.map((e) => ancho(e.breve, f, 700))) + 32 * u
  while (anchoT(fT) + suma > w && fT > 26 * u) fT = Math.max(26 * u, fT - 0.5 * u)
  // la columna de las épicas se ensancha, si sobra lugar, para que la leyenda de la esquina entre en un renglón
  const conLeyenda = pad + maxF + 12 * u + ancho(X.ficha, fL, 400) + 24 * u
  const T = Math.max(anchoT(fT), Math.min(conLeyenda, w - suma))
  const libre = w - T - (GRUPOS.length - 1) * gCol
  const igual = libre / GRUPOS.length
  const anchos = necesita.every((x) => x <= igual)
    ? necesita.map(() => igual)
    : necesita.map((x) => x + (libre - necesita.reduce((s, y) => s + y, 0)) / GRUPOS.length)
  const xs = []
  anchos.reduce((x, a) => { xs.push(x); return x + a + gCol }, T)
  // la ficha: tan ancha como deja la celda más llena, entre 1,2 y 2,2 veces su alto
  const wF = entre(Math.min(...GRUPOS.map((g, k) => (anchos[k] - 2 * pad - (MAX_CELDA[g] - 1) * gF) / MAX_CELDA[g])),
    minF, maxF)
  // la leyenda, en la esquina de arriba a la izquierda: en un renglón si entra; si no, corta después del «=»
  const anchoL = T - pad - wF - 12 * u - 24 * u + 1
  const igualdad = X.ficha.indexOf(' = ')
  const lineasL = ancho(X.ficha, fL, 400) <= anchoL ? [X.ficha]
    : igualdad > 0 ? [X.ficha.slice(0, igualdad + 2), X.ficha.slice(igualdad + 3)]
      : envolver(X.ficha, anchoL, fL)
  const alto = hEnc + gEnc + n * R
  return { n, hEnc, gEnc, R, fT, fH, fL, pad, gF, gCol, hF, wF, T, anchos, xs, lineasL, alto }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const yCuerpo = m.hEnc + m.gEnc
  const yFila = (i) => yCuerpo + (i + 0.5) * m.R
  const yLey = m.hEnc / 2
  const hLey = Math.min(m.hF, m.hEnc - 8 * u)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {/* leyenda: qué es una ficha. La muestra va en contorno liso, que no es ningún estado (los estados los nombran
            los encabezados) y no se confunde con las fichas atenuadas de un paso */}
        <rect x={m.pad + u} y={yLey - hLey / 2 + u} width={m.wF - 2 * u} height={hLey - 2 * u} rx={TRAZO.radio * u}
              fill="none" stroke={CONTORNO} strokeWidth={TRAZO.contorno * u} />
        {m.lineasL.map((l, i) => (
          <text key={i} x={m.pad + m.wF + 12 * u} y={yLey + (i - (m.lineasL.length - 1) / 2) * m.fL * 1.2}
                fontSize={m.fL} fill={INK} dominantBaseline="central">{l}</text>
        ))}
        {/* filas: franja alterna para leer a qué épica va cada ficha, y la separación de las columnas */}
        <FranjasFila u={u} x0={m.T - m.gCol} x1={w} y0={yCuerpo} filas={m.n} alto={m.R} desdeX={0} guia={false} />
        {m.xs.slice(1).map((x, i) => (
          <line key={i} x1={x - m.gCol / 2} x2={x - m.gCol / 2} y1={yCuerpo} y2={yCuerpo + m.n * m.R} stroke={PISTA}
                strokeWidth={TRAZO.guia * u} />
        ))}
        {EPICAS.map((e, i) => (
          <text key={e.n} x={m.pad} y={yFila(i)} fontSize={m.fT} fontWeight={700} fill={INK}
                dominantBaseline="central">{e.breve}</text>
        ))}
        {/* una columna por paso: su encabezado lleno (el nombre del estado) y sus fichas */}
        {GRUPOS.map((g, k) => {
          const f = marcaFlujo(ESTADO_DE[g], u)
          const a = f.trazo / 2
          return (
            <Paso key={g} n={k + 1}>
              <path d={rectRedondo(m.xs[k] + a, a, m.anchos[k] - 2 * a, m.hEnc - 2 * a, 6 * u, 'todos')} {...f.attrs} />
              <text x={m.xs[k] + m.pad} y={m.hEnc / 2} fontSize={m.fH} fontWeight={700} fill={f.texto}
                    dominantBaseline="central">{X.columnas[g]}</text>
              {EPICAS.map((e, i) => e.por[g].map((hu, j) => (
                <Ficha key={hu.id} u={u} x={m.xs[k] + m.pad + j * (m.wF + m.gF)} y={yFila(i) - m.hF / 2} w={m.wF}
                       h={m.hF} estado={ESTADO_DE[g]} />
              )))}
            </Paso>
          )
        })}
      </g>
    </svg>
  )
}

export default function V12Backlog() {
  return (
    <Vista id={ID}
           items={[{ clave: 'historias', valor: fijo(A.K02.valor) }]}
           cifras={[fijo(A.K04.valor), fijo(A.K05.valor), fijo(A.K06.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
