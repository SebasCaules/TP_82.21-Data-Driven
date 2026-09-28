// V01 — Resumen. Primera vista del riel.
//
// (25/09) Hasta el 24/09 la vista era la tabla de las 15 decisiones a todo el cuerpo: quince
// filas de dos renglones que el directorio no iba a leer, puestas en la banda donde el layout de
// la cátedra pone las tarjetas (clase 4: filtros, tarjetas, gráficos y, al final, la tabla de
// detalle; wiki/conceptos/diseno-de-dashboard.md). Ahora arriba va la respuesta: el título y tres
// tarjetas, el tope de la cátedra: la cifra central, su sensibilidad y los pedidos a Casa Óga.
// Debajo, las 15 decisiones como fichas de una o dos palabras, agrupadas por lo que hacen con la
// cifra central con el mismo corte que V10 (DC-04, DC-09 y DC-08; «las otras 12 no cambian esta
// cifra»). La tabla de antes pasa al detalle, detrás de «Ver en detalle»: el directorio no la
// necesita para seguir la presentación y la cátedra la tiene a un clic.
//
// (25/09, segunda pasada, pedido del usuario: más contraste y menos texto.) Cada tarjeta dice un
// rótulo, una cifra y a lo sumo una frase de seis palabras; la de la cifra central va en negativo
// (tinta de fondo, cifra en blanco) y las fichas que la afectan también, para que el ojo las una.
// Salen la exposición, las frases de apoyo, la leyenda de estados, el id y el número de vista de
// cada ficha: todo eso sigue en el title de cada pieza, en el detalle y en las vistas 3, 10 y 12.
//
// Cada ficha lleva a la vista de su decisión; las cuatro sin vista propia (DC-01, DC-03, DC-07 y
// DC-14) abren el detalle con su fila marcada. Ninguna cifra se escribe a mano: todo sale de
// D2.vistas.V10, V03, V12 y D2.decisiones. Los nombres cortos son texto de la vista, no datos; una
// decisión sin nombre corto muestra su hallazgo.
//
// Detalle (24/09, sin cambios): la tabla con el estado en una pastilla propia, porque "aplicada"
// cambia un número, "declarada" no cambia nada y solo se deja por escrito, y "pendiente del
// negocio" espera un archivo que Casa Óga todavía no dio. "A confirmar" es una decisión aplicada
// con un pedido abierto en V12 (desde el 28/09, solo DC-09): ya corre en el cálculo, pero Casa Óga
// todavía no explicó la causa (el criterio lo delegó al equipo, consulta 2). La regla vive en estados.js, que también usa la tarjeta de decisión de cada
// vista. La pastilla NO es <Semaforo> ("EN META / POR DEBAJO / FUERA DE META"): esos rótulos
// hablan de una meta que la vista no tiene.
import { useState } from 'react'
import { fechaCorta, mesCorto, pct } from '../formato.js'
import { D2 } from '../datos_e2.js'
import { ESPERA, estadoVisible } from '../estados.js'
import EtiquetaIr from '../EtiquetaIr.jsx'

const { decisiones, vistas } = D2
const V10 = vistas.V10
const pedidos = vistas.V12?.pedidos ?? []

// El riel numera por posición y las vistas van en orden de archivo, V01..V12 (vistas/
// index.jsx): el número de la vista es el de su id. etiquetaVista da el «05» del riel.
// (25/09) Con V06b y V07b el número sale del id y conserva la letra: «06b» en el riel, «6b» en
// las frases.
const numeroVista = (id) => id.slice(1).replace(/^0/, '')
const etiquetaVista = (id) => id.slice(1)

// «(consulta n)» es la pregunta del relevamiento: sirve a la cátedra, no a la sala.
const sinConsulta = (s) => s.replace(/\s*\(consulta \d+\)/g, '')
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Los meses que marca DC-09, igual que en V10: «sep–dic 2025», sin partirse en dos renglones.
const FLAG = vistas.V03.meses_flag
const MESES_FLAG = `${mesCorto(FLAG[0]).slice(0, 3)}–⁠${mesCorto(FLAG[FLAG.length - 1]).slice(0, 3)}`
  + ` ${FLAG[FLAG.length - 1].slice(0, 4)}`

// (25/09) El título es la respuesta del tablero entero: cuánto cambia la cifra que el directorio
// vio en el E1 y qué la deja en revisión. Todo lo que el h1 y `meta.titulo` necesitan se calcula
// a nivel de módulo: son el mismo texto (regla del contrato de vistas) y D2 es estático.
const TITULO = `El riesgo del E1 pasa de ${pct(V10.e1.pct)} a ${pct(V10.despues.pct)}; `
  + `falta confirmar ${MESES_FLAG}`

// Los tres grupos de fichas. «Afectan la cifra central» son las tres que V10 muestra: las de
// V10.cambios (hoy solo DC-04), la sensibilidad (DC-09) y el corte común (DC-08). El resto se
// parte por estado: las aplicadas corrigen otro dato (o lo marcan con una bandera); las
// declaradas y la pendiente no cambian ningún número.
const porId = Object.fromEntries(decisiones.map((d) => [d.id, d]))
// (25/09) Las fichas van en una grilla de tres columnas iguales: 3 + 9 + 3 llenan cinco filas
// completas, alineadas entre grupos. Las nueve del medio, una fila por tema: ventas (DC-01, DC-02,
// DC-03), campañas y contacto (DC-05, DC-13, DC-12) y clientes (DC-06, DC-07, DC-11). Una decisión
// que no esté en la lista va al final, por id.
const ORDEN_OTROS = ['DC-01', 'DC-02', 'DC-03', 'DC-05', 'DC-13', 'DC-12', 'DC-06', 'DC-07', 'DC-11']
const posicion = (id) => (ORDEN_OTROS.includes(id) ? ORDEN_OTROS.indexOf(id) : ORDEN_OTROS.length)
const ordenar = (decs) => [...decs].sort((x, y) => posicion(x.id) - posicion(y.id) || x.id.localeCompare(y.id))
const CENTRAL = [...new Set([...V10.cambios.map((c) => c.decision), 'DC-09', 'DC-08'])].filter((id) => porId[id])
const GRUPOS = [
  { clave: 'central', texto: 'afectan la cifra central', decs: CENTRAL.map((id) => porId[id]) },
  {
    clave: 'otros', texto: 'corrigen otros datos',
    decs: ordenar(decisiones.filter((d) => !CENTRAL.includes(d.id) && d.estado === 'aplicada')),
  },
  {
    clave: 'sin', texto: 'no cambian números',
    decs: decisiones.filter((d) => !CENTRAL.includes(d.id) && d.estado !== 'aplicada'),
  },
]

// Nombre corto de cada ficha, en palabras del directorio. Las fechas salen de D2: los meses de
// DC-09 y el año siguiente al corte, que es el de las bajas que DC-12 deja fuera.
const ANIO_BAJAS = Number(D2.meta.corte_ref.slice(0, 4)) + 1
const NOMBRE = {
  'DC-01': 'Filas repetidas',
  'DC-02': 'Devoluciones',
  'DC-03': 'Canal de venta',
  'DC-04': 'Clientes duplicados',
  'DC-05': 'Envíos repetidos',
  'DC-06': 'Nivel Gold',
  'DC-07': 'Edades y puntos',
  'DC-08': 'Fecha de corte',
  'DC-09': cap(MESES_FLAG),
  'DC-10': 'Inflación',
  'DC-11': 'NPS sin contacto',
  'DC-12': `Bajas ${ANIO_BAJAS}`,
  'DC-13': 'Campañas duplicadas',
  'DC-14': 'Costo de acciones',
  'DC-15': 'Diccionario de datos',
}
const nombre = (d) => NOMBRE[d.id] ?? cap(sinConsulta(d.hallazgo))

// El pedido abierto de cada decisión que espera a Casa Óga, para el title de su ficha y su pastilla.
const PEDIDO = Object.fromEntries(pedidos.map((p) => [p.id, p.que]))
const N_PEDIDOS = pedidos.length
// Cuántos de los pedidos de V12 son decisiones (hasta el 28/09, uno era un dato del registro, D18).
const PEDIDOS_EN_TABLA = pedidos.filter((p) => porId[p.id]).length
const esperan = decisiones.filter((d) => ESPERA.has(d.id) || d.estado === 'pendiente del negocio').length
const cerradas = decisiones.length - esperan

// Tarjeta 1: qué mueve la cifra. Con una sola fila en V10.cambios, y que sea DC-04, son los
// clientes duplicados (vista 4); si no, cuántas decisiones la mueven (vista 10).
const UNICA = V10.cambios.length === 1 && V10.cambios[0].decision === 'DC-04'
const MUEVE = UNICA ? 'Solo cambia por los clientes duplicados.' : `Cambia por ${V10.cambios.length} decisiones.`
// Tarjeta 3: el pedido de DC-09 es el que decide la cifra central (V12 lo pone primero).
// (28/09) Con un solo pedido, «el de» no tiene de qué otro separarse.
const DECIDE = PEDIDO['DC-09']
  ? (N_PEDIDOS === 1 ? `Es el de ${MESES_FLAG}: decide la cifra central.` : `El de ${MESES_FLAG} decide la cifra central.`)
  : null

// Lo que la tarjeta ya no escribe queda en su title, para quien presenta.
const T_CENTRAL = `Clientes en riesgo entre los que tienen 3 compras o más, al ${fechaCorta(D2.meta.corte_ref)}; `
  + `en revisión por ${MESES_FLAG}. Detalle en las vistas 4 y 10.`
const T_SENS = `Si ${MESES_FLAG} están incompletos: riesgo medido al ${fechaCorta(V10.sens.corte)}, antes de los meses con menos del `
  + `${Math.round(D2.meta.umbral_cobertura * 100)} % de las operaciones de un año antes. No reemplaza la cifra: `
  + 'la pone en duda. Vista 3.'
const T_PEDIDOS = `${PEDIDOS_EN_TABLA} de los ${N_PEDIDOS} son de decisiones de abajo; el primero: `
  + `${PEDIDO['DC-09'] ?? '—'}. Vista 12.`

// (24/09) El pie queda en un renglón con lo que el directorio usa. Las filas del registro de
// las decisiones que remiten a esta vista y la fuente, que el directorio no usa, van al title.
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · ${D2.meta.archivos.length} archivos de origen · ` +
  `${decisiones.length} decisiones`
const REGISTRO = [...new Set(decisiones.filter((d) => d.vista === 'V01').flatMap((d) => d.cifras ?? []))]
const PIE_TITLE = `decisiones ${decisiones[0].id} a ${decisiones[decisiones.length - 1].id} · ` +
  `registro: C03, D05, D22, E01, ${REGISTRO.join(', ')} · fuente: e2.json, pipeline/build_e2.py`

export default function V01({ irA, irAVista, vistaDe = (d) => d.vista }) {
  // null: el resumen. Un id o '': el detalle, con esa fila marcada (o ninguna).
  const [detalle, setDetalle] = useState(null)
  const nav = irA ? { irAVista, vistaDe } : null
  if (detalle !== null && irA) {
    return <Detalle nav={nav} marcada={detalle} volver={() => setDetalle(null)} />
  }
  return (
    <section className="pant v01 v01r">
      <div className="e2-kpis v01r-kpis">
        <div className="tarjeta e2-central" title={T_CENTRAL}>
          <span className="kpi-lbl"><span>Clientes en riesgo</span><EtiquetaIr texto="en revisión" irAVista={irAVista} /></span>
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Entregable 1</span>
              <span className="par-val tabular e2-cifra">{pct(V10.e1.pct)}</span>
            </div>
            <span className="par-flecha" aria-hidden="true">→</span>
            <div className="par-item par-despues">
              <span className="par-lbl">Datos corregidos</span>
              <span className="par-val tabular e2-cifra">{pct(V10.despues.pct)}</span>
            </div>
          </div>
          <p className="e2-linea">{MUEVE}</p>
        </div>

        <div className="tarjeta e2-si" title={T_SENS}>
          <span className="kpi-lbl"><span><Aro />Sin {MESES_FLAG}</span></span>
          <div className="ban-par">
            <div className="par-item">
              <span className="par-lbl">Medido al {fechaCorta(V10.sens.corte)}</span>
              <span className="par-val tabular e2-cifra sec">{pct(V10.sens.pct)}</span>
            </div>
          </div>
        </div>

        <div className="tarjeta" title={T_PEDIDOS}>
          <span className="kpi-lbl"><span>Pedidos a Casa Óga</span></span>
          <div className="ban-par">
            <div className="par-item">
              <span className="par-lbl">Abiertos</span>
              <span className="par-val tabular e2-cifra sec">{N_PEDIDOS}</span>
            </div>
          </div>
          {DECIDE && <p className="e2-linea">{DECIDE}</p>}
        </div>
      </div>

      <div className="tarjeta v01r-mapa">
        <span className="kpi-lbl">
          <span>{`Las ${decisiones.length} decisiones`}</span>
          {LEYENDA_ESPERA.length > 0 && (
            <span className="v01r-leyenda" aria-hidden="true">
              {LEYENDA_ESPERA.map((e, i) => (
                <span key={e.texto}>{i > 0 && ' · '}<b>{e.simbolo}</b> {e.texto}</span>
              ))}
            </span>
          )}
          {irA && (
            <button type="button" className="v01-ir" onClick={() => setDetalle('')}>Ver en detalle →</button>
          )}
        </span>
        <div className="v01r-grupos" onKeyDown={moverFoco}>
          {GRUPOS.map((g) => (
            <div key={g.clave} className={`v01r-grupo g-${g.clave}`}>
              <div className="v01r-gcab">
                <span className="v01r-n tabular">{g.decs.length}</span>
                <span className="v01r-gtxt">{g.texto}</span>
              </div>
              <div className="v01r-fichas">
                {g.decs.map((d) => <Ficha key={d.id} d={d} nav={nav} abrir={() => setDetalle(d.id)} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

/** (25/09) Ficha de una decisión: solo el nombre corto. El id, el estado, la decisión en llano y
 *  el pedido abierto van en el title; lleva a la vista de la decisión o, sin vista propia, al
 *  detalle con su fila marcada. En la hoja impresa no llega irA y la ficha va como texto. */
function Ficha({ d, nav, abrir }) {
  const est = estadoVisible(d)
  const vista = nav ? nav.vistaDe(d) : d.vista
  const propia = vista && vista !== 'V01'
  const title = `${d.id} · ${est} — ${d.llano ?? cap(d.decision)}` +
    (PEDIDO[d.id] ? ` Pedido abierto: ${PEDIDO[d.id]}.` : '') +
    (propia ? ` Vista ${numeroVista(vista)}.` : '')
  // (26/09, revisión UX H4) Las que esperan a Casa Óga, con el símbolo de su estado al final.
  const marca = ESPERAN.has(est) ? <span className="v01r-marca" aria-hidden="true">{ESTADO_PASTILLA[est].simbolo}</span> : null
  if (!nav) return <span className="v01r-ficha" title={title}>{nombre(d)}{marca}</span>
  const destino = propia ? `ir a la vista ${numeroVista(vista)}` : 'ver el detalle'
  return (
    <button type="button" className="v01r-ficha" title={title}
            aria-label={`${d.id}, ${nombre(d)}, ${est}: ${destino}`}
            onClick={() => (propia ? nav.irAVista(vista) : abrir())}>
      {nombre(d)}{marca}
    </button>
  )
}

/** (26/09, revisión UX H9) Con el foco en una ficha, las flechas mueven el foco entre fichas (en
 *  el orden de los pilares) en vez de cambiar de vista; Inicio y Fin van a la primera y la última. */
function moverFoco(e) {
  if (!e.target.classList?.contains('v01r-ficha')) return
  const fichas = [...e.currentTarget.querySelectorAll('button.v01r-ficha')]
  const i = fichas.indexOf(e.target)
  const j = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: fichas.length - 1 }[e.key]
  if (j === undefined) return
  e.preventDefault()
  fichas[Math.max(0, Math.min(fichas.length - 1, j))].focus()
}

// El aro punteado de la sensibilidad, el mismo de ParDoble y V10.
function Aro() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block', width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)',
        boxSizing: 'border-box', marginRight: 6, verticalAlign: '-1px', flexShrink: 0,
      }}
    />
  )
}

// ---------- Detalle: la tabla de las 15 decisiones (la V01 del 24/09) ----------

// Símbolo + texto + color por estado, y la definición que lee la leyenda de arriba de la
// tabla. El símbolo (lleno / medio / vacío) es el canal redundante al color, igual que hacía
// el semáforo del E1: una decisión "pendiente" se distingue de una "aplicada" aunque se
// imprima en blanco y negro. (24/09) "a confirmar" lleva el medio círculo del otro lado que
// "declarada" y el terracota de "pendiente": ya se aplica, pero espera a Casa Óga.
const ESTADO_PASTILLA = {
  aplicada: {
    simbolo: '●', texto: 'aplicada', color: 'var(--despues)',
    def: 'el cálculo ya la usa.',
  },
  declarada: {
    simbolo: '◐', texto: 'declarada', color: 'var(--mut2)',
    def: 'el dato no cambia y se aclara.',
  },
  'a confirmar': {
    simbolo: '◑', texto: 'a confirmar', color: 'var(--terra)',
    def: 'ya se aplica, pero Casa Óga todavía no explicó la causa del hallazgo.',
  },
  'pendiente del negocio': {
    simbolo: '○', texto: 'pendiente', color: 'var(--terra)',
    def: 'falta una respuesta de Casa Óga.',
  },
}

// Estados que esperan una respuesta de Casa Óga, y la leyenda del rótulo con los que aparecen.
const ESPERAN = new Set(['a confirmar', 'pendiente del negocio'])
const LEYENDA_ESPERA = [...ESPERAN]
  .filter((est) => decisiones.some((d) => estadoVisible(d) === est))
  .map((est) => ({ simbolo: ESTADO_PASTILLA[est].simbolo, texto: ESTADO_PASTILLA[est].texto }))

const celda = {
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  padding: '2px 10px 2px 0', verticalAlign: 'middle',
}
// Hallazgo y decisión: los dos renglones los hace .v01q td.txt con su .clamp2 adentro, así
// que la celda no lleva whiteSpace ni overflow inline que lo pisen. (24/09) El padding
// vertical baja de 2 a 1 px: a 1152x640 las 15 filas van en dos renglones y con 2 px el pie
// se comía el margen de abajo. Desde 1280 la tabla estira las filas y no se nota.
const celdaTxt = { paddingRight: '10px', paddingTop: '1px', paddingBottom: '1px', verticalAlign: 'middle' }

// La leyenda va con la misma letra que la tabla (misma escala que .v01q table en
// estilos_e2.css): antes era una línea gris de 10,5 px que nadie leía.
const LETRA_TABLA = 'clamp(11.5px, calc(0.55vw + 5px), 16px)'
const ORDEN_ESTADOS = ['aplicada', 'declarada', 'a confirmar', 'pendiente del negocio']

/** El detalle ocupa el cuerpo entero, con el mismo h1 (la regla del contrato: el h1 es
 *  `meta.titulo`). Arriba, la vuelta al resumen y la cuenta que antes era el título. */
function Detalle({ nav, marcada, volver }) {
  return (
    <section className="pant v01 v01q" style={{ gap: 'clamp(4px, 0.6vh, 10px)' }}>
      <p className="e2-nota" style={{ flexShrink: 0, margin: 0, fontSize: LETRA_TABLA, lineHeight: 1.25 }}>
        <button type="button" className="v01-ir" onClick={volver} style={{ marginRight: 'calc(0.8em - 8px)' }}>
          ← Volver al resumen
        </button>
        <b style={{ color: 'var(--ink)' }}>
          {`${decisiones.length} decisiones: ${cerradas} ${cerradas === 1 ? 'cerrada' : 'cerradas'} y ` +
            `${esperan} ${esperan === 1 ? 'espera' : 'esperan'} una respuesta de Casa Óga.`}
        </b>{' '}
        {/* (28/09) Solo los estados que tiene alguna decisión: sin DC-15 pendiente, la leyenda no
            define «pendiente». */}
        {ORDEN_ESTADOS.filter((est) => decisiones.some((d) => estadoVisible(d) === est)).map((est) => {
          const e = ESTADO_PASTILLA[est]
          return (
            <span key={est}>
              <span style={{ color: e.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <span aria-hidden="true" style={{ fontFamily: 'var(--mono)' }}>{e.simbolo}</span> {cap(e.texto)}:
              </span>{' '}
              {e.def}{' '}
            </span>
          )
        })}
        {N_PEDIDOS === 1 ? 'El pedido abierto está en la ' : `Los ${N_PEDIDOS} pedidos abiertos están en la `}
        <IrVista id="V12" nav={nav} prefijo="vista " />
        {PEDIDOS_EN_TABLA > 0 && PEDIDOS_EN_TABLA < N_PEDIDOS
          ? `; ${PEDIDOS_EN_TABLA} ${PEDIDOS_EN_TABLA === 1 ? 'es' : 'son'} de esta tabla.`
          : '.'}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* height 100%: a 1920x1080 las filas reparten el alto libre en vez de dejar un hueco
            bajo la tabla; a 1152x640 la tabla ya ocupa todo y no cambia nada. */}
        <table style={{
          width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed',
        }}>
          {/* Cinco columnas: sin ARCHIVO (va en el title del id). Estado al 12 % para que
              entre «◑ a confirmar» a 1152. */}
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '31%' }} />
            <col style={{ width: '45%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '6%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <Th>id</Th>
              <Th>qué encontramos</Th>
              <Th>qué decidimos</Th>
              <Th>estado</Th>
              <Th align="center">vista</Th>
            </tr>
          </thead>
          <tbody>
            {decisiones.map((dec) => (
              <tr key={dec.id} style={{
                borderBottom: '1px solid var(--bd2)',
                background: dec.id === marcada ? 'var(--azul1)' : undefined,
              }}>
                <td className="tabular" title={`Archivo: ${dec.archivo}`} style={{
                  ...celda, color: 'var(--mut2)', fontFamily: 'var(--mono)', fontSize: '0.9em',
                }}>
                  {dec.id}
                </td>
                <td className="txt" style={{ ...celdaTxt, color: 'var(--mut2)' }} title={dec.hallazgo}>
                  <div className="clamp2">{sinConsulta(dec.hallazgo)}</div>
                </td>
                <td className="txt" style={{ ...celdaTxt, color: 'var(--ink)' }}
                    title={`${dec.llano ?? dec.decision} — Regla: ${dec.decision}`}>
                  <div className="clamp2">{dec.llano ?? cap(dec.decision)}</div>
                </td>
                <td style={{ padding: '1px 10px 1px 0', verticalAlign: 'middle' }}>
                  <Pastilla estado={estadoVisible(dec)}
                            title={PEDIDO[dec.id] ? `Pedido abierto: ${PEDIDO[dec.id]}` : undefined} />
                </td>
                <td className="tabular" style={{ ...celda, padding: '2px 0', textAlign: 'center' }}>
                  <IrVista id={nav ? nav.vistaDe(dec) : dec.vista} nav={nav} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th style={{
      // lineHeight 1.35: con 1.2 la tilde de QUÉ (antes DECISIÓN) quedaba recortada. (24/09) Los
      // rótulos de columna crecen con --e2-rot, como el resto de los rótulos mono del E2.
      textAlign: align, padding: '3px 10px 3px 0',
      fontFamily: 'var(--mono)', fontSize: 'var(--e2-rot)', fontWeight: 500, lineHeight: 1.35,
      textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--mut2)',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>
      {children}
    </th>
  )
}

/** (24/09) Número de vista que lleva a esa vista (OMI-V01-3): el mismo «05» del riel, como
 *  botón con estilo de texto (.v01-ir). Las decisiones de esta misma vista dicen «acá» en
 *  gris. En la hoja impresa no llega irA y el número va como texto. */
function IrVista({ id, nav, prefijo = '' }) {
  if (!id) return <span style={{ color: 'var(--mut)' }}>—</span>
  if (id === 'V01') return <span style={{ color: 'var(--mut2)' }}>acá</span>
  const etiqueta = `${prefijo}${prefijo ? numeroVista(id) : etiquetaVista(id)}`
  if (!nav) return <span style={{ fontWeight: prefijo ? 400 : 600, color: prefijo ? 'inherit' : 'var(--acc)' }}>{etiqueta}</span>
  return (
    <button type="button" className="v01-ir" onClick={() => nav.irAVista(id)}
            title={`Ir a la vista ${numeroVista(id)}`}>
      {etiqueta}
    </button>
  )
}

/** Pastilla de estado propia del detalle: símbolo (forma) + texto + color, ninguno solo. No
 *  reusa <Semaforo> ni SemaforoLuz.jsx: sus rótulos "EN META / POR DEBAJO / FUERA DE META" son
 *  de otra vista y confunden acá. (24/09) A 0,9 em de la letra de la tabla, para que crezca
 *  con ella. */
function Pastilla({ estado, title }) {
  const e = ESTADO_PASTILLA[estado] ?? ESTADO_PASTILLA['pendiente del negocio']
  return (
    <span
      role="img"
      aria-label={`Estado: ${e.texto}`}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4em',
        padding: '1px 0.6em', borderRadius: '3px',
        border: `1px solid ${e.color}`, color: e.color, background: 'var(--sup)',
        font: '600 0.9em/1.15 var(--mono)', whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.05em', lineHeight: 1 }}>{e.simbolo}</span>
      <span>{e.texto}</span>
    </span>
  )
}

export const meta = {
  id: 'V01',
  corto: 'Resumen',
  titulo: TITULO,
  pie: PIE,
}
