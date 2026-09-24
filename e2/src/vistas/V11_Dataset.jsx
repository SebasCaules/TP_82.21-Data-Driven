// V11 · Datos para el modelo — con qué se entrena el modelo del Entregable 3. No es un
// antes/después de una decisión (por eso no lleva .ban-par): es el resultado del tablón que
// arma pipeline/tablon.py sobre la base ya corregida por DC-01 a DC-04 y DC-08. Contrato:
// app/e2/DISENO.md fila V11, app/pipeline/CONTRACT_E2.md §3 y §4 (vistas.V11 = copia de
// resumen_tablon.json), registro fila E08.
//
// (24/09) La vista contesta su pregunta de frente. El título dice con qué meses y cuántas
// filas aprende el modelo y en qué año se lo prueba (NAR-V11-1, OMI-V11-2); la tasa baja a un
// KPI y se dice con la palabra del resto del tablero, «entra en riesgo», no «churn»: para el
// directorio churn es que el cliente se fue, y esto es la parte de filas cliente-mes sin
// riesgo que pasa a riesgo en 90 días (un flujo, no el stock del 50,4 % de la vista 10).
// «churn» queda solo en el nombre del dataset y en la referencia técnica de la hoja impresa.
//
// (24/09) Sale la serie de tasa por corte: a 1152×640 le quedaban ~54 px de dibujo, la línea
// se veía plana y sus dos cifras rotuladas eran las menos confiables (el arranque con 155
// filas y el último corte). Para el modelo importan las cinco tasas por partición, que van en
// la tarjeta de la derecha (VIS-V11-1). Sale también la leyenda: las particiones se nombraban
// tres veces. Ahora cada partición tiene un nombre en llano (entrenamiento, ajuste,
// separación, prueba, prueba aparte) que se usa en los rótulos sobre las barras y en la
// tarjeta; la jerga (train, dev, gap, test, test_flag) queda en los <title>.
//
// El gráfico es propio: BarrasH es horizontal y acá la pregunta es una serie de 33 cortes
// mensuales (mismo motivo que el gráfico propio de V03). Las barras van coloreadas por
// partición: entrenamiento en --despues sólido, prueba en --ink con trama clara (se confundía
// con entrenamiento), separación en --antes (gris, la misma semántica que "antes de la
// decisión" en el resto del tablero), ajuste en azul claro con trama y prueba aparte en
// terracota con trama: es la partición cuya ventana de 90 días toca los meses que DC-09 marcó
// "cobertura no confirmada" (sep–dic 2025), y por eso se aisló de prueba en vez de
// descartarse. (24/09) Los meses de sus cortes (jun–ago 2025) sí están confirmados: pintarlos
// como "sin cobertura confirmada" contradecía a V03 y V10, que dan agosto por confirmado
// (NAR-V11-2). Una nota en el gráfico avisa que la rampa de filas es la regla de 3 compras o
// más acumulándose desde el comienzo del extracto, no la cartera creciendo (OMI-V11-1).

import { useContext, useLayoutEffect, useRef, useState } from 'react'
import { Lienzo, escalaNice, useMedida } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta, mesCorto } from '../formato.js'
import { useEscalaTexto, ImpresionCtx } from '../escala.js'

const V = D2.vistas.V11

const hayDatos = !!(V && Array.isArray(V.cortes) && V.cortes.length)

// Orden cronológico real de las particiones (train arranca la serie, test_flag la cierra):
// leer la tarjeta de usos de arriba abajo sigue el eje de tiempo.
const ORDEN_PARTICION = ['train', 'dev', 'gap', 'test', 'test_flag']
// (24/09) Nombre en llano de cada partición, en los rótulos sobre las barras y en la tarjeta,
// y qué hace el modelo con esas filas (VIS-V11-1). El uso no repite el nombre: la prueba
// aparte se evalúa con reserva, porque su ventana toca meses sin cobertura confirmada.
const NOMBRE = {
  train: 'entrenamiento',
  dev: 'ajuste',
  gap: 'separación',
  test: 'prueba',
  test_flag: 'prueba aparte',
}
const USO = {
  train: 'aprende',
  dev: 'calibra',
  gap: 'no se usa',
  test: 'evalúa',
  test_flag: 'evalúa con reserva',
}

/** Un rango: desde el primer corte de esa partición hasta el último, sus filas y su tasa. */
function rangosParticion(v) {
  return ORDEN_PARTICION.map((p) => {
    const cs = v.cortes.filter((c) => c.particion === p)
    const agg = v.por_particion.find((x) => x.particion === p)
    return {
      particion: p,
      desde: cs.length ? cs[0].corte : null,
      hasta: cs.length ? cs[cs.length - 1].corte : null,
      filas: agg ? agg.filas : 0,
      tasa: agg ? agg.tasa_pct : null,
    }
  })
}

const RANGOS = hayDatos ? rangosParticion(V) : []
const R = Object.fromEntries(RANGOS.map((r) => [r.particion, r]))
const PRIMERO = hayDatos ? V.cortes[0].corte : null
const ULTIMO = hayDatos ? V.cortes[V.cortes.length - 1].corte : null

// Los días en que se revisa el riesgo, leídos de la definición del target en el payload
// («… evaluada en T+30, T+60 y T+90 dias»): el horizonte es el último.
const EVAL = hayDatos
  ? [...(V.evaluacion_target.split('evaluada')[1] ?? '').matchAll(/T\+(\d+)/g)].map((m) => +m[1])
  : []
const H = EVAL.length ? EVAL[EVAL.length - 1] : null
const EN_PALABRAS = { 2: 'dos', 3: 'tres', 4: 'cuatro' }

// Meses sin cobertura confirmada (DC-09) y el número de la vista que los presenta, los dos
// desde el payload (el mismo criterio que V02 y V05 para citar la vista de cobertura).
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const FLAG = D2.vistas.V03?.meses_flag ?? []
const VISTA_COB = DC09 ? Number(DC09.vista.slice(1)) : null
const MESES_FLAG = FLAG.length ? `${mesCorto(FLAG[0])} a ${mesCorto(FLAG[FLAG.length - 1])}` : null
// Los cortes de la prueba aparte cuyo propio mes sí está confirmado (hoy jun a ago 2025).
const FLAG_CONFIRMADOS = hayDatos
  ? V.cortes.filter((c) => c.particion === 'test_flag' && !FLAG.includes(c.corte.slice(0, 7)))
  : []

// Dónde arranca el extracto de ventas: explica la rampa de filas (OMI-V11-1).
const TRX = D2.meta.archivos.find((a) => a.nombre.startsWith('Transacciones'))

// Tasa global con dos decimales (25,45 %), tal cual la fila E08 del registro y la Parte B: a
// un decimal, el tablero, el documento y el registro dejaban de decir el mismo número.
// (24/09) El comentario de antes describía un redondeo half-up a un decimal que el código ya
// no hacía; con dos decimales pct() no redondea nada.
const TASA_GLOBAL = hayDatos ? V.tasa_global_pct : null

// (24/09) El título contesta la pregunta de la vista: con qué meses y cuántas filas aprende el
// modelo y en qué año se lo prueba (prueba y prueba aparte). Todo sale de D2.
const ANIOS_PRUEBA = [...new Set([R.test, R.test_flag]
  .filter((r) => r && r.desde)
  .flatMap((r) => [r.desde.slice(0, 4), r.hasta.slice(0, 4)]))]
const TITULO = hayDatos && R.train?.desde && ANIOS_PRUEBA.length
  ? `El modelo aprende con ${mesCorto(R.train.desde)} a ${mesCorto(R.train.hasta)} `
    + `(${entero(R.train.filas)} filas) y se prueba en ${ANIOS_PRUEBA.join('–')}`
  : 'Datos para el modelo'

// Qué evalúa el target, en llano para el directorio: la nota técnica de D2 (notas[0], con
// nombres de función y sin tildes) no se lee en segundos. (24/09) Dice «entra en riesgo», la
// palabra del resto del tablero, y separa esta tasa (un flujo) del riesgo de la vista 10 (un
// stock), que llega justo antes con otra cifra.
const NOTA_TARGET = hayDatos
  ? 'Cada fila es un cliente con 3 compras o más que no está en riesgo a fin de un mes. Se '
    + `revisa si está en riesgo ${EVAL.slice(0, -1).join(', ')} y ${H} días después: si lo está `
    + `en alguna de las ${EN_PALABRAS[EVAL.length] ?? EVAL.length} fechas, la fila cuenta como que `
    + 'entra en riesgo.'
  : ''
const ID_CIFRA = 'V10'
const V10 = D2.vistas[ID_CIFRA]
const NOTA_STOCK = V10?.despues
  ? `No es el ${pct(V10.despues.pct)} de la vista ${Number(ID_CIFRA.slice(1))}: aquel cuenta a los que `
    + 'ya están en riesgo '
    + `al ${fechaCorta(D2.meta.corte_ref)}.`
  : null

// El pie repite lo que todo pie del tablero trae (corte y base, regla transversal 4): acá la
// base es la unidad de fila del tablón, no filas crudas, así que se arma con los mismos datos
// del payload (cortes, primero y último) en vez de escribir la cuenta a mano. (24/09) La
// referencia técnica (nombre del target, anexo, script) sale de la pantalla y queda solo en
// la hoja impresa (REL-V11-1).
const PIE = hayDatos
  ? 'Una fila por cliente con 3 compras o más y sin riesgo a cada fin de mes, '
    + `${V.cortes.length} fines de mes del ${fechaCorta(PRIMERO)} al ${fechaCorta(ULTIMO)}; `
    + `los datos se separan por fecha, no al azar · datos hasta ${fechaCorta(D2.meta.corte_ref)} `
    + '· registro: E08'
  : 'registro: E08'
const TARGET_TECNICO = hayDatos ? V.notas?.[0]?.match(/^(y_\w+)/)?.[1] : null
const PIE_TECNICO = `target ${TARGET_TECNICO ? `${TARGET_TECNICO} = ` : ''}Y_i(T) del Anexo 1 v2.1; `
  + 'pipeline/tablon.py'

export const meta = {
  id: 'V11',
  corto: 'Datos para el modelo',
  titulo: TITULO,
  pie: `${PIE} · ${PIE_TECNICO}`,
}

// Mismo esquema de color en la tarjeta de usos y en las barras del gráfico: una sola paleta,
// dos lugares. dev y test_flag llevan trama además de color (forma propia, no solo tinte)
// porque son las dos particiones que hay que distinguir de sus vecinas (dev del resto de
// entrenamiento; test_flag de test).
const ESTILO_PARTICION = {
  train: { swatch: { background: 'var(--despues)' }, relleno: 'var(--despues)' },
  dev: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--azul3), var(--azul3) 2px, var(--acc) 2px, var(--acc) 3px)' },
    relleno: 'url(#v11-trama-dev)',
  },
  gap: { swatch: { background: 'var(--antes)' }, relleno: 'var(--antes)' },
  test: {
    swatch: { backgroundImage: 'repeating-linear-gradient(-45deg, var(--ink), var(--ink) 2px, var(--sup) 2px, var(--sup) 3px)' },
    relleno: 'url(#v11-trama-test)',
  },
  test_flag: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--terra), var(--terra) 2px, var(--terra-osc) 2px, var(--terra-osc) 3px)' },
    relleno: 'url(#v11-trama-testflag)',
  },
}

function SwatchParticion({ particion }) {
  return (
    <span aria-hidden="true" style={{
      width: '0.85em', height: '0.85em', borderRadius: 2, flexShrink: 0,
      ...ESTILO_PARTICION[particion].swatch,
    }}
    />
  )
}

// Letra de lectura de las tarjetas de la derecha (24/09): 11,5 px a 1152, ~17 px a 1920. Crece
// más que --e2-txt porque a 1920 esas tarjetas tienen alto de sobra y se leen desde la mesa.
const LETRA = 'clamp(11.5px, 0.75vw + 2.5px, 18px)'

const EJE = 'var(--eje)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'

// Ancho real de un texto del SVG, medido con canvas y la familia del body (el mismo recurso
// que src/graficos.jsx usa adentro y no exporta). Sin canvas cae a una estimación holgada.
let ctxMedida = null
let familia = null
function anchoTexto(t, px, peso = 400) {
  try {
    if (!ctxMedida) {
      ctxMedida = document.createElement('canvas').getContext('2d')
      familia = getComputedStyle(document.body).fontFamily || 'sans-serif'
    }
    ctxMedida.font = `${peso} ${px}px ${familia}`
    return ctxMedida.measureText(String(t)).width
  } catch {
    return String(t).length * px * 0.58
  }
}

/** Parte un texto en renglones que no pasen de `ancho` px. */
function renglones(texto, px, ancho) {
  const salida = []
  let actual = ''
  for (const palabra of texto.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (actual && anchoTexto(prueba, px) > ancho) { salida.push(actual); actual = palabra } else actual = prueba
  }
  if (actual) salida.push(actual)
  return salida
}

/**
 * Barras verticales de filas por corte, coloreadas por partición. Gráfico propio (no
 * BarrasH, que es horizontal): la lectura es una serie de tiempo de 33 puntos mensuales.
 * Barras desde cero (regla 4), eje con marcas y título en las dos puntas (regla 21), <title>
 * nativo con etiqueta + valor + partición + tasa en cada barra (regla 14/marca).
 * (24/09) La letra y los márgenes que dependen de ella crecen con la pantalla (k de
 * useEscalaTexto); los títulos de eje van en sans y sin versalitas, y el de X ya no repite el
 * rango que dicen las marcas.
 */
function GraficoFilasPorCorte({ w, h, cortes, k }) {
  if (!cortes.length) return null
  const fEje = 10.5 * k
  const fRot = 11 * k
  const fNota = 10.5 * k
  const lhNota = 13.5 * k
  const lhRot = 13 * k
  const padL = Math.round(46 * k)
  // 24·k: deja aire entre el título del eje (y = 11·k) y la marca superior, y lugar para subir
  // un renglón un rótulo de partición que pisa al vecino
  const padT = Math.round(24 * k)
  const padB = Math.round(38 * k)
  const n = cortes.length
  // El último rótulo del eje X (mesCorto de la última barra) va centrado sobre ella: el margen
  // derecho le deja la mitad que sobresale, para que no se corte en el borde del svg.
  const anchoMes = Math.max(...cortes.map((c) => anchoTexto(mesCorto(c.corte), fEje)))
  const padR = Math.max(Math.round(8 * k), Math.ceil(anchoMes / 2 - (w - padL) / n / 2 + 3))
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const paso = iw / n
  const anchoBarra = Math.max(2, paso * 0.62)

  const crudo = Math.max(...cortes.map((c) => c.filas))
  const { max: tope, ticks } = escalaNice(crudo, 4)
  const Y = (v) => padT + ih - (v / tope) * ih
  const yBase = Y(0)
  const X = (i) => padL + i * paso + paso / 2
  const xFin = padL + iw

  // Rótulo directo de cada partición, centrado sobre su grupo y apenas arriba de la barra más
  // alta que queda debajo del texto (no del grupo entero: entrenamiento es largo y su rótulo
  // flotaba). (24/09) Sin leyenda, los cinco rótulos son los que nombran los colores: si uno
  // pisa al anterior sube un renglón; si ni así entra, quedan entrenamiento, prueba y prueba
  // aparte, y la tarjeta de usos (mismas muestras) nombra los cinco.
  const todos = ORDEN_PARTICION.map((p) => {
    const idx = cortes.map((c, i) => (c.particion === p ? i : -1)).filter((i) => i >= 0)
    if (!idx.length) return null
    const medio = anchoTexto(NOMBRE[p], fRot, 600) / 2
    // centrado sobre el grupo, sin salirse del svg por la derecha (prueba aparte cierra la serie)
    const x = Math.min((X(idx[0]) + X(idx[idx.length - 1])) / 2, w - 2 - medio)
    const debajo = cortes.filter((c, i) => Math.abs(X(i) - x) <= medio + anchoBarra / 2)
    const alto = Math.max(...(debajo.length ? debajo : idx.map((i) => cortes[i])).map((c) => c.filas))
    return { particion: p, x, y: Y(alto) - 5 * k, medio }
  }).filter(Boolean)
  const apilados = []
  for (const g of todos) {
    const prev = apilados[apilados.length - 1]
    const pisa = prev && prev.x + prev.medio + 4 * k > g.x - g.medio && Math.abs(prev.y - g.y) < lhRot
    apilados.push(pisa ? { ...g, y: Math.min(g.y, prev.y) - lhRot } : g)
  }
  const entranTodos = apilados.every((g, i) => g.y - fRot >= 0
    && (i === 0 || apilados[i - 1].x + apilados[i - 1].medio + 4 * k <= g.x - g.medio
      || Math.abs(apilados[i - 1].y - g.y) >= lhRot))
  const grupos = entranTodos
    ? apilados
    : todos.filter((g) => ['train', 'test', 'test_flag'].includes(g.particion))

  // Nota de lectura sobre el hueco de arriba a la izquierda (OMI-V11-1): la rampa se lee como
  // una cartera que crece 18 veces, y es la regla de 3 compras acumulándose desde el primer
  // mes del extracto. Se parte en tantos renglones como haga falta para no tocar ni las
  // barras ni los rótulos de partición que quedan a su derecha.
  const textoNota = 'Crece porque cada mes más clientes llegan a 3 compras'
    + `${TRX ? ` (los datos arrancan en ${mesCorto(TRX.desde)})` : ''}, no porque crezca la cartera`
  const xNota = padL + 8 * k
  const yNota0 = padT + 14 * k
  let lineasNota = []
  for (let nl = 2; nl <= 5; nl++) {
    const fondo = yNota0 + (nl - 1) * lhNota + 4 * k
    const iBarra = cortes.findIndex((c) => Y(c.filas) < fondo + 4 * k)
    let limite = iBarra >= 0 ? X(iBarra) - anchoBarra / 2 - 6 * k : xFin
    for (const g of grupos) {
      if (g.y > padT && g.y - fRot < fondo) limite = Math.min(limite, g.x - g.medio - 8 * k)
    }
    const ls = renglones(textoNota, fNota, limite - xNota)
    if (ls.length <= nl && limite - xNota > 60 * k) { lineasNota = ls; break }
  }

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Filas por fin de mes, ${n} meses, coloreadas por uso: `
           + cortes.map((c) => `${mesCorto(c.corte)} ${entero(c.filas)} filas, ${NOMBRE[c.particion] ?? c.particion}`).join('; ')}
         style={{ display: 'block' }}
    >
      <defs>
        {/* dev: azul claro con trama. Misma construcción que Tramas() de src/graficos.jsx
            (base clara + línea diagonal un paso más oscura) pero en la rampa de azules, que
            no tiene una trama propia ahí: acá vive nomás para esta vista. */}
        <pattern id="v11-trama-dev" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--azul3)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--acc)" strokeWidth="2" opacity=".55" />
        </pattern>
        {/* test_flag: terracota con trama, misma paleta que la excepción del resto del
            tablero (--terra / --terra-osc), para que la partición que DC-09 aisló se lea
            como lo que es: la excepción, no una categoría más. */}
        {/* test: tinta con trama clara en sentido contrario a dev, para que no se confunda
            con train cuando la tinta y el azul oscuro se acercan en el proyector. */}
        <pattern id="v11-trama-test" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(-45)">
          <rect width="6" height="6" fill="var(--ink)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--sup)" strokeWidth="2" opacity=".45" />
        </pattern>
        <pattern id="v11-trama-testflag" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--terra)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--terra-osc)" strokeWidth="2" />
        </pattern>
      </defs>

      <text x={padL} y={11 * k} fontSize={fEje} fill={MUT}>filas</text>

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize={fEje} fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{entero(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />

      {cortes.map((c, i) => {
        const alto = Math.max(1, Y(0) - Y(c.filas))
        const x = X(i) - anchoBarra / 2
        const estilo = ESTILO_PARTICION[c.particion] || ESTILO_PARTICION.test
        return (
          <g key={c.corte}>
            <title>
              {`${mesCorto(c.corte)} · ${entero(c.filas)} filas · ${NOMBRE[c.particion] ?? c.particion} `
                + `(partición ${c.particion}) · ${pct(c.tasa_pct)} entra en riesgo a ${H} días`
                + (c.particion === 'test_flag' && MESES_FLAG ? ` · ventana de ${H} días en ${MESES_FLAG}` : '')}
            </title>
            <rect x={x} y={Y(c.filas)} width={anchoBarra} height={alto} fill={estilo.relleno} />
          </g>
        )
      })}

      {grupos.map((g) => (
        <text key={`g${g.particion}`} x={g.x} y={g.y} fontSize={fRot} fill={MUT2}
              textAnchor="middle" fontWeight={600}>{NOMBRE[g.particion]}</text>
      ))}

      {lineasNota.length > 0 && (
        <text x={xNota} y={yNota0} fontSize={fNota} fill={MUT}>
          {lineasNota.map((l, i) => (
            <tspan key={i} x={xNota} dy={i === 0 ? 0 : lhNota}>{l}</tspan>
          ))}
        </text>
      )}

      {/* eje X: mesCorto cada 3 meses (regla del DISEÑO para esta vista), nada en diagonal.
          El último mes siempre va; la marca de cada 3 que le queda pegada se omite (a 1152
          «jul-25» y «sep-25» se leían «jul-25sep-25»). */}
      {cortes.map((c, i) => {
        if (i % 3 !== 0 && i !== n - 1) return null
        if (i !== n - 1 && X(n - 1) - X(i)
          < (anchoTexto(mesCorto(c.corte), fEje) + anchoTexto(mesCorto(cortes[n - 1].corte), fEje)) / 2 + 4 * k) return null
        return (
          <g key={`x${c.corte}`}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(i)} y={yBase + 16 * k} fontSize={fEje} fill={MUT} textAnchor="middle">
              {mesCorto(c.corte)}
            </text>
          </g>
        )
      })}
      <text x={xFin} y={yBase + 32 * k} fontSize={fEje} fill={MUT} textAnchor="end">
        fin de mes
      </text>
    </svg>
  )
}

/** ¿Algo de la columna desborda su caja? (la columna o alguna de sus tarjetas) */
function desborda(el) {
  return !!el && [el, ...el.children].some((c) => c.scrollHeight > c.clientHeight + 1)
}

export default function V11Dataset() {
  const k = useEscalaTexto()
  const imprimiendo = useContext(ImpresionCtx)
  // (24/09) La tarjeta del target va a la derecha, debajo de la de usos, cuando el alto
  // alcanza para las dos; si la columna desborda (a 1152×640 le faltan ~50 px) baja a la
  // izquierda, debajo del gráfico. Se decide midiendo, no con un umbral fijo: la letra crece
  // con la pantalla y la hoja impresa tiene otro alto. Se vuelve a probar con cada medida
  // nueva del lienzo, cuyo tamaño no depende de dónde quede la tarjeta.
  const [refLienzo, caja] = useMedida()
  const refDer = useRef(null)
  const [sinLugar, setSinLugar] = useState('')
  const clave = `${caja.w}x${caja.h}`
  // En la hoja impresa no se mide: la tarjeta va abajo a la izquierda desde el primer render.
  // Si se movía después de medir, el Lienzo quedaba con la caja vieja (SVG de 411 px en una
  // caja de 274) y la hoja salía sin eje X ni base, porque la medida nueva llegaba tarde
  // para la instantánea de impresión.
  const targetDerecha = !imprimiendo && sinLugar !== clave
  useLayoutEffect(() => {
    if (targetDerecha && desborda(refDer.current)) setSinLugar(clave)
  })

  if (!hayDatos) {
    return (
      <section className="pant v11">
        <h1 className="titulo">{TITULO}</h1>
        <p className="pie-vista">sin datos en el payload</p>
      </section>
    )
  }

  const tarjetaTarget = (
    <div className="tarjeta" style={{ flex: '0 0 auto' }}>
      <span className="kpi-lbl frase">Qué va a predecir el modelo</span>
      <p style={{ margin: '4px 0 0', fontSize: LETRA, lineHeight: 1.35, color: 'var(--ink)' }}>
        {NOTA_TARGET}
      </p>
      {NOTA_STOCK && <p className="e2-nota">{NOTA_STOCK}</p>}
    </div>
  )
  const GAP = 'clamp(10px, 1.5vh, 16px)'

  return (
    <section className="pant v11">
      <h1 className="titulo">{TITULO}</h1>

      {/* (24/09) KPI sin jerga (REL-V11-1, NAR-V11-1): cuántas filas y variables, cuántos
          clientes y la tasa, que dice «entran en riesgo» y no «churn». La tasa conserva los
          dos decimales de la fila E08. Los rótulos van en frase (sans): el tercero pasa de
          cuatro palabras y los tres se leen parejos. */}
      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '0 0 auto' }}>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl frase">Filas para el modelo</span>
          <span className="kpi-val tabular">{entero(V.filas)}</span>
          <span className="kpi-base">{V.n_features} variables por fila</span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl frase">Clientes distintos</span>
          <span className="kpi-val tabular">{entero(V.clientes_distintos)}</span>
          <span className="kpi-base">
            en {V.cortes.length} fines de mes, {mesCorto(PRIMERO)} a {mesCorto(ULTIMO)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl frase">{`Entran en riesgo a ${H} días`}</span>
          <span className="kpi-val tabular">{pct(TASA_GLOBAL, 2)}</span>
          <span className="kpi-base">
            {entero(V.positivos)} de {entero(V.filas)} filas sin riesgo al cierre del mes
          </span>
        </div>
      </div>

      <div className="lienzo" ref={refLienzo}>
        {/* (24/09) Columna izquierda: el gráfico de filas, con todo el alto que dejó la serie
            de tasa (y debajo la tarjeta del target cuando a la derecha no entra). Columna
            derecha: la tarjeta de usos y, si hay alto, la del target. */}
        <div style={{
          flex: '1.6 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: GAP,
        }}
        >
          <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
            <span className="kpi-lbl frase">
              Filas por fin de mes: clientes con 3 compras o más y sin riesgo
            </span>
            <Lienzo className="lienzo">
              {({ w, h }) => <GraficoFilasPorCorte w={w} h={h} cortes={V.cortes} k={k} />}
            </Lienzo>
          </div>
          {!targetDerecha && tarjetaTarget}
        </div>

        {/* contain: size — la columna mide lo que le da el lienzo y no lo que pide su
            contenido: si no, el contenido de más estiraba el cuerpo entero y empujaba el pie
            fuera de la pantalla en vez de desbordar la columna, que es lo que se mide. */}
        <div ref={refDer} style={{
          flex: '1 1 0', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: GAP,
          justifyContent: 'space-between', contain: 'size',
        }}
        >
          {/* Con las dos tarjetas a la derecha, cada una mide lo que su texto (la de usos
              arriba, a la par del gráfico; la del target abajo, a la par de su base) en vez
              de estirarse a un bloque blanco; sola, la de usos ocupa la columna. */}
          <div className="tarjeta" style={{ flex: targetDerecha ? '0 0 auto' : '1 1 auto', minHeight: 0 }}>
            <span className="kpi-lbl frase">Cómo se usan las filas</span>
            {/* Fila en DOS renglones: nombre en llano, uso y filas arriba; meses y tasa abajo.
                Con todo en una sola línea el rango de meses envolvía y desbordaba la tarjeta. */}
            {/* La letra (LETRA) y el aire entre filas crecen con la pantalla. */}
            <div style={{
              marginTop: 6, paddingTop: 6, borderTop: '1px dotted var(--bd)',
              display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 3vh - 15px, 20px)',
              fontSize: LETRA, lineHeight: 1.25,
            }}
            >
              {RANGOS.map((r) => (
                <div key={r.particion} style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <SwatchParticion particion={r.particion} />
                    <span style={{ minWidth: 0 }}>
                      <b style={{ fontWeight: 600, color: 'var(--ink)' }}>{NOMBRE[r.particion]}</b>
                      <span style={{ color: 'var(--mut2)' }}> · {USO[r.particion]}</span>
                    </span>
                    <span className="tabular" style={{ marginLeft: 'auto', color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {entero(r.filas)} filas
                    </span>
                  </div>
                  {r.desde && (
                    <div className="tabular" style={{ color: 'var(--mut)', paddingLeft: 'calc(0.85em + 7px)' }}>
                      {mesCorto(r.desde)} a {mesCorto(r.hasta)} · {pct(r.tasa)} entra en riesgo
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* (24/09) Por qué la prueba aparte va aparte, sin decir que sus meses no están
                confirmados (lo que no está confirmado es su ventana de 90 días). El detalle de
                DC-09 está en la vista de cobertura (NAR-V11-2). */}
            {MESES_FLAG && R.test_flag?.desde && (
              <p className="e2-nota" style={{ marginTop: 8 }}>
                <b style={{ fontWeight: 600, color: 'var(--ink)' }}>Prueba aparte:</b> sus {H} días
                hacia adelante tocan {MESES_FLAG}, meses con cobertura no confirmada ({DC09.id}, vista{' '}
                {VISTA_COB}).
                {FLAG_CONFIRMADOS.length > 0 && (
                  ` Los meses ${mesCorto(FLAG_CONFIRMADOS[0].corte)} a `
                  + `${mesCorto(FLAG_CONFIRMADOS[FLAG_CONFIRMADOS.length - 1].corte)} sí están confirmados.`
                )}
              </p>
            )}
            {/* Nombre y versión del dataset (fila V11 del DISEÑO), en un renglón chico al pie. */}
            <p style={{
              margin: 'auto 0 0', paddingTop: 10,
              font: '400 var(--e2-rot)/1.3 var(--mono)', color: 'var(--mut)',
            }}
            >
              dataset {V.nombre}
            </p>
          </div>
          {targetDerecha && tarjetaTarget}
        </div>
      </div>

      <p className="pie-vista">{PIE}{imprimiendo ? ` · ${PIE_TECNICO}` : ''}</p>
    </section>
  )
}
