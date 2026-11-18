// La unidad de escala de /final/ (18/11, auditoría de dataviz, spec b.1): 1 u = 1 px de una pantalla de 1920 × 1080.
// App.jsx la calcula con la ventana lógica (después del zoom de e3/src/zoom.js), la pasa por UCtx a las vistas y la deja
// en la variable --fin-u del div .e3-vp para el CSS. Bajo el zoom k, u px lógicos son u × k px reales: 1 a 1920 × 1080,
// 0,667 a 1280 × 720 y 0,533 a 1024 × 768. Los SVG multiplican cada medida por u; el CSS usa calc(var(--fin-u) * N).
// En la hoja impresa, 0,6 (la letra de la ventana lógica mínima, 1152 × 640).

import { createContext, useContext } from 'react'
import { ImpresionCtx } from '../../e2/src/escala.js'

export const U_IMPRESION = 0.6

/** u para una ventana lógica de w × h. */
export const calcularU = (w, h) => Math.min(w / 1920, h / 1080)

export const UCtx = createContext(U_IMPRESION)

/** La unidad para una vista: la de App.jsx, o 0,6 en la hoja impresa. */
export function useU() {
  const imprimiendo = useContext(ImpresionCtx)
  const u = useContext(UCtx)
  return imprimiendo ? U_IMPRESION : u
}
