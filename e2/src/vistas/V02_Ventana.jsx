// V02 — Ventana de extracción. Responde "¿por qué el corte común?": los 13 archivos que
// entrega la cátedra no cubren el mismo período, y medir el riesgo con el calendario
// extendido hasta 2026-08 (el archivo más largo del lote) infla la lectura porque compara
// clientes contra una ventana en la que las ventas todavía no existen. DC-08 fija un corte
// único, 31/12/2025, para todo cruce con comportamiento.
//
// (24/09) El riesgo según la fecha de medición va en un ParDoble, sin flecha ni gris/azul,
// como en V03: el 85,2 % es lo que daría medir al 31/08/2026, no una cifra anterior que la
// decisión corrigió, y el 49,6 % es la misma cifra que el directorio recibió en el E1
// (V10). El título ya no dice que el riesgo «baja»: dice que medir tarde lo inflaría. El
// rótulo del 49,6 % lleva «en revisión», porque DC-09 (vista 3) pone en duda sep-dic 2025.
//
// No hay una primitiva de Gantt en graficos.jsx (regla del contrato: "rectángulos con
// <title>"), así que el eje de tiempo y las barras se arman a mano en SVG dentro de un solo
// <Lienzo>. Los archivos del análisis van en --despues (la base que usa el resto del
// tablero); Calendario y Bajas quedan marcados como contexto: no acotan comportamiento, así
// que se dibujan con relleno hueco y borde punteado en --antes, no solo un color distinto.
//
// (24/09) El eje arranca en enero del año del corte, no en 2022: de 2022 a 2024 las barras
// corrían paralelas sin decir nada, y el tramo que explica el 85,2 % (los meses sin ventas
// entre la última venta y el 31/08/2026) quedaba en el 14 % del ancho. Ahora ese tramo lleva
// una franja terracota tenue y la plaqueta cuenta los meses. Todos los archivos empiezan
// antes del eje: lo dice la nota del eje, sin una flecha por fila. Las filas van ordenadas
// (análisis por fecha final, después contexto) y las dos sin fecha salen del dibujo a una
// nota. Clientes.csv llega a 2026-10-01 solo por las altas con fecha inválida de DC-07: la
// barra sólida termina en el corte y el excedente va en trama terracota, sin flecha de
// «sigue». Tiendas.csv trae fechas de apertura de locales (desde 2014), no una ventana: va
// hueca. Transacciones lleva trama clara en los meses que V03 marca con cobertura baja.
// La tarjeta de decisión pasa a una columna angosta: a un tercio del ancho quedaba vacía, y
// debajo del dibujo (como en V03) dejaba unos 15 px por fila a 1152×640; a la derecha, 22.

import { Lienzo, Plaqueta, Tramas } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta, mesCorto } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import TarjetaDecision from '../TarjetaDecision.jsx'
import ParDoble from '../ParDoble.jsx'

const V = D2.vistas.V02
const V03 = D2.vistas.V03
const DC07 = D2.decisiones.find((d) => d.id === 'DC-07')
const DC08 = D2.decisiones.find((d) => d.id === 'DC-08')
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')

const R_2026 = V.riesgo.al_2026_08_31
const R_CORTE = V.riesgo.al_corte_ref
const RIESGO_SI_2026 = R_2026.pct
const RIESGO_CORTE = R_CORTE.pct
const CORTE_REF = V.corte_ref
const ULTIMA_VENTA = D2.meta.ultima_venta

// El número de vista sale del payload: DC-09 dice en qué vista se explica ('V03' -> 3). El
// riel sigue el orden de los ids, así que el número del id es el del riel.
const VISTA_COB = Number(DC09.vista.slice(1))
// «La cifra del E1» solo si el payload lo confirma (V10 trae la cifra que se presentó).
const ES_CIFRA_E1 = D2.vistas.V10?.e1?.pct === RIESGO_CORTE

const TITULO = `Medir al ${fechaCorta(R_2026.corte)} inflaría el riesgo a ${pct(RIESGO_SI_2026)}; ` +
  `al corte común es ${pct(RIESGO_CORTE)}`

/** Día juliano simplificado (ms / 86.400.000): alcanza para posicionar fechas en un eje
 *  continuo sin arrastrar una librería de fechas para cuatro cálculos. */
function aDias(iso) {
  return new Date(`${iso}T00:00:00Z`).getTime() / 86400000
}
/** "2025-12-29" -> 2025 * 12 + 12: meses corridos, para contar y sumar meses sin Date. */
const mesAbs = (iso) => +iso.slice(0, 4) * 12 + +iso.slice(5, 7)
const deMesAbs = (n) => `${Math.floor((n - 1) / 12)}-${String(((n - 1) % 12) + 1).padStart(2, '0')}`
/** Último día del mes "2026-09" -> "2026-09-30". */
const finDeMes = (ym) => new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7), 0)).toISOString().slice(0, 10)
const nombreCorto = (nombre) => nombre.replace(/\.csv$/i, '')

// Meses sin ventas entre la última venta y la medición al 31/08/2026 (enero a agosto de 2026).
const MESES_SIN_VENTAS = mesAbs(R_2026.corte) - mesAbs(ULTIMA_VENTA)

// Filas del dibujo (24/09): primero los archivos del análisis, de la fecha final más tardía a
// la más temprana; después los de contexto juntos. Los que no traen fechas van a una nota.
const CON_FECHA = V.archivos.filter((a) => a.desde && a.hasta)
const SIN_FECHA = V.archivos.filter((a) => !(a.desde && a.hasta))
const porHasta = (a, b) => b.hasta.localeCompare(a.hasta)
const CONTEXTO = CON_FECHA.filter((a) => a.tipo === 'contexto').sort(porHasta)
const FILAS = [...CON_FECHA.filter((a) => a.tipo !== 'contexto').sort(porHasta), ...CONTEXTO]

// Eje (24/09): desde enero del año del corte hasta el fin del mes que sigue a la medición
// tardía (o al último archivo de contexto, si llega más lejos). Sale de 2025-01 a 2026-09.
const EJE_DESDE_ISO = `${CORTE_REF.slice(0, 4)}-01-01`
const EJE_HASTA_ISO = finDeMes(deMesAbs(
  Math.max(mesAbs(R_2026.corte), ...CONTEXTO.map((a) => mesAbs(a.hasta))) + 1))
const EJE_DESDE = aDias(EJE_DESDE_ISO)
const EJE_HASTA = aDias(EJE_HASTA_ISO)
const EJE_TOTAL = EJE_HASTA - EJE_DESDE
// Marcas semestrales: ene y jul de cada año del eje.
const TICKS = []
for (let m = mesAbs(EJE_DESDE_ISO); m <= mesAbs(EJE_HASTA_ISO); m += 6) TICKS.push(`${deMesAbs(m)}-01`)

// "2022-01-01" -> "ene-2022": mesCorto abrevia el año a dos cifras, y el eje lo pide entero.
const mesAnio = (iso) => `${mesCorto(iso.slice(0, 7)).split('-')[0]}-${iso.slice(0, 4)}`

// Nota del eje (24/09, en sans y sin mayúsculas): avisa que el eje está recortado y en qué
// año empieza cada archivo, en vez de una flecha a la izquierda en cada fila.
const TODAS_ANTES = FILAS.every((a) => aDias(a.desde) < EJE_DESDE)
const ANIOS = FILAS.map((a) => a.desde.slice(0, 4))
const ANIO_COMUN = ANIOS.slice().sort((a, b) =>
  ANIOS.filter((x) => x === b).length - ANIOS.filter((x) => x === a).length)[0]
const EXCEPCIONES = FILAS.filter((a) => a.desde.slice(0, 4) !== ANIO_COMUN)
const NOTA_EJE = `eje ${mesAnio(EJE_DESDE_ISO)} a ${mesAnio(EJE_HASTA_ISO)}` + (TODAS_ANTES
  ? ` · los archivos empiezan antes, en ${ANIO_COMUN}` +
    (EXCEPCIONES.length
      ? ` (${EXCEPCIONES.map((a) => `${nombreCorto(a.nombre)}, en ${a.desde.slice(0, 4)}`).join('; ')})`
      : '')
  : '')

// Tiendas.csv es el maestro de locales: sus fechas son aperturas, no una ventana de
// extracción (INT-V02-2). Se dibuja hueca y el rótulo lo dice.
const ES_MAESTRO = (a) => a.nombre === 'Tiendas.csv'

// Las altas con fecha inválida que estiran Clientes.csv, tal como las cuenta DC-07.
const ALTAS_INVALIDAS = DC07.hallazgo.split(';').map((s) => s.trim()).find((s) => /altas/.test(s))

// Cobertura baja de V03 sobre la barra de Transacciones: los meses marcados y su razón
// contra el mismo mes del año anterior, para el <title>.
const SERIE_FLAG = V03.serie.filter((p) => V03.meses_flag.includes(p.mes))
const mesSolo = (ym) => mesCorto(ym).split('-')[0]
const listaY = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}` : xs.join(''))
const TITULO_COB = SERIE_FLAG.length
  ? `${mesSolo(SERIE_FLAG[0].mes)}–${mesSolo(SERIE_FLAG[SERIE_FLAG.length - 1].mes)} ` +
    `${SERIE_FLAG[0].mes.slice(0, 4)}: ${listaY(SERIE_FLAG.map((p) => pct(p.ratio * 100, 0)))} ` +
    `de las operaciones de un año antes (vista ${VISTA_COB})`
  : ''

/** La línea de tiempo por archivo, dibujada a mano: una fila por archivo, una barra desde
 *  `desde` hasta `hasta`, sobre el eje fijo. `w`/`h` los mide <Lienzo>; `k` es el factor de
 *  letra del E2 (escala.js): el alto de las plaquetas y la columna de nombres crecen con él. */
function Gantt({ filas, corteRef, riesgo, w, h, k }) {
  const fPlaq = 11.5 * k
  const hPlaq = fPlaq + 7
  // Franja propia arriba de la primera fila para las dos plaquetas de riesgo.
  const padTop = Math.round(hPlaq * 2 + 8)
  const padLabel = Math.round(205 * k)
  const padRight = 8
  const fTick = 10.5 * k
  const fNota = 10.5 * k
  const altoEje = Math.round(fTick + fNota + 16 * k)
  const disponible = Math.max(60, h - padTop - altoEje)
  const paso = disponible / filas.length
  const alto = Math.max(7, Math.min(paso * 0.58, 18 * k))
  const anchoDisp = Math.max(60, w - padLabel - padRight)
  const fuenteEtq = Math.max(10.5, Math.min(12, paso * 0.5)) * k
  const yBase = padTop + disponible

  const xDe = (iso) => {
    const d = Math.min(EJE_HASTA, Math.max(EJE_DESDE, aDias(iso)))
    return padLabel + ((d - EJE_DESDE) / EJE_TOTAL) * anchoDisp
  }
  const xc = xDe(corteRef)
  const xl = xDe(riesgo.al_2026_08_31.corte)
  const xv = xDe(ULTIMA_VENTA)

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Ventana de extracción por archivo, eje ${mesAnio(EJE_DESDE_ISO)} a ` +
           `${mesAnio(EJE_HASTA_ISO)}: ` + filas.map((a) => `${a.nombre} ${a.desde} a ${a.hasta}`).join(', ')}
         style={{ display: 'block' }}>
      <Tramas />

      {/* Franja de los meses sin ventas: lo que infla el riesgo medido al 31/08/2026. Va
          debajo de las barras; la plaqueta de abajo cuenta los meses. */}
      <rect x={xv} y={padTop} width={Math.max(0, xl - xv)} height={disponible}
            fill="var(--terra)" opacity=".08">
        <title>{`sin ventas cargadas: de ${fechaCorta(ULTIMA_VENTA)} a ${fechaCorta(riesgo.al_2026_08_31.corte)}`}</title>
      </rect>

      {filas.map((a, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const yc = y + alto / 2
        const esContexto = a.tipo === 'contexto'
        const esMaestro = ES_MAESTRO(a)
        const hueca = esContexto || esMaestro
        const etiqueta = esMaestro ? `${nombreCorto(a.nombre)} · fechas de apertura` : nombreCorto(a.nombre)
        const x0 = xDe(a.desde)
        const x1 = xDe(a.hasta)
        const excedeIzq = aDias(a.desde) < EJE_DESDE
        const excedeDer = aDias(a.hasta) > EJE_HASTA
        // Un archivo del análisis que declara fechas después del corte: la barra sólida
        // termina en el corte y el resto va en trama terracota (fechas inválidas, DC-07).
        const excedente = !hueca && a.hasta > corteRef
        const xFinSolido = excedente ? xc : x1
        const esTxn = a.nombre === 'Transacciones_clientes.csv' && SERIE_FLAG.length > 0
        const xCob = esTxn ? xDe(`${SERIE_FLAG[0].mes}-01`) : 0
        return (
          <g key={a.nombre}>
            <title>
              {`${a.nombre} · ${fechaCorta(a.desde)} a ${fechaCorta(a.hasta)} · ` +
                `${entero(a.filas)} filas · ${esContexto ? 'contexto' : esMaestro ? 'maestro, fechas de apertura' : 'análisis'}` +
                `${excedeIzq ? ` · empieza antes del eje` : ''}`}
            </title>
            <text x={padLabel - 8 * k} y={yc} fontSize={fuenteEtq} textAnchor="end"
                  dominantBaseline="central" fill={hueca ? 'var(--mut2)' : 'var(--ink)'}
                  fontWeight={hueca ? 400 : 500}>{etiqueta}</text>
            <rect x={x0} y={y} width={Math.max(2, xFinSolido - x0)} height={alto}
                  rx={excedeIzq ? 0 : 2}
                  fill={hueca ? 'none' : 'var(--despues)'}
                  stroke={hueca ? (esMaestro ? 'var(--mut2)' : 'var(--antes)') : 'none'}
                  strokeWidth={hueca ? 1.5 : 0}
                  strokeDasharray={hueca ? '3 2' : undefined} />
            {esTxn && xFinSolido > xCob && (
              <rect x={xCob} y={y} width={xFinSolido - xCob} height={alto} fill="url(#trama)">
                <title>{TITULO_COB}</title>
              </rect>
            )}
            {excedente && (
              <rect x={xc} y={y} width={Math.max(2, x1 - xc)} height={alto} fill="url(#trama-exc)">
                <title>
                  {`${a.nombre} · fechas de alta hasta el ${fechaCorta(a.hasta)}, después del corte: ` +
                    `${ALTAS_INVALIDAS ?? 'altas con fecha posterior al corte'}, fechas inválidas marcadas por ${DC07.id}`}
                </title>
              </rect>
            )}
            {excedeIzq && !TODAS_ANTES && (
              <path d={`M ${x0} ${yc - 4} L ${x0 - 6} ${yc} L ${x0} ${yc + 4} Z`} fill="var(--mut2)" />
            )}
            {excedeDer && !excedente && (
              <path d={`M ${x1} ${yc - 4} L ${x1 + 6} ${yc} L ${x1} ${yc + 4} Z`} fill="var(--mut2)" />
            )}
          </g>
        )
      })}

      <line x1={padLabel} x2={padLabel + anchoDisp} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {/* Corte del eje: las barras siguen hacia la izquierda (la nota dice desde cuándo). */}
      {TODAS_ANTES && (
        <g stroke="var(--eje)" strokeWidth="1.2">
          <line x1={padLabel - 4 * k} x2={padLabel} y1={yBase + 4 * k} y2={yBase - 4 * k} />
          <line x1={padLabel} x2={padLabel + 4 * k} y1={yBase + 4 * k} y2={yBase - 4 * k} />
        </g>
      )}
      {TICKS.map((iso, i) => {
        const x = xDe(iso)
        return (
          <g key={iso}>
            <line x1={x} x2={x} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
            <text x={x} y={yBase + 5 + fTick} fontSize={fTick} fill="var(--mut)"
                  textAnchor={i === 0 ? 'start' : 'middle'}>{mesAnio(iso)}</text>
          </g>
        )
      })}
      <text x={padLabel + anchoDisp} y={yBase + 9 * k + fTick + fNota} fontSize={fNota}
            fill="var(--mut)" textAnchor="end">{NOTA_EJE}</text>

      {(() => {
        // La línea del corte común marca la decisión (DC-08), no el problema: va en
        // --despues (azul, la base con las DC aplicadas), igual que el resto del tablero.
        // (24/09) Sólida y de 2,5 px: es la decisión y tiene que pesar más que la del
        // 31/08/2026, que queda punteada en --antes. El terracota queda para lo que el
        // corte deja afuera (la franja sin ventas y el excedente de Clientes).
        // Las plaquetas se anclan al final de su línea; si no entran, al borde derecho.
        const xMax = w - 7
        const rotulo = `corte común ${fechaCorta(corteRef)} · riesgo ${pct(riesgo.al_corte_ref.pct)}`
        const rotuloLargo = `${fechaCorta(riesgo.al_2026_08_31.corte)} · ${entero(MESES_SIN_VENTAS)} meses ` +
          `sin ventas · riesgo ${pct(riesgo.al_2026_08_31.pct)}`
        return (
          <g>
            <g>
              <title>{rotuloLargo}</title>
              <line x1={xl} x2={xl} y1={padTop - 4} y2={yBase} stroke="var(--antes)" strokeWidth="1.5"
                    strokeDasharray="2 3" />
            </g>
            <g>
              <title>{rotulo}</title>
              <line x1={xc} x2={xc} y1={padTop - 4} y2={yBase} stroke="var(--despues)" strokeWidth="2.5" />
            </g>
            <Plaqueta x={Math.min(xc, xMax)} y={hPlaq / 2 + 1} texto={rotulo} fuente={fPlaq} peso={700}
                      color="var(--despues)" anclaje="end" />
            <Plaqueta x={Math.min(xl, xMax)} y={hPlaq * 1.5 + 4} texto={rotuloLargo} fuente={fPlaq} peso={700}
                      color="var(--mut2)" anclaje="end" />
          </g>
        )
      })()}
    </svg>
  )
}

// Muestras de la leyenda en CSS (un svg de menos de 90 px dentro de .lienzo lo marca fit.js
// como gráfico aplastado).
const MUESTRA = { width: 14, height: 9, borderRadius: 2, display: 'inline-block', flexShrink: 0, boxSizing: 'border-box' }
const LEYENDA = [
  { txt: 'archivos del análisis', estilo: { background: 'var(--despues)' } },
  { txt: 'contexto (calendario, bajas)', estilo: { border: '1.5px dashed var(--antes)' } },
  { txt: `fechas inválidas (${DC07.id})`, estilo: { backgroundImage: 'repeating-linear-gradient(45deg, var(--terra), var(--terra) 2px, var(--terra-osc) 2px, var(--terra-osc) 3.5px)' } },
  { txt: `cobertura no confirmada (vista ${VISTA_COB})`, estilo: { backgroundImage: 'repeating-linear-gradient(45deg, var(--tram-b), var(--tram-b) 2px, var(--tram-l) 2px, var(--tram-l) 3.5px)', border: '1px solid var(--despues)' } },
]

// Rótulos del par en sans (24/09): son frases, no rótulos de dos palabras (VIS-TRANSVERSAL-5).
const FRASE = { font: '500 var(--e2-txt2)/1.25 var(--fuente)', textTransform: 'none', letterSpacing: 0 }

export default function V02Ventana() {
  const k = useEscalaTexto()
  return (
    <section className="pant v02">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ maxWidth: 'min(100%, 44rem)' }}>
        <ParDoble
          lblRef={<span style={FRASE}>
            Riesgo al {fechaCorta(CORTE_REF)}, corte común
            {ES_CIFRA_E1 ? ' · la cifra del E1' : ''} · en revisión (vista {VISTA_COB})
          </span>}
          valRef={<span className="par-val tabular"
                        title={`${entero(R_CORTE.en_riesgo)} de ${entero(R_CORTE.elegibles)} clientes elegibles`}>
            {pct(RIESGO_CORTE)}</span>}
          lblSens={<span style={FRASE}>
            Si se midiera al {fechaCorta(R_2026.corte)} · sin ventas cargadas después
            del {fechaCorta(ULTIMA_VENTA)}
          </span>}
          valSens={<span className="par-val tabular"
                         title={`${entero(R_2026.en_riesgo)} de ${entero(R_2026.elegibles)} clientes elegibles`}>
            {pct(RIESGO_SI_2026)}</span>}
        />
      </div>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
          <span className="kpi-lbl">
            <span>Ventana declarada de cada archivo</span>
            <b className="tabular">{entero(FILAS.length)} de {entero(V.archivos.length)} con fecha</b>
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 'var(--e2-txt2)',
                        lineHeight: 1.25, color: 'var(--mut2)', marginTop: 4 }}>
            {LEYENDA.map((l) => (
              <span key={l.txt} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span aria-hidden="true" style={{ ...MUESTRA, ...l.estilo }} />
                {l.txt}
              </span>
            ))}
          </div>
          {SIN_FECHA.length > 0 && (
            <p className="e2-nota" style={{ marginTop: 2 }}>
              Sin fecha en el archivo, fuera del dibujo: {SIN_FECHA.map((a) => nombreCorto(a.nombre)).join(', ')}.
            </p>
          )}
          <Lienzo>
            {({ w, h }) => <Gantt filas={FILAS} corteRef={CORTE_REF} riesgo={V.riesgo} w={w} h={h} k={k} />}
          </Lienzo>
        </div>

        <TarjetaDecision dc={DC08} style={{ flex: '0 0 clamp(240px, 21vw, 380px)' }} />
      </div>

      <p className="pie-vista">{PIE_JSX}</p>
    </section>
  )
}

const PIE = `corte ${fechaCorta(CORTE_REF)} · base: ${entero(V.archivos.length)} archivos declarados ` +
  `por el equipo · fila ${DC08.cifras.join(', ')} del registro de cifras · riesgo y exposición en ` +
  `revisión por ${DC09.id} (cobertura de operaciones ${V03.meses_flag[0]?.slice(0, 4) ?? ''}, vista ${VISTA_COB}).`
const PIE_JSX = (
  <>
    corte {fechaCorta(CORTE_REF)} · base: {entero(V.archivos.length)} archivos declarados por el equipo ·
    fila <b>{DC08.cifras.join(', ')}</b> del registro de cifras · riesgo y exposición en revisión
    por {DC09.id} (cobertura de operaciones {V03.meses_flag[0]?.slice(0, 4)}, vista {VISTA_COB}).
  </>
)

export const meta = {
  id: 'V02',
  corto: 'Fecha de corte',
  titulo: TITULO,
  pie: PIE,
}
