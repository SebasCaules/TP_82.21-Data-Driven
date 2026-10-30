// V09 · ¿Qué tiene que estar listo para el go-live? (Parte D 10.1 a 10.3; diapositiva 15 de C3). Nueva el 30/10, con
// el rehecho de /e3/ sin «Explorar» (e3/DISENO.md, «Decisiones (30/10)»).
//
// Sin banda: dos tablas en un solo svg, a todo el ancho.
// - Arriba, los cinco criterios de go-live de la D 10.3, cada uno verificable con sí o no, con lo que tiene que estar
//   y quién responde (los requerimientos que bloquean de la D 10.1, agrupados bajo el criterio que los verifica),
//   cómo se verifica, quién aprueba y en qué semana (hitos 2 a 6 de la D 12.2, D3.plan.hitos). El quinto ya se cumple
//   en el test. Debajo, una línea: el alcance, que se aprueba antes, en la semana 1, y lo que no bloquea el go-live
//   pero sí la producción (D 10.1: exportación automática, adenda del CRM, operador de después del piloto).
// - Abajo, el monitoreo en producción de la D 10.2: qué se mide, la alerta, quién mira y qué se hace si se dispara;
//   con la alerta de drift (J53) y la del impacto (2,87 y 40,4 puntos).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js. Los textos resumen la D en
// fragmentos.

import { Lienzo } from '../../../src/graficos.jsx'
import { D3 } from '../datos_e3.js'
import { entero, fecha, fijo, pct } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { Bloque, INK, Parrafo, altoParrafo } from './piezas.jsx'
import './V09.css'

const P = D3.piloto
const S = D3.solucion
const MA = D3.test.meta_y_alerta
const DR = D3.monitoreo.drift
const HS = D3.plan.hitos_semana
const PZ = D3.plan.plazos
const MEDIO = pct(S.completitud_minima, 0)
const semana = (n) => `Semana ${n}`

if (!(MA.regla_aciertos_por_mes >= MA.meta_aciertos_por_mes)) {
  throw new Error('V09: la regla ya no llega a la meta en test; el criterio 5 no se cumple')
}

const CRITERIOS = {
  columnas: [{ titulo: 'Criterio de go-live', ancho: 1.6 }, { titulo: 'Qué tiene que estar y quién responde', ancho: 2.9 },
    { titulo: 'Cómo se verifica', ancho: 2.2 }, { titulo: 'Aprueba', ancho: 1.05 }, { titulo: 'Cuándo', ancho: 0.8 }],
  filas: [
    { celdas: ['1 · Acciones legales previas hechas',
      'Bases inscriptas en la AAIP (quien designe María G.) · filtro de consentimiento probado (Sebastian C.) · acuerdo de '
      + 'confidencialidad (Sebastian C. y María G.) · política de retención (Matías S. y María G.) · avisos y No Llame revisados (asesor legal)',
      'Constancia de la AAIP; prueba del filtro sin ningún cliente sin consentimiento o con baja; acuerdo firmado; política aprobada; revisión escrita',
      'María G., con el asesor legal', semana(HS.acciones_legales_y_control)] },
    { celdas: ['2 · Extracto regenerado completo',
      `Exportación con un mismo corte (Lucía O.) · pipeline que la lee, une la identidad y frena un mes con menos del ${MEDIO} `
      + '(Matías S.) · computadora y carpeta de acceso restringido (IT interno)',
      `Control del pipeline en la computadora asignada: mismo corte y ningún mes debajo del ${MEDIO}`,
      'Matías S.', semana(HS.extracto_regenerado)] },
    { celdas: ['3 · Regla del target y operador del piloto aprobados',
      'Definición de cliente en riesgo, con revisión de Sofía R. · operador del piloto: el equipo consultor (Sebastian C.)',
      'Respuesta escrita de María G. al resumen del hito', 'María G.', semana(HS.regla_y_operador_del_piloto)] },
    { celdas: ['4 · Grupo de control y planilla aprobados',
      `${entero(P.control_mes)} de control por mes fuera del ${pct(S.alto_valor, 0)} de mayor facturación (Sofía R.) · planilla con `
      + 'columnas de exclusión y de marca del vendedor (Sebastian C.)',
      'Aprobación escrita de Sofía R. sobre una planilla de prueba', 'Sofía R.', semana(HS.acciones_legales_y_control)] },
    { marcada: true, celdas: [`5 · La lista acierta ${entero(MA.meta_aciertos_por_mes)} o más por mes, sin modelo`,
      'La regla del umbral (equipo consultor)', `Test de la etapa 4: ${fijo(MA.regla_aciertos_por_mes, 2)} por mes`,
      'María G.', 'Se cumple'] },
  ],
}
const NOTA = `Antes de todo, en la semana ${HS.alcance}, María G. aprueba el alcance: regla sin modelo y piloto con control. `
  + `Go-live es la primera lista, en la semana ${HS.go_live} (${fecha(D3.plan.hitos.find((h) => h.clave === 'go_live').desde)}). `
  + 'No bloquean el go-live, sí la producción: la exportación automática (IT interno), la adenda del CRM (asesor legal, '
  + `desde la semana ${PZ.adenda_crm_desde}) y el operador de después del piloto (María G., semana ${HS.operador_despues_del_piloto}).`

const MONITOREO = {
  columnas: [{ titulo: 'Qué se mide', ancho: 1.35 }, { titulo: 'Indicador', ancho: 2.4 }, { titulo: 'Alerta', ancho: 2.1 },
    { titulo: 'Si se dispara', ancho: 2.5 }, { titulo: 'Quién', ancho: 1.15 }],
  filas: [
    { celdas: ['Calidad de los datos', 'Operaciones del mes contra el mismo mes del año anterior; clientes sin consentimiento en la planilla',
      `Menos de ${MEDIO}; un solo cliente`, 'El mes no se usa y la lista espera; la planilla no sale', 'Operador (Sebastian C.)'] },
    { celdas: ['Desempeño de la lista', `Aciertos de cada lista a los ${entero(D3.caso.ventana_dias)} días; precisión por género y en el alto valor`,
      `Precisión debajo de ${pct(MA.alerta_precision, 1)} dos meses seguidos (meta: ${entero(MA.meta_aciertos_por_mes)} por mes)`,
      'Revisar el umbral de inactividad antes de la lista siguiente', 'Juan Manuel R.; Matías S.'] },
    { celdas: ['Cambio en los datos (drift)', `Clientes en riesgo sobre elegibles, con la identidad unida: ${pct(DR.referencia, 1)} al ${fecha(DR.referencia_corte)}`,
      `Más de ${fijo(DR.umbral_suba_pp, 1)} puntos de suba en un mes`,
      'Comparar con las ventas del rubro; adelantar la revisión del umbral, con María G.', 'Matías S.'] },
    { celdas: ['Adopción', 'Parte de la lista que Marketing contactó', `Menos de ${pct(S.alerta_adopcion, 0)}`,
      'Sebastian C. revisa con Sofía R. qué la frena', 'Juan Manuel R.'] },
    { marcada: true, celdas: ['Impacto de negocio', `Compra a ${entero(S.oferta_dias)} días: contactados menos control`,
      `Al tercer mes, debajo de ${fijo(P.diferencia_detectable_pp, 2)} puntos no hay efecto; debajo de ${fijo(P.umbral_produccion_pp, 1)}, la lista no paga su primer año`,
      'No se invierte en producción; María G. elige cerrar o un segundo piloto sin descuento', 'Juan Manuel R.'] },
  ],
}

export const meta = { id: 'V09' }

function Dibujo({ w, h, k }) {
  const fN = 12 * k
  const gap = 16 * k
  const altoNota = altoParrafo(NOTA, w, fN) + 6 * k
  const hResto = h - altoNota - gap * 2
  const hCrit = Math.round(hResto * 0.55)
  const yMon = hCrit + altoNota + gap * 2
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Criterios de go-live con quién responde y monitoreo en producción">
      <Bloque x={0} y={0} w={w} h={hCrit} k={k} titulo={`Criterios de go-live: sí o no antes de la semana ${HS.go_live}`}
              columnas={CRITERIOS.columnas} filas={CRITERIOS.filas} base={12.5} />
      <Parrafo x={0} y={hCrit + gap * 0.6} w={w} f={fN} texto={NOTA} color={INK} />
      <line x1={0} x2={w} y1={hCrit + altoNota + gap} y2={hCrit + altoNota + gap} stroke="var(--bd)" strokeWidth="1" />
      <Bloque x={0} y={yMon} w={w} h={h - yMon} k={k} titulo="Monitoreo en producción: umbral y acción"
              columnas={MONITOREO.columnas} filas={MONITOREO.filas} base={12.5} />
    </svg>
  )
}

export default function V09GoLive() {
  const k = useEscalaTexto()
  return (
    <section className="pant v09">
      <div className="tarjeta e3-v09-graf" title="Parte D 10.1 (requerimientos por dimensión), 10.2 (monitoreo) y 10.3 (criterios de go-live); semanas de la D 12.2.">
        <p className="e3-conclusion">
          La primera lista sale cuando <b>los cinco criterios dan sí</b>; el quinto ya se cumple en el test
        </p>
        <div className="e3-v09-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
