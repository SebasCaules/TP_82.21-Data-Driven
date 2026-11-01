// V08 · ¿Cómo funciona cada mes y en qué semana? (Parte D 9.2, 12.1 a 12.4; diapositiva 13 de C3). Nueva el
// 01/11: lo que hasta ese día iba detrás de un botón en la vista 7 (el flujo de cada mes, el plan de 20 semanas y lo
// que decide María G. con su semana) queda a la vista, en una vista propia con la misma forma que las demás.
//
// - Banda, un número por tarjeta y la central primero (N0-6). Central: la semana en que sale la primera lista
//   (D3.plan.hitos_semana.go_live, J50; hito 6 de la D 12.2), «con los criterios de go-live» (D 10.3; la fecha va
//   al title). Después, la semana en que María G. elige quién opera la lista después del piloto (hito 7) y la de la
//   decisión de producción (hito 8). Anchos 3 / 2 / 2, como la vista 7.
// - Decisión: «D-PLA · propuesta» de decisiones.js: el plan de 20 semanas de la D 12.
// - Gráfico, un solo svg en tres piezas:
//   - arriba, a todo el ancho, el flujo de cada mes (D 9.2): seis pasos con qué se hace y quién; el de la regla, en
//     --acc;
//   - abajo a la izquierda, las seis fases del plan sobre las 20 semanas (D 12.1, J50), con la primera lista y la
//     decisión marcadas (D 12.2); el piloto, en --acc;
//   - abajo a la derecha, lo que decide María G. y en qué semana (las filas de la D 12.3 a su cargo, 12.4). La
//     última, la decisión de producción, en --acc.
// Ninguna cifra escrita acá: las semanas, las fechas y los tamaños salen de D3 (datos_e3.js) con formato.js. Los
// textos del flujo y de los pedidos resumen las tablas 9.2, 12.3 y 12.4 de la Parte D.

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fecha, fijo, pct } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { anchoTexto as ancho } from '../medir.js'
import './V08.css'

const P = D3.piloto
const PL = D3.plan
const E = D3.economia
const HS = PL.hitos_semana
const FASE = Object.fromEntries(PL.fases.map((f) => [f.id, f]))
const PILOTO = FASE.piloto
const DECIDE = FASE.decision
const T_PAGA = fijo(P.umbral_produccion_pp, 1)
const semanas = (n) => `${n}${NBSP}${n === 1 ? 'semana' : 'semanas'}`
const rango = (f) => (f.desde_semana === f.hasta_semana ? `semana ${f.desde_semana}`
  : `semanas ${f.desde_semana} a ${f.hasta_semana}`)
const sem = (n) => `semana${NBSP}${n}`
/** La cifra de la banda: el número de la semana grande y «semana» delante, un escalón más chica (como «USD»). */
function CifraSemana({ n, sec = false }) {
  return (
    <span className={`par-val tabular e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{'semana '}</span>{n}
    </span>
  )
}

const DECISION = decision('D-PLA', {
  llano_corto: `${semanas(PL.semanas)}: primera lista en la ${HS.go_live}, decisión en la ${HS.decision}`,
  llano: `El plan dura ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. La primera lista sale en la semana `
    + `${HS.go_live}, el ${fecha(PILOTO.desde)}, con los cinco criterios de go-live; el piloto cierra en la semana `
    + `${PILOTO.hasta_semana} y María G. decide en la ${HS.decision}, el ${fecha(DECIDE.hasta)}.`,
  decision: `Primera lista en la semana ${HS.go_live}; decisión de producción en la ${HS.decision}`,
  justificacion: 'Parte D 12.1 a 12.4: las fases 1 a 3 van en paralelo con el extracto actual; las listas salen en '
    + 'diciembre, enero y febrero, después de la campaña de fin de año.',
})

// El flujo de cada mes (D 9.2). La regla, en --acc.
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

// Lo que decide María G. y en qué semana: las filas de la D 12.3 a su cargo (12.4), en el orden del plan.
const PEDIDOS = [
  { t: 'El alcance: regla sin modelo y piloto con control', s: HS.alcance },
  { t: 'La regla del target, con revisión de Sofía R.', s: HS.regla_y_operador_del_piloto },
  // (28/10, F6b) La D v1.3 (12.3 y 12.4): María G. designa quién inscribe las bases en la semana 2, para que la
  // inscripción (L1) esté en la 4.
  { t: 'Quién inscribe las bases en la AAIP', s: HS.designa_l1 },
  { t: 'Quién opera la lista después del piloto', s: HS.operador_despues_del_piloto },
  { t: `Si pasa a producción, con ${T_PAGA} puntos o más`, s: HS.decision, enfasis: true },
]
const SEMANAS_MG = (() => {
  const s = [...new Set(PEDIDOS.map((p) => p.s))].sort((a, b) => a - b)
  return `${s.slice(0, -1).join(', ')} y ${s[s.length - 1]}`
})()
const TITULO_PEDIDOS = `Parte D 12.3 y 12.4. En la semana ${HS.regla_y_operador_del_piloto} María G. también aprueba `
  + 'quién opera el piloto (el equipo consultor), firma el acuerdo de confidencialidad y aprueba la política de '
  + `retención. El grupo de control, ${entero(P.control_mes)} por mes fuera del 20${NBSP}% de mayor facturación, lo `
  + `aprueba Sofía R. en la semana ${HS.regla_y_operador_del_piloto}.`
const TITULO_PLAN = `Plan del proyecto: ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. `
  + PL.fases.map((f) => `${f.nombre}, ${rango(f)}`).join('; ')
  + `. La primera lista sale el ${fecha(PILOTO.desde)}; María G. decide el ${fecha(DECIDE.hasta)}.`
const TITULO_FLUJO = `Parte D 9.2. Una lista por mes, ${P.meses} en total, desde el ${fecha(PILOTO.desde)}; el piloto `
  + `cierra el ${fecha(PILOTO.hasta)}. Lo que se mide reemplaza el ${pct(E.parametros.s_observada, 2)} de compra que `
  + 'hoy se ve sin grupo de control.'

export const meta = { id: 'V08', dc: 'D-PLA' }

// ---------------------------------------------------------------- texto en SVG

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const EJE = 'var(--e3-eje, #6a7489)'
const CTX_R = 'var(--e3-ctx-relleno, #a9b1bf)'

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

const anchoMono = (t, f) => ancho(String(t).toUpperCase(), f, 600, true) + 0.08 * f * String(t).length

/** Título de una pieza: mono, mayúsculas, en contexto; la letra baja si no entra en `max`. */
function Titulo({ x = 0, y, f, texto, max = Infinity }) {
  const fx = Math.min(f, f * (max / Math.max(1, anchoMono(texto, f))))
  return (
    <text x={x} y={y} fontSize={fx} fill={CTX} fontWeight={600} fontFamily="var(--mono)" letterSpacing={`${0.08 * fx}`}
          style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

function Renglones({ lineas, x, y, f, peso = 400, color = INK, inter = 1.25 }) {
  return lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * inter} fontSize={f} fontWeight={peso} fill={color}
          dominantBaseline="hanging">{l}</text>
  ))
}

// ---------------------------------------------------------------- el flujo de cada mes

function Flujo({ w, h, k }) {
  const n = PASOS.length
  const flecha = 14 * k
  const bw = (w - flecha * (n - 1)) / n
  const pad = 7 * k
  const tw = bw - 2 * pad
  const medir = (f) => {
    const fT = f * 1.04
    const fQ = f * 0.9
    return Math.max(...PASOS.map((p) => pad * 1.4 + fT * 1.35 + envolver(p.texto, tw, f).length * f * 1.25
      + fQ * 0.35 + envolver(p.quien, tw, fQ, 600).length * fQ * 1.25 + pad))
  }
  let f = 13 * k
  while (medir(f) > h && f > 9) f -= 0.25
  const fT = f * 1.04
  const fQ = f * 0.9
  const bh = Math.min(h, medir(f))
  return (
    <g aria-label={TITULO_FLUJO}>
      {PASOS.map((p, i) => {
        const x = i * (bw + flecha)
        const lt = envolver(p.texto, tw, f)
        const lq = envolver(p.quien, tw, fQ, 600)
        const yT = pad * 1.4
        const yTx = yT + fT * 1.35
        const yQ = bh - pad - lq.length * fQ * 1.25
        return (
          <g key={p.titulo}>
            <title>{`${i + 1} · ${p.titulo}. ${p.texto}. ${p.quien}.`}</title>
            <rect x={x} y={0} width={bw} height={bh} fill={p.enfasis ? 'var(--azul1)' : 'var(--sup)'}
                  stroke={p.enfasis ? ACC : 'var(--bd)'} strokeWidth={p.enfasis ? 1.5 : 1} />
            <rect x={x} y={0} width={bw} height={3 * k} fill={p.enfasis ? ACC : 'var(--azul3)'} />
            <text x={x + pad} y={yT} fontSize={fT} fontWeight={700} fill={p.enfasis ? ACC : INK}
                  dominantBaseline="hanging">{`${i + 1} · ${p.titulo}`}</text>
            <Renglones lineas={lt} x={x + pad} y={yTx} f={f} />
            <Renglones lineas={lq} x={x + pad} y={yQ} f={fQ} peso={600} color={CTX} />
            {i < n - 1 && (
              <path d={`M${x + bw + 3 * k},${bh / 2} h${flecha - 7 * k} l-${3.5 * k},-${3.5 * k} m${3.5 * k},${3.5 * k} l-${3.5 * k},${3.5 * k}`}
                    fill="none" stroke={INK} strokeWidth={1.5} />
            )}
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- las fases sobre las 20 semanas (D 12.1 y 12.2)

function Fases({ w, h, k }) {
  const fEtq = 12.5 * k
  const fVal = 11.5 * k
  const fHito = 11.5 * k
  const fTick = 10.5 * k
  const N = PL.semanas
  const x0 = Math.max(...PL.fases.map((f) => ancho(f.nombre, fEtq, f.id === 'piloto' ? 700 : 400))) + 12 * k
  const padR = Math.round(4 * k)
  const x = (s) => x0 + (s / N) * (w - x0 - padR)        // s: semanas cumplidas, de 0 a N

  // Los dos hitos, en dos renglones: en la caja angosta los rótulos se pisarían en uno.
  const hitos = [
    { s: HS.go_live - 1, t: `primera lista · ${fecha(PILOTO.desde)}`, ancla: 'start', y: fHito },
    { s: HS.decision, t: `decide María G. · ${fecha(DECIDE.hasta)}`, ancla: 'end', y: fHito * 2.25 },
  ]
  const top = fHito * 2.25 + 7 * k
  const yBase = h - (5 + fTick + 2)
  const paso = (yBase - top) / PL.fases.length
  const alto = Math.min(paso * 0.6, 24 * k)
  const marcas = [1, ...[5, 10, 15, 20].filter((s) => s <= N && s > 1)]

  return (
    <g aria-label={TITULO_PLAN}>
      {PL.fases.map((f, i) => {
        const y = top + i * paso + (paso - alto) / 2
        const xa = x(f.desde_semana - 1)
        const xb = x(f.hasta_semana)
        const enfasis = f.id === 'piloto'
        const txt = semanas(f.semanas)
        const wt = ancho(txt, fVal, 600)
        // La duración, adentro de la barra si entra; si no, a la derecha, y si tampoco, a la izquierda.
        const lugar = xb - xa >= wt + 10 * k ? 'adentro' : xb + 6 * k + wt <= w ? 'derecha' : 'izquierda'
        const xt = lugar === 'adentro' ? (xa + xb) / 2 : lugar === 'derecha' ? xb + 6 * k : xa - 6 * k
        return (
          <g key={f.id}>
            <title>{`${f.nombre}: ${rango(f)}, del ${fecha(f.desde)} al ${fecha(f.hasta)}`}</title>
            <text x={x0 - 8 * k} y={y + alto / 2} fontSize={fEtq} fill={enfasis ? INK : CTX} textAnchor="end"
                  fontWeight={enfasis ? 700 : 400} dominantBaseline="central">{f.nombre}</text>
            <rect x={xa} y={y} width={Math.max(1, xb - xa)} height={alto} fill={enfasis ? ACC : CTX_R} />
            <text x={xt} y={y + alto / 2} fontSize={fVal} fontWeight={600}
                  dominantBaseline="central" fill={lugar === 'adentro' && enfasis ? '#fff' : INK}
                  className={lugar === 'adentro' ? 'tabular' : 'tabular e3-v08-halo'}
                  textAnchor={lugar === 'adentro' ? 'middle' : lugar === 'derecha' ? 'start' : 'end'}>{txt}</text>
          </g>
        )
      })}

      {hitos.map((m) => (
        <g key={m.t}>
          <line x1={x(m.s)} x2={x(m.s)} y1={m.y + 3 * k} y2={yBase} stroke={INK} strokeWidth="1.25" strokeDasharray="4 3" />
          <text x={x(m.s) + (m.ancla === 'start' ? 4 * k : -4 * k)} y={m.y} fontSize={fHito} fontWeight={700} fill={INK}
                textAnchor={m.ancla} className="tabular">{m.t}</text>
        </g>
      ))}

      <line x1={x0} x2={x0} y1={top} y2={yBase} stroke={EJE} strokeWidth="1" />
      <line x1={x0} x2={x(N)} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />
      {Array.from({ length: N + 1 }, (_, s) => (
        <line key={s} x1={x(s)} x2={x(s)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
      ))}
      {marcas.map((s) => (
        <text key={s} x={x(s - 0.5)} y={yBase + 5 + fTick * 0.85} fontSize={fTick} fill={CTX} textAnchor="middle"
              className="tabular" data-escala="">{s}</text>
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- lo que decide María G. (D 12.3 y 12.4)

function Pedidos({ w, h, k }) {
  const fSem = 11 * k
  const anchoSem = Math.max(...PEDIDOS.map((p) => anchoMono(sem(p.s), fSem))) + 12 * k
  const tw = w - anchoSem
  const medir = (f) => PEDIDOS.reduce((a, p) => a + envolver(p.t, tw, f, p.enfasis ? 700 : 500).length * f * 1.25 + f * 0.8, 0)
  let f = 14 * k
  while (medir(f) > h && f > 9) f -= 0.25
  const extra = Math.max(0, (h - medir(f)) / PEDIDOS.length)
  let y = 0
  return (
    <g aria-label={TITULO_PEDIDOS}>
      {PEDIDOS.map((p, i) => {
        const peso = p.enfasis ? 700 : 500
        const lt = envolver(p.t, tw, f, peso)
        const alto = lt.length * f * 1.25 + f * 0.8 + extra
        const y0 = y
        y += alto
        const color = p.enfasis ? ACC : INK
        return (
          <g key={p.t}>
            <title>{`Semana ${p.s}: ${p.t}`}</title>
            {i > 0 && <line x1={0} x2={w} y1={y0} y2={y0} stroke="var(--bd)" strokeWidth="1" />}
            <text x={0} y={y0 + alto / 2} fontSize={fSem} fill={p.enfasis ? ACC : CTX} fontWeight={600}
                  fontFamily="var(--mono)" letterSpacing={`${0.06 * fSem}`} dominantBaseline="central"
                  style={{ textTransform: 'uppercase' }}>{sem(p.s)}</text>
            <Renglones lineas={lt} x={anchoSem} y={y0 + (alto - lt.length * f * 1.25) / 2 + f * 0.05} f={f}
                       peso={peso} color={color} />
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- el dibujo

function Dibujo({ w, h, k }) {
  const fT = 10.5 * k
  const altoTit = fT * 1.8
  const gapY = 14 * k
  const gapX = 30 * k
  const hFlujo = Math.round((h - gapY) * 0.42)
  const yAbajo = hFlujo + gapY
  const hAbajo = h - yAbajo
  const wIzq = Math.round((w - gapX) * 0.6)
  const wDer = w - gapX - wIzq
  const xDer = wIzq + gapX
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Cómo funciona cada mes y en qué semana: el flujo de cada mes, las fases del plan y lo que decide María G.">
      <Titulo y={fT} f={fT} max={w} texto={`Cada mes del piloto, ${P.meses} veces: de la exportación a la medición`} />
      <g transform={`translate(0, ${altoTit})`}>
        <Flujo w={w} h={hFlujo - altoTit} k={k} />
      </g>
      <Titulo y={yAbajo + fT} f={fT} max={wIzq} texto={`Plan de ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}`} />
      <g transform={`translate(0, ${yAbajo + altoTit})`}>
        <Fases w={wIzq} h={hAbajo - altoTit} k={k} />
      </g>
      <line x1={wIzq + gapX / 2} x2={wIzq + gapX / 2} y1={yAbajo} y2={h} stroke="var(--bd)" strokeWidth="1" />
      <Titulo x={xDer} y={yAbajo + fT} f={fT} max={wDer} texto="Lo que decide María G. y en qué semana" />
      <g transform={`translate(${xDer}, ${yAbajo + altoTit})`}>
        <Pedidos w={wDer} h={hAbajo - altoTit} k={k} />
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V08CadaMes() {
  const k = useEscalaTexto()
  return (
    <section className="pant v08">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Hito 6 de la D 12.2: la primera lista sale en la semana ${HS.go_live}, que empieza el `
               + `${fecha(PILOTO.desde)}, con los cinco criterios de go-live de la D 10.3 y su evidencia.`}>
          <span className="kpi-lbl"><span>Sale la primera lista</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><CifraSemana n={HS.go_live} /></div>
          </div>
          <p className="e2-linea">con los criterios de go-live</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Hito 7 de la D 12.2: en la semana ${HS.operador_despues_del_piloto} María G. elige por escrito quién `
               + 'opera la lista después del piloto: un analista part-time o un contrato de soporte.'}>
          <span className="kpi-lbl"><span>Elige quién opera</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><CifraSemana n={HS.operador_despues_del_piloto} sec /></div>
          </div>
          <p className="e2-linea">después del piloto</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={`Hito 8 de la D 12.2: en la semana ${HS.decision} María G. decide si pasa a producción, con el `
               + `tercer mes cerrado en la ${PILOTO.hasta_semana}.`}>
          <span className="kpi-lbl"><span>Decide producción</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><CifraSemana n={HS.decision} sec /></div>
          </div>
          <p className="e2-linea">con el tercer mes cerrado</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v08-graf">
        <p className="e3-conclusion">
          {'Cada mes la regla arma la lista y decide Sofía R.; '}<b>{`María G. decide en las semanas ${SEMANAS_MG}`}</b>
        </p>
        <div className="e3-v08-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
