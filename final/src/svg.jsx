// Piezas de los SVG propios de /final/ (17/11, F6; 18/11, spec de dataviz b y f). Todo tamaño va en la unidad u
// (escala.js: 1 u = 1 px de una pantalla de 1920 × 1080): la vista lee u con useU() y multiplica. La letra sale de
// ESCALA y nunca baja de 20 u (letra(), tam(), Texto). Los colores son por papel (spec b.3):
//   INK      texto, cifras y rótulos del foco
//   CTX      texto secundario: rótulos de contexto, notas, dueños
//   ACC      la marca que nombra el título (una por vista). REGLA: el acento solo rellena o traza marcas; ningún
//            <text> usa ACC. Texto blanco (SUP) solo sobre ACC.
//   FIN_GRIS marca de contexto (barras, columnas, cuadros y tramos que no son foco)
//   CONTORNO marca de otra naturaleza o condicional (sin relleno)
//   EJE      línea base de 1,5 u; nunca un eje con marcas
//   PISTA, REALCE  fondos (pista de V09, fila foco de V11)
// El verde existe solo en la tarjeta de decisión: los gráficos no lo usan.

import { anchoTexto as ancho } from '../../e3/src/medir.js'
import { useU } from './escala.js'

export { ancho, useU }
export const ACC = 'var(--acc)'
export const INK = 'var(--ink)'
export const CTX = 'var(--e3-ctx, #5a6478)'
export const FIN_GRIS = 'var(--fin-gris, #8a94a6)'
export const CONTORNO = 'var(--e3-contorno, #4f5a6e)'
export const EJE = 'var(--e3-eje, #6a7489)'
export const PISTA = 'var(--bd2)'
export const REALCE = 'var(--realce)'
export const BORDE = 'var(--bd)'
export const SUP = 'var(--sup, #fff)'

/** Escala tipográfica de los SVG, en u (spec b.2). */
export const ESCALA = { nombre: 34, valFoco: 34, val: 28, cat: 26, fila: 26, sec: 22, piso: 20 }
/** Trazos, en u (spec b.5): línea base, umbral, contorno, guía y el punteado. */
export const TRAZO = { base: 1.5, umbral: 3, contorno: 2, guia: 1.5, radio: 4, separacion: 2 }
/** Punteado de 6 u y 4 u. */
export const punteado = (u) => `${6 * u} ${4 * u}`

/** Codificación de estado común a V12 y V13 (spec b.6). Anchos y guiones en u: la vista los multiplica (o usa
 *  marcaEstado, que ya lo hace). */
export const ESTADO = {
  hecha: { fill: ACC },
  piloto: { fill: FIN_GRIS },
  condicional: { fill: 'none', stroke: CONTORNO, strokeWidth: 2, dash: [6, 4] },
}

/** Los atributos SVG de un estado, ya multiplicados por u: <rect {...marcaEstado('hecha', u)} />. */
export function marcaEstado(estado, u) {
  const e = ESTADO[estado]
  if (!e) throw new Error(`svg.jsx: estado «${estado}» desconocido (hecha, piloto, condicional)`)
  return e.stroke
    ? { fill: e.fill, stroke: e.stroke, strokeWidth: e.strokeWidth * u, strokeDasharray: e.dash.map((d) => d * u).join(' ') }
    : { fill: e.fill }
}

/** Tamaño de letra de un papel de ESCALA (o un número en u), nunca menos de 20 u. */
export const tam = (papel, u) => Math.max(typeof papel === 'number' ? papel : ESCALA[papel], ESCALA.piso) * u

/** Renglones de hasta `w` px, cortando entre palabras (un espacio duro no corta). */
export function envolver(texto, w, f, peso = 400) {
  const out = []
  let linea = ''
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${p}` : p
    if (linea && ancho(prueba, f, peso) > w) {
      out.push(linea)
      linea = p
    } else linea = prueba
  }
  if (linea) out.push(linea)
  return out
}

/** Inicial mayúscula, sin tocar el resto. */
export const inicial = (t) => { const s = String(t); return s.charAt(0).toUpperCase() + s.slice(1) }

/** Rótulo secundario (antes mono en mayúsculas): sans 600, --e3-ctx, inicial mayúscula, sin espaciado. `f` es el
 *  tamaño (con u: tam('sec', u)); baja si no entra en `max`, nunca de `piso` (20 u si se pasa u). */
export function Titulo({ x = 0, y, f, texto, max = Infinity, anchor = 'start', color = CTX, u }) {
  const t = inicial(texto)
  const piso = u ? ESCALA.piso * u : 0
  const fx = Math.max(piso, Math.min(f, f * (max / Math.max(1, ancho(t, f, 600)))))
  return (
    <text x={x} y={y} fontSize={fx} fill={color} fontWeight={600} textAnchor={anchor}>{t}</text>
  )
}

/** Varios renglones de texto desde y (borde superior del primero). */
export function Renglones({ lineas, x, y, f, peso = 400, color = INK, inter = 1.25, anchor = 'start' }) {
  return lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * inter} fontSize={f} fontWeight={peso} fill={color} textAnchor={anchor}
          dominantBaseline="hanging">{l}</text>
  ))
}

/** Un texto con su papel de ESCALA y el piso de 20 u. papel: 'nombre' | 'valFoco' | 'val' | 'cat' | 'fila' | 'sec' o
 *  un número en u. Color por defecto: tinta (CTX para 'sec' y 'cat'). Nunca ACC. */
export function Texto({ x, y, u, papel = 'val', peso, color, anchor = 'start', base = 'auto', children, ...resto }) {
  const f = tam(papel, u)
  const c = color ?? (papel === 'sec' || papel === 'cat' ? CTX : INK)
  return (
    <text x={x} y={y} fontSize={f} fontWeight={peso ?? 400} fill={c} textAnchor={anchor} dominantBaseline={base}
          {...resto}>{children}</text>
  )
}

/** La letra más grande, entre `desde` y el piso de 20 u (spec b.2), con la que `alto(f)` entra en `h`. */
export function letra(alto, h, desde, u) {
  const piso = ESCALA.piso * u
  let f = Math.max(desde, piso)
  while (alto(f) > h && f > piso) f = Math.max(piso, f - 0.25)
  return f
}

/** El dueño con un espacio duro antes de cada inicial («Sebastian C.»): el renglón no deja la inicial sola. */
export const duro = (t) => String(t).replace(/ (\p{Lu}\.)/gu, ' $1')

// ---------------------------------------------------------------- marcas (spec b.5 y f)

/** Línea base: 1,5 u en EJE. Vertical (x, y1, y2) u horizontal (y, x1, x2). */
export function LineaBase({ u, x, y, x1, x2, y1, y2 }) {
  const p = x != null ? { x1: x, x2: x, y1, y2 } : { x1, x2, y1: y, y2: y }
  return <line {...p} stroke={EJE} strokeWidth={TRAZO.base * u} />
}

/** Marca de umbral o de referencia: 3 u en tinta (o `color`), con punteado opcional. */
export function Umbral({ u, x1, y1, x2, y2, color = INK, ancho: a = TRAZO.umbral, punteada = false }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={a * u}
               strokeDasharray={punteada ? punteado(u) : undefined} />
}

/** Guía fina de un rótulo a su marca: 1,5 u en EJE. */
export function Guia({ u, x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={EJE} strokeWidth={TRAZO.guia * u} />
}

/** Llave vertical de 2 u en EJE de y1 a y2 sobre x, con el pico hacia `lado` ('izq' o 'der') en el centro. */
export function Llave({ u, x, y1, y2, lado = 'izq' }) {
  const d = (lado === 'izq' ? -1 : 1) * 8 * u
  const ym = (y1 + y2) / 2
  return (
    <path d={`M${x - d} ${y1} H${x} V${y2} H${x - d} M${x} ${ym} H${x + d}`} fill="none" stroke={EJE}
          strokeWidth={TRAZO.contorno * u} />
  )
}

/** Trazado de un rectángulo con radio solo en un lado: 'der' (barra horizontal), 'arr' (columna) o 'todos'. */
export function rectRedondo(x, y, w, h, r, lado = 'der') {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  if (lado === 'todos') {
    return `M${x + rr} ${y} H${x + w - rr} Q${x + w} ${y} ${x + w} ${y + rr} V${y + h - rr} Q${x + w} ${y + h} ${x + w - rr} ${y + h}` +
      ` H${x + rr} Q${x} ${y + h} ${x} ${y + h - rr} V${y + rr} Q${x} ${y} ${x + rr} ${y} Z`
  }
  if (lado === 'arr') {
    return `M${x} ${y + h} V${y + rr} Q${x} ${y} ${x + rr} ${y} H${x + w - rr} Q${x + w} ${y} ${x + w} ${y + rr} V${y + h} Z`
  }
  return `M${x} ${y} H${x + w - rr} Q${x + w} ${y} ${x + w} ${y + rr} V${y + h - rr} Q${x + w} ${y + h} ${x + w - rr} ${y + h} H${x} Z`
}

/** Barra horizontal desde x con largo `largo` y grosor `t`, radio 4 u en el extremo libre. foco → ACC; contorno → sin
 *  relleno, trazo 2 u CONTORNO (largo mínimo 4 u); si no, FIN_GRIS. */
export function BarraH({ u, x, y, largo, t, foco = false, contorno = false, fill }) {
  if (contorno) {
    const sw = TRAZO.contorno * u
    const l = Math.max(largo, 4 * u)
    return <path d={rectRedondo(x + sw / 2, y + sw / 2, l - sw, t - sw, TRAZO.radio * u)} fill="none" stroke={CONTORNO}
                 strokeWidth={sw} />
  }
  if (largo <= 0) return null
  return <path d={rectRedondo(x, y, largo, t, TRAZO.radio * u)} fill={fill ?? (foco ? ACC : FIN_GRIS)} />
}

/** Columna sobre la línea base yBase, de ancho w y alto h, radio 4 u arriba. */
export function Columna({ u, x, yBase, w, h, foco = false, fill }) {
  if (h <= 0) return null
  return <path d={rectRedondo(x, yBase - h, w, h, TRAZO.radio * u, 'arr')} fill={fill ?? (foco ? ACC : FIN_GRIS)} />
}

/** Cuadro de lado s con radio 4 u, con la marca de un estado (ESTADO) o un relleno. */
export function Cuadro({ u, x, y, s, estado, fill }) {
  if (estado) {
    const m = marcaEstado(estado, u)
    const sw = m.strokeWidth ?? 0
    return <rect x={x + sw / 2} y={y + sw / 2} width={s - sw} height={s - sw} rx={TRAZO.radio * u} {...m} />
  }
  return <rect x={x} y={y} width={s} height={s} rx={TRAZO.radio * u} fill={fill ?? FIN_GRIS} />
}

/** Punto de radio 10 u (o r en u) con contorno 2 u en CONTORNO y relleno blanco; lleno → ACC. */
export function Punto({ u, cx, cy, r = 10, lleno = false }) {
  return <circle cx={cx} cy={cy} r={r * u} fill={lleno ? ACC : SUP} stroke={lleno ? ACC : CONTORNO}
                 strokeWidth={TRAZO.contorno * u} />
}

/** Chevrón «›» de s u (32 por defecto) centrado en (x, y), trazo 3 u en CTX. */
export function Chevron({ u, x, y, s = 32 }) {
  const a = (s * u) / 2
  return <path d={`M${x - a / 2} ${y - a} L${x + a / 2} ${y} L${x - a / 2} ${y + a}`} fill="none" stroke={CTX}
               strokeWidth={3 * u} strokeLinecap="round" strokeLinejoin="round" />
}
