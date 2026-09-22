// Tarjeta de decisión única del tablero E2 (auditoría del 22/09, hallazgo D1-10: la misma
// pieza se dibujaba de seis formas). En todas las vistas se lee igual: rótulo mono
// «Decisión» con el id y el estado a la derecha; la decisión dicha en llano para el
// directorio (D2.decisiones[].llano, escrita en pipeline/build_e2.py contra la tabla del
// wiki); debajo la regla técnica tal como la tiene el wiki (decision) y, si hay, la
// justificación. Ningún texto se escribe acá: todo sale del payload. La posición de la
// tarjeta la decide el layout de cada vista.

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export default function TarjetaDecision({
  dc, rotulo = 'Decisión', sinJustificacion = false, sinRegla = false, style, children,
}) {
  if (!dc) return null
  return (
    <div className="tarjeta tarjeta-dec" style={style}>
      <span className="kpi-lbl"><span>{rotulo}</span><b>{dc.id} · {dc.estado}</b></span>
      <p className="dec-llano">{dc.llano ? dc.llano : cap(dc.decision)}</p>
      {dc.llano && !sinRegla && (
        <p className="dec-regla"><b>Regla.</b> {cap(dc.decision)}</p>
      )}
      {dc.justificacion && !sinJustificacion && (
        <p className="dec-just"><b>Por qué.</b> {cap(dc.justificacion)}</p>
      )}
      {children}
    </div>
  )
}
