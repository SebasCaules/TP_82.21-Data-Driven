// V12 · Lo que se le reporta a Casa Óga — última vista del riel. Sin antes/después y sin
// gráfico (DISENO.md). Cada fila sale de D2.vistas.V12.reportes (CONTRACT_E2.md §3): id, qué se
// informa y el detalle. Nada se escribe a mano: el conteo del título es reportes.length y las
// cifras de la fila de DC-09 son las de vistas.V10.
//
// (29/09, cierre) Hasta ese día la vista era «Lo que le pedimos a Casa Óga», con un pedido (DC-09)
// y, debajo, lo que se reportaba sin esperar respuesta. Ya no hay pedidos: Casa Óga no tiene la
// causa de la caída de sep-dic 2025, pidió que no se asuma una y dejó el criterio de esos meses al
// equipo (consulta 2), que ya está aplicado. La causa pasa a lo que se le reporta, junto con los
// tres reportes del 28/09 (la «consulta 10» salió el 29/09: nunca se le preguntó)
// (D18, DC-07 y DC-13). Regla de dos estados para el público (CLAUDE.md del vault, §8): nada se
// muestra como pendiente.
//
// (24/09) La fila de la cifra central va primero y marcada: una barra en --acc a la izquierda y
// el texto en peso 600, no un color de excepción.

import { D2 } from '../datos_e2.js'
import { fechaCorta, montoM, pct } from '../formato.js'

const REPORTES = D2.vistas.V12.reportes
const R = REPORTES.length
const V10 = D2.vistas.V10

// Título con el conteo en letras hasta nueve; de diez en adelante, en número.
const NUMEROS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
function numeroEnLetras(n) {
  if (n >= 1 && n <= 9) return NUMEROS[n].charAt(0).toUpperCase() + NUMEROS[n].slice(1)
  return String(n)
}

// "V03" -> 3: el número de la vista es el de su id (mismo criterio que V01 y V02).
const numeroVista = (id) => Number(id.slice(1))

// Cifra y unidad en un renglón: «50,4 %» y «ARS 96,4 M» no se parten a 1152×640.
const duro = (s) => s.replace(/ (%|M\b)/g, ' $1').replace(/ARS /g, 'ARS ')

// (24/09) Nombres de archivo en llano, en la capa de display: «Contenido_Campanias.csv» es jerga
// para el directorio. El payload no se toca.
const ARCHIVO_LLANO = {
  'Contenido_Campanias.csv': 'el archivo de contenido de campañas',
  'Historial_Bajas_No_Contacto.csv': 'el historial de bajas',
}
const llano = (s) => s.replace(/[\w.]+\.csv\b/g, (m) => ARCHIVO_LLANO[m] ?? m)

// La fila de DC-09 va primero y dice con qué sensibilidad se informa la cifra central.
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const CLAVE = REPORTES.find((r) => r.id === DC09?.id)
const FILAS = CLAVE ? [CLAVE, ...REPORTES.filter((r) => r !== CLAVE)] : REPORTES
const SENSIBILIDAD = CLAVE
  ? duro(`La cifra central, ${pct(V10.despues.pct)} en riesgo y exposición anual de ${montoM(V10.despues.exposicion_M)} `
    + `al ${fechaCorta(D2.meta.corte_ref)}, se informa con esta sensibilidad: al ${fechaCorta(V10.sens.corte)}, `
    + `${pct(V10.sens.pct)} y ${montoM(V10.sens.exposicion_M)} (vistas ${numeroVista(DC09.vista)} y ${numeroVista('V10')}).`)
  : null

const TITULO = `${numeroEnLetras(R)} ${R === 1 ? 'punto que se le reporta' : 'puntos que se le reportan'} a Casa Óga`

// (24/09) El pie queda en lo que el directorio usa: el corte y la base. La fuente va al title.
const PIE = `corte ${fechaCorta(D2.meta.corte_ref)} · base: ${R} ${R === 1 ? 'reporte' : 'reportes'}`
const FRASE = `Las ${D2.decisiones.length} decisiones están aplicadas o declaradas. `
  + 'Esto se le informa a Casa Óga: las causas y las correcciones en origen son de su lado.'

export const meta = {
  id: 'V12',
  corto: 'Reportes a Casa Óga',
  titulo: TITULO,
  pie: PIE,
}

export default function V12Pedidos() {
  return (
    <section className="pant v12">
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }} title={FRASE}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '55%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--ink)' }}>
              <Th primera>id</Th>
              <Th>qué se informa</Th>
              <Th>detalle</Th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((r) => {
              const clave = r === CLAVE
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--bd2)' }}>
                  <CeldaId id={r.id} marcada={clave} />
                  <td style={{ ...celda, color: 'var(--ink)', fontWeight: clave ? 600 : 500 }}>{duro(r.que)}</td>
                  <td style={{ ...celda, color: 'var(--mut2)' }}>
                    {duro(llano(r.detalle))}
                    {clave && SENSIBILIDAD && (
                      <span style={{
                        display: 'block', marginTop: 'clamp(3px, 0.6vh, 8px)',
                        color: 'var(--ink)', fontWeight: 600,
                      }}>
                        {SENSIBILIDAD}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// Texto entero (sin recorte). El padding reparte 15vh entre las filas: con cinco filas da los 3vh
// de siempre; si el payload suma una, baja solo y la tabla sigue terminando antes del pie a
// 1152×640. (24/09) La letra de las celdas sube hasta 19 px a 1920.
const AIRE = `clamp(6px, ${(15 / Math.max(R, 5)).toFixed(2)}vh, 36px)`
const celda = {
  padding: `${AIRE} 10px ${AIRE} 0`, verticalAlign: 'top',
  fontSize: 'clamp(12.5px, 1.05vw, 19px)', lineHeight: 1.32,
}
// La primera columna deja lugar a la barra de la fila marcada, en todas las filas por igual.
const primera = { paddingLeft: 10 }

/** (26/09, revisión UX H13) El id de la fila. Un reporte que no es una decisión no muestra su
 *  código («D18 (registro)»): va en el title. La barra marca la fila de la cifra
 *  central, sin mover la columna. */
function CeldaId({ id, marcada = false }) {
  const esDc = id.startsWith('DC-')
  const title = esDc ? undefined
    : id.startsWith('Consulta') ? `${id.toLowerCase()} de la Parte A (3.4)`
      : `${id.replace(/\s*\(.*\)$/, '')}: dato del registro de cifras, no una decisión`
  return (
    <td className="tabular" title={title}
        style={{
          ...celda, ...primera, color: 'var(--mut2)', fontFamily: 'var(--mono)',
          fontSize: 'clamp(11px, 0.8vw, 14px)',
          boxShadow: marcada ? 'inset 3px 0 0 var(--acc)' : 'none',
        }}>
      {esDc ? id : '—'}
    </td>
  )
}

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
