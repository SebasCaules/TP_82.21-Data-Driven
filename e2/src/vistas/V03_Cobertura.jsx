// V03 — Cobertura 2025. Contrato: app/e2/DISENO.md fila V03, app/pipeline/CONTRACT_E2.md
// §3 vistas.V03. DC-09: cuatro meses de 2025 (sep-dic) traen menos del 60 % de las
// operaciones del mismo mes de 2024 y se marcan "cobertura no confirmada"; el riesgo al
// corte de referencia queda en revisión y se acompaña con la sensibilidad al último mes de
// cobertura confirmada (31/08/2025).
//
// Grafico propio en vez de <Linea>: la serie completa (2023-01 a 2025-12) trae cinco meses
// de arranque de 2023 con la razon interanual disparada (hasta 21,1x, porque el mismo mes de
// 2022 casi no tenia ventas). Con la escala automatica de <Linea> esos cinco puntos fijan el
// techo del eje y el umbral de 60 %, que es la pregunta de esta vista, queda aplastado contra
// el piso. El grafico de aca fija un techo de 300 % (una decision de lectura, no un recorte
// de dato: cada punto por encima lleva su valor real en el <title> y en la franja de arranque)
// y deja el 70 % restante del alto para el tramo 2024-2025, que es donde vive el umbral.

import { Lienzo } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, fechaCorta, mesCorto, montoM, pct } from '../formato.js'

const V03 = D2.vistas.V03
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const TXN = D2.meta.archivos.find((a) => a.nombre === 'Transacciones_clientes.csv')

const MESES_FLAG = new Set(V03.meses_flag)
const N_FLAG = V03.meses_flag.length
const N_PALABRA = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce']
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const CREF = V03.sensibilidad.corte_ref
const CSENS = V03.sensibilidad.corte_sens

// El titulo dice el hallazgo con la cifra: cuantos meses bajan del umbral y el rango de
// riesgo segun que corte se use. Todo sale de D2 (meses_flag.length, sensibilidad.*.pct).
const TITULO = `${capitalizar(N_PALABRA[N_FLAG] ?? N_FLAG)} meses de 2025 bajan del 60 %: ` +
  `riesgo ${pct(CREF.pct)} o ${pct(CSENS.pct)} según el corte`

const PIE = `corte de referencia ${fechaCorta(D2.meta.corte_ref)} · serie de filas únicas ` +
  `con monto positivo, antes de DC-04 · sensibilidad después de DC-04, corte ` +
  `${fechaCorta(D2.meta.corte_sens)} · fila E01 (sensibilidad); C03 y C04 en revisión al ` +
  `corte de referencia · ${DC09.hallazgo}`

export const meta = { id: 'V03', corto: 'Cobertura 2025', titulo: TITULO, pie: PIE }

export default function V03Cobertura() {
  return (
    <section className="pant v03">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(10px, 1.5vh, 16px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(16px, 2.4vw, 34px)', flex: '0 0 auto' }}>
          <ParDoble
            grupo="Riesgo en el corte"
            etqAntes={`corte ${fechaCorta(D2.meta.corte_ref)} (en revisión)`}
            valAntes={pct(CREF.pct)}
            etqDespues={`sensibilidad ${fechaCorta(D2.meta.corte_sens)}`}
            valDespues={pct(CSENS.pct)}
          />
          <ParDoble
            grupo="Exposición anual"
            etqAntes={`corte ${fechaCorta(D2.meta.corte_ref)} (en revisión)`}
            valAntes={montoM(CREF.exposicion_M)}
            etqDespues={`sensibilidad ${fechaCorta(D2.meta.corte_sens)}`}
            valDespues={montoM(CSENS.exposicion_M)}
          />
        </div>

        <div className="tarjeta" style={{ flex: '1', minHeight: 0 }}>
          <span className="kpi-lbl">
            <span>Ventas del mes vs. mismo mes del año anterior</span>
            <b className="tabular">{entero(V03.serie.length)} meses</b>
          </span>
          <Lienzo>
            {({ w, h }) => <GraficoCobertura w={w} h={h} serie={V03.serie} />}
          </Lienzo>
        </div>

        <div className="tarjeta" style={{ flex: '0 0 auto', padding: '10px 15px' }}>
          <span className="kpi-lbl"><span>Decisión</span><b>DC-09</b></span>
          <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.45, color: 'var(--ink)' }}>
            {DC09.decision}
          </p>
          {DC09.justificacion && (
            <p style={{ margin: '6px 0 0', fontSize: 11, lineHeight: 1.4, color: 'var(--mut)' }}>
              <b style={{ color: 'var(--mut2)' }}>Justificación.</b> {DC09.justificacion}
            </p>
          )}
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/** Un par de números grandes, antes (gris) contra después (azul). Dos instancias, una por
 *  métrica (riesgo, exposición): es el ".ban-par doble" que pide el contrato de la vista. */
function ParDoble({ grupo, etqAntes, valAntes, etqDespues, valDespues }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="kpi-lbl" style={{ marginBottom: 0 }}>{grupo}</span>
      <div className="ban-par">
        <div className="par-item par-antes">
          <span className="par-lbl">{etqAntes}</span>
          <span className="par-val tabular">{valAntes}</span>
        </div>
        <span className="par-flecha" aria-hidden="true">→</span>
        <div className="par-item par-despues">
          <span className="par-lbl">{etqDespues}</span>
          <span className="par-val tabular">{valDespues}</span>
        </div>
      </div>
    </div>
  )
}

const UMBRAL = 0.6
const TOPE = 3   // 300 %: techo de lectura, no de dato. Ver comentario de cabecera.
const EJE = 'var(--eje)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'
const TERRA = 'var(--terra)'
const GRIS = 'var(--gris)'

const fmtPct0 = (v) => `${Math.round(v)} %`
const fmtRatio = (v) => `${v.toFixed(1).replace('.', ',')}×`

/** Serie de la razón n/n_prev por mes, con techo de lectura en 300 % y banda del umbral de
 *  60 %. Los meses de 2023 que superan el techo (el extracto de transacciones arranca en
 *  {TXN.desde}: el mismo mes de 2022 tiene muy pocas filas) se agrupan en una franja rotulada
 *  una sola vez, con marca propia por mes y su valor real en el <title>; etiquetarlos uno por
 *  uno los solapaba, porque los cinco caen en las primeras semanas del eje. Los meses de
 *  meses_flag (fuera de meta, cola de 2025) llevan la misma franja/marca en terracota.
 *  Los meses con `ratio` null (mes sin `n_prev` en el payload) se ignoran para la línea y las
 *  marcas: entran al eje X pero no aportan punto, así no meten NaN en el polyline. */
function GraficoCobertura({ w, h, serie }) {
  if (!serie.length) return null
  const padL = 40
  const padT = 34
  const padB = 40
  const padR = 100
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const n = serie.length

  const X = (i) => padL + (i / Math.max(1, n - 1)) * iw
  const Y = (pctv) => padT + ih - (Math.min(pctv, TOPE * 100) / (TOPE * 100)) * ih
  const yBase = Y(0)
  const xFin = padL + iw
  const ticks = [0, 100, 200, 300]

  const puntosBase = serie.map((p, i) => ({ ...p, i }))
  const puntos = puntosBase.filter((p) => p.ratio != null).map((p) => ({ ...p, pctv: p.ratio * 100 }))
  const offscale = puntos.filter((p) => p.pctv > TOPE * 100)
  const flags = puntos.filter((p) => MESES_FLAG.has(p.mes))

  const linea = puntos.map((p) => `${X(p.i)},${Y(p.pctv)}`).join(' ')

  const iPrimerOff = offscale.length ? offscale[0].i : null
  const iUltimoOff = offscale.length ? offscale[offscale.length - 1].i : null
  const iPrimerFlag = flags.length ? flags[0].i : null
  const iUltimoFlag = flags.length ? flags[flags.length - 1].i : null

  // Etiquetas de eje X: enero de cada año y el último mes, nada en diagonal. Sobre todos los
  // meses (puntosBase), no solo los que tienen ratio: el eje no depende del dato graficado.
  const marcasX = puntosBase.filter((p, i) => p.mes.endsWith('-01') || i === n - 1)

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Razón de ventas contra el mismo mes del año anterior, ${serie.length} meses. Umbral 60 %. ${N_FLAG} meses de 2025 por debajo.`}
         style={{ display: 'block' }}>
      <text fontFamily="var(--mono)" x={padL} y={14} fontSize="11" fill={MUT2}
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>
        % del mismo mes, año anterior
      </text>

      {/* Franja de arranque 2023: agrupa los meses fuera de techo bajo un solo rótulo. */}
      {iPrimerOff != null && (
        <g>
          <rect x={X(iPrimerOff) - 6} y={padT} width={X(iUltimoOff) - X(iPrimerOff) + 12}
                height={ih} fill={GRIS} opacity=".08" />
          <text x={X(iPrimerOff) - 6} y={padT - 6} fontSize="10" fill={MUT}
                textAnchor="start">
            {offscale.length} meses arriba de {fmtPct0(TOPE * 100)}, el extracto arranca en {mesCorto(TXN.desde)}
          </text>
        </g>
      )}

      {/* Banda del umbral: 60 % marca el piso de "cobertura confirmada" (DC-09). */}
      <line x1={padL} x2={xFin} y1={Y(UMBRAL * 100)} y2={Y(UMBRAL * 100)}
            stroke={TERRA} strokeWidth="1.25" strokeDasharray="4 3" opacity=".75" />
      <text x={xFin + 7} y={Y(UMBRAL * 100)} fontSize="11" fontWeight={600} fill={TERRA}
            dominantBaseline="central">umbral 60 %</text>

      {/* Franja de cola 2025: los meses_flag, mismo tratamiento que la franja de arranque
          pero en terracota, porque acá el color SÍ es la excepción del dato. */}
      {iPrimerFlag != null && (
        <g>
          <rect x={X(iPrimerFlag) - 6} y={padT} width={X(iUltimoFlag) - X(iPrimerFlag) + 12}
                height={ih} fill={TERRA} opacity=".07" />
        </g>
      )}

      {/* eje Y */}
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10.5" fill={MUT} textAnchor="end"
                dominantBaseline="central" className="tabular">{fmtPct0(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />

      {/* línea de la serie, con los puntos por encima del techo aplanados en el borde
          superior: su franja de arriba y su <title> dicen que ahí el dato sigue subiendo. */}
      <polyline points={linea} fill="none" stroke="var(--acc)" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" opacity=".9" />

      {offscale.map((p) => (
        <g key={p.mes}>
          <title>{`${mesCorto(p.mes)} · ${fmtRatio(p.ratio)} del mismo mes de 2022 · ${entero(p.n)} operaciones sobre ${entero(p.n_prev)}`}</title>
          <circle cx={X(p.i)} cy={Y(TOPE * 100)} r="3" fill="var(--sup)" stroke={GRIS} strokeWidth="1.5" />
        </g>
      ))}

      {flags.map((p) => (
        <g key={p.mes}>
          <title>{`${mesCorto(p.mes)} · ${fmtPct0(p.pctv)} del mismo mes del año anterior · cobertura no confirmada · ${entero(p.n)} operaciones sobre ${entero(p.n_prev)}`}</title>
          <circle cx={X(p.i)} cy={Y(p.pctv)} r="3.5" fill={TERRA} stroke="var(--sup)" strokeWidth="1.5" />
        </g>
      ))}

      {iPrimerFlag != null && (
        <text x={xFin} y={padT - 6} fontSize="10" fill={TERRA} fontWeight={600}
              textAnchor="end">
          {N_FLAG} meses de 2025: cobertura no confirmada
        </text>
      )}

      {/* eje X */}
      {marcasX.map((p) => (
        <g key={p.mes}>
          <line x1={X(p.i)} x2={X(p.i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
          <text x={X(p.i)} y={yBase + 17} fontSize="10.5" fill={MUT} textAnchor="middle">
            {mesCorto(p.mes)}
          </text>
        </g>
      ))}
      <text fontFamily="var(--mono)" x={xFin} y={yBase + 34} fontSize="11" fill={MUT2}
            textAnchor="end" letterSpacing=".09em" fontWeight={600}
            style={{ textTransform: 'uppercase' }}>mes, ene-23 a dic-25</text>
    </svg>
  )
}
