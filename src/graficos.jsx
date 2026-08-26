// Primitivas de grafico. SVG a mano, sin libreria: el peso extra no se justifica para
// cuatro formas y el control fino del alto es lo que hace posible el tablero sin scroll.
//
// Reglas del rulebook implementadas aca y no desactivables por prop:
//   4  toda barra arranca en cero          14  etiqueta directa sobre la serie
//   6  barra horizontal para categorias    16  nada de texto en diagonal
//   7  linea para series de tiempo         18  un solo color de enfasis
//   21 todo eje lleva titulo
// Prohibidas por construccion: torta, dona, 3D, eje Y secundario.
//
// La regla 12 decia "sin borde de grafico ni gridlines" y se mantiene: NO hay gridlines ni
// marco. Lo que si hay ahora es eje: linea de base, marcas y escala rotulada. Un grafico sin
// eje no cumple la regla 12, no tiene eje, que es otra cosa.

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
    <div ref={ref} className={`lienzo-caja ${className}`}
         style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
      {/* La clase existe para que el detector de desborde pueda distinguir "no monto el
          grafico" de "no hay grafico en esta pantalla". Sin eso, una caja medida que quedo
          vacia pasa como pantalla sin grafico y el chequeo da OK sobre nada. */}
      <div className="lienzo-pintura" style={{ position: 'absolute', inset: 0 }}>
        {caja.w > 0 && caja.h > 0 ? children(caja) : null}
      </div>
    </div>
  )
}

/** Ancho aproximado de un texto. Sirve para presupuestar columnas y para dimensionar la
 *  plaqueta blanca de un rotulo sin medir el DOM. */
function anchoTexto(t, fuente) {
  return String(t).length * fuente * 0.56
}

const ACC = 'var(--acc)'
// Excepcion, no enfasis. Con la paleta azul el terracota dejo de significar "mira aca" y
// pasa a significar "esto es la excepcion": sin consentimiento, fuera de meta, no
// contactable. Un dato con excepcion:true lo pide; enfasis:true sigue siendo el azul.
const EXC = 'var(--terra)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'
const EJE = 'var(--eje)'

/**
 * Escala de numeros redondos. Devuelve el tope y las marcas.
 * Sin esto el eje termina en 21,3 % (max x 1,12) y arranca "muy de arriba": el tope tiene
 * que ser un numero que alguien diria en voz alta, no el maximo de la serie inflado.
 */
export function escalaNice(max, objetivo = 5) {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] }
  const bruto = max / objetivo
  const mag = 10 ** Math.floor(Math.log10(bruto))
  const norm = bruto / mag
  const paso = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const tope = Math.ceil(max / paso - 1e-9) * paso
  const ticks = []
  for (let v = 0; v <= tope + paso * 1e-9; v += paso) ticks.push(Number(v.toFixed(10)))
  return { max: tope, ticks }
}

/**
 * Escala de numeros redondos que NO arranca en cero.
 *
 * Cuando los datos viven entre 6 % y 19 %, forzar el cero deja el 30 % de abajo del grafico
 * vacio y aplasta las variaciones que son justo el tema. Truncar el eje es legitimo en una
 * serie de tiempo (la regla 4, "toda barra arranca en cero", habla de barras: el largo de una
 * barra ES la cifra, la altura de un punto no). Lo que no es legitimo es truncar sin decirlo,
 * asi que quien use esto tiene que dibujar la marca de corte.
 */
export function escalaNiceRango(min, max, objetivo = 4) {
  const span = max - min
  if (!(span > 0)) return { min: 0, max: max || 1, ticks: [0, max || 1], cortada: false }
  const bruto = span / objetivo
  const mag = 10 ** Math.floor(Math.log10(bruto))
  const norm = bruto / mag
  const paso = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const piso = Math.floor(min / paso + 1e-9) * paso
  const techo = Math.ceil(max / paso - 1e-9) * paso
  const ticks = []
  for (let v = piso; v <= techo + paso * 1e-9; v += paso) ticks.push(Number(v.toFixed(10)))
  return { min: piso, max: techo, ticks, cortada: piso > 0 }
}

/** Marca de corte del eje: el eje se parte en dos trazos y queda un hueco. Es la senal
 *  convencional de "esta escala no arranca en cero" y va acompanada de su rotulo. */
function CorteDeEje({ x, y }) {
  return (
    <g aria-hidden="true">
      <path d={`M${x - 5} ${y + 3} l10 -4 M${x - 5} ${y + 8} l10 -4`}
            stroke={EJE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

/**
 * Rotulo sobre plaqueta opaca. Los rotulos que caian sobre una trama o sobre otra serie se
 * leian como si estuvieran en un plano de atras; la plaqueta los trae al frente.
 */
export function Plaqueta({ x, y, texto, fuente = 12, peso = 600, color = INK,
                           anclaje = 'start', padX = 5 }) {
  const w = anchoTexto(texto, fuente) + padX * 2
  const h = fuente + 7
  const rx = anclaje === 'end' ? x - w + padX : anclaje === 'middle' ? x - w / 2 : x - padX
  return (
    <g>
      <rect x={rx} y={y - h / 2} width={w} height={h} rx="2"
            fill="var(--sup)" stroke="var(--bd2)" strokeWidth="1" />
      <text x={x} y={y} fontSize={fuente} fill={color} fontWeight={peso}
            textAnchor={anclaje} dominantBaseline="central" className="tabular">{texto}</text>
    </g>
  )
}

/** Eje de valores horizontal: linea de base, marcas y escala. Debajo, el titulo (regla 21). */
function EjeXValor({ x0, ancho, y, ticks, max, formato, titulo }) {
  return (
    <g>
      <line x1={x0} x2={x0 + ancho} y1={y} y2={y} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => {
        const x = x0 + (t / max) * ancho
        return (
          <g key={t}>
            <line x1={x} x2={x} y1={y} y2={y + 4} stroke={EJE} strokeWidth="1" />
            <text x={x} y={y + 17} fontSize="10.5" fill={MUT} textAnchor="middle"
                  className="tabular">{formato(t)}</text>
          </g>
        )
      })}
      {/* El titulo va en la PUNTA del eje y debajo de los rotulos de las marcas: pegado al
          origen se confundia con la primera marca. */}
      {titulo && (
        <text x={x0 + ancho} y={y + 38} fontSize="11" fill={MUT2} textAnchor="end"
              letterSpacing=".09em" fontWeight={600}
              style={{ textTransform: 'uppercase' }}>{titulo}</text>
      )}
    </g>
  )
}

/**
 * Barras horizontales con base en cero y eje de valores abajo.
 * `datos`: [{etiqueta, valor, nota, enfasis}]. El orden se decide afuera (regla 11).
 */
export function BarrasH({ datos, w, h, formato, formatoEje, tituloEje, anchoEtiqueta = 132,
                          onBarra, referencia }) {
  if (!datos.length) return null
  const fmtEje = formatoEje || formato
  const padTop = 8
  const altoEje = tituloEje ? 48 : 26
  const disponible = h - padTop - altoEje
  const paso = disponible / datos.length
  // Regla 10: la barra mas ancha que el espacio entre barras.
  const alto = Math.max(9, Math.min(paso * 0.66, Math.max(40, paso * 0.6)))
  const fuente = Math.max(10.5, Math.min(13, paso * 0.42))

  const x0 = anchoEtiqueta
  // Los dos presupuestos que antes eran constantes del llamador y se pisaban entre si: el
  // ancho de la etiqueta de valor y el de la columna de notas salen de los datos reales.
  // Con notaAncho fijo, "ARS 36,8 M" y "9,1 % en riesgo (circular)" terminaban encimados.
  const textoValor = (d) => formato(d.valor) + (d.sufijo ? `  ${d.sufijo}` : '')
  const anchoValor = Math.max(38, ...datos.map((d) => anchoTexto(textoValor(d), fuente) + 12))
  const anchoNota = Math.max(0, ...datos.map((d) => (d.nota ? anchoTexto(d.nota, fuente - 1.5) + 14 : 0)))
  const ancho = Math.max(40, w - x0 - anchoNota - anchoValor - 6)

  const crudo = Math.max(...datos.map((d) => d.valor), 0)
  const { max, ticks } = escalaNice(crudo)
  const yBase = padTop + disponible
  const xDe = (v) => x0 + (v / max) * ancho

  return (
    <svg width={w} height={h} role={onBarra ? 'group' : 'img'}
         aria-label={tituloEje || 'Gráfico de barras'} style={{ display: 'block' }}>
      {datos.map((d, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const largo = Math.max(1, (d.valor / max) * ancho)
        return (
          <g key={d.etiqueta}>
            <text x={x0 - 9} y={y + alto / 2} fontSize={fuente}
                  fill={d.excepcion ? EXC : d.enfasis ? INK : MUT2}
                  textAnchor="end" dominantBaseline="central"
                  fontWeight={d.enfasis || d.excepcion ? 600 : 400}>{d.etiqueta}</text>
            <rect x={x0} y={y} width={largo} height={alto}
                  fill={d.excepcion ? EXC : d.enfasis ? ACC : GRIS} />
            {/* etiqueta directa sobre la serie, no leyenda aparte (regla 14) */}
            <text x={x0 + largo + 7} y={y + alto / 2} fontSize={fuente}
                  fill={d.excepcion ? EXC : d.enfasis ? INK : MUT2} dominantBaseline="central"
                  fontWeight={d.enfasis || d.excepcion ? 600 : 500} className="tabular">
              {formato(d.valor)}
              {d.sufijo && <tspan fill={MUT} fontWeight={400}>{`  ${d.sufijo}`}</tspan>}
            </text>
            {d.nota && (
              <text x={w} y={y + alto / 2} fontSize={fuente - 1.5} fill={MUT}
                    textAnchor="end" dominantBaseline="central" className="tabular">{d.nota}</text>
            )}
          </g>
        )
      })}
      {/* eje de categorias: la vertical que le faltaba al grafico para no flotar */}
      <line x1={x0} x2={x0} y1={padTop} y2={yBase} stroke={EJE} strokeWidth="1" />
      <EjeXValor x0={x0} ancho={ancho} y={yBase} ticks={ticks} max={max}
                 formato={fmtEje} titulo={tituloEje} />
      {referencia != null && referencia.valor > 0 && (
        <ReferenciaV x={xDe(referencia.valor)} h={yBase} y={padTop}
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

/** Marca de referencia vertical sobre un grafico de barras. Lleva etiqueta: una marca sin
 *  leyenda se lee como meta, que es lo contrario de lo que es. */
export function ReferenciaV({ x, h, etiqueta, y = 0 }) {
  return (
    <g>
      <line x1={x} x2={x} y1={y} y2={h} stroke={INK} strokeWidth="1.5" strokeDasharray="3 2" />
      <Plaqueta x={x} y={y + 6} texto={etiqueta} fuente={10} peso={600} color={MUT2}
                anclaje="middle" />
    </g>
  )
}

/**
 * Serie de tiempo en linea (regla 7). Acepta huecos (valor null) y NO los interpola: un
 * trimestre sin ventana de 90 dias completa se corta, no se inventa.
 *
 * Las bandas de meta y de linea base se rotulan en el margen derecho, fuera del area de
 * dibujo. Rotuladas adentro se cruzaban con la curva justo en el tramo final, que es el que
 * importa.
 */
export function Linea({ serie, w, h, formato, banda, banda2, zonas, rotuloBanda = 'meta',
                        rotuloBanda2 = 'línea base', tituloEje, tituloY }) {
  // Un grafico SVG en pantalla ES interactivo: de los 15 trimestres solo dos llevan
  // etiqueta directa (el pico y el ultimo), asi que sin esto los otros trece no se pueden
  // leer. El teclado hace lo mismo que el mouse. En papel no existe, y por eso la etiqueta
  // directa y el eje siguen cargando el dato: el tooltip suma, no habilita.
  const [foco, setFoco] = useState(null)
  const mover = (e) => {
    const caja = e.currentTarget.getBoundingClientRect()
    const t = (e.clientX - caja.left) / Math.max(1, caja.width)
    setFoco(Math.max(0, Math.min(serie.length - 1, Math.round(t * (serie.length - 1)))))
  }
  const padL = 50
  const padT = tituloY ? 26 : 14
  const padB = 56          // dos renglones con aire: marcas del eje X y, debajo, su titulo
  const vals = serie.filter((p) => p.valor != null).map((p) => p.valor)
  if (!vals.length) return null

  // El margen derecho lo fija el rotulo de banda mas largo, no un porcentaje del ancho: con
  // un ancho fijo, "meta 10,0%-11,0%" se cortaba a "meta 10,0%-1" en la resolucion minima.
  const rotulos = zonas
    ? zonas.map((z) => `${z.etiqueta} ${z.rango}`)
    : [
      banda ? `${rotuloBanda} ${formato(banda[0])}–${formato(banda[1])}` : '',
      banda2 ? `${rotuloBanda2} ${formato(banda2[0])}–${formato(banda2[1])}` : '',
    ]
  // +25 por la muestra de color y su aire; sin eso el rotulo se sale del lienzo.
  const padR = Math.min(w * 0.34, Math.max(30, ...rotulos.map((r) => anchoTexto(r, 10) + 25)))
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)

  // Escala: si forzar el cero deja mas de un tercio del alto vacio, el eje arranca en un
  // numero redondo por debajo del minimo y se DECLARA cortado. Con la recompra entre 6,3 % y
  // 19,0 %, el cero se comia el 33 % del grafico y aplastaba justo la caida que es el tema.
  const topes = [...vals, ...(banda || []), ...(banda2 || []),
                 ...(zonas ? zonas.flatMap((z) => [z.desde, z.hasta]).filter((v) => Number.isFinite(v)) : [])]
  const crudo = Math.max(...topes)
  const piso = Math.min(...topes)
  // Umbral: si el cero se come mas de una cuarta parte del alto, no vale la pena pagarlo.
  // Con la recompra (6,3 % a 19,0 %) el cero desperdiciaba un tercio del grafico.
  const conviene = piso > 0.25 * crudo
  const esc = conviene ? escalaNiceRango(piso, crudo, 4) : { ...escalaNice(crudo, 4), min: 0, cortada: false }
  const { max, ticks, cortada } = esc
  const min = esc.min
  const X = (i) => padL + (i / Math.max(1, serie.length - 1)) * iw
  const Y = (v) => padT + ih - ((v - min) / (max - min)) * ih
  const yBase = Y(min)

  const tramos = []
  let actual = []
  serie.forEach((p, i) => {
    if (p.valor == null) { if (actual.length) tramos.push(actual); actual = [] }
    else actual.push([X(i), Y(p.valor)])
  })
  if (actual.length) tramos.push(actual)

  const ultimo = [...serie].reverse().find((p) => p.valor != null)
  const iUlt = serie.findIndex((p) => p === ultimo)
  // La franja que se prende es la del valor APUNTADO: el del cursor mientras se recorre la
  // serie, y el ultimo cuando no hay cursor. Asi "en que zona estoy" deja de depender de
  // leer una etiqueta y pasa a ser lo primero que se ve.
  const vApuntado = foco != null && serie[foco] && serie[foco].valor != null
    ? serie[foco].valor
    : (ultimo ? ultimo.valor : null)
  const iZona = zonas && vApuntado != null
    ? zonas.findIndex((z) => vApuntado >= z.desde && vApuntado < z.hasta)
    : -1
  const pico = serie.reduce((a, p, i) => (p.valor != null && p.valor > (a.v ?? -1) ? { v: p.valor, i } : a), {})
  const xFin = padL + iw

  return (
    <svg width={w} height={h} role="img" aria-label={tituloEje || 'Serie de tiempo'}
         style={{ display: 'block' }}>
      {/* Titulo del eje Y en su PUNTA, arriba del todo y a la izquierda: no compite con
          ninguna marca porque queda por encima del primer tick. */}
      {tituloY && (
        <text x={4} y={11} fontSize="11" fill={MUT2} letterSpacing=".09em" fontWeight={600}
              style={{ textTransform: 'uppercase' }}>{tituloY}</text>
      )}
      {/* El aviso de escala truncada va en el renglón del título del eje, que es donde se
          lee qué significa la escala. Abajo, junto a la marca de corte, se encimaba con los
          rótulos de trimestre. */}
      {cortada && (
        <text x={xFin} y={11} fontSize="10" fill={MUT2} textAnchor="end" fontWeight={600}>
          eje cortado: arranca en {formato(min)}, no en cero
        </text>
      )}

      {/* Las bandas primero, todo lo demas va encima.

          Las dos NO se distinguen por tono. Compuestas sobre blanco daban #e2e7ec y #e5e7ea:
          ΔE 0,5 incluso con vision normal, o sea el mismo color, y esta pantalla existe para
          decir que el valor cae por debajo de UNA de ellas. La meta se queda con el tinte del
          acento (es la zona que se quiere alcanzar) y la linea base pasa a TRAMA: distinta
          por textura antes que por color, que es lo unico que sobrevive a la impresion en
          blanco y negro. */}
      <Tramas />

      {/* Franjas de umbral: las tres zonas del semaforo de la Parte D §2.1, dibujadas donde
          el lector busca la respuesta. El estado deja de ser una pastilla suelta arriba a la
          derecha y pasa a ser POSICION: la linea cae adentro de una de las tres. Tinte al
          10 % para que la serie siga mandando, y un filete solido en cada corte declarado. */}
      {zonas && zonas.map((z, i) => {
        const yTop = Y(Math.min(max, z.hasta))
        const yBot = Y(Math.max(min, z.desde))
        const on = i === iZona
        return (
          <g key={z.etiqueta}>
            {/* La franja activa se distingue por CONTRASTE con las otras, no por saturacion:
                el tinte sube poco y lo que la separa es que las demas bajan. Una zona
                pintada fuerte compite con la linea, que es el dato. */}
            <rect x={padL} y={yTop} width={iw} height={Math.max(1, yBot - yTop)}
                  fill={z.tono} opacity={on ? '.14' : '.045'} />
            {on && (
              <rect x={padL} y={yTop} width={iw} height={Math.max(1, yBot - yTop)}
                    fill="none" stroke={z.tono} strokeWidth="1" opacity=".4" />
            )}
            {!on && z.desde > min && (
              <line x1={padL} x2={xFin} y1={yBot} y2={yBot} stroke={z.tono}
                    strokeWidth="1" opacity=".28" />
            )}
          </g>
        )
      })}

      {banda2 && (
        <rect x={padL} y={Y(banda2[1])} width={iw} height={Math.max(1, Y(banda2[0]) - Y(banda2[1]))}
              fill="url(#trama)" stroke="var(--bd2)" strokeWidth="1" />
      )}
      {banda && (
        <g>
          <rect x={padL} y={Y(banda[1])} width={iw} height={Math.max(1, Y(banda[0]) - Y(banda[1]))}
                fill="var(--acc)" opacity=".16" />
          <line x1={padL} x2={xFin} y1={Y(banda[1])} y2={Y(banda[1])}
                stroke={ACC} strokeWidth="1" opacity=".5" />
          <line x1={padL} x2={xFin} y1={Y(banda[0])} y2={Y(banda[0])}
                stroke={ACC} strokeWidth="1" opacity=".5" />
        </g>
      )}

      {/* eje Y: linea, marcas y escala en numeros redondos */}
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10.5" fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{formato(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />
      {/* El eje no arranca en cero: se parte con la marca convencional y se dice con
          todas las letras. Una escala truncada sin declarar es la falla que el rulebook
          persigue; declarada, es una decision de encuadre. */}
      {cortada && <CorteDeEje x={padL} y={yBase - 7} />}

      {/* Rotulo de cada banda en el margen, no encima de la curva. La identidad la lleva la
          muestra de color al lado, no el color del texto: un rotulo pintado con el color de
          la serie confunde texto con dato. */}
      {zonas && zonas.map((z, i) => {
        const yc = (Y(Math.min(max, z.hasta)) + Y(Math.max(min, z.desde))) / 2
        return (
          <g key={`rot-${z.etiqueta}`}>
            <rect x={xFin + 7} y={yc - 4.5} width={9} height={9}
                  fill={z.tono} opacity={i === iZona ? '.35' : '.12'}
                  stroke={z.tono} strokeWidth="1" strokeOpacity={i === iZona ? '.85' : '.45'} />
            <text x={xFin + 20} y={yc} fontSize="10" fill={i === iZona ? MUT2 : MUT}
                  dominantBaseline="central" fontWeight={i === iZona ? 600 : 400}>{rotulos[i]}</text>
          </g>
        )
      })}

      {banda && (
        <g>
          <rect x={xFin + 7} y={(Y(banda[0]) + Y(banda[1])) / 2 - 4} width={9} height={9}
                fill="var(--acc)" opacity=".16" stroke={ACC} strokeWidth="1" strokeOpacity=".5" />
          <text x={xFin + 20} y={(Y(banda[0]) + Y(banda[1])) / 2} fontSize="10" fill={MUT2}
                fontWeight={600} dominantBaseline="central">{rotulos[0]}</text>
        </g>
      )}
      {banda2 && (
        <g>
          <rect x={xFin + 7} y={(Y(banda2[0]) + Y(banda2[1])) / 2 - 4} width={9} height={9}
                fill="url(#trama)" stroke="var(--bd2)" strokeWidth="1" />
          <text x={xFin + 20} y={(Y(banda2[0]) + Y(banda2[1])) / 2} fontSize="10" fill={MUT}
                dominantBaseline="central">{rotulos[1]}</text>
        </g>
      )}

      {tramos.map((t, i) => (
        <polyline key={i} points={t.map((p) => p.join(',')).join(' ')} fill="none"
                  stroke={ACC} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {pico.i != null && pico.i !== iUlt && (foco == null || Math.abs(foco - pico.i) > 1) && (
        <g>
          <circle cx={X(pico.i)} cy={Y(pico.v)} r="3.5" fill="var(--sup)" stroke={ACC} strokeWidth="1.75" />
          <Plaqueta x={X(pico.i)} y={Y(pico.v) - 13} texto={formato(pico.v)} fuente={10.5}
                    peso={600} color={MUT2} anclaje="middle" />
        </g>
      )}
      {/* El ultimo punto casi siempre cae en el borde derecho, donde ya viven los rotulos de
          las bandas: su plaqueta se ancla hacia adentro para no encimarse con ellos. */}
      {ultimo && (
        <g>
          {/* Anillo de superficie: el ultimo punto cae encima de la banda y sin el se
              empasta con ella. */}
          <circle cx={X(iUlt)} cy={Y(ultimo.valor)} r="4" fill={ACC}
                  stroke="var(--sup)" strokeWidth="2" />
          <Plaqueta x={X(iUlt) - (iUlt === serie.length - 1 ? 8 : 0)}
                    y={Y(ultimo.valor) - 15} texto={formato(ultimo.valor)}
                    fuente={12} peso={700} color={INK}
                    anclaje={iUlt === serie.length - 1 ? 'end' : 'middle'} />
        </g>
      )}

      {/* eje X: nada en diagonal (regla 16). Se saltean etiquetas si no entran. */}
      {serie.map((p, i) => {
        const cada = Math.ceil((serie.length * 46) / Math.max(1, iw))
        if (i % cada !== 0 && i !== serie.length - 1) return null
        return (
          <g key={p.etiqueta}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(i)} y={yBase + 18} fontSize="10.5" fill={MUT} textAnchor="middle">
              {p.etiqueta}
            </text>
          </g>
        )
      })}
      {/* Titulo del eje X en su punta derecha, por debajo de los rotulos de trimestre. */}
      {tituloEje && (
        <text x={xFin} y={yBase + 42} fontSize="11" fill={MUT2} textAnchor="end"
              letterSpacing=".09em" fontWeight={600}
              style={{ textTransform: 'uppercase' }}>{tituloEje}</text>
      )}

      {foco != null && serie[foco] && serie[foco].valor != null && (() => {
        const x = X(foco)
        const y = Y(serie[foco].valor)
        const txt = `${serie[foco].etiqueta}  ${formato(serie[foco].valor)}`
        const bw = anchoTexto(txt, 11) + 18
        // La caja se da vuelta contra el borde derecho en vez de salirse del lienzo.
        const bx = Math.min(x + 12, xFin - bw) < padL ? x + 12
          : (x + 12 + bw > w - 4 ? x - 12 - bw : x + 12)
        return (
          <g pointerEvents="none">
            <line x1={x} x2={x} y1={padT} y2={yBase} stroke={MUT2} strokeWidth="1" opacity=".45" />
            <circle cx={x} cy={y} r="4.5" fill={ACC} stroke="var(--sup)" strokeWidth="2" />
            <g transform={`translate(0 ${Math.max(padT + 12, Math.min(y - 14, yBase - 14))})`}>
              <rect x={bx} y={-11} width={bw} height={22} rx="3"
                    fill="var(--sup)" stroke="var(--bd)" strokeWidth="1" />
              <text x={bx + 9} y={0} fontSize="11" fill={INK} dominantBaseline="central"
                    className="tabular">{txt}</text>
            </g>
          </g>
        )
      })()}

      {/* Zona de captura: cubre todo el area de dibujo, asi el objetivo es la columna del
          trimestre y no el punto de 8 px. */}
      <rect x={padL} y={padT} width={iw} height={Math.max(1, yBase - padT)} fill="transparent"
            tabIndex={0} role="img"
            aria-label={`${tituloEje || 'Serie'}: ${serie.filter((q) => q.valor != null).map((q) => `${q.etiqueta} ${formato(q.valor)}`).join(', ')}`}
            style={{ cursor: 'crosshair', outline: 'none' }}
            onPointerMove={(e) => mover(e)}
            onPointerLeave={() => setFoco(null)}
            /* Respaldo de mouse: hay stacks de entrada que no emiten eventos de puntero.
               React descarta el setState repetido, asi que el doble handler no cuesta. */
            onMouseMove={(e) => mover(e)}
            onMouseLeave={() => setFoco(null)}
            onFocus={() => setFoco((f) => (f == null ? serie.length - 1 : f))}
            onBlur={() => setFoco(null)}
            onKeyDown={(e) => {
              const paso = { ArrowLeft: -1, ArrowRight: 1 }[e.key]
              if (paso !== undefined) {
                e.preventDefault(); e.stopPropagation()
                setFoco((f) => Math.max(0, Math.min(serie.length - 1, (f ?? serie.length - 1) + paso)))
              } else if (e.key === 'Escape') { e.stopPropagation(); setFoco(null) }
            }} />
    </svg>
  )
}

/**
 * Puntos con intervalo de confianza sobre una escala comun.
 *
 * Es el grafico correcto cuando la pregunta es "¿alguno se despega?" y las tasas son del
 * orden del 1 %: con barras desde cero, 0,96 % y 1,39 % dan dos rectangulos casi identicos
 * y la respuesta queda en el titulo en vez de estar en el dibujo. Con punto e intervalo, el
 * solapamiento se ve, y "no discrimina" pasa a ser algo que el lector verifica.
 * Cleveland-McGill: posicion sobre escala comun rankea por encima de largo.
 */
export function PuntosIC({ datos, w, h, formato, tituloEje, anchoEtiqueta = 132, referencia }) {
  if (!datos.length) return null
  const padTop = 8
  const altoEje = tituloEje ? 48 : 26
  const disponible = h - padTop - altoEje
  const paso = disponible / datos.length
  const fuente = Math.max(10.5, Math.min(13, paso * 0.4))

  const x0 = anchoEtiqueta
  const anchoNota = Math.max(0, ...datos.map((d) => (d.nota ? anchoTexto(d.nota, fuente - 1.5) + 14 : 0)))
  const ancho = Math.max(40, w - x0 - anchoNota - 16)
  const lo = 0
  const crudo = Math.max(...datos.map((d) => d.ic[1]), referencia ? referencia.ic[1] : 0)
  const { max, ticks } = escalaNice(crudo, 5)
  const X = (v) => x0 + ((v - lo) / (max - lo)) * ancho
  const yBase = padTop + disponible

  return (
    <svg width={w} height={h} role="img" aria-label={tituloEje || 'Puntos con intervalo'}
         style={{ display: 'block' }}>
      {referencia && (
        <g>
          <rect x={X(referencia.ic[0])} y={padTop} width={Math.max(1, X(referencia.ic[1]) - X(referencia.ic[0]))}
                height={disponible} fill="var(--mut)" opacity=".13" />
          <line x1={X(referencia.valor)} x2={X(referencia.valor)} y1={padTop} y2={yBase}
                stroke={MUT2} strokeWidth="1.25" strokeDasharray="3 2" />
        </g>
      )}
      {datos.map((d, i) => {
        const y = padTop + i * paso + paso / 2
        const color = d.excepcion ? EXC : d.enfasis ? ACC : GRIS
        return (
          <g key={d.etiqueta}>
            <text x={x0 - 9} y={y} fontSize={fuente} fill={d.enfasis ? INK : MUT2}
                  textAnchor="end" dominantBaseline="central"
                  fontWeight={d.enfasis ? 600 : 400}>{d.etiqueta}</text>
            {/* barra de intervalo: remates en los extremos para que se lea como rango */}
            <line x1={X(d.ic[0])} x2={X(d.ic[1])} y1={y} y2={y} stroke={color} strokeWidth="2" />
            <line x1={X(d.ic[0])} x2={X(d.ic[0])} y1={y - 5} y2={y + 5} stroke={color} strokeWidth="1.5" />
            <line x1={X(d.ic[1])} x2={X(d.ic[1])} y1={y - 5} y2={y + 5} stroke={color} strokeWidth="1.5" />
            <circle cx={X(d.valor)} cy={y} r={d.enfasis ? 5 : 4.25} fill={color}
                    stroke="var(--sup)" strokeWidth="1.5" />
            <text x={X(d.ic[1]) + 9} y={y} fontSize={fuente} fill={d.enfasis ? INK : MUT2}
                  dominantBaseline="central" fontWeight={d.enfasis ? 700 : 600}
                  className="tabular">{formato(d.valor)}</text>
            {d.nota && (
              <text x={w} y={y} fontSize={fuente - 1.5} fill={MUT} textAnchor="end"
                    dominantBaseline="central" className="tabular">{d.nota}</text>
            )}
          </g>
        )
      })}
      <line x1={x0} x2={x0} y1={padTop} y2={yBase} stroke={EJE} strokeWidth="1" />
      <EjeXValor x0={x0} ancho={ancho} y={yBase} ticks={ticks} max={max}
                 formato={formato} titulo={tituloEje} />
    </svg>
  )
}

/** Embudo en barras desde cero (no en trapecios: el area engana, Cleveland-McGill). */
export function Embudo({ etapas, w, h, formato, formatoEje, tituloEje, formatoPct }) {
  const fp = formatoPct || ((v) => `${(v * 100).toFixed(1).replace('.', ',')} %`)
  const base = etapas[0] ? etapas[0].valor : 0
  const datos = etapas.map((e, i) => ({
    etiqueta: e.etiqueta,
    // El porcentaje sobre el total va PEGADO al valor, no flotando en la columna derecha:
    // ahi quedaba en gris chico y a 400 px del dato que califica.
    valor: e.valor,
    sufijo: i > 0 && base ? fp(e.valor / base) : null,
    // La columna derecha pasa a decir la conversion respecto de la etapa anterior, que es
    // la informacion propia de un embudo y no estaba en ningun lado.
    nota: i > 0 && etapas[i - 1].valor
      ? `${fp(e.valor / etapas[i - 1].valor)} de ${etapas[i - 1].etiqueta.toLowerCase()}`
      : '',
    enfasis: i === etapas.length - 1,
  }))
  return <BarrasH datos={datos} w={w} h={h} formato={formato} formatoEje={formatoEje}
                  tituloEje={tituloEje} anchoEtiqueta={124} />
}

/** Trama diagonal para distinguir tramos sin depender del color. En una impresion en blanco
 *  y negro dos rellenos grises son el mismo relleno; una trama no.
 *
 *  Clara a proposito: la version anterior era gris medio con lineas finas y cualquier rotulo
 *  encima se leia como si estuviera en un plano de atras. Ahora la trama es el fondo y los
 *  rotulos van sobre plaqueta. */
export function Tramas() {
  return (
    <defs>
      <pattern id="trama" width="7" height="7" patternUnits="userSpaceOnUse"
               patternTransform="rotate(45)">
        <rect width="7" height="7" fill="var(--tram-b)" />
        <line x1="0" y1="0" x2="0" y2="7" stroke="var(--tram-l)" strokeWidth="3" />
      </pattern>
    </defs>
  )
}

/**
 * Barra segmentada desde cero, con rotulo y valor SOBRE cada tramo y trama en el que no
 * lleva enfasis. Los tramos no se distinguen solo por color, y los valores van sobre
 * plaqueta opaca para que se lean tambien sobre la trama.
 */
export function BarraTramos({ tramos, w, h, formato, banda, alturaBarra }) {
  const total = tramos.reduce((s, t) => s + t.valor, 0) || 1
  // Tope duro de 84 px, aunque la pantalla pida mas. Una barra de composicion mas gruesa que
  // eso no informa mas: la proporcion ya esta dicha por el ancho, y el alto extra solo pesa.
  // El hueco de abajo NO se tapa engordando la barra; se resuelve centrando el bloque.
  const alto = Math.max(26, Math.min(alturaBarra ?? h * 0.34, 84))
  const ROT = 20   // rotulo arriba
  const NOTA = tramos.some((t) => t.nota) ? 22 : 6
  const y = Math.max(ROT, (h - alto - NOTA + ROT) / 2)
  let x = 0
  return (
    <svg width={w} height={Math.max(h, y + alto + NOTA + 6)} role="img" aria-label="Barra segmentada"
         style={{ display: 'block' }}>
      <Tramas />
      {tramos.map((t, i) => {
        const ancho = (t.valor / total) * w
        const el = (
          <g key={t.etiqueta}>
            <rect x={x} y={y} width={Math.max(0, ancho - (i < tramos.length - 1 ? 2 : 0))}
                  height={alto} fill={t.excepcion ? EXC : t.enfasis ? ACC : 'url(#trama)'}
                  stroke={t.enfasis ? 'none' : 'var(--bd2)'} strokeWidth="1" />
            <text x={x + 1} y={y - 7} fontSize="11.5" fontWeight={t.enfasis || t.excepcion ? 700 : 500}
                  fill={t.excepcion ? EXC : t.enfasis ? INK : MUT2}>{t.etiqueta}</text>
            {ancho > 74 && (
              t.enfasis || t.excepcion
                ? <text x={x + 10} y={y + alto / 2} fontSize="13.5" fontWeight={700} fill="#fff"
                        dominantBaseline="central" className="tabular">{formato(t.valor)}</text>
                : <Plaqueta x={x + 10} y={y + alto / 2} texto={formato(t.valor)} fuente={13.5}
                            peso={700} color={INK} />
            )}
            {t.nota && (
              <text x={x + 1} y={y + alto + 15} fontSize="10.5" fill={MUT}>{t.nota}</text>
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

/**
 * Sparkline: la serie entera en pocos pixeles, con su banda y el ultimo punto marcado.
 *
 * No lleva eje a proposito, y no contradice la regla 21: no es un grafico de analisis sino
 * la prueba al pie de una afirmacion que ya trae su cifra escrita al lado. El eje rotulado
 * de esta misma serie vive en D4, que es la pantalla que la analiza.
 */
export function Chispa({ serie, w, h, banda, tonoBanda = 'var(--acc)', rotulo, rotuloBanda }) {
  const vals = serie.filter((v) => v != null)
  if (!vals.length || w < 40 || h < 14) return null
  const topes = [...vals, ...(banda || [])]
  const hi = Math.max(...topes)
  const lo = Math.min(...topes)
  const pad = (hi - lo) * 0.12 || 1
  const max = hi + pad
  const min = Math.max(0, lo - pad)
  const R = 3.5
  // El rotulo del ultimo valor se lleva su ancho del area de dibujo, y el punto se mete R
  // hacia adentro: dibujado en x = w quedaba cortado a la mitad por el borde del SVG.
  const anchoRot = rotulo ? anchoTexto(rotulo, 11) + 12 : 0
  const iw = Math.max(20, w - anchoRot - R * 2)
  const X = (i) => R + (i / Math.max(1, serie.length - 1)) * iw
  const Y = (v) => R + ((max - v) / (max - min)) * Math.max(1, h - R * 2)
  const pts = serie.map((v, i) => (v == null ? null : [X(i), Y(v)])).filter(Boolean)
  const iUlt = pts.length - 1

  return (
    <svg width={w} height={h} aria-hidden="true" data-chispa="" style={{ display: 'block' }}>
      {banda && (
        <g>
          <rect x={0} y={Y(banda[1])} width={iw + R * 2} height={Math.max(1, Y(banda[0]) - Y(banda[1]))}
                fill={tonoBanda} opacity=".14" />
          <line x1={0} x2={iw + R * 2} y1={Y(banda[0])} y2={Y(banda[0])} stroke={tonoBanda}
                strokeWidth="1" opacity=".6" />
          {rotuloBanda && (
            <text x={2} y={Y(banda[0]) - 4} fontSize="9" fill={MUT}>{rotuloBanda}</text>
          )}
        </g>
      )}
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none"
                stroke={ACC} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[iUlt][0]} cy={pts[iUlt][1]} r={R} fill={ACC}
              stroke="var(--sup)" strokeWidth="1.5" />
      {rotulo && (
        <text x={pts[iUlt][0] + 8} y={pts[iUlt][1]} fontSize="11" fill={INK} fontWeight={700}
              dominantBaseline="central" className="tabular">{rotulo}</text>
      )}
    </svg>
  )
}

/**
 * Barra de proporcion en dos tramos, sin rotulos: la cifra ya esta escrita al lado. El
 * tramo que no lleva enfasis va con trama, para que la particion se lea tambien impresa en
 * blanco y negro.
 */
export function BarraMini({ parte, total, w, h = 14, alturaBarra = 14, excepcion = false,
                            rotulo, pie }) {
  if (w < 20) return null
  // Recorte vacio: 0 sobre 0 no es una proporcion. Se dibuja el marco sin relleno y con la
  // leyenda que corresponde, en vez de devolver null y dejar la caja en blanco.
  if (!(total > 0)) {
    return (
      <svg width={w} height={h} aria-hidden="true" data-chispa="" style={{ display: 'block' }}>
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke={EJE} strokeWidth="1"
              strokeDasharray="3 3" />
        <text x={w / 2} y={h / 2 - 7} fontSize="10" fill={MUT} textAnchor="middle">
          sin clientes en este recorte
        </text>
      </svg>
    )
  }
  const ancho = Math.max(1, Math.min(w, (parte / total) * w))
  // Se centra en la caja que le den: adentro de un Lienzo alto quedaria pegada arriba.
  const alto = Math.min(alturaBarra, h)
  const y = Math.max(0, (h - alto) / 2)
  const tono = excepcion ? EXC : ACC
  // El dato marcado: adentro del tramo si entra, si no pegado a su borde. Una barra sin
  // cifra obliga a leer el numero que esta en otro renglon.
  const dentro = rotulo ? anchoTexto(rotulo, 15) + 20 < ancho : false
  return (
    <svg width={w} height={h} aria-hidden="true" data-chispa="" style={{ display: 'block' }}>
      <Tramas />
      <rect x={0} y={y} width={w} height={alto} fill="url(#trama)" stroke="var(--bd2)" strokeWidth="1" />
      <rect x={0} y={y} width={ancho} height={alto} fill={tono} />
      {rotulo && (
        <text x={dentro ? 10 : ancho + 8} y={y + alto / 2} fontSize="15" fontWeight={700}
              fill={dentro ? '#fff' : tono} dominantBaseline="central" className="tabular">
          {rotulo}
        </text>
      )}
      {pie && (
        <text x={0} y={y + alto + 13} fontSize="9.5" fill={MUT}>{pie}</text>
      )}
    </svg>
  )
}

/**
 * Cuadricula de unidades. Un cuadro por cada `porCuadro` clientes, los cubiertos llenos y
 * el resto en trama.
 *
 * Por que esto y no una barra partida: la barra dice la proporcion, pero la pregunta de la
 * pantalla es cuantas personas entran y cuantas quedan afuera, y eso se cuenta. Cincuenta
 * cuadros de los que diez estan llenos se lee de un vistazo y sin leer el numero. El tramo
 * de la banda de capacidad (de 500 a 800) se dibuja con relleno intermedio, asi que el rango
 * declarado se ve en vez de anunciarse.
 */
export function Unidades({ total, cubiertoLo, cubiertoHi, porCuadro, w, h }) {
  if (!(total > 0) || w < 40 || h < 30) return null
  const n = Math.ceil(total / porCuadro)
  const g = 4
  // Columnas por proporcion de la caja, no "las que entren": tomar el cuadro mas grande
  // posible daba una sola fila larguisima, que se cuenta peor que una cuadricula.
  const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt((n * w) / Math.max(1, h)))))
  const filas = Math.ceil(n / cols)
  const s = Math.max(4, Math.min((w - (cols - 1) * g) / cols, (h - (filas - 1) * g) / filas))
  const ancho = cols * (s + g) - g
  const alto = filas * (s + g) - g
  const x0 = Math.max(0, (w - ancho) / 2)
  const y0 = Math.max(0, (h - alto) / 2)
  const nLo = Math.round(cubiertoLo / porCuadro)
  const nHi = Math.round(cubiertoHi / porCuadro)

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${n} cuadros de ${porCuadro} clientes cada uno; los primeros ${nLo} a ${nHi} son los que la capacidad alcanza a contactar`}>
      <Tramas />
      {Array.from({ length: n }, (_, i) => {
        const fila = Math.floor(i / cols)
        const col = i % cols
        const dentro = i < nLo
        const rango = i >= nLo && i < nHi
        return (
          <rect key={i} x={x0 + col * (s + g)} y={y0 + fila * (s + g)} width={s} height={s} rx="1"
                fill={dentro ? ACC : rango ? 'var(--azul3)' : 'url(#trama)'}
                stroke={dentro || rango ? 'none' : 'var(--bd2)'} strokeWidth="1" />
        )
      })}
    </svg>
  )
}

/** Serie de exposicion por corte, bajo el selector: mover el corte es ver la trayectoria. */
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
