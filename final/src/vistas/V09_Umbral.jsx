// V09 · Cuándo pasa (economía, Juan Manuel R.). Escala con umbrales (spec f.5 y g V09): un umbral es una meta, no un
// resultado. Pista de 0 a Math.ceil(G67.con_descuento) puntos (no se escribe); lo observado (G62.tasa_observada) es la
// marca en --acc dentro de la pista; los umbrales de cada rama (G67) son líneas verticales en tinta, con el rótulo de la
// rama sin descuento arriba y el de la rama con descuento abajo, para no encimarse. Sin eje ni corchete: el hueco entre
// la marca y las líneas es el mensaje. Banda sola: las tres cifras están en la escala, cada una con su unidad («puntos»,
// el texto de DF; decisión CH-06). Sin conclusión.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { ACC, CTX, INK, PISTA, Umbral, ancho, rectRedondo, tam, useU } from '../svg.jsx'

const ID = 'V09'
const A = DF.anclas
const B = textosDe(ID).barras
const HOY = A['G62.tasa_observada'].valor
const T_HOY = A['G62.tasa_observada'].texto
const T_SIN = A['G67.sin_descuento'].texto
const T_CON = A['G67.con_descuento'].texto
const SIN = A['G67.sin_descuento'].valor
const CON = A['G67.con_descuento'].valor
const TOPE = Math.ceil(CON)

export const meta = { id: ID }

function Dibujo({ w, h }) {
  const u = useU()
  const fNom = tam(28, u)
  const fVal = tam(48, u)
  const altoPista = 72 * u
  const sobra = 20 * u
  const largo = 0.85 * w
  const xP = (w - largo) / 2
  const xs = (v) => xP + (v / TOPE) * largo
  // arriba: nombre, valor, 12 u, la línea que sobresale; abajo, lo mismo en espejo
  const dVal = fNom * 1.25 + 0.25 * fVal   // del nombre al valor: el renglón del nombre más el ascendente del valor
  const rotulo = dVal + fVal * 1.1
  const alto = 2 * (rotulo + 12 * u + sobra) + altoPista
  const y0 = Math.max(0, (h - alto) / 2)
  const yP = y0 + rotulo + 12 * u + sobra
  const yAbajo = yP + altoPista + sobra + 12 * u
  // un rótulo centrado en su línea, sin salir del lienzo
  const centro = (x, ...ts) => {
    const a = Math.max(...ts.map(([t, f, p]) => ancho(t, f, p))) / 2
    return Math.min(w - a, Math.max(a, x))
  }
  const xSin = centro(xs(SIN), [B.sin, fNom, 400], [T_SIN, fVal, 700])
  const xCon = centro(xs(CON), [B.con, fNom, 400], [T_CON, fVal, 700])
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <title>{`${B.hoy}: ${T_HOY} · ${B.sin}: ${T_SIN} · ${B.con}: ${T_CON}`}</title>
      <rect x={xP} y={yP} width={largo} height={altoPista} rx={4 * u} fill={PISTA} />
      <path d={rectRedondo(xP, yP, xs(HOY) - xP, altoPista, 4 * u, 'todos')} fill={ACC} />
      <Umbral u={u} x1={xs(SIN)} x2={xs(SIN)} y1={yP - sobra} y2={yP + altoPista + sobra} />
      <Umbral u={u} x1={xs(CON)} x2={xs(CON)} y1={yP - sobra} y2={yP + altoPista + sobra} />
      {/* rama sin descuento, arriba de su línea */}
      <text x={xSin} y={y0} fontSize={fNom} fill={CTX} textAnchor="middle" dominantBaseline="hanging">{B.sin}</text>
      <text x={xSin} y={y0 + dVal} fontSize={fVal} fontWeight={700} fill={INK} textAnchor="middle"
            dominantBaseline="hanging">{T_SIN}</text>
      {/* rama con descuento, abajo de la suya */}
      <text x={xCon} y={yAbajo} fontSize={fNom} fill={CTX} textAnchor="middle" dominantBaseline="hanging">{B.con}</text>
      <text x={xCon} y={yAbajo + dVal} fontSize={fVal} fontWeight={700} fill={INK} textAnchor="middle"
            dominantBaseline="hanging">{T_CON}</text>
      {/* lo observado, abajo de la pista, alineado a 0 */}
      <text x={xP} y={yAbajo} fontSize={fNom} fill={CTX} dominantBaseline="hanging">{B.hoy}</text>
      <text x={xP} y={yAbajo + dVal} fontSize={fVal} fontWeight={700} fill={INK}
            dominantBaseline="hanging">{T_HOY}</text>
    </svg>
  )
}

export default function V09Umbral() {
  return (
    <Vista id={ID}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
