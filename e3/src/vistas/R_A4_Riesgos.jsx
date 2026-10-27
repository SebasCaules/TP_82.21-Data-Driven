// A4 · ¿Qué riesgos hay y qué se hace con cada uno? (Parte C 6.2 y 6.3; anexo A4 de C3). Respaldo: se
// abre si preguntan por los otros diez riesgos (guion, «Anexos de respaldo»). La vista 6 muestra los tres
// críticos detrás de «Explorar»; acá están los 13.
//
// - Frase: cuántos son críticos sobre el total (D3.legal, J22: el conteo del anexo A4).
// - Pieza: la tabla del anexo, con los tres críticos de la 6.3 marcados (`destacar` de C3). Probabilidad e
//   impacto se escriben enteros (Alta, Media, Baja) en lugar de A, M y B: así la tabla no necesita la
//   leyenda del pie de C3, que va al title (sin pie en pantalla, regla 12 del E2).
// - (Crítica del W3, hallazgo 4a) La fila 12 se lee como la dejó la D 11.2, que modifica la C 6.2, fila 12:
//   en test la brecha por género y la de menos de 12 meses no aparecen y solo el alto valor la repite. La
//   celda del riesgo dice eso, con la diferencia de test (D3.test.segmentos, J21); el title cita las dos.
// Ninguna cifra escrita acá: la tabla es la de C3 y la frase y la fila 12 salen de D3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fijo } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A4')
const L = D3.legal
const NIVEL = { A: 'Alta', M: 'Media', B: 'Baja' }
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const NIVELES = [COL['Prob.'], COL.Impacto]
if (NIVELES.some((j) => j == null)) throw new Error('R_A4: el anexo A4 de C3 no trae «Prob.» o «Impacto»')

const AV = D3.test.segmentos.filas.find((f) => f.id === 'alto_valor')
if (!AV) throw new Error('R_A4: D3.test.segmentos no trae el alto valor')
const RIESGO_12 = `La lista acierta menos en el 20${NBSP}% de mayor facturación (${fijo(AV.diferencia_pp, 1, true)} puntos en test)`
const FILAS = filasDeAnexo(A).map((f) => ({
  ...f,
  celdas: f.celdas.map((c, j) => (NIVELES.includes(j) ? NIVEL[c] ?? c
    : j === COL.Riesgo && f.celdas[COL['#']] === '12' ? RIESGO_12 : c)),
  ...(f.celdas[COL['#']] === '12' ? { title: `Riesgo 12, como lo deja la Parte D 11.2: en test la brecha por género `
    + 'no aparece y menos de 12 meses pasa a positivo; solo el alto valor la repite. La fila 12 sigue midiendo por '
    + 'género. En la Parte C 6.2 decía: «La lista acierta menos en mujeres, en alto valor y con menos de 12 meses».' }
    : {}),
}))
if (!FILAS.some((f) => f.celdas[COL.Riesgo] === RIESGO_12)) throw new Error('R_A4: el anexo A4 de C3 no trae la fila 12')
const COLUMNAS = columnasDeAnexo(A, {
  [COL['#']]: { alinear: 'izq' },
  [COL['Prob.']]: { titulo: 'Probab.' },
})

export const meta = { id: 'A4' }

export default function RA4Riesgos() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra4"
      frase="Cada riesgo y qué se hace con él; en azul, los críticos de la C 6.3"
      cifra={`${entero(L.riesgos_criticos)} críticos de ${entero(L.riesgos)}`}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${A.fuente} · D 11.2 · registro ${A.ids.join(', ')}, J21, J22`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={COLUMNAS} filas={FILAS} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}
