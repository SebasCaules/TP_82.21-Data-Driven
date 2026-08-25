// D1 — la exposición contra las dos bases posibles. Dos barras segmentadas desde cero
// (regla 4), una por base (el gasto anual estimado y lo histórico acumulado), con el
// tramo en riesgo en el único color de énfasis y el resto con trama (regla 18, A-1):
// ninguna lectura depende solo del color. El denominador anualizado se nombra siempre
// "gasto anual estimado", nunca "lo que la base factura por año": no es un número de
// ventas real, es facturación dividida por años de antigüedad (capa a del protocolo).

import { Lienzo, BarraTramos } from '../graficos.jsx'
import { pesos, millones, pct } from '../agregacion.js'

export default function D1({ info }) {
  const pctAnual = info.pct
  const pctHist = info.facturacion ? (100 * info.facturacionRiesgo) / info.facturacion : 0

  const tramosAnual = [
    { etiqueta: 'Exposición (en riesgo)', valor: info.exposicion, enfasis: true },
    { etiqueta: 'Resto del gasto estimado', valor: Math.max(0, info.baseAnualizada - info.exposicion) },
  ]
  const tramosHist = [
    { etiqueta: 'Facturación en riesgo', valor: info.facturacionRiesgo, enfasis: true },
    { etiqueta: 'Resto facturado', valor: Math.max(0, info.facturacion - info.facturacionRiesgo) },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        No es un mal año: el {pct(pctHist)} de todo lo facturado desde 2022 está en las
        mismas manos
      </h1>
      <p className="bajada">
        El gasto anual estimado de la base es ARS {millones(info.baseAnualizada)}. Lo
        facturado desde 2022, ARS {millones(info.facturacion)}.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column' }}>
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Exposición sobre gasto anual estimado
            <b>{pct(pctAnual)}</b>
          </div>
          <Lienzo>
            {({ w, h }) => (
              <BarraTramos tramos={tramosAnual} w={w} h={h} formato={pesos} />
            )}
          </Lienzo>
        </div>
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Facturación en riesgo sobre histórico acumulado
            <b>{pct(pctHist)}</b>
          </div>
          <Lienzo>
            {({ w, h }) => (
              <BarraTramos tramos={tramosHist} w={w} h={h} formato={pesos} />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
