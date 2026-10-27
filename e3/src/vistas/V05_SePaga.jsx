// V05 · ¿Se paga? (Parte B 3.2 a 3.6; diapositivas 8 y 9 de C3). La vista de muestra del armazón
// (27/10, W1), al estilo de V04 del E2: banda de cifras con la tarjeta de decisión a la derecha y un
// gráfico a todo el ancho debajo.
//
// - Banda: lo que el modelo suma por año y lo que cuesta de más (G40 y C28), el ROI del modelo sobre
//   la regla a un año, que es la cifra que responde la pregunta (G40) y la única al tamaño máximo
//   (regla 13 H1 del E2), y la tasa de éxito con la que se pagaría la regla (G43) contra la observada
//   (G31). Tres tarjetas: con cuatro, a 1152 × 640 las cifras no entran (10.400 va en la frase de la
//   primera y el gráfico muestra la diferencia entre los dos costos).
// - Decisión: el veredicto de C3 (diapositiva 9), solo la frase corta en negrita; el resto, al title.
//   Rótulos de la banda cortos para que entren en una línea a 1152 × 640 (el largo, al title).
// - Gráfico: el costo del año 1 (con modelo y solo la regla) contra el beneficio anual de la regla, en
//   el mismo eje, con el presupuesto marcado (G38, G39). La barra que hay que mirar, el beneficio, en
//   --acc; los costos en gris (regla 12 del E2).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).
// El simulador de la tasa de éxito (detrás de «Explorar») queda para W2.

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, fijo, pct, pctDirecto, usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTextoLogica } from '../zoom.js'
import { decision } from '../decisiones.js'

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
const REGLA = E.observada.regla_usd
const COSTO_REGLA = E.costos.regla_sin_modelo.total_anio_1_usd

// «USD 5,38» con la moneda un escalón más chica, como los montos del E2 (ValorMonto, .par-unidad).
function Monto({ v, d = 0, sec = false }) {
  const [moneda, num] = usd(v, d).split(' ')
  return (
    <span className={`par-val tabular e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{moneda}{' '}</span>{num}
    </span>
  )
}

// Montos de las barras: centavos solo debajo de mil (USD 299,49; USD 30.660).
const monto = (v) => usd(v, v < 1000 ? 2 : 0)

export const meta = { id: 'V05', dc: 'B-ECO' }

export default function V05SePaga() {
  const k = useEscalaTextoLogica()
  const tope = Math.round((3 * 80 + 56) * k)
  const barras = [
    { etiqueta: 'Costo del año 1, con modelo', valor: E.costos.con_modelo.total_anio_1_usd },
    { etiqueta: 'Costo del año 1, solo la regla', valor: COSTO_REGLA },
    { etiqueta: 'Beneficio anual de la regla', valor: REGLA, enfasis: true, anchoMin: 3 },
  ]
  return (
    <section className="pant v05">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Lo que suma el modelo. ${plano(D8.cadena)} ${plano(D8.filtro)}`}>
          <span className="kpi-lbl"><span>Suma el modelo</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Monto v={SUMA} d={2} sec /></div>
          </div>
          <p className="e2-linea">{`por año; cuesta ${usd(CUESTA)} más`}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 4' }}
             title={`ROI del modelo sobre la regla. ${plano(D9.callouts[0].titulo)}`}>
          <span className="kpi-lbl"><span>ROI sobre la regla</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <span className="par-val tabular e2-cifra">{pctDirecto(ROI, 2)}</span>
            </div>
          </div>
          <p className="e2-linea">a un año, escenario esperado</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }} title={`Tasa de éxito para pagar la regla. ${plano(D9.callouts[1].texto)}`}>
          <span className="kpi-lbl"><span>Para pagar la regla</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <span className="par-val tabular e2-cifra sec">{pct(S_PAGA, 1)}</span>
            </div>
          </div>
          <p className="e2-linea">{`tendría que volver; hoy${NBSP}se${NBSP}ve${NBSP}${pct(S_OBS, 2)}`}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <span className="kpi-lbl frase">
          <span>{D9.pie_figura.replace(/\.$/, '')}</span>
          <b className="tabular">{`${monto(REGLA)} por año contra ${monto(COSTO_REGLA)}`}</b>
        </span>
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope, marginTop: 'clamp(6px, 1.6vh, 20px)',
                      display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH
                datos={barras} w={w} h={h}
                formato={monto}
                formatoEje={(v) => fijo(v, 0)}
                anchoEtiqueta={Math.round(220 * k)}
                tituloEje="Dólares"
                referencia={{ valor: E.costos.presupuesto_usd, etiqueta: `presupuesto ${monto(E.costos.presupuesto_usd)}` }}
              />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
