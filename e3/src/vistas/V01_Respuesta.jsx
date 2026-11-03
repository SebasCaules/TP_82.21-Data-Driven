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
//   mide el piloto» (la cuenta la V07). El rango al 95 % y los 16 de 1.570 envíos, al title de la barra.
// - Decisión: D-PRO de decisiones.js, «Veredicto · con condiciones»; la decisión completa de C3, al title.
// - (02/11, W6, fase-w6/hallazgos.md) El gráfico dice qué se paga (DAT-01, ORA-07, UX-07): el 49,6 % es lo que
//   necesita la regla sola; el modelo no se paga con ninguna tasa (G43). La frase de la decisión abre con el
//   veredicto integrado de la D 11.1 (COB-01, UX-08). La central va en terracota, como la de la V09: lo que no
//   cierra (VIS-14). El renglón de qué mide, ×1,2 (VIS-13).
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
  // (02/11) «Viable con condiciones: la regla, sin modelo, y un piloto que mide si paga» (hallazgos.md) iba en tres
  // renglones a 1280 × 720 y a 1920 × 1080; la etiqueta de arriba ya dice «Veredicto · con condiciones».
  // (03/11, W9, cambio 151) El rótulo único del veredicto integrado de la D v2.0.
  llano_corto: 'Viable con condiciones, solo como piloto',
  llano: sinCortes(plano(D2.decision).replace(/^Decisión\.\s*/, '')),
  decision: plano(D2.titulo),
})

// Rótulos del gráfico.
const ROT_HOY = 'Hoy compra a 7 días'
const ROT_FALTA = 'Haría falta para pagar la regla'
const NOTA_HOY = 'techo, sin control'
// La población de las dos barras no es la misma (el 1,02 % es sobre los envíos cerca del umbral; el 49,6 %, sobre los
// contactados que se iban): el eje dice solo qué es.
const TITULO_EJE = 'Tasa de éxito, en %'
// La conclusión dice lo que muestra el dibujo, sin cifra (la cifra va en la barra), y nombra a la regla: bajo
// el −99,95 % del modelo, «para pagarse» se leía como lo que necesita el modelo (DAT-01).
const CONCLUSION = 'Para que la regla se pague, tendría que volver casi la mitad de los que se iban'

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
  // (03/11, pedido del usuario: ejes rotulados) el título del eje, en la punta derecha y debajo de las marcas, mono y en
  // mayúsculas como en las vistas 2 y 7
  const fTit = Math.round(12 * k)

  const altoEje = fTick + 14 + fTit + Math.round(8 * k)
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
  // «lo que se ve hoy» ya no se dibuja debajo de la cota (02/11, sacar antes que agregar): la flecha va de una
  // barra a la otra. Queda en el aria-label y en los title.
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
      <text x={xDe(max) + margenDer - 2} y={yBase + 8 + fTick * 0.8 + 8 * k + fTit} fontSize={fTit} fill={CTX}
            textAnchor="end" fontFamily="var(--mono)" fontWeight={600} letterSpacing=".09em"
            style={{ textTransform: 'uppercase' }}>{TITULO_EJE}</text>

      {/* hoy: el dato que hay que mirar */}
      <g>
        <title>{`${EXI.area} ${txtHoy}: ${entero(E.parametros.compras_7d)} compras a 7 días en `
          + `${entero(E.parametros.envios)} envíos a clientes cerca del umbral, rango al 95 % de `
          + `${tasaTxt(S_LO)} a ${tasaTxt(S_HI)}, ${EXI.escala}. ${plano(EXI.texto)}`}</title>
        <text x={x0 - Math.round(14 * k)} y={y1 - fSub * 0.7} fontSize={fEtq} fontWeight={600} fill={INK}
              textAnchor="end" dominantBaseline="central">{ROT_HOY}</text>
        <text x={x0 - Math.round(14 * k)} y={y1 + fEtq * 0.72} fontSize={fSub} fontWeight={500} fill={CTX}
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
        <div className="tarjeta e2-central e3-v01-central" style={{ gridColumn: 'span 3' }}
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
