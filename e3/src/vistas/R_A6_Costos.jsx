// A6 · ¿Cuánto cuesta el año 1? (Parte B 3.2; anexo A6 de C3). Respaldo: se abre si preguntan de dónde
// salen los USD 30.660 (guion, «Anexos de respaldo»).
//
// - Frase: el costo del año 1 con modelo y con la regla sola (D3.economia.costos, G38 y G39), que son
//   las filas marcadas de la tabla.
// - Pieza: la tabla del anexo, cada componente con modelo y con la regla sola y su período; marcadas, la
//   inversión inicial y el total del año 1 (`destacar` de C3). El pie de C3 (licencias en 0 y lo que
//   queda fuera del presupuesto) va al title de la tarjeta: sin pie en pantalla (regla 12 del E2).
// - (Crítica del W3, hallazgo 12) Sin los códigos de las acciones legales («(L3 a L5)»), como la vista 7
//   (regla 13 H13 del E2); quedan en el title.
// Ninguna cifra escrita acá: la tabla es la de C3 y la frase sale de D3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A6')
const COSTOS = D3.economia.costos
const sinL = (c) => c.replace(/\s*\(L\d+(?:\s*(?:a|y|,)\s*L\d+)*\)/g, '')
const FILAS = filasDeAnexo(A).map((f) => ({ ...f, celdas: f.celdas.map(sinL) }))

export const meta = { id: 'A6' }

export default function RA6Costos() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra6"
      frase="Costo del año 1 por componente, con modelo y con la regla sola"
      cifra={`${usd(COSTOS.con_modelo.total_anio_1_usd)} y ${usd(COSTOS.regla_sin_modelo.total_anio_1_usd)}`}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${A.fuente} · registro ${A.ids.join(', ')}`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={columnasDeAnexo(A)} filas={FILAS}
                  etiqueta={plano(A.titulo)} />
      )}
    />
  )
}
