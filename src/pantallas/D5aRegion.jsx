// D5a — región. Barras horizontales en pesos: la pregunta es dónde se concentra la
// exposición, no qué tan alta es la tasa de riesgo (esa va de nota al lado de cada barra).
// "Solo online" no tiene región asignable: va aparte, bajo línea divisoria, para que su
// tasa no infle el rango visible de las 5 regiones reales y desmienta el título.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, millones, pesos, pct, porDimension, dims } from '../agregacion.js'

export default function D5a({ iCorte, filtro, verEnLista }) {
  const r = porDimension(iCorte, 'region', filtro)
  const onlineIdx = dims.region.indexOf('Solo online')

  const reales = r.map((c, i) => ({ c, i })).filter(({ i }) => i !== onlineIdx)
  // Amplitud solo sobre regiones con clientes: una región en n=0 no tiene tasa de
  // riesgo (0 % sería falso, no hay base), y su nota ya se muestra como "—".
  const conClientes = reales.filter(({ c }) => c.n > 0)
  const tasas = conClientes.map(({ c }) => Math.round((1000 * c.nr) / c.n) / 10)
  const hayTasas = tasas.length > 0
  const minT = hayTasas ? Math.min(...tasas) : null
  const maxT = hayTasas ? Math.max(...tasas) : null
  const amplitudTxt = hayTasas ? (maxT - minT).toFixed(1).replace('.', ',') : null

  const datos = reales
    .slice()
    .sort((a, b) => b.c.ar - a.c.ar)
    .map(({ c, i }) => ({
      etiqueta: dims.region[i],
      valor: c.ar,
      nota: c.n ? `${pct((100 * c.nr) / c.n)} en riesgo` : '—',
      enfasis: false,
      idxOriginal: i,
    }))

  const totalReal = datos.reduce((s, d) => s + d.valor, 0)
  const top = datos[0]
  const pesoTop = top && totalReal ? (100 * top.valor) / totalReal : null

  const online = r[onlineIdx]
  const onlineTasaTxt = online.n ? `${pct((100 * online.nr) / online.n)} en riesgo` : 'sin clientes en riesgo calculable'

  const anchoEtiqueta = 92

  return (
    <section className="pant">
      <h1 className="titulo">
        {hayTasas
          ? `La geografía no explica el riesgo: ${amplitudTxt} puntos entre la región más alta y la más baja`
          : 'La geografía no explica el riesgo'}
      </h1>
      <p className="bajada">
        {hayTasas
          ? <>Entre las regiones la tasa de riesgo va de {pct(minT)} a {pct(maxT)}.{' '}
              {pesoTop != null && <>{top.etiqueta} concentra {pct(pesoTop)} de la exposición de las regiones.</>}
            </>
          : 'Ninguna región tiene clientes en la base filtrada.'}
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => {
            return (
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarrasH
                  datos={datos} w={w} h={h}
                  formato={pesos} formatoEje={(v) => millones(v, 0)}
                  tituloEje="Exposición anual, por región (ARS)"
                  anchoEtiqueta={anchoEtiqueta}
                  onBarra={verEnLista ? (i, d) => verEnLista('region', d.idxOriginal) : undefined}
                />
              </div>
            )
          }}
        </Lienzo>
        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <div className="kpi-lbl">Solo online</div>
          <div className="kpi-sub">
            sin región asignable · {entero(online.n)} {online.n === 1 ? 'cliente' : 'clientes'} · {onlineTasaTxt}
          </div>
        </div>
      </div>
    </section>
  )
}
