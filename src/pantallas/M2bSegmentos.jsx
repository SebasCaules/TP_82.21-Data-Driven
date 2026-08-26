// M2b — compra a 7 dias por segmento, sobre la misma serie que D6 (por_segmento_completa)
// pero para otra pregunta: D6 mide contra la marca a superar, esta pantalla mide si algun
// segmento discrimina contra el resto.
//
// Punto-con-intervalo en vez de barras (el usuario lo marco: "no tiene color ningun
// histograma"). Con tasas del orden del 1 %, cinco barras desde cero dan cinco rectangulos
// casi identicos y todo gris: el hallazgo real, que los intervalos se solapan, no se ve en
// el largo de la barra. Cleveland-McGill: posicion sobre escala comun se lee mejor que
// largo cuando la diferencia entre valores es chica. El intervalo de Wilson al 95 % vuelve
// el hallazgo verificable en el dibujo, no solo afirmado en el titulo.
// Enfasis unico en "Inactivos 90d" (regla 18): es el mismo segmento que D6 usa de vara.
// No toma `iCorte` ni `filtro`: la serie de campanias es global.

import { Lienzo, PuntosIC } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

export default function M2b() {
  const filas = series.embudo_campanias.por_segmento_completa
  const g = series.embudo_campanias.global

  const datos = filas
    .map((f) => ({
      etiqueta: f.segmento,
      valor: f.compra_7dias * 100,
      ic: f.compra_7dias_ic.map((x) => x * 100),
      nota: `${entero(f.envios)} envíos · ${entero(f.compras)} compras`,
      enfasis: f.segmento === 'Inactivos 90d',
    }))
    .sort((a, b) => b.valor - a.valor)

  const mejor = datos[0]
  const peor = datos[datos.length - 1]
  // La franja compartida entre el IC del mejor y el del peor segmento es el hallazgo
  // verificable: "ninguno se despega" a secas no dice nada, esto se puede leer en el grafico.
  const solapaDesde = Math.max(mejor.ic[0], peor.ic[0])
  const solapaHasta = Math.min(mejor.ic[1], peor.ic[1])

  const referencia = { valor: g.compra_7dias * 100, ic: g.compra_7dias_ic.map((x) => x * 100) }

  return (
    <section className="pant">
      <h1 className="titulo">
        Ningún segmento se despega: {mejor.etiqueta} y {peor.etiqueta} se solapan entre{' '}
        {pct(solapaDesde, 2)} y {pct(solapaHasta, 2)}
      </h1>
      <p className="bajada">
        Punto y barra: intervalo de confianza al 95 % (Wilson). Punteada: tasa global. No
        alcanza para priorizar por segmento sobre exposición.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <PuntosIC
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío, por segmento (IC 95 %)"
              anchoEtiqueta={112}
              referencia={referencia}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
