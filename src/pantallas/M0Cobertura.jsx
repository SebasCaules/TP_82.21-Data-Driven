// M0 — cobertura de la capacidad de Marketing contra el total en riesgo. Responde si el
// operativo alcanza a cubrir la base priorizada: la capacidad (500 a 800) se dibuja como
// banda sobre el total en riesgo, no como un corte unico. El excedente no es un grupo de
// control (comite-adjudicacion.md, hallazgo 3): es el tramo de menor exposicion, porque la
// lista se ordena por exposicion y se corta.

import { Lienzo, BarraTramos } from '../graficos.jsx'
import { entero, pct, meta } from '../agregacion.js'

export default function M0({ info }) {
  const [capLo, capHi] = meta.capacidad_contacto
  const enRiesgo = info.enRiesgo
  const cubierto = Math.min(capHi, enRiesgo)
  const sinCubrir = Math.max(0, enRiesgo - capHi)
  const pctLo = enRiesgo ? (100 * capLo) / enRiesgo : 0
  const pctHi = enRiesgo ? (100 * capHi) / enRiesgo : 0

  const tramos = [
    {
      etiqueta: 'cubierto por capacidad',
      valor: cubierto,
      enfasis: true,
      nota: `cobertura ${pct(pctLo)} a ${pct(pctHi)}`,
    },
    {
      etiqueta: 'no cubierto por la capacidad',
      valor: sinCubrir,
      enfasis: false,
    },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        La capacidad cubre entre uno de cada cinco y uno de cada tres clientes en riesgo: el
        orden importa más que el alcance
      </h1>
      <p className="bajada">
        {entero(enRiesgo)} clientes en riesgo contra una capacidad de {entero(capLo)} a{' '}
        {entero(capHi)} contactos. El resto no es grupo de control: es el tramo de menor
        exposición, porque la lista se ordena y se corta.
      </p>
      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarraTramos
              tramos={tramos}
              w={w}
              h={h}
              formato={entero}
              banda={[capLo, capHi, `capacidad ${entero(capLo)} a ${entero(capHi)}`]}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
