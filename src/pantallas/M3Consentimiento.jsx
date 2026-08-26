// M3 — consentimiento de la lista de Marketing. Responde si la lista se puede ejecutar tal
// cual: dos barras desde cero sobre series.consentimiento, envíos con consentimiento contra
// envíos sin. Se presenta como incumplimiento reconocido por el negocio, con corrección en
// marcha (Ley 25.326, ya declarada en la Parte D §6.1). Serie global: no depende del corte
// ni de los filtros.

import { Lienzo, BarrasH } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'

export default function M3() {
  const c = series.consentimiento
  const conConsentimiento = c.envios_base - c.envios_a_no_acepta
  const pctSinConsentimiento = 100 * c.pct_envios_a_no_acepta
  const pctConConsentimiento = 100 - pctSinConsentimiento
  const pctAlcance = 100 * c.pct_alcance

  const datos = [
    {
      etiqueta: 'Con consentimiento',
      valor: conConsentimiento,
      nota: `${pct(pctConConsentimiento)} del total`,
      enfasis: false,
    },
    {
      etiqueta: 'Sin consentimiento',
      valor: c.envios_a_no_acepta,
      nota: `${pct(pctSinConsentimiento)} del total`,
      excepcion: true,
    },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        Tres de cada diez envíos van a clientes que no dieron consentimiento
      </h1>

      {/* Una sola bajada, no tres: el titulo ya da el dato de sin-consentimiento (y el
          grafico lo repite con nota por barra), asi que acá van solo los dos datos que no
          estan en ningun otro lado. Tres <p className="bajada"> con su alto fijo de dos
          lineas cada uno era el grueso del hueco blanco de esta pantalla. */}
      {/* CIF-09: la bajada vieja decia "quedan fuera de esta cuenta" y se podia leer como
          que los 46 huerfanos quedan afuera del grafico entero. No es asi: conConsentimiento
          = envios_base - envios_a_no_acepta los deja adentro de la barra "Con consentimiento"
          porque no hay maestro contra el cual clasificarlos. Se declara sin tocar los datos. */}
      <p className="bajada">
        Esa lista alcanza al <b>{pct(pctAlcance)}</b> de los {entero(c.clientes_no_acepta_total)}{' '}
        clientes que no consintieron. {entero(c.envios_huerfanos)} envíos van a ids ausentes
        del maestro: no entran en esta cuenta, pero la barra sí los cuenta.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={entero}
              tituloEje="Envíos de la campaña, por consentimiento del cliente"
              anchoEtiqueta={168}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
