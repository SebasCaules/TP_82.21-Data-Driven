// V05 · Devoluciones — DC-02. Las filas negativas de Transacciones YA SON las devoluciones, y
// traen las unidades en positivo: si se suman todas las filas, cada unidad devuelta se cuenta
// como vendida. DC-02 las conserva con signo, no suma sus unidades y fecha cada devolución el
// día del trámite (fecha_devolucion), no el de la venta original. Ver DISENO.md fila V05 y
// CONTRACT_E2.md §3 (vistas.V05).
//
// (24/09) El título dice cuántas unidades devueltas se contaban como vendidas. El de antes
// («ya restadas: sumarlas otra vez infla») chocaba con el «no se restan dos veces» de la
// justificación de DC-02 en el registro, así que la tarjeta lleva su propio «Por qué» y no la
// del payload (OMI-V05-2). Sale el gráfico de motivos: ninguna decisión los usa y le quitaba
// la mitad del ancho a la serie (FOR-V05-1). La serie ocupa toda la fila, con una lectura
// calculada arriba, y marca en terracota los meses que DC-09 deja sin cobertura confirmada,
// con la línea de después punteada ahí: sin la marca, la caída de fin de 2025 se leía como
// menos devoluciones y no como menos operaciones cargadas (OMI-V05-1, OMI-V03-2).
//
// `Linea` (graficos.jsx) solo dibuja una serie. Con dos series por mes que hay que comparar
// punto a punto (fila negativa vs. fecha_devolucion), forzarlas en dos llamados a `Linea` en
// paneles separados hubiese partido la comparación en dos ejes X distintos, que es lo que la
// pregunta de esta vista no permite. `LineaDoble`, acá abajo, es una primitiva local de una
// sola vista (no toca graficos.jsx): mismo trazo de eje, sin gridlines, con leyenda de texto
// arriba del gráfico y trazo punteado en la serie "antes" para que la distinción no dependa
// solo del color (regla 2 de DISENO.md).

import { D2 } from '../datos_e2.js'
import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import { entero, pct, mesCorto, fechaCorta } from '../formato.js'
import TarjetaDecision from '../TarjetaDecision.jsx'
import { useEscalaTexto } from '../escala.js'

const V05 = D2.vistas.V05
const DC02 = D2.decisiones.find((d) => d.id === 'DC-02')
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')

const unidadesAntes = V05.unidades.antes
const unidadesDespues = V05.unidades.despues
const unidadesDevueltas = unidadesAntes - unidadesDespues
const pctInfla = (unidadesAntes / unidadesDespues - 1) * 100
const repetidas = V05.devoluciones.crudas - V05.devoluciones.unicas

// Meses sin cobertura confirmada (DC-09) y el número de la vista que los presenta, los dos
// desde el payload: el mismo criterio que V02 para citar la vista de cobertura.
const FLAG = D2.vistas.V03.meses_flag
const VISTA_COB = Number(DC09.vista.slice(1))
const MESES_FLAG = `${mesCorto(FLAG[0])} a ${mesCorto(FLAG.at(-1))}`
// La consulta al negocio que fijó la fecha del evento, tal como la cita el registro.
const CONSULTA = DC02.justificacion?.match(/consulta \d+/)?.[0]

// (24/09) Lectura de la serie, calculada: cuánto mueve la fecha como mucho en un año y en un
// mes. Solo si las dos series suman lo mismo se puede decir que la fecha cambia el mes y no
// la cantidad; hoy no: la de fecha_devolucion cuenta las devoluciones registradas dos veces.
const dif = (a, b) => Math.abs(b - a)
const porAnio = Object.values(V05.serie.reduce((acc, p) => {
  const anio = p.mes.slice(0, 4)
  acc[anio] ??= { anio, a: 0, b: 0 }
  acc[anio].a += p.por_fila_negativa
  acc[anio].b += p.por_fecha_devolucion
  return acc
}, {}))
const anioMax = porAnio.reduce((m, x) => (dif(x.a, x.b) > dif(m.a, m.b) ? x : m))
const mesMax = V05.serie.reduce((m, p) => (
  dif(p.por_fila_negativa, p.por_fecha_devolucion) > dif(m.por_fila_negativa, m.por_fecha_devolucion) ? p : m))
const totalFila = V05.serie.reduce((s, p) => s + p.por_fila_negativa, 0)
const totalFecha = V05.serie.reduce((s, p) => s + p.por_fecha_devolucion, 0)
const LECTURA = `Contar por fecha de devolución mueve como mucho ${entero(dif(anioMax.a, anioMax.b))} ` +
  `devoluciones en un año (${anioMax.anio}: ${entero(anioMax.a)} → ${entero(anioMax.b)}) y hasta ` +
  `${entero(dif(mesMax.por_fila_negativa, mesMax.por_fecha_devolucion))} en un mes ` +
  `(${mesCorto(mesMax.mes)}: ${entero(mesMax.por_fila_negativa)} → ${entero(mesMax.por_fecha_devolucion)})` +
  (totalFila === totalFecha ? ': cambia en qué mes cae cada devolución, no cuántas hay.' : '.')

// (24/09) Título: lo que DC-02 evita, en unidades (OMI-V05-2). El 613/608 queda en la tarjeta.
const TITULO = `${entero(unidadesDevueltas)} unidades devueltas se contaban como vendidas: +${pct(pctInfla)}`

// (24/09) El pie nombra una sola vez los meses de DC-09 y, mientras la serie por
// fecha_devolucion sume las filas crudas, que incluye las registradas dos veces (INT-V05-1).
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(unidadesDespues)} unidades vendidas · ` +
  `${DC09.id}: ${MESES_FLAG} con cobertura no confirmada (vista ${VISTA_COB}), la caída final acompaña a la de las operaciones · ` +
  (totalFecha === V05.devoluciones.crudas && repetidas > 0
    ? `la línea por fecha de devolución incluye las ${entero(repetidas)} registradas dos veces · ` : '') +
  `${DC02.cifras.join(' · ')} · E05 (desfase) · fecha de devolución manda${CONSULTA ? ` (${CONSULTA})` : ''}`

export const meta = { id: 'V05', corto: 'Devoluciones', titulo: TITULO, pie: PIE }

export default function V05_Devoluciones() {
  return (
    <section className="pant v05">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
        {/* fila 1: el par grande (unidades antes/después) y la tarjeta de la decisión DC-02 */}
        <div style={{ display: 'flex', gap: 'clamp(16px, 2vw, 30px)', alignItems: 'stretch', flexShrink: 0 }}>
          <div className="tarjeta" style={{ flex: '0 0 auto', justifyContent: 'center' }}>
            <span className="kpi-lbl frase">Unidades vendidas, contadas una sola vez</span>
            <div className="ban-par">
              <div className="par-item par-antes">
                <span className="par-lbl">Antes (doble conteo)</span>
                <span className="par-val tabular">{entero(unidadesAntes)}</span>
              </div>
              <span className="par-flecha" aria-hidden="true">→</span>
              <div className="par-item par-despues">
                <span className="par-lbl">Después (DC-02)</span>
                <span className="par-val tabular">{entero(unidadesDespues)}</span>
              </div>
            </div>
          </div>

          {/* (24/09) «Por qué» propio y sin la cifra, que ya está en el título (OMI-V05-2). */}
          <TarjetaDecision dc={DC02} sinJustificacion style={{ flex: 1, minWidth: 0 }}>
            <p className="dec-just">
              <b>Por qué.</b> Las filas de devolución traen las unidades en positivo: sumarlas las
              cuenta como vendidas. La fecha del evento es la de devolución{CONSULTA ? ` (${CONSULTA})` : ''}.
            </p>
            <p className="e2-nota">
              <span className="tabular">{entero(V05.devoluciones.crudas)}</span> filas en el archivo de
              Devoluciones, <span className="tabular">{entero(V05.devoluciones.unicas)}</span> devoluciones
              distintas (<span className="tabular">{entero(repetidas)}</span> registradas dos veces)
            </p>
            <div className="kpi-base" style={{ marginTop: 'auto' }}>
              La fecha de devolución cae una mediana de{' '}
              <span className="tabular">{entero(V05.desfase_dias.mediana)}</span> días después de la fila negativa{' '}
              (entre <span className="tabular">{entero(V05.desfase_dias.min)}</span> y{' '}
              <span className="tabular">{entero(V05.desfase_dias.max)}</span> días)
            </div>
          </TarjetaDecision>
        </div>

        {/* fila 2: la serie mensual con las dos formas de contar, a todo el ancho (24/09) */}
        <div className="tarjeta" style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between',
            gap: '4px 18px', flexShrink: 0,
          }}>
            <span className="kpi-lbl frase">Devoluciones por mes: qué fecha cuenta</span>
            <Leyenda />
          </div>
          <p className="e2-nota" style={{ color: 'var(--ink)', flexShrink: 0 }}>{LECTURA}</p>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <LineaDoble serie={V05.serie} w={w} h={h} formato={entero} flag={FLAG}
                          rotuloFlag={`${MESES_FLAG}: cobertura no confirmada (vista ${VISTA_COB})`} />
            )}
          </Lienzo>
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/**
 * Leyenda de las dos series (24/09): muestras dibujadas en svg, no con un borde punteado de
 * CSS, que a 1152 px se achicaba y se veía sólido (OMI-V05-3). En sans y sin el conteo de
 * filas, que repetía el de la tarjeta (REL-TRANSVERSAL-4).
 */
function Leyenda() {
  const item = { display: 'inline-flex', alignItems: 'center', gap: '6px' }
  const muestra = (props) => (
    <svg width="18" height="4" style={{ flexShrink: 0 }} aria-hidden="true">
      <line x1="0" x2="18" y1="2" y2="2" strokeWidth="2" {...props} />
    </svg>
  )
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '4px 16px',
      font: '500 var(--e2-txt2)/1.25 var(--fuente)',
    }}>
      <span style={{ ...item, color: 'var(--mut2)' }}>
        {muestra({ stroke: 'var(--antes)', strokeDasharray: '5 3' })}
        fecha de la fila negativa (antes)
      </span>
      <span style={{ ...item, color: 'var(--acc)' }}>
        {muestra({ stroke: 'var(--despues)' })}
        fecha de devolución (después, DC-02)
      </span>
    </div>
  )
}

/**
 * Dos series de tiempo sobre el mismo eje, sin interpolar huecos (no los hay: las dos vienen
 * del universo de devoluciones, solo cambia qué fecha se usa para fechar cada una). Mismas
 * convenciones que `Linea`: eje de valores redondeado con `escalaNice`, sin gridlines, nada de
 * texto en diagonal en el eje X. La serie "antes" va punteada además de gris: la distinción no
 * depende solo del color (regla 2 de DISENO.md).
 *
 * (24/09) Los meses de `flag` (DC-09) llevan la franja terracota de V03 con su rótulo, y la
 * línea de después va punteada desde el último mes confirmado. La letra crece con la
 * pantalla (factor k de escala.js). Los títulos de eje quedan por la regla 21, en sans y sin
 * mayúsculas, y el de Y dice la unidad en vez de repetir el rótulo de la tarjeta (OMI-V05-3,
 * VIS-TRANSVERSAL-5).
 */
function LineaDoble({ serie, w, h, formato, flag = [], rotuloFlag }) {
  const k = useEscalaTexto()
  const fsTick = 10.5 * k
  const fsEje = 10.5 * k
  const fsFlag = 12 * k
  const padL = Math.round(34 * k)
  const padT = Math.round(24 * k)   // renglón del título Y (izquierda) y del rótulo de la franja (derecha)
  const padB = Math.round(38 * k)   // meses del eje X y, debajo, su título
  const padR = Math.round(22 * k)   // mitad del ancho del último rótulo de mes ("dic-25"), que se centra en xFin
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)

  const vals = serie.flatMap((p) => [p.por_fila_negativa, p.por_fecha_devolucion])
    .filter((v) => v != null)
  if (!vals.length) return null

  const { max, ticks } = escalaNice(Math.max(...vals), 4)
  const paso = iw / Math.max(1, serie.length - 1)
  const X = (i) => padL + i * paso
  const Y = (v) => padT + ih - (v / max) * ih
  const yBase = Y(0)
  const xFin = padL + iw

  const ptsA = serie.map((p, i) => [X(i), Y(p.por_fila_negativa)])
  const ptsB = serie.map((p, i) => [X(i), Y(p.por_fecha_devolucion)])
  const cada = Math.ceil((serie.length * 44 * k) / Math.max(1, iw))
  const linea = (pts) => pts.map((p) => p.join(',')).join(' ')

  // Franja de DC-09: del medio paso antes del primer mes marcado al medio paso después del
  // último, recortada al área de dibujo. La línea de después cambia a punteada desde el último
  // mes confirmado, así el tramo que entra en la franja ya se lee como no confirmado.
  const iF0 = serie.findIndex((p) => p.mes === flag[0])
  const iF1 = serie.findIndex((p) => p.mes === flag.at(-1))
  const hayFlag = iF0 >= 0 && iF1 >= iF0
  const xF0 = hayFlag ? Math.max(padL, X(iF0) - paso / 2) : 0
  const xF1 = hayFlag ? Math.min(xFin, X(iF1) + paso / 2) : 0
  const iCorte = hayFlag ? Math.max(0, iF0 - 1) : ptsB.length - 1

  return (
    <svg width={w} height={h} role="img"
         aria-label={'Devoluciones por mes, dos series: fila negativa y fecha de devolución' +
           (hayFlag ? `; ${rotuloFlag}` : '') + '. ' +
           serie.map((p) => `${mesCorto(p.mes)} fila negativa ${formato(p.por_fila_negativa)}, ` +
             `fecha de devolución ${formato(p.por_fecha_devolucion)}`).join(', ')}
         style={{ display: 'block' }}>
      {hayFlag && (
        <g>
          <rect x={xF0} y={padT} width={xF1 - xF0} height={ih} fill="var(--terra)" opacity=".14" />
          <line x1={xF0} x2={xF0} y1={padT} y2={yBase} stroke="var(--terra)" strokeWidth="1.5" />
          {rotuloFlag && (
            <text x={xFin} y={padT - 9 * k} fontSize={fsFlag} fontWeight={600} fill="var(--terra)"
                  textAnchor="end">{rotuloFlag}</text>
          )}
        </g>
      )}

      {/* título del eje Y: la unidad (regla 21), no el rótulo de la tarjeta otra vez */}
      <text x={2} y={padT - 10 * k} fontSize={fsEje} fill="var(--mut)">devoluciones</text>
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke="var(--eje)" strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize={fsTick} fill="var(--mut)" textAnchor="end"
                dominantBaseline="central" className="tabular">{formato(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />

      <polyline points={linea(ptsA)} fill="none" stroke="var(--antes)"
                strokeWidth="2" strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={linea(ptsB.slice(0, iCorte + 1))} fill="none" stroke="var(--despues)"
                strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      {hayFlag && (
        <polyline points={linea(ptsB.slice(iCorte))} fill="none" stroke="var(--despues)"
                  strokeWidth="2.25" strokeDasharray="2 3" strokeLinejoin="round" />
      )}

      {serie.map((p, i) => (
        <circle key={'a' + p.mes} cx={X(i)} cy={Y(p.por_fila_negativa)} r="2" fill="var(--antes)">
          <title>{`${mesCorto(p.mes)} · fecha de la fila negativa (antes) · ${formato(p.por_fila_negativa)} devoluciones`}</title>
        </circle>
      ))}
      {serie.map((p, i) => (
        <circle key={'b' + p.mes} cx={X(i)} cy={Y(p.por_fecha_devolucion)} r="2.25" fill="var(--despues)">
          <title>{`${mesCorto(p.mes)} · fecha de devolución (después, DC-02) · ${formato(p.por_fecha_devolucion)} devoluciones` +
            (hayFlag && i >= iF0 && i <= iF1 ? ' · cobertura no confirmada' : '')}</title>
        </circle>
      ))}

      {serie.map((p, i) => {
        // la marca regular a menos de `cada` meses del último se omite: si no, pisa a "dic-25"
        if ((i % cada !== 0 || serie.length - 1 - i < cada) && i !== serie.length - 1) return null
        return (
          <g key={'x' + p.mes}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
            <text x={X(i)} y={yBase + 16 * k} fontSize={fsTick} fill="var(--mut)" textAnchor="middle">
              {mesCorto(p.mes)}
            </text>
          </g>
        )
      })}
      {/* título del eje X (regla 21): solo «mes», el rango ya lo dicen las marcas */}
      <text x={xFin} y={yBase + 33 * k} fontSize={fsEje} fill="var(--mut)" textAnchor="end">mes</text>
    </svg>
  )
}
