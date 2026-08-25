// D2 — riesgo por quintil de valor. Barras horizontales desde cero (reglas 4 y 6),
// Q5 en el unico color de enfasis y el resto en gris (regla 18), con la marca del
// promedio general al lado, que es el baseline que pide la correccion 3 del wiki.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, millones, pct, porDimension } from '../agregacion.js'

export default function D2({ iCorte, filtro, info }) {
  const q = porDimension(iCorte, 'quintil', filtro)
  const promedio = info.clientes ? (100 * info.enRiesgo) / info.clientes : 0

  const datos = q.map((c, i) => ({
    etiqueta: `Q${i + 1}`,
    valor: c.n ? (100 * c.nr) / c.n : 0,
    nota: `${entero(c.nr)} de ${entero(c.n)}`,
    enfasis: i === 4,
  }))
  const ratio = datos[0].valor ? datos[4].valor / datos[0].valor : 0

  return (
    <section className="pant">
      <span className="rotulo diagnostico">Diagnóstico · datos históricos</span>
      <h1 className="titulo">
        El riesgo crece con el valor del cliente: Q5 {ratio >= 3.5 ? 'casi cuadruplica' : 'multiplica'} a Q1
      </h1>
      <p className="bajada">
        Q1 {pct(datos[0].valor)} contra Q5 {pct(datos[4].valor)}. El salto real está entre Q1 y Q2
        ({pct(datos[0].valor)} → {pct(datos[1].valor)}), no repartido parejo entre quintiles.
        Promedio general de la base: {pct(promedio)}.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={(v) => pct(v)}
              tituloEje="% de clientes en riesgo, por quintil de facturación"
              anchoEtiqueta={54} notaAncho={128}
            />
          )}
        </Lienzo>
        <div className="tarjeta" style={{ flex: '0 0 clamp(200px, 21%, 280px)' }}>
          <div className="kpi-lbl">Exposición del quintil top</div>
          <div className="kpi-val tabular">ARS {millones(q[4].ar)}</div>
          <div className="kpi-sub">{entero(q[4].nr)} clientes de Q5 en riesgo</div>
          <div className="kpi-base">
            sobre ARS {millones(info.exposicion)} de exposición total
          </div>
        </div>
      </div>
    </section>
  )
}
