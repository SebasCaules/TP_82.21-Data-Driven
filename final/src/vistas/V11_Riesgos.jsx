// V11 · Qué puede fallar (legal, riesgos y adopción, Tomas F.). Los tres riesgos críticos de la sección 26.3 del informe
// (DF cuenta cuántos son en riesgos_criticos.n), uno por tarjeta con su número, su nombre, la señal que se mira y lo que se
// hace (textos de textos_vistas/V11.js). Fase 9 (19/11): el usuario eligió las tarjetas («Me gusta pero devuelta decluttea»). Salen la
// leyenda, el tipo de cada riesgo y la pastilla «Adopción · se prueba»: repetían el título y la tarjeta de decisión (y el
// informe clasifica la planilla como riesgo técnico, no de adopción). Los rótulos de los campos pasan de mono en mayúsculas
// al rótulo secundario del tablero (sans 600 en CTX).
// La tarjeta de adopción, la que nombra el título, lleva el encabezado en ACC, el cuerpo en realce y un trazo de 4 u, y
// sobresale 24 u a cada lado: ACC e INK son dos azules oscuros y el color solo no marca el foco.
// Pasos (spec 2): un riesgo por paso, en el orden en que los dice el orador (económico, adopción, legal). (fase 10, regla
// 2) Las tarjetas no se bocetan: cada una está oculta hasta su paso (ocupa su lugar) y entra al llegar, de a una; la
// primera entra con el paso 1 al llegar a la vista con →.
// El espacio vertical (rellenos y aire entre tarjetas) crece con el lienzo entre un mínimo y un máximo para que el dibujo
// ocupe cerca del 90 % del alto; el cuerpo baja de 30 a 24 u si una señal o una respuesta no entra en un renglón (con
// los textos de hoy, todos entran en uno; si alguno crece, envolver lo corta y la tarjeta se estira).

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, PISTA, REALCE, Renglones, SUP, TRAZO, Paso, ancho, envolver, rectRedondo, tam, useU }
  from '../svg.jsx'

const ID = 'V11'
const A = DF.anclas
const X = textosDe(ID)
const C = X.columnas
const N = DF.tablas.riesgos_criticos.n
const FOCO = 1   // la tarjeta de adopción (quién corre la planilla): la que nombra el título
const LLENA = 0.9

export const meta = { id: ID, pasos: 3 }   // un riesgo por paso

if (X.filas.length !== N) throw new Error('V11: la conclusión y el dibujo no cuentan los mismos riesgos')
if (N !== meta.pasos) throw new Error('V11: un riesgo por paso; si cambia la cantidad de riesgos, cambian los pasos')

/** Reparte el alto libre: cada hueco va de su mínimo a su máximo (en px) con el mismo k ∈ [0, 1], el que deja el
 *  total en `meta` (o el más cercano). fijo: lo que no crece. huecos: [[min, max, veces], …]. */
function repartir(fijoPx, huecos, metaPx) {
  const tot = (k) => fijoPx + huecos.reduce((s, [a, b, n]) => s + n * (a + k * (b - a)), 0)
  const k = Math.max(0, Math.min(1, (metaPx - tot(0)) / Math.max(1e-9, tot(1) - tot(0))))
  return { k, val: huecos.map(([a, b]) => a + k * (b - a)), total: tot(k) }
}

function medir(w, h, u) {
  const fNom = tam('nombre', u)   // número y nombre del riesgo, blanco 700
  const fLab = tam(22, u)         // rótulo del campo, CTX 600
  const padX = 32 * u
  const salto = 24 * u            // la tarjeta de adopción sobresale esto a cada lado; los textos quedan alineados
  const gapCol = 72 * u
  const colW = (w - 2 * salto - 2 * padX - gapCol) / 2
  // letra del cuerpo: la más grande, de 30 a 24 u, con la que cada señal y cada respuesta entra en un renglón
  const textos = X.filas.flatMap((r) => [r.senal, r.respuesta])
  let fTxt = tam(30, u)
  while (fTxt > 24 * u && textos.some((t) => ancho(t, fTxt) > colW)) fTxt = Math.max(24 * u, fTxt - 0.25 * u)
  const inter = 1.22
  const filas = X.filas.map((r, i) => {
    const ls = [envolver(r.senal, colW, fTxt), envolver(r.respuesta, colW, fTxt)]
    return { ...r, i, foco: i === FOCO, ls, nl: Math.max(ls[0].length, ls[1].length) }
  })
  const texto = filas.reduce((s, r) => s + fNom + fLab + (r.nl - 1) * fTxt * inter + fTxt, 0)
  // huecos: relleno del encabezado (2 por tarjeta), relleno del cuerpo (2 por tarjeta), rótulo → texto (1 por tarjeta) y
  // aire entre tarjetas (n − 1)
  const n = filas.length
  const R = repartir(texto, [
    [10 * u, 28 * u, 2 * n], [16 * u, 36 * u, 2 * n], [8 * u, 14 * u, n], [20 * u, 48 * u, n - 1],
  ], LLENA * h)
  const [pH, pB, gL, gC] = R.val
  return { fNom, fLab, fTxt, inter, padX, salto, gapCol, colW, filas, pH, pB, gL, gC, alto: R.total }
}

function Dibujo({ w, h }) {
  const u = useU()
  const m = medir(w, h, u)
  const numW = Math.max(...m.filas.map((r) => ancho(fijo(r.i + 1), m.fNom, 700)))
  const xt = m.salto + m.padX                // los textos, alineados en las tres tarjetas
  const xs = [xt, xt + m.colW + m.gapCol]
  let y = Math.max(0, (h - m.alto) / 2)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {m.filas.map((r) => {
        const hHead = m.fNom + 2 * m.pH
        const hBody = 2 * m.pB + m.fLab + m.gL + (r.nl - 1) * m.fTxt * m.inter + m.fTxt
        const yc = y
        y += hHead + hBody + m.gC
        const color = r.foco ? ACC : INK
        const sw = (r.foco ? 4 : 2) * u
        const rx = 8 * u
        const yB = yc + hHead
        const yLab = yB + m.pB
        const yTxt = yLab + m.fLab + m.gL
        const x0 = r.foco ? 0 : m.salto           // borde izquierdo de la tarjeta
        const wc = w - 2 * x0
        return (
          <Paso key={r.riesgo} n={r.i + 1} oculto>
            <rect x={x0 + sw / 2} y={yc + sw / 2} width={wc - sw} height={hHead + hBody - sw} rx={rx}
                  fill={r.foco ? REALCE : SUP} stroke={color} strokeWidth={sw} />
            <path d={rectRedondo(x0, yc, wc, hHead, rx, 'arr')} fill={color} />
            <text x={xt} y={yc + hHead / 2} fontSize={m.fNom} fontWeight={700} fill={SUP}
                  dominantBaseline="central">{fijo(r.i + 1)}</text>
            <text x={xt + numW + 22 * u} y={yc + hHead / 2} fontSize={m.fNom} fontWeight={700} fill={SUP}
                  dominantBaseline="central">{r.riesgo}</text>
            <line x1={xs[1] - m.gapCol / 2} x2={xs[1] - m.gapCol / 2} y1={yLab} y2={yB + hBody - m.pB}
                  stroke={r.foco ? FIN_GRIS : PISTA} strokeWidth={TRAZO.guia * u} />
            {[C.senal, C.respuesta].map((t, j) => (
              <text key={t} x={xs[j]} y={yLab} fontSize={m.fLab} fontWeight={600} fill={CTX}
                    dominantBaseline="hanging">{t}</text>
            ))}
            <Renglones lineas={r.ls[0]} x={xs[0]} y={yTxt} f={m.fTxt} inter={m.inter} />
            <Renglones lineas={r.ls[1]} x={xs[1]} y={yTxt} f={m.fTxt} inter={m.inter} />
          </Paso>
        )
      })}
    </svg>
  )
}

export default function V11Riesgos() {
  return (
    <Vista id={ID} items={[{ clave: 'horas', valor: fijo(A['G64.horas_por_lista'].valor) }]} cifras={[fijo(N)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
