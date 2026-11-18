// Piezas de texto para los SVG propios de /final/ (17/11, F6): las mismas de la vista 8 del E3 (envolver, rótulo mono,
// renglones, piso de letra), juntas en un módulo para que las vistas no las copien. Los colores son los tokens del
// tablero: --acc para el único énfasis, --ink para el texto, --e3-ctx para el contexto, --sem-meta para lo resuelto.

import { anchoTexto as ancho } from '../../e3/src/medir.js'

export { ancho }
export const ACC = 'var(--acc)'
export const INK = 'var(--ink)'
export const CTX = 'var(--e3-ctx, #5a6478)'
export const RELLENO = 'var(--e3-ctx-relleno, #a9b1bf)'
export const EJE = 'var(--e3-eje, #6a7489)'
export const BORDE = 'var(--bd)'
export const SUP = 'var(--sup, #fff)'
export const HECHO = 'var(--sem-meta, #0f7a52)'
export const TINTE = 'var(--azul1)'

// La letra más chica que se permite: 13 px reales a 1280 × 720, donde la caja lleva zoom 1280 / 1152 (como la vista 8 del E3).
export const PISO = 13.2 / (1280 / 1152)

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

export const anchoMono = (t, f) => ancho(String(t).toUpperCase(), f, 600, true) + 0.08 * f * String(t).length

/** envolver para un rótulo mono en mayúsculas (Titulo): mide con anchoMono. */
export function envolverMono(texto, w, f) {
  const out = []
  let linea = ''
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${p}` : p
    if (linea && anchoMono(prueba, f) > w) {
      out.push(linea)
      linea = p
    } else linea = prueba
  }
  if (linea) out.push(linea)
  return out
}

/** Rótulo mono, mayúsculas, en contexto; la letra baja si no entra en `max`. */
export function Titulo({ x = 0, y, f, texto, max = Infinity, anchor = 'start', color = CTX }) {
  const fx = Math.min(f, f * (max / Math.max(1, anchoMono(texto, f))))
  return (
    <text x={x} y={y} fontSize={fx} fill={color} fontWeight={600} fontFamily="var(--mono)" letterSpacing={`${0.08 * fx}`}
          textAnchor={anchor} style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

export function Renglones({ lineas, x, y, f, peso = 400, color = INK, inter = 1.25, anchor = 'start' }) {
  return lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * inter} fontSize={f} fontWeight={peso} fill={color} textAnchor={anchor}
          dominantBaseline="hanging">{l}</text>
  ))
}

/** La letra más grande, entre `desde` y PISO, con la que `alto(f)` entra en `h`. */
export function letra(alto, h, desde) {
  let f = desde
  while (alto(f) > h && f > PISO) f = Math.max(PISO, f - 0.25)
  return f
}

/** El dueño con un espacio duro antes de cada inicial («Sebastian C.»): el renglón no deja la inicial sola. */
export const duro = (t) => String(t).replace(/ (\p{Lu}\.)/gu, ' $1')
