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
      enfasis: true,
    },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        Tres de cada diez envíos van a clientes que no dieron consentimiento
      </h1>

      <p className="bajada">
        <b>{entero(c.envios_a_no_acepta)}</b> de {entero(c.envios_base)} envíos
        ({pct(pctSinConsentimiento)}) van a clientes sin consentimiento.
      </p>
      <p className="bajada">
        Esa lista alcanza al <b>{pct(pctAlcance)}</b> de los {entero(c.clientes_no_acepta_total)}{' '}
        clientes que no consintieron.
      </p>
      <p className="bajada">
        {entero(c.envios_huerfanos)} envíos van a ids de cliente ausentes del maestro: quedan
        fuera de esta cuenta.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasH
              datos={datos} w={w} h={h}
              formato={entero}
              tituloEje="Envíos de la campaña, por consentimiento del cliente"
              anchoEtiqueta={168} notaAncho={118}
            />
          )}
        </Lienzo>
      </div>
    </section>
  )
}
