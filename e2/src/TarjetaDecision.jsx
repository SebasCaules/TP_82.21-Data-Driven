// Tarjeta de decisión única del tablero E2 (auditoría del 22/09, hallazgo D1-10: la misma
// pieza se dibujaba de seis formas).
//
// (25/09, regla del usuario) La tarjeta dice solo qué se decidió: el llano de cada decisión
// (D2.decisiones[].llano, escrito en pipeline/build_e2.py contra la tabla del wiki). Sin la
// regla técnica ni la justificación, ni en pantalla ni en la hoja impresa: van en el title, para
// quien presenta. Tampoco acepta contenido propio de la vista (children): lo que una vista quiera
// mostrar además va en su banda de cifras o en su gráfico. Va siempre en el mismo lugar, arriba a
// la derecha, dentro de la banda de cifras (Banda.jsx), con el mismo ancho y alto en todas las
// vistas. Con dos decisiones (V06, V07) la misma tarjeta las lista, cada una con su id y estado.

import { estadoVisible } from './estados.js'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const llano = (d) => (d.llano ? d.llano : cap(d.decision))

export default function TarjetaDecision({ dc, dcs, style }) {
  const lista = (dcs ?? [dc]).filter(Boolean)
  if (!lista.length) return null
  // «a confirmar» si la decisión tiene un pedido abierto en V12, como en V01 (estados.js).
  const title = lista.map((d) => `${d.id} · regla: ${cap(d.decision)}` +
    (d.justificacion ? ` · por qué: ${cap(d.justificacion)}` : '')).join('\n')
  if (lista.length === 1) {
    const d = lista[0]
    return (
      <div className="tarjeta tarjeta-dec" style={style} title={title}>
        <span className="kpi-lbl"><span>Decisión</span><b>{d.id} · {estadoVisible(d)}</b></span>
        <p className="dec-llano">{llano(d)}</p>
      </div>
    )
  }
  return (
    <div className="tarjeta tarjeta-dec varias" style={style} title={title}>
      <span className="kpi-lbl"><span>Decisiones</span></span>
      {lista.map((d) => (
        <p key={d.id} className="dec-llano">
          <b className="dec-id">{d.id} · {estadoVisible(d)}</b> {llano(d)}
        </p>
      ))}
    </div>
  )
}
