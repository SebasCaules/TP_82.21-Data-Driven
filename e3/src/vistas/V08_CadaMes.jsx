// V08 · ¿Cómo funciona cada mes y en qué semana? (Parte D 9.2, 10.3, 12.1 a 12.4; diapositiva 13 de C3). Nueva el
// 01/11: lo que hasta ese día iba detrás de un botón en la vista 7 (el flujo de cada mes, el plan de 20 semanas y lo
// que decide María G. con su semana) queda a la vista, en una vista propia con la misma forma que las demás.
//
// (02/11, W6 fase B, fase-w6/hallazgos.md: VIS-01, UX-01, UX-03, COB-02, COB-10, COB-15, ORA-06, ORA-16, DAT-11,
// UX-22) Salen el Gantt de las seis fases y la tabla «Lo que decide María G.»: la vista tenía tres mensajes y 334
// palabras para 45 s. Queda:
// - Banda, un número por tarjeta y la central primero (N0-6). Central: la semana en que sale la primera lista
//   (D3.plan.hitos_semana.go_live, hito 6 de la D 12.2). Después, cuántos criterios de go-live (D 10.3) se cumplen
//   hasta esa lista, contados en D13.hitos (criterio: true; los hitos 2 a 6 de la D 12.2), y la semana en que María G.
//   elige quién opera después del piloto (hito 7). Anchos 3 / 3 / 3, como la vista 6: los rótulos van en un renglón.
// - Decisión: «D-PLA · propuesta» de decisiones.js: el plan de 20 semanas de la D 12.
// - Gráfico, un solo svg en dos piezas, las dos a todo el ancho:
//   - arriba, el flujo de cada mes (D 9.2) con los textos y dueños de C3 (D13.flujo, uno por paso; en «Medir», la
//     alerta de la D 10.2). El paso con énfasis (la regla) en --acc. El ancho de cada paso sigue a su texto. Sin
//     rótulo propio: la conclusión, justo arriba, empieza «Cada mes»;
//   - abajo, una línea de hitos de 20 semanas (D13.hitos, la semana de cada uno en D3.plan.hitos_semana): un marcador
//     por semana con hito, con su número; el piloto como franja (D3.plan.fases, piloto); los hitos de cada semana con
//     su dueño en una columna, unida a su marcador; la llave «criterios de go-live» (D13.llave_go_live) sobre las
//     semanas de los hitos con criterio. La primera lista, en --acc.
// - (02/11, verificador de la fase B) Para bajar palabras: sale el rótulo «semana» del eje (el número va en cada
//   marcador), la conclusión y la decisión corta se acortan y el fragmento de la tarjeta 2 no repite «go-live». El eje se
//   corta donde va «piloto», para que ni la línea ni las marcas lo tachen. El dueño lleva un espacio duro antes de la
//   inicial, para que «C.» no quede sola en un renglón.
// Ninguna cifra escrita acá: las semanas salen de D3 (datos_e3.js) con formato.js y los textos de C3 (contenido_e3.js).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fecha } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V08.css'

const P = D3.piloto
const PL = D3.plan
const HS = PL.hitos_semana
const FASE = Object.fromEntries(PL.fases.map((f) => [f.id, f]))
const PILOTO = FASE.piloto
const DECIDE = FASE.decision
const D13 = C3.DIAPOSITIVAS.find((d) => d.n === 13)
const semanas = (n) => `${n}${NBSP}${n === 1 ? 'semana' : 'semanas'}`
const rango = (f) => (f.desde_semana === f.hasta_semana ? `semana ${f.desde_semana}`
  : `semanas ${f.desde_semana} a ${f.hasta_semana}`)

// Los hitos de la D 12.2 con su semana (de D3), agrupados por semana en el orden del plan.
const HITOS = D13.hitos.map((h) => ({ ...h, semana: HS[h.clave] }))
const GRUPOS = [...new Set(HITOS.map((h) => h.semana))].sort((a, b) => a - b)
  .map((s) => ({ semana: s, hitos: HITOS.filter((h) => h.semana === s) }))
const CRITERIOS = HITOS.filter((h) => h.criterio)
const GO_LIVE = HITOS.find((h) => h.clave === 'go_live')
/** El dueño con un espacio duro antes de cada inicial («Francisco C.»): el renglón no deja la inicial sola. */
const duro = (t) => String(t).replace(/ (\p{Lu}\.)/gu, `${NBSP}$1`)

/** La cifra de la banda: el número de la semana grande y «semana» delante, un escalón más chica (como «USD»). */
function CifraSemana({ n, sec = false }) {
  return (
    <span className={`par-val tabular e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{'semana '}</span>{n}
    </span>
  )
}

const DECISION = decision('D-PLA', {
  llano_corto: `María G. decide en la semana${NBSP}${HS.decision}`,
  llano: `El plan dura ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. La primera lista sale en la semana `
    + `${HS.go_live}, el ${fecha(PILOTO.desde)}, con los ${entero(CRITERIOS.length)} criterios de go-live; el piloto `
    + `cierra en la semana ${PILOTO.hasta_semana} y María G. decide en la ${HS.decision}, el ${fecha(DECIDE.hasta)}.`,
  decision: `Primera lista en la semana ${HS.go_live}; decisión de producción en la ${HS.decision}`,
  justificacion: 'Parte D 12.1 a 12.4: las fases 1 a 3 van en paralelo con el extracto actual; las tres listas '
    + 'salen después de la campaña de fin de año.',
})

const TITULO_PLAN = `Plan del proyecto: ${semanas(PL.semanas)} desde el ${fecha(PL.semana_1)}. `
  + PL.fases.map((f) => `${f.nombre}, ${rango(f)}`).join('; ')
  + `. La primera lista sale el ${fecha(PILOTO.desde)}; María G. decide el ${fecha(DECIDE.hasta)}.`
const TITULO_FLUJO = `Parte D 9.2. Una lista por mes, ${P.meses} en total, desde el ${fecha(PILOTO.desde)}; el piloto `
  + `cierra el ${fecha(PILOTO.hasta)}.`
const CONCLUSION = ['Cada mes, una lista; ', 'la primera, con los criterios cumplidos']

export const meta = { id: 'V08', dc: 'D-PLA' }

// ---------------------------------------------------------------- texto en SVG

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const EJE = 'var(--e3-eje, #6a7489)'
const ZONA = 'var(--e3-zona, rgba(34, 69, 111, .16))'

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

/** Rótulo mono, mayúsculas, en contexto; la letra baja si no entra en `max`. */
function Titulo({ x = 0, y, f, texto, max = Infinity, anchor = 'start' }) {
  const fx = Math.min(f, f * (max / Math.max(1, anchoMono(texto, f))))
  return (
    <text x={x} y={y} fontSize={fx} fill={CTX} fontWeight={600} fontFamily="var(--mono)" letterSpacing={`${0.08 * fx}`}
          textAnchor={anchor} style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

function Renglones({ lineas, x, y, f, peso = 400, color = INK, inter = 1.25 }) {
  return lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * inter} fontSize={f} fontWeight={peso} fill={color}
          dominantBaseline="hanging">{l}</text>
  ))
}

// ---------------------------------------------------------------- el flujo de cada mes (D 9.2)

/** Anchos de los seis pasos: siguen a su texto (el de «Medir» trae la alerta), con un mínimo por título. */
function anchosFlujo(w, f, flecha, pad) {
  const n = D13.flujo.length
  const util = w - flecha * (n - 1)
  const peso = D13.flujo.map((p) => (ancho(p.texto, f) + 0.6 * ancho(p.quien, f * 0.95, 600)) ** 0.6)
  const suma = peso.reduce((a, b) => a + b, 0)
  const minimo = D13.flujo.map((p) => Math.max(ancho(p.titulo, f * 1.08, 700),
    ...`${p.texto} ${duro(p.quien)}`.split(' ').map((x) => ancho(x, f, 600))) + 2 * pad)
  let anchos = peso.map((x) => (x / suma) * util)
  const falta = anchos.reduce((a, x, i) => a + Math.max(0, minimo[i] - x), 0)
  if (falta > 0) {
    const sobra = anchos.reduce((a, x, i) => a + Math.max(0, x - minimo[i]), 0)
    anchos = anchos.map((x, i) => (x < minimo[i] ? minimo[i] : x - ((x - minimo[i]) / sobra) * falta))
  }
  return anchos
}

function medirFlujo(w, f, k) {
  const pad = 8 * k
  const flecha = 16 * k
  const anchos = anchosFlujo(w, f, flecha, pad)
  const fT = f * 1.08
  const fQ = Math.max(f * 0.95, 0)
  const cajas = D13.flujo.map((p, i) => {
    const tw = anchos[i] - 2 * pad
    const lt = envolver(p.texto, tw, f)
    const lq = envolver(duro(p.quien), tw, fQ, 600)
    return { ...p, lt, lq, alto: pad * 1.3 + fT * 1.3 + lt.length * f * 1.25 + f * 0.45 + lq.length * fQ * 1.25 + pad }
  })
  return { anchos, cajas, alto: Math.max(...cajas.map((c) => c.alto)), pad, flecha, fT, fQ }
}

function Flujo({ m, f, k }) {
  const { anchos, cajas, alto, pad, flecha, fT, fQ } = m
  let x = 0
  return (
    <g aria-label={TITULO_FLUJO}>
      {cajas.map((p, i) => {
        const x0 = x
        x += anchos[i] + flecha
        const bw = anchos[i]
        const yQ = alto - pad - p.lq.length * fQ * 1.25
        return (
          <g key={p.titulo}>
            <title>{`${p.titulo}. ${p.texto}. ${p.quien}.`}</title>
            <rect x={x0} y={0} width={bw} height={alto} fill={p.enfasis ? 'var(--azul1)' : 'var(--sup)'}
                  stroke={p.enfasis ? ACC : 'var(--bd)'} strokeWidth={p.enfasis ? 1.5 : 1} />
            <rect x={x0} y={0} width={bw} height={3 * k} fill={p.enfasis ? ACC : 'var(--azul3)'} />
            <text x={x0 + pad} y={pad * 1.3} fontSize={fT} fontWeight={700} fill={p.enfasis ? ACC : INK}
                  dominantBaseline="hanging">{p.titulo}</text>
            <Renglones lineas={p.lt} x={x0 + pad} y={pad * 1.3 + fT * 1.3} f={f} />
            <Renglones lineas={p.lq} x={x0 + pad} y={yQ} f={fQ} peso={600} color={CTX} />
            {i < cajas.length - 1 && (
              <path d={`M${x0 + bw + 3 * k},${alto / 2} h${flecha - 7 * k} l-${3.5 * k},-${3.5 * k} m${3.5 * k},${3.5 * k} l-${3.5 * k},${3.5 * k}`}
                    fill="none" stroke={INK} strokeWidth={1.5} />
            )}
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- la línea de hitos de 20 semanas (D 12.1 a 12.4)

function medirHitos(w, f, k) {
  const fQ = f * 0.95
  const fEje = f
  const r = fEje * 0.9
  const xIni = 0
  const dw = (w - xIni) / PL.semanas
  const xs = (s) => xIni + (s - 0.5) * dw         // centro de la semana s
  // columnas: una por semana con hito, en el orden del plan, a todo el ancho; el ancho de cada una sigue a su texto
  const n = GRUPOS.length
  const gap = 10 * k
  const sangria = 9 * k
  const util = w - gap * (n - 1)
  const pide = GRUPOS.map((g) => Math.max(...g.hitos.map((h) => ancho(h.hito, f, 700))) ** 0.6)
  const suma = pide.reduce((a, b) => a + b, 0)
  const anchos = pide.map((x) => (x / suma) * util)
  let xc = 0
  const cols = GRUPOS.map((g, i) => {
    const x = xc
    const cw = anchos[i]
    xc += cw + gap
    const filas = g.hitos.map((h) => {
      const fuerte = h === GO_LIVE
      const lt = envolver(h.hito, cw - sangria, f, fuerte ? 700 : 600)
      return { h, lt, fuerte, alto: lt.length * f * 1.25 + fQ * 1.3 }
    })
    const alto = filas.reduce((a, x) => a + x.alto, 0) + (filas.length - 1) * f * 0.55
    return { ...g, x, filas, alto, xm: xs(g.semana) }
  })
  const fLlave = fEje
  const yLlave = fLlave            // rótulo de la llave
  const yBrace = yLlave + 6 * k
  const hBrace = 8 * k
  const yEje = yBrace + hBrace + 6 * k + r
  const hP = 2 * r + 8 * k                         // alto de la franja del piloto
  const yFan = yEje + hP / 2 + 9 * k                // la unión baja derecho hasta acá y después va a su columna
  const yCol = yFan + 18 * k
  const alto = yCol + Math.max(...cols.map((c) => c.alto))
  return { fQ, fEje, r, xIni, dw, xs, cols, sangria, yLlave, yBrace, hBrace, yEje, hP, yFan, yCol, alto, fLlave }
}

function Hitos({ m, f, k, w }) {
  const { fQ, fEje, r, xIni, xs, cols, sangria, yLlave, yBrace, hBrace, yEje, hP, yFan, yCol, fLlave } = m
  // el piloto, de la semana en que empieza a la última (bordes de semana)
  const xPa = xs(PILOTO.desde_semana) - m.dw / 2
  const xPb = xs(PILOTO.hasta_semana) + m.dw / 2
  // rótulo del piloto entre su primer marcador y el siguiente
  const dentro = GRUPOS.map((g) => g.semana).filter((s) => s > PILOTO.desde_semana && s <= PILOTO.hasta_semana)
  const xPr = (xs(PILOTO.desde_semana) + r + (dentro.length ? xs(dentro[0]) - r : xPb)) / 2
  const nPiloto = PILOTO.nombre.toLowerCase()
  const mPr = ancho(nPiloto, f, 700) / 2 + 6 * k
  const hueco = [xPr - mPr, xPr + mPr]
  // la llave, de la primera a la última semana con un hito con criterio
  const sc = CRITERIOS.map((h) => h.semana)
  const xa = xs(Math.min(...sc)) - r
  const xb = xs(Math.max(...sc)) + r
  const xc = (xa + xb) / 2
  const llave = `M${xa},${yBrace + hBrace} q0,${-hBrace / 2} ${hBrace / 2},${-hBrace / 2} H${xc - hBrace / 2} `
    + `q${hBrace / 2},0 ${hBrace / 2},${-hBrace / 2} q0,${hBrace / 2} ${hBrace / 2},${hBrace / 2} `
    + `H${xb - hBrace / 2} q${hBrace / 2},0 ${hBrace / 2},${hBrace / 2}`
  return (
    <g aria-label={TITULO_PLAN}>
      {/* la llave de los criterios de go-live, sobre sus semanas */}
      <g>
        <title>{`Los ${entero(CRITERIOS.length)} criterios de go-live de la D 10.3, puestos en el calendario: los hitos `
          + `${CRITERIOS.map((h) => h.n).join(', ')} de la D 12.2, cada uno sí o no, hasta la primera lista.`}</title>
        <path d={llave} fill="none" stroke={INK} strokeWidth={1.5} />
        <Titulo x={Math.max(0, xc)} y={yLlave} f={fLlave} anchor="middle" texto={D13.llave_go_live} />
      </g>

      {/* el eje de semanas y la franja del piloto */}
      <g>
        <title>{`Piloto: ${rango(PILOTO)}, del ${fecha(PILOTO.desde)} al ${fecha(PILOTO.hasta)}`}</title>
        <rect x={xPa} y={yEje - hP / 2} width={Math.max(1, xPb - xPa)} height={hP} fill={ZONA} stroke={ACC}
              strokeWidth={1.25} />
        <text x={xPr} y={yEje} fontSize={f} fontWeight={700} fill={ACC} textAnchor="middle"
              dominantBaseline="central">{nPiloto}</text>
      </g>
      {/* el eje se corta donde va el rótulo del piloto: ni la línea ni las marcas lo cruzan */}
      <line x1={xIni} x2={hueco[0]} y1={yEje} y2={yEje} stroke={EJE} strokeWidth={1.25} />
      <line x1={hueco[1]} x2={w} y1={yEje} y2={yEje} stroke={EJE} strokeWidth={1.25} />
      {Array.from({ length: PL.semanas + 1 }, (_, s) => xIni + s * m.dw)
        .filter((x) => x < hueco[0] || x > hueco[1])
        .map((x) => (
          <line key={x} x1={x} x2={x} y1={yEje - 3 * k} y2={yEje + 3 * k} stroke={EJE} strokeWidth={1} />
        ))}

      {/* una columna por semana con hito, unida a su marcador */}
      {cols.map((c) => {
        const acc = c.filas.some((x) => x.fuerte)
        const color = acc ? ACC : INK
        let y = yCol
        return (
          <g key={c.semana}>
            <title>{`Semana ${c.semana}: ${c.hitos.map((h) => `hito ${h.n}, ${h.hito} (${h.quien})`).join('; ')}`}</title>
            <path d={`M${c.xm},${yEje + r} V${yFan} L${c.x + 1},${yCol - 4 * k} V${yCol + c.alto}`}
                  fill="none" stroke={acc ? ACC : EJE} strokeWidth={acc ? 1.75 : 1.25} />
            {c.filas.map((x) => {
              const y0 = y
              y += x.alto + f * 0.55
              return (
                <g key={x.h.n}>
                  <Renglones lineas={x.lt} x={c.x + sangria} y={y0} f={f} peso={x.fuerte ? 700 : 600}
                             color={x.fuerte ? ACC : INK} />
                  <text x={c.x + sangria} y={y0 + x.lt.length * f * 1.25 + fQ * 0.05} fontSize={fQ} fontWeight={500}
                        fill={CTX} dominantBaseline="hanging">{duro(x.h.quien)}</text>
                </g>
              )
            })}
            <circle cx={c.xm} cy={yEje} r={r} fill={color} stroke="var(--sup, #fff)" strokeWidth={2} />
            <text x={c.xm} y={yEje} fontSize={fEje} fontWeight={700} fill="#fff" textAnchor="middle"
                  dominantBaseline="central" className="tabular">{c.semana}</text>
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- el dibujo

// La letra más chica que se permite: 13 px reales a 1280 × 720, donde la caja lleva zoom 1280 / 1152 (e3/src/zoom.js).
const PISO = 13.2 / (1280 / 1152)

function Dibujo({ w, h, k }) {
  const fT = 13 * k
  const altoTit = fT * 1.7
  const gapY = 18 * k
  const total = (f) => medirFlujo(w, f, k).alto + gapY + altoTit + medirHitos(w, f, k).alto
  let f = 15 * k
  while (total(f) > h && f > PISO) f = Math.max(PISO, f - 0.25)
  const mf = medirFlujo(w, f, k)
  const mh = medirHitos(w, f, k)
  const yH = mf.alto + gapY
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label={`Cómo funciona cada mes y en qué semana: el flujo de cada mes y los hitos del plan de ${semanas(PL.semanas)}, con su dueño`}>
      <Flujo m={mf} f={f} k={k} />
      <Titulo y={yH + fT} f={fT} max={w} texto={D13.rotulo_hitos} />
      <g transform={`translate(0, ${yH + altoTit})`}>
        <Hitos m={mh} f={f} k={k} w={w} />
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
               + `${fecha(PILOTO.desde)}, con los criterios de go-live de la D 10.3 y su evidencia. Ese día empieza el piloto.`}>
          <span className="kpi-lbl"><span>Sale la primera lista</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><CifraSemana n={HS.go_live} /></div>
          </div>
          <p className="e2-linea">empieza el piloto</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Los criterios de go-live de la D 10.3 son los hitos ${CRITERIOS.map((h) => h.n).join(', ')} de la `
               + 'D 12.2, puestos en el calendario: cada uno se cumple o no, hasta la primera lista.'}>
          <span className="kpi-lbl"><span>Criterios de go-live</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={entero(CRITERIOS.length)} sec /></div>
          </div>
          <p className="e2-linea">sí o no, hasta la lista</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Hito 7 de la D 12.2: en la semana ${HS.operador_despues_del_piloto} María G. elige por escrito quién `
               + 'opera la lista después del piloto: un analista part-time o un contrato de soporte.'}>
          <span className="kpi-lbl"><span>Quién opera después</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><CifraSemana n={HS.operador_despues_del_piloto} sec /></div>
          </div>
          <p className="e2-linea">lo elige María G.</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v08-graf">
        <p className="e3-conclusion">{CONCLUSION[0]}<b>{CONCLUSION[1]}</b></p>
        <div className="e3-v08-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
