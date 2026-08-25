// D2 — riesgo por quintil de valor. La barra sigue el denominador que fija la Parte D
// (riesgo sobre el total del quintil, nr/n): eso no se toca. Lo que corrige el comité
// es la lectura: el salto Q1→Q2 es de composición (Q1 está compuesto en su mayoría por
// clientes sin historial suficiente para calificar como riesgo), no un efecto de valor.

import { Lienzo, BarrasH, ReferenciaV } from '../graficos.jsx'
import { entero, pct, porDimension } from '../agregacion.js'

const ANCHO_ETIQUETA = 54
const NOTA_ANCHO = 140

export default function D2({ iCorte, filtro, info, verEnLista }) {
  const q = porDimension(iCorte, 'quintil', filtro)
  const promedio = info.clientes ? (100 * info.enRiesgo) / info.clientes : 0

  const datos = q.map((c, i) => ({
    etiqueta: `Q${i + 1}`,
    valor: c.n ? (100 * c.nr) / c.n : 0,
    nota: `${entero(c.nr)} de ${entero(c.ne)} elegibles`,
    enfasis: i === 4,
  }))

  // Tasa entre clientes comparables: sobre elegibles (nr/ne), no sobre el total del quintil.
  const tasaElegibles = (c) => (c.ne ? (100 * c.nr) / c.ne : 0)
  const gradQ1 = tasaElegibles(q[0])
  const gradQ5 = tasaElegibles(q[4])
  const pctElegiblesQ1 = q[0].n ? (100 * q[0].ne) / q[0].n : 0
  const sinHistoriaQ1 = 100 - pctElegiblesQ1

  return (
    <section className="pant">
      <h1 className="titulo">
        El riesgo sube con el valor del cliente, pero menos de lo que sugiere el total
      </h1>
      <p className="bajada">
        El salto Q1→Q2 es de composición: el {pct(sinHistoriaQ1)} de Q1 tiene menos de 3
        compras y por definición no puede estar en riesgo. Entre elegibles el gradiente real
        va de {pct(gradQ1)} a {pct(gradQ5)}.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <div style={{ position: 'relative', width: w, height: h }}>
              <BarrasH
                datos={datos} w={w} h={h}
                formato={(v) => pct(v)}
                tituloEje="% en riesgo sobre el total del quintil"
                anchoEtiqueta={ANCHO_ETIQUETA} notaAncho={NOTA_ANCHO}
              />
              <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <ReferenciaV
                  x={xDeValor(promedio, datos, w)} h={h} y={16}
                  etiqueta={`${pct(promedio)} general`}
                />
              </svg>
              {verEnLista && <FilasClicables datos={datos} h={h} onClick={(i) => verEnLista('quintil', i)} />}
            </div>
          )}
        </Lienzo>
      </div>
    </section>
  )
}

/** Misma formula de escala que BarrasH (x0 = anchoEtiqueta, ancho = w - x0 - notaAncho - 12,
 *  max = mayor valor de la serie) para ubicar la linea de referencia sobre la misma barra. */
function xDeValor(valor, datos, w) {
  const x0 = ANCHO_ETIQUETA
  const ancho = Math.max(40, w - x0 - NOTA_ANCHO - 12)
  const max = Math.max(...datos.map((d) => d.valor), 0) || 1
  return x0 + (valor / max) * ancho
}

/** Overlay de botones invisibles, uno por fila, para el drill-down (Parte D §4.1).
 *  BarrasH no expone onClick por barra: replica su propia division de filas
 *  (padTop 20 con tituloEje, padBot 4, filas iguales) para alinear el target con la barra. */
function FilasClicables({ datos, h, onClick }) {
  const padTop = 20
  const padBot = 4
  const paso = (h - padTop - padBot) / datos.length
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {datos.map((d, i) => (
        <button
          key={d.etiqueta}
          onClick={() => onClick(i)}
          aria-label={`Ver en la lista los clientes de ${d.etiqueta}`}
          style={{
            position: 'absolute', left: 0, right: 0,
            top: padTop + i * paso, height: paso,
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          }}
        />
      ))}
    </div>
  )
}
