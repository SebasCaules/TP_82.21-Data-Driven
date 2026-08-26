// D5b — exposicion por categoria. Barras horizontales en pesos (regla 6), ordenadas de
// mayor a menor exposicion (regla 11), con la tasa de riesgo como nota junto a cada barra
// (regla 14) y un solo color de enfasis (regla 18): la categoria que el titulo defiende.
// Marcar los dos extremos con el mismo acento le daba dos significados opuestos al color
// dentro del mismo grafico, que es lo que prohibe la regla 19. La bajada calcula la
// amplitud en pp en cada render: nada viene hardcodeado.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { dims, millones, pct, pesos, porDimension, topeExposicionPar } from '../agregacion.js'

export default function D5b({ iCorte, filtro, verEnLista }) {
  const cat = porDimension(iCorte, 'categoria', filtro)
  const filas = cat.map((c, i) => ({
    etiqueta: dims.categoria[i],
    valor: c.ar,
    tasa: c.n ? (100 * c.nr) / c.n : 0,
    n: c.n,
    nr: c.nr,
    _i: i,
  }))

  const porTasa = [...filas].filter((f) => f.n > 0).sort((a, b) => b.tasa - a.tasa)
  const alta = porTasa[0]
  const baja = porTasa[porTasa.length - 1]
  const amplitud = alta && baja ? (alta.tasa - baja.tasa).toFixed(1).replace('.', ',') : null
  // Con un filtro que deja las categorias empatadas en tasa, "0,0" no puede ir bajo un
  // titulo que afirma "si mueve la aguja": pasa a decir el empate en vez de una amplitud
  // que ese caso vuelve falsa.
  const empate = amplitud === '0,0'
  // Un filtro puede dejar una sola categoria con clientes: ahi alta y baja son el mismo
  // objeto y "X y X empatan" repite el nombre sin sentido. Se distingue de un empate real
  // entre dos categorias distintas.
  const unaSola = porTasa.length === 1

  const porExposicion = [...filas].sort((a, b) => b.valor - a.valor)

  // Tasa de riesgo general de las 7 categorias: mismo denominador que la nota de cada
  // barra, para que el encabezado de la columna y las notas midan lo mismo.
  const totCat = filas.reduce((s, f) => ({ n: s.n + f.n, nr: s.nr + f.nr }), { n: 0, nr: 0 })
  const tasaGeneral = totCat.n ? (100 * totCat.nr) / totCat.n : null

  const datos = porExposicion.map((f) => ({
    etiqueta: f.etiqueta,
    valor: f.valor,
    nota: `${pct(f.tasa)} en riesgo`,
    // Solo la de mayor tasa: es la que el titulo nombra como "la que mueve la aguja".
    // La del extremo bajo se identifica por su etiqueta y su nota, no por el color.
    enfasis: !!alta && f.etiqueta === alta.etiqueta,
    _i: f._i,
  }))

  return (
    <section className="pant">
      <h1 className="titulo">
        {alta && baja
          ? (unaSola
              ? `Este filtro deja una sola categoría: ${alta.etiqueta}, ${pct(alta.tasa)} en riesgo`
              : empate
                ? `La categoría no separa con este filtro: ${alta.etiqueta} y ${baja.etiqueta} empatan en ${pct(alta.tasa)}`
                : `La categoría sí mueve la aguja: ${amplitud} puntos entre ${alta.etiqueta} y ${baja.etiqueta}`)
          : 'La categoría sí mueve la aguja'}
      </h1>
      <p className="bajada">
        {alta && baja && (
          unaSola
            ? <>No queda otra categoría con clientes para comparar en este filtro.</>
            : <>{alta.etiqueta} {pct(alta.tasa)} contra {baja.etiqueta} {pct(baja.tasa)}, {amplitud} puntos
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
                  tope={topeExposicionPar(iCorte, filtro)}
                  anchoEtiqueta={anchoEtiqueta}
                  onBarra={verEnLista ? (i, d) => verEnLista('categoria', d._i) : undefined}
                />
                {/* Encabezado de la columna de notas: sin esto el porcentaje se lee como
                    participacion en pesos, que es justo lo que no es. Mismo patron que
                    D3Segmentos. */}
                {tasaGeneral != null && (
                  <svg width={w} height={h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <text x={w} y={11} fontSize="10" fill="var(--mut)" letterSpacing=".07em"
                          textAnchor="end" style={{ textTransform: 'uppercase' }}>
                      tasa de riesgo · general {pct(tasaGeneral)}
                    </text>
                  </svg>
                )}
              </div>
            )
          }}
        </Lienzo>
      </div>
    </section>
  )
}
