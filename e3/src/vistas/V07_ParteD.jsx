// V07 · ¿Qué decide María G. con el piloto? (Parte D 9, 11.1 y 12; diapositiva 12 de C3).
// W3, 27/10. Junta las vistas 8 y 9 de la tabla «La historia» del PLAN.md (la 7, el test, quedó en la vista 4:
// crítica del W3, hallazgo 5, «una vista, un mensaje»). Misma forma que la vista 5: banda de cifras con la
// tarjeta de decisión a la derecha y un gráfico a todo el ancho debajo.
//
// - Banda: el tamaño del piloto (G49: 1.260 contactados y 240 de control), cuánto tiene que dar para pasar a
//   producción (H49, 40,4 puntos), la cifra que responde la pregunta y la única al tamaño máximo (regla 13 H1
//   del E2), y cuánto dura el plan hasta la decisión (J50: 20 semanas, del 02/11/2026 al 21/03/2027). Anchos
//   2 / 3 / 2, como la 5.
// - Decisión: «D-PIL · propuesta» de decisiones.js, la regla del piloto en una frase de hasta 60 caracteres
//   (regla 11 del E2). C3 no trae esa frase: queda acá hasta que contenido.py exporte la Parte D (W4).
// - Gráfico: la regla de decisión del piloto, como la figura de la diapositiva 12 (G49, H49). Debajo de 2,87
//   puntos el efecto no se distingue de cero (el rótulo va junto al 2,87, porque el tramo es angosto); de
//   2,87 a 40,4 contactar funciona y la lista no se paga; desde 40,4 se pasa a producción. Una llave sobre la
//   banda, de 0 a 40,4, dice lo que decide María G. con cualquier valor debajo de 40,4 (D 11.1). A la
//   derecha, lo que decide María G. y en qué semana: las filas de la D 12.3 que son suyas (12.4), con las
//   semanas de D3.plan.hitos_semana (J50). Hasta la crítica del W3 la lista salía de los pedidos de la
//   diapositiva 12 de C3, escritos antes de la D: le daba a María G. el grupo de control (lo aprueba Sofía R.)
//   y dejaba sin dueño ni plazo la inscripción en la AAIP.
// - Explorar, cerrado al llegar, con dos paneles: el flujo de cada mes (la tabla 9.2 de la Parte D) y el plan
//   de 20 semanas (J50, sección 12). Lo que antes iba al pie del flujo va al title (regla 12 del E2).
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
  { t: 'Quién inscribe las bases en la AAIP', s: HS.acciones_legales_y_control },
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

export const meta = { id: 'V07', dc: 'D-PIL' }

// ---------------------------------------------------------------- texto en SVG

const ACC = 'var(--acc)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'
const EJE = 'var(--eje)'

/** Renglones de hasta `w` px, cortando entre palabras. */
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

// ---------------------------------------------------------------- el gráfico: la regla del piloto

function ReglaPiloto({ w, h, k }) {
  const fVal = 17 * k                    // 2,87 y 40,4
  const fT = 14 * k                      // lo que pasa en cada tramo
  const fNota = 13 * k
  const fTick = 10.5 * k
  const fTit = 11 * k
  const { max, ticks } = escalaNice(PAGA / 0.7)
  const padL = 2
  const padR = Math.round(4 * k)
  const x = (v) => padL + (v / max) * (w - padL - padR)
  const xm = x(MDE)
  const xp = x(PAGA)
  const xf = x(max)

  // Lo que pasa en el tramo del medio y en el de la derecha, envuelto al ancho de cada uno; lo que decide María
  // G. debajo de 40,4, sobre la llave que va de 0 a 40,4, centrado entre el 2,87 y el 40,4 para no cruzar la
  // línea del 2,87.
  const medio = envolver('contactar funciona, pero la lista no se paga', xp - xm - 20 * k, fT)
  const derecha = envolver('se pasa a producción', xf - xp - 14 * k, fT, 700)
  const decide = envolver('María G. elige: cerrar o repetir sin descuento', xp - xm - 20 * k, fT, 700)
  const inter = fT * 1.3
  const nLineas = Math.max(medio.length, derecha.length)

  // Alto: la fila de los dos valores, la llave con su texto, la banda y el eje con su título. La banda toma lo
  // que sobra (con tope); el resto se reparte arriba y abajo, para que el dibujo quede centrado en su caja.
  const altoArriba = fVal * 1.25 + 8 * k + decide.length * inter + 4 * k + 7 * k
  const altoAbajo = 5 + fTick + 8 * k + fTit + 4 * k
  const hb = Math.max(nLineas * inter + 22 * k, Math.min(150 * k, h - altoArriba - altoAbajo - 4))
  const y0 = Math.max(2, (h - altoArriba - hb - altoAbajo) * 0.45)
  const yVal = y0 + fVal
  const yDec = yVal + fVal * 0.25 + 8 * k            // arriba del texto de la llave
  const yLlave = yDec + decide.length * inter + 4 * k
  const yb = yLlave + 7 * k
  const yEje = yb + hb

  // Los dos valores, sobre su línea; al lado del 2,87, el rótulo del tramo gris, si entra antes del 40,4.
  const wMde = ancho(T_MDE, fVal, 700)
  const wPaga = ancho(T_PAGA, fVal, 700)
  const xMdeTxt = Math.max(0, xm - wMde / 2)
  const limite = xp - wPaga / 2 - 12 * k
  const gris = ['por debajo, no se distingue de cero', 'debajo, no se distingue de cero']
    .find((t) => xMdeTxt + wMde + 10 * k + ancho(t, fNota, 500) <= limite)

  const yMedio = yb + hb / 2 - ((nLineas - 1) * inter) / 2
  const cMedio = (xm + xp) / 2
  const cDer = (xp + xf) / 2

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Regla de decisión del piloto, con la compra a 7 días de los contactados menos la del control al `
           + `tercer mes: debajo de ${T_MDE} puntos no se distingue de cero; de ${T_MDE} a ${T_PAGA}, contactar `
           + `funciona pero la lista no se paga; con cualquier valor debajo de ${T_PAGA}, María G. elige entre cerrar `
           + `o repetir sin descuento; desde ${T_PAGA}, se pasa a producción`}>
      <g>
        <title>{`Debajo de ${T_MDE} puntos: con ${entero(P.control)} clientes de control, el efecto del contacto no se `
          + 'distingue de cero. No se pasa a producción.'}</title>
        <rect x={x(0)} y={yb} width={Math.max(1, xm - x(0))} height={hb} fill="var(--trk)" />
      </g>
      <g>
        <title>{`De ${T_MDE} a ${T_PAGA} puntos: contactar funciona, pero la lista no se paga.`}</title>
        <rect x={xm} y={yb} width={Math.max(1, xp - xm)} height={hb} fill="var(--azul1)" />
        {medio.map((l, i) => (
          <text key={i} x={cMedio} y={yMedio + i * inter} fontSize={fT} fill={INK}
                textAnchor="middle" dominantBaseline="central">{l}</text>
        ))}
      </g>
      <g>
        <title>{`Desde ${T_PAGA} puntos: la lista se paga y María G. invierte en producción con la regla.`}</title>
        <rect x={xp} y={yb} width={Math.max(1, xf - xp)} height={hb} fill={ACC} />
        {derecha.map((l, i) => (
          <text key={i} x={cDer} y={yb + hb / 2 - ((derecha.length - 1) * inter) / 2 + i * inter} fontSize={fT}
                fontWeight={700} fill="#fff" textAnchor="middle" dominantBaseline="central">{l}</text>
        ))}
      </g>

      {/* La llave de 0 a 40,4: lo que decide María G. con cualquier valor debajo de 40,4 (D 11.1). */}
      <g>
        <title>{`Con cualquier valor debajo de ${T_PAGA} puntos, María G. elige entre cerrar con el piloto o repetirlo `
          + 'sin descuento (Parte D 11.1).'}</title>
        <path d={`M ${x(0) + 1} ${yb - 1} V ${yLlave} H ${xp - 5 * k} V ${yb - 1}`} fill="none" stroke={INK}
              strokeWidth="1.25" />
        {decide.map((l, i) => (
          <text key={i} x={cMedio} y={yDec + i * inter + fT * 0.5} fontSize={fT} fontWeight={700} fill={INK}
                textAnchor="middle" dominantBaseline="central">{l}</text>
        ))}
      </g>

      {/* Las dos líneas de la regla, con su valor arriba. */}
      <g>
        <title>{`${T_MDE} puntos: la diferencia más chica que ${entero(P.tratados)} contactados contra `
          + `${entero(P.control)} de control distinguen de cero; por debajo, el efecto no se distingue de cero`}</title>
        <line x1={xm} x2={xm} y1={yVal + 4 * k} y2={yEje} stroke={INK} strokeWidth="1.5" />
        <text x={xMdeTxt} y={yVal} fontSize={fVal} fontWeight={700} fill={INK} className="tabular">{T_MDE}</text>
        {gris && (
          <text x={xMdeTxt + wMde + 10 * k} y={yVal} fontSize={fNota} fontWeight={500} fill={MUT2}>{gris}</text>
        )}
      </g>
      <g>
        <title>{TITULO_PAGA}</title>
        <line x1={xp} x2={xp} y1={yVal + 4 * k} y2={yEje} stroke={INK} strokeWidth="1.5" />
        <text x={xp} y={yVal} fontSize={fVal} fontWeight={700} fill={INK} textAnchor="middle"
              className="tabular">{T_PAGA}</text>
      </g>

      {/* Eje, con su título en la punta. */}
      <g>
        <line x1={x(0)} x2={xf} y1={yEje} y2={yEje} stroke={EJE} strokeWidth="1" />
        {ticks.map((t, i) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={yEje} y2={yEje + 4} stroke={EJE} strokeWidth="1" />
            <text x={x(t)} y={yEje + 5 + fTick} fontSize={fTick} fill={MUT} className="tabular"
                  textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'}>{fijo(t, 0)}</text>
          </g>
        ))}
        <TituloEje x={xf} y={yEje + 5 + fTick + 8 * k + fTit} f={fTit} texto="contactados menos control, en puntos" />
      </g>
    </svg>
  )
}

/** Lo que decide María G. y en qué semana (D 12.3 y 12.4), a la derecha del gráfico. */
function Pedidos() {
  return (
    <div title={TITULO_PEDIDOS}
         style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  borderLeft: '1px solid var(--bd)', paddingLeft: 'clamp(12px, 1.4cqw, 24px)' }}>
      <span className="kpi-lbl"><span>Lo que decide María G.</span></span>
      <ol style={{ margin: 'clamp(6px, 1.2cqh, 14px) 0 0', paddingLeft: '1.3em', display: 'flex',
                   flexDirection: 'column', gap: 'clamp(3px, 0.8cqh, 10px)' }}>
        {PEDIDOS.map((p) => (
          <li key={p.t} className="e2-nota" style={{ margin: 0, color: 'var(--ink)' }}>
            {p.t}
            <span className="tabular" style={{ color: 'var(--mut2)', whiteSpace: 'nowrap' }}>{` · semana${NBSP}${p.s}`}</span>
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
  { valor: 'flujo', texto: 'El flujo' },
  { valor: 'plan', texto: 'El plan' },
]

export default function V07ParteD() {
  const k = useEscalaTexto()
  const [abierto, setAbierto] = useState(false)
  const [panel, setPanel] = useState('flujo')
  // Tocado con el mouse, el control cambia y suelta el foco: las flechas siguen pasando de vista.
  const soltar = (e) => { if (e.detail) e.target.closest?.('button')?.blur() }
  const frase = !abierto
    ? { span: 'Regla de decisión del piloto, con la compra a 7 días',
        b: `al cierre del tercer mes, semana ${PILOTO.hasta_semana}` }
    : panel === 'flujo'
      ? { span: 'Cada mes del piloto, de la exportación a la medición', b: 'la lista sale con la regla' }
      : { span: `Plan del proyecto: ${semanas(PL.semanas)}`,
          b: `piloto del ${fecha(PILOTO.desde)} al ${fecha(PILOTO.hasta)}` }
  const altoRegla = Math.round(290 * k)
  return (
    <section className="pant v07">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={TITULO_PILOTO}>
          <span className="kpi-lbl"><span>En el piloto</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={entero(P.tratados)} sec /></div>
          </div>
          <p className="e2-linea">{`contactados y ${entero(P.control)} de control`}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }} title={TITULO_PAGA}>
          <span className="kpi-lbl"><span>Para ir a producción</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={T_PAGA} /></div>
          </div>
          <p className="e2-linea">puntos más que el control</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={TITULO_PLAN}>
          <span className="kpi-lbl"><span>Hasta decidir</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(PL.semanas)} unidad={`${NBSP}semanas`} sec />
            </div>
          </div>
          <p className="e2-linea">{`del ${fecha(PL.semana_1)} al ${fecha(DECIDE.hasta)}`}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}
           title={abierto ? (panel === 'flujo' ? TITULO_FLUJO : TITULO_PLAN) : undefined}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(8px, 1.2cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            <span>{frase.span}</span>
            <b className="tabular">{frase.b}</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 0.8cqw, 12px)', flexShrink: 0 }}
                onClick={soltar}>
            {abierto && <Opciones etiqueta="Qué mostrar" valor={panel} onCambio={setPanel} opciones={OPCIONES} />}
            <BotonExplorar abierto={abierto} onCambio={(v) => { setAbierto(v); if (!v) setPanel('flujo') }} />
          </span>
        </div>

        {!abierto ? (
          <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)', display: 'flex',
                        gap: 'clamp(12px, 1.6cqw, 28px)' }}>
            <div style={{ flex: '1.75 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ flex: '0 1 auto', height: altoRegla, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Lienzo className="lienzo">
                  {({ w, h }) => <ReglaPiloto w={w} h={h} k={k} />}
                </Lienzo>
              </div>
            </div>
            <Pedidos />
          </div>
        ) : panel === 'flujo' ? <FlujoMes /> : (
          <div style={{ flex: '1 1 0', minHeight: 0, marginTop: 'clamp(6px, 1.6cqh, 20px)', display: 'flex',
                        flexDirection: 'column' }}>
            <Lienzo className="lienzo">
              {({ w, h }) => <PlanSemanas w={w} h={h} k={k} />}
            </Lienzo>
          </div>
        )}
      </div>
    </section>
  )
}
