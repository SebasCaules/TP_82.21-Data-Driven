// Marco común de las diapositivas y los anexos: barra de avance, rótulo, título (la afirmación de
// C3), y pie con la marca, «Fuente: …» y «quien · n / 12». Todo en coordenadas del escenario de
// 1600 × 900: 120 px por pulgada del PPTX (13,333 × 7,5 in), así cada caja cae donde la puso armar.py.

import { C3 } from '../contenido_e3.js'
import MarcaInicio from '../MarcaInicio.jsx'
import { Rico } from '../texto.jsx'

export const TOTAL = C3.DIAPOSITIVAS.length
export const M = 72            // margen lateral, 0,6 in
export const ANCHO = 1600 - 2 * M
export const Y0 = 234          // arranque del cuerpo, 1,95 in

/** style de una caja absoluta en coordenadas del escenario. */
export const caja = (x, y, w, h) => ({ left: x, top: y, width: w, ...(h != null ? { height: h } : {}) })

/** El pie de C3 («Casa Óga · Entregable 3 · …») con la marca como enlace a la landing. */
export function PieMarca({ className = '' }) {
  const i = C3.PIE.indexOf(' · ')
  return (
    <span className={className}>
      <MarcaInicio>{C3.PIE.slice(0, i)}</MarcaInicio>
      {C3.PIE.slice(i)}
    </span>
  )
}

/** Puntos discretos que dicen cuántos pasos quedan en la diapositiva. */
function Pasos({ paso, pasos }) {
  if (!pasos || pasos < 2) return null
  return (
    <span className="e3-pasos" role="img" aria-label={`paso ${paso} de ${pasos}`} data-escala="">
      {Array.from({ length: pasos }, (_, k) => <i key={k} className={k < paso ? 'on' : ''} />)}
    </span>
  )
}

export default function Marco({ kicker, titulo, fuente, n, derecha, paso, pasos, children, clase = '' }) {
  return (
    <div className={`e3-dia ${clase}`}>
      <div className="e3-avance" aria-hidden="true">
        {n != null && <i style={{ width: `${(100 * n) / TOTAL}%` }} />}
      </div>
      <p className="e3-kicker">{kicker}</p>
      <h1 className="e3-titulo"><Rico t={titulo} /></h1>
      {children}
      <footer className="e3-pie">
        <PieMarca className="e3-pie-izq" />
        <span className="e3-pie-centro">{fuente ? 'Fuente: ' + fuente : ''}</span>
        <span className="e3-pie-der">
          <Pasos paso={paso} pasos={pasos} />
          {derecha}
        </span>
      </footer>
    </div>
  )
}

/** «Sebastian C. · 3 / 12»: el número va marcado como navegación, no como cifra del documento. */
export function QuienN({ quien, n }) {
  return <span>{quien}{'\u00a0\u00a0·\u00a0\u00a0'}<span data-escala="">{n}{'\u00a0/\u00a0'}{TOTAL}</span></span>
}
