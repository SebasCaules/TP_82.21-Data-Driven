// D0 — la pantalla consolidada. Es la respuesta a la tension entre D1 (una pantalla por
// grafico) y Few, citado en el propio rulebook: "consolidated and arranged on a single
// screen so the information can be monitored at a glance". El comite subio a esta pantalla
// el dueno y la cadencia del indicador (regla 24, lead with the ending), y puso el BAN -no
// el titulo- en el arriba-a-la-izquierda (regla 23 vs. Wexler).
//
// Composicion: DOS bloques, no cuatro. Antes eran el BAN, tres tarjetas de KPI en fila y el
// grafico, en forma de L, y se leia como un rejunte. Ahora la columna izquierda es "la
// cifra y lo que la sostiene" (BAN arriba, los tres apoyos repartidos abajo) y la derecha
// es la serie. Los tres apoyos dejaron de ser tarjetas: no son pares del BAN, son su letra
// chica, y como tarjetas competian con el.

import Ban from '../Ban.jsx'
import Semaforo, { estadoInverso, estadoRecompra } from '../Semaforo.jsx'
import { Lienzo, Linea } from '../graficos.jsx'
import { entero, meta, millones, pct, series } from '../agregacion.js'

export default function D0({ info }) {
  const pctRiesgo = info.clientes ? (100 * info.enRiesgo) / info.clientes : 0
  const sens90 = info.sensibilidad ? info.sensibilidad.find((x) => x.umbral === 90) : null
  const recompra = series.recompra_trimestral
    .filter((r) => r.tasa != null)
    .map((r) => ({ etiqueta: r.trimestre.replace('20', "'"), valor: r.tasa * 100 }))
  const ultima = recompra[recompra.length - 1]
  const [metaLo, metaHi] = meta.meta_recompra
  const estado = ultima ? estadoRecompra(ultima.valor, meta.meta_recompra) : 'fuera'

  // Los dos ultimos puntos de la serie, no dos anios escritos a mano: si la serie se
  // recorta o se extiende, la cifra sigue siendo la que corresponde.
  const [anteultimo, ultimoAnio] = series.base_activa_anual.slice(-2)
  const caidaBase = anteultimo && anteultimo.activos
    ? (100 * (anteultimo.activos - ultimoAnio.activos)) / anteultimo.activos
    : 0

  return (
    <section className="pant cab-1">
      {/* Una linea cada uno. El BAN es el heroe de esta pantalla, asi que el titulo va en
          cuerpo chico: si compite con la cifra, no gana ninguno de los dos.

          El titulo lleva SIEMPRE el n. Con cuatro filtros encima el recorte puede quedar en
          tres clientes, y "el 100,0 % del gasto anual" sobre tres clientes es cierto y
          enganoso a la vez. Con "3 de 3" al lado, el lector ve de que tamano es la base de
          la que se esta hablando sin tener que mirar la tarjeta. */}
      <h1 className="titulo" style={{ fontWeight: 500, fontSize: 'clamp(14px, 1.25vw, 18px)' }}>
        El {pct(info.pct)} del gasto anual está en {entero(info.enRiesgo)} de{' '}
        {entero(info.clientes)} clientes sin compra reciente
      </h1>
      <p className="bajada">
        En {ultimoAnio.anio} la base activa cayó {pct(caidaBase)} y la recompra a 90 días
        bajó a {pct(ultima ? ultima.valor : 0)}.
      </p>

      <div className="lienzo">
        <div className="col-cifra">
          <Ban info={info} grande />

          {/* Los tres apoyos repartidos en el alto que sobra: es lo que antes quedaba en
              blanco debajo del BAN. space-between los distribuye sin estirar el texto. */}
          <div className="tarjeta apoyos">
            <Dato
              etiqueta="Clientes en riesgo"
              valor={pct(pctRiesgo)}
              apoyo={`${entero(info.enRiesgo)} de ${entero(info.clientes)} con compra válida · ${entero(info.elegibles)} elegibles`}
              estado={<Semaforo estado={estadoInverso(pctRiesgo, meta.umbral_en_riesgo)}
                                de="clientes en riesgo" />}
            />
            <Dato
              etiqueta="Facturación histórica en riesgo"
              valor={`ARS ${millones(info.facturacionRiesgo)}`}
              apoyo={`${pct((100 * info.facturacionRiesgo) / (info.facturacion || 1))} de ARS ${millones(info.facturacion)} acumulados, no anuales`}
            />
            <Dato
              etiqueta="Umbral del proxy"
              valor={`ARS ${millones(sens90 ? sens90.exposicion : info.exposicion)}`}
              apoyo={info.sensibilidad
                ? `${info.sensibilidad.map((x) => `${x.umbral} d ${millones(x.exposicion)}`).join(' · ')} · base completa`
                : '—'}
            />
          </div>
        </div>

        <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
          <div className="kpi-lbl">
            Recompra · María G. · mensual
            <Semaforo estado={estado} tamano="grande" sufijo={pct(ultima ? ultima.valor : 0)}
                      de="recompra a 90 días" />
          </div>
          {/* Unica salvedad de la tarjeta, dicha una sola vez: la serie es global y no
              responde al corte ni a los filtros del resto de la pantalla. */}
          <div className="kpi-base" style={{ marginTop: 0, borderTop: 0, paddingTop: 2, minHeight: 0 }}>
            no responde al corte ni a los filtros
          </div>
          {/* Serie de tiempo trimestral contra una banda de meta: va en linea (regla 7).
              Sin banda2 (linea base) aca a proposito: el 8,5 % final cae adentro de esa
              banda y las dos etiquetas se pisan. D4 hace la comparacion completa contra la
              linea base con toda la pantalla disponible; aca alcanza con la meta, que es lo
              que el semaforo ya califica. */}
          <Lienzo>
            {({ w, h }) => (
              <Linea
                serie={recompra} w={w} h={h}
                formato={(v) => `${v.toFixed(1).replace('.', ',')}%`}
                banda={[metaLo, metaHi]}
                tituloEje="% que recompra en 90 días"
              />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

/** Un apoyo del BAN: rotulo, cifra y una linea de contexto. No es una tarjeta. */
function Dato({ etiqueta, valor, apoyo, estado }) {
  return (
    <div className="dato">
      <div className="dato-cab"><span>{etiqueta}</span>{estado}</div>
      <div className="dato-val tabular">{valor}</div>
      <div className="dato-sub">{apoyo}</div>
    </div>
  )
}
