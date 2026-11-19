// Textos de V06 (fase 9), mezclados en textosDe('V06'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// Los rótulos del flujo: la lista, el 20 % de mayor facturación, el sorteo, el control y las dos ramas, y la comparación.
// Las cifras grandes (500 y 100) las pone la vista delante de `lista` y de `control`.
import { DF } from '../datos_final.js'
import { NBSP, fijo, pct } from '../../../e3/src/formato.js'

const v = (id) => DF.anclas[id].valor

export default {
  grupos: {
    lista: 'contactables',
    lista_accion: 'lista del mes',
    // «En el»: son los de la lista que están en el 20 % de mayor facturación de la base, no el 20 % de la lista
    alto: `En el ${pct(v('G49.alto_valor'), 0)} de mayor facturación`,
    alto_accion: 'se contacta entero',
    sorteo: 'Sorteo al azar',
    control: 'de control',
    control_accion: 'no se contactan',
    con: `Con ${pct(v('G49.descuento'), 0)} de descuento`,
    sin: 'Sin descuento',
    rama_accion: 'se contacta',
  },
  compara: {
    cuando: `A los ${fijo(v('F04.horizonte'))} días`,
    // los espacios duros arman los renglones: «cada rama se compara» / «con el control»
    que: `cada${NBSP}rama se${NBSP}compara con${NBSP}el${NBSP}control`,
  },
}
