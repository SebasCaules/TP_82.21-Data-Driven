// D6 — contra el criterio actual. Barras de compra a 7 dias por segmento objetivo,
// SOLO sobre la base de envios de la campania completa (23.729): el 1,2 % global es
// de otra base y agranda el efecto contra el comparable real, que es "Todos" (1,34 %).
// Enfasis en "Inactivos 90d": es la marca que el futuro score tiene que superar.
//
// La vara va con su intervalo de Wilson al 95 % (titulo y nota de la barra), no como
// numero exacto: es la misma razon por la que la vista 13 paso a punto-con-intervalo.
// Aca la barra se queda igual (regla 18 no pide sacarla, y la pregunta de esta pantalla
// sigue siendo "cuanto falta para superar la vara", no "se solapan los segmentos") pero
// esconder la incertidumbre de la vara hubiera sido inconsistente con el resto del tablero.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

const fmtIc = (ic) =>
  `${(ic[0] * 100).toFixed(2).replace('.', ',')}–${(ic[1] * 100).toFixed(2).replace('.', ',')} %`

export default function D6() {
  const filas = series.embudo_campanias.por_segmento_completa
  const marca = series.embudo_campanias.marca_a_superar.segmento
  const marcaPct = series.embudo_campanias.marca_a_superar.compra_7dias
  const marcaIc = filas.find((f) => f.segmento === marca).compra_7dias_ic

  const datos = filas
    .map((f) => {
      const base = `${entero(f.envios)} envíos · ${entero(f.compras)} compras`
      return {
        etiqueta: f.segmento,
        valor: f.compra_7dias * 100,
        nota: f.segmento === marca ? `${base} · IC 95 % [${fmtIc(f.compra_7dias_ic)}]` : base,
        enfasis: f.segmento === marca,
      }
    })
    .sort((a, b) => b.valor - a.valor)

  return (
    <section className="pant">
      <h1 className="titulo">
        Todavía no hay score que comparar: la vara es {pct(marcaPct * 100, 2)}, IC [{fmtIc(marcaIc)}]
      </h1>
      <p className="bajada">
        Compra a 7 días de la campaña completa, un segmento contra otro. {marca} es la vara a
        superar, con su intervalo de confianza al 95 %.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío, por segmento"
              anchoEtiqueta={100}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
