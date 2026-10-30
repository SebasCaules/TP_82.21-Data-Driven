// V11 · ¿Cómo se llega? (Parte D 12.1 a 12.4; lámina 23 de la clase 13; diapositiva 16 de C3). Nueva el 30/10, con
// el rehecho de /e3/ sin «Explorar» (e3/DISENO.md, «Decisiones (30/10)»).
//
// Sin banda: las cuatro piezas que pide la lámina 23, en un solo svg de dos columnas.
// - Izquierda, arriba, las fases (D 12.1) con su barra sobre las 20 semanas del plan (D3.plan, J50), su responsable
//   y su criterio de cierre; debajo, los ocho hitos (D 12.2) con su semana, responsable y evidencia.
// - Derecha, arriba, las precondiciones (D 12.3) agrupadas por plazo, con responsable y lo que pasa si no se
//   resuelven. Lo que decide María G. y en qué semana (hasta el 30/10 en «Explorar» de la vista 7, «Qué decide»)
//   está acá: las filas a su cargo van marcadas. Debajo, los roles (D 12.4): un integrante del equipo por rol, con
//   su entregable clave, y los de Casa Óga en una línea.
// Ninguna cifra escrita acá: las semanas y fechas salen de D3.plan (J50) y el resto de D3 con formato.js. Los textos
// resumen las tablas de la D en fragmentos.

import { Lienzo } from '../../../src/graficos.jsx'
import { D3 } from '../datos_e3.js'
import { entero, fecha, fijo, pct } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, Bloque, CTX, Parrafo, altoParrafo } from './piezas.jsx'
import './V11.css'

const PL = D3.plan
const HS = PL.hitos_semana
const PZ = PL.plazos
const P = D3.piloto
const S = D3.solucion
const MEDIO = pct(S.completitud_minima, 0)
const FASE = Object.fromEntries(PL.fases.map((f) => [f.id, f]))

// D 12.1: responsable y criterio de cierre de cada fase.
const CIERRE = {
  gobierno: ['Sebastian C.', 'Alcance, target y control aprobados; acuerdo y política de retención'],
  datos: ['Matías S.', `Pipeline que lee las exportaciones, frena un mes bajo ${MEDIO} y une la identidad`],
  planilla: ['Sebastian C.', `Planilla de ${entero(P.lista_mes)} con el filtro probado; tablero; guía de corrida`],
  prueba: ['Sebastian C.', 'Corrida de prueba; taller con el equipo de Sofía R.'],
  piloto: ['Sofía R.', `${entero(P.meses)} listas enviadas; compra a ${entero(S.oferta_dias)} días medida cada mes`],
  decision: ['Juan Manuel R.', `Informe; María G. decide con ${fijo(P.umbral_produccion_pp, 1)} puntos; traspaso al operador`],
}
for (const f of PL.fases) if (!CIERRE[f.id]) throw new Error(`V11: falta el cierre de la fase «${f.id}»`)

/** La barra de una fase sobre las semanas del plan, en la celda de la tabla. */
function barra(fila, { x, y, w, h, f }) {
  const N = PL.semanas
  const X = (s) => x + (s / N) * w
  const alto = Math.min(h * 0.42, f * 1.1)
  const piloto = fila.fase.id === 'piloto'
  return (
    <g>
      <line x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} stroke="var(--bd)" strokeWidth="1" />
      <rect x={X(fila.fase.desde_semana - 1)} y={y + h / 2 - alto / 2} width={X(fila.fase.hasta_semana) - X(fila.fase.desde_semana - 1)}
            height={alto} fill={piloto ? ACC : 'var(--e3-ctx-relleno, #a9b1bf)'} />
    </g>
  )
}
const FASES = {
  columnas: [{ titulo: 'Fase', ancho: 1.45 }, { titulo: 'Semanas', ancho: 0.62, alinear: 'izq' },
    { titulo: `1 a ${PL.semanas}`, ancho: 1.05, dibujar: barra }, { titulo: 'Responsable', ancho: 0.95 },
    { titulo: 'Cierra con', ancho: 2.1 }],
  filas: PL.fases.map((x) => ({
    fase: x, marcada: x.id === 'piloto',
    celdas: [x.nombre, x.desde_semana === x.hasta_semana ? `${x.desde_semana}` : `${x.desde_semana} a ${x.hasta_semana}`, '',
      CIERRE[x.id][0], CIERRE[x.id][1]],
    title: `${x.nombre}: semanas ${x.desde_semana} a ${x.hasta_semana} (${fecha(x.desde)} a ${fecha(x.hasta)}), `
      + `${x.semanas} ${x.semanas === 1 ? 'semana' : 'semanas'}. Responsable: ${CIERRE[x.id][0]}. Cierra con: ${CIERRE[x.id][1]}.`,
  })),
}

// D 12.2: los ocho hitos (la semana sale de D3.plan.hitos).
const HITO = {
  1: ['Alcance aprobado', 'María G.', 'Respuesta escrita al resumen del hito'],
  2: ['Target y operador del piloto aprobados', 'María G.', 'Respuesta escrita de María G.'],
  3: ['Acciones legales previas hechas', 'María G.', 'Constancia de la AAIP, acuerdo, política, avisos y filtro probado'],
  4: ['Grupo de control y planilla aprobados', 'Sofía R.', 'Aprobación escrita sobre una planilla de prueba'],
  5: ['Extracto regenerado completo', 'Matías S.', `Control del pipeline: mismo corte, ningún mes bajo ${MEDIO}`],
  6: ['Go-live: sale la primera lista', 'María G.', 'Los cinco criterios de go-live con su evidencia'],
  7: ['Operador de después elegido', 'María G.', 'Opción por escrito: analista part-time o soporte'],
  8: ['Decisión de producción', 'María G.', `Diferencia contra el control al tercer mes, frente a ${fijo(P.umbral_produccion_pp, 1)} puntos`],
}
const HITOS = {
  columnas: [{ titulo: '#', ancho: 0.25 }, { titulo: 'Hito', ancho: 1.75 }, { titulo: 'Semana', ancho: 0.6, alinear: 'izq' },
    { titulo: 'Responsable', ancho: 0.85 }, { titulo: 'Evidencia', ancho: 2.35 }],
  filas: PL.hitos.map((h) => ({
    marcada: h.clave === 'go_live' || h.clave === 'decision',
    celdas: [String(h.n), HITO[h.n][0], `${h.semana}`, HITO[h.n][1], HITO[h.n][2]],
  })),
}

// D 12.3: las precondiciones, agrupadas por plazo. Marcadas, las que decide María G.
const PRECONDICIONES = {
  columnas: [{ titulo: 'Semana', ancho: 0.55, alinear: 'izq' }, { titulo: 'Acción y responsable', ancho: 2.55 },
    { titulo: 'Si no se resuelve', ancho: 1.6 }],
  filas: [
    { marcada: true, celdas: [`${HS.alcance}`, 'Aprobar el alcance: regla sin modelo y piloto con control (María G.; Carlos F. si cambia el presupuesto)',
      'El piloto no arranca y el plan se rehace'] },
    { marcada: true, celdas: [`${HS.regla_y_operador_del_piloto}`, 'Aprobar la regla del target (María G., con Sofía R.); firmar el acuerdo de confidencialidad, aprobar la retención y designar quién inscribe las bases (María G.)',
      'Se rehacen las cuatro etapas; sin acuerdo no llega el extracto'] },
    { celdas: [`${HS.regla_y_operador_del_piloto}`, 'Aprobar el grupo de control (Sofía R.)', 'El piloto no mide la tasa de éxito'] },
    { celdas: [`${HS.acciones_legales_y_control}`, 'Inscribir las bases; revisar avisos y No Llame (asesor legal); probar el filtro (Sebastian C.); computadora y carpeta (IT interno)',
      'No sale la primera lista'] },
    { celdas: [`${PZ.aviso_extracto}`, 'Pedir a Lucía O. el extracto regenerado (Sebastian C.); empezar la adenda del CRM (asesor legal)',
      'Sin extracto no hay lista; sin adenda no hay producción'] },
    { marcada: true, celdas: [`${HS.operador_despues_del_piloto}`, 'Elegir el operador de después del piloto: analista part-time o soporte (María G.)',
      'La lista deja de correr al cerrar el piloto'] },
  ],
}

// D 12.4: un integrante del equipo por rol, con su entregable clave; y los de Casa Óga.
const ROLES = {
  columnas: [{ titulo: 'Integrante', ancho: 1.05 }, { titulo: 'Rol', ancho: 1.3 }, { titulo: 'Entregable clave', ancho: 2.3 }],
  filas: [
    ['Sebastian C.', 'Coordinación y corrida', `Planilla mensual de ${entero(P.lista_mes)} con la prueba del filtro`],
    ['Matías S.', 'Datos', 'Pipeline de integración probado con el extracto regenerado'],
    ['Francisco C.', 'Diseño del control', 'Registro del sorteo de cada mes'],
    ['Juan Manuel R.', 'Medición', 'Informe del piloto al tercer mes'],
    ['Tomas F.', 'Documentación y capacitación', 'Guía de corrida'],
  ].map((celdas) => ({ celdas })),
}
const CASA_OGA = 'De Casa Óga: María G. autoriza el go-live; Sofía R., las campañas del piloto; Lucía O., la exportación '
  + 'mensual; IT interno, la computadora del operador; el asesor legal, la adenda del CRM.'

export const meta = { id: 'V11' }

function Dibujo({ w, h, k }) {
  const gap = 26 * k
  const gapY = 12 * k
  const wIzq = Math.round((w - gap) * 0.53)
  const wDer = w - gap - wIzq
  const fCasa = 11 * k
  const altoCasa = altoParrafo(CASA_OGA, wDer, fCasa) + 4 * k
  // Cada columna reparte su alto entre sus dos tablas según las filas que tiene.
  const hFases = Math.round((h - gapY) * 0.47)
  const hPre = Math.round((h - altoCasa - gapY) * 0.6)
  const xD = wIzq + gap
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Plan del proyecto: fases, hitos, precondiciones y roles">
      <Bloque x={0} y={0} w={wIzq} h={hFases} k={k} base={12}
              titulo={`Fases: ${PL.semanas} semanas desde el ${fecha(PL.semana_1)}`} columnas={FASES.columnas} filas={FASES.filas} />
      <Bloque x={0} y={hFases + gapY} w={wIzq} h={h - hFases - gapY} k={k} base={12}
              titulo="Hitos: semana, responsable y evidencia" columnas={HITOS.columnas} filas={HITOS.filas} />
      <line x1={wIzq + gap / 2} x2={wIzq + gap / 2} y1={0} y2={h} stroke="var(--bd)" strokeWidth="1" />
      <Bloque x={xD} y={0} w={wDer} h={hPre} k={k} base={12}
              titulo="Precondiciones; marcadas, las que decide María G." columnas={PRECONDICIONES.columnas} filas={PRECONDICIONES.filas} />
      <Bloque x={xD} y={hPre + gapY} w={wDer} h={h - hPre - gapY - altoCasa} k={k} base={12}
              titulo="Roles: un integrante por rol" columnas={ROLES.columnas} filas={ROLES.filas} />
      <Parrafo x={xD} y={h - altoCasa + 4 * k} w={wDer} f={fCasa} texto={CASA_OGA} color={CTX} />
    </svg>
  )
}

export default function V11Plan() {
  const k = useEscalaTexto()
  const go = PL.hitos.find((x) => x.clave === 'go_live')
  return (
    <section className="pant v11">
      <div className="tarjeta e3-v11-graf" title="Parte D 12.1 (fases), 12.2 (hitos), 12.3 (precondiciones) y 12.4 (roles); registro J50.">
        <p className="e3-conclusion">
          {`${PL.semanas} semanas: la primera lista sale en la semana ${go.semana} y `}
          <b>{`María G. decide en la ${HS.decision}`}</b>
        </p>
        <div className="e3-v11-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
