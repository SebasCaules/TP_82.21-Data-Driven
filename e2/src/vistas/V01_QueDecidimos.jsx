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

// DC-03 y DC-07 son las dos decisiones que la auditoría marcó sin cuánto cambia (T-04):
// esta vista las cita en la tabla pero no mostraba el desplazamiento. Los dos pares de
// abajo lo agregan, con valor y etiqueta tal como vienen en D2.decisiones (nada inventado).
const DC03 = decisiones.find((d) => d.id === 'DC-03')
const DC07 = decisiones.find((d) => d.id === 'DC-07')

const TITULO = `${v01.n_decisiones} decisiones: ` +
  `${aplicada} ${aplicada === 1 ? 'cambia' : 'cambian'} el dato, ` +
  `${declarada} se ${declarada === 1 ? 'declara' : 'declaran'} y ` +
  `${pendiente} ${pendiente === 1 ? 'espera' : 'esperan'} al negocio`

// La frase de cierre (T-02) separa lo que ya está resuelto de lo que sigue abierto: N sale
// de por_estado.aplicada, nunca escrito a mano.
const FRASE_CIERRE = `Las ${aplicada} aplicadas cierran el dato. Los pedidos abiertos al `
  + `negocio están en la vista 12.`

// T-10: el pie citaba la base pero no las filas del registro que estas dos decisiones
// alimentan (C26, canal; D24, edades) ni el rango de ids de la tabla.
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${v01.n_archivos} archivos de origen, ` +
  `${v01.n_decisiones} decisiones de calidad, DC-01 a DC-15 · filas C26 (canal) y D24 (edades) ` +
  `· fuente: payload e2.json, vistas.V01 y decisiones (pipeline/build_e2.py)`

export default function V01() {
  return (
    <section className="pant v01q" style={{ gap: 'clamp(4px, 0.6vh, 10px)' }}>
      <h1 className="titulo">{TITULO}</h1>

      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <div className="tarjeta" style={{ flex: 1, padding: '7px 12px' }}>
          <span className="kpi-lbl">Archivos con al menos una decisión</span>
          <span className="kpi-val tabular" style={{ fontSize: '19px', marginTop: '2px' }}>
            {entero(v01.n_archivos)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: 1, padding: '7px 12px' }}>
          <span className="kpi-lbl">Decisiones de calidad tomadas</span>
          <span className="kpi-val tabular" style={{ fontSize: '19px', marginTop: '2px' }}>
            {entero(v01.n_decisiones)}
          </span>
        </div>
        <div className="tarjeta" style={{ flex: 1.3, padding: '7px 12px' }}>
          <span className="kpi-lbl">Desglose por estado</span>
          <div style={{ display: 'flex', gap: '12px', marginTop: '5px', flexWrap: 'nowrap' }}>
            <MiniEstado estado="aplicada" n={aplicada} />
            <MiniEstado estado="declarada" n={declarada} />
            <MiniEstado estado="pendiente del negocio" n={pendiente} />
          </div>
        </div>
      </div>

      <p style={{
        flexShrink: 0, margin: 0, fontSize: '10.5px', lineHeight: 1.2, color: 'var(--mut2)',
      }}>
        {FRASE_CIERRE}
      </p>

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

      <div style={{ display: 'flex', gap: 'clamp(8px, 1vw, 14px)', flexShrink: 0 }}>
        <ParChico dc={DC03} />
        <ParChico dc={DC07} />
      </div>

      <p className="pie-vista" style={{
        flexShrink: 0, borderTop: '1px solid var(--bd)', paddingTop: '3px',
        margin: 0, font: '400 9px/1.25 var(--mono)', color: 'var(--mut2)',
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

/** Par chico antes/después con su id de decisión visible (DISENO.md regla 3). Cada lado
 *  lleva valor y etiqueta tal como salen de `dc.antes`/`dc.despues`: para DC-03 son las
 *  grafías de canal, para DC-07 las edades fuera de rango. Más chico que <ParAntesDespues>
 *  (V04, V06…) porque acá el par es un anexo de la tabla, no el contenido principal. */
function ParChico({ dc }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: '9px',
      border: '1px solid var(--bd)', borderRadius: '3px', padding: '4px 10px',
    }}>
      <span className="tabular" style={{
        flexShrink: 0, font: '600 9px/1.15 var(--mono)', color: 'var(--mut2)',
      }}>{dc.id}</span>
      <span style={{
        flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', fontSize: '9.5px', color: 'var(--mut)',
      }} title={dc.archivo}>
        {dc.archivo}
      </span>
      <div className="ban-par" style={{ marginLeft: 'auto', flexShrink: 0, minWidth: 0 }}>
        <div className="par-item par-antes" style={{ maxWidth: '116px' }}>
          <span className="par-lbl">Antes</span>
          <span className="par-val tabular" style={{ fontSize: '12px' }}>{entero(dc.antes.valor)}</span>
          <span style={{ fontSize: '8px', lineHeight: 1.1, color: 'var(--mut)' }} title={dc.antes.etiqueta}>
            {recortar(dc.antes.etiqueta, 32)}
          </span>
        </div>
        <span className="par-flecha" aria-hidden="true" style={{ fontSize: '12px' }}>→</span>
        <div className="par-item par-despues" style={{ maxWidth: '116px' }}>
          <span className="par-lbl">Después</span>
          <span className="par-val tabular" style={{ fontSize: '12px' }}>{entero(dc.despues.valor)}</span>
          <span style={{ fontSize: '8px', lineHeight: 1.1, color: 'var(--mut2)' }} title={dc.despues.etiqueta}>
            {recortar(dc.despues.etiqueta, 32)}
          </span>
        </div>
      </div>
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
        padding: '1px 7px', borderRadius: '3px',
        border: `1px solid ${e.color}`, color: e.color,
        font: '600 9.5px/1.15 var(--mono)', whiteSpace: 'nowrap',
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
