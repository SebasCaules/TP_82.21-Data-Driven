// Piezas comunes de las vistas 8, 9 y 11 (30/10, /e3/ sin «Explorar»). No es una vista: vistas/index.jsx registra
// solo los archivos V*.jsx, A*.jsx y R_*.jsx.
//
// Las tres vistas muestran varias tablas de la Parte D en un solo svg (paridad_e3.py: un gráfico por vista). Cada
// tabla es un Bloque: su título en mono y mayúsculas y la TablaSvg del respaldo debajo, en la caja que le toca, sin
// cortar celdas (tope = Infinity): la letra baja hasta que entra. Si ni con la letra mínima entra, la TablaSvg lleva
// data-desborda y verificar_e3.py falla.

import { TablaSvg } from '../Respaldo.jsx'
import { anchoTexto } from '../medir.js'

export const INK = 'var(--ink)'
export const MUT2 = 'var(--mut2)'
export const CTX = 'var(--e3-ctx, #5a6478)'
export const ACC = 'var(--acc)'

const anchoMono = (t, f) => anchoTexto(String(t).toUpperCase(), f, 600, true) + 0.08 * f * String(t).length

/** Título de una pieza: mono, mayúsculas, en contexto; la letra baja si no entra en `max`. */
export function Titulo({ x = 0, y, f, texto, max = Infinity, color = CTX }) {
  const fx = Math.min(f, f * (max / Math.max(1, anchoMono(texto, f))))
  return (
    <text x={x} y={y} fontSize={fx} fill={color} fontWeight={600} fontFamily="var(--mono)" letterSpacing={`${0.08 * fx}`}
          style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

/** Una tabla con su título, en (x, y) y w × h. `base`: la letra de partida a k = 1. */
export function Bloque({ x, y, w, h, k, titulo, columnas, filas, base = 13, minimo = 9, etiqueta }) {
  const fT = 11 * k
  const altoT = titulo ? fT * 1.9 : 0
  return (
    <g transform={`translate(${x}, ${y})`}>
      {titulo && <Titulo y={fT} f={fT} texto={titulo} max={w} />}
      <g transform={`translate(0, ${altoT})`}>
        <TablaSvg w={w} h={Math.max(10, h - altoT)} k={k} columnas={columnas} filas={filas} base={base} minimo={minimo}
                  tope={Infinity} etiqueta={etiqueta ?? titulo} />
      </g>
    </g>
  )
}

/** Renglones de hasta `w` px, cortando entre palabras. */
export function envolver(texto, w, f, peso = 400) {
  const out = []
  let linea = ''
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${p}` : p
    if (linea && anchoTexto(prueba, f, peso) > w) {
      out.push(linea)
      linea = p
    } else linea = prueba
  }
  if (linea) out.push(linea)
  return out
}

/** Párrafo envuelto en (x, y), con la primera línea colgando de y. */
export function Parrafo({ x = 0, y, w, f, texto, peso = 400, color = INK, interlinea = 1.3 }) {
  return envolver(texto, w, f, peso).map((l, i) => (
    <text key={i} x={x} y={y + i * f * interlinea} fontSize={f} fontWeight={peso} fill={color}
          dominantBaseline="hanging">{l}</text>
  ))
}
export const altoParrafo = (texto, w, f, peso = 400, interlinea = 1.3) => envolver(texto, w, f, peso).length * f * interlinea
