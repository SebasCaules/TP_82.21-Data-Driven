// V10 · La cifra central — ¿cambió la cifra del directorio? Compara el riesgo y la
// exposición del Entregable 1 contra el resultado después de las 15 decisiones DC, y agrega
// la lectura de sensibilidad al 31/08/2025 (DC-09, la ventana sin cobertura no confirmada).
// Todo el contenido sale de D2.vistas.V10, D2.vistas.V02, D2.vistas.V03 y D2.decisiones
// (CONTRACT_E2.md §3): nada se escribe a mano salvo la frase de contrato sobre qué es la
// exposición, que no es un dato sino una regla del proyecto (DISEÑO.md: "no afirma recupero").
//
// (24/09) Arriba, una sola tarjeta: el par E1 → después, con la flecha porque DC-04 mueve el
// mismo indicador al mismo corte, y a su derecha la sensibilidad, un escalón más chica y en
// tinta, separada por un borde punteado y con el aro punteado de ParDoble. No es un «después»
// más: es la misma cifra leída con otro corte, así que no lleva flecha (regla 2 de DISEÑO.md:
// forma, no solo color). «En revisión» pasa del pie al rótulo del 50,4 % y la sensibilidad
// dice qué significa: si sep–dic 2025 están incompletos, el 50,4 % sobrestima el riesgo. Ya
// no se llama «último mes confirmado»: ningún criterio confirma un mes (INT-TRANSVERSAL-1).
// La exposición es cifra, no renglón chico (en V04 también lo es), y la salvedad de pesos y
// recupero va una vez debajo del par; el pie la repite (NAR-V10-1, VIS-V10-1, OMI-V10-1).
//
// (24/09) Alto: antes la tarjeta de arriba tomaba todo el alto libre y quedaba vacía en un
// 80 %. Ahora las dos tarjetas parten del alto de su contenido, se reparten por mitades lo
// que sobra y centran lo suyo; las cifras crecen también con el alto de la pantalla. Con la
// de arriba fija y solo la de abajo creciendo (lo que pedía VIS-V10-1), a 1440 × 900 y a
// 1920 × 1080 el blanco se mudaba abajo: 300 px vacíos entre los Δ y la nota final.
//
// (24/09) Abajo, lo que mueve la cifra y lo que la pone en duda, en tres columnas con el Δ
// como cifra: DC-04 (la única fila de V.cambios, la que la mueve), DC-09 (la sensibilidad:
// −11,9 puntos que hoy el lector tenía que restar de cabeza) y DC-08 (el corte común no la
// mueve frente al E1 porque el E1 ya medía al 31/12/2025: es lo que concilia con el 85,2 %
// de V02). Todo calculado desde D2 (REL-V10-1). La tarjeta de DC-04 se fue: repetía la de
// V04. Con más de una fila en V.cambios, la primera columna las lista una debajo de otra.

import { D2 } from '../datos_e2.js'
import { Lienzo } from '../../../src/graficos.jsx'
import { useEscalaTexto } from '../escala.js'
import ValorMonto from '../ValorMonto.jsx'
import { entero, pct, montoM, decimal, fechaCorta, mesCorto, partesMonto } from '../formato.js'

const V = D2.vistas.V10
const RIESGO_V02 = D2.vistas.V02.riesgo
const DC04 = D2.decisiones.find((d) => d.id === 'DC-04')
const DC08 = D2.decisiones.find((d) => d.id === 'DC-08')
const DC09 = D2.decisiones.find((d) => d.id === 'DC-09')
const DC10 = D2.decisiones.find((d) => d.id === 'DC-10')

// El riel numera por posición y las vistas van en orden de archivo, V01..V12 (vistas/
// index.jsx): el número de la vista es el de su id. Con espacio duro, para que el número no
// quede solo al principio de un renglón.
const numeroVista = (id) => Number(id.slice(1))
const vista = (id) => `vista\u00a0${numeroVista(id)}`

// Los meses marcados por DC-09 salen de V03: «sep–dic 2025», sin partirse en dos renglones
// (unión de palabra después de la raya y espacio duro antes del año).
const FLAG = D2.vistas.V03.meses_flag
const MESES_FLAG = `${mesCorto(FLAG[0]).slice(0, 3)}–\u2060${mesCorto(FLAG[FLAG.length - 1]).slice(0, 3)}`
  + `\u00a0${FLAG[FLAG.length - 1].slice(0, 4)}`
// El pedido a Casa Óga se nombra solo si V12 lo trae (el mismo criterio que V03).
const PEDIDO = (D2.vistas.V12?.pedidos ?? []).some((p) => p.id === DC09.id)

// Los tres rótulos del par dicen la fecha de medición con el mismo formato «al dd/mm/aaaa»
// (OMI-V10-2: el «01/09» escrito a mano se leía como una fecha de corte). El separador va
// pegado a lo que tiene antes, para que un renglón no empiece con «·».
const SEP = '\u00a0· '
const ETQ_E1 = `Entregable 1${SEP}al ${fechaCorta(D2.meta.corte_ref)}`
const ETQ_DESPUES = `Después de las decisiones${SEP}al ${fechaCorta(D2.meta.corte_ref)}${SEP}en revisión`
const ETQ_SENS = `Si ${MESES_FLAG} están incompletos${SEP}medido al ${fechaCorta(V.sens.corte)}`
const NOTA_SENS = `El ${pct(V.despues.pct)} sobrestimaría el riesgo; `
  + (PEDIDO ? `Casa Óga tiene que confirmar esos meses (${vista('V12')})` : 'Casa Óga tiene que confirmar esos meses')

// La salvedad de la exposición, con las palabras de V04. Los pesos se califican como en el
// E1 (8640faf): del extracto, sin afirmar «corrientes», porque la serie de precios no sigue
// al IPC (DC-10).
const NOTA_EXPOSICION = 'Exposición anual: facturación proyectada de los clientes en riesgo, no es '
  + `recupero; pesos del extracto, sin ajustar por inflación (${vista(DC10.vista)})`

// Un signo por cifra: «+0,8», «−11,9» (el menos tipográfico), «0,0» sin signo.
const signo = (v) => (v > 0.05 ? '+' : v < -0.05 ? '−' : '')

// Los Δ de las tres columnas de abajo, calculados desde D2.
const UNICA = V.cambios.length === 1 && V.cambios[0].decision === DC04.id
const DIF_SENS = { pp: V.sens.pct - V.despues.pct, M: V.sens.exposicion_M - V.despues.exposicion_M }
const DIF_CORTE = { pp: V.e1.pct - RIESGO_V02.al_corte_ref.pct, M: V.e1.exposicion_M - RIESGO_V02.al_corte_ref.exposicion_M }

// Por qué sube el % aunque haya menos en riesgo (OMI-V10-3): la base baja más que los que
// están en riesgo. El vocabulario es el de V04: números de cliente antes, personas después.
const MENOS_BASE = V.e1.elegibles - V.despues.elegibles
const MENOS_RIESGO = V.e1.en_riesgo - V.despues.en_riesgo
const NOTA_DC04 = `La base baja ${entero(MENOS_BASE)} (${entero(V.e1.elegibles)} números → `
  + `${entero(V.despues.elegibles)} personas) y los que están en riesgo, ${entero(MENOS_RIESGO)}: `
  + `por eso el % ${V.despues.pct >= V.e1.pct ? 'sube' : 'baja'}`
const NOTA_DC09 = `Frente al ${pct(V.despues.pct)}, si se mide al ${fechaCorta(V.sens.corte)}, antes de `
  + `${MESES_FLAG}: no reemplaza la cifra, la pone en duda (${vista(DC09.vista)})`
const NOTA_DC08 = `Frente al E1: el E1 ya medía al ${fechaCorta(RIESGO_V02.al_corte_ref.corte)}; al `
  + `${fechaCorta(RIESGO_V02.al_2026_08_31.corte)} daba ${pct(RIESGO_V02.al_2026_08_31.pct)} (${vista(DC08.vista)})`
const estado = (id) => D2.decisiones.find((d) => d.id === id)?.estado ?? ''
const MOSTRADAS = new Set([...V.cambios.map((c) => c.decision), DC09.id, DC08.id])
const OTRAS = D2.decisiones.filter((d) => !MOSTRADAS.has(d.id)).length

// El título dice el hallazgo con la cifra y, en la misma línea, que está en revisión y
// cuánto da la sensibilidad (NAR-V10-1), calculado desde D2: si el payload cambia, el
// título cambia solo.
const MOTIVO = UNICA ? 'solo por duplicados' : `por ${V.cambios.length} decisiones`
const TITULO = `${pct(V.e1.pct)} → ${pct(V.despues.pct)} ${MOTIVO}; en revisión: al `
  + `${fechaCorta(V.sens.corte)} da ${pct(V.sens.pct)}`

// (24/09) Una sola constante para meta.pie y la pantalla, así no divergen.
const PIE = `Exposición: facturación proyectada, no recupero; pesos del extracto, sin ajustar `
  + `por inflación (DC-10, ${vista(DC10.vista)}) · riesgo en revisión por ${MESES_FLAG} `
  + `(${vista(DC09.vista)}; depende de la respuesta de Casa Óga, ${vista('V12')}) · corte `
  + `${fechaCorta(D2.meta.corte_ref)}, sensibilidad ${fechaCorta(V.sens.corte)} · registro: `
  + `C03, C04, D05, D22, E01; DC-09`

export const meta = {
  id: 'V10',
  corto: 'La cifra central',
  titulo: TITULO,
  pie: PIE,
}

// El aro punteado de la sensibilidad, el mismo de ParDoble.
function Aro() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block', width: 9, height: 9, borderRadius: '50%', border: '1.5px dashed var(--mut2)',
        boxSizing: 'border-box', marginRight: 6, verticalAlign: '-1px', flexShrink: 0,
      }}
    />
  )
}

// (25/09, pedido del usuario: mucho texto y números difíciles de entender) La vista queda en
// tres tarjetas de cifra, sin frases de apoyo: el E1, los datos corregidos (la cifra que manda,
// «en revisión») y la sensibilidad sin sep–dic 2025, punteada; cada una con su % y su exposición
// anual, y el Δ en puntos en una línea. Debajo, una sola escala de 0 a 100 % con las cuatro
// lecturas del riesgo (la del 31/08/2026 viene de V02): se ve de un golpe que corregir los datos
// casi no la mueve y que la duda sobre sep–dic 2025 sí. Lo que decían las notas va al title.
const DELTA_DC04 = V.cambios.find((c) => c.decision === DC04.id)
const TIT_E1 = `${entero(V.e1.en_riesgo)} en riesgo de ${entero(V.e1.elegibles)} números de cliente con 3 compras o más`
const TIT_DESP = `${entero(V.despues.en_riesgo)} en riesgo de ${entero(V.despues.elegibles)} personas con 3 compras o más. ${NOTA_DC04}`
const TIT_SENS = `${entero(V.sens.en_riesgo)} en riesgo de ${entero(V.sens.elegibles)} personas. ${NOTA_SENS}`

const pp = (x) => `${signo(x)}${decimal(Math.abs(x), 1)} puntos`

function Exposicion({ M }) {
  return (
    <p className="e2-linea v10-expo">
      exposición <ValorMonto texto={montoM(M)} className="tabular" /> al año
    </p>
  )
}

export default function V10CifraCentral() {
  return (
    <section className="pant v10">
      <div className="e2-kpis v10-kpis">
        <div className="tarjeta" title={TIT_E1}>
          <span className="kpi-lbl"><span>Entregable 1</span></span>
          <div className="ban-par">
            <div className="par-item par-antes">
              <span className="par-lbl">Riesgo al {fechaCorta(D2.meta.corte_ref)}</span>
              <span className="par-val tabular e2-cifra">{pct(V.e1.pct)}</span>
            </div>
          </div>
          <Exposicion M={V.e1.exposicion_M} />
        </div>
        <div className="tarjeta e2-central" title={TIT_DESP}>
          <span className="kpi-lbl"><span>Datos corregidos</span><b className="e2-tag">en revisión</b></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <span className="par-lbl">
                {DELTA_DC04 ? `${pp(DELTA_DC04.delta_pct_pp)} por clientes duplicados` : `Riesgo al ${fechaCorta(D2.meta.corte_ref)}`}
              </span>
              <span className="par-val tabular e2-cifra">{pct(V.despues.pct)}</span>
            </div>
          </div>
          <Exposicion M={V.despues.exposicion_M} />
        </div>
        <div className="tarjeta e2-si" title={TIT_SENS}>
          <span className="kpi-lbl"><span><Aro />Sin {MESES_FLAG}</span></span>
          <div className="ban-par">
            <div className="par-item">
              <span className="par-lbl">{pp(DIF_SENS.pp)} si faltan ventas</span>
              <span className="par-val tabular e2-cifra">{pct(V.sens.pct)}</span>
            </div>
          </div>
          <Exposicion M={V.sens.exposicion_M} />
        </div>
      </div>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }} title={NOTA_EXPOSICION}>
        <span className="kpi-lbl frase">Clientes en riesgo, según cómo se mida</span>
        <Lienzo>
          {({ w, h }) => <Escala w={w} h={h} />}
        </Lienzo>
      </div>
    </section>
  )
}

/** (25/09) Las cuatro lecturas del riesgo sobre una sola escala de 0 a 100 %: el E1 (gris), los
 *  datos corregidos (--acc), la sensibilidad sin sep–dic 2025 (aro punteado) y la medición al
 *  31/08/2026 de V02 (hueca, gris). Rótulos arriba y abajo de la línea, alternados, para que el
 *  49,6 y el 50,4, que casi se tocan, no se pisen. */
function Escala({ w, h }) {
  const k = useEscalaTexto()
  if (w < 200) return null
  const padX = Math.round(24 * k)
  const x0 = padX
  const x1 = w - padX
  const yLinea = Math.round(h * 0.52)
  const X = (v) => x0 + (v / 100) * (x1 - x0)
  const fVal = Math.round(30 * k)
  const fEtq = Math.round(14 * k)
  const r = Math.max(7, Math.round(9 * k))
  const puntos = [
    { v: RIESGO_V02.al_2026_08_31.pct, etq: `medido al ${fechaCorta(RIESGO_V02.al_2026_08_31.corte)}`, tono: 'var(--mut2)', forma: 'hueco', arriba: true, ancla: 'middle' },
    // El E1 y la sensibilidad van abajo, alineados hacia afuera (el E1 a la derecha de su marca,
    // la sensibilidad a la izquierda de la suya): centrados se pisaban.
    { v: V.e1.pct, etq: 'Entregable 1', tono: 'var(--gris)', forma: 'lleno', arriba: false, ancla: 'start' },
    { v: V.despues.pct, etq: 'datos corregidos', tono: 'var(--acc)', forma: 'lleno', arriba: true, fuerte: true, ancla: 'middle' },
    { v: V.sens.pct, etq: `sin ${MESES_FLAG}`, tono: 'var(--ink)', forma: 'aro', arriba: false, ancla: 'end' },
  ]
  const ticks = [0, 25, 50, 75, 100]
  const rotulados = new Set([0, 100])
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={'Clientes en riesgo según cómo se mida: ' + puntos.map((p) => `${p.etq} ${pct(p.v)}`).join(', ')}>
      <line x1={x0} x2={x1} y1={yLinea} y2={yLinea} stroke="var(--eje)" strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={yLinea - 5} y2={yLinea + 5} stroke="var(--eje)" strokeWidth={1} />
          {rotulados.has(t) && (
            <text x={X(t)} y={yLinea + 5 + 13 * k} fontSize={11 * k} fill="var(--mut)" textAnchor="middle" className="tabular">{t} %</text>
          )}
        </g>
      ))}
      {/* El tramo entre la sensibilidad y los datos corregidos: lo que la duda puede mover. */}
      <line x1={X(V.sens.pct)} x2={X(V.despues.pct)} y1={yLinea} y2={yLinea}
            stroke="var(--ink)" strokeWidth={2} strokeDasharray="4 4" />
      {puntos.map((p) => {
        const x = X(p.v)
        const dy = p.arriba ? -1 : 1
        const xt = p.ancla === 'start' ? x - r : p.ancla === 'end' ? x + r : x
        const yVal = yLinea + dy * (r + 18 * k + (p.arriba ? 0 : fVal * 0.8))
        const yEtq = yVal + dy * (p.arriba ? fVal * 0.95 : fEtq * 1.4) * (p.arriba ? 1 : 1)
        return (
          <g key={p.etq}>
            <title>{`${p.etq}: ${pct(p.v)}`}</title>
            <line x1={x} x2={x} y1={yLinea} y2={yLinea + dy * (r + 6 * k)} stroke={p.tono} strokeWidth={1.5} />
            {p.forma === 'lleno' && <circle cx={x} cy={yLinea} r={r} fill={p.tono} stroke="var(--sup)" strokeWidth={2} />}
            {p.forma === 'hueco' && <circle cx={x} cy={yLinea} r={r} fill="var(--sup)" stroke={p.tono} strokeWidth={2} />}
            {p.forma === 'aro' && <circle cx={x} cy={yLinea} r={r} fill="var(--sup)" stroke={p.tono} strokeWidth={2} strokeDasharray="3 2" />}
            <text x={xt} y={yVal} fontSize={fVal} fontWeight={700} fill={p.fuerte ? 'var(--acc)' : 'var(--ink)'}
                  textAnchor={p.ancla} className="tabular">{pct(p.v)}</text>
            <text x={xt} y={p.arriba ? yVal - fVal * 0.95 : yVal + fEtq * 1.5} fontSize={fEtq} fontWeight={600}
                  fill="var(--mut2)" textAnchor={p.ancla}>{p.etq}</text>
          </g>
        )
      })}
    </svg>
  )
}
