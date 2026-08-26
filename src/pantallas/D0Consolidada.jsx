// D0 — la pantalla consolidada. Es la respuesta a la tension entre D1 (una pantalla por
// grafico) y Few, citado en el propio rulebook: "consolidated and arranged on a single
// screen so the information can be monitored at a glance". El comite subio a esta pantalla
// el pedido concreto y el dueno/cadencia del indicador (regla 24, lead with the ending), y
// puso el BAN -no el titulo- en el arriba-a-la-izquierda (regla 23 vs. Wexler).

import Ban from '../Ban.jsx'
import Semaforo, { estadoInverso, estadoRecompra } from '../Semaforo.jsx'
import { Lienzo, Linea } from '../graficos.jsx'
import { entero, mesCorte, meta, millones, pct, series } from '../agregacion.js'

// Orden documentado en docs/diseno-pantallas.md (bloque Directorio, post-split E-1):
// D0 D1 D2 D3 D4 D5a D5b D6 D7 → D7 es la novena pantalla, indice 8.
const INDICE_D7 = 8

export default function D0({ info, irA }) {
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
    <section className="pant">
      <h1 className="titulo" style={{ fontWeight: 500, fontSize: 'clamp(14px, 1.25vw, 18px)' }}>
        Casi la mitad del ingreso anual de la base está en clientes hoy en riesgo por falta de compra reciente
      </h1>

      <p className="bajada">
        La base venía creciendo hasta 2024 y las campañas se deciden por criterio comercial.
        En {ultimoAnio.anio} la base activa cayó {pct(caidaBase)} y la recompra a 90 días bajó a{' '}
        {pct(ultima ? ultima.valor : 0)}.
      </p>

      <div className="lienzo">
        <div style={{ flex: '0 0 clamp(300px, 31%, 440px)', display: 'flex' }}>
          <Ban info={info} grande />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(6px,1vh,12px)', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 'clamp(8px,1.1vw,16px)' }}>
            <Kpi
              etiqueta="Clientes en riesgo"
              valor={pct(pctRiesgo)}
              apoyo={`${entero(info.enRiesgo)} de ${entero(info.clientes)} con compra válida`}
              baseline={`${entero(info.elegibles)} elegibles (3 compras o más)`}
              estado={<Semaforo estado={estadoInverso(pctRiesgo, meta.umbral_en_riesgo)} />}
            />
            <Kpi
              etiqueta="Facturación histórica en riesgo"
              valor={`ARS ${millones(info.facturacionRiesgo)}`}
              apoyo={`${pct((100 * info.facturacionRiesgo) / (info.facturacion || 1))} de ARS ${millones(info.facturacion)}`}
              baseline="histórico acumulado, no anual"
            />
            <Kpi
              etiqueta="Rango del umbral del proxy"
              valor={`ARS ${millones(sens90 ? sens90.exposicion : info.exposicion)}`}
              apoyo={info.sensibilidad
                ? info.sensibilidad.map((x) => `${x.umbral} d ${millones(x.exposicion)}`).join(' · ')
                : '—'}
              baseline={`casi insensible al umbral · base completa del corte, sin filtros`}
            />
          </div>

          <button
            type="button"
            onClick={() => irA(INDICE_D7)}
            style={{
              background: 'none', border: 0, padding: 0, margin: 0, font: 'inherit',
              color: 'inherit', textAlign: 'left', cursor: 'pointer',
            }}
          >
            <span className="kpi-sub" style={{ textDecoration: 'underline' }}>
              Tres decisiones, ninguna cuesta presupuesto nuevo → ver el pedido en D7
            </span>
          </button>

          <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
            <div className="kpi-lbl">
              Recompra 90 días · María G. · cadencia mensual
              <Semaforo estado={estado} sufijo={pct(ultima ? ultima.valor : 0)} />
            </div>
            {/* La serie es global: no responde al corte ni a los filtros. Sin esta linea,
                con Region=Cuyo el BAN se recalcula y este 8,5 % sigue siendo el de todo el
                pais, y se lee como si fuera el de Cuyo. */}
            <div className="kpi-base" style={{ marginTop: 0, borderTop: 0, paddingTop: 2 }}>
              serie global {recompra[0]?.etiqueta.replace("'", '20')}–
              {ultima?.etiqueta.replace("'", '20')} · no responde al corte ni a los filtros
            </div>
            <Lienzo>
              {({ w, h }) => (
                <Linea
                  serie={recompra} w={w} h={h}
                  formato={(v) => `${v.toFixed(1).replace('.', ',')}%`}
                  banda={[metaLo, metaHi]} banda2={meta.base_recompra}
                  tituloEje="% que vuelve a comprar en 90 días"
                />
              )}
            </Lienzo>
          </div>
        </div>
      </div>
    </section>
  )
}

function Kpi({ etiqueta, valor, apoyo, baseline, estado }) {
  return (
    <div className="tarjeta kpi" style={{ flex: 1, minWidth: 0 }}>
      <div className="kpi-lbl">{etiqueta}{estado}</div>
      <div className="kpi-val tabular">{valor}</div>
      <div className="kpi-sub">{apoyo}</div>
      <div className="kpi-base">{baseline}</div>
    </div>
  )
}
