// Vocabulario único de decisiones del E3 (27/10, W1, hallazgo 3 del verificador). La tarjeta de
// decisión del E2 muestra «id · estado» (DC-04 · APLICADA); acá cada decisión tiene un id y un estado
// fijos, y toda vista los toma de este archivo en vez de armar su propio par con el kicker de C3.
//
// - id: la letra de la Parte de la plantilla (la del kicker «Parte X · Factibilidad …» de C3) y las tres
//   primeras letras del área, sin tilde: A-TEC, B-ECO, C-LEG.
// - estado: el veredicto de la tarjeta de la diapositiva 2 de C3. Si el valor es una cifra (2,25/3), el
//   estado es su escala («factibilidad media»); si es una palabra («No viable»), es el valor.
//
// Va en un archivo propio y no en vistas/index.jsx: index.jsx importa las vistas con un glob eager, y
// una vista que importara index.jsx leería este mapa antes de que exista (import circular).
//
// (27/10, W2) Tres decisiones más, con el mismo esquema (letra de la Parte y área): no son veredictos de
// la diapositiva 2, así que su estado se escribe acá, en palabras que el público entiende.
// - A-UMB · del equipo: el umbral propio de cada cliente (vista 2; Parte A 2.1). Es DEF-UMBRAL del registro
//   de decisiones de los hitos; María G. lo aprueba en la semana 2 (D 12.2, hito 2).
// - C-MOD · sale la regla: ningún modelo reemplaza a la regla del umbral (vista 4; Parte C 7, que cierra
//   la comparación). MOD-05, MOD-06 y VER-MVP del registro.
// - D-PRO · con condiciones: el veredicto integrado de la D 11.1, viable con condiciones (vista 1). La lista
//   sale con la regla, sin modelo, y un piloto mide si paga. D6 del registro.
// - D-PIL · propuesta (crítica del W3, hallazgo 12): la regla de decisión del piloto, con 40,4 puntos o más
//   a producción (vista 7; Parte D 11.1 y 12.2, hito 8; G49 y H49). Hasta entonces la vista 7 usaba D-PRO
//   con otra frase corta: una decisión, una frase.
// - D-PLA · propuesta (01/11, vista 8): el plan de 20 semanas, con la primera lista en la semana 6 y la decisión de
//   producción en la 20 (Parte D 12.1 a 12.4; J50).
//
// - E-CRI · aplicado (01/11, W5, vista 9): el criterio de la corrección al Grupo 5, el de la planilla v2.0: un bloque
//   de secciones queda en «Revisar» solo si tiene un error que cambia una cifra o el método, o algo que la cátedra ya
//   nos pidió corregir (en la v1.0, toda sección con una observación que pidiera una acción). E es la parte de la
//   corrección (E-consignas.md del E3).
// - E-CRU · sin cambios (01/11, W5, vista 10): el cruce de las cifras del Grupo 5 con nuestro registro no cambia ninguna
//   nuestra (_build/E/cruce.md). Los dos grupos concluyen distinto sobre todo por el target.
//
// (28/10, F6b, hallazgo H-2-077 de la auditoría) Los ids son internos: ningún documento que lee la cátedra los
// define (en el E2, los DC-xx estaban en la Parte B). La tarjeta muestra en su lugar el área de la decisión,
// «Legal · con condiciones», que se entiende sola (sección 8 del CLAUDE.md: cada rótulo se entiende solo).
// `decision()` devuelve el área como `id`, que es lo que TarjetaDecision (del E2, sin tocar) escribe; el id
// interno sigue en `meta.dc` de cada vista. «Parte C · …» no entraba en la tarjeta a 1366 × 768. D-PRO fue «Propuesta ·
// propuesta» y después «Alcance · propuesta» hasta el 02/11 (abajo).
//
// (02/11, W6, _build/workforce/fase-w6/hallazgos.md) Tres etiquetas que confundían:
// - D-PRO · «Veredicto · con condiciones» (COB-01, UX-08): la V01 abre con el veredicto integrado de la D 11.1
//   («Veredicto integrado: viable con condiciones»), no con el alcance.
// - A-UMB · «Umbral · del equipo» (COB-24): «vigente» se leía aprobado por el negocio; María G. lo aprueba en la
//   semana 2 (D 12.2, hito 2).
// - C-LEG · «Legal · con condiciones» (VIS-16): sale de la tarjeta Legal de la diapositiva 2 de C3, cuya escala pasó a
//   «con condiciones» (VIS-17), por el mismo mecanismo que A-TEC y B-ECO; «viable con condiciones» partía la etiqueta
//   en dos renglones a 1280 × 720.

import { C3 } from './contenido_e3.js'

const sinTilde = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
const AREAS = ['Técnica', 'Económica', 'Legal']
const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)

function parteDe(area) {
  const re = new RegExp(`^Parte ([A-D]) · Factibilidad ${area.toLowerCase()}$`)
  const d = C3.DIAPOSITIVAS.find((x) => re.test(x.kicker ?? ''))
  if (!d) throw new Error(`decisiones.js: C3 no tiene la diapositiva de la Parte de «${area}»`)
  return d.kicker.match(re)[1]
}

const PROPIAS = [
  { id: 'A-UMB', area: 'Umbral', estado: 'del equipo' },
  { id: 'C-MOD', area: 'Modelo', estado: 'sale la regla' },
  { id: 'D-PRO', area: 'Veredicto', estado: 'con condiciones' },
  { id: 'D-PIL', area: 'Piloto', estado: 'propuesta' },
  { id: 'D-PLA', area: 'Plan', estado: 'propuesta' },
  { id: 'E-CRI', area: 'Criterio', estado: 'aplicado' },
  { id: 'E-CRU', area: 'Cruce', estado: 'sin cambios' },
]

export const DECISIONES = Object.fromEntries([
  ...AREAS.map((area) => {
    const t = D2.tarjetas.find((x) => x.area === area)
    if (!t) throw new Error(`decisiones.js: falta la tarjeta «${area}» en la diapositiva 2 de C3`)
    const id = `${parteDe(area)}-${sinTilde(area).slice(0, 3).toUpperCase()}`
    const estado = (/^\d/.test(t.valor) ? t.escala : t.valor).toLowerCase()
    return [id, { id, area, estado }]
  }),
  ...PROPIAS.map((d) => [d.id, d]),
])

/** El rótulo que ve el público en lugar del id interno: el área, «Legal». */
export const rotuloDe = (d) => d.area

/** La decisión `id` con lo que la vista agrega (llano_corto, llano, decision, justificacion). El `id` que devuelve
 *  es el rótulo de pantalla (rotuloDe); el interno queda en `interno`. */
export function decision(id, resto = {}) {
  const d = DECISIONES[id]
  if (!d) throw new Error(`decisiones.js: no hay decisión «${id}» (hay ${Object.keys(DECISIONES).join(', ')})`)
  return { ...resto, id: rotuloDe(d), interno: d.id, estado: d.estado }
}
