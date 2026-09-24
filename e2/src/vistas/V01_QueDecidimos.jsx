// V01 — Qué decidimos. Primera vista del riel: antes de mostrar ningún antes/después hay
// que decir qué se tocó y con qué alcance. Es la única vista sin gráfico (DISENO.md): la
// tabla de las 15 decisiones ES el contenido, con el estado en una pastilla propia porque
// "aplicada" cambia un número, "declarada" no cambia nada y solo se deja por escrito, y
// "pendiente del negocio" espera un archivo que Casa Óga todavía no dio.
//
// (24/09) Cuarto estado, "a confirmar": una decisión aplicada que además tiene un pedido
// abierto en V12 (DC-07, DC-09, DC-13). Ya corre en el cálculo, pero Casa Óga tiene que
// confirmarla, y de DC-09 depende que el riesgo sea el del 31/12 o el del 31/08. Antes la
// pastilla decía "aplicada" y el título contaba una sola decisión a la espera, cuando V12
// lista cinco pedidos, cuatro de ellos decisiones de esta tabla: V01 se contradecía con su
// propia leyenda y con V12. El estado de la decisión sigue separado del estado del pedido
// (V12_Pedidos.jsx:8-13): no vuelve a "pendiente". La regla vive en estados.js, que también
// usa la tarjeta de decisión de cada vista.
//
// (24/09) La tabla es todo el cuerpo: salen las tres tarjetas de conteos (repetían el título
// y el encabezado), los pares de DC-03 y DC-07 (el de DC-07 ponía 106 → 630 con flecha entre
// dos medidas distintas) y la columna ARCHIVO, que pasa al title del id. La columna de la
// decisión muestra el llano, no la regla técnica, y cada celda de texto entra en hasta dos
// renglones (.clamp2) con el texto completo en el title. La letra crece con la pantalla
// (.v01q table, estilos_e2.css) y el número de vista lleva a esa vista con un clic.
//
// Sin filtros ni corte: la tabla entera sale de D2.decisiones (15 objetos) y de
// D2.vistas.V12.pedidos (qué decisiones esperan a Casa Óga). Ninguna cifra se escribe a mano:
// el título cuenta las filas, no lee D2.vistas.V01.por_estado, que no sabe de los pedidos.

// La pastilla de estado NO es <Semaforo> ("EN META / POR DEBAJO / FUERA DE META"): esos
// rótulos hablan de una meta que la vista no tiene, y el directorio los lee como si cada
// decisión estuviera cumpliendo o incumpliendo un objetivo. Acá el estado es otra cosa —qué
// tan aplicada está la decisión— así que la pastilla es propia: forma (símbolo) + texto +
// color, definida con estilo inline en este archivo, sin tocar CSS compartido ni el de E2.
import { fechaCorta } from '../formato.js'
import { D2 } from '../datos_e2.js'
import { ESPERA, estadoVisible } from '../estados.js'

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
    def: 'ya se aplica, pero Casa Óga tiene que confirmarla.',
  },
  'pendiente del negocio': {
    simbolo: '○', texto: 'pendiente', color: 'var(--terra)',
    def: 'falta una respuesta de Casa Óga.',
  },
}

const celda = {
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  padding: '2px 10px 2px 0', verticalAlign: 'middle',
}
// Hallazgo y decisión: los dos renglones los hace .v01q td.txt con su .clamp2 adentro, así
// que la celda no lleva whiteSpace ni overflow inline que lo pisen. (24/09) El padding
// vertical baja de 2 a 1 px: a 1152x640 las 15 filas van en dos renglones y con 2 px el pie
// se comía el margen de abajo. Desde 1280 la tabla estira las filas y no se nota.
const celdaTxt = { paddingRight: '10px', paddingTop: '1px', paddingBottom: '1px', verticalAlign: 'middle' }

// Todo lo que el h1 y `meta.titulo` necesitan se calcula acá afuera, a nivel de módulo:
// son el mismo texto (regla dura del contrato de vistas) y D2 es estático, así que no
// hace falta esperar al render para tenerlo. Mismo patrón que V06_Envios.jsx.
const { decisiones, vistas } = D2
const pedidos = vistas.V12?.pedidos ?? []

const esperan = decisiones.filter((d) => ESPERA.has(d.id) || d.estado === 'pendiente del negocio').length
const cerradas = decisiones.length - esperan

// (24/09) El título cuenta lo que el directorio tiene que saber: cuántas decisiones están
// cerradas y cuántas esperan una respuesta suya (las "a confirmar" más las "pendiente").
// Antes contaba solo por_estado y daba "1 a la espera", contra los cuatro de V12.
const TITULO = `${decisiones.length} decisiones: ` +
  `${cerradas} ${cerradas === 1 ? 'cerrada' : 'cerradas'} y ` +
  `${esperan} ${esperan === 1 ? 'espera' : 'esperan'} una respuesta de Casa Óga`

// El riel numera por posición y las vistas van en orden de archivo, V01..V12 (vistas/
// index.jsx): el número de la vista es el de su id. etiquetaVista da el «05» del riel.
const numeroVista = (id) => Number(id.slice(1))
const etiquetaVista = (id) => String(numeroVista(id)).padStart(2, '0')

// «(consulta n)» es la pregunta del relevamiento: sirve a la cátedra, no a la sala. Sale de
// la celda y queda en el title con el hallazgo completo.
const sinConsulta = (s) => s.replace(/\s*\(consulta \d+\)/g, '')
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)


// El pedido abierto de cada decisión que espera a Casa Óga, para el title de su pastilla.
const PEDIDO = Object.fromEntries(pedidos.map((p) => [p.id, p.que]))
// Cuántos de los pedidos de V12 son filas de esta tabla: el título cuenta 4 decisiones que
// esperan y V12 lista 5 pedidos (uno es un dato del registro), y la leyenda lo concilia.
const N_PEDIDOS = pedidos.length
const PEDIDOS_EN_TABLA = pedidos.filter((p) => decisiones.some((d) => d.id === p.id)).length

// (24/09) El pie queda en un renglón con lo que el directorio usa. Las filas del registro de
// las decisiones que remiten a esta vista y la fuente, que el directorio no usa, van al title.
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · ${D2.meta.archivos.length} archivos de origen · ` +
  `${decisiones.length} decisiones`
const REGISTRO = [...new Set(decisiones.filter((d) => d.vista === 'V01').flatMap((d) => d.cifras ?? []))]
const PIE_TITLE = `decisiones ${decisiones[0].id} a ${decisiones[decisiones.length - 1].id} · ` +
  `registro: ${REGISTRO.join(', ')} · fuente: e2.json, pipeline/build_e2.py`

// La leyenda va con la misma letra que la tabla (misma escala que .v01q table en
// estilos_e2.css): antes era una línea gris de 10,5 px que nadie leía.
const LETRA_TABLA = 'clamp(11.5px, calc(0.55vw + 5px), 16px)'
const ORDEN_ESTADOS = ['aplicada', 'declarada', 'a confirmar', 'pendiente del negocio']

export default function V01({ irA }) {
  return (
    <section className="pant v01 v01q" style={{ gap: 'clamp(4px, 0.6vh, 10px)' }}>
      <h1 className="titulo">{TITULO}</h1>

      {/* (24/09) Leyenda de los cuatro estados, con el símbolo y el color de la pastilla, y el
          camino a los pedidos: reemplaza a las tarjetas de conteo, que repetían el título. */}
      <p className="e2-nota" style={{ flexShrink: 0, margin: 0, fontSize: LETRA_TABLA, lineHeight: 1.25 }}>
        {ORDEN_ESTADOS.map((est) => {
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
        <IrVista id="V12" irA={irA} prefijo="vista " />
        {PEDIDOS_EN_TABLA > 0 && PEDIDOS_EN_TABLA < N_PEDIDOS
          ? `; ${PEDIDOS_EN_TABLA} ${PEDIDOS_EN_TABLA === 1 ? 'es' : 'son'} de esta tabla.`
          : '.'}
      </p>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* height 100%: a 1920x1080 las filas reparten el alto libre en vez de dejar un hueco
            bajo la tabla; a 1152x640 la tabla ya ocupa todo y no cambia nada. (24/09) La letra
            sale de .v01q table y crece con la pantalla, así que el aire por fila es menor. */}
        <table style={{
          width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed',
        }}>
          {/* (24/09) Cinco columnas: sin ARCHIVO (va en el title del id). Estado al 12 % para
              que entre «◑ a confirmar» a 1152. La columna «qué cambia» (REL-V01-1) necesita un
              texto corto por decisión que el payload todavía no trae: queda pendiente. */}
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
              <tr key={dec.id} style={{ borderBottom: '1px solid var(--bd2)' }}>
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
                  <IrVista id={dec.vista} irA={irA} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="pie-vista" style={{ flexShrink: 0, margin: 0 }} title={PIE_TITLE}>
        {PIE}
      </p>
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
function IrVista({ id, irA, prefijo = '' }) {
  if (!id) return <span style={{ color: 'var(--mut)' }}>—</span>
  if (id === 'V01') return <span style={{ color: 'var(--mut2)' }}>acá</span>
  const etiqueta = `${prefijo}${prefijo ? numeroVista(id) : etiquetaVista(id)}`
  if (!irA) return <span style={{ fontWeight: prefijo ? 400 : 600, color: prefijo ? 'inherit' : 'var(--acc)' }}>{etiqueta}</span>
  return (
    <button type="button" className="v01-ir" onClick={() => irA(numeroVista(id) - 1)}
            title={`Ir a la vista ${etiquetaVista(id)}`}>
      {etiqueta}
    </button>
  )
}

/** Pastilla de estado propia de V01: símbolo (forma) + texto + color, ninguno solo. No
 *  reusa <Semaforo> ni SemaforoLuz.jsx (ver comentario del import de arriba): sus rótulos
 *  "EN META / POR DEBAJO / FUERA DE META" son de otra vista y confunden acá. Estilo
 *  inline, nada nuevo en estilos.css ni en estilos_e2.css. (24/09) A 0,9 em de la letra de
 *  la tabla, para que crezca con ella. */
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
  corto: 'Qué decidimos',
  titulo: TITULO,
  pie: PIE,
}
