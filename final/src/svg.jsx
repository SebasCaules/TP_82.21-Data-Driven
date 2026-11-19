// Piezas de los SVG propios de /final/ (17/11, F6; 18/11, spec de dataviz b y f; 18/11, fase 8, spec 1.4). Todo tamaño
// va en la unidad u (escala.js: 1 u = 1 px de una pantalla de 1920 × 1080): la vista lee u con useU() y multiplica. La
// letra sale de ESCALA y nunca baja de 20 u (letra(), tam(), Texto). Los colores son por papel (spec b.3):
//   INK      texto, cifras y rótulos del foco; también relleno de contraste con texto SUP encima
//   CTX      texto secundario: rótulos de contexto, notas, dueños, marcas y títulos de los ejes
//   ACC      la marca que nombra el título (una por vista). REGLA: el acento solo rellena o traza marcas; ningún
//            <text> usa ACC. Texto blanco (SUP) solo sobre ACC o INK.
//   FIN_GRIS marca de contexto (barras, columnas, cuadros y tramos que no son foco)
//   CONTORNO marca de otra naturaleza o condicional (sin relleno)
//   EJE      líneas de los ejes (EjeX, EjeY), línea base y guías de rótulos
//   PISTA, REALCE  fondos y grillas (pista de V09, fila foco de V11, grilla de los ejes, líneas guía)
// El verde existe solo en la tarjeta de decisión: los gráficos no lo usan.
// (fase 8) Al final del archivo, las piezas comunes de spec 1.4: EjeX, EjeY, Leyenda, GrillaSemanas, FranjasFila, Flecha,
// Compuerta, Hito, Aqui y LlaveH, con sus funciones de medida (altoEjeX, margenEjeY, anchoLeyenda, escalaSemanas,
// escalaLinda). Cada una dice arriba cómo se usa; las firmas no cambian sin avisar a las vistas.
// (19/11, fase 9, spec 2.2) Paso (SVG) y PasoHtml (HTML): lo de adentro se enciende en su paso del avance y antes se ve
// atenuado (o no se ve, con `oculto` o ?var=rev.b). El paso vigente sale de pasos.js (usePaso); el CSS, de
// estilos_final.css (.fin-paso, --fin-atenuado). Están al principio de las piezas comunes.

import { anchoTexto as ancho } from '../../e3/src/medir.js'
import { fijo } from '../../e3/src/formato.js'
import { useU } from './escala.js'
import { useEstadoPaso } from './pasos.js'

export { ancho, useU }
export const ACC = 'var(--acc)'
export const INK = 'var(--ink)'
export const CTX = 'var(--e3-ctx, #5a6478)'
export const FIN_GRIS = 'var(--fin-gris, #8a94a6)'
export const CONTORNO = 'var(--e3-contorno, #4f5a6e)'
export const EJE = 'var(--e3-eje, #6a7489)'
export const PISTA = 'var(--bd)'
export const REALCE = 'var(--realce)'
export const BORDE = 'var(--bd)'
export const SUP = 'var(--sup, #fff)'

/** Escala tipográfica de los SVG, en u (spec b.2). */
export const ESCALA = { nombre: 34, valFoco: 34, val: 28, cat: 26, fila: 26, sec: 24, piso: 20 }
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

// ---------------------------------------------------------------- avance por pasos (fase 9, spec 2.2)

/** Lo que se enciende en el paso `n` del avance, dentro de un SVG (un <g>). Antes de su paso se ve atenuado (opacidad
 *  --fin-atenuado y sin color: una marca en ACC se ve gris) y ocupa su lugar; con `oculto` (capas que se superponen,
 *  como la de responsables) o con ?var=rev.b, no se ve pero también ocupa su lugar. Con `hasta={k}`, después del paso k
 *  vuelve a atenuarse: lo ya dicho se apaga para enfocar lo nuevo (en la vista completa, todo encendido). El cambio es una
 *  transición de opacidad de 350 ms, sin transición si el sistema pide movimiento reducido. n = 1 está siempre encendido.
 *    <Paso n={2}><Columna … foco /></Paso>
 *    <Paso n={4} oculto><Responsables … /></Paso>
 *  Lo que cambia de lugar o de tamaño entre pasos no va en Paso: la vista lee usePaso() y lo resuelve. */
export function Paso({ n = 1, hasta, oculto = false, children }) {
  const e = useEstadoPaso(n, { hasta, oculto })
  return <g className="fin-paso" data-revela={e} aria-hidden={e === 'oculto' ? true : undefined}>{children}</g>
}

/** Paso para HTML: el mismo comportamiento en un <div> (o la etiqueta de `como`, 'span' dentro de un renglón), con la
 *  clase y el estilo que se le pasen.
 *    <PasoHtml n={3} className="mi-tarjeta">…</PasoHtml> */
export function PasoHtml({ n = 1, hasta, oculto = false, como: Etiqueta = 'div', className = '', style, children }) {
  const e = useEstadoPaso(n, { hasta, oculto })
  return (
    <Etiqueta className={`fin-paso${className ? ` ${className}` : ''}`} style={style} data-revela={e}
              aria-hidden={e === 'oculto' ? true : undefined}>
      {children}
    </Etiqueta>
  )
}

// ---------------------------------------------------------------- piezas comunes (fase 8, spec 1.4)
// Medidas de los ejes, en u: marca de 8, número a 23 (CTX), título a 23 (CTX, con su unidad), grilla de 1,5 en PISTA.
const EJE_T = 23
const EJE_MARCA = 8
const EJE_HUECO = 12

/** Marcas «lindas» de 0 (o `min`) hasta un tope redondo ≥ max, con unos `cuantas` tramos de 1, 2, 2,5 o 5 × 10^k:
 *  escalaLinda(20260) → { min: 0, tope: 25000, marcas: [0, 5000, 10000, 15000, 20000, 25000] }. El tope es el máximo del
 *  eje: la escala de las marcas va de min a tope. */
export function escalaLinda(max, cuantas = 5, min = 0) {
  const rango = Math.max(max - min, 1e-9)
  const crudo = rango / cuantas
  const mag = 10 ** Math.floor(Math.log10(crudo))
  const paso = mag * ([1, 2, 2.5, 5, 10].find((p) => p * mag >= crudo - 1e-12) ?? 10)
  const tope = min + Math.ceil(rango / paso - 1e-9) * paso
  const marcas = []
  for (let v = min; v <= tope + paso / 1e6; v += paso) marcas.push(Math.round(v / paso) * paso)
  return { min, tope, marcas }
}

/** Lo que EjeX ocupa debajo de su línea, en px: marca, número y, si hay, el título. Para reservarlo en el dibujo. */
export const altoEjeX = (u, titulo = true) => (EJE_MARCA + 6 + EJE_T * 1.2 + (titulo ? EJE_HUECO + EJE_T * 1.2 : 0)) * u

/** Eje horizontal. Línea en EJE de x0 a x1 a la altura y; una marca hacia abajo por valor de `marcas` (por defecto,
 *  escalaLinda) con su número debajo (23 u, CTX, escrito con `formato`, de formato.js) y el título debajo de los números
 *  (23 u, CTX: «Dólares», «Filas de ventas»). `grilla`: una línea fina en PISTA por marca, de y hasta yGrilla (arriba).
 *    <EjeX u={u} x0={x0} x1={x1} y={yBase} min={0} max={tope} marcas={marcas} formato={(v) => usd(v)} titulo={B.eje}
 *          grilla yGrilla={yArriba} />
 *  Reservar altoEjeX(u) debajo de y. anclaTitulo: 'middle' (centrado en el eje, por defecto), 'start' o 'end'. */
export function EjeX({ u, x0, x1, y, min = 0, max, marcas, formato = (v) => fijo(v), titulo, grilla = false, yGrilla,
  anclaTitulo = 'middle' }) {
  const ms = marcas ?? escalaLinda(max, 5, min).marcas
  const tope = max ?? ms[ms.length - 1]
  const x = (v) => x0 + ((v - min) / Math.max(tope - min, 1e-9)) * (x1 - x0)
  const f = EJE_T * u
  const yNum = y + (EJE_MARCA + 6) * u
  const yTit = yNum + f * 1.2 + EJE_HUECO * u
  const xTit = anclaTitulo === 'start' ? x0 : anclaTitulo === 'end' ? x1 : (x0 + x1) / 2
  return (
    <g aria-hidden="true">
      {grilla && yGrilla != null && ms.map((v) => (
        <line key={`g${v}`} x1={x(v)} x2={x(v)} y1={y} y2={yGrilla} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
      ))}
      <line x1={x0} x2={x1} y1={y} y2={y} stroke={EJE} strokeWidth={TRAZO.base * u} />
      {ms.map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={y} y2={y + EJE_MARCA * u} stroke={EJE} strokeWidth={TRAZO.base * u} />
          <text x={x(v)} y={yNum} fontSize={f} fill={CTX} textAnchor="middle" dominantBaseline="hanging">{formato(v)}</text>
        </g>
      ))}
      {titulo && (
        <text x={xTit} y={yTit} fontSize={f} fontWeight={600} fill={CTX} textAnchor={anclaTitulo}
              dominantBaseline="hanging">{titulo}</text>
      )}
    </g>
  )
}

/** Lo que EjeY ocupa a la izquierda de su línea (izq: marca y el número más ancho) y arriba de y1 (arriba: el título),
 *  en px: const m = margenEjeY(u, { marcas, formato, titulo }); el eje va en x = m.izq y el dibujo empieza en
 *  y1 = m.arriba. */
export function margenEjeY(u, { marcas = [], formato = (v) => fijo(v), titulo } = {}) {
  const f = EJE_T * u
  const num = Math.max(0, ...marcas.map((v) => ancho(formato(v), f, 400)))
  return { izq: num + (EJE_MARCA + 6) * u, arriba: titulo ? f * 1.2 + 2 * EJE_HUECO * u : f / 2 }
}

/** Eje vertical. Línea en EJE en x, de y0 (abajo, el valor min) a y1 (arriba, el tope); una marca hacia la izquierda por
 *  valor con su número (23 u, CTX, alineado a la derecha) y el título arriba de y1, horizontal y alineado con los números
 *  (23 u, CTX: «Operaciones del mes, %»). `grilla`: una línea fina en PISTA por marca, de x hasta xGrilla (derecha).
 *    <EjeY u={u} x={m.izq} y0={yBase} y1={m.arriba} min={0} max={1} marcas={[0, .2, .4, .6, .8, 1]}
 *          formato={(v) => pct(v, 0)} titulo={B.eje} grilla xGrilla={w} />
 *  Espacio que reservar: margenEjeY(u, { marcas, formato, titulo }). */
export function EjeY({ u, x, y0, y1, min = 0, max, marcas, formato = (v) => fijo(v), titulo, grilla = false, xGrilla }) {
  const ms = marcas ?? escalaLinda(max, 5, min).marcas
  const tope = max ?? ms[ms.length - 1]
  const y = (v) => y0 - ((v - min) / Math.max(tope - min, 1e-9)) * (y0 - y1)
  const f = EJE_T * u
  const xNum = x - (EJE_MARCA + 6) * u
  const num = Math.max(0, ...ms.map((v) => ancho(formato(v), f, 400)))
  return (
    <g aria-hidden="true">
      {grilla && xGrilla != null && ms.map((v) => (
        <line key={`g${v}`} x1={x} x2={xGrilla} y1={y(v)} y2={y(v)} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
      ))}
      <line x1={x} x2={x} y1={y0} y2={y1} stroke={EJE} strokeWidth={TRAZO.base * u} />
      {ms.map((v) => (
        <g key={v}>
          <line x1={x - EJE_MARCA * u} x2={x} y1={y(v)} y2={y(v)} stroke={EJE} strokeWidth={TRAZO.base * u} />
          <text x={xNum} y={y(v)} fontSize={f} fill={CTX} textAnchor="end" dominantBaseline="central">{formato(v)}</text>
        </g>
      ))}
      {titulo && (
        <text x={xNum - num} y={y1 - f / 2 - EJE_HUECO * u} fontSize={f} fontWeight={600} fill={CTX}
              dominantBaseline="auto">{titulo}</text>
      )}
    </g>
  )
}

/** Estados de las marcas de tiempo y flujo (spec 1.4), los mismos en V10, V13 y V14:
 *    hecho        lleno en ACC                       (lo que ya está)
 *    curso        lleno en INK                       (en curso o pedido ahora)
 *    ahora        blanco con contorno ACC de 4 u     (en curso, cuando el lleno en INK pesa demasiado)
 *    condicional  sin relleno, contorno punteado     (lo que depende de pasar: ESTADO.condicional)
 *    contexto     lleno en FIN_GRIS                  (lo que no es foco)
 *  También acepta los nombres de ESTADO: hecha → hecho, piloto → contexto. */
export const FLUJO = {
  hecho: { fill: ACC, texto: SUP },
  curso: { fill: INK, texto: SUP },
  ahora: { fill: SUP, stroke: ACC, strokeWidth: 4, texto: INK },
  condicional: { fill: SUP, stroke: CONTORNO, strokeWidth: 2, dash: [6, 4], texto: INK },
  contexto: { fill: FIN_GRIS, texto: INK },
}
const ALIAS_FLUJO = { hecha: 'hecho', piloto: 'contexto' }

/** Los atributos SVG de un estado de FLUJO, ya multiplicados por u, y el color del texto que va encima (`texto`):
 *  const m = marcaFlujo('curso', u); <rect {...m.attrs} /> <text fill={m.texto}>…</text>. */
export function marcaFlujo(estado, u) {
  const e = FLUJO[ALIAS_FLUJO[estado] ?? estado]
  if (!e) throw new Error(`svg.jsx: estado «${estado}» desconocido (${Object.keys(FLUJO).join(', ')})`)
  const attrs = { fill: e.fill }
  if (e.stroke) {
    attrs.stroke = e.stroke
    attrs.strokeWidth = e.strokeWidth * u
    if (e.dash) attrs.strokeDasharray = e.dash.map((d) => d * u).join(' ')
  }
  return { attrs, texto: e.texto, trazo: e.stroke ? e.strokeWidth * u : 0 }
}

/** Ancho en px de una leyenda (para ubicarla o centrarla): anchoLeyenda(u, items). */
export function anchoLeyenda(u, items, f = 24) {
  const fz = tam(f, u)
  return items.reduce((s, it, i) => s + fz + 10 * u + ancho(it.texto, fz, 400) + (i ? 32 * u : 0), 0)
}

/** La muestra de una leyenda o de un rótulo, de lado s, centrada en (x, y). `marca`: un estado de FLUJO o de ESTADO
 *  ('hecho', 'curso', 'ahora', 'condicional', 'contexto', 'hecha', 'piloto'), 'linea', 'linea-punteada', 'rombo',
 *  'punto', o una función ({ u, x, y, s }) => elemento SVG. */
export function Muestra({ u, marca, x, y, s }) {
  if (typeof marca === 'function') return marca({ u, x, y, s })
  if (marca === 'linea' || marca === 'linea-punteada') {
    return <line x1={x - s / 2} x2={x + s / 2} y1={y} y2={y} stroke={INK} strokeWidth={TRAZO.umbral * u}
                 strokeDasharray={marca === 'linea-punteada' ? punteado(u) : undefined} />
  }
  if (marca === 'rombo') return <Compuerta u={u} x={x} y={y} s={s} estado="hecho" />
  if (marca === 'punto') return <circle cx={x} cy={y} r={s / 2.6} fill={ACC} />
  const m = marcaFlujo(marca, u)
  return <rect x={x - s / 2 + m.trazo / 2} y={y - s / 2 + m.trazo / 2} width={s - m.trazo} height={s - m.trazo}
               rx={TRAZO.radio * u} {...m.attrs} />
}

/** Leyenda en un renglón: por cada ítem, su muestra (Muestra) y su texto (24 u, INK), separados 32 u. (x, y): el punto
 *  de partida a la izquierda y el centro vertical del renglón; anchor 'end' la alinea a la derecha de x y 'middle' la
 *  centra en x. Todo diagrama sin eje la lleva (spec 0.6): «1 cuadro = 1 historia de usuario».
 *    <Leyenda u={u} x={0} y={24 * u} items={[{ marca: 'hecho', texto: X.ley.hecha }, { marca: 'condicional', texto: … }]} /> */
export function Leyenda({ u, x, y, items, anchor = 'start', f = 24 }) {
  const fz = tam(f, u)
  const total = anchoLeyenda(u, items, f)
  let cx = anchor === 'end' ? x - total : anchor === 'middle' ? x - total / 2 : x
  return (
    <g>
      {items.map((it, i) => {
        if (i) cx += 32 * u
        const x0 = cx
        cx += fz + 10 * u + ancho(it.texto, fz, 400)
        return (
          <g key={i}>
            <Muestra u={u} marca={it.marca} x={x0 + fz / 2} y={y} s={fz} />
            <text x={x0 + fz + 10 * u} y={y} fontSize={fz} fill={INK} dominantBaseline="central">{it.texto}</text>
          </g>
        )
      })}
    </g>
  )
}

/** Columnas de semanas entre x0 y x1, de `desde` a `hasta` (las dos incluidas): ancho de cada columna, su centro, su
 *  borde izquierdo y derecho. const S = escalaSemanas({ x0, x1, desde: 1, hasta: 6 }); S.centro(3), S.inicio(3), S.fin(3). */
export function escalaSemanas({ x0, x1, desde = 1, hasta }) {
  const n = Math.max(1, hasta - desde + 1)
  const ancho = (x1 - x0) / n
  const inicio = (s) => x0 + (s - desde) * ancho
  return { n, ancho, inicio, fin: (s) => inicio(s) + ancho, centro: (s) => inicio(s) + ancho / 2 }
}

/** Grilla de semanas: una columna por semana de `desde` a `hasta` entre x0 y x1, con su número arriba (en yNumeros, 22 u,
 *  CTX; cada `cada` semanas, y siempre la primera y la última) y líneas guía verticales en PISTA de y0 a y1 en el borde
 *  de cada columna. `titulo` («Semana», «Semanas desde la aprobación»): en el renglón de los números, terminando en
 *  xTitulo (por defecto x0 − 16 u, alineado a la derecha). `realce`: semanas cuyo número va en INK 700.
 *    const S = escalaSemanas({ x0, x1, desde: 1, hasta: 6 })
 *    <GrillaSemanas u={u} x0={x0} x1={x1} y0={yFilas} y1={yFin} yNumeros={yFilas - 16 * u} desde={1} hasta={6}
 *                   titulo={X.semana} realce={[6]} /> */
export function GrillaSemanas({ u, x0, x1, y0, y1, yNumeros, desde = 1, hasta, cada = 1, titulo, xTitulo, realce = [] }) {
  const S = escalaSemanas({ x0, x1, desde, hasta })
  const f = tam(22, u)
  const yN = yNumeros ?? y0 - 12 * u
  const semanas = Array.from({ length: S.n }, (_, i) => desde + i)
  const conNumero = (s) => s === desde || s === hasta || (s - desde) % cada === 0
  return (
    <g aria-hidden="true">
      {[...semanas, hasta + 1].map((s) => (
        <line key={`l${s}`} x1={S.inicio(s)} x2={S.inicio(s)} y1={y0} y2={y1} stroke={PISTA} strokeWidth={TRAZO.guia * u} />
      ))}
      {semanas.filter(conNumero).map((s) => (
        <text key={s} x={S.centro(s)} y={yN} fontSize={f} fill={realce.includes(s) ? INK : CTX}
              fontWeight={realce.includes(s) ? 700 : 400} textAnchor="middle">{fijo(s)}</text>
      ))}
      {titulo && (
        <text x={xTitulo ?? x0 - 16 * u} y={yN} fontSize={f} fontWeight={600} fill={CTX} textAnchor="end">{titulo}</text>
      )}
    </g>
  )
}

/** Franjas por fila: `filas` bandas de `alto` desde y0, una sí y otra no con fondo suave (PISTA al 40 %), y una línea
 *  guía horizontal en PISTA de x0 a x1 por el centro de cada fila (de punta a punta, para leer a qué fila va cada marca).
 *  El centro de la fila i es y0 + (i + 0,5) × alto. `desdeX`: dónde empieza el fondo (por defecto x0; para que la franja
 *  abarque también la columna de rótulos, pasar 0). `foco`: índice de una fila con fondo REALCE.
 *    <FranjasFila u={u} x0={xGrilla} x1={w} y0={yFilas} filas={5} alto={altoFila} desdeX={0} /> */
export function FranjasFila({ u, x0, x1, y0, filas, alto, desdeX, guia = true, foco = -1 }) {
  const xi = desdeX ?? x0
  return (
    <g aria-hidden="true">
      {Array.from({ length: filas }, (_, i) => (
        <g key={i}>
          {(i % 2 === 0 || i === foco) && (
            <rect x={xi} y={y0 + i * alto} width={x1 - xi} height={alto}
                  fill={i === foco ? REALCE : PISTA} fillOpacity={i === foco ? 1 : 0.4} />
          )}
          {guia && (
            <line x1={x0} x2={x1} y1={y0 + (i + 0.5) * alto} y2={y0 + (i + 0.5) * alto} stroke={PISTA}
                  strokeWidth={TRAZO.guia * u} />
          )}
        </g>
      ))}
    </g>
  )
}

/** Flecha de avance: una barra de x1 a x2, de `grosor` u (28 por defecto) centrada en y, con punta hacia la derecha de
 *  `punta` u (la punta termina en x2). `estado`: de FLUJO ('hecho', 'curso', 'ahora', 'condicional', 'contexto').
 *  El texto que vaya encima, en marcaFlujo(estado, u).texto. Una flecha más corta que su punta se dibuja como punta sola.
 *    <Flecha u={u} x1={S.inicio(f.desde)} x2={S.fin(f.hasta)} y={yc} estado="curso" /> */
export function Flecha({ u, x1, x2, y, grosor = 28, punta = 16, estado = 'hecho' }) {
  const m = marcaFlujo(estado, u)
  const t = grosor * u
  const p = Math.min(punta * u, Math.max(0, x2 - x1))
  const a = m.trazo / 2
  const xa = x1 + a, xb = x2 - a, ya = y - t / 2 + a, yb = y + t / 2 - a
  const xp = Math.max(xa, xb - p)
  return <path d={`M${xa} ${ya} H${xp} L${xb} ${y} L${xp} ${yb} H${xa} Z`} strokeLinejoin="round" {...m.attrs} />
}

/** Compuerta: un rombo de diagonal `s` u (40 por defecto) centrado en (x, y): una condición o una decisión entre dos
 *  etapas. `estado` de FLUJO (por defecto 'hecho', lleno en ACC). Con y1 e y2, además una barra vertical de 6 u en el
 *  color del estado de y1 a y2, detrás del rombo: la compuerta fuerte a la que llegan las filas (primera lista en V10,
 *  decisión en V14). El texto, aparte.
 *    <Compuerta u={u} x={S.fin(6)} y={yArriba} y1={yArriba} y2={yAbajo} /> */
export function Compuerta({ u, x, y, s = 40, estado = 'hecho', y1, y2 }) {
  const m = marcaFlujo(estado, u)
  const r = (s * u) / 2 - m.trazo / 2
  const color = m.attrs.stroke ?? m.attrs.fill
  return (
    <g>
      {y1 != null && y2 != null && (
        <line x1={x} x2={x} y1={y1} y2={y2} stroke={color} strokeWidth={6 * u} strokeDasharray={m.attrs.strokeDasharray} />
      )}
      <path d={`M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z`} strokeLinejoin="round" {...m.attrs} />
    </g>
  )
}

/** Hito: un rombo chico de diagonal `s` u (22 por defecto) en (x, y), con su rótulo opcional (`texto`, 22 u, INK o CTX
 *  con `secundario`) del `lado` 'arriba', 'abajo', 'der' o 'izq'. Para lo que vence en una semana: no tiene comienzo ni
 *  duración (spec 0.8). `estado` de FLUJO.
 *    <Hito u={u} x={S.centro(a.semana)} y={yc} estado="hecho" texto={`${X.semana} ${fijo(a.semana)}`} lado="der" /> */
export function Hito({ u, x, y, s = 22, estado = 'hecho', texto, lado = 'arriba', secundario = false }) {
  const f = tam(22, u)
  const d = (s * u) / 2 + 8 * u
  const pos = {
    arriba: { x, y: y - d, anchor: 'middle', base: 'auto' },
    abajo: { x, y: y + d, anchor: 'middle', base: 'hanging' },
    der: { x: x + d, y, anchor: 'start', base: 'central' },
    izq: { x: x - d, y, anchor: 'end', base: 'central' },
  }[lado]
  return (
    <g>
      <Compuerta u={u} x={x} y={y} s={s} estado={estado} />
      {texto && (
        <text x={pos.x} y={pos.y} fontSize={f} fontWeight={secundario ? 400 : 600} fill={secundario ? CTX : INK}
              textAnchor={pos.anchor} dominantBaseline={pos.base}>{texto}</text>
      )}
    </g>
  )
}

/** «Estamos acá»: una pastilla en INK con el texto en blanco (22 u, 600) y un pico que apunta a (x, y), del `lado`
 *  'arriba' (la pastilla arriba del punto, por defecto) o 'abajo'. El texto sale de CF («estamos acá · se pide ahora»).
 *  Alto total: altoAqui(u). */
export function Aqui({ u, x, y, texto, lado = 'arriba' }) {
  const f = tam(22, u)
  const w = ancho(texto, f, 600) + 28 * u
  const h = f * 1.6
  const pico = 10 * u
  const s = lado === 'abajo' ? 1 : -1
  const yc = y + s * (pico + h / 2)
  return (
    <g>
      <path d={`M${x - pico} ${y + s * pico} L${x} ${y} L${x + pico} ${y + s * pico} Z`} fill={INK} />
      <rect x={x - w / 2} y={yc - h / 2} width={w} height={h} rx={h / 2} fill={INK} />
      <text x={x} y={yc} fontSize={f} fontWeight={600} fill={SUP} textAnchor="middle" dominantBaseline="central">{texto}</text>
    </g>
  )
}
export const altoAqui = (u) => tam(22, u) * 1.6 + 10 * u

/** Llave horizontal de 2 u en EJE de x1 a x2 a la altura y, con el pico hacia `lado` ('arriba' o 'abajo') en el centro:
 *  agrupa tramos (el total de V08) o marca una distancia (V09) sin escribir una cifra nueva. */
export function LlaveH({ u, x1, x2, y, lado = 'arriba' }) {
  const d = (lado === 'arriba' ? -1 : 1) * 8 * u
  const xm = (x1 + x2) / 2
  return (
    <path d={`M${x1} ${y - d} V${y} H${x2} V${y - d} M${xm} ${y} V${y + d}`} fill="none" stroke={EJE}
          strokeWidth={TRAZO.contorno * u} />
  )
}
