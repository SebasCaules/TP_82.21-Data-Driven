// A2 · ¿Dónde se corta la lista? (Parte C 7.2; anexo A2 de C3). Respaldo: se abre si preguntan por qué
// 500 y no 700 u 800 (guion, «Anexos de respaldo»).
//
// - Frase: la lista que sale y su precisión (la fila marcada de C3, la regla con 500 contactables).
// - Pieza: la tabla del anexo, cada forma de cortar la lista en los cortes de validación con su precisión,
//   su recall, su valor por año y si se puede mandar.
// - (30/10, sin «Explorar») Sale el selector de filtro y largo que iba detrás de «Explorar»: la tabla ya trae cada
//   forma de cortar la lista con su precisión, y la comparación de la regla con la logística en la lista que sale
//   está en la vista 4 y en el anexo A7.
// - (Crítica del W3, hallazgo 6) Las filas de C3 que no nombran el método son de la logística ajustada:
//   la celda lo dice («Logística, …»). «Lugares» y no «contactos»: la lista sin filtro incluye 483 que no
//   se pueden contactar.
// Ninguna cifra escrita acá: la tabla es la de C3 y lo que se explora sale de D3, sin restas en el
// navegador (la diferencia de aciertos viene calculada en build_e3.py).

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A2')
const L = D3.lista
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const SALE = A.filas[A.destacar[0]]
// La celda del umbral nombra el método cuando C3 no lo nombra (esas filas son de la logística ajustada).
const conMetodo = (c) => (/^(Regla|Práctica)/.test(c) ? c : `Logística, ${c.charAt(0).toLowerCase()}${c.slice(1)}`)
const FILAS_TABLA = filasDeAnexo(A).map((f) => ({
  ...f, celdas: f.celdas.map((c, j) => (j === COL.Umbral ? conMetodo(c) : c)),
}))

export const meta = { id: 'A2' }

export default function RA2Umbrales() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra2"
      frase={`Cada forma de cortar la lista, en los ${L.validacion.cortes} cortes de validación`}
      cifra={`la que sale: ${SALE[COL['Precisión']]}`}
      title={`${plano(A.titulo)}. Fuente: ${A.fuente} · registro ${A.ids.join(', ')}`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={columnasDeAnexo(A)} filas={FILAS_TABLA} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}
