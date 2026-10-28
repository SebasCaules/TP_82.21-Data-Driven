// V01 · ¿Conviene anticipar a quien deja de comprar? (diapositiva 2 de C3; W2.01, 27/10; rehecha el 28/10,
// unidad V01 de .workforce/PLAN.md). La respuesta del tablero entero: banda de cifras con la tarjeta de
// decisión a la derecha y un gráfico a todo el ancho debajo.
//
// - Banda (28/10): un número por tarjeta y la central primero, a la izquierda (N0-6). Central: el ROI del
//   modelo sobre la regla a un año (G40, D3.economia.observada.modelo_roi_pct), la cifra que decide que la
//   lista salga sin modelo y la única al tamaño máximo; rótulo «ROI modelo sobre regla», fragmento «no viable, a un año» (veredicto y
//   escala de la tarjeta Económica de C3, sin la cifra). Después el puntaje técnico (F16, D3.tecnica) y el
//   legal (H40). D3 no trae la Parte C: el 2,0 sale de la tarjeta «Legal» de la diapositiva 2 de C3, como
//   texto. Debajo de cada cifra, la escala de su tarjeta de C3; el resto (el límite técnico, las seis
//   acciones) va al title. Anchos 3 / 2 / 2: con menos, el −99,95 % no entra a 1366 × 768.
// - Gráfico (28/10): por qué no es viable, en un vistazo. Dos barras en un eje de 0 a 50 %: lo que hoy
//   compra a 7 días tras un envío cerca del umbral (D3.economia.parametros.s_observada, 1,02 %, en --acc,
//   rotulado «techo, sin control»: no hay grupo de control) contra la tasa de éxito que haría falta para
//   que la regla se pague (D3.economia.umbral.s_equilibrio_con_descuento, 49,6 %, en relleno de contexto). Entre
//   las dos, una cota de un extremo al otro con «48,6 veces» (D3.economia.umbral.veces_con_descuento) grande: es el
//   mensaje. La escala sale de escalaNice sobre el 49,6 %. Sale la fila «Vuelven por el contacto · lo
//   mide el piloto» (la cuenta la V07). Conclusión arriba, en .e3-conclusion: «Para pagarse, tendría que
//   volver casi la mitad de los que se iban» (el callout del 49,6 % de la Parte B en C3, sin la cifra). El rango al 95 % y los 16 de 1.570 envíos, al
//   title de la barra.
// - Decisión: «D-PRO · propuesta» de decisiones.js (D6 del registro de decisiones de los hitos; la
//   comparte la vista 9) y la respuesta en una línea de la tabla de la historia (PLAN.md, fila 1),
//   ≤ 60 caracteres; la decisión completa de C3 va al title.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y el texto de C3 (contenido_e3.js).

import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, pct, pctDirecto } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import './V01.css'

const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)
// Las cuatro tarjetas de la diapositiva 2, por su área; si el texto cambia, por su orden.
const AREAS = ['Técnica', 'Legal', 'Económica', 'Tasa de éxito']
const [TEC, LEG, ECO, EXI] = AREAS.map((a, i) => D2.tarjetas.find((t) => t.area === a) ?? D2.tarjetas[i])

const T = D3.tecnica
const E = D3.economia
const U = E.umbral
const ROI = E.observada.modelo_roi_pct
const S = E.parametros.s_observada
const [S_LO, S_HI] = E.parametros.s_ic95
const S_EQ = U.s_equilibrio_con_descuento
const VECES = U.veces_con_descuento

const SOBRE_TEC = `/${fijo(T.escala[T.escala.length - 1].hasta, 0)}`
// «ROI −99,95 % a un año» (escala de la tarjeta Económica de C3) sin la cifra.
// (28/10) El −99,95 % es modelo_roi_pct: el ROI de sumar el modelo sobre la regla, no el del proyecto. Lo
// dice el rótulo (≤ 22 caracteres); «no viable: ROI del modelo sobre la regla, a un año» como fragmento
// partía en dos renglones y sacaba las tarjetas de la banda a 1366 y 1920. El fragmento queda con el
// veredicto y el horizonte de la escala de C3 («ROI −99,95 % a un año» → «a un año»).
const ROT_ECO = 'ROI modelo sobre regla'
const HORIZONTE = plano(ECO.escala).replace(/^ROI\s*[−-]?[\d.,]+\s*%\s*/, '')

const DECISION = decision('D-PRO', {
  llano_corto: 'La lista sale con la regla; el piloto mide',
  llano: sinCortes(plano(D2.decision).replace(/^Decisión\.\s*/, '')),
  decision: plano(D2.titulo),
})

// Rótulos del gráfico.
const ROT_HOY = 'Hoy compra a 7 días'
const ROT_FALTA = 'Haría falta para pagarse'
const NOTA_HOY = 'techo, sin control'
// La conclusión dice lo que muestra el dibujo, sin cifra (la cifra va en la barra): el callout del
// 49,6 % de la diapositiva de la Parte B («de los que se iban tendría que volver para pagar la regla»)
// en palabras. «Ni la regla sola recupera su costo» es la conclusión de la V05: acá quedaba repetida.
const CONCLUSION = 'Para pagarse, tendría que volver casi la mitad de los que se iban'

// Tasa con la precisión de la Parte B: dos decimales debajo del 5 %, uno arriba; el cero, sin decimales.
const tasaTxt = (v) => (v === 0 ? `${fijo(v, 0)}${NBSP}%` : pct(v, v < 0.05 ? 2 : 1))
const tickTxt = (v) => pct(v, 0)

// Ancho real de un texto, medido con canvas y la familia del body (src/graficos.jsx no exporta el suyo).
let _ctx = null
function anchoTexto(t, px, peso = 400) {
  try {
    if (!_ctx) _ctx = document.createElement('canvas').getContext('2d')
    const fam = getComputedStyle(document.body).fontFamily || 'sans-serif'
    _ctx.font = `${peso} ${px}px ${fam}`
    return _ctx.measureText(String(t)).width
  } catch {
    return String(t).length * px * 0.58
  }
}

function BarrasVeces({ w, h, k }) {
  const { max, ticks } = escalaNice(S_EQ)

  // Tipografía: crece con k (1 a 1,4) y se achica si el alto no alcanza (1152 × 640).
  const fEtq = Math.round(16 * k)
  const fSub = Math.round(13 * k)
  const fVal = Math.round(20 * k)
  const fTick = Math.round(12 * k)

  const altoEje = fTick + 14
  const padTop = 6
  const disp = Math.max(60, h - padTop - altoEje)
  const alto = Math.max(22, Math.min(disp * 0.17, 50 * k))
  // La cota del medio: el «48,6 veces» toma lo que dejan las barras, con tope por debajo de la cifra
  // central de la banda (regla 3: una sola cifra al tamaño máximo).
  const fBig = Math.max(20, Math.min(disp * 0.12, 26 * k))

  const y1 = padTop + alto / 2 + 4
  const y2 = padTop + disp - alto / 2 - 4
  const yCota = (y1 + y2) / 2 + fBig * 0.12

  const anchoEtq = Math.max(anchoTexto(ROT_HOY, fEtq, 600), anchoTexto(ROT_FALTA, fEtq, 600),
    anchoTexto(NOTA_HOY, fSub, 500))
  const x0 = Math.ceil(anchoEtq) + Math.round(18 * k)
  const margenDer = Math.ceil(anchoTexto(tickTxt(max), fTick, 500) / 2) + 4
  const ancho = Math.max(80, w - x0 - margenDer)
  const xDe = (v) => x0 + (v / max) * ancho

  const xHoy = xDe(S)
  const xFalta = xDe(S_EQ)
  const largoHoy = Math.max(3, xHoy - x0)
  const yBase = padTop + disp

  const txtHoy = tasaTxt(S)
  const txtFalta = tasaTxt(S_EQ)
  const txtVeces = `${fijo(VECES, 1)} veces`
  const sufijo = 'lo que se ve hoy'
  // El valor de la barra larga, adentro y alineado al final, si entra; si no, a la derecha.
  const dentro = anchoTexto(txtFalta, fVal, 700) + 20 < xFalta - x0
  const xCentro = (xHoy + xFalta) / 2
  const flecha = Math.max(7, 9 * k)

  const ACC = 'var(--acc)'
  const INK = 'var(--ink)'
  const CTX = 'var(--e3-ctx, #5a6478)'
  const CTX_R = 'var(--e3-ctx-relleno, #a9b1bf)'
  const EJE = 'var(--e3-eje, #6a7489)'

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${ROT_HOY}: ${txtHoy}, ${NOTA_HOY}. ${ROT_FALTA}: ${txtFalta}. ${txtVeces} ${sufijo}.`}>
      {/* grilla y eje */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xDe(t)} x2={xDe(t)} y1={padTop} y2={yBase}
                stroke={EJE} strokeOpacity={t === 0 ? 1 : 0.22} strokeWidth={t === 0 ? 1.5 : 1} />
          <text x={xDe(t)} y={yBase + 8 + fTick * 0.8} fontSize={fTick} fill={CTX} fontWeight={500}
                textAnchor="middle" className="tabular">{tickTxt(t)}</text>
        </g>
      ))}

      {/* hoy: el dato que hay que mirar */}
      <g>
        <title>{`${EXI.area} ${txtHoy}: ${entero(E.parametros.compras_7d)} compras a 7 días en `
          + `${entero(E.parametros.envios)} envíos a clientes cerca del umbral, rango al 95 % de `
          + `${tasaTxt(S_LO)} a ${tasaTxt(S_HI)}, ${EXI.escala}. ${plano(EXI.texto)}`}</title>
        <text x={x0 - Math.round(14 * k)} y={y1 - fSub * 0.45} fontSize={fEtq} fontWeight={600} fill={INK}
              textAnchor="end" dominantBaseline="central">{ROT_HOY}</text>
        <text x={x0 - Math.round(14 * k)} y={y1 + fEtq * 0.62} fontSize={fSub} fontWeight={500} fill={CTX}
              textAnchor="end" dominantBaseline="central">{NOTA_HOY}</text>
        <rect x={x0} y={y1 - alto / 2} width={largoHoy} height={alto} fill={ACC} />
        <text x={x0 + largoHoy + 10} y={y1} fontSize={fVal} fontWeight={700} fill={INK}
              dominantBaseline="central" className="tabular">{txtHoy}</text>
      </g>

      {/* haría falta: contexto */}
      <g>
        <title>{`${ROT_FALTA}: ${txtFalta} de los contactados que se iban tendría que volver para que la `
          + `regla recupere su costo en un año, ${txtVeces} ${sufijo}.`}</title>
        <text x={x0 - Math.round(14 * k)} y={y2} fontSize={fEtq} fontWeight={600} fill={INK}
              textAnchor="end" dominantBaseline="central">{ROT_FALTA}</text>
        <rect x={x0} y={y2 - alto / 2} width={xFalta - x0} height={alto} fill={CTX_R} />
        <text x={dentro ? xFalta - 10 : xFalta + 10} y={y2} fontSize={fVal} fontWeight={700} fill={INK}
              textAnchor={dentro ? 'end' : 'start'} dominantBaseline="central"
              className="tabular">{txtFalta}</text>
      </g>

      {/* la cota: de lo que se ve a lo que haría falta */}
      <g>
        <title>{`${txtVeces} ${sufijo}: ${txtFalta} contra ${txtHoy}.`}</title>
        <line x1={xHoy} x2={xHoy} y1={y1 + alto / 2} y2={yCota} stroke={ACC} strokeWidth={1.5}
              strokeDasharray="3 3" />
        <line x1={xFalta} x2={xFalta} y1={yCota} y2={y2 - alto / 2} stroke={ACC} strokeWidth={1.5}
              strokeDasharray="3 3" />
        <line x1={xHoy} x2={xFalta - flecha} y1={yCota} y2={yCota} stroke={ACC} strokeWidth={2.5} />
        <path d={`M${xFalta},${yCota} l${-flecha * 1.6},${-flecha * 0.7} v${flecha * 1.4} z`} fill={ACC} />
        <text x={xCentro} y={yCota - fBig * 0.28} fontSize={fBig} fontWeight={700} fill={ACC}
              textAnchor="middle" className="tabular" style={{ letterSpacing: '-.02em' }}>{txtVeces}</text>
        <text x={xCentro} y={yCota + fSub * 0.9 + 8} fontSize={Math.round(15 * k)} fontWeight={500} fill={INK}
              textAnchor="middle" dominantBaseline="hanging">{sufijo}</text>
      </g>
    </svg>
  )
}

export const meta = { id: 'V01', dc: 'D-PRO' }

export default function V01Respuesta() {
  const k = useEscalaTexto()
  return (
    <section className="pant v01">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`ROI del modelo sobre la regla a un año, escenario esperado: ${pctDirecto(ROI, 2)}. ${plano(ECO.texto)}`}>
          <span className="kpi-lbl"><span>{ROT_ECO}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={pctDirecto(ROI, 2)} /></div>
          </div>
          <p className="e2-linea">{`${plano(ECO.valor).toLowerCase()}, ${HORIZONTE}`}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Puntaje técnico: ${fijo(T.promedio, 2)}${SOBRE_TEC}, ${TEC.escala}. ${plano(TEC.texto)}`}>
          <span className="kpi-lbl"><span>{TEC.area}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={fijo(T.promedio, 2)} unidad={SOBRE_TEC} sec /></div>
          </div>
          <p className="e2-linea">{TEC.escala}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Puntaje legal: ${plano(LEG.valor)}, ${LEG.escala}. ${plano(LEG.texto)}`}>
          <span className="kpi-lbl"><span>{LEG.area}</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={LEG.valor} sec /></div>
          </div>
          <p className="e2-linea">{LEG.escala}</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v01-graf">
        <div className="e3-v01-cab">
          <p className="e3-v01-mide">{`${EXI.area}: contactados que vuelven a comprar`}</p>
          <p className="e3-conclusion">{CONCLUSION}</p>
        </div>
        <div className="e3-v01-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <BarrasVeces w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
