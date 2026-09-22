// V06 — Envíos, consentimiento y bajas. Responde quién de los 800 clientes de mayor
// exposición (la lista que arma la campaña de retención) es contactable hoy.
//
// La composición de los 800 sale de D2.vistas.V06.lista_800 con la resta que pide
// CONTRACT_E2.md §3: 800 − contactables_consentimiento = sin consentimiento (terracota,
// bloqueante); contactables_consentimiento − contactables_sin_baja = con consentimiento
// pero con alguna baja registrada; el resto son los contactables_sin_baja de verdad, el
// único tramo con el que la campaña puede trabajar hoy (DC-05, DC-12).
//
// El 568 que cerró el E1 (C11) es un cálculo previo a DC-04 (resolución de identidad); el
// payload de E2 ya viene con las identidades resueltas, así que contactables_consentimiento
// da 567. Se usa ese valor, tal como llega en D2, y se deja la nota en el pie: no hay
// segunda cifra que inventar para "empatar" con el E1.

import { Lienzo, BarrasApiladas100 } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta } from '../formato.js'

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

// Composición de la lista de 800, tal como pide CONTRACT_E2.md §3.
const sinConsentimiento = 800 - lista800.contactables_consentimiento
const conBaja = lista800.contactables_consentimiento - lista800.contactables_sin_baja
const sinBaja = lista800.contactables_sin_baja

// Fila única (la lista entera es una sola composición, no hay categorías que comparar entre
// sí): 18 de 800 es un tramo demasiado angosto para llevar rótulo adentro sin pisar al
// vecino, así que ese segmento no lleva `texto` y su identidad queda en la leyenda y en el
// <title> nativo del SVG.
const filasLista800 = [{
  etiqueta: 'Lista de 800',
  segmentos: [
    {
      clave: 'Contactables sin baja', valor: sinBaja, tono: 'var(--acc)', tinta: '#fff',
      enfasis: true, texto: `${entero(sinBaja)} · ${pct((100 * sinBaja) / 800)}`,
    },
    { clave: 'Con consentimiento, con baja', valor: conBaja, tono: 'trama' },
    {
      clave: 'Sin consentimiento', valor: sinConsentimiento, tono: 'trama-exc', tinta: '#fff',
      excepcion: true, texto: `${entero(sinConsentimiento)} · ${pct((100 * sinConsentimiento) / 800)}`,
    },
  ],
}]

// Etiquetas cortas: el ancho de la tarjeta es la mitad del lienzo, no el lienzo entero como
// en M3Consentimiento, y las versiones largas ("sin consentimiento · bloqueante") no entran.
const leyendaLista800 = [
  { etiqueta: 'sin baja', tono: 'var(--acc)', enfasis: true },
  { etiqueta: 'con baja', tono: 'trama' },
  { etiqueta: 'sin consentimiento', tono: 'trama-exc' },
]

const embudoFilas = [
  { etq: 'Abre', antes: embudo.antes.abre_pct, despues: embudo.despues.abre_pct, dec: 1 },
  { etq: 'Clic', antes: embudo.antes.clic_pct, despues: embudo.despues.clic_pct, dec: 1 },
  { etq: 'Compra a 7 días', antes: embudo.antes.compra_pct, despues: embudo.despues.compra_pct, dec: 2 },
]

const TITULO = `${entero(repetidos)} envíos repetidos y ${entero(bajas2026)} bajas 2026 `
  + `fuera: ${entero(lista800.contactables_consentimiento)} → ${entero(sinBaja)} contactables de 800`

export default function V06Envios() {
  return (
    <section className="pant v06">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(8px, 1.3vh, 16px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1.4 1 0', minHeight: 0 }}>
          <div className="tarjeta" style={{ flex: '1.3 1 0', minWidth: 0 }}>
            <span className="kpi-lbl">A quién se le puede escribir · lista de 800</span>
            <Lienzo>
              {({ w, h }) => (
                <BarrasApiladas100
                  filas={filasLista800} leyenda={leyendaLista800} w={w} h={h}
                  anchoEtiqueta={104} alturaBarra={104}
                  tituloEje="Composición de los 800, después de DC-05"
                />
              )}
            </Lienzo>
            <span className="kpi-sub">
              Sobre los 800 clientes de mayor exposición al corte, después de DC-05 (dedupe
              de envíos) y DC-04 (identidad resuelta).
            </span>
          </div>

          <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vh, 18px)', minWidth: 0 }}>
            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'center' }}>
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
                {entero(repetidos)} id_envio repetidos, fuera del envío por el dedupe (DC-05).
              </span>
            </div>

            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'center' }}>
              <span className="kpi-lbl">Bajas: total → hasta el corte</span>
              <div className="ban-par">
                <div className="par-item par-antes">
                  <span className="par-lbl">Total</span>
                  <span className="par-val tabular">{entero(bajas.total)}</span>
                </div>
                <span className="par-flecha">→</span>
                <div className="par-item par-despues">
                  <span className="par-lbl">Hasta el corte</span>
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
            <span className="kpi-lbl">Embudo de campañas: antes → después del dedupe</span>
            <div className="antes-despues">
              <div className="col col-antes">
                <span className="col-rotulo">Antes</span>
                {embudoFilas.map((f) => (
                  <div key={f.etq} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{f.etq}</span>
                    <span className="tabular">{pct(f.antes, f.dec)}</span>
                  </div>
                ))}
              </div>
              <div className="col col-despues">
                <span className="col-rotulo">Después</span>
                {embudoFilas.map((f) => (
                  <div key={f.etq} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{f.etq}</span>
                    <span className="tabular">{pct(f.despues, f.dec)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
            <span className="kpi-lbl">DC-05 · decisión</span>
            <span className="kpi-sub" style={{ marginTop: 6 }}>{dc05.decision}</span>
            {dc05.justificacion && <span className="kpi-sub">{dc05.justificacion}</span>}
          </div>

          <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}>
            <span className="kpi-lbl">DC-12 · decisión</span>
            <span className="kpi-sub" style={{ marginTop: 6 }}>{dc12.decision}</span>
            {dc12.justificacion && <span className="kpi-sub">{dc12.justificacion}</span>}
          </div>
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(infoMeta.corte_ref)}</b> · base: <b>{entero(envios.despues)}</b> envíos
        después de DC-05 · fila <b>C11</b> · <b>D15</b> · <b>D18</b> · <b>E02</b>
      </p>
    </section>
  )
}

export const meta = {
  id: 'V06',
  corto: 'Envíos y bajas',
  titulo: TITULO,
  pie: 'C11, D15, D18, E02',
}
