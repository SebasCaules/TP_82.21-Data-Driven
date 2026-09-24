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

// (24/09) Tamaños: los porcentajes, un escalón arriba del resto del tablero (es la única
// vista que los tiene como protagonistas) y la sensibilidad un escalón abajo del par, en
// tinta. Crecen con el ancho y con el alto de la pantalla: con solo vw, a 1440 × 900 y a
// 1920 × 1080 la vista quedaba con media tarjeta en blanco. En la hoja impresa, vw y vh son
// los de la hoja.
const T = {
  pct: 'clamp(34px, calc(2.4vw + 3.6vh), 88px)',
  monto: 'clamp(20px, calc(1vw + 1.5vh), 40px)',
  pctSens: 'clamp(28px, calc(1.8vw + 2.6vh), 64px)',
  montoSens: 'clamp(17px, calc(0.85vw + 1.25vh), 34px)',
  delta: 'clamp(21px, calc(1.1vw + 2.2vh), 46px)',
  deltaM: 'clamp(16px, calc(0.7vw + 1.4vh), 30px)',
  aire: 'clamp(3px, 0.9vh, 12px)',
}
// «de exposición anual» al lado de la cifra: en la letra de lectura, no en la de la unidad
// (a 0,6 em quedaba en 10 px).
const UNIDAD_FRASE = { font: '400 var(--e2-txt2)/1.2 var(--fuente)', color: 'var(--mut2)', letterSpacing: 0 }
const PUNTEADO = { borderLeft: '1px dashed var(--mut2)', paddingLeft: 'clamp(12px, 1.4vw, 24px)' }

/** Un monto con la moneda y la unidad un escalón más chicas (como ValorMonto) y el signo
 *  pegado a la cifra: «ARS +1,5 M», «ARS −18,7 M». */
function MontoConSigno({ M }) {
  const p = partesMonto(montoM(Math.abs(M)))
  return (<><span className="par-unidad">{p.pre}</span>{signo(M)}{p.num}<span className="par-unidad">{p.suf}</span></>)
}

/** Una columna del par de arriba: rótulo, %, exposición y los conteos de los que sale. */
function Cifra({ lbl, x, clase, base, sens = false }) {
  const tinta = sens ? { color: 'var(--ink)' } : undefined
  return (
    <div className={`par-item ${clase ?? ''}`} style={{ flex: '1 1 0', minWidth: 0, ...(sens ? PUNTEADO : null) }}>
      <span className="par-lbl" style={sens ? { color: 'var(--mut2)' } : undefined}>
        <span>{sens && <Aro />}{lbl}</span>
      </span>
      <span className="par-val tabular" style={{ fontSize: sens ? T.pctSens : T.pct, ...tinta }}>{pct(x.pct)}</span>
      <span className="par-val tabular" style={{ fontSize: sens ? T.montoSens : T.monto, marginTop: T.aire, ...tinta }}>
        <ValorMonto texto={montoM(x.exposicion_M)} className="" />
      </span>
      <span className="kpi-sub" style={{ minHeight: 0 }}>
        de exposición anual · {entero(x.en_riesgo)} en riesgo de {entero(x.elegibles)} {base} con 3
        compras o más
      </span>
      {sens && (
        <span className="kpi-sub" style={{ minHeight: 0, marginTop: T.aire, color: 'var(--ink)', fontSize: 'var(--e2-txt)' }}>
          {NOTA_SENS}
        </span>
      )}
    </div>
  )
}

/** Un Δ de la tarjeta de abajo: puntos grandes, pesos un escalón abajo, y qué lo explica. */
function Delta({ lbl, pp, M, nota, sens = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, ...(sens ? PUNTEADO : null) }}>
      <span className="kpi-lbl" style={{ display: 'block' }}>{sens && <Aro />}{lbl}</span>
      <div className="ban-par" style={{ marginTop: T.aire }}>
        <div className="par-item" style={{ color: 'var(--ink)' }}>
          <span className="par-val tabular" style={{ fontSize: T.delta }}>
            {signo(pp)}{decimal(Math.abs(pp), 1)}<span className="par-unidad"> puntos</span>
          </span>
          <span className="par-val tabular" style={{ fontSize: T.deltaM, marginTop: T.aire }}>
            <MontoConSigno M={M} />
            <span style={UNIDAD_FRASE}> de exposición anual</span>
          </span>
        </div>
      </div>
      {nota && <span className="kpi-sub" style={{ minHeight: 0, marginTop: T.aire, fontSize: 'var(--e2-txt)' }}>{nota}</span>}
    </div>
  )
}

export default function V10CifraCentral() {
  const gap = 'clamp(12px, 1.8vw, 30px)'
  return (
    <section className="pant v10">
      <h1 className="titulo">{TITULO}</h1>

      {/* (24/09) Arriba, la cifra del directorio; abajo, los Δ. Las dos crecen por igual desde
          el alto de su contenido y lo centran (ver la cabecera). */}
      <div className="tarjeta" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
        <span className="kpi-lbl frase">Clientes en riesgo entre los que tienen 3 compras o más</span>
        <div className="ban-par dos-renglones" style={{ alignItems: 'flex-start', marginTop: T.aire }}>
          <Cifra lbl={ETQ_E1} x={V.e1} clase="par-antes" base="números" />
          <span className="par-flecha" aria-hidden="true">→</span>
          <Cifra lbl={ETQ_DESPUES} x={V.despues} clase="par-despues" base="personas" />
          <Cifra lbl={ETQ_SENS} x={V.sens} base="personas" sens />
        </div>
        <p className="e2-nota" style={{ marginTop: 'clamp(8px, 1.6vh, 20px)' }}>{NOTA_EXPOSICION}</p>
      </div>

      <div className="tarjeta" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
        <span className="kpi-lbl frase">Qué mueve la cifra y qué la pone en duda</span>
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: gap,
            marginTop: 'clamp(8px, 2vh, 28px)', alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            {V.cambios.map((c) => (
              <Delta
                key={c.decision}
                lbl={`${c.decision}${c.decision === DC04.id ? ' · unir duplicados' : ''} · ${estado(c.decision)}`}
                pp={c.delta_pct_pp} M={c.delta_exposicion_M}
                nota={UNICA ? NOTA_DC04 : null}
              />
            ))}
          </div>
          <Delta lbl={`${DC09.id} · sensibilidad`} pp={DIF_SENS.pp} M={DIF_SENS.M} nota={NOTA_DC09} sens />
          <Delta lbl={`${DC08.id} · corte común · ${DC08.estado}`} pp={DIF_CORTE.pp} M={DIF_CORTE.M} nota={NOTA_DC08} />
        </div>
        <p className="e2-nota" style={{ marginTop: 'clamp(10px, 2.4vh, 32px)' }}>
          Las otras {entero(OTRAS)} decisiones no cambian esta cifra ({vista('V01')}).
        </p>
      </div>

      <p className="pie-vista">{PIE}</p>
    </section>
  )
}
