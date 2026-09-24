// V12 · Lo que le pedimos a Casa Óga — última vista del riel. Sin antes/después y sin
// gráfico (DISENO.md): es la lista de lo que el equipo no puede resolver con lo que el
// negocio ya entregó. Cada fila sale de D2.vistas.V12.pedidos (CONTRACT_E2.md §3): id, qué
// se pide y el detalle. Nada se escribe a mano: el conteo del título es pedidos.length, los
// meses son vistas.V03.meses_flag, la frase cuenta D2.decisiones con los ids de los pedidos
// (la cuenta de V01) y las cifras de la fila marcada son las de vistas.V10.despues.
//
// (24/09) Sale la columna ESTADO. Decía «○ pedido abierto» en las cinco filas, así que no
// distinguía ninguna, y el ○ terracota es el mismo glifo y el mismo color con que V01 marca
// «pendiente», puesto sobre tres filas (DC-13, DC-09, DC-07) que V01 no muestra como
// pendientes. La pastilla propia (auditoría T-02, CR-07, T-10) quería separar el pedido de
// la decisión y terminaba mezclándolos. Que el pedido sigue abierto ya lo dicen el título y
// la frase; qué decisión falta de verdad lo dice la frase, con el estado de D2.decisiones.
//
// (24/09) El pedido del que depende la cifra central va primero y marcado: el de los meses
// que DC-09 deja con cobertura no confirmada. La fila dice qué destraba, con las cifras de
// vistas.V10.despues (riesgo y exposición al corte, hoy en revisión), y no anticipa la
// sensibilidad al 31/08 como si fuera el destino: nadie sabe todavía qué va a contestar
// Casa Óga. La marca es una barra en --acc a la izquierda y el texto en peso 600, no un
// color de excepción: no es un problema nuevo, es la prioridad. Los demás siguen en el orden
// del payload. El orden completo por impacto y un «qué destraba» para cada fila esperan dos
// campos nuevos del pipeline (rotulo, destraba): cruzar p.id con D2.decisiones[].vista no
// alcanza, porque «D18 (registro)» no es una decisión y DC-15 remite a esta misma vista.

import { D2 } from '../datos_e2.js'
import { fechaCorta, mesCorto, montoM, pct } from '../formato.js'

const V = D2.vistas.V12
const PEDIDOS = V.pedidos
const FLAG = D2.vistas.V03.meses_flag
const CENTRAL = D2.vistas.V10.despues

// Título con el conteo en letras hasta nueve (DISENO.md trae el ejemplo con "Cinco"); de
// diez en adelante, en número, porque a partir de ahí la palabra pesa más que la cifra.
const NUMEROS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
function numeroEnLetras(n) {
  if (n >= 1 && n <= 9) return NUMEROS[n].charAt(0).toUpperCase() + NUMEROS[n].slice(1)
  return String(n)
}

// "V03" -> 3: el riel numera por posición y las vistas van en orden de archivo (V01..V12),
// así que el número de la vista es el de su id (mismo criterio que V01 y V02).
const numeroVista = (id) => Number(id.slice(1))

// Cifra y unidad en un renglón: «50,4 %» y «ARS 96,4 M» no se parten a 1152×640. Se aplica
// también al texto del payload («menos del 60 % de…»).
const duro = (s) => s.replace(/ (%|M\b)/g, '\u00a0$1').replace(/ARS /g, 'ARS\u00a0')

// (24/09) Nombres de archivo en llano, en la capa de display (como formato.categoria con las
// tildes): «Contenido_Campanias.csv» es jerga para el directorio. El payload no se toca.
const ARCHIVO_LLANO = {
  'Contenido_Campanias.csv': 'el archivo de contenido de campañas',
  'Historial_Bajas_No_Contacto.csv': 'el historial de bajas',
}
const llano = (s) => s.replace(/[\w.]+\.csv\b/g, (m) => ARCHIVO_LLANO[m] ?? m)

// (24/09) El pedido que decide la cifra central: el de DC-09, la cobertura de sep-dic que
// deja el riesgo al corte en revisión. Va primero; el resto, en el orden del payload.
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const CLAVE = PEDIDOS.find((p) => p.id === DC09?.id)
const FILAS = CLAVE ? [CLAVE, ...PEDIDOS.filter((p) => p !== CLAVE)] : PEDIDOS
const DESTRABA = CLAVE
  ? duro(`De esta respuesta depende la cifra central: riesgo ${pct(CENTRAL.pct)} y exposición `
    + `${montoM(CENTRAL.exposicion_M)}, hoy en revisión (vistas ${numeroVista(DC09.vista)} y `
    + `${numeroVista('V10')}).`)
  : null

const N = PEDIDOS.length
// (24/09) El título dice cuál de los pedidos importa, no solo cuántos son. Antes: «Cinco
// cosas quedan en manos de Casa Óga», que no distinguía el que mueve la cifra central.
const TITULO = CLAVE
  ? `${numeroEnLetras(N)} pedidos a Casa Óga; el de ${mesCorto(FLAG[0])} a `
    + `${mesCorto(FLAG.at(-1))} decide la cifra central`
  : `${numeroEnLetras(N)} pedidos a Casa Óga siguen abiertos`

// (24/09) La frase decía «Las decisiones ya están tomadas», y D2 dice otra cosa: DC-15 está
// «pendiente del negocio». Ahora se calcula, y con la misma cuenta y las mismas palabras que
// el título y la leyenda de V01: esperan una respuesta de Casa Óga las decisiones con un
// pedido acá (ids DC-) más las pendientes; las aplicadas de ese grupo son las «a confirmar».
// Una versión anterior decía «14 de las 15 están tomadas» y V01 abre con «11 cerradas y 4
// esperan»: el directorio veía dos cuentas distintas en la primera y la última vista. Los
// pedidos que no son decisiones («D18 (registro)») se nombran aparte, sin el paréntesis.
const DECS = D2.decisiones
const ESPERA = new Set(PEDIDOS.map((p) => p.id).filter((id) => id.startsWith('DC-')))
const ESPERAN = DECS.filter((d) => ESPERA.has(d.id) || d.estado === 'pendiente del negocio')
const PEND = ESPERAN.filter((d) => d.estado === 'pendiente del negocio')
const CONF = ESPERAN.filter((d) => d.estado !== 'pendiente del negocio')
const OTROS = PEDIDOS.filter((p) => !DECS.some((d) => d.id === p.id))
  .map((p) => p.id.replace(/\s*\(.*\)$/, ''))

// «a», «a y b», «a, b y c».
const lista = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`)
const ids = (ds) => lista(ds.map((d) => d.id))

const QUIENES = [
  PEND.length && `${ids(PEND)} ${PEND.length === 1 ? 'sigue pendiente' : 'siguen pendientes'}`,
  CONF.length && `${ids(CONF)} ${CONF.length === 1
    ? 'ya se aplica, pero falta confirmarla' : 'ya se aplican, pero falta confirmarlas'}`,
].filter(Boolean).join(' y ')
const FRASE_ABIERTOS = (ESPERAN.length
  ? `${ESPERAN.length} de las ${DECS.length} decisiones ${ESPERAN.length === 1 ? 'espera' : 'esperan'} `
    + `una respuesta de Casa Óga: ${QUIENES}.`
  : `Ninguna de las ${DECS.length} decisiones espera una respuesta de Casa Óga.`)
  + (OTROS.length === 1 ? ` El\u00a0pedido\u00a0${OTROS[0]} no es una decisión: es un dato del registro.` : '')
  + (OTROS.length > 1 ? ` Los pedidos ${lista(OTROS)} no son decisiones: son datos del registro.` : '')

// (24/09) El pie queda en lo que el directorio usa, como en V01: el corte y la base, las dos
// cosas calculadas. Salen «consultas 1 a 9 de la Parte A, 3.4» y «respuestas del 22/09», que
// estaban escritas a mano (D2.meta no las trae) y son referencias para la cátedra, no para la
// sala. La fuente va al title. El corte va primero, como en el resto de las vistas (D1-18).
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${N} pedidos`
const PIE_TITLE = 'fuente: e2.json, vistas.V12.pedidos (pipeline/build_e2.py)'

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

      {/* (24/09) La frase es el mensaje de la vista: crece con la pantalla (13 → 20 px) y
          ya no queda más chica que las celdas de la tabla. */}
      <p style={{
        margin: 0, flexShrink: 0, fontSize: 'clamp(13px, 1.15vw, 20px)', lineHeight: 1.4,
        color: 'var(--ink)', textWrap: 'pretty',
      }}>
        {FRASE_ABIERTOS}
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '55%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <Th primera>id</Th>
              <Th>qué</Th>
              <Th>detalle</Th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((p) => {
              const clave = p === CLAVE
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--bd2)' }}>
                  <td className="tabular" style={{
                    ...celda, ...primera, color: 'var(--mut2)', fontFamily: 'var(--mono)',
                    fontSize: 'clamp(11px, 0.8vw, 14px)',
                    // La barra marca la fila que decide la cifra central, sin mover la columna.
                    boxShadow: clave ? 'inset 3px 0 0 var(--acc)' : 'none',
                  }}>
                    {p.id}
                  </td>
                  <td style={{ ...celda, color: 'var(--ink)', fontWeight: 600 }}>
                    {duro(p.que)}
                  </td>
                  <td style={{ ...celda, color: 'var(--mut2)' }}>
                    {duro(llano(p.detalle))}
                    {clave && DESTRABA && (
                      <span style={{
                        display: 'block', marginTop: 'clamp(3px, 0.6vh, 8px)',
                        color: 'var(--ink)', fontWeight: 600,
                      }}>
                        {DESTRABA}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="pie-vista" title={PIE_TITLE}>{PIE}</p>
    </section>
  )
}

// Texto entero (sin recorte). El padding crece con el alto: con 1.4vh la tabla llegaba a
// la mitad de la pantalla a 1920x1080; con 3vh baja mas y a 1152x640 sigue entrando.
// (24/09) La letra de las celdas sube de un tope de 16 px a 19 px: a 1920 sobraba un tercio
// de pantalla debajo de la tabla. A 1152 queda en el piso de siempre (12,5 px). Y el padding
// reparte 15vh entre las filas: con cinco pedidos da los 3vh de siempre; si el payload suma
// uno, baja solo a 2,5vh y la tabla sigue terminando antes del pie a 1152×640.
const AIRE = `clamp(6px, ${(15 / Math.max(N, 5)).toFixed(2)}vh, 36px)`
const celda = {
  padding: `${AIRE} 10px ${AIRE} 0`, verticalAlign: 'top',
  fontSize: 'clamp(12.5px, 1.05vw, 19px)', lineHeight: 1.32,
}
// La primera columna deja lugar a la barra de la fila marcada, en todas las filas por igual.
const primera = { paddingLeft: 10 }

// (24/09) Los rótulos de columna crecen con --e2-rot, como los demás rótulos mono del E2.
function Th({ children, primera: esPrimera }) {
  return (
    <th style={{
      textAlign: 'left', padding: `0 10px 6px ${esPrimera ? 10 : 0}px`,
      font: '600 var(--e2-rot)/1.2 var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em',
      color: 'var(--mut2)',
    }}>
      {children}
    </th>
  )
}
