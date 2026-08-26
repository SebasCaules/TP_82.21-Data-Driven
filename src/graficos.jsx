// Primitivas de grafico. SVG a mano, sin libreria: el peso extra no se justifica
// para cuatro formas y el control fino del alto es lo que hace posible D1 (sin scroll).
//
// Reglas del rulebook que estan implementadas aca y no se pueden desactivar por prop:
//   4  toda barra arranca en cero          12  sin borde de grafico ni gridlines
//   6  barra horizontal para categorias    14  etiqueta directa sobre la serie
//   7  linea para series de tiempo         16  nada de texto en diagonal
//   18 un solo color de enfasis            21  todo eje lleva titulo
// Prohibidas por construccion: torta, dona, 3D, eje Y secundario.

import { useEffect, useRef, useState } from 'react'

/** Mide la caja y devuelve px reales. El SVG se dibuja al tamano medido en vez de
 *  escalarse con viewBox: escalar deformaria la tipografia y rompe la legibilidad
 *  en proyector. */
export function useMedida() {
  const ref = useRef(null)
  const [caja, setCaja] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect
      setCaja({ w: Math.floor(r.width), h: Math.floor(r.height) })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, caja]
}

/** Caja que mide y dibuja. El SVG va en position:absolute a proposito: con tamano fijo
 *  en px dentro del flujo, el hijo impide que el contenedor flex se achique y se arma un
 *  bucle (el contenedor mide lo que mide el contenido, el contenido mide lo que mide el
 *  contenedor). Sacandolo del flujo, la caja manda y el SVG obedece. */
export function Lienzo({ children, className = '' }) {
  const [ref, caja] = useMedida()
  return (
    <div ref={ref} className={className}
         style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {caja.w > 0 && caja.h > 0 ? children(caja) : null}
      </div>
    </div>
  )
}

const ACC = 'var(--acc)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'

/**
 * Barras horizontales con base en cero.
 * `datos`: [{etiqueta, valor, nota, enfasis}]. El orden se decide afuera (regla 11).
 */
export function BarrasH({ datos, w, h, formato, tituloEje, anchoEtiqueta = 132, notaAncho = 96,
                          onBarra, referencia }) {
  if (!datos.length) return null
  const padTop = tituloEje ? 20 : 6
  const padBot = 4
  const disponible = h - padTop - padBot
  const paso = disponible / datos.length
  // Ancho de barra ni fino ni grueso: mas ancho que el espacio entre barras (regla 10)
  // Regla 10: la barra mas ancha que el espacio entre barras. Un tope duro de 40 px
  // invertia la relacion en cuanto el paso pasaba de 60, que es lo que pasa con 5 barras
  // en una pantalla alta.
  const alto = Math.max(9, Math.min(paso * 0.66, Math.max(40, paso * 0.6)))
  const x0 = anchoEtiqueta
  // La etiqueta de valor se dibuja DESPUES del extremo de la barra, asi que su ancho tiene
  // que salir del presupuesto: sin esto, la barra mas larga empuja su propia etiqueta
  // dentro de la columna de notas y los dos textos se pisan.
  const anchoValor = Math.max(38, formato(Math.max(...datos.map((d) => d.valor), 0)).length * 6.6 + 10)
  const ancho = Math.max(40, w - x0 - notaAncho - anchoValor - 8)
  const max = Math.max(...datos.map((d) => d.valor), 0) || 1
  const fuente = Math.max(10.5, Math.min(13, paso * 0.42))
  // La escala y el drill-down viven ACA, no en cada pantalla: cuatro pantallas replicaban
  // esta misma aritmetica para ubicar su overlay de clic y su linea de referencia, y
  // cualquier cambio de padding las desalineaba en silencio.
  const xDe = (v) => x0 + (v / max) * ancho

  return (
    <svg width={w} height={h} role={onBarra ? 'group' : 'img'}
         aria-label={tituloEje || 'Gráfico de barras'} style={{ display: 'block' }}>
      {tituloEje && (
        <text x={x0} y={11} fontSize="10" fill={MUT} letterSpacing=".07em"
              textAnchor="start" style={{ textTransform: 'uppercase' }}>{tituloEje}</text>
      )}
      {datos.map((d, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const largo = Math.max(1, (d.valor / max) * ancho)
        const color = d.enfasis ? ACC : GRIS
        return (
          <g key={d.etiqueta}>
            <text x={x0 - 10} y={y + alto / 2} fontSize={fuente} fill={d.enfasis ? INK : MUT2}
                  textAnchor="end" dominantBaseline="central"
                  fontWeight={d.enfasis ? 600 : 400}>{d.etiqueta}</text>
            <rect x={x0} y={y} width={largo} height={alto} fill={color} />
            {/* etiqueta directa sobre la serie, no leyenda aparte (regla 14) */}
            <text x={x0 + largo + 7} y={y + alto / 2} fontSize={fuente}
                  fill={d.enfasis ? INK : MUT2} dominantBaseline="central"
                  fontWeight={d.enfasis ? 600 : 500} className="tabular">
              {formato(d.valor)}
            </text>
            {d.nota && (
              <text x={w} y={y + alto / 2} fontSize={fuente - 1.5} fill={MUT}
                    textAnchor="end" dominantBaseline="central" className="tabular">{d.nota}</text>
            )}
          </g>
        )
      })}
      {referencia != null && referencia.valor > 0 && (
        <ReferenciaV x={xDe(referencia.valor)} h={h - padBot} y={padTop - 14}
                     etiqueta={referencia.etiqueta} />
      )}
      {onBarra && datos.map((d, i) => (
        <rect key={'hit' + d.etiqueta} x={0} y={padTop + i * paso} width={w} height={paso}
              fill="transparent" style={{ cursor: 'pointer' }}
              onClick={() => onBarra(i, d)}
              tabIndex={0} role="button"
              aria-label={`Ver ${d.etiqueta} en la lista de contacto`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBarra(i, d) } }} />
      ))}
    </svg>
  )
}

/** Marca de referencia vertical sobre un grafico de barras (baseline, regla del rulebook:
 *  cada cifra de riesgo con su comparacion al lado). Lleva etiqueta: una marca sin leyenda
 *  se lee como meta, que es lo contrario de lo que es. */
export function ReferenciaV({ x, h, etiqueta, y = 0 }) {
  return (
    <g>
      <line x1={x} x2={x} y1={y} y2={h} stroke={INK} strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={x + 5} y={y + 9} fontSize="10" fill={MUT2} fontWeight={600}>{etiqueta}</text>
    </g>
  )
}

/**
 * Serie de tiempo en linea (regla 7). Acepta huecos (valor null) y NO los interpola:
 * un trimestre sin ventana de 90 dias completa se corta, no se inventa.
 */
export function Linea({ serie, w, h, formato, banda, banda2, tituloEje, resaltarUltimo = true }) {
  const padL = 46
  const padR = 30
  const padT = 16
  const padB = 26
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const vals = serie.filter((p) => p.valor != null).map((p) => p.valor)
  if (!vals.length) return null

  const topes = [...vals, ...(banda ? banda : []), ...(banda2 ? banda2 : [])]
  const max = Math.max(...topes) * 1.12
  const min = 0                                    // linea de base en cero
  const X = (i) => padL + (i / Math.max(1, serie.length - 1)) * iw
  const Y = (v) => padT + ih - ((v - min) / (max - min)) * ih

  const tramos = []
  let actual = []
  serie.forEach((p, i) => {
    if (p.valor == null) { if (actual.length) tramos.push(actual); actual = [] }
    else actual.push([X(i), Y(p.valor)])
  })
  if (actual.length) tramos.push(actual)

  const ultimo = [...serie].reverse().find((p) => p.valor != null)
  const iUlt = serie.findIndex((p) => p === ultimo)
  const pico = serie.reduce((a, p, i) => (p.valor != null && p.valor > (a.v ?? -1) ? { v: p.valor, i } : a), {})

  return (
    <svg width={w} height={h} role="img" aria-label={tituloEje || 'Serie de tiempo'}
         style={{ display: 'block' }}>
      {banda && (
        <g>
          <rect x={padL} y={Y(banda[1])} width={iw} height={Math.max(1, Y(banda[0]) - Y(banda[1]))}
                fill="var(--acc)" opacity=".16" />
          <line x1={padL} x2={padL + iw} y1={Y(banda[1])} y2={Y(banda[1])}
                stroke={MUT2} strokeWidth="1" strokeDasharray="4 3" />
          <line x1={padL} x2={padL + iw} y1={Y(banda[0])} y2={Y(banda[0])}
                stroke={MUT2} strokeWidth="1" strokeDasharray="4 3" />
          <text x={padL + 6} y={Y(banda[1]) - 4} fontSize="10" fill={MUT2} fontWeight={600}>
            meta {formato(banda[0])}–{formato(banda[1])}
          </text>
        </g>
      )}
      {banda2 && (
        <g>
          <rect x={padL} y={Y(banda2[1])} width={iw} height={Math.max(1, Y(banda2[0]) - Y(banda2[1]))}
                fill="var(--mut)" opacity=".22" />
          <text x={padL + 6} y={Y(banda2[0]) + 11} fontSize="10" fill={MUT}>
            línea base {formato(banda2[0])}–{formato(banda2[1])}
          </text>
        </g>
      )}
      {/* eje Y: solo dos referencias, sin gridlines (regla 12) */}
      <text x={padL - 8} y={Y(0) + 4} fontSize="10" fill={MUT} textAnchor="end">0</text>
      <text x={padL - 8} y={padT + 4} fontSize="10" fill={MUT} textAnchor="end">{formato(max)}</text>
      {tituloEje && (
        <text x={padL} y={10} fontSize="10" fill={MUT} letterSpacing=".07em"
              style={{ textTransform: 'uppercase' }}>{tituloEje}</text>
      )}
      <line x1={padL} x2={padL + iw} y1={Y(0)} y2={Y(0)} stroke="var(--bd)" strokeWidth="1" />

      {tramos.map((t, i) => (
        <polyline key={i} points={t.map((p) => p.join(',')).join(' ')} fill="none"
                  stroke={ACC} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {pico.i != null && pico.i !== iUlt && (
        <g>
          <circle cx={X(pico.i)} cy={Y(pico.v)} r="3.5" fill="#fff" stroke={ACC} strokeWidth="1.75" />
          <text x={X(pico.i)} y={Y(pico.v) - 9} fontSize="11" fill={MUT2} textAnchor="middle"
                fontWeight={600} className="tabular">{formato(pico.v)}</text>
        </g>
      )}
      {resaltarUltimo && ultimo && (
        <g>
          <circle cx={X(iUlt)} cy={Y(ultimo.valor)} r="4" fill={ACC} />
          <text x={X(iUlt)} y={Y(ultimo.valor) - 10} fontSize="12.5" fill={INK} textAnchor="middle"
                fontWeight={700} className="tabular">{formato(ultimo.valor)}</text>
        </g>
      )}

      {/* eje X: nada en diagonal (regla 16). Se saltean etiquetas si no entran. */}
      {serie.map((p, i) => {
        const cada = Math.ceil((serie.length * 46) / Math.max(1, iw))
        if (i % cada !== 0 && i !== serie.length - 1) return null
        return (
          <text key={p.etiqueta} x={X(i)} y={h - 8} fontSize="10" fill={MUT} textAnchor="middle">
            {p.etiqueta}
          </text>
        )
      })}
    </svg>
  )
}

/** Barra unica segmentada, desde cero. Para composiciones de dos o tres partes. */
export function BarraPartida({ partes, w, h, formato, alto = 34 }) {
  const total = partes.reduce((s, p) => s + p.valor, 0) || 1
  const y = Math.max(6, (h - alto) / 2 - 12)
  let x = 0
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}>
      {partes.map((p, i) => {
        const ancho = (p.valor / total) * w
        const el = (
          <g key={p.etiqueta}>
            <rect x={x} y={y} width={Math.max(0, ancho - (i < partes.length - 1 ? 2 : 0))}
                  height={alto} fill={p.enfasis ? ACC : GRIS} />
            {ancho > 54 && (
              <text x={x + 9} y={y + alto / 2} fontSize="12.5" fontWeight={700}
                    fill={p.enfasis ? '#fff' : INK} dominantBaseline="central" className="tabular">
                {formato(p.valor)}
              </text>
            )}
            <text x={x} y={y + alto + 15} fontSize="11" fill={p.enfasis ? MUT2 : MUT}
                  fontWeight={p.enfasis ? 600 : 400}>{p.etiqueta}</text>
            {p.nota && (
              <text x={x} y={y + alto + 28} fontSize="10" fill={MUT}>{p.nota}</text>
            )}
          </g>
        )
        x += ancho
        return el
      })}
    </svg>
  )
}

/** Embudo en barras desde cero (no en trapecios: el area engana, Cleveland-McGill). */
export function Embudo({ etapas, w, h, formato }) {
  const datos = etapas.map((e, i) => ({
    etiqueta: e.etiqueta,
    valor: e.valor,
    nota: i > 0 ? `${e.pct}` : '',
    enfasis: i === etapas.length - 1,
  }))
  return <BarrasH datos={datos} w={w} h={h} formato={formato} anchoEtiqueta={116} notaAncho={110} />
}

/** Trama diagonal para distinguir tramos sin depender del color. En una impresion en
 *  blanco y negro dos rellenos grises son el mismo relleno; una trama no. */
export function Tramas() {
  return (
    <defs>
      <pattern id="trama" width="6" height="6" patternUnits="userSpaceOnUse"
               patternTransform="rotate(45)">
        <rect width="6" height="6" fill="var(--gris)" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="#fff" strokeWidth="2.5" />
      </pattern>
    </defs>
  )
}

/**
 * Barra segmentada desde cero, con rotulo y valor SOBRE cada tramo y trama en el que no
 * lleva enfasis. Los tramos ya no se distinguen solo por color.
 */
export function BarraTramos({ tramos, w, h, formato, banda }) {
  const total = tramos.reduce((s, t) => s + t.valor, 0) || 1
  const alto = Math.max(28, Math.min(52, h * 0.34))
  const y = 22
  let x = 0
  return (
    <svg width={w} height={h} role="img" aria-label="Barra segmentada"
         style={{ display: 'block' }}>
      <Tramas />
      {tramos.map((t, i) => {
        const ancho = (t.valor / total) * w
        const el = (
          <g key={t.etiqueta}>
            <rect x={x} y={y} width={Math.max(0, ancho - (i < tramos.length - 1 ? 2 : 0))}
                  height={alto} fill={t.enfasis ? ACC : 'url(#trama)'} />
            <text x={x + 8} y={y - 7} fontSize="11.5" fontWeight={t.enfasis ? 700 : 500}
                  fill={t.enfasis ? INK : MUT2}>{t.etiqueta}</text>
            {ancho > 76 && (
              <text x={x + 8} y={y + alto / 2} fontSize="13" fontWeight={700}
                    fill={t.enfasis ? '#fff' : INK} dominantBaseline="central" className="tabular">
                {formato(t.valor)}
              </text>
            )}
            {t.nota && (
              <text x={x + 8} y={y + alto + 15} fontSize="10.5" fill={MUT}>{t.nota}</text>
            )}
          </g>
        )
        x += ancho
        return el
      })}
      {banda && (
        <g>
          <line x1={(banda[0] / total) * w} x2={(banda[0] / total) * w} y1={y - 4} y2={y + alto + 4}
                stroke={INK} strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1={(banda[1] / total) * w} x2={(banda[1] / total) * w} y1={y - 4} y2={y + alto + 4}
                stroke={INK} strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={(banda[1] / total) * w + 6} y={y + alto + 15} fontSize="10.5" fill={MUT2}
                fontWeight={600}>{banda[2]}</text>
        </g>
      )}
    </svg>
  )
}

/** Serie de exposicion por corte, bajo el selector: mover el corte es ver la trayectoria.
 *  Es el "como vengo" que pide el apunte de la clase 4. */
export function SerieCortes({ valores, activo, w, h }) {
  const max = Math.max(...valores) || 1
  const paso = w / Math.max(1, valores.length - 1)
  const pts = valores.map((v, i) => [i * paso, h - 3 - (v / max) * (h - 8)])
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none"
                stroke={GRIS} strokeWidth="1.5" />
      <polyline points={pts.slice(0, activo + 1).map((p) => p.join(',')).join(' ')} fill="none"
                stroke={ACC} strokeWidth="2" />
      <circle cx={pts[activo][0]} cy={pts[activo][1]} r="3.2" fill={ACC} />
    </svg>
  )
}
