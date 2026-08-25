// D5a — región. Barras horizontales en pesos: la pregunta es dónde se concentra la
// exposición, no qué tan alta es la tasa de riesgo (esa va de nota al lado de cada barra).
// "Solo online" no tiene región asignable: va aparte, bajo línea divisoria, para que su
// tasa no infle el rango visible de las 5 regiones reales y desmienta el título.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, pesos, pct, porDimension, dims } from '../agregacion.js'

export default function D5a({ iCorte, filtro }) {
  const r = porDimension(iCorte, 'region', filtro)
  const onlineIdx = dims.region.indexOf('Solo online')

  const reales = r.map((c, i) => ({ c, i })).filter(({ i }) => i !== onlineIdx)
  const tasas = reales.map(({ c }) => (c.n ? (100 * c.nr) / c.n : 0))
  const amplitud = Math.max(...tasas) - Math.min(...tasas)
  const amplitudTxt = amplitud.toFixed(1).replace('.', ',')

  const datos = reales
    .slice()
    .sort((a, b) => b.c.ar - a.c.ar)
    .map(({ c, i }) => ({
      etiqueta: dims.region[i],
      valor: c.ar,
      nota: c.n ? `${pct((100 * c.nr) / c.n)} en riesgo` : '—',
      enfasis: false,
    }))

  const online = r[onlineIdx]
  const onlineTasa = online.n ? (100 * online.nr) / online.n : 0

  return (
    <section className="pant">
      <h1 className="titulo">
        La geografía no explica el riesgo: {amplitudTxt} puntos entre la región más alta y la más baja
      </h1>
      <p className="bajada">
        Entre las 5 regiones la tasa de riesgo va de {pct(Math.min(...tasas))} a{' '}
        {pct(Math.max(...tasas))}, una amplitud de {amplitudTxt} puntos porcentuales.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={pesos}
              tituloEje="Exposición anual, por región"
              anchoEtiqueta={92} notaAncho={112}
            />
          )}
        </Lienzo>
        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <div className="kpi-lbl">Solo online</div>
          <div className="kpi-sub">
            sin región asignable · {entero(online.n)} clientes · {pct(onlineTasa)} en riesgo
          </div>
        </div>
      </div>
    </section>
  )
}
