// V12 · Lo que le pedimos a Casa Óga — última vista del riel. Sin antes/después y sin
// gráfico (DISENO.md): es la lista de lo que el equipo no puede resolver con lo que el
// negocio ya entregó. Cada fila sale de D2.vistas.V12.pedidos (CONTRACT_E2.md §3): id, qué
// se pide, el detalle y el estado, siempre 'pendiente del negocio' hasta que llegue una
// respuesta. Nada se escribe a mano: el conteo del título y de la frase de arriba es
// pedidos.length.
//
// El estado de las cinco filas es siempre 'pendiente del negocio' (CONTRACT_E2.md §3: no
// hay otro valor posible acá). No es un estado del semáforo: el semáforo compara contra una
// meta (en meta / por debajo / fuera de meta), y acá no hay meta que Casa Óga haya
// incumplido, solo un pedido todavía sin responder. Por eso la fila no usa <Semaforo> ni su
// réplica SemaforoLuz.jsx: usa una pastilla propia, círculo hueco + el texto de `estado` tal
// como viene del payload, en terracota (--terra, la excepción reservada de estilos.css).

import { D2 } from '../datos_e2.js'

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

// D2.meta no trae la numeración del relevamiento ni la fecha de las respuestas (son
// metadatos del envío a la cátedra, no una cifra del payload): se escriben tal como los dio
// la tarea, igual que hace <TAG>-consignas.md con la fecha de un anuncio.
const PIE = 'consultas 1 a 9 del relevamiento · respuestas del 22/09 · '
  + 'fuente: payload e2.json, vistas.V12.pedidos'

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
        {N} {N === 1 ? 'pedido queda' : 'pedidos quedan'} abiertos: preguntas y correcciones
        que el equipo no puede cerrar con lo que Casa Óga ya entregó.
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
                  <PastillaPendiente estado={p.estado} />
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

/** Pastilla de "pendiente del negocio": círculo hueco (forma, no un punto lleno) + el texto
 *  de `estado` tal como lo trae el payload, en --terra. No hereda las clases .sem-* del
 *  semáforo (esas son "en meta / por debajo / fuera de meta" contra un umbral) porque acá no
 *  hay umbral: es un pedido sin responder. Regla dura 2 del DISENO.md: nunca color solo, así
 *  que la forma (el aro) y el texto van siempre con el terracota, nunca el color aparte. */
function PastillaPendiente({ estado }) {
  return (
    <span className="pastilla-pend" role="img" aria-label={`Estado: ${estado}`}>
      <span className="pastilla-pend-forma" aria-hidden="true">○</span>
      <span aria-hidden="true">{estado}</span>
    </span>
  )
}
