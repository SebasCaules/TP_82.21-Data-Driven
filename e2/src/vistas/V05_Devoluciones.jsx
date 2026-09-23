// V05 · Devoluciones — DC-02. Las 613 filas negativas de Transacciones YA SON las devoluciones:
// el error que DC-02 evita es sumarlas dos veces (una vez como venta negativa, otra vez como
// "devolución" aparte) y contar el evento por la fecha de la venta original en vez de la fecha
// real del trámite. Ver DISENO.md fila V05 y CONTRACT_E2.md §3 (vistas.V05).
//
// `Linea` (graficos.jsx) solo dibuja una serie. Con dos series por mes que hay que comparar
// punto a punto (fila negativa vs. fecha_devolucion), forzarlas en dos llamados a `Linea` en
// paneles separados hubiese partido la comparación en dos ejes X distintos, que es lo que la
// pregunta de esta vista no permite. `LineaDoble`, acá abajo, es una primitiva local de una
// sola vista (no toca graficos.jsx): mismo trazo de eje, sin gridlines, con leyenda de texto
// arriba del gráfico y trazo punteado en la serie "antes" para que la distinción no dependa
// solo del color (regla 2 de DISENO.md).

import { D2 } from '../datos_e2.js'
import { Lienzo, BarrasH, escalaNice } from '../../../src/graficos.jsx'
import { entero, pct, mesCorto, fechaCorta } from '../formato.js'
import TarjetaDecision from '../TarjetaDecision.jsx'

const V05 = D2.vistas.V05
const DC02 = D2.decisiones.find((d) => d.id === 'DC-02')

const unidadesAntes = V05.unidades.antes
const unidadesDespues = V05.unidades.despues
const pctInfla = (unidadesAntes / unidadesDespues - 1) * 100

// "restadas" en vez de "netadas": el directorio no usa la jerga contable (COMPRENSION-OM-4).
const TITULO = `${entero(V05.devoluciones.crudas)} devoluciones ya restadas: ` +
  `sumarlas otra vez infla ${pct(pctInfla)} las unidades`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(unidadesDespues)} unidades vendidas · ` +
  `D02 · E05 (desfase) · fecha de devolución manda (consulta 6)`

export const meta = { id: 'V05', corto: 'Devoluciones', titulo: TITULO, pie: PIE }

export default function V05_Devoluciones() {
  const motivos = V05.motivos.map((m) => ({ etiqueta: m.motivo, valor: m.n }))

  return (
    <section className="pant v05">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
        {/* fila 1: el par grande (unidades antes/después) y la tarjeta de la decisión DC-02 */}
        <div style={{ display: 'flex', gap: 'clamp(16px, 2vw, 30px)', alignItems: 'stretch', flexShrink: 0 }}>
          <div className="tarjeta" style={{ flex: '0 0 auto', justifyContent: 'center' }}>
            <span className="kpi-lbl">Unidades vendidas, contadas una sola vez</span>
            <div className="ban-par" style={{ marginTop: '6px' }}>
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

          <TarjetaDecision dc={DC02} style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '6px 0 0', font: '400 11px/1.4 var(--mono)', color: 'var(--mut)' }}>
              <span className="tabular">{entero(V05.devoluciones.crudas)}</span> filas negativas,{' '}
              <span className="tabular">{entero(V05.devoluciones.unicas)}</span> devoluciones distintas{' '}
              (<span className="tabular">{entero(V05.devoluciones.crudas - V05.devoluciones.unicas)}</span> repetidas · D02)
            </p>
            <div className="kpi-base" style={{ marginTop: 'auto' }}>
              La fecha de devolución cae una mediana de{' '}
              <span className="tabular">{entero(V05.desfase_dias.mediana)}</span> días después de la fila negativa{' '}
              (entre <span className="tabular">{entero(V05.desfase_dias.min)}</span> y{' '}
              <span className="tabular">{entero(V05.desfase_dias.max)}</span> días)
            </div>
          </TarjetaDecision>
        </div>

        {/* fila 2: la serie mensual con las dos formas de contar, y los motivos declarados */}
        <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
          <div className="tarjeta" style={{ flex: 1.3, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span className="kpi-lbl">Devoluciones por mes: qué fecha cuenta</span>
            <div style={{
              display: 'flex', gap: '16px', marginTop: '6px', flexShrink: 0,
              font: '600 10.5px/1.2 var(--mono)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--mut2)' }}>
                <i style={{
                  display: 'inline-block', width: '15px', height: '0',
                  borderTop: '2px dashed var(--antes)',
                }} aria-hidden="true" />
                fecha de la fila negativa (antes)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--acc)' }}>
                <i style={{ display: 'inline-block', width: '15px', height: '2px', background: 'var(--despues)' }}
                   aria-hidden="true" />
                fecha de devolución (después, DC-02) · {entero(V05.devoluciones.crudas)} filas
              </span>
            </div>
            <Lienzo className="lienzo">
              {({ w, h }) => (
                <LineaDoble serie={V05.serie} w={w} h={h} formato={entero}
                            tituloEje={`mes, ${mesCorto(V05.serie[0].mes)} a ${mesCorto(V05.serie.at(-1).mes)}`} />
              )}
            </Lienzo>
          </div>

          <div className="tarjeta" style={{ flex: 1.15, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span className="kpi-lbl">Motivos declarados, {entero(V05.devoluciones.crudas)} filas</span>
            {/* tope de alto: con pocas barras a 1920 no se estiran hasta el piso (D1-11) */}
            <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: 5 * 64 + 56, margin: 'auto 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Lienzo className="lienzo">
                {({ w, h }) => (
                  <BarrasH datos={motivos} w={w} h={h} formato={entero} tituloEje="devoluciones"
                           anchoEtiqueta={Math.min(210, Math.max(150, w * 0.52))} />
                )}
              </Lienzo>
            </div>
          </div>
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

/**
 * Dos series de tiempo sobre el mismo eje, sin interpolar huecos (no los hay: las dos vienen
 * del mismo universo de 613 filas, solo cambia qué fecha se usa para fechar cada una). Mismas
 * convenciones que `Linea`: eje de valores redondeado con `escalaNice`, sin gridlines, nada de
 * texto en diagonal en el eje X. La serie "antes" va punteada además de gris: la distinción no
 * depende solo del color (regla 2 de DISENO.md).
 */
function LineaDoble({ serie, w, h, formato, tituloEje }) {
  const padL = 32
  const padT = 24   // lugar para el título del eje Y arriba del primer tick
  const padB = 40
  const padR = 22   // mitad del ancho del último rótulo de mes ("dic-25"), que se centra en xFin
  const iw = Math.max(20, w - padL - padR)
  const ih = Math.max(20, h - padT - padB)

  const vals = serie.flatMap((p) => [p.por_fila_negativa, p.por_fecha_devolucion])
    .filter((v) => v != null)
  if (!vals.length) return null

  const { max, ticks } = escalaNice(Math.max(...vals), 4)
  const X = (i) => padL + (i / Math.max(1, serie.length - 1)) * iw
  const Y = (v) => padT + ih - (v / max) * ih
  const yBase = Y(0)
  const xFin = padL + iw

  const ptsA = serie.map((p, i) => [X(i), Y(p.por_fila_negativa)])
  const ptsB = serie.map((p, i) => [X(i), Y(p.por_fecha_devolucion)])
  const cada = Math.ceil((serie.length * 44) / Math.max(1, iw))

  return (
    <svg width={w} height={h} role="img"
         aria-label={`${tituloEje || 'Serie de tiempo'}, dos series: fila negativa y fecha de devolución. ` +
           serie.map((p) => `${mesCorto(p.mes)} fila negativa ${formato(p.por_fila_negativa)}, ` +
             `fecha de devolución ${formato(p.por_fecha_devolucion)}`).join(', ')}
         style={{ display: 'block' }}>
      <text fontFamily="var(--mono)" x={padL} y={11} fontSize="11" fill="var(--mut2)"
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>
        devoluciones por mes
      </text>
      <line x1={padL} x2={padL} y1={padT} y2={yBase} stroke="var(--eje)" strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL - 4} x2={padL} y1={Y(t)} y2={Y(t)} stroke="var(--eje)" strokeWidth="1" />
          <text x={padL - 8} y={Y(t)} fontSize="10" fill="var(--mut)" textAnchor="end"
                dominantBaseline="central" className="tabular">{formato(t)}</text>
        </g>
      ))}
      <line x1={padL} x2={xFin} y1={yBase} y2={yBase} stroke="var(--eje)" strokeWidth="1" />

      <polyline points={ptsA.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--antes)"
                strokeWidth="2" strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={ptsB.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--despues)"
                strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />

      {serie.map((p, i) => (
        <circle key={'a' + p.mes} cx={X(i)} cy={Y(p.por_fila_negativa)} r="2" fill="var(--antes)">
          <title>{`${mesCorto(p.mes)} · fecha de la fila negativa (antes) · ${formato(p.por_fila_negativa)} devoluciones`}</title>
        </circle>
      ))}
      {serie.map((p, i) => (
        <circle key={'b' + p.mes} cx={X(i)} cy={Y(p.por_fecha_devolucion)} r="2.25" fill="var(--despues)">
          <title>{`${mesCorto(p.mes)} · fecha de devolución (después, DC-02) · ${formato(p.por_fecha_devolucion)} devoluciones`}</title>
        </circle>
      ))}

      {serie.map((p, i) => {
        // la marca regular a menos de `cada` meses del último se omite: si no, pisa a "dic-25"
        if ((i % cada !== 0 || serie.length - 1 - i < cada) && i !== serie.length - 1) return null
        return (
          <g key={'x' + p.mes}>
            <line x1={X(i)} x2={X(i)} y1={yBase} y2={yBase + 4} stroke="var(--eje)" strokeWidth="1" />
            <text x={X(i)} y={yBase + 16} fontSize="10" fill="var(--mut)" textAnchor="middle">
              {mesCorto(p.mes)}
            </text>
          </g>
        )
      })}
      {tituloEje && (
        <text fontFamily="var(--mono)" x={xFin} y={yBase + 36} fontSize="10.5" fill="var(--mut2)"
              textAnchor="end" letterSpacing=".09em" fontWeight={600}
              style={{ textTransform: 'uppercase' }}>{tituloEje}</text>
      )}
    </svg>
  )
}
