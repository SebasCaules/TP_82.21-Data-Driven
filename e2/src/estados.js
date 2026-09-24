// Estado visible de una decisión (24/09). Una decisión aplicada que además tiene un pedido
// abierto en V12 (hoy DC-07, DC-09 y DC-13) se muestra «a confirmar»: ya corre en el
// cálculo, pero Casa Óga tiene que confirmarla. Lo usan la tabla de V01 y la tarjeta de
// decisión de cada vista, para que la misma decisión no diga «a confirmar» en una vista y
// «aplicada» en otra. El estado del payload no se toca: esto es solo cómo se muestra.

import { D2 } from './datos_e2.js'

// V12 también lista pedidos que no son decisiones («D18 (registro)»): por eso el prefijo DC-.
export const ESPERA = new Set((D2.vistas.V12?.pedidos ?? []).map((p) => p.id).filter((id) => id.startsWith('DC-')))

export const estadoVisible = (dc) =>
  (dc.estado === 'aplicada' && ESPERA.has(dc.id) ? 'a confirmar' : dc.estado)
