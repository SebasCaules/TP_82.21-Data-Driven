// (26/09, revisión UX H10) Etiqueta de una tarjeta de cifra que remite a la pantalla que explica
// su estado: «en revisión» e «incluye sep–dic» llevan a la de DC-09 (vista 3), que es la causa.
// Es un botón con el borde --acc de las fichas de V01. Sin irAVista (la hoja impresa) o en la
// pantalla a la que llevaría, queda como texto sin borde (.inerte): no promete un clic.

import { D2 } from './datos_e2.js'

export default function EtiquetaIr({ texto, a = 'DC-09', irAVista, aqui = false }) {
  const dc = D2.decisiones.find((d) => d.id === a)
  const n = dc?.vista ? dc.vista.slice(1).replace(/^0/, '') : null
  if (!irAVista || aqui || !n) return <b className="e2-tag inerte">{texto}</b>
  return (
    <button type="button" className="e2-tag" onClick={() => irAVista(a)}
            title={`${dc.id}: ${dc.llano_corto ?? dc.llano ?? ''} Vista ${n}.`}
            aria-label={`${texto}: ir a la vista ${n}, que explica por qué`}>
      {texto}
    </button>
  )
}
