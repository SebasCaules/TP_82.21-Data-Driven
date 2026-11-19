// Textos de V16 (19/11, fase 11, spec 2.2), mezclados en textosDe('V16'). La segunda mitad del cierre: lo que pedimos
// (la idea, el pedido en tres renglones y los dos montos), por qué con este equipo y el cierre con el contacto y el QR
// al informe. El título y la sección los pone el encabezado de App.jsx. Las cifras salen de DF con formato.js; la
// dirección del informe, de INFORME.url (informe.js), y no se escribe acá.
import { DF } from '../datos_final.js'
import { fijo } from '../../../e3/src/formato.js'

const A = DF.anclas
const T = DF.tablas
const v = (id) => A[id].valor
const SEM_ACUERDO = T.plan.hitos.find((h) => h.n === 1).semana

export default {
  pedimos: 'Lo que pedimos',
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
  // el cierre: una sola persona de contacto (spec 2.2). El rol es el que le da el plan, tal como lo nombra el informe
  // (36.3 y 37, columna «Rol en el plan»: «Coordinación»; en las carátulas es «Programador y Organización»); el mail es
  // el de la facultad
  contacto: {
    titulo: 'Contacto',
    nombre: 'Sebastian Caules',
    rol: 'Coordinación',
    mail: 'scaules@itba.edu.ar',
  },
  // el QR lleva al PDF del informe (INFORME.url); al lado, qué abre y la dirección
  qr: { titulo: 'El informe completo' },
}
