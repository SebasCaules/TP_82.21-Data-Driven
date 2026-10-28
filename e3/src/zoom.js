// Zoom uniforme de /e3/ (27/10, W1, decisión N0-5): el tablero del E2 con la letra más grande.
//
// k = min(1,2; ancho / 1152; alto / 640), y nunca menos de 1. La ventana lógica (ancho / k × alto / k)
// no baja de 1152 × 640, el rango que el E2 verifica; a 1152 × 640 el E3 es el E2 tal cual. La caja
// .e3-vp (App.jsx) mide la ventana lógica, es el contenedor contra el que se resuelven los vw, vh y
// @media reescritos de las hojas compartidas (vite.e3.config.js) y lleva `zoom: k`. Las cajas de /e3/
// a W × H son las de /e2/ a W/k × H/k, ampliadas k veces; la letra (W2.0, N0-13) mide contra la
// ventana real y vale k veces la de /e2/ en la misma ventana W × H (scripts/paridad_e3.py lo mide).
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

// Texto de los SVG: las vistas usan useEscalaTexto del E2 (e2/src/escala.js) tal cual. Mide la ventana
// real y el zoom lo multiplica por k: la letra de un gráfico vale k veces la de /e2/ en la misma ventana,
// como el resto (W2.0, N0-13). En la hoja impresa, 1 (ImpresionCtx, App.jsx).
