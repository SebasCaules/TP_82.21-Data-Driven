// M2b — compra a 7 dias por segmento, sobre la misma serie que D6 (por_segmento_completa)
// pero para otra pregunta: D6 mide contra la marca a superar, esta pantalla mide si algun
// segmento discrimina contra el resto. Sin enfasis en ninguna barra (regla 18: un solo color
// de enfasis, y aca no hay nada que destacar) y ordenada de mayor a menor (regla 11). No toma
// `iCorte` ni `filtro`: la serie de campanias es global, no responde al corte ni a los filtros.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

export default function M2b() {
  const filas = series.embudo_campanias.por_segmento_completa

  const datos = filas
    .map((f) => ({
      etiqueta: f.segmento,
      valor: f.compra_7dias * 100,
      nota: `${entero(f.envios)} envíos · ${entero(Math.round(f.envios * f.compra_7dias))} compras`,
    }))
    .sort((a, b) => b.valor - a.valor)

  const valores = datos.map((d) => d.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)

  return (
    <section className="pant">
      <h1 className="titulo">
        Ningún segmento se despega: entre {pct(min, 2)} y {pct(max, 2)} de compra a 7 días
      </h1>
      <p className="bajada">
        Compra a 7 días de la campaña completa ({entero(series.embudo_campanias.base_completa_envios)} envíos),
        un segmento contra otro. Ninguno alcanza para priorizar por segmento en vez de por exposición.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío, por segmento"
              anchoEtiqueta={112} notaAncho={150}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
