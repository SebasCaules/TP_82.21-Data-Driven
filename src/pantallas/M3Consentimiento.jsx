// M3 — consentimiento, abierto por año (dirección 12c). Antes era una sola barra al 100 %
// con el agregado de los cuatro años. Una cifra acumulada no distingue un incumplimiento
// que se está corrigiendo de uno estable, y esa es la primera pregunta que hace cualquiera
// que lo lee. Abierto por año, cada barra va sobre SU propia base de envíos, que cambia
// fuerte entre años (3.915 en 2023 contra 8.028 en 2024): comparar conteos crudos no diría
// nada, comparar participaciones sí.
//
// Lo que muestra el dibujo NO es lo que la dirección 12c anticipaba. El wireframe titulaba
// "la corrección ya está en marcha" con una caída de 38,2 % a 22,6 %; los datos reales dan
// 29,5 / 31,2 / 30,3 / 29,6 %, una amplitud de 1,7 pp en cuatro años. No hay corrección en
// marcha: hay una tasa estable. El título dice eso, no lo otro. El ancla
// "amplitud del incumplimiento entre anios (pp)" de build.py lo deja fijo: si algún día la
// serie se moviera de verdad, el pipeline corta y este texto se reescribe.
//
// Orden de los tramos: el cumplidor arranca contra el eje en el azul de énfasis y el
// bloqueante cierra a la derecha, en terracota con trama. La trama es lo que lo sostiene en
// blanco y negro, donde el color no existe.
//
// Los años van de más reciente a más viejo, con el último arriba y en énfasis: la lectura
// arranca por el año del corte, no por el más lejano.
//
// Serie global, ni corte ni filtros (Ley 25.326, declarada en la Parte D §6.1).

import { Lienzo, BarrasApiladas100 } from '../graficos.jsx'
import { entero, pct, series } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

export default function M3() {
  const c = series.consentimiento
  const anios = series.consentimiento_anual
  const pctAgregado = 100 * c.pct_envios_a_no_acepta
  const pctAlcance = 100 * c.pct_alcance

  const pcts = anios.map((a) => 100 * a.pct_sin_consentimiento)
  const minimo = Math.min(...pcts)
  const maximo = Math.max(...pcts)

  // El año del corte va arriba y a full; los tres anteriores, translúcidos (`apagaResto`):
  // la pregunta de la pantalla es si la lista se puede ejecutar HOY, y los otros tres años
  // son la evidencia de que el incumplimiento no está bajando solo.
  const reciente = anios[anios.length - 1]
  const filas = [...anios].reverse().map((a) => {
    const con = a.envios - a.sin_consentimiento
    const pctSin = 100 * a.pct_sin_consentimiento
    return {
      etiqueta: String(a.anio),
      sub: `${entero(a.envios)} envíos`,
      enfasis: a === reciente,
      segmentos: [
        {
          clave: 'Con consentimiento', valor: con, tono: 'var(--acc)', tinta: '#fff',
          enfasis: true,
          texto: `${entero(con)} · ${pct(100 - pctSin)}`,
        },
        {
          clave: 'Sin consentimiento', valor: a.sin_consentimiento, tono: 'trama-exc',
          tinta: '#fff', excepcion: true,
          texto: `${entero(a.sin_consentimiento)} · ${pct(pctSin)}`,
        },
      ],
    }
  })

  const leyenda = [
    { etiqueta: 'con consentimiento', tono: 'var(--acc)', enfasis: true },
    { etiqueta: 'sin consentimiento · bloqueante', tono: 'trama-exc' },
  ]

  return (
    <section className="pant">
      <h1 className="titulo">
        El incumplimiento va de {pct(minimo)} a {pct(maximo)} en cuatro años: no baja
      </h1>

      {/* CIF-09: los 46 huérfanos no quedan afuera del gráfico. Sin maestro contra el cual
          clasificarlos cuentan en el denominador del año y no en el numerador, igual que en
          la serie agregada. Se declara sin tocar los datos. */}
      <p className="bajada">
        El {pct(pctAgregado)} agregado no esconde ninguna corrección en marcha.
        {' '}{entero(c.envios_a_no_acepta)} de {entero(c.envios_base)} envíos salen{' '}
        <Def id="consentimiento">sin consentimiento</Def> y alcanzan al <b>{pct(pctAlcance)}</b>{' '}
        de los {entero(c.clientes_no_acepta_total)} clientes que no consintieron.
      </p>

      <div className="lienzo">
        <Lienzo>
          {({ w, h }) => (
            <BarrasApiladas100
              filas={filas} leyenda={leyenda} w={w} h={h}
              anchoEtiqueta={132}
              alturaBarra={110}
              apagaResto
              tituloEje="Composición de los envíos del año"
            />
          )}
        </Lienzo>
      </div>

      <p className="z-nota">
        La meta es cero, no una tendencia: {pct(minimo)} sigue siendo incumplimiento.
        Los {entero(c.envios_huerfanos)} envíos a ids ausentes del maestro cuentan en la base
        de su año y no en el tramo bloqueante: no se pueden clasificar.
      </p>
    </section>
  )
}
