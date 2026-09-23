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
import TarjetaDecision from '../TarjetaDecision.jsx'
import ValorMonto from '../ValorMonto.jsx'

const V = D2.vistas.V04
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')

const TOTAL_PERSONAS = V.personas_por_n_ids.reduce((s, p) => s + p.personas, 0)
const TOTAL_IDS = V.personas_por_n_ids.reduce((s, p) => s + p.n_ids * p.personas, 0)

// 5.978 − 348 ≠ 5.634 (auditoría T-08, CX-04): el mapeo a id_cliente_canonico no solo funde
// ids con actividad propia en otro cliente, también suma a la base ids canónicos que no
// tenían compra propia y antes no contaban como cliente. N sale de D2 cuando el payload ya
// trae la clave; si todavía no la trae, se despeja de la misma identidad contable.
const CANONICOS_SIN_COMPRA = V.canonicos_sin_compra_propia
  ?? (V.despues.clientes - V.antes.clientes + V.duplicados_con_actividad)

const NOTA_CLIENTES = `${entero(V.duplicados_con_actividad)} números de cliente con compras se `
  + `suman a la persona a la que pertenecen; ${entero(CANONICOS_SIN_COMPRA)} personas entran porque `
  + `solo compraban con otro número: ${entero(V.antes.clientes)} − `
  + `${entero(V.duplicados_con_actividad)} + ${entero(CANONICOS_SIN_COMPRA)} = `
  + `${entero(V.despues.clientes)}`

// El título dice el hallazgo con la cifra (duplicados_con_actividad) y el corrimiento del
// riesgo (antes.pct → despues.pct), calculados desde D2: si el payload cambia, el título
// cambia solo.
const TITULO = `Resolver ${entero(V.duplicados_con_actividad)} clientes duplicados sube el `
  + `riesgo de ${pct(V.antes.pct)} a ${pct(V.despues.pct)}`

const PIE = `riesgo y exposición en revisión por los meses de 2025 sin cobertura confirmada `
  + `(vista 3) · corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(V.antes.clientes)} clientes `
  + `· registro: D22, E10 (personas por cantidad de números de cliente); DC-09`

export const meta = {
  id: 'V04',
  corto: 'Duplicados de cliente',
  titulo: TITULO,
  pie: PIE,
}

/** Un par grande antes/después, para la fila de tres métricas de arriba. */
// flex por tarjeta: la de montos necesita mas ancho porque .par-val no parte la cifra.
function ParAntesDespues({ etiqueta, antes, despues, nota, flex = '1 1 0' }) {
  return (
    <div className="tarjeta" style={{ flex, minWidth: 0 }}>
      <span className="kpi-lbl">{etiqueta}</span>
      <div className="ban-par" style={{ marginTop: 7 }}>
        <div className="par-item par-antes">
          <span className="par-lbl">Antes</span>
          {typeof antes === 'string' ? <span className="par-val tabular">{antes}</span> : antes}
        </div>
        <span className="par-flecha" aria-hidden="true">→</span>
        <div className="par-item par-despues">
          <span className="par-lbl">Después</span>
          {typeof despues === 'string' ? <span className="par-val tabular">{despues}</span> : despues}
        </div>
      </div>
      {nota && <span className="kpi-sub" style={{ minHeight: 0 }}>{nota}</span>}
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
        <ParAntesDespues etiqueta="Clientes" nota={NOTA_CLIENTES} flex="0.85 1 0"
                          antes={entero(V.antes.clientes)} despues={entero(V.despues.clientes)} />
        <ParAntesDespues etiqueta="Riesgo" flex="0.85 1 0"
                          antes={pct(V.antes.pct)} despues={pct(V.despues.pct)} />
        <ParAntesDespues etiqueta="Exposición anual" flex="1.3 1 0"
                          antes={<ValorMonto texto={montoM(V.antes.exposicion_M)} />}
                          despues={<ValorMonto texto={montoM(V.despues.exposicion_M)} />} />
      </div>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: '3 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Personas registradas con más de un número de cliente</span>
          <span className="kpi-sub">
            {entero(TOTAL_IDS)} números de cliente son {entero(TOTAL_PERSONAS)} personas: sobran{' '}
            {entero(TOTAL_IDS - TOTAL_PERSONAS)}, y {entero(V.duplicados_con_actividad)} de ellos
            tenían compras (E10)
          </span>
          {/* tope de alto: a 1920 las tres barras quedaban de 128 px cada una */}
          <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: 3 * 64 + 56, display: 'flex',
                        flexDirection: 'column', justifyContent: 'center' }}>
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
        </div>

        <TarjetaDecision dc={DC04} style={{ flex: '2 1 0', minWidth: 0 }}>
          <span className="kpi-sub" style={{ marginTop: 8 }}>{DC04.archivo} · {DC04.hallazgo}</span>
        </TarjetaDecision>
      </div>

      <p className="pie-vista">
        riesgo y exposición en revisión por los meses de 2025 sin cobertura confirmada (vista 3)
        {' '}· corte <b>{fechaCorta(D2.meta.corte_ref)}</b> · base: <b>{entero(V.antes.clientes)}</b>{' '}
        clientes · registro: <b>D22</b>, <b>E10</b> (personas por cantidad de números de cliente);{' '}
        <b>DC-09</b>
      </p>
    </section>
  )
}
