// V09 — NPS y soporte (e2/DISENO.md). DC-11: 4.312 filas de Interacciones_soporte traen NPS
// con cero reclamos y cero consultas ese mes. No se sabe si es un cliente satisfecho que no
// llamó o un NPS mal cargado (consulta 4, sin confirmar): se conserva con bandera y se marca
// en vez de borrarse o imputarse.
//
// (24/09) La vista responde «¿cuánto vale el NPS?» con las dos cifras y ninguna por encima
// de la otra (NAR-V09-1). Antes el par y la línea pintaban «todas las filas» en gris
// (--antes) y «solo con reclamo o consulta» en azul (--despues): con el código del tablero
// eso se leía «el NPS nuevo es 9,9», justo la cifra que DC-11 decide no adoptar. Ahora el
// par es un ParDoble sin marca de sensibilidad (las dos en tinta, DISENO.md regla 3) y la
// línea no usa --antes ni --despues: con reclamo o consulta en tinta, todas las filas en
// --mut2 punteada. Arriba, la BarraMini rotula el 28,8 % y trama la parte marcada, no el
// resto (OMI-TRANSVERSAL-3: la trama es lo que queda sin confirmar).
//
// La brecha entre las dos líneas no crece porque las filas marcadas «inflen» el número: se
// despeja del payload que su NPS se mueve poco (≈ 42 → 36) mientras el de las filas con
// reclamo o consulta cae de 41,3 a 9,9, y las marcadas pesan cada año menos (43 → 24 %)
// (OMI-V09-2). La tercera serie que lo muestra necesita un campo que el pipeline no trae.
//
// (24/09) Salen las columnas de reclamos por cliente-mes y de riesgo vs. soporte (D20 del
// E1): ninguna respondía la pregunta de la vista (REL-V09-1). La tarjeta del NPS toma ese
// ancho. 2025 se lee completo, con sep–dic adentro (meses sin cobertura confirmada, DC-09):
// el rótulo del par y el pie lo dicen (OMI-V09-1, LEG-TRANSVERSAL-2).
//
// No hay primitiva de línea doble en graficos.jsx (Linea dibuja una sola serie con su
// propia escala), así que la línea se arma a mano con escalaNice para que las dos series
// compartan el mismo eje.

import { Lienzo, BarraMini, escalaNice } from '../../../src/graficos.jsx'
import TarjetaDecision from '../TarjetaDecision.jsx'
import ParDoble from '../ParDoble.jsx'
import { useEscalaTexto } from '../escala.js'
import { D2 } from '../datos_e2.js'
import { entero, pct, decimal, fechaCorta, mesCorto } from '../formato.js'

const V09 = D2.vistas.V09
const DC11 = D2.decisiones.find((d) => d.id === 'DC-11')
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')

// El riel numera por posición y las vistas van en orden de archivo, V01..V12 (vistas/
// index.jsx): el número de la vista es el de su id, como en V01 y V03.
const numeroVista = (id) => Number(id.slice(1))

// La serie y sus puntas: el año del título y el de comparación salen del payload.
const SERIE = V09.nps_anual
const PRIMERO = SERIE[0]
const ULTIMO = SERIE[SERIE.length - 1]
const ANIOS = `${PRIMERO.anio}–${ULTIMO.anio}`

// Puntos que suman las filas marcadas al NPS de cada año (todas las filas menos solo con
// reclamo o consulta), redondeado a un decimal como las dos cifras de las que sale.
const brecha = (f) => Math.round((f.con_todo - f.solo_con_interaccion) * 10) / 10

// (24/09) El último año se lee completo: los meses que DC-09 marca «cobertura no
// confirmada» (vistas.V03.meses_flag) quedan adentro, y el rótulo del par lo dice. Cortar
// la serie en agosto necesita el pipeline (OMI-V09-1).
const mesNombre = (ym) => mesCorto(ym).split('-')[0]
const FLAG = D2.vistas.V03.meses_flag.filter((m) => m.startsWith(`${ULTIMO.anio}-`))
const TRAMO_FLAG = FLAG.length ? `${mesNombre(FLAG[0])}–${mesNombre(FLAG[FLAG.length - 1])}` : null

// El pedido a Casa Óga se nombra solo si V12 lo trae (como en V03); si no, queda la
// consulta del registro.
const PEDIDO = D2.vistas.V12.pedidos.some((p) => p.id === DC11.id)

// NAR-V09-1: el título da las dos cifras del último año, sin elegir una (69 caracteres).
const TITULO = `NPS ${ULTIMO.anio}: ${decimal(ULTIMO.con_todo, 1)} con las filas sin reclamos ni consultas, ` +
  `${decimal(ULTIMO.solo_con_interaccion, 1)} sin ellas`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(V09.filas)} filas cliente-mes de soporte, ` +
  `${ANIOS} · registro D19, E04 (sin las filas marcadas)` +
  (TRAMO_FLAG ? ` · ${ULTIMO.anio} completo: ${TRAMO_FLAG} con cobertura no confirmada ` +
    `(${DC09.id}, vista ${numeroVista(DC09.vista)})` : '') +
  ` · el origen de las ${entero(V09.sin_interaccion.n)} filas marcadas no está confirmado ` +
  (PEDIDO ? `(pedido abierto a Casa Óga, vista ${numeroVista('V12')})` : '(consulta 4)')

export const meta = {
  id: 'V09',
  corto: 'NPS y soporte',
  titulo: TITULO,
  pie: PIE,
}

export default function V09_NPS() {
  const k = useEscalaTexto()
  return (
    <section className="pant v09">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo v09-cuerpo">
        <div className="tarjeta" style={{ gap: 'clamp(8px, 1.4vh, 16px)' }}>
          {/* (24/09) Arriba, en un renglón: qué filas se marcan y el NPS con y sin ellas. */}
          <div style={{ display: 'flex', gap: 'clamp(16px, 2.4vw, 34px)', alignItems: 'flex-start', flex: '0 0 auto' }}>
            <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span className="kpi-lbl frase">Filas con NPS y sin reclamos ni consultas</span>
              {/* El hallazgo dibujado: la parte marcada, con su porcentaje sobre la barra
                  (VIS-V09-1) y la trama en la parte, no en el resto (OMI-TRANSVERSAL-3). */}
              <div style={{ height: 32, display: 'flex', flexDirection: 'column', marginTop: 6 }}>
                <Lienzo>
                  {({ w, h }) => (
                    <BarraMini parte={V09.sin_interaccion.n} total={V09.filas} w={w} h={h}
                               excepcion tramaEn="parte" alturaBarra={20}
                               rotulo={pct(V09.sin_interaccion.pct)} />
                  )}
                </Lienzo>
              </div>
              <p className="e2-nota">
                {entero(V09.sin_interaccion.n)} de {entero(V09.filas)} filas cliente-mes, {ANIOS}: se
                conservan marcadas
              </p>
            </div>

            <div style={{ flex: '1.25 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="kpi-lbl frase" style={{ marginBottom: 0 }}>
                <span>
                  NPS medio {ULTIMO.anio}, en puntos
                  {TRAMO_FLAG && (
                    <span style={{ fontWeight: 400, color: 'var(--mut2)' }}>
                      {' '}· año completo: incluye {TRAMO_FLAG}, meses con cobertura no confirmada
                      ({DC09.id}, vista {numeroVista(DC09.vista)})
                    </span>
                  )}
                </span>
              </span>
              <ParDoble
                sensibilidad={false}
                lblRef="Con las filas marcadas"
                valRef={<span className="par-val tabular">{decimal(ULTIMO.con_todo, 1)}</span>}
                lblSens="Sin las filas marcadas"
                valSens={<span className="par-val tabular">{decimal(ULTIMO.solo_con_interaccion, 1)}</span>}
                style={{ flex: '0 0 auto' }}
              />
              <p className="e2-nota">
                Las {entero(ULTIMO.n_sin_interaccion)} filas marcadas de {ULTIMO.anio} suben el NPS{' '}
                {decimal(brecha(ULTIMO), 1)} puntos; en {PRIMERO.anio}, {decimal(brecha(PRIMERO), 1)}.
                Mientras su origen no esté confirmado se informan las dos cifras.
              </p>
            </div>
          </div>

          <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <LeyendaLinea k={k} />
            <Lienzo>
              {({ w, h }) => <GraficoNPS serie={SERIE} w={w} h={h} k={k} />}
            </Lienzo>
          </div>
        </div>

        {/* (24/09) La columna queda solo con la decisión y mide lo que su texto. */}
        <div className="fijo" style={{ display: 'flex', flexDirection: 'column', width: 'clamp(208px, 21vw, 254px)' }}>
          <TarjetaDecision dc={DC11} />
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

// Las dos series con su nombre, su color y su trazo, en el orden del par de arriba. Ninguna
// usa --antes ni --despues: no son un antes y un después de DC-11 sino dos lecturas del
// mismo año (NAR-V09-1). Se dibujan en este orden: la de tinta queda encima donde se
// cruzan (2022).
const SERIES = [
  { campo: 'con_todo', nombre: 'Con las filas marcadas (todas las filas)', color: 'var(--mut2)', trazo: 'punteado' },
  { campo: 'solo_con_interaccion', nombre: 'Sin las filas marcadas (solo con reclamo o consulta)', color: 'var(--ink)', trazo: 'solido' },
]

/** Leyenda de la línea doble, suelta arriba del gráfico. (24/09) En sans, sin mayúsculas
 *  (VIS-TRANSVERSAL-5), y crece con k como las letras del SVG. La muestra repite trazo y
 *  marcador de cada serie (cuadrado hueco y punteado, círculo lleno y sólido), así el
 *  color nunca es la única marca (regla 2 del diseño transversal). */
function LeyendaLinea({ k }) {
  const item = ({ color, nombre, trazo }) => (
    <span key={nombre} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: `500 ${11 * k}px/1.2 var(--fuente)`, color: trazo === 'solido' ? 'var(--ink)' : 'var(--mut2)' }}>
      <svg width="22" height="10" aria-hidden="true" data-icono="true" style={{ flexShrink: 0 }}>
        <line x1="0" y1="5" x2="22" y2="5" stroke={color} strokeWidth="2"
              strokeDasharray={trazo === 'punteado' ? '4 3' : undefined} />
        {trazo === 'punteado'
          ? <rect x="8" y="2" width="6" height="6" fill="var(--sup)" stroke={color} strokeWidth="1.5" />
          : <circle cx="11" cy="5" r="3.5" fill={color} stroke="var(--sup)" strokeWidth="1.5" />}
      </svg>
      {nombre}
    </span>
  )
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 18, rowGap: 4, margin: '0 0 6px' }}>
      {SERIES.map(item)}
    </div>
  )
}

/**
 * Línea doble armada a mano: dos polilíneas sobre la misma escala (escalaNice, base cero),
 * una por serie de `nps_anual`. Cada punto lleva <title> con año, serie, valor y base (la
 * cantidad de filas cliente-mes detrás de ese punto). Solo el último punto de cada serie
 * lleva rótulo directo sobre el trazo (regla 14): con cuatro años muy juntos, rotular los
 * cuatro puntos de las dos series los superponía, sobre todo en 2022 donde las dos casi
 * coinciden (41,8 vs. 41,3 puntos); el par de arriba ya da las dos cifras del último año.
 * (24/09) Las letras y los márgenes que dependen de ellas se multiplican por k (escala.js).
 */
function GraficoNPS({ serie, w, h, k = 1 }) {
  if (!serie.length) return null
  const padL = Math.round(30 * k)
  const padT = Math.round(24 * k)
  const padB = Math.round(36 * k)
  const padR = Math.round(20 * k)
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)

  const crudo = Math.max(...serie.map((f) => Math.max(f.con_todo, f.solo_con_interaccion)))
  const { max, ticks } = escalaNice(crudo, 4)
  const yBase = padT + ih
  const X = (i) => padL + (serie.length === 1 ? 0 : (i / (serie.length - 1)) * iw)
  const Y = (v) => padT + ih - (v / max) * ih

  const puntos = (campo) => serie.map((f, i) => [X(i), Y(f[campo])])
  const aPolyline = (pts) => pts.map((p) => p.join(',')).join(' ')

  const base = (f, campo) => (campo === 'con_todo' ? f.n_filas : f.n_filas - f.n_sin_interaccion)

  const ultimo = serie.length - 1

  return (
    <svg width={w} height={h} role="img"
         aria-label={'NPS anual, en puntos: ' + serie.map((f) => `${f.anio} con las filas marcadas ${decimal(f.con_todo, 1)}, sin ellas ${decimal(f.solo_con_interaccion, 1)}`).join('; ')}
         style={{ display: 'block' }}>
      <text fontFamily="var(--fuente)" x={2} y={9 * k} fontSize={10.5 * k} fill="var(--mut)">NPS (puntos)</text>

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke="var(--eje)" strokeWidth="1" />
          <text x={padL - 7} y={Y(t)} fontSize={10.5 * k} fill="var(--mut)" textAnchor="end"
                dominantBaseline="central" className="tabular">{decimal(t, 0)}</text>
        </g>
      ))}
      <line x1={padL} x2={padL + iw} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />

      {SERIES.map(({ campo, nombre, color, trazo }) => {
        const pts = puntos(campo)
        const arriba = campo === 'con_todo'
        return (
          <g key={campo}>
            <polyline points={aPolyline(pts)} fill="none" stroke={color} strokeWidth="2.25"
                      strokeLinejoin="round" strokeLinecap="round"
                      strokeDasharray={trazo === 'punteado' ? '5 3' : undefined} />
            {pts.map(([x, y], i) => (
              <g key={i}>
                <title>{lectura(String(serie[i].anio), nombre.toLowerCase(), decimal(serie[i][campo], 1) + ' pts', `base ${entero(base(serie[i], campo))} filas`)}</title>
                {trazo === 'punteado'
                  ? <rect x={x - 3} y={y - 3} width={6} height={6} fill="var(--sup)" stroke={color} strokeWidth="1.5" />
                  : <circle cx={x} cy={y} r={3.5} fill={color} stroke="var(--sup)" strokeWidth="1.5" />}
              </g>
            ))}
            <text x={pts[ultimo][0]} y={pts[ultimo][1] + (arriba ? -9 * k : 15 * k)}
                  fontSize={11 * k} fontWeight={700} fill={color}
                  textAnchor="end" className="tabular">
              {decimal(serie[ultimo][campo], 1)}
            </text>
          </g>
        )
      })}

      {serie.map((f, i) => (
        <text key={f.anio} x={X(i)} y={yBase + 15 * k} fontSize={10 * k} fill="var(--mut)" textAnchor="middle">
          {f.anio}
        </text>
      ))}
      <text fontFamily="var(--fuente)" x={padL + iw} y={yBase + 31 * k} fontSize={10.5 * k}
            fill="var(--mut)" textAnchor="end">año</text>
    </svg>
  )
}

function lectura(...partes) {
  return partes.filter((x) => x != null && x !== '').join(' · ')
}
