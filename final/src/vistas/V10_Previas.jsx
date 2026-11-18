// V10 · Qué va antes (legal, Tomas F.). Línea de tiempo con puntos (spec f.6 y g V10): las acciones legales que se hacen
// antes de la primera lista, una por fila, con su semana del plan (tabla legal_previas de DF, leída por build_final.py de
// la tabla «Precondiciones de la primera lista» de la Parte A del E4). Cada acción es un punto en su semana, sin trazo
// desde la semana 0; la semana de la primera lista (calendario) es el único acento: vertical punteada de 3 u en --acc con
// «primera lista» arriba, en tinta. El gráfico cuenta las mismas filas que legal_previas.n (el pendiente 198). En la
// banda, solo protección de datos en 1 (tabla legal, el pendiente 182); el puntaje legal 1,8 queda en el title de la
// decisión y la cantidad de acciones son las cinco filas. Sin conclusión.
// (18/11, intermedio) Vuelven de 8e633e8 la tarjeta central (puntaje legal, H40) y la conclusión con la semana de la
// primera lista; las filas llenan el 86 % del alto del lienzo.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CONTORNO, CTX, INK, Renglones, Umbral, ancho, duro, envolver, tam, useU } from '../svg.jsx'

const ID = 'V10'
const A = DF.anclas
const T = DF.tablas
const X = textosDe(ID)
const ACCIONES = T.legal_previas.acciones.map((a) => ({ ...a, ...X.acciones[a.codigo] }))
const SEM_LISTA = T.calendario.primera_lista.semana
const proteccion = T.legal.find((x) => x.id === 'proteccion_datos').puntaje
const sobre = (n, d = 0) => `${fijo(n, d)}[[/${fijo(T.escala_tecnica.hasta)}]]`

if (ACCIONES.length !== T.legal_previas.n) throw new Error('V10: la tarjeta y el gráfico no cuentan las mismas acciones')

export const meta = { id: ID }

const LLENA = 0.86

function Dibujo({ w, h }) {
  const u = useU()
  const fFila = tam('fila', u)
  const fSec = tam('sec', u)
  const fPrim = tam(24, u)
  const col = Math.min(0.5 * w, Math.max(...ACCIONES.map((a) => ancho(a.que, fFila, 400))) + 12 * u)
  const x0 = col + 48 * u
  // la columna de la primera lista deja lugar para que su rótulo, centrado en la línea, entre en el lienzo
  const anchoPrim = ancho(X.primera, fPrim, 700)
  const dw0 = (w - x0) / SEM_LISTA
  const dw = anchoPrim / 2 <= dw0 / 2 ? dw0 : (w - x0 - anchoPrim / 2) / (SEM_LISTA - 0.5)
  const xs = (s) => x0 + (s - 0.5) * dw
  const filas = ACCIONES.map((a) => {
    const lt = envolver(a.que, col, fFila, 400)
    return { ...a, lt, necesita: lt.length * fFila * 1.25 + fSec * 1.25 }
  })
  const yPrim = fPrim * 1.1
  const yNum = yPrim + 12 * u + fSec * 1.25
  const cab = yNum + 16 * u
  // (18/11, intermedio) las filas reparten LLENA del alto del lienzo, sin bajar de lo que necesita su texto
  const altoFila = Math.max(...filas.map((f) => f.necesita + 16 * u), (LLENA * h - cab) / filas.length)
  const alto = cab + altoFila * filas.length
  const y0 = Math.max(0, (h - alto) / 2)
  const xL = xs(SEM_LISTA)
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <text x={xL} y={y0 + yPrim} fontSize={fPrim} fontWeight={700} fill={INK} textAnchor="middle">{X.primera}</text>
      <text x={xs(1) - 24 * u} y={y0 + yNum} fontSize={fSec} fill={CTX} textAnchor="end">{X.semana}</text>
      {Array.from({ length: SEM_LISTA }, (_, i) => i + 1).map((s) => (
        <text key={s} x={xs(s)} y={y0 + yNum} fontSize={fSec} fill={s === SEM_LISTA ? INK : CTX}
              fontWeight={s === SEM_LISTA ? 700 : 400} textAnchor="middle">{fijo(s)}</text>
      ))}
      <Umbral u={u} x1={xL} x2={xL} y1={y0 + yNum + 8 * u} y2={y0 + alto} color={ACC} punteada />
      {filas.map((a, i) => {
        const yf = y0 + cab + i * altoFila
        const yt = yf + (altoFila - a.necesita) / 2
        return (
          <g key={a.codigo}>
            <title>{`${a.que}: ${X.semana} ${a.semana}, ${a.quien}`}</title>
            <Renglones lineas={a.lt} x={0} y={yt} f={fFila} />
            <text x={0} y={yt + a.lt.length * fFila * 1.25} fontSize={fSec} fill={CTX}
                  dominantBaseline="hanging">{duro(a.quien)}</text>
            <circle cx={xs(a.semana)} cy={yf + altoFila / 2} r={10 * u} fill={CONTORNO} />
          </g>
        )
      })}
    </svg>
  )
}

export default function V10Previas() {
  return (
    <Vista id={ID} hibrido
           items={[
             { clave: 'puntaje', valor: sobre(A.H40.valor, 1) },
             { clave: 'proteccion', valor: sobre(proteccion) },
             { clave: 'previas', valor: fijo(T.legal_previas.n) },
           ]}
           cifras={[fijo(SEM_LISTA)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
