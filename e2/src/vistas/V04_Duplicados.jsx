// V04 · Duplicados de cliente — qué cambia al unir identidades (DC-04, Clientes ·
// Identidad_resuelta). Compara la base de clientes antes y después del mapeo a
// id_cliente_canonico, sobre el mismo corte (CORTE_REF, 2025-12-31): menos clientes porque
// varios ids se funden en una sola persona, y el riesgo sube porque un cliente que antes
// contaba como dos (uno activo y uno inactivo) ahora es uno solo, y ese uno cae en riesgo.
//
// DISENO.md fija el lienzo de esta vista: tres pares grandes (clientes, riesgo, exposición)
// y BarrasH de personas por cantidad de ids. Los valores y el texto de la decisión salen
// enteros de D2 (CONTRACT_E2.md §3, vistas.V04 y decisiones DC-04): nada se escribe a mano.
//
// (24/09) Un solo vocabulario en pantalla: «número de cliente» para la base de antes y
// «persona» para la de después (antes convivían clientes, ids, números y registros). El par
// de riesgo lleva debajo los conteos de los que sale cada porcentaje (números de cliente
// antes, personas después), para que se vea por qué sube. «En revisión» pasa del pie al
// rótulo de las métricas que califica (las dos al mismo corte, así que califica la métrica
// y no solo el «después»), y la exposición dice debajo que no es recupero. La conciliación
// de E10 (665 = 312, 353 que sobran, 348 con compras) sale del cuerpo al pie. El gráfico
// sigue siendo BarrasH: el que dibuja el mecanismo (resto / grupo contado por número /
// grupo contado como persona) necesita vistas.V04.grupo y .resto, que el payload no trae.
// (24/09) El «Por qué» de DC-04 se escribe acá y no sale del payload: el de D2 («un duplicado
// se ve como cliente en riesgo») daba a entender que el riesgo baja, al lado de un título
// que dice que sube. Es un puente hasta que el pipeline traiga justificacion_llano.

import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import { D2 } from '../datos_e2.js'
import { entero, pct, fechaCorta } from '../formato.js'
import Banda from '../Banda.jsx'
import { useEscalaTexto } from '../escala.js'

const V = D2.vistas.V04
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')
// Las vistas a las que remite el pie salen de la decisión que cada una muestra (el orden del
// riel es V01..V12, así que el número es el del id): DC-09, la cobertura; DC-10, los precios.
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const DC10 = D2.decisiones.find((d) => d.id === 'DC-10')
// «vista 8» con espacio duro: el número no queda solo al principio de un renglón.
const vista = (dc) => `vista\u00a0${Number(dc.vista.slice(1))}`

const TOTAL_PERSONAS = V.personas_por_n_ids.reduce((s, p) => s + p.personas, 0)
const TOTAL_IDS = V.personas_por_n_ids.reduce((s, p) => s + p.n_ids * p.personas, 0)

// 5.978 − 348 ≠ 5.634 (auditoría T-08, CX-04): el mapeo a id_cliente_canonico no solo funde
// ids con actividad propia en otro cliente, también suma a la base ids canónicos que no
// tenían compra propia y antes no contaban como cliente. N sale de D2 cuando el payload ya
// trae la clave; si todavía no la trae, se despeja de la misma identidad contable.
const CANONICOS_SIN_COMPRA = V.canonicos_sin_compra_propia
  ?? (V.despues.clientes - V.antes.clientes + V.duplicados_con_actividad)

// (24/09) Más corta, sin perder la cuenta: la fórmula se queda porque el +N es a propósito,
// y va con espacios duros para que no se parta en dos renglones.
const CUENTA = [entero(V.antes.clientes), '−', entero(V.duplicados_con_actividad), '+',
  entero(CANONICOS_SIN_COMPRA), '=', entero(V.despues.clientes)].join('\u00a0')
const NOTA_CLIENTES = `${entero(V.duplicados_con_actividad)} números con compras se unen a su `
  + `persona y entran ${entero(CANONICOS_SIN_COMPRA)} personas que solo compraban con otro `
  + `número: ${CUENTA}`

// (24/09) Por qué sube el porcentaje: la base de la tasa (los clientes con 3 compras o más)
// baja más que los que están en riesgo. Antes se cuentan números de cliente; después,
// personas. Sin «N menos»: la mayoría de los que dejan de contar en riesgo son números
// repetidos de gente que sigue en riesgo.
const NOTA_RIESGO = `${entero(V.antes.en_riesgo)} números en riesgo de ${entero(V.antes.elegibles)} `
  + `→ ${entero(V.despues.en_riesgo)} personas de ${entero(V.despues.elegibles)}, con 3 compras o más`

// La salvedad de la exposición va al lado de la cifra y el pie la repite. Los pesos se
// califican como en el E1 (8640faf): del extracto, sin afirmar «corrientes», porque la
// serie de precios no sigue al IPC (DC-10).
const NOTA_EXPOSICION = 'Facturación proyectada de los clientes en riesgo, no es recupero; '
  + `pesos del extracto, sin ajustar por inflación (${vista(DC10)})`

// Personas por cantidad de números: «276 con 2, 31 con 3, 5 con 4».
const REPARTO = V.personas_por_n_ids.map((p) => `${entero(p.personas)} con ${p.n_ids}`).join(', ')

// El título dice el hallazgo con la cifra (duplicados_con_actividad) y el corrimiento del
// riesgo (antes.pct → despues.pct), calculados desde D2: si el payload cambia, el título
// cambia solo. (24/09) «números de cliente», no «clientes»: lo que se une son números.
const TITULO = `Unir ${entero(V.duplicados_con_actividad)} números de cliente duplicados sube el `
  + `riesgo de ${pct(V.antes.pct)} a ${pct(V.despues.pct)}`

// (24/09) Una sola constante para meta.pie y la pantalla, así no divergen.
// Entra en dos renglones a 1152: la cobertura se dice como en la regla 4 de DISENO.md.
const PIE = `riesgo en revisión por la cobertura de 2025 (${vista(DC09)}) · `
  + `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${entero(V.antes.clientes)} números de cliente · `
  + `E10: ${entero(TOTAL_IDS)} números = ${entero(TOTAL_PERSONAS)} personas; de los `
  + `${entero(TOTAL_IDS - TOTAL_PERSONAS)} que sobran, ${entero(V.duplicados_con_actividad)} tenían `
  + `compras · registro: D22; DC-09`

export const meta = {
  id: 'V04',
  dc: 'DC-04',
  corto: 'Duplicados de cliente',
  titulo: TITULO,
  pie: PIE,
}

// (25/09, regla del usuario) La decisión va a la derecha de la banda de cifras, solo en llano
// (sale el «Por qué» propio). En la banda entra un par: el riesgo, que es el título; la cuenta
// de clientes pasa al encabezado del gráfico y la exposición queda para la vista 10, que la
// muestra con su salvedad.
export default function V04Duplicados() {
  // Tope de alto del gráfico: crece con la pantalla (k entero, hasta 1,4; ver abajo).
  const k = useEscalaTexto()
  const tope = Math.round((3 * 80 + 56) * k)
  // (25/09, pedido del usuario: no se entendía qué mirar) La barra que manda, la de las personas
  // con dos números (el grueso de los duplicados), va en --acc y con «personas»; las otras en gris.
  const mayor = Math.max(...V.personas_por_n_ids.map((p) => p.personas))
  const datosBarras = V.personas_por_n_ids.map((p) => ({
    etiqueta: `con ${p.n_ids} números`,
    valor: p.personas,
    enfasis: p.personas === mayor,
    sufijo: p.personas === mayor ? 'personas' : undefined,
  }))

  return (
    <section className="pant v04">
      <Banda dcs={[DC04]}>
        <div className="tarjeta e2-central" title={`${NOTA_RIESGO}. ${NOTA_EXPOSICION}.`}>
          <span className="kpi-lbl"><span>Clientes en riesgo</span><b className="e2-tag">en revisión</b></span>
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Antes</span>
              <span className="par-val tabular e2-cifra">{pct(V.antes.pct)}</span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Después</span>
              <span className="par-val tabular e2-cifra">{pct(V.despues.pct)}</span>
            </div>
          </div>
          <p className="e2-linea">
            {`${entero(V.antes.en_riesgo)} de ${entero(V.antes.elegibles)} números → `}
            {`${entero(V.despues.en_riesgo)} de ${entero(V.despues.elegibles)} personas`}
          </p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <span className="kpi-lbl frase">
          <span>Personas con más de un número de cliente</span>
          <b className="tabular" title={`${NOTA_CLIENTES}. ${entero(TOTAL_IDS)} números de cliente son ${entero(TOTAL_PERSONAS)} personas: ${REPARTO}`}>
            {entero(V.antes.clientes)} números → {entero(V.despues.clientes)} personas
          </b>
        </span>
        {/* tope de alto: a 1920 las tres barras quedaban de 128 px cada una. (24/09) El tope
            crece con la pantalla (k entero), para que el gráfico llene más la tarjeta, y el
            gráfico va pegado a su subtítulo: el blanco que sobra queda abajo. */}
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope,
                      marginTop: 'clamp(6px, 1.6vh, 20px)',
                      display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH
                datos={datosBarras} w={w} h={h}
                formato={entero}
                anchoEtiqueta={Math.round(150 * k)}
                tituloEje="Personas"
              />
            )}
          </Lienzo>
        </div>
      </div>

    </section>
  )
}
