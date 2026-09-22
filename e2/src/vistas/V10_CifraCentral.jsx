// V10 · La cifra central — ¿cambió la cifra del directorio? Compara el riesgo y la
// exposición del Entregable 1 contra el resultado después de las 15 decisiones DC, y agrega
// la lectura de sensibilidad al 31/08/2025 (DC-09, la ventana sin cobertura no confirmada).
// Todo el contenido sale de D2.vistas.V10 y D2.decisiones (CONTRACT_E2.md §3, vistas.V10):
// nada se escribe a mano salvo la frase de contrato sobre qué es la exposición, que no
// es un dato sino una regla del proyecto (DISEÑO.md: "no afirma recupero").
//
// La tarjeta de decisión es DC-04 (auditoría T-09/T-05): es la única fila de V.cambios, la
// única decisión que mueve la cifra, y decisión + justificación salen de D2.decisiones (regla
// 3 de DISEÑO.md). DC-09 no mueve esta cifra, solo pone la sensibilidad y el estado "en
// revisión" en duda: por eso va al pie junto con la salvedad de recupero, no en la tarjeta.
//
// Las tres columnas grandes usan la semántica compartida del tablero (estilos_e2.css): el
// par E1 → después es un único `.ban-par` (`.par-antes` gris, `.par-despues` azul), como en
// V04 y V06. La sensibilidad no es un "después" más, es la misma cifra leída con otro corte,
// así que va en una tarjeta aparte, neutra, con el borde punteado como forma que la distingue
// sin depender solo del color (regla 2 de DISEÑO.md).

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, montoM, decimal, fechaCorta } from '../formato.js'

const V = D2.vistas.V10
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')

// El título dice el hallazgo con la cifra (DC-04, la única decisión que mueve el par
// E1 → después), calculado desde D2: si el payload cambia, el título cambia solo.
const TITULO = `DC-04 es la única decisión que mueve la cifra: ${pct(V.e1.pct)} → ${pct(V.despues.pct)}`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · sensibilidad ${fechaCorta(V.sens.corte)} `
  + `· filas C03, C04, D22, E01 · la exposición es facturación proyectada de clientes en `
  + `riesgo, no recupero · en revisión por DC-09 (ver V03)`

export const meta = {
  id: 'V10',
  corto: 'La cifra central',
  titulo: TITULO,
  pie: PIE,
}

export default function V10CifraCentral() {
  const datosPP = V.cambios.map((c) => ({ etiqueta: c.decision, valor: c.delta_pct_pp }))
  const datosM = V.cambios.map((c) => ({ etiqueta: c.decision, valor: c.delta_exposicion_M }))
  const formatoPP = (v) => `${v > 0 ? '+' : ''}${decimal(v, 1)} pp`
  const formatoM = (v) => `${v > 0 ? '+' : ''}${decimal(v, 1)} M`
  // El eje repite el título con la unidad (regla 21), así que las marcas del eje no la
  // necesitan: con "0,0 pp", "0,2 pp"... a los cinco pasos se encimaban en un panel angosto.
  const formatoEje = (v) => decimal(v, 1)

  return (
    <section className="pant v10">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)' }}>
        <div className="tarjeta" style={{ flex: '2 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Riesgo de elegibles, mismo corte</span>
          <div className="ban-par" style={{ marginTop: 7 }}>
            <div className="par-item par-antes" style={{ minWidth: 0 }}>
              <span className="par-lbl">Entregable 1 (01/09)</span>
              <span className="par-val tabular">{pct(V.e1.pct)}</span>
              <span className="kpi-sub">
                {montoM(V.e1.exposicion_M)} de exposición anual<br />
                {entero(V.e1.en_riesgo)} / {entero(V.e1.elegibles)} elegibles en riesgo
              </span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues" style={{ minWidth: 0 }}>
              <span className="par-lbl">Después de las decisiones</span>
              <span className="par-val tabular">{pct(V.despues.pct)}</span>
              <span className="kpi-sub">
                {montoM(V.despues.exposicion_M)} de exposición anual<br />
                {entero(V.despues.en_riesgo)} / {entero(V.despues.elegibles)} elegibles en riesgo
              </span>
            </div>
          </div>
        </div>

        <div
          className="tarjeta"
          style={{
            flex: '1 1 0', minWidth: 0,
            border: '1px dashed var(--bd)', borderTop: '3px dashed var(--mut2)',
          }}
        >
          <span className="kpi-lbl">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)', flexShrink: 0 }}
              />
              Sensibilidad · corte {fechaCorta(V.sens.corte)}
            </span>
          </span>
          <span className="kpi-val tabular" style={{ color: 'var(--ink)' }}>{pct(V.sens.pct)}</span>
          <span className="kpi-sub">
            {montoM(V.sens.exposicion_M)} de exposición anual<br />
            {entero(V.sens.en_riesgo)} / {entero(V.sens.elegibles)} elegibles en riesgo
          </span>
        </div>
      </div>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: '1.6 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Cambio por decisión aplicada</span>
          <span className="kpi-sub">
            {V.cambios.length} decisión{V.cambios.length === 1 ? '' : 'es'} con impacto medido
            en esta vista, sobre el mismo par de elegibles E1 → después
          </span>
          <div style={{ display: 'flex', gap: 'clamp(10px, 1.4vw, 22px)', flex: 1, minHeight: 0, marginTop: 6 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ font: '600 9.5px/1 var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mut2)' }}>
                Riesgo, en puntos porcentuales
              </span>
              <Lienzo className="lienzo">
                {({ w, h }) => (
                  <BarrasH datos={datosPP} w={w} h={h} formato={formatoPP} formatoEje={formatoEje}
                           anchoEtiqueta={54} tituloEje="Δ pp" />
                )}
              </Lienzo>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ font: '600 9.5px/1 var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mut2)' }}>
                Exposición anual, en millones
              </span>
              <Lienzo className="lienzo">
                {({ w, h }) => (
                  <BarrasH datos={datosM} w={w} h={h} formato={formatoM} formatoEje={formatoEje}
                           anchoEtiqueta={54} tituloEje="Δ ARS M" />
                )}
              </Lienzo>
            </div>
          </div>
        </div>

        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">DC-04 <b>{DC04.estado}</b></span>
          <span className="kpi-sub">{DC04.archivo} · {DC04.hallazgo}</span>
          <p style={{ margin: '9px 0 0', fontSize: 12, lineHeight: 1.4, color: 'var(--ink)' }}>
            {DC04.decision}
          </p>
          {DC04.justificacion && (
            <p style={{ margin: '8px 0 0', fontSize: 11, lineHeight: 1.38, color: 'var(--mut)' }}>
              <b style={{ color: 'var(--mut2)' }}>Justificación.</b> {DC04.justificacion}
            </p>
          )}
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(D2.meta.corte_ref)}</b> · sensibilidad <b>{fechaCorta(V.sens.corte)}</b>{' '}
        · filas <b>C03, C04, D22, E01</b> · la exposición es facturación proyectada de clientes
        en riesgo, no recupero · en revisión por <b>DC-09</b> (ver V03)
      </p>
    </section>
  )
}
