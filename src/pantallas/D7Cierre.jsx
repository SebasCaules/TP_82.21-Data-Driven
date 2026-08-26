// D7 — cierre del bloque Directorio. No agrega gráfico: es el desarrollo del pedido que
// ya subió a D0 (regla 24, lead with the ending), con las tres decisiones que el resto
// del tablero ya sostuvo y su costo cada una. Pirámide de Minto: conclusión en el título,
// soporte en las tarjetas, pedido explícito al cierre (regla 25).

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
    <section className="pant">
      <h1 className="titulo">Tres decisiones, ninguna cuesta presupuesto nuevo</h1>
      <p className="bajada">
        Las tres ya corren con los datos y la capacidad que el tablero mostró en las
        pantallas anteriores.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(10px,1.6vh,20px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(14px,2vw,34px)', flex: 1, minHeight: 0 }}>
          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              1 · Indicador de directorio
              {valorRecompra != null && <b>{pct(valorRecompra)}</b>}
            </div>
            <p className="bajada">
              La recompra a 90 días pasa a ser el número que mira el directorio cada
              corte. Dueño y umbral ya están declarados: María G., meta {metaLo} a{' '}
              {metaHi} %.
            </p>
            {valorRecompra != null && (
              <div style={{ marginTop: 4 }}>
                <Semaforo estado={estadoRecompra(valorRecompra, meta.meta_recompra)} />
              </div>
            )}
            <div className="kpi-base">
              Costo cero: el indicador ya se mide todos los cortes, con semáforo y
              cadencia mensual fijados en la Parte D.
            </div>
          </div>

          <div className="tarjeta" style={{ flex: 1 }}>
            <div className="kpi-lbl">
              2 · Orden de la lista
              <b>{pct(pctTop)}</b>
            </div>
            <p className="bajada">
              La lista de Marketing se ordena por exposición, no por segmento de
              fidelización. Los {entero(topExposicion.length)} primeros ya concentran{' '}
              {pesos(sumaTop)} de los {pesos(info.exposicion)} en riesgo.
            </p>
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
            <p className="bajada">
              Cada envío se filtra por consentimiento antes de salir. En la campaña completa
              (serie global, no responde a los filtros) son{' '}
              {entero(cs.envios_a_no_acepta)} de {entero(cs.envios_base)} envíos; en la lista
              de este corte, {entero(sinConsentimiento)} de los {entero(topExposicion.length)}.
            </p>
            <div className="kpi-base">
              Costo cero: es un filtro previo sobre la misma lista, no suma envíos ni
              gente nueva.
            </div>
          </div>
        </div>

        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <div className="kpi-lbl">Pedido al directorio</div>
          <p className="bajada">
            Aprobar las tres decisiones en esta reunión y tomar el corte de{' '}
            {mesCorte(info.corte)} como primera lectura contra los umbrales ya
            declarados.
          </p>
        </div>
      </div>
    </section>
  )
}
