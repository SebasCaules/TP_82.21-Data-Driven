// V11 · Dataset de entrenamiento — con qué se entrena el modelo del Entregable 3. No es un
// antes/después de una decisión (por eso no lleva .ban-par): es el resultado del tablón que
// arma pipeline/tablon.py sobre la base ya corregida por DC-01 a DC-04 y DC-08. Contrato:
// app/e2/DISENO.md fila V11, app/pipeline/CONTRACT_E2.md §3 y §4 (vistas.V11 = copia de
// resumen_tablon.json), registro fila E08.
//
// El gráfico principal es propio: BarrasH es horizontal y acá la pregunta es una serie de
// 33 cortes mensuales, así que la primitiva no alcanza (mismo motivo que el gráfico propio de
// V03). Las barras van coloreadas por partición con el esquema que fija DISENO.md: train y
// test en tinta sólida (dos tonos distintos, --despues y --ink), gap en --antes (gris, la
// misma semántica que "antes de la decisión" en el resto del tablero), y las dos particiones
// que necesitan distinguirse por algo más que el color llevan trama: dev (azul claro) y
// test_flag, la partición cuya ventana de target cae en los meses que DC-09 marcó "cobertura
// no confirmada" y que por eso se aisló de test en vez de descartarse. La leyenda de texto
// va aparte, arriba del gráfico, para que ningún color se lea solo (regla 2 del DISEÑO).
//
// La tasa de churn por corte es una serie de tiempo aparte, en su propio <Lienzo>: no hay eje
// doble (regla transversal 5), y mezclar volumen de filas con una tasa en el mismo dibujo
// pediría justo eso.

import { Lienzo, Linea, escalaNice } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta, mesCorto } from '../formato.js'

const V = D2.vistas.V11
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')

const hayDatos = !!(V && Array.isArray(V.cortes) && V.cortes.length)

// El título dice el hallazgo con la cifra: volumen del tablón, cuántas features y la tasa
// global de churn a 90 días. Todo sale de D2; si el payload cambia, el título cambia solo.
const TITULO = hayDatos
  ? `${entero(V.filas)} filas cliente × corte, ${V.n_features} features, `
    + `${pct(V.tasa_global_pct)} de churn a 90 días`
  : 'Dataset de entrenamiento'

const PIE = 'fila E08 del registro; target Y_i(T) del Anexo 1 v2.1; partición temporal por '
  + 'corte, sin split aleatorio; el script es pipeline/tablon.py'

export const meta = {
  id: 'V11',
  corto: 'Dataset de entrenamiento',
  titulo: TITULO,
  pie: PIE,
}

// Orden cronológico real de las particiones (train arranca la serie, test_flag la cierra):
// leer la leyenda y la tarjeta de rangos de izquierda a derecha sigue el eje de tiempo.
const ORDEN_PARTICION = ['train', 'dev', 'gap', 'test', 'test_flag']
const ETQ_PARTICION = {
  train: 'train',
  dev: 'dev',
  gap: 'gap',
  test: 'test',
  test_flag: 'test_flag · DC-09',
}
// Mismo esquema de color en la leyenda, en la tarjeta de rangos y en las barras del gráfico:
// una sola paleta, tres lugares. dev y test_flag llevan trama además de color (forma propia,
// no solo tinte) porque son las dos particiones que DC-09 obliga a distinguir de sus vecinas
// (dev del resto de entrenamiento; test_flag de test).
const ESTILO_PARTICION = {
  train: { swatch: { background: 'var(--despues)' }, relleno: 'var(--despues)' },
  dev: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--azul3), var(--azul3) 2px, var(--acc) 2px, var(--acc) 3px)' },
    relleno: 'url(#v11-trama-dev)',
  },
  gap: { swatch: { background: 'var(--antes)' }, relleno: 'var(--antes)' },
  test: { swatch: { background: 'var(--ink)' }, relleno: 'var(--ink)' },
  test_flag: {
    swatch: { backgroundImage: 'repeating-linear-gradient(45deg, var(--terra), var(--terra) 2px, var(--terra-osc) 2px, var(--terra-osc) 3px)' },
    relleno: 'url(#v11-trama-testflag)',
  },
}

function SwatchParticion({ particion }) {
  return (
    <span aria-hidden="true" style={{
      width: 11, height: 11, borderRadius: 2, flexShrink: 0,
      ...ESTILO_PARTICION[particion].swatch,
    }}
    />
  )
}

function LeyendaParticion() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px', margin: '4px 0 2px' }}>
      {ORDEN_PARTICION.map((p) => (
        <span key={p} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 600, color: 'var(--mut2)',
        }}
        >
          <SwatchParticion particion={p} />
          {ETQ_PARTICION[p]}
        </span>
      ))}
    </div>
  )
}

/** Un rango: desde el primer corte de esa partición hasta el último, y sus filas totales. */
function rangosParticion(v) {
  return ORDEN_PARTICION.map((p) => {
    const cs = v.cortes.filter((c) => c.particion === p)
    const agg = v.por_particion.find((x) => x.particion === p)
    return {
      particion: p,
      desde: cs.length ? cs[0].corte : null,
      hasta: cs.length ? cs[cs.length - 1].corte : null,
      filas: agg ? agg.filas : 0,
    }
  })
}

const EJE = 'var(--eje)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'

/**
 * Barras verticales de filas por corte, coloreadas por partición. Gráfico propio (no
 * BarrasH, que es horizontal): la lectura es una serie de tiempo de 33 puntos mensuales.
 * Barras desde cero (regla 4), eje con marcas y título en las dos puntas (regla 21), <title>
 * nativo con etiqueta + valor + partición + tasa en cada barra (regla 14/marca).
 */
function GraficoFilasPorCorte({ w, h, cortes }) {
  if (!cortes.length) return null
  const padL = 46
  const padT = 10
  const padB = 40
  const padR = 8
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)
  const n = cortes.length
  const paso = iw / n
  const anchoBarra = Math.max(2, paso * 0.62)

  const crudo = Math.max(...cortes.map((c) => c.filas))
  const { max: tope, ticks } = escalaNice(crudo, 4)
  const Y = (v) => padT + ih - (v / tope) * ih
  const yBase = Y(0)
  const X = (i) => padL + i * paso + paso / 2
  const xFin = padL + iw

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Filas por corte, ${n} cortes, coloreadas por partición: `
           + cortes.map((c) => `${mesCorto(c.corte)} ${entero(c.filas)} filas ${c.particion}`).join(', ')}
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
        <pattern id="v11-trama-testflag" width="6" height="6" patternUnits="userSpaceOnUse"
                 patternTransform="rotate(45)">
          <rect width="6" height="6" fill="var(--terra)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--terra-osc)" strokeWidth="2" />
        </pattern>
      </defs>

      <text fontFamily="var(--mono)" x={padL} y={11} fontSize="11" fill={MUT2}
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>
        filas por corte
      </text>

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke={EJE} strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10.5" fill={MUT} textAnchor="end"
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
              {`${mesCorto(c.corte)} · ${entero(c.filas)} filas · partición ${c.particion} `
                + `· ${pct(c.tasa_pct)} de churn a 90 días`}
            </title>
            <rect x={x} y={Y(c.filas)} width={anchoBarra} height={alto} fill={estilo.relleno} />
          </g>
        )
      })}

      {/* eje X: mesCorto cada 3 meses (regla del DISEÑO para esta vista), nada en diagonal */}
      {cortes.map((c, i) => {
        if (i % 3 !== 0 && i !== n - 1) return null
        return (
          <g key={`x${c.corte}`}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
            <text x={X(i)} y={yBase + 17} fontSize="10" fill={MUT} textAnchor="middle">
              {mesCorto(c.corte)}
            </text>
          </g>
        )
      })}
      <text fontFamily="var(--mono)" x={xFin} y={yBase + 34} fontSize="11" fill={MUT2}
            textAnchor="end" letterSpacing=".09em" fontWeight={600}
            style={{ textTransform: 'uppercase' }}>
        corte, {mesCorto(cortes[0].corte)} a {mesCorto(cortes[cortes.length - 1].corte)}
      </text>
    </svg>
  )
}

export default function V11Dataset() {
  if (!hayDatos) {
    return (
      <section className="pant v11">
        <h1 className="titulo">{TITULO}</h1>
        <p className="pie-vista">sin datos en el payload</p>
      </section>
    )
  }

  const serieTasa = V.cortes.map((c) => ({ etiqueta: mesCorto(c.corte), valor: c.tasa_pct }))
  const rangos = rangosParticion(V)
  const ejeCorte = `corte, ${mesCorto(V.cortes[0].corte)} a ${mesCorto(V.cortes[V.cortes.length - 1].corte)}`

  return (
    <section className="pant v11">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '0 0 auto' }}>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Filas × columnas</span>
          <span className="kpi-val tabular">{entero(V.filas)} × {V.columnas}</span>
          <span className="kpi-base">{V.n_features} features de entrada</span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Clientes distintos</span>
          <span className="kpi-val tabular">{entero(V.clientes_distintos)}</span>
          <span className="kpi-base">
            {V.cortes.length} cortes, {fechaCorta(V.cortes[0].corte)} a{' '}
            {fechaCorta(V.cortes[V.cortes.length - 1].corte)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
          <span className="kpi-lbl">Positivos, churn a 90 días</span>
          <span className="kpi-val tabular">{entero(V.positivos)}</span>
          <span className="kpi-base">{pct(V.tasa_global_pct)} sobre el total de filas</span>
        </div>
      </div>

      <div className="lienzo">
        <div style={{
          flex: '2 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
          gap: 'clamp(10px, 1.5vh, 16px)',
        }}
        >
          <div className="tarjeta" style={{ flex: '1.5 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Filas por corte, por partición</span>
            <LeyendaParticion />
            <Lienzo className="lienzo">
              {({ w, h }) => <GraficoFilasPorCorte w={w} h={h} cortes={V.cortes} />}
            </Lienzo>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Tasa de churn a 90 días, por corte</span>
            <Lienzo className="lienzo">
              {({ w, h }) => (
                <Linea serie={serieTasa} w={w} h={h} formato={(v) => pct(v)}
                       tituloY="% churn a 90 días" tituloEje={ejeCorte} />
              )}
            </Lienzo>
          </div>
        </div>

        <div style={{
          flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column',
          gap: 'clamp(10px, 1.5vh, 16px)',
        }}
        >
          <div className="tarjeta" style={{ flex: '1.35 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Dataset</span>
            {/* Sin kpi-sub: filas/columnas/features ya están en la primera tarjeta de arriba
                ("Filas × columnas") y repetirlas acá le sacaba a la lista de particiones el
                alto que necesita para no desbordar la tarjeta (ver nota más abajo). */}
            <span className="kpi-val" style={{ fontSize: 'clamp(14px, 1.2vw, 17px)', marginTop: 4 }}>
              {V.nombre}
            </span>
            <div style={{
              marginTop: 8, paddingTop: 7, borderTop: '1px dotted var(--bd)',
              display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0,
            }}
            >
              {/* Fila en DOS renglones (rótulo+conteo arriba, rango de cortes abajo): con todo
                  en una sola línea, "test_flag · DC-09" (el rótulo más largo) le comía el
                  ancho al rango de fechas y lo hacía envolver, desbordando la tarjeta hacia la
                  de abajo. Apilado, cada fila se lee sola sin depender del ancho del rótulo
                  vecino, y con line-height ajustado (no el 1.5 de body) entran las cinco sin
                  desbordar a 1152 × 640. */}
              {rangos.map((r) => (
                <div key={r.particion} style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, lineHeight: 1.25 }}>
                    <SwatchParticion particion={r.particion} />
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {ETQ_PARTICION[r.particion]}
                    </span>
                    <span className="tabular" style={{ marginLeft: 'auto', color: 'var(--mut2)', fontWeight: 600 }}>
                      {entero(r.filas)} filas
                    </span>
                  </div>
                  <div className="tabular" style={{ fontSize: 10, lineHeight: 1.25, color: 'var(--mut)', paddingLeft: 18 }}>
                    {fechaCorta(r.desde)}–{fechaCorta(r.hasta)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
            <span className="kpi-lbl">Decisión <b>DC-09</b></span>
            <p style={{ margin: '7px 0 0', fontSize: 12, lineHeight: 1.42, color: 'var(--ink)' }}>
              {DC09.decision}
            </p>
            {DC09.justificacion && (
              <p style={{ margin: '7px 0 0', fontSize: 11, lineHeight: 1.38, color: 'var(--mut)' }}>
                <b style={{ color: 'var(--mut2)' }}>Justificación.</b> {DC09.justificacion}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}
