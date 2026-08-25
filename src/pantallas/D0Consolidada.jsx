// D0 — la pantalla consolidada. Es la respuesta a la tension entre D1 (una pantalla por
// grafico) y Few, citado en el propio rulebook: "consolidated and arranged on a single
// screen so the information can be monitored at a glance". Cuesta una pantalla y le da al
// roleplay el vistazo unico que la definicion de dashboard exige, sin romper D1: el resto
// del bloque sigue siendo un grafico por pantalla.

import Ban from '../Ban.jsx'
import { Lienzo, Linea } from '../graficos.jsx'
import { entero, mesCorte, meta, millones, pct, series } from '../agregacion.js'

export default function D0({ info }) {
  const recompra = series.recompra_trimestral
    .filter((r) => r.tasa != null)
    .map((r) => ({ etiqueta: r.trimestre.replace('20', "'"), valor: r.tasa * 100 }))
  const ultima = recompra[recompra.length - 1]
  const [metaLo, metaHi] = meta.meta_recompra

  return (
    <section className="pant">
      <span className="rotulo diagnostico">Diagnóstico · datos históricos</span>
      <h1 className="titulo">
        Casi la mitad del ingreso anual de la base depende de clientes que ya dejaron de comprar
      </h1>

      <div className="lienzo">
        <div style={{ flex: '0 0 clamp(300px, 31%, 440px)', display: 'flex' }}>
          <Ban info={info} grande />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1.3vh,16px)', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 'clamp(8px,1.1vw,16px)' }}>
            <Kpi
              etiqueta="Clientes en riesgo"
              valor={`${pct((100 * info.enRiesgo) / (info.clientes || 1))}`}
              apoyo={`${entero(info.enRiesgo)} de ${entero(info.clientes)} con compra válida`}
              baseline={`${entero(info.elegibles)} elegibles (3 compras o más)`}
            />
            <Kpi
              etiqueta="Facturación histórica en riesgo"
              valor={`ARS ${millones(info.facturacionRiesgo)}`}
              apoyo={`${pct((100 * info.facturacionRiesgo) / (info.facturacion || 1))} de ARS ${millones(info.facturacion)}`}
              baseline="histórico acumulado, no anual"
            />
          </div>

          <div className="tarjeta" style={{ flex: 1, minHeight: 0 }}>
            <div className="kpi-lbl">
              Recompra a 90 días contra la meta
              <b> {ultima ? pct(ultima.valor) : '—'}</b>
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

      <p className="bajada">
        El tablero <b>no</b> afirma que una campaña recupere esos ARS {millones(info.exposicion)}:
        es la facturación anual que hoy depende de clientes inactivos. Medir recupero exige un
        grupo de control, que todavía no existe.
      </p>
    </section>
  )
}

function Kpi({ etiqueta, valor, apoyo, baseline }) {
  return (
    <div className="tarjeta kpi" style={{ flex: 1, minWidth: 0 }}>
      <div className="kpi-lbl">{etiqueta}</div>
      <div className="kpi-val tabular">{valor}</div>
      <div className="kpi-sub">{apoyo}</div>
      <div className="kpi-base">{baseline}</div>
    </div>
  )
}
