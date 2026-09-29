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
// sus dos filas (la que queda, la que sale y qué fecha decidió); V12 los reporta.
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
import Banda from '../Banda.jsx'

// Título, pie y `meta` comparten las cifras, calculadas acá a nivel de módulo para que
// ninguna copia las escriba a mano.
const V = D2.vistas.V07
const DC13 = D2.decisiones.find((d) => d.id === 'DC-13')
const DC06 = D2.decisiones.find((d) => d.id === 'DC-06')
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

// (28/09) DC-13 no espera nada de Casa Óga: delegó el criterio (consulta 7) y con cualquiera de las
// filas ninguna tasa cambia. Los dos casos se le reportan en V12.
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
  dc: 'DC-13',
  corto: 'Ofertas por campaña',
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
    // (25/09, pedido del usuario: qué valor mirar) En --acc solo la oferta cuya base cambia con
    // DC-13 (los envíos que suma el dedupe caen ahí); las demás en gris.
    enfasis: o.antes.n !== o.despues.n,
    nota: o.antes.n !== o.despues.n
      ? `${entero(o.antes.n)} → ${entero(o.despues.n)} envíos`
      : (w >= 800 ? `${entero(o.despues.n)} envíos` : undefined),
  }))

  // (25/09, regla del usuario) El par de envíos con oferta pasa a la banda de cifras, con DC-13 a
  // la derecha, solo en llano; los dos casos de DC-13 quedan en el title del par.
  // (25/09, pedido del usuario: una decisión por tarjeta) DC-06, el nivel Gold, pasa a V07b.
  const casos = V.casos.map((c) => { const l = lineaCaso(c); return `${l.id} ${l.texto}` }).join(' ') +
    ' Los dos casos se le reportan a Casa Óga (vista 12).'
  return (
    <section className="pant v07">
      <Banda dcs={[DC13]}>
        <div className="tarjeta e2-central" title={casos}>
          <span className="kpi-lbl"><span>Envíos con oferta</span></span>
          {/* El mismo indicador (envíos con oferta) sobre la misma base: par con flecha. */}
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Sin {V.casos.map((c) => c.id_campania).join(' ni ')}</span>
              <span className="par-val tabular e2-cifra">{entero(DC13.antes.valor)}</span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Duplicados resueltos</span>
              <span className="par-val tabular e2-cifra">{entero(DC13.despues.valor)}</span>
            </div>
          </div>
          <p className="e2-linea">
            {entero(V.envios_duplicados_por_join)} envíos más{todasIguales ? '; ninguna tasa cambia.' : ' en la base de conversión.'}
          </p>
        </div>
      </Banda>

      <div className="lienzo v07-cuerpo" style={{ gap: 'var(--e2-gap)' }}>
        <div className="tarjeta" style={{ flex: '1 1 0', minWidth: 0 }}
             title={SE_PISAN ? `Las ofertas convierten entre ${pct(TASA_MIN, 2)} y ${pct(TASA_MAX, 2)} y sus rangos se superponen: ninguna se distingue.` : undefined}>
          {/* (24/09) El rótulo es una frase: va en sans (.frase); el id queda en mono. */}
          <span className="kpi-lbl frase">
            <span>Conversión a 7 días por oferta, con su rango probable al 95 %</span>
            <b style={ID_MONO}>DC-13</b>
          </span>
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

      </div>

    </section>
  )
}
