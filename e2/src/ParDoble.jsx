// La misma cifra leída de dos maneras (24/09, sale de V03 para usarla en todo el tablero).
// No es un antes y un después: no lleva flecha ni el gris/azul del par (DISENO.md regla 3).
// Las dos cifras van en tinta. Si la segunda lectura es una sensibilidad (otro corte, otra
// base), lleva la marca punteada de V10: forma, no color. Sirve para dos cortes (V03), dos
// usos del mismo registro (V06) o la misma serie con y sin filas marcadas (V09).
//
// Rótulo arriba, cifra abajo: con rótulos de largo distinto las dos cifras quedan a la par.

export default function ParDoble({ grupo, lblRef, valRef, lblSens, valSens, sensibilidad = true, style }) {
  const lbl = { color: 'var(--mut2)' }
  const item = { flex: '1 1 0', color: 'var(--ink)', justifyContent: 'space-between', gap: 4, paddingTop: 5 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 0', minWidth: 0, ...style }}>
      {grupo && <span className="kpi-lbl" style={{ marginBottom: 0 }}>{grupo}</span>}
      <div className="ban-par" style={{ alignItems: 'stretch', marginTop: 0 }}>
        <div className="par-item" style={{ ...item, borderTop: '2px solid transparent' }}>
          <span className="par-lbl" style={lbl}>{lblRef}</span>
          {valRef}
        </div>
        <div className="par-item" style={{ ...item, borderTop: sensibilidad ? '2px dashed var(--mut2)' : '2px solid transparent' }}>
          <span className="par-lbl" style={{ ...lbl, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            {sensibilidad && (
              <span
                aria-hidden="true"
                style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)', flexShrink: 0, boxSizing: 'border-box', marginTop: 2 }}
              />
            )}
            <span>{lblSens}</span>
          </span>
          {valSens}
        </div>
      </div>
    </div>
  )
}
