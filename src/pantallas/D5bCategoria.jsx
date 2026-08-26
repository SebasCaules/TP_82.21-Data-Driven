// D5b — exposicion por categoria. Barras horizontales en pesos (regla 6), ordenadas de
// mayor a menor exposicion (regla 11), con la tasa de riesgo como nota junto a cada barra
// (regla 14) y un solo color de enfasis (regla 18): la categoria que el titulo defiende.
// Marcar los dos extremos con el mismo acento le daba dos significados opuestos al color
// dentro del mismo grafico, que es lo que prohibe la regla 19. La bajada calcula la
// amplitud en pp en cada render: nada viene hardcodeado.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { dims, millones, pct, pesos, porDimension } from '../agregacion.js'

export default function D5b({ iCorte, filtro, verEnLista }) {
  const cat = porDimension(iCorte, 'categoria', filtro)
  const filas = cat.map((c, i) => ({
    etiqueta: dims.categoria[i],
    valor: c.ar,
    tasa: c.n ? (100 * c.nr) / c.n : 0,
    n: c.n,
    _i: i,
  }))

  const porTasa = [...filas].filter((f) => f.n > 0).sort((a, b) => b.tasa - a.tasa)
  const alta = porTasa[0]
  const baja = porTasa[porTasa.length - 1]
  const amplitud = alta && baja ? (alta.tasa - baja.tasa).toFixed(1).replace('.', ',') : null

  const porExposicion = [...filas].sort((a, b) => b.valor - a.valor)

  const datos = porExposicion.map((f) => ({
    etiqueta: f.etiqueta,
    valor: f.valor,
    nota: pct(f.tasa),
    // Solo la de mayor tasa: es la que el titulo nombra como "la que mueve la aguja".
    // La del extremo bajo se identifica por su etiqueta y su nota, no por el color.
    enfasis: !!alta && f.etiqueta === alta.etiqueta,
    _i: f._i,
  }))

  return (
    <section className="pant">
      <h1 className="titulo">
        {alta && baja
          ? `La categoría sí mueve la aguja: ${amplitud} puntos entre ${alta.etiqueta} y ${baja.etiqueta}`
          : 'La categoría sí mueve la aguja'}
      </h1>
      <p className="bajada">
        {alta && baja && (
          <>{alta.etiqueta} {pct(alta.tasa)} contra {baja.etiqueta} {pct(baja.tasa)}, {amplitud} puntos
          de diferencia.</>
        )}
      </p>
      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => {
            const anchoEtiqueta = 118  // cubre "Cocina y mesa" / "Organizacion", la más larga de las 7
            return (
              <div style={{ position: 'relative', width: w, height: h }}>
                <BarrasH
                  datos={datos} w={w} h={h}
                  formato={(v) => pesos(v)} formatoEje={(v) => millones(v, 0)}
                  tituloEje="Exposición anual, por categoría (ARS)"
                  anchoEtiqueta={anchoEtiqueta}
                  onBarra={verEnLista ? (i, d) => verEnLista('categoria', d._i) : undefined}
                />
              </div>
            )
          }}
        </Lienzo>
      </div>
    </section>
  )
}
