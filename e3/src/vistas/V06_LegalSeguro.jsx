// V06 · ¿Es legal y seguro? (Parte C 5.1 a 5.4 y 6.2 a 6.5; diapositivas 10 y 11 de C3). W2.06, con la
// forma de la vista 5: banda de cifras con la tarjeta de decisión a la derecha y un gráfico a todo el
// ancho debajo.
//
// - Banda (fila 6 de la historia del PLAN.md): el puntaje legal, que responde la pregunta y es la única
//   cifra al tamaño máximo (regla 13 H1 del E2; H40); los envíos de 2022 a 2025 que fueron a quien no
//   aceptó marketing, con la marca de excepción del E2 en el rótulo (C18); los riesgos críticos sobre los
//   de la matriz (diapositiva 11 y anexo A4). Anchos 3 / 3 / 3 (W2, hallazgo del verificador): el
//   rótulo del 30,1 % dice «Sin consentimiento», el término de C18, de L3 y del riesgo 6, y con la marca
//   no entra en un renglón de una tarjeta de 2 hasta 1536 × 864. Con 3 / 3 / 2, «Riesgos críticos» se
//   parte y su frase va a tres renglones, y la banda crece de 12 a 20 px desde 1280 × 720. La frase del
//   30,1 % corta en «fue» y el resto va al title.
// - Decisión: «C-LEG · viable con condiciones» (decisiones.js) y la frase de la tarjeta Legal de la
//   diapositiva 2 con un «Sí» delante («Sí, con seis acciones; la lista sale filtrada»). El plan L1 a L6
//   con sus dueños, la escala y la alerta van al title.
// - Gráfico: el puntaje de cada una de las cinco dimensiones, con el tramo «viable con condiciones» de
//   la escala de la cátedra dibujado (diapositiva 10). Es PuntajeDimensiones, la misma pieza que la vista
//   3; como las cinco valen lo mismo que el promedio, la línea del promedio no se dibuja.
// - Lo que en las diapositivas 10 y 11 no entra va detrás de «Explorar», cerrado al llegar: el plan L1 a
//   L6 en sus dos tramos, con dueño, y la matriz de los 13 riesgos (anexo A4), donde cada riesgo crítico
//   muestra qué se mide, su umbral y quién lo mira. Las normas y los límites, en el pie de cada panel.
//   El resto lo dice el guion (notas, N).
// Ninguna cifra escrita acá: todo sale de C3 (contenido_e3.js). D3 no trae datos legales; los puntajes,
// el tramo de la escala, el 30,1 % y los conteos se leen del texto de C3.

import { useState } from 'react'
import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { C3 } from '../contenido_e3.js'
import { NBSP } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import PuntajeDimensiones, { tramoDe } from '../PuntajeDimensiones.jsx'
import { RIESGO_12 } from '../riesgo12.js'

const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)
const D10 = C3.DIAPOSITIVAS.find((d) => d.n === 10)
const D11 = C3.DIAPOSITIVAS.find((d) => d.n === 11)
const A4 = C3.ANEXOS.find((a) => a.n === 'A4')
const T_LEGAL = D2.tarjetas.find((t) => t.area === 'Legal')

const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'))
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)

// «2,0[[/3]]»: la cifra y su unidad chica; el tope de la escala sale de la unidad.
const [, PROM_TXT = D10.promedio.valor, PROM_UNIDAD = ''] = D10.promedio.valor.match(/^(.+?)\[\[(.+?)\]\]$/) ?? []
const TOPE = num(PROM_UNIDAD.replace('/', ''))
if (!(TOPE > 0)) throw new Error(`V06: el promedio legal de C3 no trae su escala («${D10.promedio.valor}»)`)
// «Escala de la cátedra: 1,6 a 2,5 es viable con condiciones.»: el tramo que se dibuja.
const TRAMO = tramoDe(D10.escala)
const DIMS = D10.dimensiones.map((d) => ({ ...d, valor: num(d.puntaje) }))
const PAREJAS = DIMS.every((d) => d.puntaje === DIMS[0].puntaje)

// La frase de la tarjeta, hasta «fue»: «de los envíos de 2022 a 2025»; a quién fueron lo dice el rótulo.
// El período no se parte («2022 a 2025» en un renglón).
const ALERTA_DE = sinCortes((D10.alerta.texto.match(/^(.*?) fue\b/) ?? [, D10.alerta.texto])[1])
  .replace(/(\d{4}) a (\d{4})/g, `$1${NBSP}a${NBSP}$2`)

// Riesgos: los 13 de A4 y los críticos (A4.destacar, en el orden de las columnas de la diapositiva 11). El 12, como
// lo deja la Parte D 11.2 (riesgo12.js, el mismo texto del anexo A4; F6b, H-2-072): hasta el 28/10 decía el de
// validación de la C 6.2.
const COL = Object.fromEntries(A4.columnas.map((c, i) => [c, i]))
const RIESGOS = A4.filas.map((f, i) => ({
  n: f[COL['#']], tipo: f[COL['Tipo']], texto: f[COL['#']] === '12' ? RIESGO_12 : f[COL['Riesgo']],
  prob: f[COL['Prob.']], imp: f[COL['Impacto']],
  estrategia: f[COL['Estrategia']], critico: A4.destacar.includes(i),
}))
A4.destacar.forEach((i, j) => { if (D11.columnas[j]) RIESGOS[i].senal = D11.columnas[j] })
const CRITICOS = RIESGOS.filter((r) => r.critico)
const PRIMERO = RIESGOS[A4.destacar[0]] ?? CRITICOS[0]
const COLA_D11 = (D11.titulo.match(/cada uno.*$/) ?? [D11.titulo])[0]

// Plan L1 a L6 (diapositiva 10), en sus dos tramos.
const ACCIONES = D10.plan.flatMap((t) => t.acciones)
const IDS_L = ACCIONES.map((a) => a.id).sort((a, b) => num(a.slice(1)) - num(b.slice(1)))
const RANGO_L = `${IDS_L[0]} a ${IDS_L[IDS_L.length - 1]}`

const DECISION = decision('C-LEG', {
  llano_corto: `Sí, con ${minus(T_LEGAL.texto)}`.replace(/\.$/, ''),
  llano: plano(D10.titulo),
  decision: D10.plan.map((t) => `${minus(t.cuando)}: ${t.acciones.map((a) => `${a.id} ${minus(plano(a.que))} (${plano(a.quien)})`).join(', ')}`).join('; '),
  justificacion: `${plano(D10.escala)} ${plano(D10.alerta.valor)} ${plano(D10.alerta.texto)}`,
})

export const meta = { id: 'V06', dc: 'C-LEG' }

// ---------------------------------------------------------------- texto en SVG

const ACC = 'var(--acc)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const MUT2 = 'var(--mut2)'
const EJE = 'var(--eje)'

/** Ancho de un Rotulo: mono, mayúsculas y .08em de espaciado por letra. */
const anchoRotulo = (t, f) => ancho(String(t).toUpperCase(), f, 600, true) + 0.08 * f * String(t).length
// Los textos que arrancan arriba de todo bajan esto, para que los acentos de las mayúsculas no se corten.
const arriba = (f) => Math.ceil(f * 0.4) + 2

/** Texto de C3 en palabras con su peso (**negrita**). Los espacios duros de sinCortes no parten. */
function palabras(texto) {
  const out = []
  let espacio = true
  for (const seg of sinCortes(texto || '').split(/(\*\*.+?\*\*)/)) {
    if (!seg) continue
    const b = seg.startsWith('**') && seg.endsWith('**')
    const cuerpo = b ? seg.slice(2, -2) : seg
    // «**antes del mes 3**, para…»: la coma va pegada a la negrita, sin espacio delante.
    let pegado = out.length > 0 && !espacio && !/^\s/.test(cuerpo)
    for (const t of cuerpo.split(' ')) {
      if (!t) { pegado = false; continue }
      out.push({ t, b, pegado })
      pegado = false
    }
    espacio = /\s$/.test(cuerpo)
  }
  return out
}

/** Renglones de hasta `w` px. */
function envolver(texto, w, f, peso = 400) {
  const lineas = []
  let linea = []
  let largo = 0
  const esp = ancho(' ', f, peso)
  for (const p of palabras(texto)) {
    const a = ancho(p.t, f, p.b ? 700 : peso)
    if (linea.length && largo + esp + a > w) {
      lineas.push(linea)
      linea = []
      largo = 0
    }
    largo += (linea.length && !p.pegado ? esp : 0) + a
    linea.push(p)
  }
  if (linea.length) lineas.push(linea)
  return lineas
}

function Renglones({ lineas, x, y, f, peso = 400, color = INK, interlinea = 1.3 }) {
  return lineas.map((l, i) => (
    <text key={i} x={x} y={y + i * f * interlinea} fontSize={f} fill={color} fontWeight={peso}
          dominantBaseline="hanging" style={{ whiteSpace: 'pre' }}>
      {l.map((p, j) => <tspan key={j} fontWeight={p.b ? 700 : peso}>{(j && !p.pegado ? ' ' : '') + p.t}</tspan>)}
    </text>
  ))
}

function Rotulo({ x, y, texto, f, color = MUT2, ancla = 'start' }) {
  return (
    <text x={x} y={y} fontSize={f} fill={color} fontWeight={600} fontFamily="var(--mono)" letterSpacing=".08em"
          textAnchor={ancla} dominantBaseline="hanging" style={{ textTransform: 'uppercase' }}>{texto}</text>
  )
}

// ---------------------------------------------------------------- Explorar: el plan L1 a L6

function PlanLegal({ w, h, k }) {
  const f = 14 * k
  const f2 = 12.5 * k
  const fRot = 11 * k
  const sep = 28 * k
  const pie = envolver(D10.nota, w, f2)
  const altoPie = pie.length * f2 * 1.3 + 8 * k
  const cols = D10.plan.map((t) => t.acciones.length)
  const anchoId = (id) => ancho(id, fRot, 700, true) + 10 * k
  // Cada tramo mide lo que necesita su rótulo o su acción más larga; lo que sobra se reparte en proporción.
  const necesita = D10.plan.map((t) => Math.max(anchoRotulo(t.cuando, fRot),
    ...t.acciones.map((a) => anchoId(a.id) + 8 * k + Math.max(ancho(plano(a.que), f, 600), ancho(plano(a.quien), f2)))))
  const factor = (w - sep * (cols.length - 1)) / necesita.reduce((a, b) => a + b, 0)
  const anchos = necesita.map((x) => x * factor)
  const y0 = arriba(fRot)
  const yIni = y0 + fRot + 14 * k
  const fila = Math.min(54 * k, (h - yIni - altoPie) / Math.max(...cols))
  const dosRenglones = fila >= (f + f2) * 1.35
  let xc = 0
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Plan legal: ${DECISION.decision}`}>
      {D10.plan.map((t, i) => {
        const wc = anchos[i]
        const x = xc
        xc += wc + sep
        return (
          <g key={t.cuando}>
            <Rotulo x={x} y={y0} texto={t.cuando} f={fRot} color={INK} />
            <line x1={x} x2={x + wc} y1={y0 + fRot + 6 * k} y2={y0 + fRot + 6 * k} stroke={EJE} strokeWidth="1" />
            {t.acciones.map((a, j) => {
              const y = yIni + j * fila
              const wId = anchoId(a.id)
              const xt = x + wId + 8 * k
              return (
                <g key={a.id}>
                  <title>{`${a.id} · ${plano(a.que)} · ${plano(a.quien)} · ${t.cuando}`}</title>
                  <rect x={x} y={y} width={wId} height={fRot + 8 * k} rx="2" fill="var(--azul1)" />
                  <text x={x + wId / 2} y={y + (fRot + 8 * k) / 2} fontSize={fRot} fontWeight={700} fill={ACC}
                        fontFamily="var(--mono)" textAnchor="middle" dominantBaseline="central">{a.id}</text>
                  <Renglones lineas={envolver(a.que, x + wc - xt, f, 600)} x={xt} y={y} f={f} peso={600} />
                  {dosRenglones && <Renglones lineas={envolver(a.quien, x + wc - xt, f2)} x={xt} y={y + f * 1.35} f={f2} color={MUT2} />}
                </g>
              )
            })}
          </g>
        )
      })}
      <Renglones lineas={pie} x={0} y={h - altoPie + 8 * k} f={f2} color={MUT2} />
    </svg>
  )
}

// ---------------------------------------------------------------- Explorar: la matriz de los 13 riesgos

const NIVELES = ['A', 'M', 'B']                         // la probabilidad, alta arriba
const IMPACTOS = ['B', 'M', 'A']                        // el impacto crece a la derecha
const PROB = { A: 'alta', M: 'media', B: 'baja' }
const IMP = { A: 'alto', M: 'medio', B: 'bajo' }

function MatrizRiesgos({ w, h, k, sel, setSel }) {
  const f = 14 * k
  const f2 = 12.5 * k
  const fRot = 11 * k
  const pie = envolver(D11.nota, w, f2)
  const altoPie = pie.length * f2 * 1.3 + 8 * k
  const gw = Math.min(w * 0.46, 520 * k)
  const labW = Math.max(...NIVELES.map((p) => ancho(PROB[p], f2))) + 12 * k
  const y0 = arriba(fRot)
  const top = y0 + fRot + 10 * k
  const bajo = fRot + f2 + 18 * k
  const cw = (gw - labW) / 3
  const ch = (h - altoPie - top - bajo) / 3
  const r = Math.min(13 * k, ch / 5)
  const paso = 2 * r + 5 * k
  const porFila = Math.max(1, Math.floor((cw - 8 * k) / paso))
  const riesgo = RIESGOS.find((x) => x.n === sel) ?? PRIMERO

  // detalle del riesgo elegido, a la derecha
  const dx = gw + 28 * k
  const dw = w - dx
  const bloques = []
  let y = y0
  const push = (el, alto) => { bloques.push(el); y += alto }
  if (riesgo) {
    push(<Rotulo key="r" x={dx} y={y} f={fRot} color={riesgo.critico ? ACC : MUT2}
                 texto={`Riesgo ${riesgo.n} · ${riesgo.tipo}${riesgo.critico ? ' · crítico' : ''}`} />, fRot + 10 * k)
    const lt = envolver(riesgo.texto, dw, f, 600)
    push(<Renglones key="t" lineas={lt} x={dx} y={y} f={f} peso={600} />, lt.length * f * 1.3 + 4 * k)
    push(<text key="p" x={dx} y={y} fontSize={f2} fill={MUT2} dominantBaseline="hanging">
      {`Probabilidad ${PROB[riesgo.prob]} · impacto ${IMP[riesgo.imp]} · ${riesgo.estrategia}`}</text>, f2 * 1.3 + 12 * k)
    for (const fl of riesgo.senal?.filas ?? []) {
      push(<Rotulo key={'r' + fl.rotulo} x={dx} y={y} f={fRot} texto={fl.rotulo} />, fRot + 6 * k)
      const l = envolver(fl.texto, dw, f2)
      push(<Renglones key={'t' + fl.rotulo} lineas={l} x={dx} y={y} f={f2} />, l.length * f2 * 1.3 + 8 * k)
    }
  }

  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label="Matriz de riesgos: probabilidad por impacto">
      <Rotulo x={labW} y={y0} f={fRot} texto="Probabilidad" color={MUT2} />
      {NIVELES.map((p, i) => (
        <g key={p}>
          <text x={labW - 8 * k} y={top + i * ch + ch / 2} fontSize={f2} fill={MUT2} textAnchor="end"
                dominantBaseline="central">{PROB[p]}</text>
          {IMPACTOS.map((im, j) => {
            const cx = labW + j * cw
            const cy = top + i * ch
            const aqui = RIESGOS.filter((x) => x.prob === p && x.imp === im)
            return (
              <g key={im}>
                <rect x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} fill="var(--zona)" />
                {aqui.map((x, m) => {
                  const filas = Math.ceil(aqui.length / porFila)
                  const enFila = Math.min(porFila, aqui.length - Math.floor(m / porFila) * porFila)
                  const px = cx + cw / 2 + ((m % porFila) - (enFila - 1) / 2) * paso
                  const py = cy + ch / 2 + (Math.floor(m / porFila) - (filas - 1) / 2) * paso
                  const on = riesgo && x.n === riesgo.n
                  return (
                    <g key={x.n} tabIndex={0} role="button" data-control="" style={{ cursor: 'pointer', outline: 'none' }}
                       aria-label={`Riesgo ${x.n}${x.critico ? ', crítico' : ''}: ${x.texto}`} aria-pressed={on}
                       onFocus={() => setSel(x.n)}
                       onClick={(e) => { setSel(x.n); if (e.detail) e.currentTarget.blur() }}>
                      <title>{`Riesgo ${x.n} · ${x.texto}`}</title>
                      {on && <circle cx={px} cy={py} r={r + 3.5 * k} fill="none" stroke={INK} strokeWidth={2} />}
                      <circle cx={px} cy={py} r={r} fill={x.critico ? ACC : 'var(--sup)'}
                              stroke={x.critico ? ACC : GRIS} strokeWidth="1.5" />
                      <text x={px} y={py} fontSize={f2} fontWeight={700} textAnchor="middle" dominantBaseline="central"
                            fill={x.critico ? '#fff' : MUT2} className="tabular">{x.n}</text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      ))}
      {IMPACTOS.map((im, j) => (
        <text key={im} x={labW + j * cw + cw / 2} y={top + 3 * ch + 6 * k} fontSize={f2} fill={MUT2}
              textAnchor="middle" dominantBaseline="hanging">{IMP[im]}</text>
      ))}
      <Rotulo x={labW + 3 * cw} y={top + 3 * ch + f2 + 12 * k} f={fRot} texto="Impacto" ancla="end" />
      {bloques}
      <Renglones lineas={pie} x={0} y={h - altoPie + 8 * k} f={f2} color={MUT2} />
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V06LegalSeguro() {
  const k = useEscalaTexto()
  const [abierto, setAbierto] = useState(false)
  const [panel, setPanel] = useState('plan')
  const [sel, setSel] = useState(PRIMERO?.n)
  const tope = Math.round((DIMS.length * 50 + 60) * k)
  // Tocado con el mouse, el control cambia y suelta el foco: las flechas siguen pasando de vista.
  const soltar = (e) => { if (e.detail) e.target.closest?.('button')?.blur() }
  const frase = !abierto
    ? { span: 'Puntaje de cada dimensión legal',
        b: PAREJAS ? `${DIMS.length} dimensiones, todas en ${DIMS[0].puntaje}` : `promedio ${PROM_TXT}${PROM_UNIDAD}` }
    : panel === 'plan'
      ? { span: `Plan ${RANGO_L}, con dueño`, b: `${ACCIONES.length} acciones en ${D10.plan.length} tramos` }
      : { span: 'Matriz de riesgos: probabilidad por impacto', b: `en azul, los ${CRITICOS.length} críticos` }
  return (
    <section className="pant v06">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Puntaje legal: promedio de las ${DIMS.length} dimensiones. ${plano(D10.escala)}`}>
          <span className="kpi-lbl"><span>Puntaje legal</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={PROM_TXT} unidad={PROM_UNIDAD} />
            </div>
          </div>
          <p className="e2-linea">{D10.promedio.texto}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Envíos sin consentimiento: ${plano(D10.alerta.valor)} ${plano(D10.alerta.texto)}`}>
          <span className="kpi-lbl"><span><span className="e2-marca-exc" aria-hidden="true" />Sin consentimiento</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={D10.alerta.valor} sec /></div>
          </div>
          <p className="e2-linea">{ALERTA_DE}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`${plano(D11.titulo)}. ${CRITICOS.map((r) => `${r.n}: ${r.texto}${r.senal ? ` (${r.senal.filas.map((f) => `${minus(f.rotulo)}: ${plano(f.texto)}`).join('; ')})` : ''}`).join(' · ')}`}>
          <span className="kpi-lbl"><span>Riesgos críticos</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={CRITICOS.length} unidad={`${NBSP}de${NBSP}${RIESGOS.length}`} sec />
            </div>
          </div>
          <p className="e2-linea">{COLA_D11}</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(8px, 1.2cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            <span>{frase.span}</span>
            <b className="tabular">{frase.b}</b>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 0.8cqw, 12px)', flexShrink: 0 }}
                onClick={soltar}>
            {abierto && (
              <Opciones etiqueta="Qué mostrar" valor={panel} onCambio={setPanel}
                        opciones={[{ valor: 'plan', texto: `Plan ${RANGO_L}` },
                                   { valor: 'riesgos', texto: `Los ${RIESGOS.length} riesgos` }]} />
            )}
            <BotonExplorar abierto={abierto} onCambio={setAbierto} />
          </span>
        </div>
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: abierto ? undefined : tope,
                      marginTop: 'clamp(6px, 1.6cqh, 20px)', display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (!abierto
              ? <PuntajeDimensiones w={w} h={h} k={k} tope={TOPE} tramo={TRAMO}
                                    dims={DIMS.map((d) => ({ nombre: d.dimension, valor: d.valor, texto: d.puntaje }))}
                                    promedio={{ valor: num(PROM_TXT), rotulo: `promedio ${PROM_TXT}` }} />
              : panel === 'plan' ? <PlanLegal w={w} h={h} k={k} />
                : <MatrizRiesgos w={w} h={h} k={k} sel={sel} setSel={setSel} />)}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
