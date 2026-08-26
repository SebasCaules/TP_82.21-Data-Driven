// D3 — dónde está la plata contra dónde está el riesgo. Barras horizontales por segmento
// RFM ordenadas por EXPOSICIÓN (pesos), no por tasa: la tasa va de nota al lado de cada
// barra, nunca como largo de barra ni "pérdida esperada" (no hay probabilidad aplicada).
// Título y referencia general salen de porDimension, no de info: no mezclan bases con filtro.rfm activo.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { millones, pesos, pct, porDimension, dims } from '../agregacion.js'

export default function D3({ iCorte, filtro, info, verEnLista }) {
  const r = porDimension(iCorte, 'rfm', filtro)

  const campeonesIdx = dims.rfm.indexOf('Campeones')
  const enRiesgoIdx = dims.rfm.indexOf('En riesgo')
  const campeones = r[campeonesIdx]
  const enRiesgo = r[enRiesgoIdx]

  // porDimension('rfm', filtro) neutraliza filtro.rfm sobre su propio eje: usar sus
  // propios totales como base del título y del promedio, no info (que sí aplica filtro.rfm
  // y quedaría con un numerador de 7 segmentos contra un denominador de uno solo).
  const tot = r.reduce(
    (s, c) => ({ f: s.f + c.f, ar: s.ar + c.ar, n: s.n + c.n, nr: s.nr + c.nr }),
    { f: 0, ar: 0, n: 0, nr: 0 }
  )
  const promedio = tot.n ? (100 * tot.nr) / tot.n : 0

  const orden = r
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.ar - a.c.ar)

  const datos = orden.map(({ c, i }) => ({
    etiqueta: dims.rfm[i],
    valor: c.ar,
    nota: `${c.n ? pct((100 * c.nr) / c.n) : '—'} en riesgo${i === enRiesgoIdx ? ' (circular)' : ''}`,
    enfasis: i === campeonesIdx,
    _i: i,
  }))

  const pctFacturacion = tot.f ? (100 * campeones.f) / tot.f : 0
  const pctEnRiesgo = enRiesgo.n ? (100 * enRiesgo.nr) / enRiesgo.n : 0
  // Contraste que da título al gráfico: cuánto de lo facturado (no visible en este
  // gráfico, que es solo exposición) contra cuánta exposición aporta el mismo segmento.
  // El monto de exposición de Campeones ya se lee directo en su barra: no se repite.
  const pctExposicionCampeones = tot.ar ? (100 * campeones.ar) / tot.ar : 0

  return (
    <section className="pant">
      <h1 className="titulo">
        El riesgo no está donde está la plata: Campeones concentra {pct(pctFacturacion)} de lo
        facturado y {pct(pctExposicionCampeones)} de la exposición
      </h1>
      <p className="bajada">
        El segmento En riesgo ({pct(pctEnRiesgo)}) es circular por construcción: la R de RFM
        es la misma recency que define el target.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => {
            const anchoEtiqueta = 106
            return (
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarrasH
                  datos={datos} w={w} h={h}
                  formato={pesos} formatoEje={(v) => millones(v, 0)}
                  tituloEje="Exposición anual (ARS)"
                  anchoEtiqueta={anchoEtiqueta}
                  onBarra={verEnLista ? (i, d) => verEnLista('rfm', d._i) : undefined}
                />
                {/* Cabecera de la columna de notas: la tasa es un eje distinto (fracción,
                    no pesos), así que la referencia va como texto, no como ReferenciaV
                    sobre el eje de barras (sería un eje Y secundario encubierto). */}
                <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                        textAnchor="end" style={{ textTransform: 'uppercase' }}>
                    tasa de riesgo · general {pct(promedio)}
                  </text>
                </svg>
              </div>
            )
          }}
        </Lienzo>
      </div>
    </section>
  )
}
