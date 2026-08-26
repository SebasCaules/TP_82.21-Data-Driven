// D7 — cierre del bloque Directorio. No agrega gráfico: es el desarrollo del pedido que
// ya subió a D0 (regla 24, lead with the ending), con las tres decisiones que el resto
// del tablero ya sostuvo y su costo cada una. Pirámide de Minto: conclusión en el título,
// soporte en las tarjetas como bullets declarativos (no párrafo: cada afirmación se
// sostiene sola), pedido explícito al cierre (regla 25). Cabecera de una línea (cab-1)
// porque acá no hay filtro que la alargue: libera alto para que las tarjetas ocupen el
// lienzo entero en vez de la mitad de arriba.

import Semaforo, { estadoRecompra } from '../Semaforo.jsx'
import {
  entero, lista, meta, mesCorte, pesos, pct, series,
} from '../agregacion.js'

export default function D7({ info, iCorte, filtro }) {
  // La serie de recompra es global (no depende del corte ni de los filtros, igual que
  // en D0 y D4).
  const serieRecompra = series.recompra_trimestral.filter((r) => r.tasa != null)
  const ultima = serieRecompra.length ? serieRecompra[serieRecompra.length - 1] : null
  const valorRecompra = ultima ? ultima.tasa * 100 : null
  const [metaLo, metaHi] = meta.meta_recompra
  const [capLo, capHi] = meta.capacidad_contacto
  const cs = series.consentimiento

  const topExposicion = lista(iCorte, filtro)
  const topConConsentimiento = lista(iCorte, filtro, true)
  const sumaTop = topExposicion.reduce((s, r) => s + r.anualizado, 0)
  const pctTop = info.exposicion ? (100 * sumaTop) / info.exposicion : 0
  const sinConsentimiento = topExposicion.length - topConConsentimiento.length

  return (
    <section className="pant cab-1">
      <h1 className="titulo">Tres decisiones, ninguna cuesta presupuesto nuevo</h1>
      <p className="bajada">Corren con los datos y la capacidad que ya mostró el tablero.</p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(10px,1.6vh,20px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(14px,2vw,34px)', flex: '0 0 auto' }}>
          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              1 · Indicador de directorio
              {valorRecompra != null && <b>{pct(valorRecompra)}</b>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'clamp(8px,1.4vh,16px)' }}>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', lineHeight: 1.5, color: 'var(--mut2)' }}>
                <li>La recompra a 90 días pasa a ser el número que mira el directorio cada corte.</li>
                <li>Dueña María G., meta {metaLo} a {metaHi} %.</li>
              </ul>
              {valorRecompra != null && (
                <Semaforo estado={estadoRecompra(valorRecompra, meta.meta_recompra)} de="recompra a 90 días" />
              )}
            </div>
            <div className="kpi-base">
              Costo cero: ya se mide cada corte, con semáforo y cadencia mensual fijados
              en la Parte D.
            </div>
          </div>

          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              2 · Orden de la lista
              <b>{pct(pctTop)}</b>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', lineHeight: 1.5, color: 'var(--mut2)' }}>
                <li>La lista de Marketing se ordena por exposición, no por segmento de fidelización.</li>
                <li>Los {entero(topExposicion.length)} primeros concentran {pesos(sumaTop)} de los{' '}
                  {pesos(info.exposicion)} en riesgo.</li>
              </ul>
            </div>
            <div className="kpi-base">
              Costo cero: misma capacidad de {capLo} a {capHi} contactos por mes, cambia
              el criterio de corte, no el cupo.
            </div>
          </div>

          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              3 · Filtro de consentimiento
              <b>{pct(cs.pct_envios_a_no_acepta * 100)}</b>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12.5px', lineHeight: 1.5, color: 'var(--mut2)' }}>
                <li>Cada envío se filtra por consentimiento antes de salir.</li>
                <li>Campaña completa: {entero(cs.envios_a_no_acepta)} de {entero(cs.envios_base)} envíos.
                  Este corte: {entero(sinConsentimiento)} de {entero(topExposicion.length)}.</li>
              </ul>
            </div>
            <div className="kpi-base">
              Costo cero: filtro previo sobre la misma lista, no suma envíos ni gente
              nueva.
            </div>
          </div>
        </div>

        {/* El pedido se queda con el alto sobrante en vez de repartirlo entre las tres
            tarjetas: es lo unico que la pantalla le pide al directorio, y tres tarjetas
            estiradas a pantalla completa por seis bullets dejaban un hueco en cada una. */}
        <div className="tarjeta" style={{ flex: 1, minHeight: 0, borderTopColor: 'var(--acc)', justifyContent: 'center' }}>
          <div className="kpi-lbl" style={{ color: 'var(--acc)' }}>Pedido al directorio</div>
          <p style={{ margin: '8px 0 0', fontSize: 'clamp(16px,1.6vw,22px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, maxWidth: '62ch' }}>
            Aprobar las tres decisiones en esta reunión y tomar el corte de{' '}
            {mesCorte(info.corte)} como primera lectura contra los umbrales ya declarados.
          </p>
        </div>
      </div>
    </section>
  )
}
