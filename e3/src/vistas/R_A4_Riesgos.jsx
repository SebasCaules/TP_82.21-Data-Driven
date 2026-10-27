// A4 · ¿Qué riesgos hay y qué se hace con cada uno? (Parte C 6.2 y 6.3; anexo A4 de C3). Respaldo: se
// abre si preguntan por los otros diez riesgos (guion, «Anexos de respaldo»). La vista 6 muestra los tres
// críticos detrás de «Explorar»; acá están los 13.
//
// - Frase: cuántos son críticos sobre el total (D3.legal, J22: el conteo del anexo A4).
// - Pieza: la tabla del anexo, con los tres críticos de la 6.3 marcados (`destacar` de C3). Probabilidad e
//   impacto se escriben enteros (Alta, Media, Baja) en lugar de A, M y B: así la tabla no necesita la
//   leyenda del pie de C3, que va al title (sin pie en pantalla, regla 12 del E2).
// Ninguna cifra escrita acá: la tabla es la de C3 y la frase sale de D3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { entero } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A4')
const L = D3.legal
const NIVEL = { A: 'Alta', M: 'Media', B: 'Baja' }
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const NIVELES = [COL['Prob.'], COL.Impacto]
if (NIVELES.some((j) => j == null)) throw new Error('R_A4: el anexo A4 de C3 no trae «Prob.» o «Impacto»')

const FILAS = filasDeAnexo(A).map((f) => ({
  ...f,
  celdas: f.celdas.map((c, j) => (NIVELES.includes(j) ? NIVEL[c] ?? c : c)),
}))
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
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${A.fuente} · registro ${A.ids.join(', ')}, J22`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={COLUMNAS} filas={FILAS} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}
