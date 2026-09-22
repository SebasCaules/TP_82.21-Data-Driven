// V12 · Lo que le pedimos a Casa Óga — última vista del riel. Sin antes/después y sin
// gráfico (DISENO.md): es la lista de lo que el equipo no puede resolver con lo que el
// negocio ya entregó. Cada fila sale de D2.vistas.V12.pedidos (CONTRACT_E2.md §3): id, qué
// se pide, el detalle y el estado, siempre 'pendiente del negocio' en el payload hasta que
// llegue una respuesta. Nada se escribe a mano: el conteo del título y de la frase de arriba
// es pedidos.length.
//
// Auditoría (T-02, CR-07, T-10): tres de los cinco pedidos (DC-13, DC-09, DC-07) cuelgan de
// una decisión que V01 ya marca 'aplicada' en D2.decisiones. El literal 'pendiente del
// negocio' que trae el payload describe el PEDIDO (la pregunta o corrección abierta hacia
// Casa Óga), no la decisión: mostrarlo tal cual confunde una cosa con la otra, como si la
// decisión siguiera sin tomarse. La vista usa su propio rótulo, 'pedido abierto', con el
// mismo glifo de círculo hueco (no es un estado del semáforo: el semáforo compara contra una
// meta —en meta / por debajo / fuera de meta— y acá no hay meta que Casa Óga haya
// incumplido, solo un pedido todavía sin responder). Por eso la fila no usa <Semaforo> ni su
// réplica SemaforoLuz.jsx: usa una pastilla propia, en terracota (--terra, la excepción
// reservada de estilos.css), círculo hueco + texto, siempre juntos para que la lectura no
// dependa solo del color (regla dura 2 del DISENO.md).

import { D2 } from '../datos_e2.js'
import { fechaCorta } from '../formato.js'

const V = D2.vistas.V12
const PEDIDOS = V.pedidos

// Título con el conteo en letras hasta nueve (DISENO.md trae el ejemplo con "Cinco"); de
// diez en adelante, en número, porque a partir de ahí la palabra pesa más que la cifra.
const NUMEROS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
function numeroEnLetras(n) {
  if (n >= 1 && n <= 9) return NUMEROS[n].charAt(0).toUpperCase() + NUMEROS[n].slice(1)
  return String(n)
}

const N = PEDIDOS.length
const TITULO = `${numeroEnLetras(N)} cosas quedan en manos de Casa Óga`

// La frase aclara lo que la pastilla ya no dice sola: el pedido abierto no es una decisión
// pendiente, las quince ya están tomadas (12 aplicadas, 2 declaradas, 1 pendiente del
// negocio, D2.vistas.V01.por_estado). Lo que sigue abierto es la respuesta de Casa Óga.
const N_PALABRA = numeroEnLetras(N).toLowerCase()
const SUJETO = N === 1 ? 'pedido sigue' : `${N_PALABRA} pedidos siguen`
const FRASE_ABIERTOS = `las decisiones ya están tomadas; estos ${SUJETO} abiertos del lado de Casa Óga.`

// D2.meta no trae la numeración de la consigna ni la fecha de las respuestas (son metadatos
// del envío a la cátedra, no una cifra del payload): se escriben tal como los dio la tarea,
// igual que hace <TAG>-consignas.md con la fecha de un anuncio. El corte sí sale de D2.meta.
const PIE = 'consultas 1 a 9 de la Parte A, 3.4 · respuestas del 22/09 · '
  + `corte ${fechaCorta(D2.meta.corte_ref)} · fuente vistas.V12`

export const meta = {
  id: 'V12',
  corto: 'Pedidos a Casa Óga',
  titulo: TITULO,
  pie: PIE,
}

export default function V12Pedidos() {
  return (
    <section className="pant v12">
      <h1 className="titulo">{TITULO}</h1>

      <p style={{
        margin: 0, flexShrink: 0, fontSize: 13, lineHeight: 1.45, color: 'var(--ink)',
      }}>
        {FRASE_ABIERTOS}
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '31%' }} />
            <col style={{ width: '43%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <Th>id</Th>
              <Th>qué</Th>
              <Th>detalle</Th>
              <Th>estado</Th>
            </tr>
          </thead>
          <tbody>
            {PEDIDOS.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--bd2)' }}>
                <td className="tabular" style={{
                  ...celda, color: 'var(--mut2)', fontFamily: 'var(--mono)', fontSize: 11,
                }}>
                  {p.id}
                </td>
                <td style={{ ...celda, color: 'var(--ink)', fontWeight: 600 }} title={p.que}>
                  <span style={clamp2}>{p.que}</span>
                </td>
                <td style={{ ...celda, color: 'var(--mut)' }} title={p.detalle}>
                  <span style={clamp2}>{p.detalle}</span>
                </td>
                <td style={{ padding: '6px 10px 6px 0', verticalAlign: 'top' }}>
                  <PastillaAbierto />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}

const celda = {
  padding: '7px 10px 7px 0', verticalAlign: 'top', fontSize: 12.5, lineHeight: 1.32,
}

// Dos renglones como máximo por celda: con cinco filas y detalles de hasta ~130 caracteres,
// una sola línea no entra sin agrandar la fila más de lo que el lienzo tiene a 1152×640
// (regla dura 8). El texto completo queda en `title` para quien pase el mouse.
const clamp2 = {
  display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
}

function Th({ children }) {
  return (
    <th style={{
      textAlign: 'left', padding: '0 10px 6px 0',
      font: '600 10px/1.2 var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em',
      color: 'var(--mut2)',
    }}>
      {children}
    </th>
  )
}

/** Pastilla de "pedido abierto": círculo hueco (forma, no un punto lleno) + el texto del
 *  estado propio de esta vista, en --terra. No repite el literal `estado` del payload
 *  ('pendiente del negocio'): ese describe la decisión y tres de los cinco pedidos cuelgan
 *  de una decisión ya aplicada (ver comentario de auditoría arriba). No hereda las clases
 *  .sem-* del semáforo (esas son "en meta / por debajo / fuera de meta" contra un umbral)
 *  porque acá no hay umbral: es un pedido sin responder. Regla dura 2 del DISENO.md: nunca
 *  color solo, así que la forma (el aro) y el texto van siempre con el terracota, nunca el
 *  color aparte. */
function PastillaAbierto() {
  return (
    <span className="pastilla-pend" role="img" aria-label="Estado: pedido abierto">
      <span className="pastilla-pend-forma" aria-hidden="true">○</span>
      <span aria-hidden="true">pedido abierto</span>
    </span>
  )
}
