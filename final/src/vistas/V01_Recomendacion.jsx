// V01 · La recomendación (apertura, Tomas F.). Banda: piloto mínimo (G64) con la subfila del umbral de pase
// (G67.con_descuento) y la semana de la decisión (G63); la tarjeta verde dice «No viable como proyecto.».
// (18/11, fase 8, ficha V01: «las barras no están equiespaciadas») Tres barras equiespaciadas sobre un eje en dólares con
// marcas, grilla y título. Arriba el piloto mínimo (G64) en ACC, el foco. En el medio el proyecto entero el primer año
// (G39), que según su definición es el piloto más la producción completa: su primer tramo, del largo de G64, va en ACC
// (el mismo piloto) y el resto en gris, con «solo si el piloto pasa» adentro (sin cifra: la resta no se escribe). Abajo
// lo que deja la lista por año (G54), un beneficio: contorno, no relleno. La leyenda dice qué es cada color y cada forma.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import {
  ACC, CONTORNO, CTX, FIN_GRIS, INK, SUP, TRAZO, EjeX, Leyenda, LineaBase, BarraH, altoEjeX, ancho, anchoLeyenda,
  escalaLinda, rectRedondo, tam, useU,
} from '../svg.jsx'

const ID = 'V01'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras
const L = T.leyenda

export const meta = { id: ID }

const PILOTO = A.G64.valor
const PROYECTO = A.G39.valor
const DEJA = A.G54.valor

/** Trazo del contorno del beneficio, en u: más grueso que el de svg.jsx porque la barra mide pocos u de largo. */
const TRAZO_BENEFICIO = 3

/** El rectángulo de contorno del beneficio (barra y muestra de la leyenda). */
function Contorno({ u, x, y, w, h }) {
  const sw = TRAZO_BENEFICIO * u
  return <rect x={x + sw / 2} y={y + sw / 2} width={Math.max(0, w - sw)} height={Math.max(0, h - sw)}
               rx={TRAZO.radio * u} fill={SUP} stroke={CONTORNO} strokeWidth={sw} />
}

function Dibujo({ w, h }) {
  const u = useU()
  const fRot = tam(28, u)
  const fVal = tam('val', u)
  const fFoco = tam('valFoco', u)
  const fDentro = tam(24, u)
  const fLey = 24

  const filas = [
    { clave: 'piloto', etiqueta: B.piloto, valor: PILOTO, texto: usd(PILOTO), foco: true },
    { clave: 'proyecto', etiqueta: B.cuesta, valor: PROYECTO, texto: usd(PROYECTO) },
    { clave: 'deja', etiqueta: B.deja, valor: DEJA, texto: usd(DEJA), contorno: true },
  ]
  const { tope, marcas } = escalaLinda(PROYECTO)

  // columnas: rótulos a la izquierda, barras y eje desde x0; el largo se ajusta para que cada valor entre a la derecha
  const anchoVal = (f) => ancho(f.texto, f.foco ? fFoco : fVal, f.foco ? 700 : 600)
  const x0 = Math.ceil(Math.max(...filas.map((f) => ancho(f.etiqueta, fRot, 700)))) + 24 * u
  const margen = 8 * u
  const minBarra = 6 * u
  let largo = w - x0 - ancho(fijo(tope), tam(23, u), 400) / 2 - margen
  for (const f of filas) largo = Math.min(largo, (w - x0 - 12 * u - anchoVal(f) - margen) / (f.valor / tope))
  largo = Math.max(0, largo)
  const esc = (v) => (Math.max(0, v) / tope) * largo

  // alto: leyenda arriba, filas equiespaciadas y el eje; el bloque ocupa el 92 % del lienzo, centrado
  const bloque = 0.92 * h
  const y0 = (h - bloque) / 2
  const altoLey = tam(fLey, u) * 1.2
  const yLey = y0 + altoLey / 2
  const yFilas = y0 + altoLey + 36 * u
  const yEje = y0 + bloque - altoEjeX(u, true)
  const paso = Math.max(0, yEje - yFilas) / filas.length
  const t = Math.min(104 * u, 0.62 * paso)

  const ley = [
    { marca: 'hecho', texto: L.piloto },
    { marca: 'contexto', texto: L.produccion },
    { marca: ({ u: uu, x, y, s }) => <Contorno u={uu} x={x - s / 2} y={y - s / 2} w={s} h={s} />, texto: L.deja },
  ]
  const anchoLey = anchoLeyenda(u, ley, fLey)
  const xLey = x0 + anchoLey <= w ? x0 : Math.max(0, w - anchoLey)

  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }
  const sep = TRAZO.separacion * u
  const xPiloto = x0 + esc(PILOTO)

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Leyenda u={u} x={xLey} y={yLey} items={ley} f={fLey} />
      <EjeX u={u} x0={x0} x1={x0 + largo} y={yEje} min={0} max={tope} marcas={marcas} formato={(v) => fijo(v)}
            titulo={B.eje} grilla yGrilla={yFilas} />
      {filas.map((f, i) => {
        const yc = yFilas + (i + 0.5) * paso
        const yb = yc - t / 2
        const largoB = f.contorno ? Math.max(esc(f.valor), minBarra) : esc(f.valor)
        const fv = f.foco ? fFoco : fVal
        return (
          <g key={f.clave}>
            <title>{`${f.etiqueta} · ${f.texto}`}</title>
            <text x={x0 - 24 * u} y={yc} fontSize={fRot} fontWeight={f.foco ? 700 : 400} fill={f.foco ? INK : CTX}
                  textAnchor="end" dominantBaseline="central">{f.etiqueta}</text>
            {f.clave === 'proyecto' && (
              <g>
                <rect x={x0} y={yb} width={esc(PILOTO)} height={t} fill={ACC} />
                <path d={rectRedondo(xPiloto + sep, yb, largoB - esc(PILOTO) - sep, t, TRAZO.radio * u)} fill={FIN_GRIS} />
                <text x={xPiloto + sep + 18 * u} y={yc} fontSize={fDentro} fontWeight={600} fill={INK}
                      dominantBaseline="central">{T.si_pasa}</text>
              </g>
            )}
            {f.clave === 'piloto' && <BarraH u={u} x={x0} y={yb} largo={largoB} t={t} foco />}
            {f.contorno && <Contorno u={u} x={x0} y={yb} w={largoB} h={t} />}
            <text x={x0 + largoB + 12 * u} y={yc} fontSize={fv} fontWeight={f.foco ? 700 : 600} fill={INK}
                  dominantBaseline="central" {...halo}>{f.texto}</text>
          </g>
        )
      })}
      <LineaBase u={u} x={x0} y1={yFilas} y2={yEje} />
    </svg>
  )
}

export default function V01Recomendacion() {
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'umbral', valor: fijo(A['G67.con_descuento'].valor) },
             { clave: 'semana', valor: fijo(A['G63.semana_decision'].valor) },
           ]}
           cifras={[]}>
      {(caja) => <Dibujo {...caja} />}
    </Vista>
  )
}
