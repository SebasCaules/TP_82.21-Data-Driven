// V08 · ¿Cómo funciona cada mes? (Parte D 9.2 a 9.5 y Anexo 1; Parte A 1.6; diapositivas 5 y 14 de C3). Nueva el
// 30/10, con el rehecho de /e3/ sin «Explorar» (e3/DISENO.md, «Decisiones (30/10)»).
//
// Sin banda: la vista es el diseño de la solución y necesita el alto entero. Un solo svg con tres piezas:
// - Arriba, el flujo de punta a punta en seis etapas (D 9.2 y el diagrama del Anexo 1): qué ocurre, con qué
//   herramienta, cuándo y quién. La etapa 3 (la regla) va en --acc; la flecha punteada de la 6 a la 3 es la
//   retroalimentación (la tasa medida reemplaza el 1,02 % de la Parte B).
// - Abajo a la izquierda, quién usa la solución y qué decide con ella (D 9.3) y, debajo, el rol de las personas
//   (D 9.4): la regla ordena y decide Sofía R.
// - Abajo a la derecha, el alcance de la primera versión (D 9.5) con el MVP de la diapositiva 5 (A 1.6), que hasta
//   el 30/10 iba detrás de «Explorar» en la vista 3.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js, y el MVP de C3 (diapositiva 5).
// Los textos resumen las tablas de la D en fragmentos.

import { Lienzo } from '../../../src/graficos.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { entero, fijo, pct, pctDirecto, usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, Bloque, CTX, INK, Parrafo, Titulo, altoParrafo } from './piezas.jsx'
import './V08.css'

const P = D3.piloto
const S = D3.solucion
const E = D3.economia
const D5 = C3.DIAPOSITIVAS.find((d) => d.n === 5)
const [LIC, PC] = D5.hechos
const LISTA = entero(P.lista_mes)
const CONTROL = entero(P.control_mes)
const DESC = pct(E.parametros.descuento, 0)
const DIAS = entero(S.oferta_dias)
const VENTANA = entero(D3.caso.ventana_dias)
const MEDIO = pct(S.completitud_minima, 0)
const ALTO_VALOR = pct(S.alto_valor, 0)

const EQUIPO = 'Equipo consultor, en el piloto'
const ETAPAS = [
  { t: 'Ingesta', que: 'Los archivos del mes, con un mismo corte, a una carpeta de acceso restringido',
    con: 'CSV exportados a mano', cuando: 'mensual, tras el corte', quien: 'Lucía O. (Operaciones)' },
  { t: 'Preparación', que: `Une a cada persona, aplica las ${entero(S.decisiones_calidad)} decisiones de calidad y frena un mes con menos del ${MEDIO}`,
    con: 'Pipeline del E2 en Python', cuando: 'con cada exportación', quien: EQUIPO },
  { t: 'La regla', que: `Toma los ${LISTA} contactables más cerca de su umbral; sin modelo`,
    con: 'Un comando', cuando: 'después de cada exportación', quien: EQUIPO, enfasis: true },
  { t: 'Entrega', que: `Planilla de ${LISTA} con ${CONTROL} de control fuera del ${ALTO_VALOR} de mayor facturación; resumen por local; tablero del mes`,
    con: 'Planilla, mail y tablero HTML', cuando: 'semana siguiente al corte', quien: 'Operador; Sofía R., el resumen' },
  { t: 'Decisión', que: `Sofía R. valida las marcas y excluye con motivo; WhatsApp con ${DESC} de descuento, vence a los ${DIAS} días`,
    con: 'Planilla y CRM, carga a mano', cuando: 'en las dos semanas tras el corte', quien: 'Sofía R.' },
  { t: 'Registro', que: `A los ${DIAS} días, quién compró, contactados y control; a los ${VENTANA}, quién cruzó su umbral`,
    con: 'Planilla, campañas del CRM y Python', cuando: `a los ${DIAS} y a los ${VENTANA} días`, quien: 'Juan Manuel R.' },
]
const VUELTA = `La tasa medida reemplaza el ${pct(E.parametros.s_observada, 2)} de la Parte B`
const VUELTA_TITULO = `${VUELTA}; si un modelo vuelve a evaluarse, entrena con estos resultados (D 9.2)`

const USUARIOS = {
  columnas: [{ titulo: 'Quién', ancho: 1.25 }, { titulo: 'Recibe', ancho: 2.2 }, { titulo: 'Decide', ancho: 2.1 },
    { titulo: 'Cuándo', ancho: 1.1 }],
  filas: [
    { marcada: true, celdas: ['Sofía R. (Marketing)', `Planilla de ${LISTA} contactables: días sin comprar, umbral, grupo y marca del vendedor`,
      'A quién escribe, a quién excluye y con qué oferta', 'Mensual'] },
    { celdas: ['Responsables de tienda', 'Resumen por mail con los clientes de su local',
      'Marcar al cliente activo por otro canal; no lo excluyen', 'Antes del envío'] },
    { celdas: ['María G. (sponsor)', 'Resumen escrito de cada mes del piloto',
      `Si se invierte en producción, con ${fijo(P.umbral_produccion_pp, 1)} puntos o más`, 'Al tercer mes'] },
    { celdas: ['Carlos F. (Finanzas)', `Informe en pesos; costo recurrente de ${usd(E.costos.regla_sin_modelo.recurrente_usd)} por año`,
      'Si suma presupuesto para una segunda etapa', 'Al cierre del piloto'] },
    { celdas: ['Directorio', 'Tablero del mes: exposición, recompra y diferencia contra el control',
      'Si conviene seguir invirtiendo', 'Mensual'] },
    { celdas: ['Lucía O. (Operaciones)', 'Aviso con la categoría que empuja la oferta', 'Confirma el stock o pide cambiarla',
      'Antes de cada envío'] },
  ],
}
const ROL = 'La regla ordena y decide Sofía R.: un vendedor marca, no saca, y cada exclusión queda en la planilla con '
  + 'su motivo. Cada cliente se explica con días sin comprar, ritmo habitual y umbral.'

const ALCANCE = {
  columnas: [{ titulo: 'Primera versión', ancho: 1 }, { titulo: 'Definición del equipo', ancho: 3.6 }],
  filas: [
    { marcada: true, celdas: ['Entra', `Lista mensual de ${LISTA} contactables con la regla · controles de mes completo y de `
      + `consentimiento · piloto de ${entero(P.meses)} meses con ${CONTROL} de control por mes · WhatsApp con ${DESC} de descuento por `
      + `${DIAS} días · tablero y resumen por local · guía de corrida y ${entero(S.talleres)} talleres · software libre: `
      + `${plano(LIC.valor)} ${plano(LIC.texto)} y ${plano(PC.valor)}`] },
    { celdas: ['Queda fuera', 'Modelo predictivo: no le gana a la regla · integración con el CRM: el proveedor no confirmó '
      + `si importa listas · exportación automática: los ${usd(E.costos.presupuesto_usd)} no cubren mantenimiento · ofertas `
      + `cofinanciadas · oferta sin descuento, que va a un segundo piloto · medir el ${ALTO_VALOR} de mayor facturación`] },
    { celdas: ['Después', `Con ${fijo(P.umbral_produccion_pp, 1)} puntos o más, producción con operador elegido y adenda del CRM · `
      + `exportación automática · importar al CRM si la carga pasa las ${entero(S.horas_carga_crm)} horas por mes · DNI o cupón `
      + `en caja para bajar el ${pctDirecto(D3.tecnica.ventas_sin_cliente_pct, 1)} de ventas sin cliente · un modelo, solo si su costo baja`] },
  ],
}

export const meta = { id: 'V08' }

function Flujo({ w, h, k }) {
  const n = ETAPAS.length
  const flecha = 18 * k
  const bw = (w - flecha * (n - 1)) / n
  const pad = 9 * k
  const tw = bw - 2 * pad
  // La letra más grande que entra en el alto (con lugar abajo para la vuelta).
  const altoVuelta = 30 * k
  const medir = (f) => {
    const fT = f * 1.05
    const fS = f * 0.86
    return Math.max(...ETAPAS.map((e) => fT * 1.5 + altoParrafo(e.que, tw, f) + fS * 0.6
      + altoParrafo(e.con, tw, fS) + altoParrafo(e.cuando, tw, fS) + altoParrafo(e.quien, tw, fS, 600) + pad * 2))
  }
  let f = 14 * k
  while (medir(f) > h - altoVuelta && f > 9) f -= 0.25
  const fT = f * 1.05
  const fS = f * 0.86
  const bh = Math.min(h - altoVuelta, medir(f) + 6 * k)
  const xDe = (i) => i * (bw + flecha)
  const yV = bh + altoVuelta * 0.55
  return (
    <g>
      {ETAPAS.map((e, i) => {
        const x = xDe(i)
        let y = pad
        const linea = (txt, fx, peso, color) => {
          const el = <Parrafo key={txt} x={x + pad} y={y} w={tw} f={fx} texto={txt} peso={peso} color={color} />
          y += altoParrafo(txt, tw, fx, peso)
          return el
        }
        const titulo = `${i + 1} · ${e.t}`
        const partes = [
          <text key="t" x={x + pad} y={y} fontSize={fT} fontWeight={700} fill={e.enfasis ? ACC : INK}
                dominantBaseline="hanging">{titulo}</text>,
        ]
        y += fT * 1.5
        partes.push(linea(e.que, f, 400, INK))
        y += fS * 0.6
        partes.push(linea(e.con, fS, 400, CTX))
        partes.push(linea(e.cuando, fS, 400, CTX))
        partes.push(linea(e.quien, fS, 600, INK))
        return (
          <g key={e.t}>
            <title>{`${titulo}. ${e.que}. Herramienta: ${e.con}. Frecuencia: ${e.cuando}. Responsable: ${e.quien}.`}</title>
            <rect x={x} y={0} width={bw} height={bh} fill={e.enfasis ? 'var(--azul1)' : 'var(--sup)'}
                  stroke={e.enfasis ? ACC : 'var(--bd)'} strokeWidth={e.enfasis ? 2 : 1} />
            <rect x={x} y={0} width={bw} height={3 * k} fill={e.enfasis ? ACC : 'var(--azul3)'} />
            {partes}
            {i < n - 1 && (
              <path d={`M${x + bw + 3 * k},${bh / 2} h${flecha - 9 * k} l-${4 * k},-${4 * k} m${4 * k},${4 * k} l-${4 * k},${4 * k}`}
                    fill="none" stroke={INK} strokeWidth={1.75} />
            )}
          </g>
        )
      })}
      {/* la vuelta: del registro (6) a la regla (3) */}
      <path d={`M${xDe(5) + bw / 2},${bh} V${yV} H${xDe(2) + bw / 2} V${bh + 5 * k}`} fill="none" stroke={ACC}
            strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={`M${xDe(2) + bw / 2 - 4 * k},${bh + 9 * k} l${4 * k},-${5 * k} l${4 * k},${5 * k}`} fill="none" stroke={ACC}
            strokeWidth={1.5} />
      <text x={xDe(3) + bw / 2 + 4 * k} y={yV - 5 * k} fontSize={fS} fill={ACC} fontWeight={500}>
        {VUELTA}
        <title>{VUELTA_TITULO}</title>
      </text>
    </g>
  )
}

function Dibujo({ w, h, k }) {
  const fT = 11 * k
  const altoT = fT * 1.9
  const gap = 30 * k
  const hFlujo = Math.round(h * 0.38)
  const yAbajo = hFlujo + 18 * k
  const hAbajo = h - yAbajo
  const wIzq = Math.round((w - gap) * 0.56)
  const wDer = w - gap - wIzq
  const fRol = 11.5 * k
  const altoRol = altoParrafo(ROL, wIzq, fRol) + 8 * k
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Cómo funciona cada mes: flujo de punta a punta, quién usa la solución y alcance de la primera versión">
      <Titulo y={fT} f={fT} texto="Flujo de punta a punta, una vez por mes" max={w} />
      <g transform={`translate(0, ${altoT})`}>
        <Flujo w={w} h={hFlujo - altoT} k={k} />
      </g>
      <Bloque x={0} y={yAbajo} w={wIzq} h={hAbajo - altoRol} k={k} titulo="Quién usa la solución y qué decide"
              columnas={USUARIOS.columnas} filas={USUARIOS.filas} base={12.5} />
      <Parrafo x={0} y={h - altoRol + 8 * k} w={wIzq} f={fRol} texto={ROL} color={INK} />
      <line x1={wIzq + gap / 2} x2={wIzq + gap / 2} y1={yAbajo} y2={h} stroke="var(--bd)" strokeWidth="1" />
      <Bloque x={wIzq + gap} y={yAbajo} w={wDer} h={hAbajo} k={k} titulo="Alcance de la primera versión"
              columnas={ALCANCE.columnas} filas={ALCANCE.filas} base={12.5} />
    </svg>
  )
}

export default function V08CadaMes() {
  const k = useEscalaTexto()
  return (
    <section className="pant v08">
      <div className="tarjeta e3-v08-graf" title="Parte D 9.2 (flujo y Anexo 1), 9.3 (usuarios), 9.4 (rol de las personas) y 9.5 (alcance); Parte A 1.6 (MVP).">
        <p className="e3-conclusion">Cada mes, <b>la regla arma la lista y decide Sofía R.</b>; el resultado se mide contra el control</p>
        <div className="e3-v08-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}

