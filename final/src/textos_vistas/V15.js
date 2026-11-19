// Textos nuevos de V15 (fase 8), mezclados en textosDe('V15'). El cierre a pantalla completa (spec 2, V15): lo que
// mostramos (una pieza por sección, con su cifra, su punto clave y los rótulos de su dibujo mínimo), lo que nos llevamos
// (el balance de contenido_final.js) y el pedido con el porqué de este equipo. Las cifras salen de DF con formato.js.
// El número y el nombre de cada sección los pone la vista desde el rótulo del riel de su bloque («1 · Datos»).
import { DF } from '../datos_final.js'
import { fijo, usd } from '../../../e3/src/formato.js'

const A = DF.anclas
const T = DF.tablas
const v = (id) => A[id].valor
const SEM_ACUERDO = T.plan.hitos.find((h) => h.n === 1).semana

export default {
  mide: 'Cierre: lo que mostramos, lo que nos llevamos y lo que pedimos',
  marca: 'Casa Óga',
  mostramos: 'Lo que mostramos',
  llevamos: 'Lo que nos llevamos',
  pedimos: 'Lo que pedimos',
  ley: { cifra: 'lo que mide la cifra', resto: 'el resto' },
  piezas: {
    datos: {
      desc: 'ventas con cliente',
      clave: 'alcanzan para armar la lista',
      mini: { extracto: `${fijo(v('C20.crudo'))} en el extracto`, afuera: 'quedan afuera' },
    },
    modelo: {
      desc: 'acierta la regla',
      clave: 'igual que el modelo',
      mini: { regla: 'regla', modelo: 'modelo', base: 'práctica actual', eje: 'acierto' },
    },
    economia: {
      despues: 'por año',
      desc: 'deja la lista',
      clave: `el primer año cuesta ${usd(v('G39'))}`,
      mini: { costo: 'costo del primer año' },
    },
    legal: {
      desc: 'acciones legales antes de la primera lista',
      clave: 'la corre Marketing',
      mini: { semana: 'semana', compuerta: 'primera lista' },
    },
    gestion: {
      despues: 'semanas',
      desc: `${fijo(v('K02'))} historias con dueño`,
      clave: `${fijo(v('K04'))} hechas`,
      mini: { semana: 'semana', compuerta: 'decisión' },
    },
  },
  idea: ['Ya sabemos a quién contactar.', 'Falta saber si contactarlo paga la lista.'],
  comparar: {
    saberlo: 'para saberlo',
    saberloNota: 'piloto mínimo',
    apostarlo: 'para apostarlo',
    apostarloNota: 'proyecto entero, primer año',
    eje: 'Dólares',
  },
  separador: '·',
  pasos: [
    { accion: 'Aprobar el piloto mínimo', dato: `${usd(v('G64'))} del presupuesto` },
    { accion: 'Firmar el acuerdo de confidencialidad', dato: `semana ${fijo(SEM_ACUERDO)}` },
  ],
  desenlace: { accion: `Semana ${fijo(v('G63.semana_decision'))}:`, dato: 'decide María G.' },
  porque: {
    titulo: 'Por qué con este equipo',
    // cabeza en 700 y resto debajo, más tenue: los tres motivos se leen de un vistazo
    items: [
      { cabeza: 'No vendemos el proyecto:', resto: 'hoy no se paga, y lo dijimos.' },
      { cabeza: 'Una planilla que corre Marketing:', resto: 'sin modelo, sin licencias, sin integrar el CRM.' },
      { cabeza: 'La regla de pase se fija antes de empezar:', resto: `${fijo(v('G67.con_descuento'), 2)} puntos.` },
    ],
  },
}
