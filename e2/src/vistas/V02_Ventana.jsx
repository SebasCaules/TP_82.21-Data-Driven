// V02 — Ventana de extracción. Responde "¿por qué el corte común?": los 13 archivos que
// entrega la cátedra no cubren el mismo período, y medir el riesgo con el calendario
// extendido hasta 2026-08 (el archivo más largo del lote) infla la lectura porque compara
// clientes contra una ventana en la que las ventas todavía no existen. DC-08 fija un corte
// único, 31/12/2025, para todo cruce con comportamiento: el riesgo baja de 85,2 % a 49,6 %
// solo por alinear las ventanas, sin tocar una fila de dato.
//
// No hay una primitiva de Gantt en graficos.jsx (regla del contrato: "rectángulos con
// <title>"), así que el eje de tiempo y las barras se arman a mano en SVG dentro de un solo
// <Lienzo>. Los archivos transaccionales van en --despues (la base que usa el resto del
// tablero); Calendario y Bajas quedan marcados como contexto: no acotan comportamiento, así
// que se dibujan con relleno hueco y borde punteado en --antes, no solo un color distinto.
// Clientes.csv declara altas hasta 2026-10-01, después del propio eje, y Tiendas.csv declara
// altas desde 2014-08-29, antes del propio eje: las dos barras se recortan en su borde y una
// flecha marca que siguen, a la derecha o a la izquierda según corresponda, con la fecha real
// en el <title>.

import { Lienzo, Plaqueta } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta } from '../formato.js'

const V = D2.vistas.V02
const DC08 = D2.decisiones.find((d) => d.id === 'DC-08')

const RIESGO_ANTES = V.riesgo.al_2026_08_31.pct
const RIESGO_DESPUES = V.riesgo.al_corte_ref.pct
const CORTE_REF = V.corte_ref

const TITULO = `Con las ventanas alineadas al ${fechaCorta(CORTE_REF)} el riesgo baja de ` +
  `${pct(RIESGO_ANTES)} a ${pct(RIESGO_DESPUES)}`

/** Día juliano simplificado (ms / 86.400.000): alcanza para posicionar fechas en un eje
 *  continuo sin arrastrar una librería de fechas para cuatro cálculos. */
function aDias(iso) {
  return new Date(`${iso}T00:00:00Z`).getTime() / 86400000
}

// El eje pedido va de enero de 2022 a septiembre de 2026: cubre la ventana más corta
// (Tiendas, hasta 2025-02) y la más larga declarada por el equipo (Bajas, hasta 2026-08),
// con aire a los dos lados.
const EJE_DESDE = aDias('2022-01-01')
const EJE_HASTA = aDias('2026-09-30')
const EJE_TOTAL = EJE_HASTA - EJE_DESDE

/** La línea de tiempo por archivo, dibujada a mano: una fila por archivo, una barra desde
 *  `desde` hasta `hasta`, sobre el eje fijo 2022-01 a 2026-09. `w`/`h` los mide <Lienzo>. */
function Gantt({ archivos, corteRef, w, h }) {
  const padTop = 6
  const padLabel = 205
  const padRight = 16
  const altoEje = 36
  const disponible = Math.max(60, h - padTop - altoEje)
  const paso = disponible / archivos.length
  const alto = Math.max(7, Math.min(paso * 0.6, 20))
  const anchoDisp = Math.max(60, w - padLabel - padRight)
  const fuenteEtq = Math.max(9.5, Math.min(10.5, paso * 0.42))
  const fuenteNota = Math.max(8.5, fuenteEtq - 1)
  const yBase = padTop + disponible

  const xDe = (iso) => {
    const d = Math.min(EJE_HASTA, Math.max(EJE_DESDE, aDias(iso)))
    return padLabel + ((d - EJE_DESDE) / EJE_TOTAL) * anchoDisp
  }

  // Calendario.csv aparece dos veces (el operativo y el extendido a 2026-08): sin
  // desambiguar, las dos filas dirían lo mismo a la izquierda del dibujo.
  const repetidos = new Set(
    archivos.map((a) => a.nombre).filter((n, i, arr) => arr.indexOf(n) !== arr.lastIndexOf(n))
  )

  return (
    <svg width={w} height={h} role="img"
         aria-label={'Ventana de extracción por archivo, eje enero de 2022 a septiembre de ' +
           '2026: ' + archivos.map((a) => a.nombre +
             (a.desde && a.hasta ? ` ${a.desde} a ${a.hasta}` : ' sin fecha declarada')).join(', ')}
         style={{ display: 'block' }}>
      {archivos.map((a, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        const esContexto = a.tipo === 'contexto'
        const conFecha = Boolean(a.desde && a.hasta)
        const nombreCorto = a.nombre.replace(/\.csv$/i, '')
        const etiqueta = repetidos.has(a.nombre) ? `${nombreCorto} · ${entero(a.filas)}` : nombreCorto

        if (!conFecha) {
          return (
            <g key={`${a.nombre}-${i}`}>
              <title>{`${a.nombre} · sin fecha declarada · ${entero(a.filas)} filas · ${a.tipo}`}</title>
              <text x={padLabel - 8} y={y + alto / 2} fontSize={fuenteEtq} textAnchor="end"
                    dominantBaseline="central" fill="var(--mut2)">{etiqueta}</text>
              <line x1={padLabel} x2={padLabel + 46} y1={y + alto / 2} y2={y + alto / 2}
                    stroke="var(--eje)" strokeWidth="1" strokeDasharray="2 3" />
              <text x={padLabel + 54} y={y + alto / 2} fontSize={fuenteNota} fill="var(--mut)"
                    dominantBaseline="central">sin fecha en el archivo</text>
            </g>
          )
        }

        const x0 = xDe(a.desde)
        const x1 = xDe(a.hasta)
        const excedeIzq = aDias(a.desde) < EJE_DESDE
        const excedeDer = aDias(a.hasta) > EJE_HASTA
        return (
          <g key={`${a.nombre}-${i}`}>
            <title>
              {`${a.nombre} · ${fechaCorta(a.desde)} a ${fechaCorta(a.hasta)} · ` +
                `${entero(a.filas)} filas · ${esContexto ? 'contexto' : 'transaccional'}` +
                `${excedeIzq ? ` · desde ${fechaCorta(a.desde)}, antes del eje` : ''}` +
                `${excedeDer ? ` · hasta ${fechaCorta(a.hasta)}, después del eje` : ''}`}
            </title>
            <text x={padLabel - 8} y={y + alto / 2} fontSize={fuenteEtq} textAnchor="end"
                  dominantBaseline="central" fill={esContexto ? 'var(--mut2)' : 'var(--ink)'}
                  fontWeight={esContexto ? 400 : 500}>{etiqueta}</text>
            <rect x={x0} y={y} width={Math.max(2, x1 - x0)} height={alto} rx={2}
                  fill={esContexto ? 'none' : 'var(--despues)'}
                  stroke={esContexto ? 'var(--antes)' : 'none'}
                  strokeWidth={esContexto ? 1.5 : 0}
                  strokeDasharray={esContexto ? '3 2' : undefined} />
            {excedeIzq && (
              <path d={`M ${x0} ${y + alto / 2 - 4} L ${x0 - 6} ${y + alto / 2} L ${x0} ${y + alto / 2 + 4} Z`}
                    fill="var(--mut2)" />
            )}
            {excedeDer && (
              <path d={`M ${x1} ${y + alto / 2 - 4} L ${x1 + 6} ${y + alto / 2} L ${x1} ${y + alto / 2 + 4} Z`}
                    fill="var(--mut2)" />
            )}
          </g>
        )
      })}

      <line x1={padLabel} x2={padLabel + anchoDisp} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {[2022, 2023, 2024, 2025, 2026].map((anio) => {
        const x = xDe(`${anio}-01-01`)
        return (
          <g key={anio}>
            <line x1={x} x2={x} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
            <text x={x} y={yBase + 16} fontSize="10" fill="var(--mut)" textAnchor="middle">{anio}</text>
          </g>
        )
      })}
      <text fontFamily="var(--mono)" x={padLabel + anchoDisp} y={yBase + 32} fontSize="10.5"
            fill="var(--mut2)" textAnchor="end" letterSpacing=".09em" fontWeight={600}
            style={{ textTransform: 'uppercase' }}>Ventana declarada por archivo</text>

      {(() => {
        // La línea del corte común marca la decisión (DC-08), no el problema: va en
        // --despues (azul, la base con las DC aplicadas), igual que el resto del tablero.
        // El terracota queda solo para lo que el corte deja afuera (T-13).
        const xc = xDe(corteRef)
        const rotulo = `corte común ${fechaCorta(corteRef)}`
        return (
          <g>
            <title>{rotulo}</title>
            <line x1={xc} x2={xc} y1={padTop} y2={yBase} stroke="var(--despues)" strokeWidth="1.5"
                  strokeDasharray="4 2" />
            <Plaqueta x={xc} y={padTop + 9} texto={rotulo} fuente={10} peso={700}
                      color="var(--despues)" anclaje="middle" />
          </g>
        )
      })()}
    </svg>
  )
}

export default function V02Ventana() {
  return (
    <section className="pant v02">
      <h1 className="titulo">{TITULO}</h1>

      <div className="ban-par">
        <div className="par-item par-antes">
          <span className="par-lbl">Riesgo al 31/08/2026</span>
          <span className="par-val tabular">{pct(RIESGO_ANTES)}</span>
        </div>
        <span className="par-flecha" aria-hidden="true">→</span>
        <div className="par-item par-despues">
          <span className="par-lbl">Riesgo al {fechaCorta(CORTE_REF)} · corte común</span>
          <span className="par-val tabular">{pct(RIESGO_DESPUES)}</span>
        </div>
      </div>

      <div className="lienzo">
        <div className="tarjeta" style={{ flex: '2.3 1 0' }}>
          <span className="kpi-lbl">Ventana declarada de cada archivo</span>
          <div style={{ display: 'flex', gap: 14, fontSize: 10, color: 'var(--mut2)', marginTop: 3 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 8, background: 'var(--despues)', borderRadius: 2, display: 'inline-block' }} />
              transaccional
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 12, height: 8, border: '1.5px dashed var(--antes)', borderRadius: 2, display: 'inline-block' }} />
              contexto (calendario, bajas)
            </span>
          </div>
          <Lienzo className="lienzo">
            {({ w, h }) => <Gantt archivos={V.archivos} corteRef={CORTE_REF} w={w} h={h} />}
          </Lienzo>
        </div>

        <div className="tarjeta" style={{ flex: '1 1 0' }}>
          <span className="kpi-lbl">
            <span>Decisión</span>
            <b className="tabular">DC-08</b>
          </span>
          <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: 1.42, color: 'var(--ink)' }}>
            {DC08.decision}
          </p>
          {DC08.justificacion && (
            <p style={{ margin: '10px 0 0', fontSize: 11.5, lineHeight: 1.4, color: 'var(--mut)' }}>
              {DC08.justificacion}
            </p>
          )}
        </div>
      </div>

      <p className="pie-vista">
        Corte {fechaCorta(CORTE_REF)} · base: {entero(V.archivos.length)} archivos declarados por el equipo ·
        fila <b>D05</b> del registro de cifras · riesgo y exposición en revisión por DC-09
        (cobertura de operaciones 2025, ver V03).
      </p>
    </section>
  )
}

export const meta = {
  id: 'V02',
  corto: 'Ventana de extracción',
  titulo: TITULO,
  pie: 'en revisión por DC-09',
}
