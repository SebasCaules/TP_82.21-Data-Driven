// V05 · ¿Se paga? (Parte B 3.2 a 3.6; diapositivas 8 y 9 de C3). La vista de muestra del armazón
// (27/10, W1), al estilo de V04 del E2: banda de cifras con la tarjeta de decisión a la derecha y un
// gráfico a todo el ancho debajo.
//
// - Banda: lo que el modelo suma por año y lo que cuesta de más (G40 y C28), el ROI del modelo sobre
//   la regla a un año, que es la cifra que responde la pregunta (G40) y la única al tamaño máximo
//   (regla 13 H1 del E2), y la tasa de éxito con la que se pagaría la regla (G43) contra la observada
//   (G31). Tres tarjetas: con cuatro, a 1152 × 640 las cifras no entran (10.400 va en la frase de la
//   primera y el gráfico muestra la diferencia entre los dos costos). (W2.0) Con la letra ×k, anchos
//   2 / 3 / 2: con 3 / 4 / 3, a 1366 × 768 el −99,95 % no entra en la central.
// - Decisión: el veredicto de C3 (diapositiva 9), solo la frase corta en negrita; el resto, al title.
//   Rótulos de la banda cortos para que entren en una línea de 1152 × 640 a 1920 × 1080 con la letra
//   ×k; la más angosta es 1366 × 768 (el largo, al title).
// - Gráfico: el costo del año 1 (con modelo y solo la regla) contra el beneficio anual de la regla, en
//   el mismo eje, con el presupuesto marcado (G38, G39). La barra que hay que mirar, el beneficio, en
//   --acc; los costos en gris (regla 12 del E2).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).
// (W3) La tarjeta del gráfico vive en V05_Simulador.jsx (TarjetaCostoBeneficio): el mismo gráfico al
// llegar y, detrás de «Explorar», el simulador de la tasa de éxito sobre la grilla de D3.

import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, pct, pctDirecto, usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { TarjetaCostoBeneficio } from './V05_Simulador.jsx'

const E = D3.economia
const D8 = C3.DIAPOSITIVAS.find((d) => d.n === 8)
const D9 = C3.DIAPOSITIVAS.find((d) => d.n === 9)

// La decisión de la diapositiva 9: «**No viable tal como está planteado.** Ningún supuesto…». La parte en
// negrita es la frase corta de la tarjeta (≤ 60 caracteres, regla 11 del E2); el resto va al title.
// El id y el estado («B-ECO · no viable») salen del vocabulario único de decisiones.js.
const [, NEGRITA = '', RESTO = ''] = D9.decision.match(/^\*\*(.+?)\*\*\s*(.*)$/) ?? []
const DECISION = decision('B-ECO', {
  llano_corto: NEGRITA.replace(/\.$/, ''),
  llano: plano(D9.decision),
  decision: NEGRITA.replace(/\.$/, ''),
  justificacion: RESTO,
})

const SUMA = E.observada.modelo_usd
const CUESTA = E.costos.incremental_usd
const ROI = E.observada.modelo_roi_pct
const S_PAGA = E.umbral.s_equilibrio_con_descuento
const S_OBS = E.parametros.s_observada

// La moneda y el «%» van un escalón más chicos (Cifra, e3/src/cifra.jsx), como los montos del E2
// (ValorMonto, .par-unidad): con la letra ×k, el −99,95 % entero no entra en la tarjeta central desde
// 1366 × 768 (W2.0).

export const meta = { id: 'V05', dc: 'B-ECO' }

export default function V05SePaga() {
  return (
    <section className="pant v05">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Lo que suma el modelo. ${plano(D8.cadena)} ${plano(D8.filtro)}`}>
          <span className="kpi-lbl"><span>Suma el modelo</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={usd(SUMA, 2)} sec /></div>
          </div>
          <p className="e2-linea">{`por año; cuesta ${usd(CUESTA)} más`}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`ROI del modelo sobre la regla. ${plano(D9.callouts[0].titulo)}`}>
          <span className="kpi-lbl"><span>ROI sobre la regla</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra texto={pctDirecto(ROI, 2)} />
            </div>
          </div>
          <p className="e2-linea">a un año, escenario esperado</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={`Tasa de éxito para pagar la regla. ${plano(D9.callouts[1].texto)}`}>
          <span className="kpi-lbl"><span>Éxito necesario</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra texto={pct(S_PAGA, 1)} sec />
            </div>
          </div>
          <p className="e2-linea">{`tendría que volver; hoy${NBSP}se${NBSP}ve${NBSP}${pct(S_OBS, 2)}`}</p>
        </div>
      </Banda>

      {/* (W3) La tarjeta del gráfico con el simulador de la tasa de éxito detrás de «Explorar»: al llegar
          es el mismo gráfico de antes (V05_Simulador.jsx). */}
      <TarjetaCostoBeneficio />
    </section>
  )
}
