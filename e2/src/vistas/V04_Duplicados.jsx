// V04 · Duplicados de cliente — qué cambia al unir identidades (DC-04, Clientes ·
// Identidad_resuelta). Compara la base de clientes antes y después del mapeo a
// id_cliente_canonico, sobre el mismo corte (CORTE_REF, 2025-12-31): menos clientes porque
// varios ids se funden en una sola persona, y el riesgo sube porque un cliente que antes
// contaba como dos (uno activo y uno inactivo) ahora es uno solo, y ese uno cae en riesgo.
//
// DISENO.md fija el lienzo de esta vista: tres pares grandes (clientes, riesgo, exposición)
// y BarrasH de personas por cantidad de ids. Los valores y el texto de la decisión salen
// enteros de D2 (CONTRACT_E2.md §3, vistas.V04 y decisiones DC-04): nada se escribe a mano.

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, montoM, fechaCorta } from '../formato.js'

const V = D2.vistas.V04
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')

const TOTAL_PERSONAS = V.personas_por_n_ids.reduce((s, p) => s + p.personas, 0)
const TOTAL_IDS = V.personas_por_n_ids.reduce((s, p) => s + p.n_ids * p.personas, 0)

// El título dice el hallazgo con la cifra (duplicados_con_actividad) y el corrimiento del
// riesgo (antes.pct → despues.pct), calculados desde D2: si el payload cambia, el título
// cambia solo.
const TITULO = `Resolver ${entero(V.duplicados_con_actividad)} clientes duplicados sube el `
  + `riesgo de ${pct(V.antes.pct)} a ${pct(V.despues.pct)}`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(V.antes.clientes)} clientes `
  + `· fila D22 · riesgo y exposición en revisión por DC-09`

export const meta = {
  id: 'V04',
  corto: 'Duplicados de cliente',
  titulo: TITULO,
  pie: PIE,
}

/** Un par grande antes/después, para la fila de tres métricas de arriba. */
function ParAntesDespues({ etiqueta, antes, despues }) {
  return (
    <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
      <span className="kpi-lbl">{etiqueta}</span>
      <div className="ban-par" style={{ marginTop: 7 }}>
        <div className="par-item par-antes">
          <span className="par-lbl">Antes</span>
          <span className="par-val tabular">{antes}</span>
        </div>
        <span className="par-flecha" aria-hidden="true">→</span>
        <div className="par-item par-despues">
          <span className="par-lbl">Después</span>
          <span className="par-val tabular">{despues}</span>
        </div>
      </div>
    </div>
  )
}

export default function V04Duplicados() {
  const datosBarras = V.personas_por_n_ids.map((p) => ({
    etiqueta: `${p.n_ids} ids`,
    valor: p.personas,
  }))

  return (
    <section className="pant v04">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)' }}>
        <ParAntesDespues etiqueta="Clientes"
                          antes={entero(V.antes.clientes)} despues={entero(V.despues.clientes)} />
        <ParAntesDespues etiqueta="Riesgo"
                          antes={pct(V.antes.pct)} despues={pct(V.despues.pct)} />
        <ParAntesDespues etiqueta="Exposición anual"
                          antes={montoM(V.antes.exposicion_M)} despues={montoM(V.despues.exposicion_M)} />
      </div>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: '3 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Personas con más de un id activo</span>
          <span className="kpi-sub">
            {entero(TOTAL_IDS)} ids se funden en {entero(TOTAL_PERSONAS)} personas
          </span>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH
                datos={datosBarras} w={w} h={h}
                formato={entero}
                anchoEtiqueta={62}
                tituloEje="Personas"
              />
            )}
          </Lienzo>
        </div>

        <div className="tarjeta" style={{ flex: '2 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">DC-04 <b>{DC04.estado}</b></span>
          <span className="kpi-sub">{DC04.archivo} · {DC04.hallazgo}</span>
          <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.42, color: 'var(--ink)' }}>
            {DC04.decision}
          </p>
          {DC04.justificacion && (
            <p style={{ margin: '8px 0 0', fontSize: 11.5, lineHeight: 1.4, color: 'var(--mut)' }}>
              <b style={{ color: 'var(--mut2)' }}>Justificación.</b> {DC04.justificacion}
            </p>
          )}
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(D2.meta.corte_ref)}</b> · base: <b>{entero(V.antes.clientes)}</b>{' '}
        clientes · fila <b>D22</b> · riesgo y exposición en revisión por <b>DC-09</b>
      </p>
    </section>
  )
}
