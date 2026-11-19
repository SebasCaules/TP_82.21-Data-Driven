// El avance por pasos de /final/ (19/11, fase 9 de la auditoría de dataviz, spec 2; fase 10, spec 2 y 3). Cada vista
// declara cuántos pasos tiene (`export const meta = { id, pasos: N }`, entero de 1 a 6; sin `pasos`, 1) y App.jsx lleva
// el paso vigente: avanzar enciende el siguiente y en el último pasa a la vista siguiente, que arranca en su paso 1;
// retroceder apaga el último y en el paso 1 vuelve a la vista anterior completa. Inicio, Fin, el clic en el riel, el
// enlace (#v05) y la hoja impresa muestran la vista completa.
//
// Este archivo tiene el contexto y lo que leen las vistas; los componentes (Paso y Anima para SVG, PasoHtml y AnimaHtml
// para HTML) están en svg.jsx, y su CSS (--fin-atenuado, las transiciones, los efectos) en estilos_final.css.
//
//   import { usePaso, useAnima } from '../pasos.js'
//   const paso = usePaso()            // 1 a N; N en la hoja impresa y cuando la vista se abre completa
//   const anima = useAnima(2)         // true solo si el paso 2 acaba de llegar avanzando (y hay movimiento)
//
// «Completa» no es lo mismo que «en el último paso»: se llega al último paso avanzando (completa: false) y a la vista
// completa por Inicio, Fin, el riel, el enlace, volviendo desde la vista siguiente o en la hoja impresa (completa: true).
//
// (fase 10) Cuatro estados para lo que se enciende en el paso n:
//   'on'        encendido;
//   'atenuado'  todavía no llegó (boceto, regla 1): las formas atenuadas y sin acento, NINGÚN texto (estilos_final.css);
//   'oculto'    todavía no llegó y no se ve (`oculto`, o ?var=rev.b): ocupa su lugar y, al llegar, entra (regla 2);
//   'apagado'   ya se dijo (después de `hasta`): atenuado y sin acento, con sus textos (se ven, tenues).
// Y la llegada (regla 3): `llega` es el paso que acaba de llegar avanzando (el 1 al entrar a la vista desde la anterior
// con →); 0 si la vista se abrió completa, se retrocedió o se abrió por enlace o con ?paso=k. Solo lo que acaba de llegar
// se anima; con movimiento reducido, nada (useAnima da false y el CSS corta las transiciones).

import { createContext, useContext } from 'react'
import { ImpresionCtx } from '../../e2/src/escala.js'
import { variante } from './variantes.js'

export const MAX_PASOS = 6

/** Lo que todavía no se reveló: 'a' boceto (lo elegido), 'b' oculto ocupando su lugar (?var=rev.b). No cambia sin
 *  recargar. */
export const REV = variante('rev') === 'b' ? 'b' : 'a'

/** Los pasos de una vista según su meta: 1 si no declara; corta con su motivo si no es un entero de 1 a 6. */
export function pasosDe(meta) {
  const n = meta?.pasos
  if (n == null) return 1
  if (!Number.isInteger(n) || n < 1 || n > MAX_PASOS) {
    throw new Error(`vista «${meta?.id ?? '?'}»: meta.pasos tiene que ser un entero de 1 a ${MAX_PASOS} (llegó ${JSON.stringify(n)})`)
  }
  return n
}

/** El paso vigente de la vista que se dibuja: { paso, pasos, completa, llega, desdeVista }. App.jsx pone uno por vista en
 *  pantalla y uno por hoja impresa. `llega`: el paso que acaba de llegar avanzando (0 si no); `desdeVista`: true si ese
 *  paso es el 1 y se llegó desde la vista anterior (las animaciones esperan a que entre el cuerpo). Sin proveedor (una
 *  vista dibujada fuera de App), todo encendido y quieto. */
export const PasoCtx = createContext({ paso: MAX_PASOS, pasos: MAX_PASOS, completa: true, llega: 0, desdeVista: false })

/** { paso, pasos, completa, llega, desdeVista } de la vista. En la hoja impresa, siempre la vista completa y quieta. */
export function usePasos() {
  const imprimiendo = useContext(ImpresionCtx)
  const c = useContext(PasoCtx)
  return imprimiendo ? { paso: c.pasos, pasos: c.pasos, completa: true, llega: 0, desdeVista: false } : c
}

/** El paso vigente, de 1 a N (N en la hoja impresa y en la vista completa). */
export const usePaso = () => usePasos().paso

/** true si el sistema pide movimiento reducido (así capturan las herramientas): todo aparece terminado. */
export function movimientoReducido() {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/** ¿Se anima el paso n? true solo si acaba de llegar avanzando y el sistema no pide movimiento reducido. Al abrir la
 *  vista completa, al retroceder, con ?paso=k y en la hoja impresa da false: lo del paso n se dibuja terminado. */
export function llegaAnimado({ llega }, n = 1) {
  return llega === n && !movimientoReducido()
}

/** useAnima(n): llegaAnimado para la vista que se dibuja. */
export const useAnima = (n = 1) => llegaAnimado(usePasos(), n)

/** Cómo se ve lo que se enciende en el paso `n`: 'on', 'atenuado', 'oculto' o 'apagado'.
 *  - antes de su paso: atenuado, el boceto (rev a), u oculto ocupando su lugar (rev b, o `oculto`);
 *  - con `hasta`, después de ese paso queda apagado (lo ya dicho, tenue y con sus textos), también con rev b;
 *  - en la vista completa (y en la hoja impresa), todo 'on'. */
export function estadoPaso({ paso, completa }, n = 1, { hasta, oculto = false } = {}) {
  if (completa) return 'on'
  if (paso < n) return oculto || REV === 'b' ? 'oculto' : 'atenuado'
  if (hasta != null && paso > hasta) return 'apagado'
  return 'on'
}

/** estadoPaso para la vista que se dibuja: const e = useEstadoPaso(2) → 'on' | 'atenuado' | 'oculto' | 'apagado'. */
export function useEstadoPaso(n = 1, opciones) {
  return estadoPaso(usePasos(), n, opciones)
}

/** Los atributos que encienden o atenúan un elemento propio (cuando envolverlo en <Paso> no sirve, por ejemplo un <rect>
 *  que tiene que quedar hijo directo de otro): <rect {...attrsPaso(useEstadoPaso(2))} />. La clase y el atributo son los
 *  de Paso (estilos_final.css). Si el elemento ya tiene className, se suman a mano. Un elemento suelto así no entra
 *  animado (para eso, Paso oculto): solo cambia de estado con la transición. */
export const attrsPaso = (estado) => ({
  className: 'fin-paso',
  'data-revela': estado,
  ...(estado === 'oculto' ? { 'aria-hidden': true } : {}),
})

/** El escalonado de una tanda: cuánto espera cada lugar para que `n` elementos de `dur` ms terminen en `total` ms
 *  (sin contar la espera de entrada a la vista). Devuelve las variables CSS para el style del grupo que los contiene:
 *    <g style={escalonado(100, { total: 1000, dur: 220 })}>…cien <Anima i={k}>…</g>
 *  --fin-escalon (ms por lugar) y --fin-dur (lo que dura cada uno). Lo usan Anima (i) y Paso/PasoHtml (orden). */
export function escalonado(n, { total = 1000, dur = 300 } = {}) {
  const libre = Math.max(0, total - dur)
  const escalon = n > 1 ? libre / (n - 1) : 0
  return { '--fin-escalon': `${Math.round(escalon * 100) / 100}ms`, '--fin-dur': `${dur}ms` }
}
