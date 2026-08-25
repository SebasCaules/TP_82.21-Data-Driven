// D3 — dónde está la plata contra dónde está el riesgo. Barras horizontales por segmento
// RFM ordenadas por EXPOSICIÓN (no por tasa): la pregunta es dónde conviene gastar el
// presupuesto, y eso lo define la exposición en pesos. La tasa de riesgo va de nota al
// lado de cada barra, nunca como largo de barra ni como "pérdida esperada" (no hay
// ninguna probabilidad aplicada).

import { Lienzo, BarrasH } from '../graficos.jsx'
import { millones, pesos, pct, porDimension, dims } from '../agregacion.js'

export default function D3({ iCorte, filtro, info, verEnLista }) {
  const r = porDimension(iCorte, 'rfm', filtro)
  const promedio = info.clientes ? (100 * info.enRiesgo) / info.clientes : 0

  const campeonesIdx = dims.rfm.indexOf('Campeones')
  const enRiesgoIdx = dims.rfm.indexOf('En riesgo')
  const campeones = r[campeonesIdx]
  const enRiesgo = r[enRiesgoIdx]

  const orden = r
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c.ar - a.c.ar)

  const datos = orden.map(({ c, i }) => ({
    etiqueta: dims.rfm[i],
    valor: c.ar,
    nota: `${c.n ? pct((100 * c.nr) / c.n) : '—'} en riesgo`,
    enfasis: i === campeonesIdx,
    _i: i,
  }))

  const pctFacturacion = info.facturacion ? (100 * campeones.f) / info.facturacion : 0
  const pctEnRiesgo = enRiesgo.n ? (100 * enRiesgo.nr) / enRiesgo.n : 0

  return (
    <section className="pant">
      <h1 className="titulo">
        El riesgo no está donde está la plata: Campeones concentra ARS {millones(campeones.f)} de
        los ARS {millones(info.facturacion)} históricos ({pct(pctFacturacion)}) y aporta ARS{' '}
        {millones(campeones.ar)} de los ARS {millones(info.exposicion)} de exposición
      </h1>
      <p className="bajada">
        El segmento En riesgo ({pct(pctEnRiesgo)}) es circular por construcción: la R de RFM
        es la misma recency que define el target. Promedio general de la base: {pct(promedio)}.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => {
            const anchoEtiqueta = 106
            const notaAncho = 100
            const padTop = 20
            const padBot = 4
            const paso = (h - padTop - padBot) / datos.length
            return (
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarrasH
                  datos={datos} w={w} h={h}
                  formato={pesos}
                  tituloEje="Exposición anual (ARS)"
                  anchoEtiqueta={anchoEtiqueta} notaAncho={notaAncho}
                />
                <div style={{ position: 'absolute', inset: 0 }}>
                  {datos.map((d, i) => (
                    <button
                      key={d.etiqueta}
                      type="button"
                      aria-label={`Ver ${d.etiqueta} en la lista de Marketing`}
                      onClick={() => verEnLista('rfm', d._i)}
                      style={{
                        position: 'absolute', left: 0, top: padTop + i * paso,
                        width: '100%', height: paso,
                        background: 'transparent', border: 'none', padding: 0,
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          }}
        </Lienzo>
      </div>
    </section>
  )
}
