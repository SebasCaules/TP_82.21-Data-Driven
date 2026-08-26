// M0 — cobertura de la capacidad de Marketing contra el total en riesgo. Responde si el
// operativo alcanza a cubrir la base priorizada. El excedente no es grupo de control
// (comite-adjudicacion.md, hallazgo 3): es el tramo de menor exposición.
//
// Cuadricula de unidades y no barra partida: la pregunta es cuántas personas entran y
// cuántas quedan afuera, y eso se cuenta. Cincuenta cuadros con diez llenos se lee sin
// leer el número; una barra al 20 % dice la proporción y nada más. El KPI va al costado,
// no arriba, porque la cifra y su dibujo son una sola lectura.

import { Lienzo, Unidades } from '../graficos.jsx'
import { entero, pct, meta } from '../agregacion.js'

const POR_CUADRO = 50

export default function M0({ info }) {
  const [capLo, capHi] = meta.capacidad_contacto
  const enRiesgo = info.enRiesgo
  const capacidadAlcanza = enRiesgo <= capHi
  const pctLo = enRiesgo ? Math.min(100, (100 * capLo) / enRiesgo) : 0
  const pctHi = enRiesgo ? Math.min(100, (100 * capHi) / enRiesgo) : 0
  const sinCubrir = Math.max(0, enRiesgo - capLo)

  return (
    <section className="pant">
      <h1 className="titulo">
        {capacidadAlcanza
          ? `La capacidad alcanza para contactar a los ${entero(enRiesgo)} en riesgo: este mes el corte no aprieta`
          : `La capacidad cubre entre el ${pct(pctLo)} y el ${pct(pctHi)} de los clientes en riesgo: el orden importa más que el alcance`}
      </h1>
      <p className="bajada">
        {entero(enRiesgo)} de {entero(info.elegibles)} elegibles en riesgo contra una
        capacidad de {entero(capLo)} a {entero(capHi)} contactos. El resto no es grupo de
        control: es el tramo de menor exposición, porque la lista se ordena y se corta.
      </p>

      <div className="lienzo cob">
        <div className="cob-kpi fijo">
          <div className="cob-dato">
            <span className="cob-etq">En riesgo este corte</span>
            <span className="cob-val tabular">{entero(enRiesgo)}</span>
            <span className="cob-ap">clientes elegibles sin compra reciente</span>
          </div>
          <div className="cob-dato">
            <span className="cob-etq">Los alcanza la capacidad</span>
            <span className="cob-val tabular acc">{entero(capLo)} a {entero(capHi)}</span>
            <span className="cob-ap">{pct(pctLo)} a {pct(pctHi)} del total</span>
          </div>
          <div className="cob-dato">
            <span className="cob-etq">Quedan sin contactar</span>
            <span className="cob-val tabular">{entero(sinCubrir)}</span>
            <span className="cob-ap">el tramo de menor exposición</span>
          </div>
        </div>

        <div className="cob-grilla">
          <div className="cob-leyenda">
            <span><i className="ll" />contactados con la capacidad mínima ({entero(capLo)})</span>
            <span><i className="lr" />hasta el máximo declarado ({entero(capHi)})</span>
            <span><i className="lt" />sin contactar</span>
            <span className="cob-uni">1 cuadro = {POR_CUADRO} clientes</span>
          </div>
          <Lienzo>
            {({ w, h }) => (
              <Unidades total={enRiesgo} cubiertoLo={capLo} cubiertoHi={capHi}
                        porCuadro={POR_CUADRO} w={w} h={h} />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
