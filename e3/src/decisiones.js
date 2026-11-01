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
// - A-UMB · vigente: el umbral propio de cada cliente (vista 2; Parte A 2.1). Es DEF-UMBRAL del registro
//   de decisiones de los hitos, vigente desde el E1.
// - C-MOD · sale la regla: ningún modelo reemplaza a la regla del umbral (vista 4; Parte C 7, que cierra
//   la comparación). MOD-05, MOD-06 y VER-MVP del registro.
// - D-PRO · propuesta: la lista sale con la regla y un piloto mide (vista 1; la Parte D, diseño de la
//   solución). D6 del registro.
// - D-PIL · propuesta (crítica del W3, hallazgo 12): la regla de decisión del piloto, con 40,4 puntos o más
//   a producción (vista 7; Parte D 11.1 y 12.2, hito 8; G49 y H49). Hasta entonces la vista 7 usaba D-PRO
//   con otra frase corta: una decisión, una frase.
//
// (28/10, F6b, hallazgo H-2-077 de la auditoría) Los ids son internos: ningún documento que lee la cátedra los
// define (en el E2, los DC-xx estaban en la Parte B). La tarjeta muestra en su lugar el área de la decisión,
// «Legal · viable con condiciones», que se entiende sola (sección 8 del CLAUDE.md: cada rótulo se entiende solo).
// `decision()` devuelve el área como `id`, que es lo que TarjetaDecision (del E2, sin tocar) escribe; el id
// interno sigue en `meta.dc` de cada vista. D-PRO pasa de «Propuesta · propuesta» a «Alcance · propuesta» (D 12.3:
// «Aprobar el alcance: regla sin modelo y piloto con control»). «Parte C · …» no entraba en la tarjeta a 1366 × 768.

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
  { id: 'A-UMB', area: 'Umbral', estado: 'vigente' },
  { id: 'C-MOD', area: 'Modelo', estado: 'sale la regla' },
  { id: 'D-PRO', area: 'Alcance', estado: 'propuesta' },
  { id: 'D-PIL', area: 'Piloto', estado: 'propuesta' },
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
