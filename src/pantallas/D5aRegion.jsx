// D5a — región. Barras horizontales en pesos: la pregunta es dónde se concentra la
// exposición, no qué tan alta es la tasa de riesgo (esa va de nota al lado de cada barra).
//
// El título dice lo que el gráfico DIBUJA. Antes afirmaba que la geografía no explica el
// riesgo (una propiedad de la tasa) sobre un gráfico de exposición, y ninguna barra llevaba
// énfasis: el lector no sabía dónde mirar y el dibujo no sostenía la frase. Ahora el título
// es la concentración —que es lo que las barras muestran y lo que se puede accionar— con la
// barra más alta destacada, y la planitud de la tasa baja a la bajada, que es su lugar.
// "Solo online" no tiene región asignable: va aparte, bajo línea divisoria, para que su
// tasa no infle el rango visible de las 5 regiones reales y desmienta el título.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, millones, pesos, pct, porDimension, topeExposicionPar, dims } from '../agregacion.js'

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

  // Total del universo de las 5 regiones (excluye Solo online): mismo denominador que la
  // nota de cada barra, para que el encabezado de la columna y las notas midan lo mismo y
  // no se confunda con el porcentaje del titulo (que es participacion en pesos, otra cosa).
  const totalesReg = reales.reduce((s, { c }) => ({ n: s.n + c.n, nr: s.nr + c.nr }), { n: 0, nr: 0 })
  const tasaGeneral = totalesReg.n ? (100 * totalesReg.nr) / totalesReg.n : null

  const datos = reales
    .slice()
    .sort((a, b) => b.c.ar - a.c.ar)
    .map(({ c, i }) => ({
      etiqueta: dims.region[i],
      valor: c.ar,
      nota: c.n ? `${pct((100 * c.nr) / c.n)} en riesgo` : '—',
      idxOriginal: i,
    }))
    .map((d, k) => ({ ...d, enfasis: k === 0 }))

  const totalReal = datos.reduce((s, d) => s + d.valor, 0)
  const top = datos[0]
  const pesoTop = top && totalReal ? (100 * top.valor) / totalReal : null

  const online = r[onlineIdx]
  const onlineTasaTxt = online.n ? `${pct((100 * online.nr) / online.n)} en riesgo` : 'sin clientes en riesgo calculable'

  const anchoEtiqueta = 92

  return (
    <section className="pant">
      <h1 className="titulo">
        {pesoTop != null
          ? `${top.etiqueta} concentra el ${pct(pesoTop)} de la exposición de las regiones`
          : 'Sin exposición asignable a una región'}
      </h1>
      <p className="bajada">
        {hayTasas
          ? <>La tasa de riesgo casi no cambia entre regiones: va de {pct(minT)} a {pct(maxT)},{' '}
              {amplitudTxt} puntos. Lo que separa a las regiones es el tamaño, no el riesgo.</>
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
                  tope={topeExposicionPar(iCorte, filtro)}
                  anchoEtiqueta={anchoEtiqueta}
                  onBarra={verEnLista ? (i, d) => verEnLista('region', d.idxOriginal) : undefined}
                />
                {/* Encabezado de la columna de notas: sin esto "X % en riesgo" no declara su
                    base y en el corte por defecto coincide en redondeo con el porcentaje del
                    titulo, que mide otra cosa (participacion en pesos). Mismo patron que
                    D3Segmentos. */}
                {tasaGeneral != null && (
                  <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                          textAnchor="end" style={{ textTransform: 'uppercase' }}>
                      tasa de riesgo · general {pct(tasaGeneral)}
                    </text>
                  </svg>
                )}
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
