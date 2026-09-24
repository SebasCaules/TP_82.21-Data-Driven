// V07 · Campañas: ofertas y Gold — dos hallazgos de Contenido_Campanias.csv y Fidelizacion.csv.
//
// DC-13: CAMP004 y CAMP034 traen dos filas cada una en Contenido_Campanias.csv (join mal
// armado). El dedupe deja 23.529 envíos con oferta contra 22.614 de la base vieja, y con esa
// base corregida la tasa de conversión a 7 días por tipo de oferta se puede medir de nuevo.
// (24/09) El gráfico lleva una fila por oferta, ordenada por tasa, con la línea punteada de
// todas las ofertas juntas: las cinco tasas son iguales antes y después, así que el par
// antes/después de cada oferta duplicaba el alto sin agregar nada. El antes queda en el par
// de envíos y en la nota de Envío gratis, la única oferta donde cambia la base. La lectura
// «ninguna oferta se distingue» vuelve a la vista como nota bajo el par, y solo se escribe
// si los cinco rangos se pisan en el payload (SE_PISAN). CAMP034 no tiene ganador:
// fecha_envio y fecha_creacion empatan entre las dos filas, así que el criterio de DC-13 no
// decide (ver `casos[i].desempate` en el payload); la tarjeta de DC-13 cuenta cada caso con
// sus dos filas (la que queda, la que sale y qué fecha decidió) y el pedido de V12.
//
// DC-06: el segmento "Gold" que manda Marketing en las campañas no es el nivel del programa
// de fidelización. (24/09) 5.066 son ENVÍOS con la etiqueta "Gold" y 3 son SOCIOS Gold en
// Fidelizacion.nivel: no es el mismo indicador antes y después, así que el par va con
// ParDoble, las dos cifras en tinta y sin flecha (DISENO.md regla 3). El 30,1 % de
// coincidencia segmento-nivel sale de la vista y del pie: con las marginales observadas es
// lo que daría una etiqueta puesta al azar y suavizaba el hallazgo.

import { Lienzo, PuntosIC } from '../../../src/graficos.jsx'
import { entero, fechaCorta, pct } from '../formato.js'
import { D2 } from '../datos_e2.js'
import TarjetaDecision from '../TarjetaDecision.jsx'
import ParDoble from '../ParDoble.jsx'

// Título, pie y `meta` comparten las cifras, calculadas acá a nivel de módulo para que
// ninguna copia las escriba a mano.
const V = D2.vistas.V07
const DC13 = D2.decisiones.find((d) => d.id === 'DC-13')
const DC06 = D2.decisiones.find((d) => d.id === 'DC-06')
const DC14 = D2.decisiones.find((d) => d.id === 'DC-14')
const BASE_DESPUES = V.ofertas.reduce((s, o) => s + o.despues.n, 0)

// (24/09) La referencia del gráfico: la tasa de todas las ofertas juntas (compras sobre
// envíos con oferta). Va sin banda: el intervalo global deja afuera a la oferta más alta y a
// la más baja y se leería como una prueba de significancia (graficos.jsx, PuntosIC).
const COMPRAS = V.ofertas.reduce((s, o) => s + o.despues.compras, 0)
const TASA_TODAS = (100 * COMPRAS) / BASE_DESPUES

// Una fila por oferta, de la que más convierte a la que menos (24/09).
const ORDEN = [...V.ofertas].sort((a, b) => b.despues.tasa_pct - a.despues.tasa_pct)
const TASA_MIN = Math.min(...V.ofertas.map((o) => o.despues.tasa_pct))
const TASA_MAX = Math.max(...V.ofertas.map((o) => o.despues.tasa_pct))
// "Ninguna se distingue" solo si hay un valor que cae dentro de todos los rangos a la vez.
const SE_PISAN = Math.max(...V.ofertas.map((o) => o.despues.ic_lo)) <= Math.min(...V.ofertas.map((o) => o.despues.ic_hi))

// El conteo de casos del título sale del payload (24/09); en letras hasta cinco.
const EN_LETRAS = ['Ninguna', 'Una', 'Dos', 'Tres', 'Cuatro', 'Cinco']
const N_CASOS = EN_LETRAS[V.casos.length] ?? entero(V.casos.length)

// La afirmación "ninguna tasa cambia" solo se escribe si el payload la sostiene oferta por oferta.
const todasIguales = V.ofertas.every((o) => o.antes && o.antes.tasa_pct === o.despues.tasa_pct)
const TITULO = todasIguales
  ? `${N_CASOS} campañas duplicadas resueltas: ${entero(V.envios_duplicados_por_join)} envíos más y ninguna tasa cambia`
  : `${N_CASOS} campañas duplicadas resueltas: ${entero(V.envios_duplicados_por_join)} envíos más en la base de conversión`

// (24/09) Sin el 30,1 % (ver cabecera). La línea punteada del gráfico se explica acá.
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base ${entero(BASE_DESPUES)} envíos con oferta, ` +
  `duplicados resueltos (E03, E07); antes ${entero(DC13.antes.valor)} (D16) · línea punteada: todas las ` +
  `ofertas juntas, ${entero(COMPRAS)} compras en ${entero(BASE_DESPUES)} envíos · Gold: ` +
  `${entero(V.gold.envios)} envíos al segmento, ${entero(V.gold.socios)} socios Gold en el programa (D17) · ` +
  `rango probable: intervalo de Wilson al 95 %`

// El id de decisión en mono dentro de un rótulo .frase, como en el resto de las tarjetas.
const ID_MONO = { font: '600 var(--e2-rot)/1.2 var(--mono)', letterSpacing: '.07em' }

// El pedido de DC-13 a Casa Óga tal como lo lista V12, para que las dos vistas digan lo mismo
// (V12 pide confirmar los dos casos, no solo el empate).
const PEDIDO_V12 = D2.vistas.V12?.pedidos?.find((p) => p.id === DC13.id)
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// (24/09) Un caso de DC-13 en una línea, armada con las dos filas del payload: qué oferta
// queda, cuál sale y qué fecha decidió. Ningún caso se nombra en el código: el texto sale de
// comparar las fechas de la fila elegida con las de la descartada.
function lineaCaso(c) {
  const { elegida: e, descartada: d } = c
  const mismoEnvio = e.fecha_envio === d.fecha_envio
  const mismaCarga = e.fecha_creacion === d.fecha_creacion
  const carga = (f) => (mismaCarga ? '' : ` (cargada el ${fechaCorta(f.fecha_creacion)})`)
  const porque = c.desempate
    ? 'empatan las dos fechas y queda la primera fila del archivo'
    : mismoEnvio
      ? 'las dos tienen la misma fecha de envío y decide la carga más reciente'
      : 'queda la fila con la fecha de envío de la campaña'
  return {
    id: mismoEnvio ? `${c.id_campania}, enviada el ${fechaCorta(e.fecha_envio)}.` : `${c.id_campania}.`,
    texto: `Queda ${e.tipo_oferta}${carga(e)} y sale ${d.tipo_oferta}${carga(d)}: ${porque}.`,
  }
}

export const meta = {
  id: 'V07',
  corto: 'Campañas: ofertas y Gold',
  titulo: TITULO,
  pie: PIE,
}

export default function V07Campanias() {
  // Una fila por oferta con la tasa después (24/09). La nota "n envíos" va en todas las filas
  // solo si el svg es ancho; en Envío gratis va siempre, con el antes → después de su base,
  // porque ahí caen los envíos que suma el dedupe.
  const puntos = (w) => ORDEN.map((o) => ({
    etiqueta: o.tipo,
    valor: o.despues.tasa_pct,
    ic: [o.despues.ic_lo, o.despues.ic_hi],
    enfasis: true,
    nota: o.antes.n !== o.despues.n
      ? `${entero(o.antes.n)} → ${entero(o.despues.n)} envíos`
      : (w >= 800 ? `${entero(o.despues.n)} envíos` : undefined),
  }))

  return (
    <section className="pant v07">
      <h1 className="titulo">{TITULO}</h1>

      <div className="lienzo v07-cuerpo">
        {/* Columna izquierda: el gráfico, con el antes/después de DC-13 como encabezado */}
        <div className="tarjeta" style={{ flex: '1.6 1 0', minWidth: 0 }}>
          {/* (24/09) El rótulo es una frase: va en sans (.frase); el id queda en mono. */}
          <span className="kpi-lbl frase">
            <span>Conversión a 7 días por oferta: el punto es la tasa y la línea, su rango probable al 95 %</span>
            <b style={ID_MONO}>DC-13</b>
          </span>

          {/* El mismo indicador (envíos con oferta) sobre la misma base: par con flecha. */}
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Sin {V.casos.map((c) => c.id_campania).join(' ni ')}</span>
              <span className="par-val tabular">{entero(DC13.antes.valor)}<span className="par-unidad"> envíos</span></span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Duplicados resueltos</span>
              <span className="par-val tabular">{entero(DC13.despues.valor)}<span className="par-unidad"> envíos</span></span>
            </div>
          </div>

          {SE_PISAN && (
            <p className="e2-nota">
              Las ofertas convierten entre {pct(TASA_MIN, 2)} y {pct(TASA_MAX, 2)} y sus rangos se superponen:
              con esta base ninguna se distingue
              {DC14 ? <>; la tasa de éxito por acción se arma en el Entregable 3 ({DC14.id}).</> : '.'}
            </p>
          )}

          <Lienzo>
            {({ w, h }) => (
              <PuntosIC
                datos={puntos(w)}
                w={w} h={h}
                formato={(x) => pct(x, 2)}
                tituloEje="Conversión a 7 días (%)"
                anchoEtiqueta={104}
                referencia={{
                  valor: TASA_TODAS,
                  ic: [TASA_TODAS, TASA_TODAS],
                  rotulo: `todas las ofertas ${pct(TASA_TODAS, 2)}`,
                }}
              />
            )}
          </Lienzo>
        </div>

        {/* Columna derecha (24/09): una tarjeta por decisión. DC-13 cuenta sus dos casos en
            lugar de la regla general, que no eligió ninguno; DC-06 lleva el par Gold abajo. */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8, minWidth: 0 }}>
          <TarjetaDecision dc={DC13} sinJustificacion sinRegla style={{ flex: '0 0 auto' }}>
            {V.casos.map((c) => {
              const l = lineaCaso(c)
              return (
                <p key={c.id_campania} className="dec-just"><b>{l.id}</b> {l.texto}</p>
              )
            })}
            {PEDIDO_V12 && (
              <p className="dec-just"><b>Pendiente de Casa Óga (vista 12).</b> {cap(PEDIDO_V12.que)}.</p>
            )}
          </TarjetaDecision>

          {/* Las dos tarjetas miden lo que su texto y la columna las reparte (space-between):
              DC-13 arriba y DC-06 abajo, a ras del gráfico. Estirar la de DC-06 y bajar el par
              con marginTop auto dejaba, desde 1440 px, un bloque blanco de hasta 400 px entre
              la decisión y su evidencia. */}
          <TarjetaDecision dc={DC06} style={{ flex: '0 0 auto' }}>
            <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="kpi-lbl frase" style={{ marginBottom: 0 }}>"Gold" en la campaña y en el programa</span>
              <ParDoble
                sensibilidad={false}
                lblRef="Envíos al segmento Gold"
                valRef={<span className="par-val tabular">{entero(V.gold.envios)}</span>}
                lblSens="Socios Gold del programa"
                valSens={<span className="par-val tabular">{entero(V.gold.socios)}</span>}
                style={{ flex: '0 0 auto' }}
              />
              <p className="e2-nota">
                Una cifra cuenta envíos y la otra, personas: la diferencia no dice cuántos clientes
                están mal etiquetados.
              </p>
            </div>
          </TarjetaDecision>
        </div>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}
