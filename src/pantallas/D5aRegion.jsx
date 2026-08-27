// D5a — región, en dos composiciones al 100 % alineadas: cómo se reparten los CLIENTES y
// cómo se reparte la EXPOSICIÓN, con los cortes conectados. La pregunta del par region/
// categoría es de concentración, y una concentración sin su referencia no se puede juzgar:
// "AMBA concentra el 43,2 %" pesa distinto sabiendo que AMBA es el 41,1 % de la base.
// La inclinación del conector ES la diferencia entre las dos composiciones.
//
// Lo que se pierde respecto de la barra de pesos es la tasa de riesgo y el monto absoluto:
// la tasa baja a la bajada (que es donde vivía su planitud) y las dos bases van escritas al
// lado de cada barra. "Solo online" no tiene región asignable: queda fuera de las dos bases
// y se declara aparte, bajo línea divisoria.

import { Lienzo, BarrasApiladas100, rampa } from '../graficos.jsx'
import { Def } from '../Glosario.jsx'
import { entero, pesos, pct, porDimension, dims } from '../agregacion.js'

export default function D5a({ iCorte, filtro, verEnLista }) {
  const r = porDimension(iCorte, 'region', filtro)
  const onlineIdx = dims.region.indexOf('Solo online')

  const reales = r.map((c, i) => ({ c, i })).filter(({ i }) => i !== onlineIdx)
  // Amplitud solo sobre regiones con clientes: una región en n=0 no tiene tasa de
  // riesgo (0 % sería falso, no hay base).
  const conClientes = reales.filter(({ c }) => c.n > 0)
  const tasas = conClientes.map(({ c }) => Math.round((1000 * c.nr) / c.n) / 10)
  const hayTasas = tasas.length > 0
  const minT = hayTasas ? Math.min(...tasas) : null
  const maxT = hayTasas ? Math.max(...tasas) : null
  const amplitudTxt = hayTasas ? (maxT - minT).toFixed(1).replace('.', ',') : null

  const totalN = reales.reduce((s, { c }) => s + c.n, 0)
  const totalAr = reales.reduce((s, { c }) => s + c.ar, 0)

  // Un solo orden para las dos barras: si cada una se ordenara por lo suyo, el conector
  // dejaría de medir la diferencia y pasaría a medir el reordenamiento.
  const orden = [...reales].sort((a, b) => b.c.ar - a.c.ar)
  const partes = orden.map(({ c, i }, k) => ({
    etiqueta: dims.region[i],
    idx: i,
    n: c.n,
    ar: c.ar,
    pClientes: totalN ? (100 * c.n) / totalN : 0,
    pExposicion: totalAr ? (100 * c.ar) / totalAr : 0,
    ...rampa(k),
  }))

  const segmento = (p, valor, share) => ({
    clave: p.etiqueta, valor, tono: p.tono, tinta: p.tinta, idx: p.idx,
    enfasis: p === partes[0], texto: `${p.etiqueta} ${pct(share)}`,
  })

  const filas = [
    {
      etiqueta: 'Clientes', sub: `base ${entero(totalN)}`,
      segmentos: partes.map((p) => segmento(p, p.n, p.pClientes)),
    },
    {
      etiqueta: 'Exposición', sub: `base ${pesos(totalAr)}`,
      segmentos: partes.map((p) => segmento(p, p.ar, p.pExposicion)),
    },
  ]

  const top = partes[0]
  // El corte que más se mueve: es lo que el conector dibuja, y sin la cifra el lector
  // tiene que estimar una inclinación.
  const mayorDesvio = partes.reduce(
    (m, p) => (Math.abs(p.pExposicion - p.pClientes) > Math.abs(m.pExposicion - m.pClientes) ? p : m),
    partes[0]
  )
  const desvio = mayorDesvio ? Math.abs(mayorDesvio.pExposicion - mayorDesvio.pClientes) : 0
  const parejo = desvio < 3

  return (
    <section className="pant">
      <h1 className="titulo">
        {!top || !totalAr
          ? 'Sin exposición asignable a una región'
          : parejo
            ? `${top.etiqueta} es ${pct(top.pClientes)} de la base y ${pct(top.pExposicion)} de lo expuesto: se reparte parejo`
            : `${top.etiqueta} concentra ${pct(top.pExposicion)} de la exposición con ${pct(top.pClientes)} de los clientes`}
      </h1>
      <p className="bajada">
        {hayTasas
          ? <>La tasa de <Def id="en-riesgo">riesgo</Def> casi no cambia entre regiones: va
              de {pct(minT)} a {pct(maxT)}, {amplitudTxt} puntos. El corte que más se mueve
              entre las dos barras es {mayorDesvio.etiqueta}:{' '}
              {desvio.toFixed(1).replace('.', ',')} puntos.</>
          : 'Ninguna región tiene clientes en la base filtrada.'}
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} w={w} h={h}
              anchoEtiqueta={106}
              conectores
              tituloEje="Participación de cada región en el total"
              rotuloResto="Tramos sin lugar para el rótulo (clientes → exposición):"
              textoResto={(it) => `${it.clave} ${pct(it.pcts[0])} → ${pct(it.pcts[1])}`}
              onSegmento={verEnLista ? (s) => verEnLista('region', s.idx) : undefined}
            />
          )}
        </Lienzo>
        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <div className="kpi-lbl">Solo online</div>
          <div className="kpi-sub">
            sin región asignable, fuera de las dos bases · {entero(r[onlineIdx].n)}{' '}
            {r[onlineIdx].n === 1 ? 'cliente' : 'clientes'} · {pesos(r[onlineIdx].ar)} de exposición
          </div>
        </div>
      </div>
    </section>
  )
}
