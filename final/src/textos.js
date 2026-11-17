// Los textos de una vista de /final/ en CF (contenido_final.js): lo que escribe su componente (rótulos, fragmentos, qué
// mide, conclusión, decisión). Va aparte de vistas/index.jsx porque ese archivo importa las vistas con un glob eager: una
// vista que lo importara leería HISTORIA antes de que exista (import circular, como decisiones.js en /e3/).

import { CF } from './contenido_final.js'

export function textosDe(id) {
  const v = CF.BLOQUES.flatMap((b) => b.vistas).find((x) => x.id === id)
  if (!v?.textos) throw new Error(`contenido_final.js: la vista «${id}» no trae textos`)
  return v.textos
}

/** La decisión de la vista en la forma de TarjetaDecision (e2/src/TarjetaDecision.jsx): el área como rótulo y la frase
 *  corta en la tarjeta; la larga, al title. */
export function decisionDe(t) {
  const d = t.decision
  return { id: d.area, estado: d.estado, llano_corto: d.corta, llano: d.larga ?? d.corta, decision: d.corta }
}
