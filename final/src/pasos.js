// El avance por pasos de /final/ (19/11, fase 9 de la auditoría de dataviz, spec 2). Cada vista declara cuántos pasos
// tiene (`export const meta = { id, pasos: N }`, entero de 1 a 4; sin `pasos`, 1) y App.jsx lleva el paso vigente: avanzar
// enciende el siguiente y en el último pasa a la vista siguiente, que arranca en su paso 1; retroceder apaga el último y en
// el paso 1 vuelve a la vista anterior completa. Inicio, Fin, el clic en el riel, el enlace (#v05) y la hoja impresa
// muestran la vista completa.
//
// Este archivo tiene el contexto y lo que leen las vistas; los componentes que encienden y atenúan (Paso para SVG,
// PasoHtml para HTML) están en svg.jsx, y su CSS (--fin-atenuado, la transición) en estilos_final.css.
//
//   import { usePaso } from '../pasos.js'
//   const paso = usePaso()            // 1 a N; N en la hoja impresa y cuando la vista se abre completa
//
// «Completa» no es lo mismo que «en el último paso»: se llega al último paso avanzando (completa: false) y a la vista
// completa por Inicio, Fin, el riel, el enlace, volviendo desde la vista siguiente o en la hoja impresa (completa: true).
// Solo cambia algo para <Paso hasta={k}>, que atenúa lo ya dicho para enfocar lo nuevo: en la vista completa todo está
// encendido.

import { createContext, useContext } from 'react'
import { ImpresionCtx } from '../../e2/src/escala.js'
import { variante } from './variantes.js'

export const MAX_PASOS = 4

/** Lo que todavía no se reveló: 'a' atenuado (lo elegido), 'b' oculto ocupando su lugar (?var=rev.b). No cambia sin
 *  recargar. */
export const REV = variante('rev') === 'b' ? 'b' : 'a'

/** Los pasos de una vista según su meta: 1 si no declara; corta con su motivo si no es un entero de 1 a 4. */
export function pasosDe(meta) {
  const n = meta?.pasos
  if (n == null) return 1
  if (!Number.isInteger(n) || n < 1 || n > MAX_PASOS) {
    throw new Error(`vista «${meta?.id ?? '?'}»: meta.pasos tiene que ser un entero de 1 a ${MAX_PASOS} (llegó ${JSON.stringify(n)})`)
  }
  return n
}

/** El paso vigente de la vista que se dibuja: { paso, pasos, completa }. App.jsx pone uno por vista en pantalla y uno
 *  por hoja impresa. Sin proveedor (una vista dibujada fuera de App), todo encendido. */
export const PasoCtx = createContext({ paso: MAX_PASOS, pasos: MAX_PASOS, completa: true })

/** { paso, pasos, completa } de la vista. En la hoja impresa, siempre la vista completa. */
export function usePasos() {
  const imprimiendo = useContext(ImpresionCtx)
  const c = useContext(PasoCtx)
  return imprimiendo ? { paso: c.pasos, pasos: c.pasos, completa: true } : c
}

/** El paso vigente, de 1 a N (N en la hoja impresa y en la vista completa). */
export const usePaso = () => usePasos().paso

/** Cómo se ve lo que se enciende en el paso `n`: 'on', 'atenuado' u 'oculto'.
 *  - antes de su paso: atenuado (rev a) u oculto ocupando su lugar (rev b, o `oculto`: capas que se superponen);
 *  - con `hasta`, después de ese paso vuelve a atenuarse (lo ya dicho, para enfocar lo nuevo), también con rev b;
 *  - en la vista completa (y en la hoja impresa), todo 'on'. */
export function estadoPaso({ paso, completa }, n = 1, { hasta, oculto = false } = {}) {
  if (completa) return 'on'
  if (paso < n) return oculto || REV === 'b' ? 'oculto' : 'atenuado'
  if (hasta != null && paso > hasta) return 'atenuado'
  return 'on'
}

/** estadoPaso para la vista que se dibuja: const e = useEstadoPaso(2) → 'on' | 'atenuado' | 'oculto'. */
export function useEstadoPaso(n = 1, opciones) {
  return estadoPaso(usePasos(), n, opciones)
}

/** Los atributos que encienden o atenúan un elemento propio (cuando envolverlo en <Paso> no sirve, por ejemplo un <rect>
 *  que tiene que quedar hijo directo de otro): <rect {...attrsPaso(useEstadoPaso(2))} />. La clase y el atributo son los
 *  de Paso (estilos_final.css). Si el elemento ya tiene className, se suman a mano. */
export const attrsPaso = (estado) => ({
  className: 'fin-paso',
  'data-revela': estado,
  ...(estado === 'oculto' ? { 'aria-hidden': true } : {}),
})
