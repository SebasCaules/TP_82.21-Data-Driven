// A3 · ¿Qué supuesto mueve el ROI? (Parte B 3.5 y Parte D 11.2; anexo A3 de C3). Respaldo: se abre si
// preguntan si algún supuesto cambia el veredicto (guion, «Anexos de respaldo»).
//
// - Frase: ningún supuesto, movido solo, lleva el ROI a 0; la cifra es el mejor caso de la regla, la fila
//   del tipo de cambio de 2022 que C3 marca (`destacar`).
// - Pieza: la tabla del anexo (B 3.5), con la base y el tipo de cambio de 2022 marcados. Al final, una
//   fila con lo que midió la etapa 4: el ROI con el desempeño del test, en la lista de 500 contactables
//   (D3.test.roi_b_3_4, J12; Parte D 11.2). Es un supuesto más, el del desempeño, medido en lugar de
//   estimado, y tampoco llega a 0.
// - El pie de C3 (ROI a un año, la regla con descuento) entra en la frase con el descuento de D3; el resto,
//   al title (sin pie en pantalla, regla 12 del E2).
// Ninguna cifra escrita acá: la tabla es la de C3, la fila del test y el descuento salen de D3.

import { C3 } from '../contenido_e3.js'
import { D3 } from '../datos_e3.js'
import { entero, pct, pctDirecto } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { TablaSvg, TarjetaRespaldo, columnasDeAnexo, filasDeAnexo } from '../Respaldo.jsx'

const A = C3.ANEXOS.find((a) => a.n === 'A3')
const T = D3.test
const COL = Object.fromEntries(A.columnas.map((c, j) => [c, j]))
const fila = (id) => T.roi_b_3_4.find((f) => f.fila === id)
const MODELO = fila('modelo_sobre_la_regla')
const REGLA = fila('regla_sin_modelo')
if (!MODELO || !REGLA) throw new Error('R_A3: D3.test.roi_b_3_4 no trae las filas del modelo y de la regla')

// La fila del test, en las columnas del anexo.
const TEST = A.columnas.map(() => '')
TEST[COL.Variable] = 'Desempeño medido en test'
TEST[COL.Escenario] = `lista de ${entero(D3.lista.elegida.largo_mes)} contactables, etapa 4`
TEST[COL['ROI modelo sobre la regla']] = pctDirecto(MODELO.contactables.roi_pct, 2)
TEST[COL['ROI regla sin modelo']] = pctDirecto(REGLA.contactables.roi_pct, 2)

const FILAS = [
  ...filasDeAnexo(A),
  { celdas: TEST, title: `Parte D 11.2 · registro J12: con el test, la regla en la lista de ` +
      `${D3.lista.elegida.largo_mes} contactables deja ${pctDirecto(REGLA.contactables.roi_pct, 2)} y el modelo ` +
      `sobre la regla ${pctDirecto(MODELO.contactables.roi_pct, 2)}; ninguno recupera el costo en el año.` },
]
// La fila marcada que no es la base (la primera): el tipo de cambio de 2022, el que más mueve el ROI.
const MEJOR = A.filas[A.destacar.find((i) => i !== 0)]
if (!MEJOR) throw new Error('R_A3: el anexo A3 de C3 no marca la fila que más mueve el ROI')

export const meta = { id: 'A3' }

export default function RA3Sensibilidad() {
  const k = useEscalaTexto()
  return (
    <TarjetaRespaldo
      clase="ra3"
      frase={`ROI a un año, la regla con ${pct(D3.economia.parametros.descuento, 0)} de descuento: ningún supuesto, movido solo, llega a 0`}
      cifra={`mejor caso, ${MEJOR[COL['ROI regla sin modelo']]}`}
      title={`${plano(A.titulo)}. ${plano(A.pie ?? '')} Fuente: ${A.fuente} y D 11.2 · registro ${A.ids.join(', ')}, J12`}
      dibujo={({ w, h }) => (
        <TablaSvg w={w} h={h} k={k} columnas={columnasDeAnexo(A)} filas={FILAS} etiqueta={plano(A.titulo)} />
      )}
    />
  )
}
