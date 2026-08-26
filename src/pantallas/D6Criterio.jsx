// D6 — contra el criterio actual. La pantalla fija el objetivo que el score futuro tiene que
// superar; no compara segmentos entre si.
//
// Por que no son barras ordenadas. Hasta el 26/08/2026 esta vista dibujaba los cinco criterios
// como barras desde cero, de mayor a menor. Ese orden no lo sostienen los datos: los diez pares
// de intervalos se solapan, el IC de una sola barra mide 0,70 pp contra los 0,43 pp de amplitud
// entre la mas alta y la mas baja, y con las cinco tasas iguales el azar reproduce esa amplitud
// en una de cada tres corridas. Encima la vista 13 muestra los mismos cinco numeros como puntos
// con intervalo y titula que ninguno se despega: el tablero se contradecia a si mismo.
//
// Lo que se dibuja ahora es lo que el titulo dice. La banda gris es el IC de la vara: todo lo
// que cae adentro no se distingue de ella, y los cuatro criterios restantes caen adentro. Van
// como contexto tenue, no como competidores. La fila punteada de arriba es el lugar reservado
// al score, que todavia no existe.
//
// La vara no es el maximo de los cinco: `series.py` la fija a "Inactivos 90d" porque es el
// criterio que Marketing usa hoy, y la Parte D §5 lo declara como baseline. Elegirla por ser la
// mas alta habria sido sesgo de seleccion; no lo es.

import { Lienzo, PuntosIC } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

const ic100 = (ic) => [ic[0] * 100, ic[1] * 100]
// Un solo % al cierre del rango: "1,08–1,78 %" y no "1,08 %–1,78 %".
const rango = ([lo, hi]) =>
  `${lo.toFixed(2).replace('.', ',')}–${hi.toFixed(2).replace('.', ',')} %`

export default function D6() {
  const filas = series.embudo_campanias.por_segmento_completa
  const marca = series.embudo_campanias.marca_a_superar.segmento
  const marcaPct = series.embudo_campanias.marca_a_superar.compra_7dias * 100
  const marcaIc = ic100(filas.find((f) => f.segmento === marca).compra_7dias_ic)

  const fila = (f) => ({
    etiqueta: f.segmento,
    valor: f.compra_7dias * 100,
    ic: ic100(f.compra_7dias_ic),
    nota: `${entero(f.envios)} envíos · ${entero(f.compras)} compras`,
  })

  // Sin ordenar por valor: ordenar era justamente lo que dibujaba un ranking que los intervalos
  // no sostienen. Primero el lugar del score, despues la vara, y el resto como contexto en el
  // orden en que viene la serie.
  const datos = [
    { etiqueta: 'Score del modelo', vacio: true, nota: 'en desarrollo' },
    { ...fila(filas.find((f) => f.segmento === marca)), enfasis: true },
    ...filas.filter((f) => f.segmento !== marca).map((f) => ({ ...fila(f), tenue: true })),
  ]

  const dentro = filas.filter(
    (f) => f.segmento !== marca
      && f.compra_7dias_ic[1] * 100 >= marcaIc[0]
      && f.compra_7dias_ic[0] * 100 <= marcaIc[1],
  ).length

  return (
    <section className="pant">
      <h1 className="titulo">
        Todavía no hay score que comparar: la vara es {pct(marcaPct, 2)}, IC [{rango(marcaIc)}]
      </h1>
      <p className="bajada">
        {marca} es el criterio que se usa hoy, no el mejor de los cinco. La banda es su intervalo
        al 95 %: los otros {dentro} criterios caen adentro, así que ninguno sirve de vara alternativa.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <PuntosIC
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío, por criterio de envío"
              anchoEtiqueta={112}
              referencia={{ valor: marcaPct, ic: marcaIc, rotulo: 'IC 95 % de la vara' }}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
