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
// - Explorar, cerrado al llegar, con tres paneles: lo que decide María G. y en qué semana (las filas de la
//   D 12.3 que son suyas, 12.4, con las semanas de D3.plan.hitos_semana; hasta el 28/10 iba al lado del
//   gráfico y competía con la regla), el flujo de cada mes (la tabla 9.2 de la Parte D) y el plan de 20
//   semanas (J50, sección 12). Lo que antes iba al pie va al title (regla 12 del E2).
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js). Los textos del flujo y de los pedidos
// resumen las tablas 9.2, 12.3 y 12.4 de la Parte D hasta que C3 los traiga (W4).

import { useState } from 'react'
import { Lienzo, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fecha, fijo, pct } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V07.css'

const P = D3.piloto
const PL = D3.plan
const E = D3.economia
const HS = PL.hitos_semana

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

// Lo que decide María G. y en qué semana: las filas de la D 12.3 a su cargo (12.4), en el orden del plan.
const PEDIDOS = [
  { t: 'El alcance: regla sin modelo y piloto con control', s: HS.alcance },
  { t: 'La regla del target, con revisión de Sofía R.', s: HS.regla_y_operador_del_piloto },
  // (28/10, F6b) La D v1.3 (12.3 y 12.4): María G. designa quién inscribe las bases en la semana 2, para que la
  // inscripción (L1) esté en la 4. Hasta la v1.2 la fila decía la semana 4.
  { t: 'Quién inscribe las bases en la AAIP', s: HS.designa_l1 },
  { t: 'Quién opera la lista después del piloto', s: HS.operador_despues_del_piloto },
  { t: `Si pasa a producción, con ${T_PAGA} puntos o más`, s: HS.decision },
]
const TITULO_PEDIDOS = `Parte D 12.3 y 12.4. En la semana ${HS.regla_y_operador_del_piloto} María G. también aprueba `
  + 'quién opera el piloto (el equipo consultor), firma el acuerdo de confidencialidad y aprueba la política de '
  + `retención. El grupo de control, ${entero(P.control_mes)} por mes fuera del 20${NBSP}% de mayor facturación, lo `
  + `aprueba Sofía R. en la semana ${HS.regla_y_operador_del_piloto}.`

const TITULO_PILOTO = `Piloto de ${P.meses} meses, una lista de ${entero(P.lista_mes)} por mes: ${entero(P.contactados_mes)} `
  + `contactados y ${entero(P.control_mes)} de control cada mes, ${entero(P.tratados)} y ${entero(P.control)} en total. `
  + `Con ese tamaño, el piloto distingue de cero una diferencia de ${T_MDE} puntos o más.`
const TITULO_PAGA = `Para pasar a producción, al tercer mes la compra a 7 días de los contactados tiene que superar a la `
  + `del control en ${T_PAGA} puntos o más. ${DECISION.justificacion}`
const TITULO_PLAN = `Plan del proyecto: ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. `
  + PL.fases.map((f) => `${f.nombre}, ${rango(f)}`).join('; ')
  + `. La primera lista sale el ${fecha(PILOTO.desde)}; María G. decide el ${fecha(DECIDE.hasta)}.`
const TITULO_FLUJO = `Parte D 9.2. Una lista por mes, ${P.meses} en total, desde el ${fecha(PILOTO.desde)}; el piloto `
  + `cierra el ${fecha(PILOTO.hasta)}. Lo que se mide reemplaza el ${pct(E.parametros.s_observada, 2)} de compra que `
  + 'hoy se ve sin grupo de control.'

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
const GRIS = 'var(--gris)'
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
           + `tercer mes: con cualquier valor debajo de ${T_PAGA} puntos, María G. elige entre cerrar o repetir sin `
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

// ---------------------------------------------------------------- Explorar: lo que decide María G. (D 12.3 y 12.4)

function Pedidos() {
  return (
    <div className="e3-v07-panel" title={TITULO_PEDIDOS}>
      <ol className="e3-v07-pedidos">
        {PEDIDOS.map((p) => (
          <li key={p.t}>
            <span className="e3-v07-sem tabular">{`semana${NBSP}${p.s}`}</span>
            <span className="e3-v07-ped">{p.t}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------------------------------------------------------------- Explorar: el flujo de cada mes (D 9.2)

const QUIEN_EQUIPO = 'El equipo, en el piloto'
const PASOS = [
  { titulo: 'Exportar', texto: 'Los archivos del mes, con un mismo corte, a una carpeta restringida',
    quien: 'Lucía O., Operaciones' },
  { titulo: 'Preparar', texto: 'Por cliente: días sin comprar, ritmo habitual y umbral; frena un mes incompleto',
    quien: QUIEN_EQUIPO },
  { titulo: 'Ordenar', texto: `La regla toma los ${entero(P.lista_mes)} contactables más cerca de su umbral, sin modelo`,
    quien: QUIEN_EQUIPO, enfasis: true },
  { titulo: 'Entregar', texto: `Planilla con ${entero(P.control_mes)} de control, resumen por local y tablero del mes`,
    quien: 'El equipo; el resumen por local, Sofía R.' },
  { titulo: 'Contactar', texto: `Sofía R. excluye con motivo; Marketing escribe por WhatsApp con ${pct(E.parametros.descuento, 0)} de descuento`,
    quien: 'Sofía R.' },
  { titulo: 'Medir', texto: `Compra a 7 días de contactados y control; a los ${entero(D3.caso.ventana_dias)} días, quién cruzó su umbral`,
    quien: 'Juan Manuel R.' },
]

function FlujoMes() {
  return (
    <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)', display: 'flex',
                  flexDirection: 'column', justifyContent: 'center', gap: 'clamp(8px, 2cqh, 22px)' }}>
      <ol style={{ display: 'grid', gridTemplateColumns: `repeat(${PASOS.length}, minmax(0, 1fr))`,
                   gap: 'clamp(6px, 0.8cqw, 14px)', margin: 0, padding: 0, listStyle: 'none' }}>
        {PASOS.map((p, i) => (
          <li key={p.titulo} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--bd)',
                                      borderTop: `3px solid ${p.enfasis ? ACC : 'var(--azul3)'}`,
                                      padding: 'clamp(6px, 1.4cqh, 14px) clamp(8px, 0.9cqw, 14px)' }}>
            <span className="kpi-lbl"><span>{`${i + 1} · ${p.titulo}`}</span></span>
            <p className="e2-nota" style={{ color: 'var(--ink)' }}>{p.texto}</p>
            <p className="e2-nota" style={{ marginTop: 'auto', paddingTop: 'clamp(4px, 1cqh, 10px)' }}>{p.quien}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ---------------------------------------------------------------- Explorar: el plan de 20 semanas (D 12)

function PlanSemanas({ w, h, k }) {
  const fEtq = 13.5 * k
  const fVal = 12.5 * k
  const fHito = 12.5 * k
  const fTick = 10.5 * k
  const fTit = 11 * k
  const N = PL.semanas
  const x0 = Math.max(...PL.fases.map((f) => ancho(f.nombre, fEtq, f.id === 'piloto' ? 700 : 400))) + 14 * k
  const padR = Math.round(4 * k)
  const x = (s) => x0 + (s / N) * (w - x0 - padR)        // s: semanas cumplidas, de 0 a N

  const hitos = [
    { s: PL.hitos_semana.go_live - 1, t: `primera lista · ${fecha(PILOTO.desde)}`, ancla: 'start' },
    { s: PL.hitos_semana.decision, t: `decide María G. · ${fecha(DECIDE.hasta)}`, ancla: 'end' },
  ]
  const yHito = Math.ceil(fHito * 0.4) + 2 + fHito
  const top = yHito + 10 * k
  const yBase = h - (5 + fTick + 8 * k + fTit + 6 * k)
  const paso = (yBase - top) / PL.fases.length
  const alto = Math.min(paso * 0.62, 30 * k)
  const marcas = [1, ...[5, 10, 15, 20].filter((s) => s <= N && s > 1)]

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }} aria-label={TITULO_PLAN}>
      {PL.fases.map((f, i) => {
        const y = top + i * paso + (paso - alto) / 2
        const xa = x(f.desde_semana - 1)
        const xb = x(f.hasta_semana)
        const enfasis = f.id === 'piloto'
        const txt = semanas(f.semanas)
        const wt = ancho(txt, fVal, 600)
        // La duración, adentro de la barra si entra; si no, a la derecha; y si tampoco, a la izquierda.
        const lugar = xb - xa >= wt + 12 * k ? 'adentro' : xb + 7 * k + wt <= w ? 'derecha' : 'izquierda'
        const xt = lugar === 'adentro' ? (xa + xb) / 2 : lugar === 'derecha' ? xb + 7 * k : xa - 7 * k
        return (
          <g key={f.id}>
            <title>{`${f.nombre}: ${rango(f)}, del ${fecha(f.desde)} al ${fecha(f.hasta)}`
              + (enfasis ? `. Quién opera después del piloto se elige en la semana ${PL.hitos_semana.operador_despues_del_piloto}.` : '')}</title>
            <text x={x0 - 9 * k} y={y + alto / 2} fontSize={fEtq} fill={enfasis ? INK : MUT2} textAnchor="end"
                  fontWeight={enfasis ? 700 : 400} dominantBaseline="central">{f.nombre}</text>
            <rect x={xa} y={y} width={Math.max(1, xb - xa)} height={alto} fill={enfasis ? ACC : GRIS} />
            <text x={xt} y={y + alto / 2} fontSize={fVal} fontWeight={600} dominantBaseline="central"
                  fill={lugar === 'adentro' ? '#fff' : INK} className="tabular"
                  textAnchor={lugar === 'adentro' ? 'middle' : lugar === 'derecha' ? 'start' : 'end'}>{txt}</text>
          </g>
        )
      })}

      {hitos.map((m) => (
        <g key={m.t}>
          <line x1={x(m.s)} x2={x(m.s)} y1={yHito + 4 * k} y2={yBase} stroke={INK} strokeWidth="1.25" strokeDasharray="4 3" />
          <text x={x(m.s) + (m.ancla === 'start' ? 5 * k : 0)} y={yHito} fontSize={fHito} fontWeight={700} fill={INK}
                textAnchor={m.ancla} className="tabular">{m.t}</text>
        </g>
      ))}

      <line x1={x0} x2={x0} y1={top} y2={yBase} stroke={EJE} strokeWidth="1" />
      <line x1={x0} x2={x(N)} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />
      {Array.from({ length: N + 1 }, (_, s) => (
        <line key={s} x1={x(s)} x2={x(s)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
      ))}
      {marcas.map((s) => (
        <text key={s} x={x(s - 0.5)} y={yBase + 5 + fTick} fontSize={fTick} fill={MUT} textAnchor="middle"
              className="tabular">{s}</text>
      ))}
      <TituloEje x={x(N)} y={yBase + 5 + fTick + 8 * k + fTit} f={fTit}
                 texto={`semana del proyecto, desde el ${fecha(PL.semana_1)}`} />
    </svg>
  )
}


// ---------------------------------------------------------------- la vista

const OPCIONES = [
  { valor: 'decide', texto: 'Qué decide' },
  { valor: 'flujo', texto: 'El flujo' },
  { valor: 'plan', texto: 'El plan' },
]

export default function V07ParteD() {
  const k = useEscalaTexto()
  const [abierto, setAbierto] = useState(false)
  const [panel, setPanel] = useState('decide')
  // Tocado con el mouse, el control cambia y suelta el foco: las flechas siguen pasando de vista.
  const soltar = (e) => { if (e.detail) e.target.closest?.('button')?.blur() }
  const cab = !abierto
    ? { mide: `Compra a 7 días al cierre del tercer mes · semana${NBSP}${PILOTO.hasta_semana}`, conclusion: CONCLUSION }
    : panel === 'decide'
      ? { mide: 'Del alcance a la decisión final', conclusion: 'Lo que decide María G. y en qué semana' }
      : panel === 'flujo'
        ? { mide: 'La lista sale con la regla', conclusion: 'Cada mes del piloto, de la exportación a la medición' }
        : { mide: `Piloto del ${fecha(PILOTO.desde)} al ${fecha(PILOTO.hasta)}`,
            conclusion: `Plan del proyecto: ${semanas(PL.semanas)}` }
  const titulo = !abierto ? undefined
    : panel === 'decide' ? TITULO_PEDIDOS : panel === 'flujo' ? TITULO_FLUJO : TITULO_PLAN
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

      <div className="tarjeta e3-v07-graf" title={titulo}>
        <div className="e3-v07-cab">
          <div className="e3-v07-txt">
            <p className="e3-v07-mide tabular">{cab.mide}</p>
            <p className="e3-conclusion">{cab.conclusion}</p>
          </div>
          <span className="e3-v07-ctrl" onClick={soltar}>
            {abierto && <Opciones etiqueta="Qué mostrar" valor={panel} onCambio={setPanel} opciones={OPCIONES} />}
            <BotonExplorar abierto={abierto} onCambio={(v) => { setAbierto(v); if (!v) setPanel('decide') }} />
          </span>
        </div>

        {!abierto ? (
          <div className="e3-v07-lienzo">
            <Lienzo className="lienzo">
              {({ w, h }) => <ReglaPiloto w={w} h={h} k={k} />}
            </Lienzo>
          </div>
        ) : panel === 'decide' ? <Pedidos /> : panel === 'flujo' ? <FlujoMes /> : (
          <div className="e3-v07-lienzo">
            <Lienzo className="lienzo">
              {({ w, h }) => <PlanSemanas w={w} h={h} k={k} />}
            </Lienzo>
          </div>
        )}
      </div>
    </section>
  )
}
