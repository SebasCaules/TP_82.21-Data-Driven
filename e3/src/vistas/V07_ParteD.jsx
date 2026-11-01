// V07 · ¿Qué decide María G. con el piloto? (Parte D 9, 11.1 y 12; diapositiva 12 de C3).
// W3, 27/10; rehecha el 28/10 (unidad V07 de .workforce/PLAN.md y sus «Correcciones del crítico»).
// Misma forma que las demás: banda de cifras con la tarjeta de decisión a la derecha y un gráfico a todo
// el ancho debajo.
//
// - Banda (28/10): un número por tarjeta y la central primero, a la izquierda (N0-6). Central: cuánto tiene
//   que dar el piloto para pasar a producción (H49, D3.piloto.umbral_produccion_pp, 40,4 puntos), la única
//   al tamaño máximo, con «más que el grupo de control». Después el tamaño del piloto (G49,
//   D3.piloto.tratados, 1.260 «clientes contactados»; los 240 de control van al title, N0-8) y cuánto
//   dura el plan hasta la decisión (J50, D3.plan.semanas, 20 semanas «hasta la decisión»; las fechas, al
//   title). Anchos 3 / 2 / 2, como la V01.
// - Decisión: «D-PIL · propuesta» de decisiones.js, la regla del piloto en una frase de hasta 60 caracteres
//   (regla 11 del E2). C3 no trae esa frase: queda acá hasta que contenido.py exporte la Parte D (W4).
// - Gráfico (28/10): la regla de decisión del piloto, sola y a todo el ancho de la tarjeta, sobre el eje
//   «contactados menos control, en puntos». Dos zonas, porque así lo dice C3 (diapositiva 12, guion: «Si
//   no, María G. elige entre cerrar o repetir el piloto sin descuento»): debajo de 40,4 (H49) «María G.
//   elige: cerrar o repetir sin descuento», en relleno de contexto con contorno; desde 40,4, «a
//   producción», en --acc. Dentro de la primera, de 0 a 2,87 (G49, D3.piloto.diferencia_detectable_pp), una
//   subfranja más oscura rotulada «no se distingue de cero»: el 2,87 es lo más chico que el piloto distingue
//   de cero, no una decisión. Hasta el 28/10 había tres franjas (la del medio decía «contactar funciona,
//   pero la lista no se paga») y una llave flotante encima. Las marcas 2,87 y 40,4 van grandes sobre su
//   línea; el texto de cada zona, adentro de su zona. Conclusión arriba, en .e3-conclusion, sin cifra.
// - (01/11, a la vista) Lo que hasta ese día iba detrás de un botón (lo que decide María G. y en qué semana, el
//   flujo de cada mes y el plan de 20 semanas) pasa a la vista 8, «¿Cómo funciona cada mes y en qué
//   semana?» (V08_CadaMes.jsx). Esta vista queda con la regla del piloto.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js).

import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fecha, fijo, pct } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V07.css'

const P = D3.piloto
const PL = D3.plan
const E = D3.economia

// La regla del piloto (G49, H49) y el equilibrio de la Parte B del que sale el 40,4 (G43).
const MDE = P.diferencia_detectable_pp
const PAGA = P.umbral_produccion_pp
const S_EQ = E.umbral.s_equilibrio_con_descuento
const T_MDE = fijo(MDE, 2)
const T_PAGA = fijo(PAGA, 1)

// El plan (J50).
const FASE = Object.fromEntries(PL.fases.map((f) => [f.id, f]))
const PILOTO = FASE.piloto
const DECIDE = FASE.decision
const semanas = (n) => `${n}${NBSP}${n === 1 ? 'semana' : 'semanas'}`
const rango = (f) => (f.desde_semana === f.hasta_semana ? `semana ${f.desde_semana}`
  : `semanas ${f.desde_semana} a ${f.hasta_semana}`)

// La decisión: la regla del piloto en una línea; el resto, al title.
const DECISION = decision('D-PIL', {
  llano_corto: `Piloto de ${P.meses} meses; con ${T_PAGA} puntos o más, a producción`,
  llano: `La lista de ${entero(P.lista_mes)} por mes sale con la regla del umbral, sin modelo. Un piloto de `
    + `${P.meses} meses, con ${entero(P.control)} clientes de control, mide la compra a 7 días. Con ${T_PAGA} puntos `
    + 'o más sobre el control, María G. invierte en producción; debajo, elige entre cerrar o repetir el piloto sin '
    + 'descuento.',
  decision: `Piloto de ${P.meses} meses; con ${T_PAGA} puntos o más, a producción`,
  justificacion: `${T_PAGA} puntos es el ${pct(S_EQ, 1)} de equilibrio de la Parte B, sobre los que se iban a ir, `
    + `llevado a todos los contactados. Con ${entero(P.tratados)} contactados y ${entero(P.control)} de control, `
    + `el piloto distingue de cero una diferencia de ${T_MDE} puntos o más.`,
})

const TITULO_PILOTO = `Piloto de ${P.meses} meses, una lista de ${entero(P.lista_mes)} por mes: ${entero(P.contactados_mes)} `
  + `contactados y ${entero(P.control_mes)} de control cada mes, ${entero(P.tratados)} y ${entero(P.control)} en total. `
  + `Con ese tamaño, el piloto distingue de cero una diferencia de ${T_MDE} puntos o más.`
const TITULO_PAGA = `Para pasar a producción, al cierre del mes ${entero(P.meses)} la compra a 7 días de los contactados tiene que superar a la `
  + `del control en ${T_PAGA} puntos o más. ${DECISION.justificacion}`
const TITULO_PLAN = `Plan del proyecto: ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. `
  + PL.fases.map((f) => `${f.nombre}, ${rango(f)}`).join('; ')
  + `. La primera lista sale el ${fecha(PILOTO.desde)}; María G. decide el ${fecha(DECIDE.hasta)}.`
// Textos del gráfico. La conclusión dice lo que muestra el dibujo, sin cifra (la cifra va en la banda y en la
// marca): la zona de producción empieza muy a la derecha del cero.
const CONCLUSION = 'A producción solo si los contactados compran mucho más que el control'
const Z1_QUIEN = 'María G. elige:'
const Z1_QUE = `cerrar o repetir sin${NBSP}descuento`
const Z2_QUE = 'a producción'
const Z2_POR = 'la lista se paga'
const SUB = 'no se distingue de cero'

export const meta = { id: 'V07', dc: 'D-PIL' }

// ---------------------------------------------------------------- texto en SVG

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const MUT = 'var(--e3-ctx, #5a6478)'
const MUT2 = 'var(--e3-ctx, #5a6478)'
const EJE = 'var(--e3-eje, #6a7489)'
const CTX_R = 'var(--e3-ctx-relleno, #a9b1bf)'
const ZONA = 'var(--e3-zona, rgba(34, 69, 111, .16))'
const CONTORNO = 'var(--e3-contorno, #4f5a6e)'

/** Renglones de hasta `w` px, cortando entre palabras (un espacio duro no corta). */
function envolver(texto, w, f, peso = 400) {
  const out = []
  let linea = ''
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${p}` : p
    if (linea && ancho(prueba, f, peso) > w) {
      out.push(linea)
      linea = p
    } else linea = prueba
  }
  if (linea) out.push(linea)
  return out
}

/** Título de eje (regla 21 del E1): mono, mayúsculas, en la punta. */
function TituloEje({ x, y, texto, f }) {
  return (
    <text x={x} y={y} fontSize={f} fill={MUT2} textAnchor="end" fontFamily="var(--mono)" fontWeight={600}
          letterSpacing=".09em" style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

/** Un bloque de texto centrado en (cx, cy): renglones [texto, tamaño, peso]. */
function Bloque({ cx, cy, renglones, fill }) {
  const alto = renglones.reduce((a, [, f]) => a + f * 1.25, 0)
  let y = cy - alto / 2
  return renglones.map(([t, f, peso], i) => {
    const yc = y + (f * 1.25) / 2
    y += f * 1.25
    return (
      <text key={i} x={cx} y={yc} fontSize={f} fontWeight={peso} fill={fill} textAnchor="middle"
            dominantBaseline="central">{t}</text>
    )
  })
}

// ---------------------------------------------------------------- el gráfico: la regla del piloto

function ReglaPiloto({ w, h, k }) {
  // Tipografía: crece con k y se achica si el alto no alcanza (1152 × 640). Las marcas, por debajo de la
  // cifra central de la banda (regla 3).
  const ajuste = Math.max(0.78, Math.min(1, h / (300 * k)))
  const fVal = Math.round(32 * k * ajuste)         // 2,87 y 40,4
  const fZona = Math.round(24 * k * ajuste)        // «María G. elige:», «a producción»
  const fOpc = Math.round(19 * k * ajuste)         // lo que elige, por qué se pasa
  const fSub = Math.round(14.5 * k * ajuste)       // la subfranja
  const fTick = Math.round(12.5 * k)
  const fTit = Math.round(11.5 * k)

  const { max, ticks } = escalaNice(PAGA / 0.7)
  const padL = 1
  const padR = 1
  const x = (v) => padL + (v / max) * (w - padL - padR)
  const x0 = x(0)
  const xm = x(MDE)
  const xp = x(PAGA)
  const xf = x(max)

  // Alto: los dos valores arriba, la banda en el medio (toma todo lo que sobra) y el eje con su título abajo.
  const yVal = fVal + 2
  const yb = yVal + 12 * k
  const altoAbajo = 6 + fTick + 10 * k + fTit * 1.35 + 2
  const yEje = h - altoAbajo
  const hb = Math.max(40, yEje - yb)

  // Zona 1: lo que elige María G., centrado entre el 2,87 y el 40,4 (no cruza la línea del 2,87) y por encima
  // del rótulo de la subfranja, que va abajo, pegado al 2,87.
  const pad1 = 16 * k
  const opc = envolver(Z1_QUE, xp - xm - 2 * pad1, fOpc, 500)
  const ySub = yEje - 12 * k - fSub / 2
  const cy1 = (yb + ySub - fSub) / 2
  const cx1 = (xm + xp) / 2

  // Zona 2: «a producción» y por qué, centrado.
  const ren2 = [
    ...envolver(Z2_QUE, xf - xp - 2 * pad1, fZona, 700).map((t) => [t, fZona, 700]),
    ...envolver(Z2_POR, xf - xp - 2 * pad1, fOpc, 500).map((t) => [t, fOpc, 500]),
  ]

  // Los dos valores, sobre su línea: el 2,87 sin salirse por la izquierda; el 40,4 centrado.
  const wMde = ancho(T_MDE, fVal, 700)
  const xMdeTxt = Math.max(0, xm - wMde / 2)
  const flecha = Math.max(5, 6 * k)

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Regla de decisión del piloto, con la compra a 7 días de los contactados menos la del control al `
           + `cierre del mes ${entero(P.meses)}: con cualquier valor debajo de ${T_PAGA} puntos, María G. elige entre cerrar o repetir sin `
           + `descuento; debajo de ${T_MDE} puntos, la diferencia no se distingue de cero; desde ${T_PAGA}, la lista `
           + 'se paga y pasa a producción'}>
      {/* Zona 1: debajo de 40,4, decide María G. (D 11.1). */}
      <g>
        <title>{`Con cualquier valor debajo de ${T_PAGA} puntos, María G. elige entre cerrar el piloto o repetirlo `
          + 'sin descuento (Parte D 11.1).'}</title>
        <rect x={x0} y={yb} width={Math.max(1, xp - x0)} height={hb} fill={ZONA} stroke={CONTORNO}
              strokeWidth="1.5" />
        <Bloque cx={cx1} cy={cy1} fill={INK}
                renglones={[[Z1_QUIEN, fZona, 700], ...opc.map((t) => [t, fOpc, 500])]} />
      </g>

      {/* La subfranja de 0 a 2,87: el piloto no distingue el efecto de cero. */}
      <g>
        <title>{`Debajo de ${T_MDE} puntos: con ${entero(P.tratados)} contactados y ${entero(P.control)} de control, `
          + 'el efecto del contacto no se distingue de cero.'}</title>
        <rect x={x0} y={yb} width={Math.max(1, xm - x0)} height={hb} fill={CTX_R} stroke={CONTORNO}
              strokeWidth="1.5" />
        <path d={`M${xm + 8 * k},${ySub} l${flecha * 1.5},${-flecha * 0.75} v${flecha * 1.5} z`} fill={INK} />
        <text x={xm + 8 * k + flecha * 1.5 + 6 * k} y={ySub} fontSize={fSub} fontWeight={600} fill={INK}
              dominantBaseline="central">{SUB}</text>
      </g>

      {/* Zona 2: desde 40,4, a producción. */}
      <g>
        <title>{`Desde ${T_PAGA} puntos: la lista se paga y María G. invierte en producción con la regla.`}</title>
        <rect x={xp} y={yb} width={Math.max(1, xf - xp)} height={hb} fill={ACC} />
        <Bloque cx={(xp + xf) / 2} cy={yb + hb / 2} fill="#fff" renglones={ren2} />
      </g>

      {/* Las dos marcas de la regla, con su valor arriba. */}
      <g>
        <title>{`${T_MDE} puntos: la diferencia más chica que ${entero(P.tratados)} contactados contra `
          + `${entero(P.control)} de control distinguen de cero`}</title>
        <line x1={xm} x2={xm} y1={yVal + 5 * k} y2={yEje} stroke={INK} strokeWidth="2" />
        <text x={xMdeTxt} y={yVal} fontSize={fVal} fontWeight={700} fill={INK} className="tabular">{T_MDE}</text>
      </g>
      <g>
        <title>{TITULO_PAGA}</title>
        <line x1={xp} x2={xp} y1={yVal + 5 * k} y2={yEje} stroke={ACC} strokeWidth="2.5" />
        <text x={xp} y={yVal} fontSize={fVal} fontWeight={700} fill={ACC} textAnchor="middle"
              className="tabular">{T_PAGA}</text>
      </g>

      {/* Eje, con su título en la punta. */}
      <g>
        <line x1={x0} x2={xf} y1={yEje} y2={yEje} stroke={EJE} strokeWidth="1.5" />
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={yEje} y2={yEje + 5} stroke={EJE} strokeWidth="1" />
            <text x={x(t)} y={yEje + 6 + fTick} fontSize={fTick} fill={MUT} fontWeight={500} className="tabular"
                  textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}>{fijo(t, 0)}</text>
          </g>
        ))}
        <TituloEje x={xf} y={yEje + 6 + fTick + 10 * k + fTit} f={fTit} texto="contactados menos control, en puntos" />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V07ParteD() {
  const k = useEscalaTexto()
  return (
    <section className="pant v07">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }} title={TITULO_PAGA}>
          <span className="kpi-lbl"><span>Para ir a producción</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={T_PAGA} unidad={`${NBSP}puntos`} /></div>
          </div>
          <p className="e2-linea">más que el grupo de control</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={TITULO_PILOTO}>
          <span className="kpi-lbl"><span>Tamaño del piloto</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={entero(P.tratados)} sec /></div>
          </div>
          <p className="e2-linea">clientes contactados</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={TITULO_PLAN}>
          <span className="kpi-lbl"><span>Duración del plan</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(PL.semanas)} unidad={`${NBSP}semanas`} sec />
            </div>
          </div>
          <p className="e2-linea">hasta la decisión</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v07-graf">
        <div className="e3-v07-cab">
          <div className="e3-v07-txt">
            <p className="e3-v07-mide tabular">{`Compra a 7 días al cierre del mes ${entero(P.meses)} · semana${NBSP}${PILOTO.hasta_semana}`}</p>
            <p className="e3-conclusion">{CONCLUSION}</p>
          </div>
        </div>
        <div className="e3-v07-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <ReglaPiloto w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
