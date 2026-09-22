// V01 — Qué decidimos. Primera vista del riel: antes de mostrar ningún antes/después hay
// que decir qué se tocó y con qué alcance. Es la única vista sin gráfico (DISENO.md): la
// tabla de las 15 decisiones ES el contenido, con el estado en una pastilla propia porque
// "aplicada" cambia un número, "declarada" no cambia nada y solo se deja por escrito, y
// "pendiente del negocio" espera un archivo que Casa Óga todavía no dio.
//
// Sin filtros ni corte: la tabla entera sale de D2.decisiones (15 objetos) y D2.vistas.V01
// (los conteos por estado y por archivo). Ninguna cifra se escribe a mano.

// La pastilla de estado NO es <Semaforo> ("EN META / POR DEBAJO / FUERA DE META"): esos
// rótulos hablan de una meta que la vista no tiene, y el directorio los lee como si cada
// decisión estuviera cumpliendo o incumpliendo un objetivo. Acá el estado es otra cosa —qué
// tan aplicada está la decisión— así que la pastilla es propia: forma (símbolo) + texto +
// color, definida con estilo inline en este archivo, sin tocar CSS compartido ni el de E2.
import { entero, fechaCorta } from '../formato.js'
import { D2 } from '../datos_e2.js'

// Símbolo + texto + color por estado. El símbolo (lleno / medio / vacío) es el canal
// redundante al color, igual que hacía el semáforo del E1: una decisión "pendiente" se
// distingue de una "aplicada" aunque se imprima en blanco y negro.
const ESTADO_PASTILLA = {
  aplicada: { simbolo: '●', texto: 'aplicada', color: 'var(--despues)' },
  declarada: { simbolo: '◐', texto: 'declarada', color: 'var(--mut2)' },
  'pendiente del negocio': { simbolo: '○', texto: 'pendiente', color: 'var(--terra)' },
}

/** Recorta a `n` caracteres en el último espacio antes del límite, para no partir una
 *  palabra a la mitad. El texto completo queda en `title` para quien lo necesite entero. */
function recortar(texto, n) {
  if (!texto) return '—'
  if (texto.length <= n) return texto
  const corte = texto.slice(0, n)
  const ultimoEspacio = corte.lastIndexOf(' ')
  return `${corte.slice(0, ultimoEspacio > n * 0.6 ? ultimoEspacio : n)}…`
}

const celda = {
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  padding: '3px 10px 3px 0', verticalAlign: 'middle',
}

// Todo lo que el h1 y `meta.titulo` necesitan se calcula acá afuera, a nivel de módulo:
// son el mismo texto (regla dura del contrato de vistas) y D2 es estático, así que no
// hace falta esperar al render para tenerlo. Mismo patrón que V06_Envios.jsx.
const { decisiones, vistas } = D2
const v01 = vistas.V01
const porEstado = v01?.por_estado ?? {}
const aplicada = porEstado.aplicada ?? 0
const declarada = porEstado.declarada ?? 0
const pendiente = porEstado['pendiente del negocio'] ?? 0

const TITULO = `${v01.n_decisiones} decisiones: ` +
  `${aplicada} ${aplicada === 1 ? 'cambia' : 'cambian'} el dato, ` +
  `${declarada} se ${declarada === 1 ? 'declara' : 'declaran'} y ` +
  `${pendiente} ${pendiente === 1 ? 'espera' : 'esperan'} al negocio`

const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${v01.n_archivos} archivos de origen, ` +
  `${v01.n_decisiones} decisiones de calidad · fuente: payload e2.json, vistas.V01 y decisiones (pipeline/build_e2.py)`

export default function V01() {
  return (
    <section className="pant v01q">
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
        <div className="tarjeta" style={{ flex: 1, padding: '10px 14px' }}>
          <span className="kpi-lbl">Archivos con al menos una decisión</span>
          <span className="kpi-val tabular" style={{ fontSize: '24px', marginTop: '4px' }}>
            {entero(v01.n_archivos)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: 1, padding: '10px 14px' }}>
          <span className="kpi-lbl">Decisiones de calidad tomadas</span>
          <span className="kpi-val tabular" style={{ fontSize: '24px', marginTop: '4px' }}>
            {entero(v01.n_decisiones)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: 1.3, padding: '10px 14px' }}>
          <span className="kpi-lbl">Desglose por estado</span>
          <div style={{ display: 'flex', gap: '16px', marginTop: '9px', flexWrap: 'nowrap' }}>
            <MiniEstado estado="aplicada" n={aplicada} />
            <MiniEstado estado="declarada" n={declarada} />
            <MiniEstado estado="pendiente del negocio" n={pendiente} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '11px' }}>
          <colgroup>
            <col style={{ width: '7%' }} />
            <col style={{ width: '13.5%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '39.5%' }} />
            <col style={{ width: '16.5%' }} />
            <col style={{ width: '5.5%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <Th>id</Th>
              <Th>archivo</Th>
              <Th>hallazgo</Th>
              <Th>decisión</Th>
              <Th>estado</Th>
              <Th align="center">vista</Th>
            </tr>
          </thead>
          <tbody>
            {decisiones.map((dec) => (
              <tr key={dec.id} style={{ borderBottom: '1px solid var(--bd2)' }}>
                <td className="tabular" style={{ ...celda, color: 'var(--mut2)', fontFamily: 'var(--mono)', fontSize: '10.5px' }}>
                  {dec.id}
                </td>
                <td style={{ ...celda, color: 'var(--ink)' }} title={dec.archivo}>
                  {dec.archivo}
                </td>
                <td style={{ ...celda, color: 'var(--mut2)' }} title={dec.hallazgo}>
                  {recortar(dec.hallazgo, 60)}
                </td>
                <td style={{ ...celda, color: 'var(--ink)' }} title={dec.decision}>
                  {recortar(dec.decision, 88)}
                </td>
                <td style={{ padding: '1px 10px 1px 0', verticalAlign: 'middle' }}>
                  <Pastilla estado={dec.estado} />
                </td>
                <td className="tabular" style={{ ...celda, color: 'var(--acc)', fontWeight: 600, textAlign: 'center' }}>
                  {dec.vista ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="pie-vista" style={{
        flexShrink: 0, borderTop: '1px solid var(--bd)', paddingTop: '6px',
        margin: 0, font: '400 10px/1.35 var(--mono)', color: 'var(--mut2)',
      }}>
        {PIE}
      </p>
    </section>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th style={{
      textAlign: align, padding: '0 10px 3px 0',
      font: '600 10px/1.2 var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em',
      color: 'var(--mut2)',
    }}>
      {children}
    </th>
  )
}

// Marca de estado para el resumen de la cabecera: el conteo del estado más la misma
// pastilla que usa la tabla (símbolo + texto + color), para que la tarjeta y la fila
// cuenten la misma historia con la misma pieza visual.
function MiniEstado({ estado, n }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <span className="tabular" style={{ fontSize: '12.5px', color: 'var(--ink)', fontWeight: 600 }}>
        {n}
      </span>
      <Pastilla estado={estado} />
    </div>
  )
}

/** Pastilla de estado propia de V01: símbolo (forma) + texto + color, ninguno solo. No
 *  reusa <Semaforo> ni SemaforoLuz.jsx (ver comentario del import de arriba): sus rótulos
 *  "EN META / POR DEBAJO / FUERA DE META" son de otra vista y confunden acá. Estilo
 *  inline, nada nuevo en estilos.css ni en estilos_e2.css. */
function Pastilla({ estado }) {
  const e = ESTADO_PASTILLA[estado] ?? ESTADO_PASTILLA['pendiente del negocio']
  return (
    <span
      role="img"
      aria-label={`Estado: ${e.texto}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '2px 8px', borderRadius: '3px',
        border: `1px solid ${e.color}`, color: e.color,
        font: '600 10.5px/1.2 var(--mono)', whiteSpace: 'nowrap',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '11px', lineHeight: 1 }}>{e.simbolo}</span>
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
