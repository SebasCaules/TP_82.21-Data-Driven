// V06 — Envíos, consentimiento y bajas. Responde quién de los 800 clientes de mayor
// exposición (la lista que arma la campaña de retención) es contactable hoy.
//
// La composición de los 800 sale de D2.vistas.V06.lista_800 con la resta que pide
// CONTRACT_E2.md §3: 800 − contactables_consentimiento = sin consentimiento (terracota,
// bloqueante); contactables_consentimiento − contactables_sin_baja = con consentimiento
// pero con alguna baja registrada; el resto son los contactables_sin_baja de verdad, el
// único tramo con el que la campaña puede trabajar hoy (DC-05, DC-12).
//
// La barra se dibuja a mano con rects propios (no con `BarrasApiladas100`, que emite un solo
// <title> por FILA y acá hay una sola fila con tres tramos que necesitan el suyo): el tramo
// "con baja" es apenas 18 de 800 (2,3 %), demasiado angosto para llevar rótulo adentro sin
// pisar al vecino, así que su identidad queda en su trama propia, en el <title> nativo y en
// la nota de abajo de la barra con su línea guía; los otros dos sí entran con rótulo directo.
//
// El título compara dos cortes de la MISMA lista, no tres valores sueltos: el 568 es
// D2.anclas["contactables 800"], el cálculo de C11 tal como cerró el E1 (consentimiento
// sobre la lista sin identidad resuelta); el 549 es lista_800.contactables_sin_baja, la
// lista de hoy, después de DC-04 (identidad resuelta) y DC-12 (bajas). El 567
// (contactables_consentimiento, la misma lista ya con DC-04 pero sin filtrar bajas) es el
// escalón intermedio que explica por qué el título no dice "568 → 567": la tarjeta de la
// barra lo hace explícito para que nadie lea el 568 → 549 como un solo movimiento.

import { Lienzo, Tramas } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta } from '../formato.js'
import TarjetaDecision from '../TarjetaDecision.jsx'

// Todo lo que el h1 y `meta.titulo` necesitan se calcula acá afuera, a nivel de módulo: son
// el mismo texto (regla dura del contrato de vistas) y D2 es estático, así que no hace falta
// esperar al render para tenerlo.
const infoMeta = D2.meta
const v06 = D2.vistas.V06
const dc05 = D2.decisiones.find((d) => d.id === 'DC-05')
const dc12 = D2.decisiones.find((d) => d.id === 'DC-12')

const { envios, embudo, bajas, lista_800: lista800 } = v06

// 200 id_envio repetidos que el dedupe de DC-05 saca de la base (23.729 → 23.529).
const repetidos = envios.antes - envios.despues
const bajas2026 = bajas['2026']

// El 568 del E1 (C11) es una fila del registro de cifras, no un número escrito a mano: sale
// de D2.anclas, que es donde el pipeline lo deja para que el tablero lo cite sin copiarlo.
const anclaContactables800 = D2.anclas.find((a) => a.nombre === 'contactables 800').valor
const conConsentimiento = lista800.contactables_consentimiento
const sinBaja = lista800.contactables_sin_baja

// Composición de la lista de 800, tal como pide CONTRACT_E2.md §3.
const sinConsentimiento = 800 - conConsentimiento
const conBaja = conConsentimiento - sinBaja

const embudoFilas = [
  { etq: 'Abre', antes: embudo.antes.abre_pct, despues: embudo.despues.abre_pct, dec: 1 },
  { etq: 'Clic', antes: embudo.antes.clic_pct, despues: embudo.despues.clic_pct, dec: 1 },
  { etq: 'Compra a 7 días', antes: embudo.antes.compra_pct, despues: embudo.despues.compra_pct, dec: 2 },
]

// El 200 y las 399 bajas quedan en sus tarjetas: el título dice solo lo que cambia la campaña.
const TITULO = `De la lista de 800 se puede escribir a ${entero(sinBaja)}, `
  + `no a los ${entero(anclaContactables800)} del E1`

/** Barra de composición de los 800, con un tramo por estado y un <title> propio en cada uno
 *  (etiqueta, valor y porcentaje): lo que `BarrasApiladas100` no da porque agrupa toda la
 *  fila en un solo <title>. El tramo angosto ("con baja") no lleva rótulo adentro: se marca
 *  con su propia trama y una nota con línea guía debajo de la barra, así su identidad no
 *  depende solo del color (regla dura 2 del DISENO.md). */
function BarraContactables800({ w, h }) {
  if (!w || !h) return null
  const total = sinBaja + conBaja + sinConsentimiento
  const tramos = [
    { clave: 'Contactables sin baja', valor: sinBaja, fill: 'var(--acc)', tinta: '#fff', ancla: 'start' },
    { clave: 'Con consentimiento, con baja', valor: conBaja, fill: 'url(#trama)', tinta: 'var(--mut2)' },
    { clave: 'Sin consentimiento', valor: sinConsentimiento, fill: 'url(#trama-exc)', tinta: '#fff', ancla: 'end' },
  ]

  const padTop = 20
  const anchoNota = conBaja > 0 ? 30 : 6
  const alto = Math.max(46, Math.min(h - padTop - anchoNota, 92))
  const y = padTop
  let x = 0
  const segs = tramos.map((t) => {
    const share = t.valor / total
    const ws = Math.max(t.valor > 0 ? 3 : 0, share * w)
    const s = { ...t, x, w: ws, share }
    x += ws
    return s
  })
  const angosto = segs.find((s) => s.share < 0.06 && s.share > 0)

  return (
    <svg width={w} height={h} role="img"
         aria-label={'Composición de los 800, después de DC-05 y DC-04. '
           + segs.map((s) => `${s.clave} ${entero(s.valor)}, ${pct(s.share * 100)}`).join(' · ')}
         style={{ display: 'block' }}>
      <Tramas />

      {segs.map((s) => s.w > 0 && (
        <g key={s.clave}>
          <title>{`${s.clave} · ${entero(s.valor)} · ${pct(s.share * 100)} de 800`}</title>
          <rect x={s.x} y={y} width={Math.max(1, s.w - (s.x + s.w < w ? 2 : 0))} height={alto}
                fill={s.fill} />
        </g>
      ))}

      {segs.map((s) => {
        if (s.share < 0.06 || s.w <= 0) return null
        const xRot = s.ancla === 'end' ? s.x + s.w : s.x
        return (
          <text key={'r' + s.clave} x={xRot} y={y - 8} fontSize="11.5" fontWeight={600}
                fill={s.ancla === 'end' ? 'var(--terra)' : 'var(--ink)'}
                textAnchor={s.ancla === 'end' ? 'end' : 'start'}>{s.clave}</text>
        )
      })}
      {segs.map((s) => {
        if (s.share < 0.06 || s.w < 46) return null
        const texto = `${entero(s.valor)} · ${pct(s.share * 100)}`
        const xTxt = s.ancla === 'end' ? s.x + s.w - 9 : s.x + 9
        return (
          <text key={'v' + s.clave} x={xTxt} y={y + alto / 2} fontSize="13.5" fontWeight={700}
                fill={s.tinta} textAnchor={s.ancla === 'end' ? 'end' : 'start'}
                dominantBaseline="central" className="tabular">{texto}</text>
        )
      })}

      {angosto && (
        <g>
          <line x1={angosto.x + angosto.w / 2} x2={angosto.x + angosto.w / 2}
                y1={y + alto} y2={y + alto + 9} stroke="var(--eje)" strokeWidth="1" />
          <line x1={angosto.x + angosto.w / 2} x2={w - 2}
                y1={y + alto + 9} y2={y + alto + 9} stroke="var(--eje)" strokeWidth="1" />
          <text x={w - 2} y={y + alto + 13} fontSize="10.5" fill="var(--mut2)" fontWeight={600}
                textAnchor="end" dominantBaseline="hanging">
            {angosto.clave}: {entero(angosto.valor)} · {pct(angosto.share * 100)}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function V06Envios() {
  return (
    <section className="pant v06">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(8px, 1.3vh, 16px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1.4 1 0', minHeight: 0 }}>
          <div className="tarjeta" style={{ flex: '1.5 1 0', minWidth: 0 }}>
            <span className="kpi-lbl">A quién se le puede escribir · lista de 800</span>
            {/* Alto acotado al que usa la barra (20 + 92 + 30 px): con mas, a 1920 la cadena
                568 -> 567 -> 549 queda separada de la barra por aire vacío del svg */}
            <div style={{ flex: '0 0 auto', height: 150, display: 'flex' }}>
              <Lienzo>
                {({ w, h }) => <BarraContactables800 w={w} h={h} />}
              </Lienzo>
            </div>
            <div className="ban-par" style={{ marginTop: 6, gap: 'clamp(7px, 1vw, 14px)' }}>
              <div className="par-item par-antes">
                <span className="par-lbl">E1 (C11)</span>
                <span className="par-val tabular" style={{ fontSize: 'clamp(15px, 1.5vw, 21px)' }}>
                  {entero(anclaContactables800)}
                </span>
              </div>
              <span className="par-flecha" style={{ fontSize: 13 }}>→</span>
              <div className="par-item par-antes">
                <span className="par-lbl">identidad unida (DC-04)</span>
                <span className="par-val tabular" style={{ fontSize: 'clamp(15px, 1.5vw, 21px)' }}>
                  {entero(conConsentimiento)}
                </span>
              </div>
              <span className="par-flecha" style={{ fontSize: 13 }}>→</span>
              <div className="par-item par-despues">
                <span className="par-lbl">sin bajas (DC-12)</span>
                <span className="par-val tabular" style={{ fontSize: 'clamp(15px, 1.5vw, 21px)' }}>
                  {entero(sinBaja)}
                </span>
              </div>
            </div>
            <span className="kpi-sub">
              {entero(anclaContactables800)} con consentimiento en el E1, sin identidad
              resuelta (C11) · {entero(conConsentimiento)} con consentimiento tras resolver
              identidad (DC-04) · {entero(sinBaja)} sin ninguna baja registrada (DC-12), la
              lista con la que la campaña trabaja hoy.
            </span>
          </div>

          <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vh, 18px)', minWidth: 0 }}>
            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'flex-start' }}>
              <span className="kpi-lbl">Envíos de campañas: antes → después</span>
              <div className="ban-par">
                <div className="par-item par-antes">
                  <span className="par-lbl">Antes</span>
                  <span className="par-val tabular">{entero(envios.antes)}</span>
                </div>
                <span className="par-flecha">→</span>
                <div className="par-item par-despues">
                  <span className="par-lbl">Después</span>
                  <span className="par-val tabular">{entero(envios.despues)}</span>
                </div>
              </div>
              <span className="kpi-sub">
                {entero(repetidos)} envíos repetidos se cuentan una sola vez (DC-05).
              </span>
            </div>

            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'flex-start' }}>
              <span className="kpi-lbl">Bajas: total → hasta el corte</span>
              <div className="ban-par">
                <div className="par-item par-antes">
                  <span className="par-lbl">Total, filtro de contacto</span>
                  <span className="par-val tabular">{entero(bajas.total)}</span>
                </div>
                <span className="par-flecha">→</span>
                <div className="par-item par-despues">
                  <span className="par-lbl">Hasta el corte, análisis de compras</span>
                  <span className="par-val tabular">{entero(bajas.hasta_corte)}</span>
                </div>
              </div>
              <span className="kpi-sub">
                {entero(bajas2026)} solicitudes de 2026 quedan fuera del análisis de
                comportamiento y dentro del filtro de contacto (DC-12).
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1 1 0', minHeight: 0 }}>
          <div className="tarjeta" style={{ flex: '1.3 1 0', minWidth: 0 }}>
            <span className="kpi-lbl"><span>Embudo de campañas</span><b>DC-05</b></span>
            <table className="tabla-e2" style={{ marginTop: 8, fontSize: 12.5 }}>
              <thead>
                <tr>
                  {/* th a 10,5 px: el 9,5 px de .tabla-e2 th quedaba bajo el mínimo legible */}
                  <th style={{ fontSize: 10.5 }}>Etapa</th>
                  <th className="th-antes" style={{ textAlign: 'right', fontSize: 10.5 }}>Antes</th>
                  <th className="th-despues" style={{ textAlign: 'right', fontSize: 10.5 }}>Después</th>
                </tr>
              </thead>
              <tbody>
                {embudoFilas.map((f) => (
                  <tr key={f.etq}>
                    <td>{f.etq}</td>
                    <td className="tabular" style={{ textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--antes)' }}>
                      {pct(f.antes, f.dec)}
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--despues)', fontWeight: 600 }}>
                      {pct(f.despues, f.dec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TarjetaDecision dc={dc05} style={{ flex: '1 1 0', minWidth: 0 }} />
          <TarjetaDecision dc={dc12} style={{ flex: '1 1 0', minWidth: 0 }} />
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(infoMeta.corte_ref)}</b> · base: <b>{entero(envios.despues)}</b> envíos
        después de DC-05 · fila <b>C11</b> · <b>E02</b> · <b>D15</b> · <b>D03</b> (bajas)
      </p>
    </section>
  )
}

export const meta = {
  id: 'V06',
  corto: 'Envíos y bajas',
  titulo: TITULO,
  pie: 'C11, E02, D15, D03 (bajas)',
}
