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
import TarjetaDecision from '../TarjetaDecision.jsx'
import ValorMonto from '../ValorMonto.jsx'

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

// El umbral sale del payload (D5-15): titulo, linea y rotulo lo leen de aca.
const UMBRAL = D2.meta.umbral_cobertura

// Auditoría T-03: el corte de referencia (CREF.pct) ya incorpora DC-04 (unión de
// duplicados, vista 4): por eso salta de los 49,6 % con que cierra V02 a 50,4 % acá. El
// rótulo del par lo dice, porque es lo primero que el lector compara contra V02.
const ETQ_CREF = `al ${fechaCorta(D2.meta.corte_ref)}, con duplicados unidos, en revisión`
const ETQ_SENS = `al ${fechaCorta(D2.meta.corte_sens)}, último mes confirmado`

// El titulo dice el hallazgo: cuantos meses de 2025 quedan bajo el umbral (D4-15).
const TITULO = `${capitalizar(N_PALABRA[N_FLAG] ?? String(N_FLAG))} meses de 2025 con menos del ` +
  `${Math.round(UMBRAL * 100)} % de las operaciones de un año antes`

const PIE = `corte de referencia ${fechaCorta(D2.meta.corte_ref)} · serie de filas únicas ` +
  `con monto positivo, antes de DC-04 · sensibilidad después de DC-04, corte ` +
  `${fechaCorta(D2.meta.corte_sens)} · fila E01 (sensibilidad); D22 en revisión al ` +
  `corte de referencia (hereda C03 y C04) · ${DC09.hallazgo}`

export const meta = { id: 'V03', corto: 'Cobertura 2025', titulo: TITULO, pie: PIE }

export default function V03Cobertura() {
  return (
    <section className="pant v03">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(10px, 1.5vh, 16px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(16px, 2.4vw, 34px)', flex: '0 0 auto' }}>
          <ParDoble
            grupo="Clientes en riesgo, según la fecha de medición"
            valRef={<span className="par-val tabular" style={{ color: 'var(--ink)' }}>{pct(CREF.pct)}</span>}
            valSens={<span className="par-val tabular" style={{ color: 'var(--ink)' }}>{pct(CSENS.pct)}</span>}
          />
          <ParDoble
            grupo="Exposición anual, según la fecha de medición"
            valRef={<ValorMonto texto={montoM(CREF.exposicion_M)} />}
            valSens={<ValorMonto texto={montoM(CSENS.exposicion_M)} />}
          />
        </div>

        <div className="tarjeta" style={{ flex: '1', minHeight: 0 }}>
          <span className="kpi-lbl">
            <span>Operaciones del mes contra el mismo mes del año anterior</span>
            <b className="tabular">{entero(V03.serie.length)} meses</b>
          </span>
          <Lienzo>
            {({ w, h }) => <GraficoCobertura w={w} h={h} serie={V03.serie} />}
          </Lienzo>
        </div>

        <TarjetaDecision dc={DC09} style={{ flex: '0 0 auto' }} />
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/** La misma cifra medida en dos fechas (D1-12): no es un antes y un después, así que no
 *  lleva flecha ni el gris/azul del par; las dos cifras en tinta y la sensibilidad con la
 *  marca punteada de V10 (forma, no color). Una instancia por métrica. */
function ParDoble({ grupo, valRef, valSens }) {
  const lbl = { color: 'var(--mut2)', lineHeight: 1.25 }
  // Rótulo arriba, cifra abajo: con rótulos de largo distinto las dos cifras quedan a la par.
  const item = { flex: '1 1 0', color: 'var(--ink)', justifyContent: 'space-between', gap: 4, paddingTop: 5 }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 0', minWidth: 0 }}>
      <span className="kpi-lbl" style={{ marginBottom: 0 }}>{grupo}</span>
      <div className="ban-par" style={{ alignItems: 'stretch' }}>
        <div className="par-item" style={{ ...item, borderTop: '2px solid transparent' }}>
          <span className="par-lbl" style={lbl}>{ETQ_CREF}</span>
          {valRef}
        </div>
        <div className="par-item" style={{ ...item, borderTop: '2px dashed var(--mut2)' }}>
          <span className="par-lbl" style={{ ...lbl, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <span
              aria-hidden="true"
              style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)', flexShrink: 0, boxSizing: 'border-box' }}
            />
            <span>{ETQ_SENS}</span>
          </span>
          {valSens}
        </div>
      </div>
    </div>
  )
}

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

  // D2-20: la linea arranca en el primer punto en escala; los meses sobre el techo quedan
  // como circulos sueltos y un tramo punteado los une a la serie.
  const enEscala = puntos.findIndex((p) => p.pctv <= TOPE * 100)
  const linea = (enEscala < 0 ? [] : puntos.slice(enEscala))
    .map((p) => `${X(p.i)},${Y(p.pctv)}`).join(' ')
  const ultOff = enEscala > 0 ? puntos[enEscala - 1] : null
  const priEsc = enEscala >= 0 ? puntos[enEscala] : null

  const iPrimerOff = offscale.length ? offscale[0].i : null
  const iUltimoOff = offscale.length ? offscale[offscale.length - 1].i : null
  const iPrimerFlag = flags.length ? flags[0].i : null
  const iUltimoFlag = flags.length ? flags[flags.length - 1].i : null

  // Etiquetas de eje X: enero de cada año y el último mes, nada en diagonal. Sobre todos los
  // meses (puntosBase), no solo los que tienen ratio: el eje no depende del dato graficado.
  const marcasX = puntosBase.filter((p, i) => p.mes.endsWith('-01') || i === n - 1)

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Razón de operaciones contra el mismo mes del año anterior, ${serie.length} meses. Umbral ${pct(UMBRAL * 100, 0)}. ${N_FLAG} meses de 2025 por debajo.`}
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
            dominantBaseline="central">umbral {pct(UMBRAL * 100, 0)}</text>

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

      {/* Grilla del 100 %: la referencia que da sentido al umbral (D3-19). */}
      <line x1={padL} x2={xFin} y1={Y(100)} y2={Y(100)} stroke={EJE} strokeWidth="1"
            strokeDasharray="1 3" />
      <text x={padL + 6} y={Y(100) - 4} fontSize="10" fill={MUT}>
        {fmtPct0(100)} = igual que un año antes
      </text>

      {/* línea de la serie, con los puntos por encima del techo aplanados en el borde
          superior: su franja de arriba y su <title> dicen que ahí el dato sigue subiendo. */}
      <polyline points={linea} fill="none" stroke="var(--acc)" strokeWidth="2"
                strokeLinejoin="round" strokeLinecap="round" opacity=".9" />
      {ultOff && priEsc && (
        <line x1={X(ultOff.i)} y1={Y(ultOff.pctv)} x2={X(priEsc.i)} y2={Y(priEsc.pctv)}
              stroke="var(--acc)" strokeWidth="1.5" strokeDasharray="2 3" opacity=".9" />
      )}

      {offscale.map((p) => (
        <g key={p.mes}>
          <title>{`${mesCorto(p.mes)} · ${fmtRatio(p.ratio)} del mismo mes de ${Number(p.mes.slice(0, 4)) - 1} · ${entero(p.n)} operaciones sobre ${entero(p.n_prev)}`}</title>
          <circle cx={X(p.i)} cy={Y(TOPE * 100)} r="3" fill="var(--sup)" stroke={GRIS} strokeWidth="1.5" />
        </g>
      ))}

      {flags.map((p) => (
        <g key={p.mes}>
          <title>{`${mesCorto(p.mes)} · ${fmtPct0(p.pctv)} del mismo mes del año anterior · cobertura no confirmada · ${entero(p.n)} operaciones sobre ${entero(p.n_prev)}`}</title>
          <circle cx={X(p.i)} cy={Y(p.pctv)} r="3.5" fill={TERRA} stroke="var(--sup)" strokeWidth="1.5" />
          {/* Valor escrito solo en el primero y el último: los del medio van en el <title>. */}
          {/* Si debajo del punto no hay lugar antes del eje X, el valor va a su derecha. */}
          {(p.i === iPrimerFlag || p.i === iUltimoFlag) && (
            Y(p.pctv) + 16 <= yBase
              ? <text x={p.i === iPrimerFlag ? X(p.i) - 5 : X(p.i)} y={Y(p.pctv) + 14} fontSize="10" fontWeight={600} fill={TERRA}
                      textAnchor={p.i === iPrimerFlag ? 'end' : 'middle'} className="tabular">{fmtPct0(p.pctv)}</text>
              : <text x={X(p.i) + 7} y={Y(p.pctv)} fontSize="10" fontWeight={600} fill={TERRA}
                      textAnchor="start" dominantBaseline="central" className="tabular">{fmtPct0(p.pctv)}</text>
          )}
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
            style={{ textTransform: 'uppercase' }}>mes, {mesCorto(serie[0].mes)} a {mesCorto(serie[n - 1].mes)}</text>
    </svg>
  )
}
