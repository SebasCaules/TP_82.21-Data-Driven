// M0 — cobertura de la capacidad de Marketing contra el total en riesgo. Responde si el
// operativo alcanza a cubrir la base priorizada: el tramo cubierto corta en capLo (piso
// garantizado) y la banda capLo-capHi marca hasta donde puede estirarse. El excedente no es
// grupo de control (comite-adjudicacion.md, hallazgo 3): es el tramo de menor exposición.

import { Lienzo, BarraTramos } from '../graficos.jsx'
import { entero, pct, meta } from '../agregacion.js'

export default function M0({ info }) {
  const [capLo, capHi] = meta.capacidad_contacto
  const enRiesgo = info.enRiesgo
  // El tramo "cubierto" corta en capLo (piso garantizado de la capacidad), no en capHi:
  // asi el area del grafico no confunde el extremo optimista con lo efectivamente cubierto.
  const cubierto = Math.min(capLo, enRiesgo)
  const sinCubrir = Math.max(0, enRiesgo - capLo)
  const capacidadAlcanza = enRiesgo <= capHi
  const pctLo = enRiesgo ? Math.min(100, (100 * capLo) / enRiesgo) : 0
  const pctHi = enRiesgo ? Math.min(100, (100 * capHi) / enRiesgo) : 0
  const pctSinCubrir = enRiesgo ? (100 * sinCubrir) / enRiesgo : 0

  const tramos = [
    // Sin nota: el porcentaje de cobertura ya va en el encabezado de la tarjeta (abajo) y
    // repetirlo aca adentro del grafico era el mismo dato dos veces en la misma pantalla.
    {
      etiqueta: 'cubierto por capacidad',
      valor: cubierto,
      enfasis: true,
    },
    // Sin este tramo el rect queda en ancho 0 pero su rotulo se sigue dibujando fuera
    // del lienzo: se omite entero cuando no hay excedente.
    ...(sinCubrir > 0
      ? [{ etiqueta: 'no cubierto por la capacidad', valor: sinCubrir, enfasis: false }]
      : []),
  ]

  // La banda solo entra si el corte alto de capacidad cae dentro del total en riesgo:
  // si capHi >= enRiesgo, la banda se sale del lienzo (posiciones > w).
  const banda =
    capHi < enRiesgo
      ? [capLo, capHi, `capacidad ${entero(capLo)} a ${entero(capHi)}`]
      : undefined

  return (
    <section className="pant">
      <h1 className="titulo">
        {/* El titulo se calcula: con corte movil la cobertura va de 100 % en dic 2023
            (397 en riesgo, menos que la capacidad) a 20 % en dic 2025. Un rango fijo
            escrito a mano seria falso en la mayoria de los 25 cortes. */}
        {capLo >= enRiesgo
          ? `La capacidad alcanza para contactar a los ${entero(enRiesgo)} en riesgo: este mes el corte no aprieta`
          : `La capacidad cubre entre el ${pct(pctLo)} y el ${pct(pctHi)} de los clientes en riesgo: el orden importa más que el alcance`}
      </h1>
      <p className="bajada">
        {entero(enRiesgo)} de {entero(info.elegibles)} elegibles en riesgo contra una
        capacidad de {entero(capLo)} a {entero(capHi)} contactos. El resto no es grupo de
        control: es el tramo de menor exposición, porque la lista se ordena y se corta.
      </p>
      <div className="lienzo" style={{ flexDirection: 'column' }}>
        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Cobertura de la capacidad
            <b>{capacidadAlcanza ? '100 %' : `${pct(pctLo)}–${pct(pctHi)}`}</b>
          </div>
          <Lienzo>
            {({ w, h }) => (
              // alturaBarra grande a proposito: BarraTramos ya la topea en 84 px (no
              // "engorda" mas alla de eso), asi que pedir de mas solo asegura que sature
              // ese tope en vez de quedar chica y centrada en un lienzo alto.
              <BarraTramos tramos={tramos} w={w} h={h} formato={entero}
                           banda={banda} alturaBarra={Math.max(30, h - 54)} />
            )}
          </Lienzo>
        </div>
        {/* El resto del alto no es aire: hay un segundo dato del propio corte (cuanto
            queda afuera de la capacidad, o cuanto margen sobra) que no esta en el titulo
            ni en la bajada. Sin esta tarjeta esa cifra no se mostraba en ningun lado. */}
        <div className="tarjeta" style={{ flex: 1, minHeight: 0, justifyContent: 'center' }}>
          {sinCubrir > 0 ? (
            <>
              <div className="kpi-lbl">Clientes en riesgo sin capacidad este mes</div>
              <div className="kpi-val tabular">{entero(sinCubrir)}</div>
              <div className="kpi-sub">
                {pct(pctSinCubrir)} de los {entero(enRiesgo)} en riesgo, la de menor exposición
              </div>
            </>
          ) : (
            <>
              <div className="kpi-lbl">Margen de capacidad sin usar</div>
              <div className="kpi-val tabular">{entero(Math.max(0, capHi - enRiesgo))}</div>
              <div className="kpi-sub">
                contactos entre el piso garantizado ({entero(capLo)}) y el techo ({entero(capHi)})
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
