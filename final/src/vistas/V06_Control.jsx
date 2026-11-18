// V06 · Cómo se mide (modelo, Francisco C.). La lista de un mes como barra partida (spec f.3 y g V06): es una partición
// de un todo, no una comparación de tamaños. Tramos de la lista de muestra al corte de agosto de 2025, en el orden de hoy:
// mayor facturación (K16), que se contacta entero y no entra al sorteo (16 u de separación); el control (G49.control_mes),
// en --acc, que es lo que permite medir; y las dos ramas (K18). La suma de los tramos se controla contra la lista del mes
// (G49.lista_mes), como V10 a V12. En la banda, solo la lista por mes: el control es el título y el tramo en acento.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, Renglones, envolver, rectRedondo, tam, useU } from '../svg.jsx'

const ID = 'V06'
const A = DF.anclas
const B = textosDe(ID).barras

const TRAMOS = [
  { clave: 'alto', valor: A.K16.valor, nombre: B.alto, nota: B.nota_alto },
  { clave: 'control', valor: A['G49.control_mes'].valor, nombre: B.control, foco: true },
  { clave: 'con', valor: A['K18.con_descuento'].valor, nombre: B.con },
  { clave: 'sin', valor: A['K18.sin_descuento'].valor, nombre: B.sin },
]
const LISTA = A['G49.lista_mes'].valor
if (TRAMOS.reduce((s, t) => s + t.valor, 0) !== LISTA) {
  throw new Error('V06: los tramos de la barra no suman la lista del mes')
}

export const meta = { id: ID }

/** Los renglones del nombre de un tramo, a 24 u (baja hasta 20 u si no entra en dos renglones). */
function nombre(t, w, u) {
  const peso = t.foco ? 600 : 400
  for (let f = 24; f >= 20; f -= 1) {
    const lt = envolver(t.nombre, w, tam(f, u), peso)
    if (lt.length <= 2 || f === 20) return { lt, f: tam(f, u), peso }
  }
  return null
}

function Dibujo({ w, h }) {
  const u = useU()
  const sepAlto = 16 * u
  const sep = 2 * u
  const util = w - sepAlto - 2 * sep
  const k = util / LISTA
  let x = 0
  const tramos = TRAMOS.map((t, i) => {
    if (i === 1) x += sepAlto
    else if (i > 1) x += sep
    const aw = t.valor * k
    const r = { ...t, x, w: aw, n: nombre(t, aw - 24 * u, u) }
    x += aw
    return r
  })
  const fVal = tam('valFoco', u)
  const altoBarra = 72 * u
  const fNota = tam('sec', u)
  const altoNombres = Math.max(...tramos.map((t) => t.n.lt.length * t.n.f * 1.25 + (t.nota ? fNota * 1.25 : 0)))
  const alto = fVal + 12 * u + altoBarra + 16 * u + altoNombres
  const y0 = Math.max(0, (h - alto) / 2)
  const yBarra = y0 + fVal + 12 * u
  const yNombre = yBarra + altoBarra + 16 * u
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {tramos.map((t) => (
        <g key={t.clave}>
          <title>{[t.nombre, fijo(t.valor), t.nota].filter(Boolean).join(' · ')}</title>
          <text x={t.x} y={yBarra - 12 * u} fontSize={t.foco ? fVal : tam('val', u)} fontWeight={t.foco ? 700 : 600}
                fill={INK}>{fijo(t.valor)}</text>
          <path d={rectRedondo(t.x, yBarra, t.w, altoBarra, 4 * u, 'todos')} fill={t.foco ? ACC : FIN_GRIS} />
          <Renglones lineas={t.n.lt} x={t.x} y={yNombre} f={t.n.f} peso={t.n.peso} color={t.foco ? INK : CTX} />
          {t.nota && (
            <text x={t.x} y={yNombre + t.n.lt.length * t.n.f * 1.25} fontSize={fNota} fill={CTX}
                  dominantBaseline="hanging">{t.nota}</text>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function V06Control() {
  return (
    <Vista id={ID} items={[{ clave: 'lista', valor: fijo(LISTA) }]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
