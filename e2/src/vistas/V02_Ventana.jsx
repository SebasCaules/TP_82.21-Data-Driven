// V02 — Ventana de extracción. Responde "¿por qué el corte común?": los 13 archivos que
// entrega la cátedra no cubren el mismo período, y medir el riesgo con el calendario
// extendido hasta 2026-08 (el archivo más largo del lote) infla la lectura porque compara
// clientes contra una ventana en la que las ventas todavía no existen. DC-08 fija un corte
// único, 31/12/2025, para todo cruce con comportamiento.
//
// (24/09) El 85,2 % es lo que daría medir al 31/08/2026, no una cifra anterior que la decisión
// corrigió, y el 49,6 % es la misma cifra que el directorio recibió en el E1 (V10): por eso no
// hay flecha entre las dos. El título no dice que el riesgo «baja»: dice que medir tarde lo
// inflaría. El 49,6 % lleva «en revisión», porque DC-09 (vista 3) pone en duda sep–dic 2025.
//
// (25/09, pedido del usuario: la barra roja se salía del eje, había mucho texto y las cifras de
// arriba no resaltaban.) Las dos cifras pasan a las tarjetas de cifra del E2 (las del resumen de
// V01): el corte común con el filete --acc, la medición tardía en tarjeta punteada (es una
// hipótesis) y la decisión DC-08 al lado, solo en llano. El dibujo toma todo el ancho y pierde
// texto: nombres de archivo en llano (el nombre real va en el title), leyenda de tres, placas
// solo con la fecha, «8 meses sin ventas» dentro de la franja y sin la nota del eje ni la de los
// archivos sin fecha (van al title). Sale la trama de cobertura sobre Transacciones: es el tema
// de la vista 3. El eje llega hasta el mes siguiente a la fecha más tardía del lote, así que el
// excedente de Clientes (altas con fecha inválida hasta el 01/10/2026) termina dentro del eje.
//
// (26/09, pedido del usuario) La franja sin ventas llega hasta el final de la barra roja (la
// última fecha del lote, 01/10/2026) y lo dice en letra chica: «más de 9 meses sin ventas», del
// 29/12/2025 al 01/10/2026. La tarjeta de arriba sigue en 8 meses: mide al 31/08/2026.
//
// No hay una primitiva de Gantt en graficos.jsx (regla del contrato: "rectángulos con
// <title>"), así que el eje de tiempo y las barras se arman a mano en SVG dentro de un solo
// <Lienzo>. Los archivos del análisis van en --despues (la base que usa el resto del
// tablero); Calendario y Bajas quedan marcados como contexto: no acotan comportamiento, así
// que se dibujan con relleno hueco y borde punteado en --antes, no solo un color distinto.
// Tiendas.csv trae fechas de apertura de locales (desde 2014), no una ventana: va hueca y el
// rótulo lo dice. Clientes.csv llega a 2026-10-01 solo por las altas con fecha inválida de
// DC-07: la barra sólida termina en el corte y el excedente va en trama terracota.

import { Lienzo, Plaqueta, Tramas } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta, mesCorto } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import Banda from '../Banda.jsx'
import EtiquetaIr from '../EtiquetaIr.jsx'
import { TRAZO } from '../trazos.js'

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

// Meses sin ventas entre la última venta y la medición al 31/08/2026 (enero a agosto de 2026).
const MESES_SIN_VENTAS = mesAbs(R_2026.corte) - mesAbs(ULTIMA_VENTA)
/** (26/09) Lapso entre dos fechas en meses enteros, con «más de» si sobran días: del 29/12/2025
 *  al 01/10/2026, «más de 9 meses» (9 meses y 2 días). */
function lapso(desde, hasta) {
  const dia = (iso) => +iso.slice(8, 10)
  const m = mesAbs(hasta) - mesAbs(desde) - (dia(hasta) < dia(desde) ? 1 : 0)
  return `${dia(hasta) === dia(desde) ? '' : 'más de '}${entero(m)} ${m === 1 ? 'mes' : 'meses'}`
}

// (25/09) Nombre de cada archivo en llano; el nombre real va en el title de su fila.
const NOMBRE = {
  'Transacciones_clientes.csv': 'Transacciones',
  'Campanias_marketing.csv': 'Campañas',
  'Clientes.csv': 'Clientes',
  'Fidelizacion.csv': 'Fidelización',
  'Tiendas.csv': 'Tiendas (aperturas)',
  'Calendario.csv': 'Calendario',
  'Contenido_Campanias.csv': 'Contenido de campañas',
  'Devoluciones.csv': 'Devoluciones',
  'Historial_Bajas_No_Contacto.csv': 'Bajas',
  'Interacciones_soporte_mensual.csv': 'Soporte',
  'Casos_Cualitativos_Clientes.csv': 'Casos cualitativos',
  'Catalogo_Acciones_Retencion.csv': 'Catálogo de acciones',
  'Identidad_resuelta.csv': 'Identidad resuelta',
}
const nombre = (a) => NOMBRE[a.nombre] ?? a.nombre.replace(/\.csv$/i, '').replace(/_/g, ' ')

// Filas del dibujo (24/09): primero los archivos del análisis, de la fecha final más tardía a
// la más temprana; después los de contexto juntos. Los que no traen fechas van al title.
const CON_FECHA = V.archivos.filter((a) => a.desde && a.hasta)
const SIN_FECHA = V.archivos.filter((a) => !(a.desde && a.hasta))
const porHasta = (a, b) => b.hasta.localeCompare(a.hasta)
const CONTEXTO = CON_FECHA.filter((a) => a.tipo === 'contexto').sort(porHasta)
const FILAS = [...CON_FECHA.filter((a) => a.tipo !== 'contexto').sort(porHasta), ...CONTEXTO]

// Eje: desde enero del año del corte hasta el primer día del mes que sigue a la fecha más
// tardía del lote (25/09: antes paraba en la medición tardía y el excedente de Clientes, que
// llega al 01/10/2026, quedaba pegado al borde). Sale de 2025-01 a 2026-11.
const MAX_HASTA = [...FILAS.map((a) => a.hasta), R_2026.corte].sort().pop()
const EJE_DESDE_ISO = `${CORTE_REF.slice(0, 4)}-01-01`
const EJE_HASTA_ISO = `${deMesAbs(mesAbs(MAX_HASTA) + 1)}-01`
const EJE_DESDE = aDias(EJE_DESDE_ISO)
const EJE_HASTA = aDias(EJE_HASTA_ISO)
const EJE_TOTAL = EJE_HASTA - EJE_DESDE
// Marcas semestrales: ene y jul de cada año del eje.
const TICKS = []
for (let m = mesAbs(EJE_DESDE_ISO); m < mesAbs(EJE_HASTA_ISO); m += 6) TICKS.push(`${deMesAbs(m)}-01`)

// "2022-01-01" -> "ene-22".
// (26/09, revisión UX H11) El mismo formato de mes que los ejes de las otras vistas («ene-25»);
// hasta el 26/09 este eje escribía el año entero.
const mesAnio = (iso) => mesCorto(iso.slice(0, 7))

// Desde cuándo vienen los archivos, para el title y el aria-label (en pantalla lo dice el
// corte del eje, sin nota).
const ANIOS = FILAS.map((a) => a.desde.slice(0, 4))
const ANIO_COMUN = ANIOS.slice().sort((a, b) =>
  ANIOS.filter((x) => x === b).length - ANIOS.filter((x) => x === a).length)[0]
const EXCEPCIONES = FILAS.filter((a) => a.desde.slice(0, 4) !== ANIO_COMUN)
const NOTA_EJE = `eje ${mesAnio(EJE_DESDE_ISO)} a ${mesAnio(EJE_HASTA_ISO)}; los archivos empiezan antes, en ` +
  `${ANIO_COMUN}` + (EXCEPCIONES.length
  ? ` (${EXCEPCIONES.map((a) => `${nombre(a)}, en ${a.desde.slice(0, 4)}`).join('; ')})` : '')

// Tiendas.csv es el maestro de locales: sus fechas son aperturas, no una ventana de
// extracción (INT-V02-2). Se dibuja hueca y el rótulo lo dice.
const ES_MAESTRO = (a) => a.nombre === 'Tiendas.csv'

// Las altas con fecha inválida que estiran Clientes.csv, tal como las cuenta DC-07.
const ALTAS_INVALIDAS = DC07.hallazgo.split(';').map((s) => s.trim()).find((s) => /altas/.test(s))

/** La línea de tiempo por archivo, dibujada a mano: una fila por archivo, una barra desde
 *  `desde` hasta `hasta`, sobre el eje fijo. `w`/`h` los mide <Lienzo>; `k` es el factor de
 *  letra del E2 (escala.js): el alto de las plaquetas y la columna de nombres crecen con él. */
function Gantt({ filas, corteRef, w, h, k }) {
  const fPlaq = 11.5 * k
  const hPlaq = fPlaq + 7
  // Una sola fila de plaquetas: con la fecha sola, las dos entran lado a lado.
  const padTop = Math.round(hPlaq + 8)
  const fTick = 10.5 * k
  const altoEje = Math.round(fTick + 12 * k)
  const disponible = Math.max(60, h - padTop - altoEje)
  const paso = disponible / filas.length
  const alto = Math.max(7, Math.min(paso * 0.6, 20 * k))
  const fuenteEtq = Math.max(10.5, Math.min(12.5, paso * 0.5)) * k
  // La columna de nombres mide el nombre más largo (estimación de 0,56 em por carácter).
  const padLabel = Math.round(Math.max(...filas.map((a) => nombre(a).length)) * fuenteEtq * 0.56 + 14 * k)
  // (25/09, pedido del usuario) Hasta dónde llega la barra con fechas después del corte (hoy
  // Clientes, por las altas inválidas): una línea punteada vertical en su última fecha y esa
  // fecha escrita en el eje, en el terracota de la barra.
  const ultimo = filas.filter((a) => a.tipo !== 'contexto' && !ES_MAESTRO(a) && a.hasta > corteRef).sort(porHasta)[0]
  const padRight = 8
  const anchoDisp = Math.max(60, w - padLabel - padRight)
  const yBase = padTop + disponible

  const xDe = (iso) => {
    const d = Math.min(EJE_HASTA, Math.max(EJE_DESDE, aDias(iso)))
    return padLabel + ((d - EJE_DESDE) / EJE_TOTAL) * anchoDisp
  }
  const xc = xDe(corteRef)
  const xl = xDe(R_2026.corte)
  const xv = xDe(ULTIMA_VENTA)
  // (26/09) La franja llega hasta la última fecha del lote (el final de la barra roja), o hasta
  // la medición tardía si ningún archivo del análisis pasa el corte.
  const finIso = ultimo && ultimo.hasta > R_2026.corte ? ultimo.hasta : R_2026.corte
  const xFin = xDe(finIso)
  const txtLapso = `${lapso(ULTIMA_VENTA, finIso)} sin ventas`

  // El lapso va dentro de la franja, en el tramo de filas más largo que no la cruza (hoy de
  // Fidelización a Tiendas: solo Clientes, Calendario y Bajas pasan la última venta).
  const cruzan = filas.map((a, i) => (aDias(a.hasta) > aDias(ULTIMA_VENTA) + 3 ? i : -1)).filter((i) => i >= 0)
  const bordes = [-1, ...cruzan, filas.length]
  let hueco = [-1, filas.length]
  let mejor = -1
  for (let q = 1; q < bordes.length; q++) {
    if (bordes[q] - bordes[q - 1] > mejor) { mejor = bordes[q] - bordes[q - 1]; hueco = [bordes[q - 1], bordes[q]] }
  }
  const yMeses = padTop + ((hueco[0] + 1 + hueco[1]) / 2) * paso
  // Letra chica (26/09: antes «8 meses» en 22 px): un renglón si entra en la franja; si no, dos.
  const fMeses = 13 * k
  const [linea1, linea2] = txtLapso.length * fMeses * 0.56 <= xFin - xv - 16 * k
    ? [txtLapso, null] : [txtLapso.replace(/ sin ventas$/, ''), 'sin ventas']

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Ventana de extracción por archivo, ${NOTA_EJE}: ` +
           filas.map((a) => `${a.nombre} ${a.desde} a ${a.hasta}`).join(', ')}
         style={{ display: 'block' }}>
      <Tramas />

      {/* Franja de los meses sin ventas, desde la última venta hasta la última fecha del lote
          (lo que infla el riesgo medido al 31/08/2026 y más). Va debajo de las barras, con el
          lapso adentro en letra chica. */}
      <rect x={xv} y={padTop} width={Math.max(0, xFin - xv)} height={disponible}
            fill="var(--terra)" opacity=".08">
        <title>{`sin ventas cargadas: de ${fechaCorta(ULTIMA_VENTA)} a ${fechaCorta(finIso)} (${txtLapso})`}</title>
      </rect>
      <g textAnchor="middle" fill="var(--terra)" fontSize={fMeses} fontWeight={600}>
        <text x={(xv + xFin) / 2} y={linea2 ? yMeses - fMeses * 0.2 : yMeses} dominantBaseline="central">{linea1}</text>
        {linea2 && <text x={(xv + xFin) / 2} y={yMeses + fMeses * 1.05} dominantBaseline="central">{linea2}</text>}
      </g>

      {filas.map((a, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const yc = y + alto / 2
        const esContexto = a.tipo === 'contexto'
        const esMaestro = ES_MAESTRO(a)
        const hueca = esContexto || esMaestro
        const x0 = xDe(a.desde)
        const x1 = xDe(a.hasta)
        const excedeIzq = aDias(a.desde) < EJE_DESDE
        // Un archivo del análisis que declara fechas después del corte: la barra sólida
        // termina en el corte y el resto va en trama terracota (fechas inválidas, DC-07).
        const excedente = !hueca && a.hasta > corteRef
        const xFinSolido = excedente ? xc : x1
        return (
          <g key={a.nombre}>
            <title>
              {`${a.nombre} · ${fechaCorta(a.desde)} a ${fechaCorta(a.hasta)} · ` +
                `${entero(a.filas)} filas · ${esContexto ? 'contexto' : esMaestro ? 'maestro, fechas de apertura' : 'análisis'}` +
                `${excedeIzq ? ' · empieza antes del eje' : ''}`}
            </title>
            <text x={padLabel - 8 * k} y={yc} fontSize={fuenteEtq} textAnchor="end"
                  dominantBaseline="central" fill={hueca ? 'var(--mut2)' : 'var(--ink)'}
                  fontWeight={hueca ? 400 : 500}>{nombre(a)}</text>
            <rect x={x0} y={y} width={Math.max(2, xFinSolido - x0)} height={alto}
                  rx={excedeIzq ? 0 : 2}
                  fill={hueca ? 'none' : 'var(--despues)'}
                  stroke={hueca ? (esMaestro ? 'var(--mut2)' : 'var(--antes)') : 'none'}
                  strokeWidth={hueca ? 1.5 : 0}
                  strokeDasharray={hueca ? '3 2' : undefined} />
            {excedente && (
              <rect x={xc} y={y} width={Math.max(2, x1 - xc)} height={alto} fill="url(#trama-exc)">
                <title>
                  {`${a.nombre} · fechas de alta hasta el ${fechaCorta(a.hasta)}, después del corte: ` +
                    `${ALTAS_INVALIDAS ?? 'altas con fecha posterior al corte'}, fechas inválidas marcadas por ${DC07.id}`}
                </title>
              </rect>
            )}
          </g>
        )
      })}

      <line x1={padLabel} x2={padLabel + anchoDisp} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {/* Corte del eje: las barras siguen hacia la izquierda (el title dice desde cuándo). */}
      <g stroke="var(--eje)" strokeWidth={TRAZO.eje}>
        <title>{NOTA_EJE}</title>
        <line x1={padLabel - 4 * k} x2={padLabel} y1={yBase + 4 * k} y2={yBase - 4 * k} />
        <line x1={padLabel} x2={padLabel + 4 * k} y1={yBase + 4 * k} y2={yBase - 4 * k} />
      </g>
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

      {ultimo && (() => {
        const xf = xDe(ultimo.hasta)
        return (
          <g>
            <title>{`${ultimo.nombre}: fechas hasta el ${fechaCorta(ultimo.hasta)} (altas con fecha inválida, ${DC07.id})`}</title>
            <line x1={xf} x2={xf} y1={padTop - 4} y2={yBase + 4} stroke="var(--terra)" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={xf} y={yBase + 5 + fTick} fontSize={fTick} fontWeight={700} fill="var(--terra-osc)"
                  textAnchor="middle" className="tabular">{fechaCorta(ultimo.hasta)}</text>
          </g>
        )
      })()}

      {/* La línea del corte común marca la decisión (DC-08): sólida, 2,5 px y en --despues. La
          del 31/08/2026, punteada en --antes. Las plaquetas dicen solo la fecha: las cifras están
          en las tarjetas de arriba. Se anclan al final de su línea; si no entran, al borde. */}
      <g>
        <title>{`corte común ${fechaCorta(corteRef)} · riesgo ${pct(RIESGO_CORTE)}`}</title>
        <line x1={xc} x2={xc} y1={padTop - 4} y2={yBase} stroke="var(--despues)" strokeWidth="2.5" />
      </g>
      <g>
        <title>{`${fechaCorta(R_2026.corte)} · ${entero(MESES_SIN_VENTAS)} meses sin ventas · riesgo ${pct(RIESGO_SI_2026)}`}</title>
        <line x1={xl} x2={xl} y1={padTop - 4} y2={yBase} stroke="var(--antes)" strokeWidth="1.5" strokeDasharray="2 3" />
      </g>
      <Plaqueta x={Math.min(xc, w - 7)} y={hPlaq / 2 + 1} texto={`corte común ${fechaCorta(corteRef)}`}
                fuente={fPlaq} peso={700} color="var(--despues)" anclaje="end" />
      <Plaqueta x={Math.min(xl, w - 7)} y={hPlaq / 2 + 1} texto={fechaCorta(R_2026.corte)}
                fuente={fPlaq} peso={700} color="var(--mut2)" anclaje="end" />
    </svg>
  )
}

// Muestras de la leyenda en CSS (un svg de menos de 90 px dentro de .lienzo lo marca fit.js
// como gráfico aplastado).
const MUESTRA = { width: 14, height: 9, borderRadius: 2, display: 'inline-block', flexShrink: 0, boxSizing: 'border-box' }
const LEYENDA = [
  { txt: 'análisis', estilo: { background: 'var(--despues)' } },
  { txt: 'contexto', estilo: { border: '1.5px dashed var(--antes)' } },
  { txt: 'fechas inválidas', estilo: { backgroundImage: 'repeating-linear-gradient(45deg, var(--terra), var(--terra) 2px, var(--terra-osc) 2px, var(--terra-osc) 3.5px)' } },
]

// El aro punteado de la sensibilidad, el mismo de ParDoble, V01 y V10.
function Aro() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block', width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)',
        boxSizing: 'border-box', marginRight: 6, verticalAlign: '-1px', flexShrink: 0,
      }}
    />
  )
}

export default function V02Ventana({ irAVista }) {
  const k = useEscalaTexto()
  return (
    <section className="pant v02">
      <Banda dcs={[DC08]}>
        <div className="tarjeta e2-central"
             title={`${entero(R_CORTE.en_riesgo)} de ${entero(R_CORTE.elegibles)} clientes elegibles; ` +
               `en revisión por ${DC09.id} (vista ${VISTA_COB})`}>
          <span className="kpi-lbl"><span>Corte común</span><EtiquetaIr texto="en revisión" irAVista={irAVista} /></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <span className="par-lbl">Riesgo al {fechaCorta(CORTE_REF)}</span>
              <span className="par-val tabular e2-cifra">{pct(RIESGO_CORTE)}</span>
            </div>
          </div>
          {ES_CIFRA_E1 && <p className="e2-linea">La cifra del E1.</p>}
        </div>

        <div className="tarjeta e2-si"
             title={`${entero(R_2026.en_riesgo)} de ${entero(R_2026.elegibles)} clientes elegibles; ` +
               `sin ventas cargadas después del ${fechaCorta(ULTIMA_VENTA)}`}>
          <span className="kpi-lbl"><span><Aro />Si se midiera más tarde</span></span>
          <div className="ban-par">
            <div className="par-item">
              <span className="par-lbl">Riesgo al {fechaCorta(R_2026.corte)}</span>
              <span className="par-val tabular e2-cifra sec">{pct(RIESGO_SI_2026)}</span>
            </div>
          </div>
          <p className="e2-linea">{entero(MESES_SIN_VENTAS)} meses sin ventas cargadas.</p>
        </div>

      </Banda>

      <div className="tarjeta v02-mapa">
        <span className="kpi-lbl">
          <span>Ventana de cada archivo</span>
          <b className="tabular" title={SIN_FECHA.length
            ? `Sin fecha en el archivo: ${SIN_FECHA.map((a) => a.nombre).join(', ')}` : undefined}>
            {entero(FILAS.length)} de {entero(V.archivos.length)} con fecha
          </b>
        </span>
        <div className="v02-leyenda">
          {LEYENDA.map((l) => (
            <span key={l.txt}>
              <span aria-hidden="true" style={{ ...MUESTRA, ...l.estilo }} />
              {l.txt}
            </span>
          ))}
        </div>
        <Lienzo>
          {({ w, h }) => <Gantt filas={FILAS} corteRef={CORTE_REF} w={w} h={h} k={k} />}
        </Lienzo>
      </div>

    </section>
  )
}

// (25/09) El pie en un renglón; la base y la salvedad completas van en su title.
const PIE = `corte ${fechaCorta(CORTE_REF)} · ${entero(V.archivos.length)} archivos · registro ${DC08.cifras.join(', ')}`
const PIE_TITLE = `base: ${entero(V.archivos.length)} archivos declarados por el equipo · fila ` +
  `${DC08.cifras.join(', ')} del registro de cifras · riesgo y exposición en revisión por ${DC09.id} ` +
  `(cobertura de operaciones ${V03.meses_flag[0]?.slice(0, 4) ?? ''}, vista ${VISTA_COB})`

export const meta = {
  id: 'V02',
  dc: 'DC-08',
  corto: 'Fecha de corte',
  titulo: TITULO,
  pie: PIE,
}
