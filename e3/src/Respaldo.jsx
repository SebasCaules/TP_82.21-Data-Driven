// Piezas comunes del grupo «Respaldo» del riel (27/10, W3): los anexos A1 a A7 (vistas/R_A1_*.jsx a
// R_A7_*.jsx). Un anexo se abre solo si preguntan, así que no lleva banda de cifras ni decisión (regla 11
// del E2: la banda es de las vistas con decisión). Tiene la forma de la tarjeta del gráfico de las vistas
// 4 y 5: arriba, la frase que responde la pregunta del encabezado con su cifra en --acc (regla 12: sin
// título ni pie propios); debajo, una sola pieza a todo el ancho, dibujada en SVG dentro de un Lienzo
// (scripts/paridad_e3.py cuenta un gráfico por vista con contenido, también en el respaldo).
//
// - TarjetaRespaldo: la tarjeta con la frase, los controles detrás de «Explorar» (si el anexo los tiene)
//   y el Lienzo.
// - TablaSvg: una tabla de anexo de C3 dibujada en SVG, con el aspecto de la tabla del detalle de la V01
//   del E2 (rótulos de columna en mono y mayúsculas, filete de 1,5 px en tinta bajo los rótulos, filas
//   separadas por --bd2, la fila marcada sobre --azul1). La letra arranca en la de los SVG del E3
//   (useEscalaTexto × el zoom) y baja de a 0,25 px hasta que la tabla entra en el alto que mide el
//   Lienzo; con alto de sobra, las filas se reparten una parte, como la tabla de la V01 a 1920 × 1080.
//   Cada celda va en hasta dos renglones; lo que no entra se corta con «…» y queda entero en el title.
// Ninguna cifra se escribe acá: las celdas llegan escritas (C3) o formateadas por la vista (D3).

import { Lienzo } from '../../src/graficos.jsx'
import { anchoTexto } from './medir.js'
import { sinCortes } from './texto.jsx'

const INK = 'var(--ink)'
const MUT2 = 'var(--mut2)'

/** Celdas que son una cifra: se alinean a la derecha («1.485», «−99,95 %», «USD 30.660», «12.000»). */
export const ES_NUMERO = /^[−+-]?(?:(?:USD|ARS)[\s ])?[\d.,]+(?:[\s ]%)?$/

/**
 * La tarjeta de un anexo. `frase`: la respuesta en palabras (sans, como .kpi-lbl.frase del E2);
 * `cifra`: lo que la sostiene, en --acc y sin partir; `title`: fuente y filas del registro, para quien
 * presenta. `controles`: lo que va al lado de la frase (las opciones y el botón «Explorar»).
 * `dibujo({ w, h })`: la pieza, en el tamaño que mide el Lienzo.
 */
export function TarjetaRespaldo({ frase, cifra, title, controles, opciones, dibujo, clase = '' }) {
  return (
    <section className={`pant e3-respaldo ${clase}`}>
      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }} title={title}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            <span>{frase}</span>
            {cifra && <b className="tabular">{cifra}</b>}
          </span>
          {controles}
        </div>
        {/* Con «Explorar» abierto, los controles van en su propio renglón, debajo de la frase. */}
        {opciones && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap',
                        gap: 'clamp(6px, 0.8cqh, 10px) clamp(14px, 2cqw, 28px)', marginTop: 'clamp(6px, 1.2cqh, 14px)' }}>
            {opciones.map(({ rotulo, control }) => (
              <span key={rotulo} style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(6px, 0.8cqw, 10px)' }}>
                <span className="kpi-lbl">{rotulo}</span>
                {control}
              </span>
            ))}
          </div>
        )}
        <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                      display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">{(caja) => dibujo(caja)}</Lienzo>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- texto en renglones

const anchoMono = (t, f) => anchoTexto(String(t).toUpperCase(), f, 500, true) + 0.06 * f * String(t).length

/** Parte `texto` en renglones de hasta `max` px; si pasan de `tope`, el último se corta con «…». */
export function renglones(texto, max, medir, tope = 2) {
  const palabras = String(texto ?? '').split(' ').filter(Boolean)
  const out = []
  let actual = ''
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p
    if (!actual || medir(prueba) <= max) actual = prueba
    else { out.push(actual); actual = p }
  }
  if (actual) out.push(actual)
  if (!out.length) return { lineas: [''], cortado: false }
  if (out.length <= tope) return { lineas: out, cortado: false }
  const quedan = out.slice(0, tope)
  let ultimo = `${quedan[tope - 1]} ${out.slice(tope).join(' ')}`
  while (ultimo.length > 1 && medir(`${ultimo}…`) > max) ultimo = ultimo.slice(0, -1).trimEnd()
  quedan[tope - 1] = `${ultimo}…`
  return { lineas: quedan, cortado: true }
}

// ---------------------------------------------------------------- tabla en SVG

/**
 * columnas: [{ titulo, ancho, alinear?: 'izq' | 'der' | 'centro', dibujar?: (fila, caja) => svg,
 *              renglones?: n, dibujarTitulo?: (caja) => svg }]
 *   `ancho` es una proporción (los «anchos» de C3 están en pulgadas del PPTX). Sin `alinear`, la
 *   columna va a la derecha si todas sus celdas son cifras. `dibujar` reemplaza el texto de la celda
 *   (la línea de tiempo del A1): recibe { x, y, w, h, f } y la fila mide `renglones` (1 si no se dice).
 * filas: [{ celdas: [texto], marcada?, tenue?, title? }]
 * k: la escala de letra del E2 (useEscalaTexto). base: la letra del cuerpo a k = 1.
 */
export function TablaSvg({ w, h, k, columnas, filas, base = 13, minimo = 9, tope = 2, etiqueta }) {
  const total = columnas.reduce((s, c) => s + c.ancho, 0)
  const pad = 10 * k
  const xs = []
  let acum = 0
  for (const c of columnas) { xs.push(acum); acum += (c.ancho / total) * w }
  const anchoCol = columnas.map((c) => (c.ancho / total) * w)
  // Sin `alinear`: a la derecha si casi todas sus celdas son cifras («no aplica» en una fila del A3 no
  // tiene que mover la columna entera a la izquierda).
  const alineacion = columnas.map((c, j) => {
    if (c.alinear) return c.alinear
    const llenas = filas.map((f) => f.celdas[j]).filter(Boolean)
    const cifras = llenas.filter((x) => ES_NUMERO.test(sinCortes(String(x)))).length
    return j > 0 && llenas.length && cifras >= 0.8 * llenas.length ? 'der' : 'izq'
  })

  // La letra más grande que entra: cada fila mide lo que su celda más alta (en renglones).
  const armar = (f) => {
    const fT = f * 0.82
    const lh = f * 1.25
    const lhT = fT * 1.3
    const padY = f * 0.32
    const titulos = columnas.map((c, j) => (c.dibujarTitulo ? { lineas: [''], cortado: false }
      : renglones(c.titulo, anchoCol[j] - pad, (t) => anchoMono(t, fT), 2)))
    const altoTit = Math.max(...titulos.map((t) => t.lineas.length)) * lhT + padY * 2
    const cuerpo = filas.map((fila) => {
      const peso = fila.marcada ? 600 : 400
      const celdas = columnas.map((c, j) => (c.dibujar ? { lineas: Array(c.renglones ?? 1).fill(''), cortado: false }
        : renglones(sinCortes(String(fila.celdas[j] ?? '')).replace(/\*\*/g, ''), anchoCol[j] - pad,
          (t) => anchoTexto(t, f, peso), tope)))
      const n = Math.max(...celdas.map((c) => c.lineas.length))
      return { celdas, n, alto: n * lh + padY * 2 }
    })
    const alto = altoTit + cuerpo.reduce((s, r) => s + r.alto, 0)
    return { f, fT, lh, lhT, padY, titulos, altoTit, cuerpo, alto }
  }
  let t = armar(base * k)
  for (let f = base * k - 0.25; t.alto > h - 2 && f >= minimo; f -= 0.25) t = armar(f)

  // Alto de sobra: cada fila suma hasta tres cuartos de su renglón.
  const sobra = Math.max(0, h - 2 - t.alto)
  const extra = Math.min(sobra / Math.max(1, filas.length), t.lh * 0.75)

  const xTexto = (j) => (alineacion[j] === 'der' ? xs[j] + anchoCol[j] - pad
    : alineacion[j] === 'centro' ? xs[j] + (anchoCol[j] - pad) / 2 : xs[j])
  const ancla = (j) => (alineacion[j] === 'der' ? 'end' : alineacion[j] === 'centro' ? 'middle' : 'start')

  let y = t.altoTit
  const yFilas = t.cuerpo.map((r) => { const y0 = y; y += r.alto + extra; return y0 })

  return (
    <svg width={w} height={h} role="table" aria-label={etiqueta} style={{ display: 'block' }}>
      {/* rótulos de columna: mono, mayúsculas, como los Th de la V01 del E2 */}
      <g aria-hidden="true">
        {columnas.map((c, j) => (c.dibujarTitulo
          ? <g key={j}>{c.dibujarTitulo({ x: xs[j], y: 0, w: anchoCol[j] - pad, h: t.altoTit, f: t.f, fT: t.fT })}</g>
          : t.titulos[j].lineas.map((l, i) => (
            <text key={`${j}-${i}`} x={xTexto(j)} y={t.altoTit - t.padY - (t.titulos[j].lineas.length - 1 - i) * t.lhT - t.lhT / 2}
                  fontSize={t.fT} fontFamily="var(--mono)" fontWeight={500} letterSpacing={`${0.06 * t.fT}`}
                  fill={MUT2} textAnchor={ancla(j)} dominantBaseline="central">
              {l.toUpperCase()}
            </text>
          ))))}
      </g>
      <line x1={0} x2={w} y1={t.altoTit} y2={t.altoTit} stroke={INK} strokeWidth="1.5" />

      {filas.map((fila, i) => {
        const r = t.cuerpo[i]
        const y0 = yFilas[i]
        const alto = r.alto + extra
        const cortadas = r.celdas.some((c) => c.cortado)
        const titulo = fila.title ?? (cortadas ? fila.celdas.filter(Boolean).join(' · ') : null)
        return (
          <g key={i} role="row">
            {titulo && <title>{titulo}</title>}
            {fila.marcada && <rect x={0} y={y0 + 0.75} width={w} height={alto - 0.75} fill="var(--azul1)" />}
            {columnas.map((c, j) => (c.dibujar
              ? <g key={j}>{c.dibujar(fila, { x: xs[j], y: y0, w: anchoCol[j] - pad, h: alto, f: t.f })}</g>
              : r.celdas[j].lineas.map((l, li) => (
                <text key={`${j}-${li}`} x={xTexto(j)}
                      y={y0 + alto / 2 + (li - (r.celdas[j].lineas.length - 1) / 2) * t.lh}
                      fontSize={t.f} fontWeight={fila.marcada ? 600 : 400}
                      fill={fila.tenue ? MUT2 : INK} textAnchor={ancla(j)} dominantBaseline="central"
                      className="tabular">
                  {l}
                </text>
              ))))}
            <line x1={0} x2={w} y1={y0 + alto - 0.5} y2={y0 + alto - 0.5} stroke="var(--bd)" strokeWidth="1" />
          </g>
        )
      })}
    </svg>
  )
}

/** Las filas de un anexo de C3 con la marca de `destacar` (índices desde 0). */
export function filasDeAnexo(a, extra = {}) {
  const marcadas = new Set(a.destacar ?? [])
  return a.filas.map((celdas, i) => ({ celdas, marcada: marcadas.has(i), ...(extra[i] ?? {}) }))
}

/** Las columnas de un anexo de C3, con sus anchos de pulgadas como proporción. */
export const columnasDeAnexo = (a, cambios = {}) =>
  a.columnas.map((titulo, j) => ({ titulo, ancho: a.anchos[j], ...(cambios[j] ?? {}) }))
