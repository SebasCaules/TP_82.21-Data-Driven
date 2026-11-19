// Textos de V15 (fase 8; 19/11, fase 9: menos información), mezclados en textosDe('V15'). El cierre a pantalla completa:
// el recorrido (una estación por sección, con su cifra y una línea; el número y el nombre los pone la vista desde el
// rótulo del riel de su bloque, «1 · Datos»), lo que nos llevamos (el balance de contenido_final.js), lo que pedimos y
// por qué con este equipo. Las cifras salen de DF con formato.js.
import { DF } from '../datos_final.js'
import { fijo } from '../../../e3/src/formato.js'

const A = DF.anclas
const T = DF.tablas
const v = (id) => A[id].valor
const SEM_ACUERDO = T.plan.hitos.find((h) => h.n === 1).semana

export default {
  mide: 'Cierre: el recorrido, lo que nos llevamos y lo que pedimos',
  marca: 'Casa Óga',
  llevamos: 'Lo que nos llevamos',
  pedimos: 'Lo que pedimos',
  // los dibujos de las estaciones no llevan rótulos: el acento es lo que cuenta la cifra de la estación
  ley: { cifra: 'lo que mide la cifra', resto: 'el resto' },
  // una línea por estación, debajo de su cifra
  piezas: {
    datos: { desc: 'ventas con cliente' },
    modelo: { desc: 'acierta la regla' },
    economia: { despues: 'por año', desc: 'deja la lista' },
    legal: { despues: 'acciones', desc: 'antes de la primera lista' },
    gestion: { despues: 'semanas', desc: 'hasta la decisión' },
  },
  idea: ['Ya sabemos a quién contactar.', 'Falta saber si contactarlo paga la lista.'],
  // el pedido en tres renglones: dos pasos numerados y el desenlace
  pedido: [
    { accion: 'Aprobar el piloto mínimo' },
    { accion: 'Firmar el acuerdo de confidencialidad', dato: `semana ${fijo(SEM_ACUERDO)}` },
  ],
  desenlace: { accion: `Semana ${fijo(v('G63.semana_decision'))}:`, dato: 'decide María G.' },
  separador: '·',
  // los dos montos, sin eje: lo que cuesta saberlo y lo que costaría apostarlo
  comparar: {
    saberlo: 'para saberlo',
    saberloNota: 'piloto mínimo',
    apostarlo: 'para apostarlo',
    apostarloNota: 'proyecto entero, primer año',
  },
  porque: {
    titulo: 'Por qué con este equipo',
    // cabeza en 700 y resto debajo, más tenue: los tres motivos se leen de un vistazo
    items: [
      { cabeza: 'No vendemos el proyecto:', resto: 'hoy no se paga, y lo dijimos.' },
      { cabeza: 'Una planilla que corre Marketing:', resto: 'sin modelo, sin licencias, sin integrar el CRM.' },
      // sin decimales, como en el título de V09 («Pasa con 11 puntos»)
      { cabeza: 'La regla de pase se fija antes de empezar:', resto: `${fijo(v('G67.con_descuento'))} puntos.` },
    ],
  },
}
