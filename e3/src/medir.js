// Ancho real de un texto en px, medido con canvas (27/10, W2). Es anchoTexto de src/graficos.jsx, que
// no se exporta y no se toca; lo usan los SVG propios de las vistas para decidir de qué lado de una
// línea va un rótulo o cuánto mide una columna. `mono`: la familia de --mono, que el canvas no resuelve
// como variable. Sin canvas (impresión, entorno sin DOM), una estimación que alcanza para presupuestar.

let ctx = null
let familia = null
let familiaMono = null

export function anchoTexto(t, px, peso = 400, mono = false) {
  const txt = String(t)
  try {
    if (!ctx) {
      ctx = document.createElement('canvas').getContext('2d')
      const cs = getComputedStyle(document.body)
      familia = cs.fontFamily || 'sans-serif'
      familiaMono = cs.getPropertyValue('--mono').trim() || 'monospace'
    }
    ctx.font = `${peso} ${px}px ${mono ? familiaMono : familia}`
    return ctx.measureText(txt).width
  } catch {
    return txt.length * px * 0.6
  }
}
