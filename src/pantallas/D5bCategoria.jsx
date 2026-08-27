// D5b — categoría, gemelo exacto de D5a: dos composiciones al 100 % alineadas, clientes
// contra exposición, con los cortes conectados. El par se lee comparando formas entre
// pantallas, y por eso los dos usan el mismo formato y la misma escala fija (0-100 %), que
// además vuelve al gráfico inmune al filtro: nada acá se puede inflar recortando la base.
//
// Acá los conectores no son verticales como en región: todos los cortes se corren hacia la
// derecha porque Muebles se lleva más exposición que clientes y cada categoría chica pierde
// participación al pasar de personas a pesos. Esa es la lectura que la barra de pesos sola
// no daba. La tasa de riesgo, que era la nota al costado, baja a la bajada.

import { Lienzo, BarrasApiladas100, rampa } from '../graficos.jsx'
import { Def } from '../Glosario.jsx'
import { dims, entero, pct, pesos, porDimension } from '../agregacion.js'

export default function D5b({ iCorte, filtro, verEnLista }) {
  const cat = porDimension(iCorte, 'categoria', filtro)
  const filas0 = cat.map((c, i) => ({
    etiqueta: dims.categoria[i],
    ar: c.ar,
    n: c.n,
    tasa: c.n ? (100 * c.nr) / c.n : 0,
    _i: i,
  }))

  const porTasa = filas0.filter((f) => f.n > 0).sort((a, b) => b.tasa - a.tasa)
  const alta = porTasa[0]
  const baja = porTasa[porTasa.length - 1]
  const amplitud = alta && baja ? (alta.tasa - baja.tasa).toFixed(1).replace('.', ',') : null
  const unaSola = porTasa.length === 1

  const totalN = filas0.reduce((s, f) => s + f.n, 0)
  const totalAr = filas0.reduce((s, f) => s + f.ar, 0)

  const orden = [...filas0].sort((a, b) => b.ar - a.ar)
  const partes = orden.map((f, k) => ({
    etiqueta: f.etiqueta,
    idx: f._i,
    n: f.n,
    ar: f.ar,
    pClientes: totalN ? (100 * f.n) / totalN : 0,
    pExposicion: totalAr ? (100 * f.ar) / totalAr : 0,
    ...rampa(k),
  }))

  const segmento = (p, valor, share) => ({
    clave: p.etiqueta, valor, tono: p.tono, tinta: p.tinta, idx: p.idx,
    enfasis: p === partes[0], texto: `${p.etiqueta} ${pct(share)}`,
  })

  const filas = [
    {
      etiqueta: 'Clientes', sub: `base ${entero(totalN)}`,
      segmentos: partes.map((p) => segmento(p, p.n, p.pClientes)),
    },
    {
      etiqueta: 'Exposición', sub: `base ${pesos(totalAr)}`,
      segmentos: partes.map((p) => segmento(p, p.ar, p.pExposicion)),
    },
  ]

  const top = partes[0]
  // "Todas las demás pierden participación" es una afirmación sobre el dibujo entero, no
  // sobre la primera barra: con otro filtro puede ser falsa, así que se chequea antes de
  // escribirla.
  const restoBaja = partes.length > 1 && partes.slice(1).every((p) => p.pExposicion < p.pClientes)

  return (
    <section className="pant">
      <h1 className="titulo">
        {!top || !totalAr
          ? 'Sin exposición asignable a una categoría'
          : `${top.etiqueta} ocupa ${pct(top.pExposicion)} de la exposición con ${pct(top.pClientes)} de los clientes`}
      </h1>
      <p className="bajada">
        {alta && baja && !unaSola
          ? <>La tasa de <Def id="en-riesgo">riesgo</Def> va de {pct(alta.tasa)} en{' '}
              {alta.etiqueta} a {pct(baja.tasa)} en {baja.etiqueta}, {amplitud} puntos.{restoBaja ? ' Todas las demás categorías pierden participación al pasar de clientes a pesos.' : ''}</>
          : 'Este filtro deja una sola categoría con clientes: no hay con qué comparar la tasa de riesgo.'}
      </p>
      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} w={w} h={h}
              anchoEtiqueta={106}
              conectores
              tituloEje="Participación de cada categoría en el total"
              rotuloResto="Tramos sin lugar para el rótulo (clientes → exposición):"
              textoResto={(it) => `${it.clave} ${pct(it.pcts[0])} → ${pct(it.pcts[1])}`}
              onSegmento={verEnLista ? (s) => verEnLista('categoria', s.idx) : undefined}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
