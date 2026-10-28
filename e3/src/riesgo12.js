// Riesgo 12 de la matriz (Parte C 6.2, fila 12) como lo deja la Parte D 11.2, en un solo lugar (F6b, 28/10,
// hallazgos H-2-071 y H-2-072 de la auditoría). Lo usan el anexo A4 y el detalle de la vista 6 («Explorar»,
// «Los 13 riesgos»): hasta el F6b la vista 6 mostraba el texto de validación de la C 6.2 («acierta menos en
// mujeres…») y el A4 nombraba solo el alto valor.
//
// En test (D 11.2, fila 1 y 2; D3.test.segmentos, J15, J21 y J23): entre mujeres y hombres la brecha no aparece,
// menos de 12 meses pasa a positivo, el alto valor la repite y el género X queda 10,0 puntos debajo de toda la
// lista con pocos lugares. Ninguna cifra escrita acá: todo sale de D3.

import { C3 } from './contenido_e3.js'
import { D3 } from './datos_e3.js'
import { NBSP, entero, fijo, pct } from './formato.js'

function segmento(id) {
  const f = D3.test.segmentos.filas.find((x) => x.id === id)
  if (!f) throw new Error(`riesgo12.js: D3.test.segmentos no trae «${id}»`)
  return f
}
const AV = segmento('alto_valor')
const GX = segmento('genero_x')
const MUJ = segmento('mujeres')
const HOM = segmento('hombres')
const M12 = segmento('menos_de_12_meses')

const A4 = C3.ANEXOS.find((a) => a.n === 'A4')
const FILA_C = A4?.filas.find((f) => f[A4.columnas.indexOf('#')] === '12')
if (!FILA_C) throw new Error('riesgo12.js: el anexo A4 de C3 no trae la fila 12')

/** La celda del riesgo 12, en test. */
export const RIESGO_12 = `La lista acierta menos en el 20${NBSP}% de mayor facturación `
  + `(${fijo(AV.diferencia_pp, 1, true)} puntos en test) y en género X `
  + `(${fijo(GX.diferencia_pp, 1, true)}, ${entero(GX.en_lista)} lugares)`

/** Lo que se lee al pasar el mouse: la fila de la C 6.2 y lo que cambió con el test. */
export const TITULO_12 = `Riesgo 12, como lo deja la Parte D 11.2: en test, entre mujeres y hombres la brecha no aparece `
  + `(${pct(MUJ.precision, 1)} y ${pct(HOM.precision, 1)}); el género X acierta ${pct(GX.precision, 1)} en `
  + `${entero(GX.en_lista)} lugares, ${fijo(GX.diferencia_pp, 1, true)} puntos, con pocos casos; el alto valor da `
  + `${fijo(AV.diferencia_pp, 1, true)} y menos de 12 meses pasa a ${fijo(M12.diferencia_pp, 1, true)}. La fila 12 sigue `
  + `midiendo por género. En la Parte C 6.2 decía: «${FILA_C[A4.columnas.indexOf('Riesgo')]}».`
