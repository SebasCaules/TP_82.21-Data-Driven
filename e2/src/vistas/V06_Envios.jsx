// V06 — Envíos, consentimiento y bajas. Responde quién de los 800 clientes de mayor
// exposición (la lista que arma la campaña de retención) es contactable hoy.
//
// La composición de los 800 sale de D2.vistas.V06.lista_800 con la resta que pide
// CONTRACT_E2.md §3: 800 − contactables_consentimiento = sin consentimiento (terracota,
// bloqueante); contactables_consentimiento − contactables_sin_baja = con consentimiento
// pero con alguna baja registrada; el resto son los contactables_sin_baja de verdad, el
// único tramo con el que la campaña puede trabajar hoy (DC-04, DC-12).
//
// La barra se dibuja a mano con rects propios (no con `BarrasApiladas100`, que emite un solo
// <title> por FILA y acá hay una sola fila con tres tramos que necesitan el suyo): el tramo
// "con baja" es apenas 18 de 800 (2,3 %), demasiado angosto para llevar rótulo adentro sin
// pisar al vecino, así que su identidad queda en su trama propia, en el <title> nativo y en
// su rótulo afuera. (24/09) Ese rótulo pasa a la fila de encabezados, arriba del tramo
// («Con baja · 18»): anclado al borde derecho de la barra y con una línea guía de 1 px quedaba
// debajo del bloque «Sin consentimiento» y se leía como su pie (OMI-V06-2).
//
// El título compara dos listas, no dos cortes de la misma (24/09: este comentario decía «la
// MISMA lista», y no lo es; FOR-V06-1): el 568 es
// D2.anclas["contactables 800"], el cálculo de C11 tal como cerró el E1, con la lista armada
// ANTES de unir identidades (DC-04); el 549 es lista_800.contactables_sin_baja, la lista de
// hoy, armada después de DC-04 y filtrada por bajas (DC-12). El 567
// (contactables_consentimiento, la lista de hoy sin filtrar bajas) es el escalón intermedio
// que explica por qué el título no dice "568 → 567": la cadena de la tarjeta de la barra lo
// hace explícito para que nadie lea el 568 → 549 como un solo movimiento. El 568 no se marca
// sobre la barra: caería dentro del terracota y diría que 568 de ESTAS 800 personas eran
// contactables (FOR-V06-1).
//
// (24/09) La vista se ordena alrededor de la pregunta (REL-V06-1). La cadena 568 → 567 → 549,
// que es lo que afirma el título, va al tamaño del par y no más chica que las cifras de la
// derecha (VIS-V06-1). Arriba a la derecha, los envíos a clientes que hoy figuran sin
// consentimiento (OMI-V06-1), en terracota y con la misma trama del tramo de la barra; debajo,
// las bajas en sus dos usos con ParDoble: 1.211 y 812 no son un antes y un después, las dos
// siguen en uso (NAR-V06-1, FOR-TRANSVERSAL-1). La tabla del embudo se va: con los envíos
// repetidos fuera casi no se mueve, y eso entra en una frase bajo el par de envíos (DC-05).
// Todas las cifras, años y fechas de los textos salen de D2.

import { Lienzo, Tramas } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta } from '../formato.js'
import { useEscalaTexto } from '../escala.js'
import ParDoble from '../ParDoble.jsx'
import TarjetaDecision from '../TarjetaDecision.jsx'

// Todo lo que el h1 y `meta.titulo` necesitan se calcula acá afuera, a nivel de módulo: son
// el mismo texto (regla dura del contrato de vistas) y D2 es estático, así que no hace falta
// esperar al render para tenerlo.
const infoMeta = D2.meta
const v06 = D2.vistas.V06
const dc05 = D2.decisiones.find((d) => d.id === 'DC-05')
const dc12 = D2.decisiones.find((d) => d.id === 'DC-12')

const { envios, embudo, bajas, sin_consentimiento: sinConsEnvios } = v06

// (24/09) El tamaño de la lista no viaja como número: está en el nombre del campo del
// contrato (lista_800, CONTRACT_E2.md §3). Se lee de ahí para no escribir el 800 a mano.
const CLAVE_LISTA = Object.keys(v06).find((k) => /^lista_\d+$/.test(k))
const TAM_LISTA = Number(CLAVE_LISTA.slice('lista_'.length))
const lista800 = v06[CLAVE_LISTA]

// 200 id_envio repetidos que el dedupe de DC-05 saca de la base (23.729 → 23.529).
const repetidos = envios.antes - envios.despues

// (24/09) El año de las bajas que quedan fuera del análisis sale de la clave del payload
// (bajas["2026"]), y los años de las campañas, de las fechas del archivo en D2.meta.
const ANIO_BAJAS = Object.keys(bajas).find((k) => /^\d{4}$/.test(k))
const bajasFueraCorte = bajas[ANIO_BAJAS]
const archCampanias = infoMeta.archivos.find((a) => a.nombre.startsWith('Campanias_marketing'))
const aniosCampanias = `${archCampanias.desde.slice(0, 4)}-${archCampanias.hasta.slice(0, 4)}`

// El 568 del E1 (C11) es una fila del registro de cifras, no un número escrito a mano: sale
// de D2.anclas, que es donde el pipeline lo deja para que el tablero lo cite sin copiarlo.
const anclaContactables800 = D2.anclas.find((a) => a.nombre === 'contactables 800').valor
const conConsentimiento = lista800.contactables_consentimiento
const sinBaja = lista800.contactables_sin_baja

// Composición de la lista de 800, tal como pide CONTRACT_E2.md §3.
const sinConsentimiento = TAM_LISTA - conConsentimiento
const conBaja = conConsentimiento - sinBaja

// (24/09) El embudo en una frase: una etapa que no cambia da una sola cifra, la que cambia
// da «antes → después». El adjetivo sale de la diferencia más grande, en puntos.
const ETAPAS = [
  { etq: 'abre', clave: 'abre_pct', dec: 1 },
  { etq: 'clic', clave: 'clic_pct', dec: 1 },
  { etq: 'compra a 7 días', clave: 'compra_pct', dec: 2 },
]
const tramoEmbudo = ({ etq, clave, dec }) => {
  const a = pct(embudo.antes[clave], dec)
  const d = pct(embudo.despues[clave], dec)
  return a === d ? `${etq} ${d}` : `${etq} ${a.replace(' %', '')} → ${d}`
}
const saltoEmbudo = Math.max(...ETAPAS.map((e) => Math.abs(embudo.despues[e.clave] - embudo.antes[e.clave])))
const movEmbudo = saltoEmbudo === 0 ? 'no se mueve' : saltoEmbudo < 0.5 ? 'casi no se mueve' : 'cambia'
// El espacio antes de «%» no parte renglón: «35,1 / %» se leía como dos datos.
const FRASE_EMBUDO = `Con los ${entero(repetidos)} repetidos fuera, el embudo ${movEmbudo}: `
  + ETAPAS.map(tramoEmbudo).join(', ').replaceAll(' %', '\u00a0%')

// (24/09) Un id de decisión dentro de una frase no se parte en «(DC- / 04)» al cambiar de
// renglón: la regla de estilos_e2.css (D1-02) cubre solo el <b> de los rótulos.
const Id = ({ children }) => <span style={{ whiteSpace: 'nowrap' }}>{children}</span>

// Las cifras de la derecha van un escalón más chicas que la cadena de la respuesta
// (VIS-V06-1): el ojo tiene que llegar primero al 549.
const SECUNDARIA = 'clamp(17px, 1.55vw, 23px)'

// El 200 y las 399 bajas quedan en sus tarjetas: el título dice solo lo que cambia la campaña.
const TITULO = `De la lista de ${entero(TAM_LISTA)} se puede escribir a ${entero(sinBaja)}, `
  + `no a los ${entero(anclaContactables800)} del E1`

// Medidas de la barra según k: el renglón de rótulos arriba, la barra y un margen abajo.
// (24/09) La barra crece con la pantalla (92 px de alto hasta 1280, ~180 a 1920): con 92 fijos
// la respuesta no escalaba y a 1920 la tarjeta quedaba medio vacía (VIS-V06-1). La caja del
// Lienzo mide lo que la barra necesita (caja): más alta, el aire sobrante quedaba entre la
// barra y la cadena, que es lo que el alto fijo de 7196bd0 quería evitar.
function medidasBarra(k) {
  const fRot = 11.5 * k
  const padTop = Math.round(fRot + 10)
  const pie = 6
  const altoMax = Math.round(92 * k * k)
  return { fRot, padTop, pie, altoMax, caja: padTop + altoMax + pie }
}

/** Barra de composición de los 800, con un tramo por estado y un <title> propio en cada uno
 *  (etiqueta, valor y porcentaje): lo que `BarrasApiladas100` no da porque agrupa toda la
 *  fila en un solo <title>. El tramo angosto ("con baja") no lleva rótulo adentro: se marca
 *  con su propia trama y un rótulo arriba, en la fila de encabezados, así su identidad no
 *  depende solo del color (regla dura 2 del DISENO.md). (24/09) La letra crece con k, la
 *  cifra de adentro con el ancho, y si la caja queda más alta que la barra (el piso de 110 px
 *  no manda casi nunca), la barra se centra en vez de dejar el aire abajo. */
function BarraContactables800({ w, h, k }) {
  if (!w || !h) return null
  const total = sinBaja + conBaja + sinConsentimiento
  const tramos = [
    { clave: 'Contactables sin baja', valor: sinBaja, fill: 'var(--acc)', tinta: '#fff', ancla: 'start' },
    { clave: 'Con consentimiento, con baja', corto: 'Con baja', valor: conBaja, fill: 'url(#trama)', tinta: 'var(--mut2)' },
    { clave: 'Sin consentimiento', valor: sinConsentimiento, fill: 'url(#trama-exc)', tinta: '#fff', ancla: 'end' },
  ]

  const { fRot, padTop, pie, altoMax } = medidasBarra(k)
  const alto = Math.max(46, Math.min(h - padTop - pie, altoMax))
  const y = padTop + Math.max(0, Math.floor((h - pie - padTop - alto) / 2))
  let x = 0
  const segs = tramos.map((t) => {
    const share = t.valor / total
    const ws = Math.max(t.valor > 0 ? 3 : 0, share * w)
    const s = { ...t, x, w: ws, share }
    x += ws
    return s
  })
  const angosto = segs.find((s) => s.share < 0.06 && s.share > 0)
  // Ancho estimado de un rótulo en negrita (0,6 × cuerpo por carácter: se pasa, no se queda
  // corto), para no pisar el rótulo del vecino.
  const anchoEst = (txt, f) => txt.length * f * 0.6
  const fVal = Math.min(20, Math.max(13.5, w / 45))

  // «Con baja · 18» centrado sobre su tramo; si pisa el rótulo del tramo de al lado, se ancla
  // al borde derecho del tramo angosto.
  let rotAngosto = null
  if (angosto) {
    const txt = `${angosto.corto} · ${entero(angosto.valor)}`
    const cx = angosto.x + angosto.w / 2
    const media = anchoEst(txt, fRot) / 2
    const vecino = segs.find((s) => s.ancla === 'end' && s.share >= 0.06)
    const bordeVecino = vecino ? vecino.x + vecino.w - anchoEst(vecino.clave, fRot) - 8 : w
    const centrado = cx + media <= Math.min(bordeVecino, w)
    rotAngosto = { txt, x: centrado ? cx : angosto.x + angosto.w, ancla: centrado ? 'middle' : 'end' }
  }

  return (
    <svg width={w} height={h} role="img"
         aria-label={`Composición de los ${entero(total)}, después de DC-04 y DC-12. `
           + segs.map((s) => `${s.clave} ${entero(s.valor)}, ${pct(s.share * 100)}`).join(' · ')}
         style={{ display: 'block' }}>
      <Tramas />

      {segs.map((s) => s.w > 0 && (
        <g key={s.clave}>
          <title>{`${s.clave} · ${entero(s.valor)} · ${pct(s.share * 100)} de ${entero(total)}`}</title>
          <rect x={s.x} y={y} width={Math.max(1, s.w - (s.x + s.w < w ? 2 : 0))} height={alto}
                fill={s.fill} />
        </g>
      ))}

      {segs.map((s) => {
        if (s.share < 0.06 || s.w <= 0) return null
        const xRot = s.ancla === 'end' ? s.x + s.w : s.x
        return (
          <text key={'r' + s.clave} x={xRot} y={y - 8} fontSize={fRot} fontWeight={600}
                fill={s.ancla === 'end' ? 'var(--terra)' : 'var(--ink)'}
                textAnchor={s.ancla === 'end' ? 'end' : 'start'}>{s.clave}</text>
        )
      })}
      {rotAngosto && (
        <text x={rotAngosto.x} y={y - 8} fontSize={fRot} fontWeight={600} fill="var(--mut2)"
              textAnchor={rotAngosto.ancla} className="tabular">{rotAngosto.txt}</text>
      )}
      {segs.map((s) => {
        const texto = `${entero(s.valor)} · ${pct(s.share * 100)}`
        if (s.share < 0.06 || s.w < anchoEst(texto, fVal) + 18) return null
        const xTxt = s.ancla === 'end' ? s.x + s.w - 9 : s.x + 9
        return (
          <text key={'v' + s.clave} x={xTxt} y={y + alto / 2} fontSize={fVal} fontWeight={700}
                fill={s.tinta} textAnchor={s.ancla === 'end' ? 'end' : 'start'}
                dominantBaseline="central" className="tabular">{texto}</text>
        )
      })}
    </svg>
  )
}

export default function V06Envios() {
  const k = useEscalaTexto()
  return (
    <section className="pant v06">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(8px, 1.3vh, 16px)' }}>
        <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1.6 1 0', minHeight: 0 }}>
          {/* (24/09) Rótulo, barra, cadena y nota van juntos y centrados en el alto de la
              tarjeta: con el alto fijo de 150 px, a 1920 la tarjeta quedaba más de la mitad
              vacía abajo. La caja de la barra crece con la pantalla (medidasBarra). */}
          <div className="tarjeta" style={{ flex: '1.5 1 0', minWidth: 0, justifyContent: 'center' }}>
            <span className="kpi-lbl frase">
              A quién se le puede escribir · los {entero(TAM_LISTA)} clientes de mayor exposición
            </span>
            <div style={{ flex: '0 1 auto', height: medidasBarra(k).caja, minHeight: 110, display: 'flex', marginTop: 4 }}>
              <Lienzo>
                {({ w, h }) => <BarraContactables800 w={w} h={h} k={k} />}
              </Lienzo>
            </div>
            <div className="ban-par" style={{ gap: 'clamp(7px, 1vw, 14px)' }}>
              <div className="par-item par-antes">
                <span className="par-lbl">Entregable 1</span>
                <span className="par-val tabular">{entero(anclaContactables800)}</span>
              </div>
              <span className="par-flecha" aria-hidden="true">→</span>
              <div className="par-item par-antes">
                <span className="par-lbl">identidad unida (DC-04)</span>
                <span className="par-val tabular">{entero(conConsentimiento)}</span>
              </div>
              <span className="par-flecha" aria-hidden="true">→</span>
              <div className="par-item par-despues">
                <span className="par-lbl">sin bajas (DC-12)</span>
                <span className="par-val tabular">{entero(sinBaja)}</span>
              </div>
            </div>
            <span className="kpi-sub">
              {entero(anclaContactables800)}: Entregable 1, lista armada antes de unir
              identidades · {entero(conConsentimiento)}: con consentimiento, identidad unida{' '}
              <Id>(DC-04)</Id> · {entero(sinBaja)}: además sin baja pedida, {entero(conBaja)} menos{' '}
              <Id>(DC-12).</Id> La lista sale del riesgo al {fechaCorta(infoMeta.corte_ref)}, en revisión.
            </span>
          </div>

          <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vh, 18px)', minWidth: 0 }}>
            {/* (24/09) Envíos a clientes que hoy figuran sin consentimiento (D18): el dato que
                conecta la pregunta con el riesgo de seguir escribiendo mal. «Hoy» porque el
                cruce es con acepta_marketing tal como está ahora, no al momento del envío. */}
            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'center' }}>
              <span className="kpi-lbl frase" style={{ color: 'var(--terra)', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <svg width="14" height="14" data-icono="true" aria-hidden="true"
                     style={{ flexShrink: 0, marginTop: 2 }}>
                  <Tramas />
                  <rect width="14" height="14" fill="url(#trama-exc)" />
                </svg>
                <span>Envíos de campañas a clientes que hoy figuran sin consentimiento</span>
              </span>
              <div className="ban-par">
                <div className="par-item">
                  <span className="par-val tabular" style={{ fontSize: SECUNDARIA, color: 'var(--ink)' }}>
                    {entero(sinConsEnvios.n)}{' '}
                    <span className="par-unidad" style={{ fontSize: '.7em', color: 'var(--mut2)' }}>
                      de {entero(envios.despues)} envíos · {pct(sinConsEnvios.pct)}
                    </span>
                  </span>
                </div>
              </div>
              <span className="kpi-sub">
                Campañas {aniosCampanias} a clientes que hoy no aceptan marketing; la lista de
                contacto ya los deja afuera.
              </span>
            </div>

            {/* (24/09) Las bajas en sus dos usos, sin flecha: la lista de contacto sigue
                filtrando las 1.211 y el análisis de compras usa las 812 (DISENO.md regla 3). */}
            <div className="tarjeta" style={{ flex: '1 1 0', justifyContent: 'center' }}>
              <span className="kpi-lbl frase">Bajas: dos usos del mismo registro</span>
              <ParDoble
                sensibilidad={false}
                lblRef="Filtro de contacto"
                valRef={<span className="par-val tabular" style={{ fontSize: SECUNDARIA }}>{entero(bajas.total)}</span>}
                lblSens="Análisis de compras"
                valSens={<span className="par-val tabular" style={{ fontSize: SECUNDARIA }}>{entero(bajas.hasta_corte)}</span>}
                style={{ flex: '0 0 auto', marginTop: 4 }}
              />
              <span className="kpi-sub">
                Las {entero(bajasFueraCorte)} pedidas en {ANIO_BAJAS} sacan al cliente de la lista,
                pero no entran al análisis de compras (no hay ventas de {ANIO_BAJAS}) · <Id>DC-12</Id>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px, 1.8vw, 30px)', flex: '1 1 0', minHeight: 0 }}>
          {/* (24/09) DC-05 en una tarjeta compacta: el par de envíos y el embudo en una frase. */}
          <div className="tarjeta" style={{ flex: '1.3 1 0', minWidth: 0 }}>
            <span className="kpi-lbl"><span>Campañas: envíos repetidos</span><b>DC-05</b></span>
            <div className="ban-par">
              <div className="par-item par-antes">
                <span className="par-lbl">Antes</span>
                <span className="par-val tabular" style={{ fontSize: SECUNDARIA }}>{entero(envios.antes)}</span>
              </div>
              <span className="par-flecha" aria-hidden="true">→</span>
              <div className="par-item par-despues">
                <span className="par-lbl">Después</span>
                <span className="par-val tabular" style={{ fontSize: SECUNDARIA }}>{entero(envios.despues)}</span>
              </div>
            </div>
            <span className="kpi-sub">{FRASE_EMBUDO}</span>
          </div>

          <TarjetaDecision dc={dc05} style={{ flex: '1 1 0', minWidth: 0 }} />
          <TarjetaDecision dc={dc12} style={{ flex: '1 1 0', minWidth: 0 }} />
        </div>
      </div>

      <p className="pie-vista">
        corte <b>{fechaCorta(infoMeta.corte_ref)}</b> · base: los <b>{entero(TAM_LISTA)}</b> clientes
        de mayor exposición, identidad unida (<b>E02</b>) · envíos <b>{entero(envios.despues)}</b>{' '}
        (<b>D15</b>) · sin consentimiento (<b>D18</b>) · fila <b>C11</b> · <b>D03</b> (bajas)
      </p>
    </section>
  )
}

export const meta = {
  id: 'V06',
  corto: 'Envíos y bajas',
  titulo: TITULO,
  pie: 'C11, E02, D15, D18, D03 (bajas)',
}
