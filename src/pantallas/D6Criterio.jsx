// D6 — contra el criterio actual. Barras de compra a 7 dias por segmento objetivo,
// SOLO sobre la base de envios de la campania completa (23.729): el 1,2 % global es
// de otra base y agranda el efecto contra el comparable real, que es "Todos" (1,34 %).
// Enfasis en "Inactivos 90d": es la marca que el futuro score tiene que superar.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

export default function D6() {
  const filas = series.embudo_campanias.por_segmento_completa
  const marca = series.embudo_campanias.marca_a_superar.segmento

  const datos = filas
    .map((f) => ({
      etiqueta: f.segmento,
      valor: f.compra_7dias * 100,
      nota: `${entero(f.envios)} envíos · ${entero(Math.round(f.envios * f.compra_7dias))} compras`,
      enfasis: f.segmento === marca,
    }))
    .sort((a, b) => b.valor - a.valor)

  return (
    <section className="pant">
      <h1 className="titulo">
        Todavía no hay score que comparar: el objetivo es superar el 1,39 % del criterio actual
      </h1>
      <p className="bajada">
        Compra a 7 días de la campaña completa (23.729 envíos), un segmento contra otro.
        Inactivos 90d es hoy el mejor criterio disponible y la vara a superar.
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
