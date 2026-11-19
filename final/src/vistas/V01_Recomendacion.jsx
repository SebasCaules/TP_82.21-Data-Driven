// V01 · La recomendación (apertura, Tomas F.). Banda: la cifra central, el piloto mínimo (G64); la tarjeta verde dice
// «No viable como proyecto.».
// (19/11, fase 9, ficha V01: «No le dejaría la parte de solo si el piloto pasa, más sencillo») Tres barras simples sobre un
// eje en dólares (línea, marcas y título): el piloto mínimo (G64) en ACC, el foco; el proyecto entero el primer año (G39)
// en gris, entera; lo que deja la lista por año (G54), un beneficio, en contorno. Cada barra lleva su rótulo y su valor:
// sin leyenda. Las tres a escala real: la del beneficio es un trazo fino con su número.
// Pasos (las notas: «USD 4.485 en un piloto…», después «la lista deja USD 265 por año y cuesta USD 20.260 el primero»):
//   1. los dos costos, con el eje; 2. lo que deja la lista.
// (19/11, fase 10, regla 1) En el paso 1 la tercera barra es boceto: solo su forma (el contorno a escala, tenue), sin
// rótulo ni cifra; los dos aparecen en el paso 2. El eje queda fuera de todo Paso. El globo (<title>) de cada barra existe
// recién cuando su paso llega: si no, el puntero mostraría la cifra del boceto.

import Vista from '../Plantilla.jsx'
import { usePaso } from '../pasos.js'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import {
  CONTORNO, CTX, INK, SUP, TRAZO, BarraH, EjeX, LineaBase, Paso, altoEjeX, ancho, escalaLinda, tam, useU,
} from '../svg.jsx'

const ID = 'V01'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras

export const meta = { id: ID, pasos: 2 }

const PILOTO = A.G64.valor
const PROYECTO = A.G39.valor
const DEJA = A.G54.valor

/** Trazo del contorno del beneficio, en u: más grueso que el de svg.jsx porque la barra mide pocos u de largo. El trazo
 *  va por dentro: el largo de la barra es el del dato. */
const TRAZO_BENEFICIO = 3

/** El rectángulo de contorno del beneficio, a escala real. */
function Contorno({ u, x, y, w, h }) {
  const sw = TRAZO_BENEFICIO * u
  return <rect x={x + sw / 2} y={y + sw / 2} width={Math.max(0, w - sw)} height={Math.max(0, h - sw)}
               rx={Math.min(TRAZO.radio * u, w / 2)} fill={SUP} stroke={CONTORNO} strokeWidth={sw} />
}

function Dibujo({ w, h }) {
  const u = useU()
  const paso = usePaso()
  const fRot = tam(28, u)
  const fVal = tam('val', u)
  const fFoco = tam('valFoco', u)

  const filas = [
    { clave: 'piloto', etiqueta: B.piloto, valor: PILOTO, texto: usd(PILOTO), foco: true, paso: 1 },
    { clave: 'proyecto', etiqueta: B.cuesta, valor: PROYECTO, texto: usd(PROYECTO), paso: 1 },
    { clave: 'deja', etiqueta: B.deja, valor: DEJA, texto: usd(DEJA), contorno: true, paso: 2 },
  ]
  const { tope, marcas } = escalaLinda(PROYECTO)

  // columnas: rótulos a la izquierda, barras y eje desde x0; el largo se ajusta para que cada valor entre a la derecha
  const anchoVal = (f) => ancho(f.texto, f.foco ? fFoco : fVal, f.foco ? 700 : 600)
  const x0 = Math.ceil(Math.max(...filas.map((f) => ancho(f.etiqueta, fRot, 700)))) + 28 * u
  const margen = 8 * u
  let largo = w - x0 - ancho(fijo(tope), tam(23, u), 400) / 2 - margen
  for (const f of filas) largo = Math.min(largo, (w - x0 - 14 * u - anchoVal(f) - margen) / (f.valor / tope))
  largo = Math.max(0, largo)
  const esc = (v) => (Math.max(0, v) / tope) * largo

  // alto: filas equiespaciadas y el eje; el bloque ocupa el 86 % del lienzo, centrado
  const bloque = 0.86 * h
  const y0 = (h - bloque) / 2
  const yEje = y0 + bloque - altoEjeX(u, true)
  const alto = Math.max(0, yEje - y0) / filas.length
  const t = Math.min(96 * u, 0.6 * alto)

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeX u={u} x0={x0} x1={x0 + largo} y={yEje} min={0} max={tope} marcas={marcas} formato={(v) => fijo(v)}
            titulo={B.eje} />
      {filas.map((f, i) => {
        const yc = y0 + (i + 0.5) * alto
        const yb = yc - t / 2
        const largoB = esc(f.valor)
        return (
          <Paso key={f.clave} n={f.paso}>
            {paso >= f.paso && <title>{`${f.etiqueta} · ${f.texto}`}</title>}
            <text x={x0 - 28 * u} y={yc} fontSize={fRot} fontWeight={f.foco ? 700 : 400} fill={f.foco ? INK : CTX}
                  textAnchor="end" dominantBaseline="central">{f.etiqueta}</text>
            {f.contorno
              ? <Contorno u={u} x={x0} y={yb} w={largoB} h={t} />
              : <BarraH u={u} x={x0} y={yb} largo={largoB} t={t} foco={f.foco} />}
            <text x={x0 + largoB + 14 * u} y={yc} fontSize={f.foco ? fFoco : fVal} fontWeight={f.foco ? 700 : 600}
                  fill={INK} dominantBaseline="central">{f.texto}</text>
          </Paso>
        )
      })}
      <LineaBase u={u} x={x0} y1={y0} y2={yEje} />
    </svg>
  )
}

export default function V01Recomendacion() {
  return (
    <Vista id={ID} items={[{ clave: 'piloto', valor: usd(A.G64.valor) }]} cifras={[]}>
      {(caja) => <Dibujo {...caja} />}
    </Vista>
  )
}
