// Zoom uniforme de /e3/ (27/10, W1, decisión N0-5): el tablero del E2 con la letra más grande.
//
// k = min(1,2; ancho / 1152; alto / 640), y nunca menos de 1. La ventana lógica (ancho / k × alto / k)
// no baja de 1152 × 640, el rango que el E2 verifica; a 1152 × 640 el E3 es el E2 tal cual. La caja
// .e3-vp (App.jsx) mide la ventana lógica, es el contenedor contra el que se resuelven los vw, vh y
// @media reescritos de las hojas compartidas (vite.e3.config.js) y lleva `zoom: k`. Nada más cambia:
// /e3/ a W × H es /e2/ a W/k × H/k, ampliado k veces (scripts/paridad_e3.py lo mide).
// Con el panel de notas abierto (solo para ensayar, App.jsx) el piso baja de 1: el tablero se achica
// para que su ventana lógica siga en 1152 × 640 o más y el riel no se encime con su pie.

import { createContext, useContext } from 'react'

export const K_MAX = 1.2
export const ANCHO_MIN = 1152
export const ALTO_MIN = 640

export function medir(w = window.innerWidth, h = window.innerHeight, piso = 1) {
  const k = Math.max(piso, Math.min(K_MAX, w / ANCHO_MIN, h / ALTO_MIN))
  return { k, w: w / k, h: h / k }
}

/** Para las vistas: la ventana lógica, sin volver a medir. */
export const VentanaCtx = createContext({ k: 1, w: ANCHO_MIN, h: ALTO_MIN })
export const useVentana = () => useContext(VentanaCtx)

/** El mismo factor que useEscalaTexto del E2 (e2/src/escala.js: 1 hasta 1280, tope 1,4), pero sobre el
 *  ancho lógico: con la ventana real, el texto de los SVG crecería dos veces (por el factor y por el
 *  zoom). En la hoja impresa, 1. */
export function useEscalaTextoLogica(imprimiendo = false) {
  const { w } = useVentana()
  return imprimiendo ? 1 : Math.min(1.4, Math.max(1, w / 1280))
}
