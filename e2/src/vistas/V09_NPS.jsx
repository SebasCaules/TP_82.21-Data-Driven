// V09 — NPS y soporte (e2/DISENO.md). DC-11: 4.312 filas de Interacciones_soporte traen NPS
// con cero reclamos y cero consultas ese mes. No se sabe si es un cliente satisfecho que no
// llamó o un NPS mal cargado (consulta 4, sin confirmar): se conserva con bandera y se marca
// en vez de borrarse o imputarse.
//
// Lienzo de la izquierda: el NPS anual se lee dos veces, con todas las filas (gris, --antes)
// y solo con las que tienen reclamo o consulta (azul, --despues). La brecha crece con los
// años porque las filas sin interacción tienen un NPS más alto (E04): incluirlas sin marcar
// infla el número. No hay primitiva de línea doble en graficos.jsx (Linea dibuja una sola
// serie con su propia escala), así que la línea se arma a mano con escalaNice para que las
// dos series compartan el mismo eje.

import { Lienzo, BarrasH, BarraMini, escalaNice } from '../../../src/graficos.jsx'
import TarjetaDecision from '../TarjetaDecision.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, decimal, fechaCorta } from '../formato.js'

const V09 = D2.vistas.V09
const DC11 = D2.decisiones.find((d) => d.id === 'DC-11')
const NPS_2025 = V09.nps_anual.find((f) => f.anio === 2025)

const TITULO = `${pct(V09.sin_interaccion.pct)} de filas de soporte con NPS sin reclamos ni consultas: se marcan`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(V09.filas)} filas cliente-mes de soporte · registro D19, E04 (solo con reclamo o consulta), D20, D24 · riesgo vs. soporte (D20) sobre la base del E1, sin DC-04 · el origen de las ${entero(V09.sin_interaccion.n)} filas sin interacción no está confirmado, ver consulta 4`

export const meta = {
  id: 'V09',
  corto: 'NPS y soporte',
  titulo: TITULO,
  pie: PIE,
}

export default function V09_NPS() {
  return (
    <section className="pant v09">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo v09-cuerpo">
        <div className="tarjeta">
          <div className="kpi-lbl">
            <span>NPS medio anual, en puntos: con todas las filas o solo con reclamo o consulta</span>
          </div>

          {/* El hallazgo dibujado: que parte de la base no tiene reclamo ni consulta */}
          <div style={{ height: 30, display: 'flex', flexDirection: 'column', marginTop: 6 }}>
            <Lienzo>
              {({ w, h }) => (
                <BarraMini parte={V09.sin_interaccion.n} total={V09.filas} w={w} h={h}
                           excepcion alturaBarra={14} />
              )}
            </Lienzo>
          </div>
          <p style={{ font: '400 11px/1.35 var(--fuente)', color: 'var(--mut2)', margin: '2px 0 0' }}>
            {entero(V09.sin_interaccion.n)} de {entero(V09.filas)} filas cliente-mes sin reclamos ni consultas · {pct(V09.sin_interaccion.pct)}
          </p>

          <div className="ban-par" style={{ marginTop: 6 }}>
            <div className="par-item par-antes">
              <span className="par-lbl">Con todas las filas, 2025</span>
              <span className="par-val tabular">{decimal(DC11.antes.valor, 1)}</span>
            </div>
            <span className="par-flecha" aria-hidden="true">vs.</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Solo filas con reclamo o consulta, 2025</span>
              <span className="par-val tabular">{decimal(DC11.despues.valor, 1)}</span>
            </div>
          </div>

          <LeyendaLinea />

          <Lienzo className="lienzo">
            {({ w, h }) => <GraficoNPS serie={V09.nps_anual} w={w} h={h} />}
          </Lienzo>
        </div>

        <div className="tarjeta">
          <div className="kpi-lbl">
            <span>Reclamos por cliente-mes, por año</span>
          </div>
          {/* Tope de alto: con cuatro barras, a 1920x1080 el lienzo libre las volvía bloques */}
          <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: 4 * 64 + 56, marginBlock: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Lienzo className="lienzo">
              {({ w, h }) => (
                <BarrasH
                  datos={V09.reclamos_por_cliente_mes.map((f) => ({
                    etiqueta: String(f.anio),
                    valor: f.valor,
                  }))}
                  w={w} h={h}
                  formato={(v) => decimal(v, 2)}
                  tituloEje="reclamos/cliente-mes"
                  anchoEtiqueta={56}
                />
              )}
            </Lienzo>
          </div>
        </div>

        <div className="fijo" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.6vh, 16px)', width: 'clamp(208px, 21vw, 254px)' }}>
          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              <span>Riesgo vs. soporte</span>
            </div>
            <table className="tabla-e2" style={{ marginTop: 8 }}>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10 }}>Reclamos</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10 }}>NPS (pts)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>En riesgo</td>
                  <td className="mono tabular" style={{ textAlign: 'right' }}>{decimal(V09.riesgo_vs_soporte.en_riesgo.reclamos_acum, 2)}</td>
                  <td className="mono tabular" style={{ textAlign: 'right' }}>{decimal(V09.riesgo_vs_soporte.en_riesgo.nps, 1)}</td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--mut2)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sin riesgo</td>
                  <td className="mono tabular" style={{ textAlign: 'right' }}>{decimal(V09.riesgo_vs_soporte.sin_riesgo.reclamos_acum, 2)}</td>
                  <td className="mono tabular" style={{ textAlign: 'right' }}>{decimal(V09.riesgo_vs_soporte.sin_riesgo.nps, 1)}</td>
                </tr>
              </tbody>
            </table>
            <p className="kpi-sub" style={{ marginTop: 8 }}>
              reclamos acumulados y NPS medio mensual en puntos, hasta el corte · base del E1, sin DC-04: <b>D20</b>
            </p>
          </div>

          <TarjetaDecision dc={DC11} style={{ flex: 1 }} />
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/** Leyenda de la línea doble: mismo trazo (punto + rótulo mono) que .antes-despues usa para
 *  su .col-rotulo, pero suelta, sin la grilla de dos columnas que esa clase impone: acá las
 *  dos series comparten un solo gráfico, no dos paneles. Cuadrado punteado para "con todas las filas"
 *  y círculo lleno para "solo con reclamo o consulta": la forma repite la de los puntos del
 *  gráfico, así el color nunca es la única marca (regla 2 del diseño transversal). */
function LeyendaLinea() {
  const item = (color, texto, trazo, colorTexto = color) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '600 10.5px/1 var(--mono)', textTransform: 'uppercase', letterSpacing: '.09em', color: colorTexto }}>
      <svg width="16" height="10" aria-hidden="true" data-icono="true">
        <line x1="0" y1="5" x2="16" y2="5" stroke={color} strokeWidth="2"
              strokeDasharray={trazo === 'punteado' ? '4 3' : undefined} />
      </svg>
      {texto}
    </span>
  )
  return (
    <div style={{ display: 'flex', gap: 16, margin: '6px 0 2px' }}>
      {item('var(--antes)', 'Con todas las filas', 'punteado', 'var(--mut2)')}
      {item('var(--despues)', 'Solo con reclamo o consulta', 'solido')}
    </div>
  )
}

/**
 * Línea doble armada a mano: dos polilíneas sobre la misma escala (escalaNice, base cero),
 * una por serie de `nps_anual`. Cada punto lleva <title> con año, serie, valor y base (la
 * cantidad de filas cliente-mes detrás de ese punto). Solo el último punto de cada serie
 * lleva rótulo directo sobre el trazo (regla 14): con cuatro años muy juntos, rotular los
 * cuatro puntos de las dos series los superponía, sobre todo en 2022 donde las dos casi
 * coinciden (41,8 vs. 41,3 puntos); el BAN de arriba ya da las dos cifras de 2025 exactas.
 */
function GraficoNPS({ serie, w, h }) {
  if (!serie.length) return null
  const padL = 30
  const padT = 24
  const padB = 36
  const padR = 20
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
  const nombreSerie = { con_todo: 'con todas las filas', solo_con_interaccion: 'solo con reclamo o consulta' }

  const ultimo = serie.length - 1

  return (
    <svg width={w} height={h} role="img"
         aria-label={'NPS anual, en puntos: ' + serie.map((f) => `${f.anio} con todas las filas ${decimal(f.con_todo, 1)}, solo con reclamo o consulta ${decimal(f.solo_con_interaccion, 1)}`).join('; ')}
         style={{ display: 'block' }}>
      <text fontFamily="var(--mono)" x={2} y={9} fontSize="10" fontWeight={600} fill="var(--mut2)"
            letterSpacing=".08em" style={{ textTransform: 'uppercase' }}>NPS (puntos)</text>

      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke="var(--eje)" strokeWidth="1" />
          <text x={padL - 7} y={Y(t)} fontSize="10.5" fill="var(--mut)" textAnchor="end"
                dominantBaseline="central" className="tabular">{decimal(t, 0)}</text>
        </g>
      ))}
      <line x1={padL} x2={padL + iw} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />

      {['con_todo', 'solo_con_interaccion'].map((campo) => {
        const color = campo === 'con_todo' ? 'var(--antes)' : 'var(--despues)'
        const pts = puntos(campo)
        return (
          <g key={campo}>
            <polyline points={aPolyline(pts)} fill="none" stroke={color} strokeWidth="2.25"
                      strokeLinejoin="round" strokeLinecap="round"
                      strokeDasharray={campo === 'con_todo' ? '5 3' : undefined} />
            {pts.map(([x, y], i) => (
              <g key={i}>
                <title>{lectura(String(serie[i].anio), nombreSerie[campo], decimal(serie[i][campo], 1) + ' pts', `base ${entero(base(serie[i], campo))} filas`)}</title>
                {campo === 'con_todo'
                  ? <rect x={x - 3} y={y - 3} width={6} height={6} fill="var(--sup)" stroke={color} strokeWidth="1.5" />
                  : <circle cx={x} cy={y} r={3.5} fill={color} stroke="var(--sup)" strokeWidth="1.5" />}
              </g>
            ))}
            <text x={pts[ultimo][0]} y={pts[ultimo][1] + (campo === 'con_todo' ? -9 : 15)}
                  fontSize="11" fontWeight={700} fill={campo === 'con_todo' ? 'var(--mut2)' : color}
                  textAnchor="end" className="tabular">
              {decimal(serie[ultimo][campo], 1)}
            </text>
          </g>
        )
      })}

      {serie.map((f, i) => (
        <text key={f.anio} x={X(i)} y={yBase + 15} fontSize="10" fill="var(--mut)" textAnchor="middle">
          {f.anio}
        </text>
      ))}
      <text fontFamily="var(--mono)" x={padL + iw} y={yBase + 31} fontSize="10.5" fontWeight={600}
            fill="var(--mut2)" textAnchor="end" letterSpacing=".08em"
            style={{ textTransform: 'uppercase' }}>Año</text>
    </svg>
  )
}

function lectura(...partes) {
  return partes.filter((x) => x != null && x !== '').join(' · ')
}
