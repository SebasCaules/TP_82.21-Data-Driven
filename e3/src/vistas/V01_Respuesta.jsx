// V01 · ¿Conviene anticipar a quien deja de comprar? (diapositiva 2 de C3; W2.01, 27/10). La respuesta
// del tablero entero, con la forma de V05: banda de cifras con la tarjeta de decisión a la derecha y un
// gráfico a todo el ancho debajo.
//
// - Banda: las tres Partes, en el orden del riel (A técnica, B económica, C legal). El puntaje técnico
//   (F16, D3.tecnica), el ROI del modelo sobre la regla a un año (G40, D3.economia), que es la cifra
//   que decide que la lista salga sin modelo y la única al tamaño máximo (regla 13 H1 del E2), y el
//   puntaje legal (H40). D3 no trae la Parte C: el 2,0 sale de la tarjeta «Legal» de la diapositiva 2
//   de C3, como texto. Debajo de cada cifra, el veredicto de la tarjeta de C3; el resto de la tarjeta
//   (el límite técnico, las seis acciones, «ni la regla sola recupera su costo») va al title.
//   Anchos 2 / 3 / 2, como V05: con 3 / 4 / 3 el −99,95 % no entra en la central a 1366 × 768.
// - Gráfico: la cuarta tarjeta de la diapositiva 2, la tasa de éxito (G31), que no entra en la banda.
//   `PuntosIC` con dos filas: la compra a 7 días tras un envío cerca del umbral, con su rango al 95 %
//   (lo que se ve, sin grupo de control), y lo que vuelve por el contacto, que no está medido y que mide
//   el piloto (fila vacía, la pista punteada de PuntosIC). Es lo que une la banda con la decisión.
// - Decisión: «D-PRO · propuesta» de decisiones.js (D6 del registro de decisiones de los hitos; la
//   comparte la vista 9) y la respuesta en una línea de la tabla de la historia (PLAN.md, fila 1),
//   ≤ 60 caracteres; la decisión completa de C3 (lista de 500 por mes, piloto de tres meses con grupo de
//   control) va al title. C3 no trae una frase corta: la de la tabla queda acá hasta que contenido.py
//   la exporte (W4).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).

import { Lienzo, PuntosIC } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, pct, pctDirecto } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'

const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)
// Las cuatro tarjetas de la diapositiva 2, por su área; si el texto cambia, por su orden.
const AREAS = ['Técnica', 'Legal', 'Económica', 'Tasa de éxito']
const [TEC, LEG, ECO, EXI] = AREAS.map((a, i) => D2.tarjetas.find((t) => t.area === a) ?? D2.tarjetas[i])

const T = D3.tecnica
const E = D3.economia
const ROI = E.observada.modelo_roi_pct
const S = E.parametros.s_observada
const [S_LO, S_HI] = E.parametros.s_ic95

const SOBRE_TEC = `/${fijo(T.escala[T.escala.length - 1].hasta, 0)}`
// «ROI −99,95 % a un año» (escala de la tarjeta Económica de C3) sin la cifra: «ROI a un año», el
// horizonte pegado a la cifra. (W2) «ROI anual sobre la regla» parte en dos renglones bajo la cifra
// grande y agranda la banda a 1366 × 768 y 1536 × 864; «sobre la regla» queda en el title.
const ROI_A = plano(ECO.escala).replace(/\s*[−-]?[\d.,]+\s*%/, '')

// La decisión: la frase corta de la tabla de la historia en la tarjeta; la de C3, sin «Decisión.», al
// title.
const DECISION = decision('D-PRO', {
  llano_corto: 'La lista sale con la regla; el piloto mide',
  llano: sinCortes(plano(D2.decision).replace(/^Decisión\.\s*/, '')),
  decision: plano(D2.titulo),
})

// Escala del gráfico: dos decimales, como la tasa en la Parte B; el cero, sin decimales.
const tasa2 = (v) => (v === 0 ? `${fijo(v, 0)}${NBSP}%` : pct(v, 2))

export const meta = { id: 'V01', dc: 'D-PRO' }

export default function V01Respuesta() {
  const k = useEscalaTexto()
  // Dos filas de 80 más el eje, como las barras de V05; el gráfico va centrado en el alto libre de su
  // tarjeta (regla 13 del E2), así dos filas no quedan arriba con la tarjeta vacía debajo.
  const tope = Math.round((2 * 80 + 56) * k)
  const filas = [
    {
      etiqueta: 'Compran a 7 días del envío', valor: S, ic: [S_LO, S_HI], enfasis: true,
      // (W2) La población, para no confundirla con la tasa sobre todos los envíos (C16). Más corta que la
      // nota de la fila vacía: PuntosIC reserva la columna de notas por la más larga y no reserva el
      // rótulo del valor, que pisaba esta nota cuando era la más larga.
      nota: `${entero(E.parametros.compras_7d)} de ${entero(E.parametros.envios)} envíos cerca del umbral`,
    },
    { etiqueta: 'Vuelven por el contacto', vacio: true, nota: 'lo mide el piloto, con grupo de control' },
  ]
  return (
    <section className="pant v01">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Puntaje técnico: ${fijo(T.promedio, 2)}${SOBRE_TEC}, ${TEC.escala}. ${plano(TEC.texto)}`}>
          <span className="kpi-lbl"><span>{TEC.area}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={fijo(T.promedio, 2)} unidad={SOBRE_TEC} sec /></div>
          </div>
          <p className="e2-linea">{TEC.escala}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`ROI del modelo sobre la regla a un año, escenario esperado: ${pctDirecto(ROI, 2)}. ${plano(ECO.texto)}`}>
          <span className="kpi-lbl"><span>{ECO.area}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={pctDirecto(ROI, 2)} /></div>
          </div>
          <p className="e2-linea">{`${plano(ECO.valor).toLowerCase()}: ${ROI_A}`}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Puntaje legal: ${plano(LEG.valor)}, ${LEG.escala}. ${plano(LEG.texto)}`}>
          <span className="kpi-lbl"><span>{LEG.area}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={LEG.valor} sec /></div>
          </div>
          <p className="e2-linea">{LEG.escala}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}
           title={`${EXI.area} ${pct(S, 2)}: ${entero(E.parametros.compras_7d)} compras a 7 días en `
             + `${entero(E.parametros.envios)} envíos a clientes cerca del umbral, rango al 95 % de `
             + `${pct(S_LO, 2)} a ${pct(S_HI, 2)}, ${EXI.escala}. ${plano(EXI.texto)}`}>
        <span className="kpi-lbl frase">
          <span>{`${EXI.area}, con su rango probable al 95${NBSP}%`}</span>
          <b>{plano(EXI.texto).replace(/\.$/, '')}</b>
        </span>
        <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ flex: '0 1 auto', height: tope, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Lienzo className="lienzo">
              {({ w, h }) => (
                <PuntosIC
                  datos={filas} w={w} h={h}
                  formato={tasa2}
                  tituloEje="Compra a 7 días (%)"
                  anchoEtiqueta={Math.round(200 * k)}
                />
              )}
            </Lienzo>
          </div>
        </div>
      </div>
    </section>
  )
}
