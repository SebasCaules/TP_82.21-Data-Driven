// D0 — la vista 01. Sigue la direccion 5a del mockup ("tres bandas horizontales"): se lee de
// arriba a abajo como una frase — la cifra, contra que se compara, de donde viene — y todo
// lo que NO reacciona a los filtros vive abajo y esta rotulado como tal.
//
// Lo que 5a corrige de la version anterior, y por que tenia razon:
//   - La columna izquierda apilaba cuatro cifras de universos distintos (exposicion anual,
//     % de clientes, facturacion historica acumulada y sensibilidad del umbral) con el mismo
//     peso visual, y repetia ARS 94,9 M dos veces.
//   - La serie de recompra ocupaba el 60 % de la pantalla y es la unica pieza que no responde
//     al corte ni a los filtros: lo mas grande era lo menos accionable.
//   - El titulo afirmaba el 46,4 % y la cifra de abajo lo repetia. Ahora el titulo da la
//     LECTURA y no el numero, que esta doce pixeles mas abajo en cuerpo 40.
//   - La sensibilidad del umbral baja a nota al pie, que es su rango real de importancia.
//
// Nota sobre la ficha F07 (dec-D11): el BAN se reparte en Z2 (la cifra) y Z3 (las dos bases).
// La barra de progreso del F07 decia lo mismo que Z3 dice rotulado, y su tabla de tres filas
// es Z3. La ficha no se rediseño: se desarmo en las zonas que 5a define.

import Semaforo, { estadoRecompra } from '../Semaforo.jsx'
import { Lienzo, Linea } from '../graficos.jsx'
import { entero, fechaCorta, meta, millones, pct, pesos, series } from '../agregacion.js'

// El titulo dice la lectura, no la cifra. La escala se deriva del mismo numero que Z2
// muestra, asi que con un filtro puesto sigue siendo cierta.
const LECTURA = [
  [20, 'Una porción chica del gasto anual'],
  [38, 'Cerca de un tercio del gasto anual'],
  [55, 'Casi la mitad del gasto anual'],
  [70, 'Más de la mitad del gasto anual'],
  [90, 'La mayor parte del gasto anual'],
  [Infinity, 'Casi todo el gasto anual'],
]

/** Las tres zonas del semaforo de la Parte D §2.1, como franjas del grafico. El estado deja
 *  de ser una pastilla suelta y pasa a ser POSICION: la linea cae adentro de una de las tres. */
export function zonasRecompra(valor) {
  const [lo] = meta.meta_recompra
  const cerca = lo - 1
  const f = (v) => `${v.toFixed(1).replace('.', ',')} %`
  const zs = [
    { etiqueta: 'Fuera de meta', desde: 0, hasta: cerca, tono: 'var(--sem-fuera)', rango: `menos de ${f(cerca)}` },
    { etiqueta: 'Por debajo', desde: cerca, hasta: lo, tono: 'var(--sem-cerca)', rango: `${f(cerca)} a ${f(lo)}` },
    { etiqueta: 'En meta', desde: lo, hasta: Infinity, tono: 'var(--sem-meta)', rango: `${f(lo)} o más` },
  ]
  const i = valor == null ? -1 : valor >= lo ? 2 : valor >= cerca ? 1 : 0
  return zs.map((z, k) => ({ ...z, activa: k === i }))
}

export default function D0({ info, irALista }) {
  const recompra = series.recompra_trimestral
    .filter((r) => r.tasa != null)
    .map((r) => ({ etiqueta: r.trimestre.replace('20', "\'"), valor: r.tasa * 100 }))
  const ultima = recompra[recompra.length - 1]
  const [capLo, capHi] = meta.capacidad_contacto
  const estado = ultima ? estadoRecompra(ultima.valor, meta.meta_recompra) : 'fuera'

  const sujeto = LECTURA.find(([tope]) => info.pct < tope)[1]
  const pctHist = info.facturacion ? (100 * info.facturacionRiesgo) / info.facturacion : 0
  const pctClientes = info.clientes ? (100 * info.enRiesgo) / info.clientes : 0
  const cobLo = info.enRiesgo ? Math.min(100, (100 * capLo) / info.enRiesgo) : 0
  const cobHi = info.enRiesgo ? Math.min(100, (100 * capHi) / info.enRiesgo) : 0
  const marcaPrevia = info.exposicionPrevia != null && info.baseAnualizada
    ? (100 * info.exposicionPrevia) / info.baseAnualizada
    : null

  return (
    <section className="pant cab-1 v01">
      {/* Z1 — la lectura, sin repetir la cifra de abajo */}
      <h1 className="titulo">{sujeto} de la base está en clientes sin compra reciente</h1>

      <div className="lienzo v01-cuerpo">
        {/* Z2 y Z3 comparten superficie: la respuesta y su encuadre son una sola idea.
            El riel de proporcion es el de la ficha F07 (dec-D11), con su marca del corte
            anterior: dice de un vistazo que parte del total es la cifra, que es lo que un
            numero suelto no puede decir. */}
        <div className="tarjeta z-resp">
          <div className="z2">
            <span className="z2-lbl">Exposición anual en riesgo</span>
            <div className="z2-fila">
              <span className="z2-val">{pesos(info.exposicion)}</span>
              <span className="z2-nota">exposición,<br />no recupero</span>
            </div>

            <div className="ban-track z2-track">
              <i style={{ width: `${Math.min(100, info.pct)}%` }} />
              {marcaPrevia != null && (
                <span className="ban-mk" style={{ left: `${Math.min(100, marcaPrevia)}%` }}
                      aria-hidden="true" />
              )}
              <span className="ban-sc" style={{ left: 0 }}>0</span>
              <span className="ban-sc" style={{ right: 0 }}>
                {pesos(info.baseAnualizada)} anualizados
              </span>
              {marcaPrevia != null && (
                <span className="ban-sc z2-mk" style={{ left: `${Math.min(100, marcaPrevia)}%` }}>
                  corte anterior
                </span>
              )}
            </div>
            <div className="ban-scrow" />

            {/* Los tres datos que encuadran la cifra, cada uno con su rótulo y su valor en
                tinta: como renglón corrido de 10 px en gris no los leía nadie, y son los que
                dicen sobre qué base y a qué fecha vale el número de arriba. */}
            <div className="z2-base">
              <span><i>Base</i><b className="tabular">{entero(info.clientes)}</b>clientes</span>
              <span><i>Corte</i><b className="tabular">{fechaCorta(info.corte)}</b></span>
              <span><i>Moneda</i><b>pesos nominales</b></span>
            </div>
          </div>

          {/* Z3 — al costado y en columna: los tres apoyos puestos en fila abajo quedaban
              escondidos. Rotulados uno por uno porque 46,4 % y 47,8 % NO miden lo mismo, que
              era la confusion que 5a viene a resolver. */}
          <div className="z3">
            <Contra etq="Sobre el gasto anual" val={pct(info.pct)}
                    ap={`de ${pesos(info.baseAnualizada)}`} />
            <Contra etq="Sobre el histórico" val={pct(pctHist)}
                    ap={`de ${pesos(info.facturacion)} acumulados`} />
            <Contra etq="Clientes en riesgo" val={`${entero(info.enRiesgo)} / ${entero(info.clientes)}`}
                    ap={`${pct(pctClientes)} de la base con compra válida`} />
          </div>
        </div>

        {/* Z4 — contexto historico. Rotulado como contexto y con el alto que le corresponde:
            es la unica pieza que no responde a los controles de arriba. */}
        <div className="tarjeta z-serie">
          <div className="kpi-lbl z-serie-cab">
            <span className="z-serie-tit">Recompra a 90 días · María G. · mensual</span>
            <span className="z-global">Serie global · no usa corte ni filtros</span>
            <Semaforo estado={estado} tamano="grande" sufijo={pct(ultima ? ultima.valor : 0)}
                      de="recompra a 90 días" />
          </div>
          <Lienzo>
            {({ w, h }) => (
              <Linea
                serie={recompra} w={w} h={h}
                formato={(v) => `${v.toFixed(1).replace('.', ',')}%`}
                zonas={zonasRecompra(ultima ? ultima.valor : null)}
                tituloEje="% que recompra en 90 días"
              />
            )}
          </Lienzo>
        </div>

        {/* Z5 — puente a la operacion. El salto a la lista es un boton que dice a donde va:
            el drill-down por click en una barra sorprendia, este no. */}
        <div className="z-puente">
          <span className="z5-val tabular">{entero(info.enRiesgo)}</span>
          <span className="z5-txt">
            en riesgo contra una capacidad de {capLo} a {capHi} contactos por mes:
            cubre {pct(cobLo)} a {pct(cobHi)}
          </span>
          {irALista && (
            <button type="button" className="z5-ir" onClick={irALista}>
              Ver los {entero(info.enRiesgo)} en la lista →
            </button>
          )}
        </div>
      </div>

      {/* Z6 — la nota. Acá viven el proxy y la sensibilidad al umbral, que es su rango real
          de importancia: mueve la cifra 1,4 M entre 60 y 120 días. */}
      <p className="z-nota">
        {meta.proxy}. Sensibilidad al umbral:{' '}
        {info.sensibilidad
          ? info.sensibilidad.map((x) => `${x.umbral} d ${pesos(x.exposicion)}`).join(' · ')
          : '—'}. Sin modelo predictivo.
      </p>
    </section>
  )
}

/** Una de las tres comparaciones de Z3. */
function Contra({ etq, val, ap }) {
  return (
    <div className="z3-item">
      <span className="z3-etq">{etq}</span>
      <span className="z3-val tabular">{val}</span>
      <span className="z3-ap">{ap}</span>
    </div>
  )
}
