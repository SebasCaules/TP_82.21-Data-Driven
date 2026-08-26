// M2a — el embudo de la campaña masiva, sobre series.embudo_campanias.global (base limpia,
// 23.529 envíos). Las cuatro etapas van en conteos absolutos (envíos * fracción), con el
// porcentaje de nota al lado de cada barra. La bajada declara las dos bases y que la compra
// a 7 días nunca ocurre sin clic previo: el salto al abrir es mecánico, no un efecto causal.
// Serie global: no depende del corte ni de los filtros.
// formatoEje en miles ("24 mil" en vez de "23.529"): la escala del eje solo necesita marcar
// la magnitud, y el numero exacto ya esta en la nota de cada barra.

import { Lienzo, Embudo } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

const formatoEje = (v) => (v >= 1000 ? `${Math.round(v / 1000)} mil` : entero(v))

export default function M2a() {
  const emb = series.embudo_campanias
  const g = emb.global
  const envios = g.envios

  const etapas = [
    { etiqueta: 'Envíos', valor: envios },
    { etiqueta: 'Abre', valor: envios * g.abre, pct: pct(g.abre * 100) },
    { etiqueta: 'Clic', valor: envios * g.clic, pct: pct(g.clic * 100) },
    { etiqueta: 'Compra a 7 días', valor: envios * g.compra_7dias, pct: pct(g.compra_7dias * 100) },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        El embudo termina en {pct(g.compra_7dias * 100)}: las campañas masivas no discriminan
      </h1>
      <p className="bajada">
        {entero(emb.base_completa_envios)} envíos en la base completa, {entero(emb.base_limpia_envios)} en
        la limpia. Compra a 7 días nunca ocurre sin clic: el salto al abrir es mecánico, no causal.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <Embudo etapas={etapas} w={w} h={h} formato={entero} formatoEje={formatoEje} />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
