// V12 · El backlog (gestión, Sebastian C.). Las épicas del backlog (tabla backlog de DF, leída por build_final.py de
// EPICAS e HISTORIAS de la Parte A del E4) y sus historias de usuario, una ficha por historia.
// (18/11, fase 8) Tablero por estado: una fila por épica con su título breve (textos_vistas/V12.js) y tres columnas
// (hechas, en el piloto, si el piloto pasa) con encabezado lleno; cada ficha va en la celda de su épica y su estado.
// (19/11, fase 9) Sin el subtítulo de cada fila ni el código de cada ficha: las fichas van lisas, del color de su estado
// (FLUJO de svg.jsx: hechas en acento, en el piloto en gris, si el piloto pasa en contorno punteado). Queda la leyenda
// «1 ficha = 1 historia de usuario» en la esquina.
// (19/11, fase 10, spec V12) «ponele una hoja de calcar como en la 10 en donde identifiques las US»: el último paso es una
// capa como papel de calcar (un velo claro sobre las tres columnas, como en V10 y V14) que repasa el contorno de cada
// ficha y escribe adentro su código y su dueño (DF.tablas.backlog.historias[].id y .dueno, el rótulo de la tabla 2.2 del
// E4). Tres historias de «después» traen un dueño largo («IT interno; decide María G.»): en la ficha va el dueño y, al
// lado, en gris, quién decide, en dos renglones como la ficha. Sin la capa, las fichas siguen lisas. Las fichas son del
// tamaño que pide la capa (el rótulo más largo a 20 u o más), así la capa no mueve nada.
// Pasos (en el orden de las notas): 1, las épicas y las hechas; 2, las del piloto; 3, las que van si el piloto pasa (las
// columnas que faltan son boceto: solo las fichas, tenues, sin encabezado); 4, la capa. Las fichas de una columna se
// encienden de arriba abajo y en la capa cada contorno se repasa uno detrás de otro (Paso con orden, Anima). Los totales
// se controlan contra K02, K04, K05 y K06.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import {
  Anima, CONTORNO, CTX, EJE, INK, PISTA, Paso, SUP, TRAZO, FranjasFila, ancho, envolver, marcaFlujo, punteado,
  rectRedondo, tam, useU,
} from '../svg.jsx'
import { escalonado } from '../pasos.js'

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

/** El paso de la capa de calcar (el último). */
const CAPA = 4
export const meta = { id: ID, pasos: CAPA }

// grupo de la tabla → estado de FLUJO (svg.jsx): hecha → lleno en ACC, piloto → gris, después → punteado
const ESTADO_DE = { hecha: 'hecha', piloto: 'piloto', despues: 'condicional' }

/** Un espacio duro antes de cada inicial («María G.»): el renglón no deja la inicial sola. (duro() de svg.jsx pone un
 *  espacio común, así que acá se escribe el duro.) */
const sinCorte = (t) => String(t).replace(/ (\p{Lu}\.)/gu, '\u00a0$1')

/** El dueño tal como lo entrega la tabla 2.2 del E4: «Matías S.» o, en las de después, «Matías S.; decide María G.».
 *  En la ficha va el dueño; lo que sigue al «;», al lado. */
function dueno(d) {
  const p = String(d ?? '').split('; ')
  if (!p[0] || p.length > 2) throw new Error(`V12: un dueño que la capa no sabe escribir: «${d}»`)
  return { quien: sinCorte(p[0]), decide: p[1] ? sinCorte(p[1]) : null }
}

const EPICAS = BL.epicas.map((e) => {
  const breve = X.breves?.[e.n]
  if (!breve) throw new Error(`V12: falta el título breve de la épica ${e.n} en textos_vistas/V12.js`)
  const hus = BL.historias.filter((x) => x.epica === e.n).map((x) => ({ ...x, ...dueno(x.dueno) }))
  const por = Object.fromEntries(GRUPOS.map((g) => [g, hus.filter((x) => x.grupo === g)]))
  for (const g of GRUPOS) {
    if (por[g].length > 1 && por[g].some((x) => x.decide)) {
      throw new Error(`V12: la épica ${e.n} tiene un «decide» en una celda de varias fichas; la capa lo escribe al lado`)
    }
  }
  return { ...e, breve, por }
})
const HUS = EPICAS.flatMap((e) => GRUPOS.flatMap((g) => e.por[g]))

const entre = (v, a, b) => Math.min(b, Math.max(a, v))

/** «decide María G.» en el ancho mínimo (cada palabra en su renglón, juntas si entran): en dos renglones, como la ficha. */
const renglonesDecide = (t, f) => envolver(t, Math.max(...t.split(' ').map((p) => ancho(p, f, 400))) + 1, f)

/** Preferencias de letra, en u: [título de la fila, rótulo de la capa]. La primera que entra a lo ancho. */
const LETRAS = [[28, 22], [27, 22], [26, 22], [28, 21], [27, 21], [26, 21], [28, 20], [27, 20], [26, 20], [25, 20],
  [24, 20]]

function medir(w, h, u) {
  const n = EPICAS.length
  const hEnc = entre(0.075 * h, 42 * u, 56 * u)        // encabezado de las columnas
  const gEnc = 8 * u
  const sobra = 6 * u                                    // lo que la hoja de calcar sobresale arriba y abajo del cuerpo
  const R = entre((0.94 * h - hEnc - gEnc - sobra) / n, 50 * u, 84 * u)
  const hF = Math.min(R - 6 * u, 62 * u)                 // alto de la ficha
  const fH = tam(24, u)
  const pad0 = 16 * u                                    // sangría de los títulos de las filas y de la leyenda
  const pad = 12 * u                                     // sangría del encabezado y de las fichas en su columna
  const gF = 8 * u                                       // entre las fichas de una celda
  const gCol = 12 * u
  const padF = 10 * u                                    // sangría del rótulo dentro de la ficha
  const gDec = 14 * u                                    // de la ficha a quién decide

  // la leyenda, en la esquina: muestra (una ficha chica) y el texto, en un renglón o cortado después del «=»
  const sH = 22 * u
  const sW = 46 * u
  const igualdad = X.ficha.indexOf(' = ')
  const dosL = igualdad > 0 ? [X.ficha.slice(0, igualdad + 2), X.ficha.slice(igualdad + 3)] : [X.ficha]
  const anchoLey = (lineas, f) => sW + 8 * u + Math.max(...lineas.map((l) => ancho(l, f, 400)))
  const leyMin = anchoLey(dosL, tam(20, u))

  const intento = ([t, l]) => {
    const fT = t * u
    const fL = tam(l, u)
    const wF = Math.max(...HUS.map((x) => Math.max(ancho(x.id, fL, 700), ancho(x.quien, fL, 400)))) + 2 * padF
    const dec = (x) => (x.decide ? renglonesDecide(x.decide, fL) : null)
    const pide = GRUPOS.map((g) => Math.max(ancho(X.columnas[g], fH, 700), ...EPICAS.map((e) => {
      const c = e.por[g]
      if (!c.length) return 0
      const d = c.map(dec).find(Boolean)
      return c.length * wF + (c.length - 1) * gF + (d ? gDec + Math.max(...d.map((r) => ancho(r, fL, 400))) : 0)
    })) + 2 * pad)
    const T = Math.max(pad0 + Math.max(...EPICAS.map((e) => ancho(e.breve, fT, 700))) + 24 * u, pad0 + leyMin + 12 * u)
    const total = T + pide.reduce((s, x) => s + x, 0) + (GRUPOS.length - 1) * gCol
    return { fT, fL, wF, pide, T, total, dec }
  }
  // el rótulo de la capa (dos renglones) deja aire arriba y abajo en la ficha: hasta hF / 2,6
  const caben = LETRAS.filter(([, l]) => l === 20 || l * u <= hF / 2.6)
  const elegido = caben.map(intento).find((x) => x.total <= w) ?? intento(LETRAS.at(-1))
  const { fT, fL, wF, pide, T, dec } = elegido

  // lo que sobra a lo ancho se reparte entre las tres columnas
  const extra = Math.max(0, w - elegido.total) / GRUPOS.length
  const anchos = pide.map((x) => x + extra)
  const xs = []
  anchos.reduce((x, a) => { xs.push(x); return x + a + gCol }, T)

  // la leyenda: en un renglón si entra a la izquierda de las columnas; si no, en dos
  const libreL = T - pad0 - 12 * u
  const fLey = [24, 22, 20].map((f) => tam(f, u))
  const uno = fLey.find((f) => anchoLey([X.ficha], f) <= libreL)
  const dos = fLey.find((f) => anchoLey(dosL, f) <= libreL && 2 * f * 1.15 <= hEnc) ?? tam(20, u)
  const ley = uno ? { lineas: [X.ficha], f: uno } : { lineas: dosL, f: dos }

  const alto = hEnc + gEnc + n * R + sobra
  return { n, hEnc, gEnc, sobra, R, hF, fT, fH, fL, pad0, pad, gF, gCol, padF, gDec, wF, T, anchos, xs, ley, sW, sH,
    alto, dec }
}

/** Una ficha: un rectángulo liso con el estado de la historia (marcaFlujo). */
function Ficha({ u, x, y, w, h, estado }) {
  const m = marcaFlujo(estado, u)
  const a = m.trazo / 2
  return <rect x={x + a} y={y + a} width={w - 2 * a} height={h - 2 * a} rx={TRAZO.radio * u} {...m.attrs} />
}

/** Opacidad del velo de la capa: las fichas se leen debajo (su color dice su estado) y el rótulo queda encima. */
const VELO = 0.62

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const yCuerpo = m.hEnc + m.gEnc
  const yFila = (i) => yCuerpo + (i + 0.5) * m.R
  const yLey = m.hEnc / 2
  const lh = m.ley.f * 1.15

  // cada ficha con su lugar: columna por columna, de arriba abajo (el orden en que se encienden y se repasan)
  const fichas = GRUPOS.flatMap((g, k) => EPICAS.flatMap((e, i) => e.por[g].map((hu, j) => ({
    hu, g, k, x: m.xs[k] + m.pad + j * (m.wF + m.gF), y: yFila(i) - m.hF / 2, yc: yFila(i),
  }))))
  const deGrupo = (g) => fichas.filter((f) => f.g === g)
  const r = TRAZO.radio * u
  const tr = TRAZO.base * u
  const lr = m.fL * 1.08                                    // de renglón a renglón en el rótulo de la capa

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        {/* leyenda: qué es una ficha. La muestra va en contorno liso, que no es ningún estado (los estados los nombran
            los encabezados) */}
        <rect x={m.pad0 + u} y={yLey - m.sH / 2} width={m.sW - 2 * u} height={m.sH} rx={TRAZO.radio * u}
              fill="none" stroke={CONTORNO} strokeWidth={TRAZO.contorno * u} />
        {m.ley.lineas.map((l, i) => (
          <text key={i} x={m.pad0 + m.sW + 8 * u} y={yLey + (i - (m.ley.lineas.length - 1) / 2) * lh}
                fontSize={m.ley.f} fill={INK} dominantBaseline="central">{l}</text>
        ))}
        {/* filas: franja alterna para leer a qué épica va cada ficha, y la separación de las columnas */}
        <FranjasFila u={u} x0={m.T - m.gCol} x1={w} y0={yCuerpo} filas={m.n} alto={m.R} desdeX={0} guia={false} />
        {m.xs.slice(1).map((x, i) => (
          <line key={i} x1={x - m.gCol / 2} x2={x - m.gCol / 2} y1={yCuerpo} y2={yCuerpo + m.n * m.R} stroke={PISTA}
                strokeWidth={TRAZO.guia * u} />
        ))}
        {EPICAS.map((e, i) => (
          <text key={e.n} x={m.pad0} y={yFila(i)} fontSize={m.fT} fontWeight={700} fill={INK}
                dominantBaseline="central">{e.breve}</text>
        ))}

        {/* una columna por paso: su encabezado (el nombre del estado; en boceto no se ve) y sus fichas, que se encienden
            de arriba abajo */}
        {GRUPOS.map((g, k) => {
          const f = marcaFlujo(ESTADO_DE[g], u)
          const a = f.trazo / 2
          const suyas = deGrupo(g)
          return (
            <g key={g} style={escalonado(suyas.length + 1, { total: 900, dur: 350 })}>
              <Paso n={k + 1}>
                <path data-txt="" d={rectRedondo(m.xs[k] + a, a, m.anchos[k] - 2 * a, m.hEnc - 2 * a, 6 * u, 'todos')}
                      {...f.attrs} />
                <text x={m.xs[k] + m.pad} y={m.hEnc / 2} fontSize={m.fH} fontWeight={700} fill={f.texto}
                      dominantBaseline="central">{X.columnas[g]}</text>
              </Paso>
              {suyas.map((x, j) => (
                <Paso key={x.hu.id} n={k + 1} orden={j + 1}>
                  <Ficha u={u} x={x.x} y={x.y} w={m.wF} h={m.hF} estado={ESTADO_DE[g]} />
                </Paso>
              ))}
            </g>
          )
        })}

        {/* capa de calcar (último paso): un velo claro sobre las tres columnas, con borde, como en V10 y V14 (las épicas y
            los encabezados quedan nítidos). Sobre cada ficha, su contorno repasado y su código y su dueño; quién decide,
            al lado. El contorno de las de después sigue punteado: lo condicional se ve condicional */}
        <Paso n={CAPA} oculto entrada={false}>
          <Anima n={CAPA} efecto="funde" dur={300}>
            <rect x={m.xs[0] - m.gCol / 2} y={yCuerpo - m.sobra} width={w - (m.xs[0] - m.gCol / 2) - TRAZO.guia * u}
                  height={m.n * m.R + 2 * m.sobra} rx={8 * u} fill={SUP} fillOpacity={VELO} stroke={EJE}
                  strokeWidth={TRAZO.guia * u} />
          </Anima>
          <g style={{ ...escalonado(fichas.length, { total: 850, dur: 300 }), '--fin-anima-base': '250ms' }}>
            {fichas.map((x, q) => {
              const cond = ESTADO_DE[x.g] === 'condicional'
              const d = rectRedondo(x.x + tr / 2, x.y + tr / 2, m.wF - tr, m.hF - tr, r, 'todos')
              const dec = m.dec(x.hu)
              return (
                <g key={x.hu.id}>
                  {cond
                    ? (
                      <Anima n={CAPA} efecto="funde" i={q}>
                        <path d={d} fill="none" stroke={EJE} strokeWidth={tr}
                              strokeDasharray={punteado(u)} />
                      </Anima>
                    )
                    : (
                      <Anima n={CAPA} efecto="traza" i={q}>
                        <path d={d} pathLength={1} fill="none" stroke={EJE} strokeWidth={tr} />
                      </Anima>
                    )}
                  <Anima n={CAPA} efecto="funde" i={q}>
                    <text x={x.x + m.padF} y={x.yc - lr / 2} fontSize={m.fL} fontWeight={700} fill={INK}
                          dominantBaseline="central">{x.hu.id}</text>
                    <text x={x.x + m.padF} y={x.yc + lr / 2} fontSize={m.fL} fill={INK}
                          dominantBaseline="central">{x.hu.quien}</text>
                    {dec && dec.map((l, i) => (
                      <text key={i} x={x.x + m.wF + m.gDec} y={x.yc + (i - (dec.length - 1) / 2) * lr} fontSize={m.fL}
                            fill={CTX} dominantBaseline="central">{l}</text>
                    ))}
                  </Anima>
                </g>
              )
            })}
          </g>
        </Paso>
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
