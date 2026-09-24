// V03 — Cobertura 2025. Contrato: app/e2/DISENO.md fila V03, app/pipeline/CONTRACT_E2.md
// §3 vistas.V03. DC-09: cuatro meses de 2025 (sep-dic) traen menos del 60 % de las
// operaciones del mismo mes de 2024 y se marcan "cobertura no confirmada"; el riesgo al
// corte de referencia queda en revisión y se acompaña con la sensibilidad al 31/08/2025,
// antes de esos meses.
//
// (24/09) El gráfico ya no dibuja la razón interanual de 36 meses. Esa razón bajaba de
// corrido desde 2023 (el extracto arranca en ene-22, así que 2023 se compara contra casi
// nada) y se leía como tres años de caída, cuando 2024 fue plano y la caída es de mediados
// de 2025; el techo de 300 % y los aros fuera de escala trataban el síntoma (FOR-V03-1).
// Ahora son dos líneas de operaciones por mes, ene a dic: el año anterior (n_prev de las
// filas del último año, en gris) y el último año (n, en tinta), con la línea del 60 % del
// año anterior en terracota y los meses de meses_flag marcados y rotulados uno por uno
// (LEG-V03-1): con 12 meses hay lugar para los cuatro valores. No se usan --antes/--despues
// ni --acc: en este tablero dicen «antes y después de la decisión», y acá no hay decisión
// que mueva la serie. Arriba, el par de riesgo según la fecha de medición y, al lado, qué
// quiere decir ese par y quién puede confirmar la causa (REL-V03-1). El par de exposición
// se fue: repetía V10.

import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, fechaCorta, mesCorto, pct } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import ParDoble from '../ParDoble.jsx'
import TarjetaDecision from '../TarjetaDecision.jsx'

const V03 = D2.vistas.V03
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')

// El riel numera por posición y las vistas van en orden de archivo, V01..V12 (vistas/
// index.jsx): el número de la vista es el de su id, como en V01.
const numeroVista = (id) => Number(id.slice(1))

const MESES_FLAG = new Set(V03.meses_flag)
const N_FLAG = V03.meses_flag.length
const N_PALABRA = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce']
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// (24/09) El año del gráfico sale del último mes de la serie, no del JSX: cada fila del
// último año trae n (ese año) y n_prev (el mismo mes del año anterior).
const ANIO = Number(V03.serie[V03.serie.length - 1].mes.slice(0, 4))
const SERIE = V03.serie.filter((p) => Number(p.mes.slice(0, 4)) === ANIO)

const CREF = V03.sensibilidad.corte_ref
const CSENS = V03.sensibilidad.corte_sens

// El umbral sale del payload (D5-15): titulo, linea y rotulo lo leen de aca.
const UMBRAL = D2.meta.umbral_cobertura
const UMBRAL_PCT = Math.round(UMBRAL * 100)

// Auditoría T-03: el corte de referencia (CREF.pct) ya incorpora DC-04 (unión de
// duplicados, vista 4): por eso salta de los 49,6 % con que cierra V02 a 50,4 % acá. El
// rótulo del par lo dice, porque es lo primero que el lector compara contra V02. (24/09)
// Rótulos más cortos: dos renglones como mucho, también a 1152. La sensibilidad ya no se
// llama «último mes confirmado»: ningún criterio confirma un mes y agosto quedó a tres
// puntos del umbral (INT-TRANSVERSAL-1). Dice solo que es antes de los meses marcados.
const ETQ_CREF = `al ${fechaCorta(D2.meta.corte_ref)} · en revisión · duplicados unidos`
const ETQ_SENS = `al ${fechaCorta(D2.meta.corte_sens)} · antes de los meses sin confirmar`

// (24/09) Qué es el par y qué falta saber, al lado del par (REL-V03-1). Las cifras y los
// números de vista salen de D2; la pregunta a Casa Óga se nombra solo si V12 trae el pedido.
const PRIMER_FLAG = V03.meses_flag[0]
const ULTIMO_FLAG = V03.meses_flag[N_FLAG - 1]
const PEDIDO = (D2.vistas.V12?.pedidos ?? []).some((p) => p.id === DC09.id)
const NOTA_PAR = `No es un antes y un después: es la misma cifra medida en dos fechas. ` +
  `Si de ${mesCorto(PRIMER_FLAG)} a ${mesCorto(ULTIMO_FLAG)} faltan ventas, clientes que sí ` +
  `compraron parecen inactivos. La cifra del tablero sigue siendo ${pct(CREF.pct)} ` +
  `(vista ${numeroVista('V10')}). ¿Se vendió menos o faltan filas en el archivo? ` +
  (PEDIDO ? `Lo tiene que confirmar Casa Óga (pedido ${DC09.id}, vista ${numeroVista('V12')}).`
    : 'Lo tiene que confirmar Casa Óga.')

// El titulo dice el hallazgo: cuantos meses del ultimo año quedan bajo el umbral (D4-15).
const TITULO = `${capitalizar(N_PALABRA[N_FLAG] ?? String(N_FLAG))} meses de ${ANIO} con menos del ` +
  `${UMBRAL_PCT} % de las operaciones de un año antes`

const PIE = `corte de referencia ${fechaCorta(D2.meta.corte_ref)} · serie de filas únicas ` +
  `con monto positivo, antes de ${DC04.id} · sensibilidad después de ${DC04.id} ` +
  `(vista ${numeroVista(DC04.vista)}), corte ${fechaCorta(D2.meta.corte_sens)} · fila E01 ` +
  `(sensibilidad); D22 en revisión al corte de referencia (hereda C03 y C04) · ${DC09.hallazgo}`

export const meta = { id: 'V03', corto: 'Cobertura 2025', titulo: TITULO, pie: PIE }

export default function V03Cobertura() {
  const k = useEscalaTexto()
  return (
    <section className="pant v03">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(10px, 1.5vh, 16px)' }}>
        {/* (24/09) El par de riesgo a la izquierda y, a la derecha, la nota que lo explica.
            El rótulo es una frase: va en sans (.frase), no en mono mayúscula. */}
        <div style={{ display: 'flex', gap: 'clamp(16px, 2.4vw, 34px)', flex: '0 0 auto', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="kpi-lbl frase" style={{ marginBottom: 0 }}>
              Clientes en riesgo, según la fecha de medición
            </span>
            <ParDoble
              lblRef={ETQ_CREF}
              valRef={<span className="par-val tabular">{pct(CREF.pct)}</span>}
              lblSens={ETQ_SENS}
              valSens={<span className="par-val tabular">{pct(CSENS.pct)}</span>}
              style={{ flex: '0 0 auto' }}
            />
          </div>
          <p className="e2-nota" style={{ flex: '1.2 1 0', minWidth: 0, margin: 0 }}>{NOTA_PAR}</p>
        </div>

        <div className="tarjeta" style={{ flex: '1', minHeight: 0 }}>
          <span className="kpi-lbl frase">
            Operaciones por mes, {ANIO} contra {ANIO - 1}
          </span>
          <Lienzo>
            {({ w, h }) => <GraficoOperaciones w={w} h={h} serie={SERIE} k={k} />}
          </Lienzo>
        </div>

        {/* (24/09) En un lienzo en columna, align-self: flex-start (estilos_e2.css) encogía
            la tarjeta a su texto: acá va a todo el ancho. */}
        <TarjetaDecision dc={DC09} style={{ flex: '0 0 auto', alignSelf: 'stretch' }} />
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

const EJE = 'var(--eje)'
const MUT = 'var(--mut)'
const TERRA = 'var(--terra)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const SUP = 'var(--sup)'
const SANS = 'var(--fuente)'

const mesSolo = (ym) => mesCorto(ym).split('-')[0]
const mesPrev = (ym) => mesCorto(`${Number(ym.slice(0, 4)) - 1}${ym.slice(4)}`)
const fmtPct0 = (v) => `${Math.round(v)} %`
// La razón del mes contra el mismo mes del año anterior, en %: la del payload (ratio) y, si
// falta, la cuenta con n y n_prev. Rótulos, <title> y aria-label leen la misma.
const razonPct = (p) => (p.ratio != null ? p.ratio * 100 : p.n_prev ? p.n / p.n_prev * 100 : null)

/** (24/09) Operaciones por mes del último año (n) contra el mismo mes del año anterior
 *  (n_prev), de enero a diciembre. Eje Y desde cero; la línea del umbral es el 60 % de cada
 *  mes del año anterior, así que un punto del último año por debajo de ella es un mes de
 *  meses_flag. Los rótulos de serie van al arranque (enero), porque el borde derecho es la
 *  zona del hallazgo: franja, cuatro valores y la cifra de diciembre contra un año antes.
 *  Todo el texto se multiplica por k (escala.js). Los meses con n o n_prev null no aportan
 *  punto: entran al eje X pero no meten NaN en las líneas. */
function GraficoOperaciones({ w, h, serie, k }) {
  if (!serie.length) return null
  const f = (px) => px * k
  const padL = f(44)
  const padT = f(26)
  const padB = f(24)
  const padR = f(104)
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const n = serie.length
  const paso = iw / n

  const vals = serie.flatMap((p) => [p.n, p.n_prev]).filter((v) => v != null)
  const tope = escalaNice(Math.max(...vals), 8).max
  const ticks = escalaNice(tope, 3).ticks.filter((t) => t <= tope)

  const X = (i) => padL + paso * (i + 0.5)
  const Y = (v) => padT + ih - (v / tope) * ih
  const yBase = padT + ih
  const xDer = padL + iw

  const pts = serie.map((p, i) => ({ ...p, i }))
  const conN = pts.filter((p) => p.n != null)
  const conPrev = pts.filter((p) => p.n_prev != null)
  const flags = conN.filter((p) => MESES_FLAG.has(p.mes))
  const ultimo = flags.length ? flags[flags.length - 1] : null
  const finPrev = conPrev.length ? conPrev[conPrev.length - 1] : null
  const iniN = conN[0]
  const iniPrev = conPrev[0]

  const linea = (arr, acc) => arr.map((p) => `${X(p.i)},${Y(acc(p))}`).join(' ')
  const xFranja = flags.length ? X(flags[0].i) - paso / 2 : null

  // Halo del color del fondo detrás de cada rótulo que puede cruzar una línea.
  const halo = { paintOrder: 'stroke', stroke: SUP, strokeWidth: f(3), strokeLinejoin: 'round' }
  const anioPrev = ANIO - 1

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Operaciones por mes, ${ANIO} contra ${anioPrev}. Línea del ${UMBRAL_PCT} % de ${anioPrev}. ` +
           `${N_FLAG} meses de ${ANIO} por debajo: ${flags.map((p) => `${mesCorto(p.mes)} ${fmtPct0(razonPct(p))}`).join(', ')}.` +
           (ultimo ? ` En ${mesCorto(ultimo.mes)}, ${entero(ultimo.n)} operaciones contra ${entero(ultimo.n_prev)} en ${mesPrev(ultimo.mes)}.` : '')}
         style={{ display: 'block' }}>
      {/* Franja de meses_flag: terracota a .14 y borde izquierdo sólido, con su rótulo arriba. */}
      {xFranja != null && (
        <g>
          <rect x={xFranja} y={padT} width={xDer - xFranja} height={ih} fill={TERRA} opacity=".14" />
          <line x1={xFranja} x2={xFranja} y1={padT} y2={yBase} stroke={TERRA} strokeWidth="1.5" />
          <text x={xFranja} y={padT - f(8)} fontSize={f(12)} fontWeight={600} fill={TERRA}
                fontFamily={SANS} textAnchor="start">
            {mesCorto(PRIMER_FLAG)} a {mesCorto(ULTIMO_FLAG)}: cobertura no confirmada
          </text>
        </g>
      )}

      {/* eje Y: desde cero, marcas redondas; el título es una palabra en sans (regla 21) */}
      <text x={0} y={padT - f(8)} fontSize={f(10.5)} fill={MUT} fontFamily={SANS}>operaciones</text>
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - f(7)} y={Y(t)} fontSize={f(10.5)} fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{entero(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xDer} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />

      {/* Umbral: el 60 % de cada mes del año anterior (DC-09), punteado y a opacidad plena. */}
      <polyline points={linea(conPrev, (p) => UMBRAL * p.n_prev)} fill="none" stroke={TERRA}
                strokeWidth="1.5" strokeDasharray="4 3" />
      {finPrev && (
        <text x={X(finPrev.i) + f(9)} y={Y(UMBRAL * finPrev.n_prev)} fontSize={f(11)} fontWeight={600}
              fill={TERRA} fontFamily={SANS} dominantBaseline="central">
          {UMBRAL_PCT} % de {anioPrev}
        </text>
      )}

      {/* Año anterior en gris, último año en tinta. */}
      <polyline points={linea(conPrev, (p) => p.n_prev)} fill="none" stroke={GRIS} strokeWidth="1.5"
                strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={linea(conN, (p) => p.n)} fill="none" stroke={INK} strokeWidth="2.25"
                strokeLinejoin="round" strokeLinecap="round" />

      {/* Rótulos directos de serie, en enero: el año anterior arriba de su línea, el último
          año debajo de la suya. */}
      {iniPrev && (
        <text x={X(iniPrev.i) - f(4)} y={Y(iniPrev.n_prev) - f(7)} fontSize={f(12)} fontWeight={600}
              fill={GRIS} fontFamily={SANS} style={halo}>{anioPrev}</text>
      )}
      {iniN && (
        <text x={X(iniN.i) - f(4)} y={Y(iniN.n) + f(18)} fontSize={f(12)} fontWeight={700}
              fill={INK} fontFamily={SANS} style={halo}>{ANIO}</text>
      )}

      {/* Puntos del último año: cada uno con su lectura completa en el <title>. */}
      {conN.map((p) => {
        const flag = MESES_FLAG.has(p.mes)
        const razon = razonPct(p)
        return (
          <g key={p.mes}>
            <title>{`${mesCorto(p.mes)} · ${entero(p.n)} operaciones · ${mesPrev(p.mes)}: ${entero(p.n_prev)}` +
              (razon != null ? ` · ${fmtPct0(razon)} del mismo mes de ${anioPrev}` : '') +
              (flag ? ' · cobertura no confirmada' : '')}</title>
            <circle cx={X(p.i)} cy={Y(p.n)} r={flag ? f(5) : f(2.5)} fill={flag ? TERRA : INK}
                    stroke={flag ? SUP : 'none'} strokeWidth={flag ? 1.5 : 0} />
          </g>
        )
      })}

      {/* Los cuatro meses marcados, rotulados arriba del punto; diciembre suma su cifra
          contra el mismo mes del año anterior, a la derecha y apenas debajo del punto, para
          no tocar su porcentaje. */}
      {flags.map((p) => (
        <text key={p.mes} x={X(p.i)} y={Y(p.n) - f(10)} fontSize={f(12)} fontWeight={700} fill={TERRA}
              fontFamily={SANS} textAnchor="middle" className="tabular" style={halo}>
          {fmtPct0(razonPct(p))}
        </text>
      ))}
      {ultimo && (
        <text x={X(ultimo.i) + f(9)} y={Y(ultimo.n)} fontSize={f(11)} fontWeight={600} fill={TERRA}
              fontFamily={SANS} className="tabular" style={halo}>
          <tspan x={X(ultimo.i) + f(9)} dy={f(5)}>{entero(ultimo.n)} contra {entero(ultimo.n_prev)}</tspan>
          <tspan x={X(ultimo.i) + f(9)} dy={f(13)}>en {mesPrev(ultimo.mes)}</tspan>
        </text>
      )}

      {/* eje X: los doce meses; los marcados en terracota y negrita, así el eje los nombra. */}
      {pts.map((p) => {
        const flag = MESES_FLAG.has(p.mes)
        return (
          <g key={p.mes}>
            <line x1={X(p.i)} x2={X(p.i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(p.i)} y={yBase + f(16)} fontSize={f(10.5)} fill={flag ? TERRA : MUT}
                  fontWeight={flag ? 700 : 400} fontFamily={SANS} textAnchor="middle">
              {mesSolo(p.mes)}
            </text>
          </g>
        )
      })}
      <text x={xDer + f(9)} y={yBase + f(16)} fontSize={f(10.5)} fill={MUT} fontFamily={SANS}>mes</text>
    </svg>
  )
}
