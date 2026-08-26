// M0 — cobertura de la capacidad de Marketing. La pregunta de la vista es a cuantos alcanza
// a contactar Marketing y que queda afuera, y su titulo afirma que EL ORDEN importa mas que
// el alcance.
//
// Curva de concentracion y no cuadricula de unidades: la cuadricula solo sabia contar
// cabezas, asi que el dibujo no sostenia el titulo. Con las dos curvas la afirmacion se
// verifica de un vistazo — a 500 contactos la lista ordenada cubre el 37,0 % de la
// exposicion y contactar 500 al azar cubriria el 20,4 % — y la distancia vertical entre
// ellas ES la ventaja de ordenar. Las cifras estan ancladas en el pipeline
// (_anclas_concentracion, desde client_facts).
//
// El excedente no es grupo de control (comite-adjudicacion.md, hallazgo 3): es el tramo de
// menor exposicion, que es justo lo que la cola aplanada de la curva muestra.

import { Lienzo, CurvaConcentracion } from '../graficos.jsx'
import { entero, lista, meta, pct, pesos } from '../agregacion.js'

export default function M0({ info, iCorte, filtro }) {
  const [capLo, capHi] = meta.capacidad_contacto
  const enRiesgo = info.enRiesgo
  const total = info.exposicion

  // La lista ya viene ordenada por gasto anualizado descendente desde el pipeline.
  const filas = lista(iCorte, filtro)
  const acum = []
  filas.reduce((s, r) => { const v = s + r.anualizado; acum.push(v); return v }, 0)

  const hay = acum.length > 0 && total > 0
  const kLo = Math.min(capLo, acum.length)
  const kHi = Math.min(capHi, acum.length)
  const cubreLo = hay ? (100 * acum[kLo - 1]) / total : 0
  const cubreHi = hay ? (100 * acum[kHi - 1]) / total : 0
  const azarLo = enRiesgo ? Math.min(100, (100 * kLo) / enRiesgo) : 0
  const ventaja = azarLo ? cubreLo / azarLo : 0

  return (
    <section className="pant">
      <h1 className="titulo">
        {hay
          ? `Contactar a ${entero(kLo)} de los ${entero(enRiesgo)} en riesgo cubre el ${pct(cubreLo)} de la exposición, no el ${pct(azarLo)}`
          : 'Sin clientes en riesgo con este recorte'}
      </h1>
      <p className="bajada">
        {hay
          ? <>La lista se ordena por exposición, así que el orden rinde {ventaja.toFixed(2).replace('.', ',')} veces
              más que el alcance. El resto no es grupo de control: es la cola de menor exposición.</>
          : 'Ninguna combinación de filtros deja clientes en riesgo en este corte.'}
      </p>

      <div className="lienzo cob">
        <div className="cob-kpi fijo">
          <div className="cob-dato">
            <span className="cob-etq">En riesgo este corte</span>
            <span className="cob-val tabular">{entero(enRiesgo)}</span>
            <span className="cob-ap">clientes elegibles sin compra reciente</span>
          </div>
          <div className="cob-dato">
            <span className="cob-etq">Capacidad declarada</span>
            <span className="cob-val tabular">{entero(capLo)} a {entero(capHi)}</span>
            <span className="cob-ap">contactos por mes · {pct(azarLo)} de las cabezas</span>
          </div>
          <div className="cob-dato">
            <span className="cob-etq">Exposición que cubre</span>
            <span className="cob-val tabular acc">{pct(cubreLo)} a {pct(cubreHi)}</span>
            <span className="cob-ap">{pesos(hay ? acum[kLo - 1] : 0)} a {pesos(hay ? acum[kHi - 1] : 0)} de {pesos(total)}</span>
          </div>
        </div>

        <div className="cob-grilla">
          <Lienzo>
            {({ w, h }) => (
              <CurvaConcentracion
                acum={acum} total={total} nRiesgo={enRiesgo} capLo={capLo} capHi={capHi}
                w={w} h={h} formatoDinero={pesos} formatoPct={(v) => pct(v)} />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
