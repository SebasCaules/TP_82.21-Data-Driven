// LineaIndice — varias series en «veces el nivel del año base», sobre UN solo eje (24/09,
// FOR-V08-1). Primitiva local del E2, generalizada del patrón de LineaDoble (V05): aquella
// tiene los campos de sus dos series fijos; esta recibe las series como datos.
//
// No es eje doble: todas las series van en la misma unidad (veces el nivel del año base), así
// que comparten escala y la distancia entre las líneas ES la magnitud que se compara (en V08,
// el precio a 0,92× contra el IPC a 13,2×). Con dos paneles de escalas propias las dos curvas
// terminaban a la misma altura y la magnitud quedaba solo en el texto.
//
// Eje X continuo por años: cada año es una franja con su número centrado y marcas finas en
// los límites, para que una serie fechada al inicio del año (el IPC acumulado) y otra a mitad
// de año (una mediana anual) no caigan sobre el mismo x. Eje Y de 0 al tope de escalaNice,
// con marcas enteras y una línea de referencia en el nivel base. Cada punto lleva su <title>.
// El rótulo final, al lado del último punto, hace de leyenda: no hay leyenda aparte. La serie
// punteada lleva además círculos huecos, así la distinción no depende solo del color (regla 2
// de DISENO.md). Sin gridlines ni marco, como las primitivas del E1.
//
// Texto en sans y sin mayúsculas (VIS-TRANSVERSAL-5), con los fontSize multiplicados por el
// factor k de escala.js (LEG-TRANSVERSAL-1). El ancho de los rótulos se mide con canvas, como
// hace anchoTexto en src/graficos.jsx, que no se exporta: el E1 no cambia.

import { escalaNice } from '../../src/graficos.jsx'
import { useEscalaTexto } from './escala.js'

let _ctx = null
let _fam = null
/** Ancho real de un texto con la familia del body (canvas). Sin canvas cae a una estimación
 *  por carácter, que para presupuestar márgenes alcanza. V08 lo usa también en sus barras. */
export function anchoTexto(t, fuente, peso = 400) {
  const txt = String(t ?? '')
  try {
    if (!_ctx) {
      _ctx = document.createElement('canvas').getContext('2d')
      _fam = getComputedStyle(document.body).fontFamily || 'sans-serif'
    }
    _ctx.font = `${peso} ${fuente}px ${_fam}`
    return _ctx.measureText(txt).width
  } catch {
    return txt.length * fuente * 0.58
  }
}

const coma = (v) => String(v).replace('.', ',')

/** y de una polilínea en x (interpolación lineal); null fuera de su tramo. */
function yEn(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [xa, ya] = pts[i]
    const [xb, yb] = pts[i + 1]
    if (x >= xa && x <= xb) return xb === xa ? ya : ya + ((x - xa) / (xb - xa)) * (yb - ya)
  }
  return null
}

/**
 * series: [{ id, puntos: [{ t, v, titulo }], tono, grosor, punteado, rotuloFinal }], en el
 *   orden de dibujo (la última queda arriba). t en años continuos: 2022,0 es el 1 de enero.
 * anios: los años del eje, en orden; cada uno es una franja de t = anio a t = anio + 1.
 * referencia: { v, texto }, la línea del nivel base («nivel 2022»).
 * tituloX: título del eje de tiempo; va al final del renglón de los años, sin sumar alto.
 */
export default function LineaIndice({ series, anios, w, h, referencia, tituloX, ariaLabel }) {
  const k = useEscalaTexto()
  const vals = series.flatMap((s) => s.puntos.map((p) => p.v)).filter((v) => v != null)
  if (!vals.length || !anios.length || w < 160) return null

  const fEje = 10.5 * k
  const fRot = 12 * k
  const sep = 7 * k                 // del último punto a su rótulo
  const t0 = anios[0]
  const t1 = anios[anios.length - 1] + 1
  // objetivo 3: con un máximo de 13,2 da 0 / 5 / 10 / 15, marcas enteras (con 4 salía 2,5).
  const { max, ticks } = escalaNice(Math.max(...vals, referencia?.v ?? 0), 3)
  const fmtY = (t) => `${coma(t)}×`

  const padL = Math.ceil(Math.max(...ticks.map((t) => anchoTexto(fmtY(t), fEje)))) + 10
  const padT = Math.ceil(fEje * 0.7) + 2          // media marca de arriba
  const padB = Math.ceil(fEje + 9)                // marcas y años
  // padR: lo que necesita el rótulo final más largo para entrar, sabiendo que el x de su
  // punto también depende de padR (x = padL + f·(w − padL − padR)). Se despeja padR.
  const anchoTitX = tituloX ? anchoTexto(tituloX, fEje) + 8 : 0
  let padR = Math.max(8, anchoTitX)
  const W = w - padL
  for (const s of series) {
    const u = s.puntos[s.puntos.length - 1]
    if (!s.rotuloFinal || !u) continue
    const f = (u.t - t0) / (t1 - t0)
    if (f <= 0) continue
    const tw = anchoTexto(s.rotuloFinal, fRot, 600)
    padR = Math.max(padR, W - (W - 2 - sep - tw) / f)
  }
  padR = Math.ceil(padR)

  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * iw
  const Y = (v) => padT + ih - (v / max) * ih
  const yBase = Y(0)
  const xFin = X(t1)

  const trazos = series.map((s) => ({ s, pts: s.puntos.map((p) => [X(p.t), Y(p.v)]) }))

  // Rótulos finales, separados en vertical si dos caen a la misma altura.
  const finales = trazos
    .filter(({ s, pts }) => s.rotuloFinal && pts.length)
    .map(({ s, pts }) => {
      const [x, y] = pts[pts.length - 1]
      return { id: s.id, texto: s.rotuloFinal, tono: s.tono, x: x + sep, y, w: anchoTexto(s.rotuloFinal, fRot, 600) }
    })
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < finales.length; i++) {
    if (finales[i].y - finales[i - 1].y < fRot + 2) finales[i].y = finales[i - 1].y + fRot + 2
  }

  // Referencia: la línea corta antes de un rótulo final que caiga a su altura (el del precio,
  // que vive pegado al nivel base), así el rótulo no queda tachado por ella.
  let ref = null
  if (referencia) {
    const y = Y(referencia.v)
    let xRefFin = xFin
    for (const r of finales) {
      if (Math.abs(r.y - y) < fRot * 0.7) xRefFin = Math.min(xRefFin, r.x - 5)
    }
    // Su texto va arriba de la línea, en el primer tramo libre desde la izquierda: el que no
    // cruza ninguna serie ni un rótulo final. Si no hay, la línea queda sola con su <title>.
    const tw = anchoTexto(referencia.texto, fEje)
    const base = y - 5
    const caja = (x) => ({ x1: x, x2: x + tw, y1: base - fEje * 0.8, y2: base + 1 })
    const choca = (c) =>
      trazos.some(({ pts }) => {
        // los círculos de los puntos piden un poco más de aire que el trazo
        if (pts.some(([px, py]) => px > c.x1 - 7 && px < c.x2 + 7 && py > c.y1 - 7 && py < c.y2 + 4)) return true
        for (let x = c.x1 - 3; x <= c.x2 + 3; x += 2) {
          const yy = yEn(pts, x)
          if (yy != null && yy >= c.y1 - 3 && yy <= c.y2 + 2) return true
        }
        return false
      }) ||
      finales.some((r) => r.x < c.x2 + 4 && r.x + r.w > c.x1 - 4 &&
        r.y - fRot * 0.6 < c.y2 && r.y + fRot * 0.6 > c.y1)
    let xTxt = null
    for (let x = padL + 6; x + tw <= xRefFin - 4; x += 4) {
      if (!choca(caja(x))) { xTxt = x; break }
    }
    ref = { y, xRefFin, xTxt, base }
  }

  const aria = ariaLabel || series.map((s) => `${s.rotuloFinal || s.id}: ` +
    s.puntos.map((p) => p.titulo).join(', ')).join('. ')

  return (
    <svg width={w} height={h} role="img" aria-label={aria} style={{ display: 'block' }}>
      {/* eje Y: 0 al tope, marcas enteras */}
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={'y' + t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke="var(--eje)" strokeWidth="1" />
          <text x={padL - 7} y={Y(t)} fontSize={fEje} fill="var(--mut)" textAnchor="end"
                dominantBaseline="central" className="tabular">{fmtY(t)}</text>
        </g>
      ))}

      {/* eje X: franjas de un año, marca fina en cada límite y el año centrado en su franja */}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {[...anios, t1].map((t) => (
        <line key={'l' + t} x1={X(t)} x2={X(t)} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
      ))}
      {anios.map((a) => (
        <text key={'a' + a} x={X(a + 0.5)} y={yBase + 6} fontSize={fEje} fill="var(--mut)"
              textAnchor="middle" dominantBaseline="hanging" className="tabular">{a}</text>
      ))}
      {tituloX && (
        <text x={xFin + 7} y={yBase + 6} fontSize={fEje} fill="var(--mut)"
              dominantBaseline="hanging">{tituloX}</text>
      )}

      {ref && (
        <g>
          <title>{`${referencia.texto}: ${fmtY(referencia.v)}`}</title>
          <line x1={padL} x2={ref.xRefFin} y1={ref.y} y2={ref.y} stroke="var(--mut)" strokeWidth="1"
                strokeDasharray="1 3" strokeLinecap="round" />
          {ref.xTxt != null && (
            <text x={ref.xTxt} y={ref.base} fontSize={fEje} fill="var(--mut2)">{referencia.texto}</text>
          )}
        </g>
      )}

      {trazos.map(({ s, pts }) => (
        <polyline key={'p' + s.id} points={pts.map((p) => p.join(',')).join(' ')} fill="none"
                  stroke={s.tono} strokeWidth={s.grosor ?? 2}
                  strokeDasharray={s.punteado ? '6 4' : undefined}
                  strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {trazos.map(({ s, pts }) => s.puntos.map((p, i) => (
        <g key={s.id + p.t}>
          <title>{p.titulo}</title>
          {/* círculo transparente más grande: el <title> se alcanza sin apuntar al píxel */}
          <circle cx={pts[i][0]} cy={pts[i][1]} r={9} fill="transparent" />
          <circle cx={pts[i][0]} cy={pts[i][1]} r={s.punteado ? 3.25 : 3.5}
                  fill={s.punteado ? 'var(--sup)' : s.tono} stroke={s.tono}
                  strokeWidth={s.punteado ? 1.5 : 1} />
        </g>
      )))}

      {finales.map((r) => (
        <text key={'r' + r.id} x={r.x} y={r.y} fontSize={fRot} fontWeight={600} fill={r.tono}
              dominantBaseline="central" className="tabular">{r.texto}</text>
      ))}
    </svg>
  )
}
