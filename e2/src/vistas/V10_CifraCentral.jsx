// V10 · La cifra central — ¿cambió la cifra del directorio? Compara el riesgo y la
// exposición del Entregable 1 contra el resultado después de las 15 decisiones DC, y agrega
// la lectura de sensibilidad al 31/08/2025 (DC-09, la ventana sin cobertura no confirmada).
// Todo el contenido sale de D2.vistas.V10 y D2.decisiones (CONTRACT_E2.md §3, vistas.V10):
// nada se escribe a mano salvo la frase de contrato sobre qué es la exposición, que no
// es un dato sino una regla del proyecto (DISEÑO.md: "no afirma recupero").
//
// La tarjeta de decisión es DC-04 (auditoría T-09/T-05): es la única fila de V.cambios, la
// única decisión que mueve la cifra; se dibuja con TarjetaDecision (D1-10), igual que en el
// resto del tablero. DC-09 no mueve esta cifra, solo pone la sensibilidad y el estado "en
// revisión" en duda: por eso va al pie junto con la salvedad de recupero, no en la tarjeta.
//
// Con una sola fila en V.cambios, un gráfico de barras es una barra sola sin comparación
// (D2-05): va una línea de texto por decisión. Las barras vuelven si hay más de una.
//
// Las tres columnas grandes usan la semántica compartida del tablero (estilos_e2.css): el
// par E1 → después es un único `.ban-par` (`.par-antes` gris, `.par-despues` azul), como en
// V04 y V06. La sensibilidad no es un "después" más, es la misma cifra leída con otro corte,
// así que va en una tarjeta aparte, neutra, con el borde punteado como forma que la distingue
// sin depender solo del color (regla 2 de DISEÑO.md).

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import TarjetaDecision from '../TarjetaDecision.jsx'
import { entero, pct, montoM, decimal, fechaCorta } from '../formato.js'

const V = D2.vistas.V10
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')

// El título dice el hallazgo con la cifra, calculado desde D2: si el payload cambia, el
// título cambia solo.
const TITULO = `Frente al E1, solo unir duplicados mueve el riesgo: ${pct(V.e1.pct)} → ${pct(V.despues.pct)}`

const PIE = `La exposición es facturación proyectada de clientes en riesgo, no recupero · riesgo en `
  + `revisión por los meses de 2025 sin cobertura confirmada (vista 3) · corte `
  + `${fechaCorta(D2.meta.corte_ref)}, sensibilidad ${fechaCorta(V.sens.corte)} · registro: `
  + `C03, C04, D05, D22, E01; DC-09`

export const meta = {
  id: 'V10',
  corto: 'La cifra central',
  titulo: TITULO,
  pie: PIE,
}

const signo = (v) => (v > 0 ? '+' : '')

const rotuloPanel = { font: '600 9.5px/1 var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--mut2)' }

function Cifra({ lbl, x, clase }) {
  return (
    <div className={`par-item ${clase}`} style={{ minWidth: 0 }}>
      <span className="par-lbl">{lbl}</span>
      <span className="par-val tabular" style={{ fontSize: 'clamp(34px, 4vw, 68px)' }}>{pct(x.pct)}</span>
      <span className="kpi-sub">
        {montoM(x.exposicion_M)} de exposición anual<br />
        {entero(x.en_riesgo)} en riesgo de {entero(x.elegibles)} con 3 compras o más
      </span>
    </div>
  )
}

export default function V10CifraCentral() {
  const unica = V.cambios.length === 1
  const datosPP = V.cambios.map((c) => ({ etiqueta: c.decision, valor: c.delta_pct_pp }))
  const datosM = V.cambios.map((c) => ({ etiqueta: c.decision, valor: c.delta_exposicion_M }))
  const formatoPP = (v) => `${signo(v)}${decimal(v, 1)} puntos`
  const formatoM = (v) => `${signo(v)}${decimal(v, 1)} M`
  // El eje repite el título con la unidad; rotular solo múltiplos de 0,5 evita marcas
  // encimadas en un panel angosto.
  const formatoEje = (v) => (Math.abs(v * 2 - Math.round(v * 2)) < 1e-9 ? decimal(v, 1) : '')

  return (
    <section className="pant v10">
      <h1 className="titulo">{TITULO}</h1>

      {/* La fila de arriba es la cifra del directorio: toma el alto libre y los números van
          un escalón más grandes que en el resto del tablero (es la única vista que los tiene
          como protagonistas); abajo, el cambio medido y la decisión con su alto propio. */}
      <div className="v10-hero" style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1 1 0', minHeight: 0 }}>
        <div className="tarjeta" style={{ flex: '2 1 0', minWidth: 0, justifyContent: 'center' }}>
          <span className="kpi-lbl">Clientes en riesgo entre los que tienen 3 compras o más</span>
          <div className="ban-par" style={{ marginTop: 7 }}>
            <Cifra lbl="Entregable 1 (01/09)" x={V.e1} clase="par-antes" />
            <span className="par-flecha" aria-hidden="true">→</span>
            <Cifra lbl="Después de las decisiones" x={V.despues} clase="par-despues" />
          </div>
        </div>

        <div
          className="tarjeta"
          style={{
            flex: '1 1 0', minWidth: 0, justifyContent: 'center',
            border: '1px dashed var(--bd)', borderTop: '3px dashed var(--mut2)',
          }}
        >
          <span className="kpi-lbl">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span
                aria-hidden="true"
                style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)', flexShrink: 0 }}
              />
              Medido al {fechaCorta(V.sens.corte)}, último mes confirmado
            </span>
          </span>
          <span className="kpi-val tabular" style={{ color: 'var(--ink)', fontSize: 'clamp(34px, 4vw, 68px)' }}>{pct(V.sens.pct)}</span>
          <span className="kpi-sub">
            {montoM(V.sens.exposicion_M)} de exposición anual<br />
            {entero(V.sens.en_riesgo)} en riesgo de {entero(V.sens.elegibles)} con 3 compras o más
          </span>
        </div>
      </div>

      <div className="lienzo" style={unica ? { flex: '0 0 auto', minHeight: 0 } : undefined}>
        <div className="tarjeta" style={{ flex: unica ? '1 1 0' : '1.6 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Cambio por decisión aplicada</span>
          {unica ? (
            <>
              <span className="kpi-sub">Única decisión que cambia el riesgo frente al E1</span>
              {V.cambios.map((c) => (
                <p key={c.decision} className="tabular" style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.35, color: 'var(--ink)' }}>
                  {c.decision}: {signo(c.delta_pct_pp)}{decimal(c.delta_pct_pp, 1)} puntos de riesgo
                  y {signo(c.delta_exposicion_M)}{montoM(c.delta_exposicion_M)} de exposición anual
                </p>
              ))}
            </>
          ) : (
            <>
              <span className="kpi-sub">
                {V.cambios.length} decisiones con impacto medido en esta vista, sobre el mismo
                par E1 → después
              </span>
              <div style={{ display: 'flex', gap: 'clamp(10px, 1.4vw, 22px)', flex: 1, minHeight: 0, marginTop: 6 }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={rotuloPanel}>Riesgo, en puntos porcentuales</span>
                  <Lienzo className="lienzo">
                    {({ w, h }) => (
                      <BarrasH datos={datosPP} w={w} h={h} formato={formatoPP} formatoEje={formatoEje}
                               anchoEtiqueta={54} tituloEje="Δ puntos" />
                    )}
                  </Lienzo>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={rotuloPanel}>Exposición anual, en millones</span>
                  <Lienzo className="lienzo">
                    {({ w, h }) => (
                      <BarrasH datos={datosM} w={w} h={h} formato={formatoM} formatoEje={formatoEje}
                               anchoEtiqueta={54} tituloEje="Δ ARS M" tope={2} />
                    )}
                  </Lienzo>
                </div>
              </div>
            </>
          )}
        </div>

        <TarjetaDecision dc={DC04} style={{ flex: '1 1 0', minWidth: 0 }} />
      </div>

      <p className="pie-vista">
        La exposición es facturación proyectada de clientes en riesgo, no recupero · riesgo en
        revisión por los meses de 2025 sin cobertura confirmada (vista 3) · corte{' '}
        <b>{fechaCorta(D2.meta.corte_ref)}</b>, sensibilidad <b>{fechaCorta(V.sens.corte)}</b>{' '}
        · registro: <b>C03, C04, D05, D22, E01; DC-09</b>
      </p>
    </section>
  )
}
