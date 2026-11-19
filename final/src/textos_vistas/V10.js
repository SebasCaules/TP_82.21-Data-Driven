// Textos de V10 (fase 9; fase 10), mezclados en textosDe('V10'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// acciones.<código>.corta: el nombre corto de cada acción, el que va escrito en su etapa (el largo y el responsable
// siguen en contenido_final.js; el responsable se ve en la capa del último paso). Los espacios duros mantienen juntas las
// palabras que no se separan al cortar el renglón.
// grafico (fase 10, sin eje): la palabra que va delante del número de semana en cada etapa («Semana 1») y en la primera
// lista («Semana 6»), y el nombre de la primera lista.
import { NBSP } from '../../../e3/src/formato.js'

export default {
  acciones: {
    L4: { corta: `Firmar el acuerdo de${NBSP}confidencialidad` },
    L1: { corta: 'Inscribir las bases' },
    L5: { corta: `Aprobar la política de retención${NBSP}y${NBSP}borrado` },
    L6: { corta: 'Revisar el aviso de privacidad' },
    L3: { corta: 'Probar el filtro de consentimiento' },
  },
  grafico: {
    semana: 'Semana',
    primera: 'Primera lista',
  },
}
