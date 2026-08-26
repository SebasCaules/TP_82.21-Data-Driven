// D4 — la recompra a 90 dias contra la meta y la linea base. Serie de tiempo en linea
// (regla 7) con las dos bandas rotuladas (regla 21: toda banda lleva etiqueta) y el
// semaforo de la Parte D S2.1 junto al ultimo punto. Serie global: no depende del corte
// ni de los filtros, por eso no toma `iCorte` ni `filtro` de las props.

import { Lienzo, Linea } from '../graficos.jsx'
import Semaforo, { estadoRecompra } from '../Semaforo.jsx'
import { meta, pct, series } from '../agregacion.js'

export default function D4Recompra() {
  const trimestral = series.recompra_trimestral.map((r) => ({
    etiqueta: r.trimestre,
    valor: r.tasa == null ? null : r.tasa * 100,
  }))

  // Mismo criterio que usa Linea para marcar pico y ultimo punto: el primer maximo
  // estricto y el ultimo valor no nulo. Asi el "N trimestres" del titulo sale de la
  // serie, no de una cuenta hecha a mano.
  let iPico = -1
  let vPico = -1
  let iUltimo = -1
  trimestral.forEach((p, i) => {
    if (p.valor == null) return
    if (p.valor > vPico) { vPico = p.valor; iPico = i }
    iUltimo = i
  })
  const pico = trimestral[iPico]
  const ultimo = trimestral[iUltimo]
  const trimestresDesdePico = iUltimo - iPico
  const [baseLo, baseHi] = meta.base_recompra
  const estado = estadoRecompra(ultimo.valor, meta.meta_recompra)

  return (
    <section className="pant">
      <h1 className="titulo">
        La recompra pasó de {pct(pico.valor)} a {pct(ultimo.valor)} en {trimestresDesdePico} trimestres,
        por debajo de la línea base de {baseLo}-{baseHi} %
      </h1>
      <p className="bajada">Serie completa 2022Q1–2025Q3.</p>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Estado contra la meta
            {/* El estado ES el mensaje de esta pantalla (Parte D §2.1): pastilla grande,
                no un renglon chico que compite con el grafico. */}
            <Semaforo estado={estado} tamano="grande" de="recompra a 90 días" />
          </div>
          {/* Serie de tiempo trimestral contra una banda de meta: va en linea (regla 7).
              Se sostiene: es la unica primitiva que muestra tendencia y quiebre en el
              tiempo sin inventar una escala de barras para 15 puntos. */}
          <Lienzo>
            {({ w, h }) => (
              <Linea
                serie={trimestral} w={w} h={h}
                formato={(v) => pct(v)}
                banda={meta.meta_recompra}
                banda2={meta.base_recompra}
                tituloEje="% que recompra en 90 días"
              />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
