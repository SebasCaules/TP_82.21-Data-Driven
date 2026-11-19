// Textos nuevos de V06 (fase 8), mezclados en textosDe('V06'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// Los grupos de la lista del mes (spec 2, V06): los comparten la versión a (flujo) y la b (cuadrícula de puntos).
import { DF } from '../datos_final.js'
import { NBSP, fijo, pct, mesAnio } from '../../../e3/src/formato.js'

const v = (id) => DF.anclas[id].valor

export default {
  grupos: {
    lista: 'Lista del mes',
    // «En el»: los 153 son los de la lista que están en el 20 % de mayor facturación del corte, no el 20 % de la lista
    alto: `En el ${pct(v('G49.alto_valor'), 0)} de mayor facturación`,
    alto_accion: 'se contacta entero, sin sorteo',
    sorteo: 'Sorteo al azar',
    control: 'Control',
    control_accion: 'no se contacta',
    con: `Con ${pct(v('G49.descuento'), 0)} de descuento`,
    sin: 'Sin descuento',
    rama_accion: 'se contacta',
  },
  compara: {
    cuando: `A los ${fijo(v('F04.horizonte'))} días`,
    // los espacios duros arman los renglones de la versión a: «cada rama» / «se compara» / «con el control»
    que: `cada${NBSP}rama se${NBSP}compara con${NBSP}el${NBSP}control`,
  },
  muestra: `Lista de muestra, ${mesAnio(DF.tablas.lista_muestra.corte)}`,
  ley: {
    reparte: 'Se reparte',
    contacta: 'Se contacta',
    control: 'No se contacta',
    banda: 'Alto de la banda: clientes',
    punto: 'Cada punto: un cliente',
  },
  puntos: {
    lista: `Lista del mes: ${fijo(v('G49.lista_mes'))} clientes`,
    sorteo: `Sorteo al azar entre los ${fijo(v('K17'))} restantes`,
    compara: `A los ${fijo(v('F04.horizonte'))} días, cada rama se compara con el control`,
  },
}
