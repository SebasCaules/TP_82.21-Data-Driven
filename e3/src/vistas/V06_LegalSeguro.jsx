// V06 · ¿Es legal y seguro? (Parte C 5.1 a 5.4 y 6.2 a 6.5; diapositivas 10 y 11 de C3). Banda de cifras
// con la tarjeta de decisión a la derecha y un gráfico a todo el ancho debajo. Rehecha el 28/10 (unidad
// V06 de .workforce/PLAN.md y sus correcciones del crítico).
//
// - Banda: un número por tarjeta, la central primero (N0-6). Central: el puntaje legal (H40,
//   D3.legal.promedio, con el tope de la escala de la unidad de C3, «/3»), con el fragmento «cada
//   dimensión en 2» (las cinco valen lo mismo; si dejaran de valer lo mismo, vuelve el nivel de la
//   escala). Después el 30,1 % de los envíos sin consentimiento (C18, D3.legal.envios_sin_consentimiento_tasa)
//   con la marca de excepción del E2 en el rótulo y el fragmento «de los envíos» (la frase de C3 hasta
//   «envíos»; el período va al gráfico, N0-8), y los riesgos críticos (J22, D3.legal.riesgos_criticos,
//   sola, «con señal y umbral»; los 13 de la matriz, D3.legal.riesgos, van al title: regla 2). Anchos 3 / 3 / 3: con la marca, «Sin consentimiento»
//   no entra en un renglón de una tarjeta de 2.
// - Decisión: «C-LEG · viable con condiciones» (decisiones.js) y la frase de la tarjeta Legal de la
//   diapositiva 2 con un «Sí» delante. El plan L1 a L6 con sus dueños, la escala y la alerta van al title.
// - Gráfico (28/10): reemplaza las cinco barras iguales en 2, que no decían nada. Una barra 100 % de los
//   envíos de 2022 a 2025: el tramo sin consentimiento (D3.legal.envios_sin_consentimiento_tasa) en
//   terracota con la trama de excepción (Tramas de src/graficos.jsx) y su valor adentro, más chico
//   que la cifra central de la banda (la única al tamaño máximo); el resto en
//   relleno de contexto y sin número (no se calcula el complemento en el navegador). Debajo del tramo, una
//   llave con «la lista sale sin ellos» y la acción del plan que lo hace (la de consentimiento, con su
//   tramo «antes de la primera lista del piloto»). Conclusión arriba, en .e3-conclusion: la cola del
//   título de la diapositiva 10, «El riesgo es contactar sin consentimiento». Una sola idea: los tres
//   riesgos críticos quedan en la banda y en «Explorar».
// - «Explorar», cerrado al llegar, con tres paneles: las cinco dimensiones en pips (D3.legal.dimensiones,
//   lo que antes era el gráfico; ya no usa PuntajeDimensiones), el plan L1 a L6 en sus dos tramos con dueño
//   y la matriz de los 13 riesgos (anexo A4), donde cada riesgo crítico muestra qué se mide, su umbral y
//   quién lo mira. Las normas, la escala y los límites, en el pie de cada panel.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js; el texto, de C3.

import { useState } from 'react'
import { Lienzo, Tramas } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, pct } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import { RIESGO_12 } from '../riesgo12.js'
import './V06.css'

const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)
const D10 = C3.DIAPOSITIVAS.find((d) => d.n === 10)
const D11 = C3.DIAPOSITIVAS.find((d) => d.n === 11)
const A4 = C3.ANEXOS.find((a) => a.n === 'A4')
const T_LEGAL = D2.tarjetas.find((t) => t.area === 'Legal')
const L = D3.legal

const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'))
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)
const mayus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// El puntaje (D3) y el tope de la escala, que sale de la unidad de C3 («2,0[[/3]]»).
const PROM_TXT = fijo(L.promedio, 1)
const PROM_UNIDAD = (D10.promedio.valor.match(/\[\[(.+?)\]\]$/) ?? [])[1] ?? ''
const TOPE = num(PROM_UNIDAD.replace('/', ''))
if (!(TOPE > 0)) throw new Error(`V06: el promedio legal de C3 no trae su escala («${D10.promedio.valor}»)`)
const DIMS = L.dimensiones
const PAREJAS = DIMS.every((d) => d.puntaje === DIMS[0].puntaje)
const FRASE_CENTRAL = PAREJAS ? `cada dimensión en ${fijo(DIMS[0].puntaje, 0)}` : minus(L.tramo.nivel)

// «de los envíos de 2022 a 2025 fue a quien no aceptó marketing.»: la tarjeta dice «de los envíos»; el
// gráfico, el período («Envíos de 2022 a 2025») y a quién fueron («no aceptó marketing»).
const ALERTA = plano(D10.alerta.texto)
const ALERTA_DE = (ALERTA.match(/^(.*?envíos)\b/) ?? [, ALERTA])[1]
const PERIODO = sinCortes(mayus((ALERTA.match(/^de los (envíos de \d{4} a \d{4})/) ?? [, 'envíos'])[1]))
  .replace(/(\d{4}) a (\d{4})/g, `$1${NBSP}a${NBSP}$2`)
const A_QUIEN = (ALERTA.match(/fue a quien (.+?)\.?$/) ?? [, 'sin consentimiento'])[1]
const TASA = L.envios_sin_consentimiento_tasa
const TASA_TXT = pct(TASA, 1)

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
if (CRITICOS.length !== L.riesgos_criticos || RIESGOS.length !== L.riesgos) {
  throw new Error(`V06: A4 (${CRITICOS.length} de ${RIESGOS.length}) no coincide con D3.legal (${L.riesgos_criticos} de ${L.riesgos})`)
}

// Plan L1 a L6 (diapositiva 10), en sus dos tramos.
const ACCIONES = D10.plan.flatMap((t) => t.acciones)
const IDS_L = ACCIONES.map((a) => a.id).sort((a, b) => num(a.slice(1)) - num(b.slice(1)))
const RANGO_L = `${IDS_L[0]} a ${IDS_L[IDS_L.length - 1]}`
// La acción que deja afuera a quien no consintió, con su tramo: lo que dice la llave del gráfico.
const TRAMO_FILTRO = D10.plan.find((t) => t.acciones.some((a) => /consentimiento/i.test(a.que))) ?? D10.plan[0]
const FILTRO = TRAMO_FILTRO.acciones.find((a) => /consentimiento/i.test(a.que)) ?? TRAMO_FILTRO.acciones[0]
const COMO = `${plano(FILTRO.que)}, ${minus(TRAMO_FILTRO.cuando)}`

// «Sí, con condiciones: el riesgo es contactar sin consentimiento» → la conclusión del gráfico.
const CONCLUSION = mayus((plano(D10.titulo).match(/:\s*(.+)$/) ?? [, plano(D10.titulo)])[1])

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
const CTX = 'var(--e3-ctx, #5a6478)'
const CTX_RELLENO = 'var(--e3-ctx-relleno, #a9b1bf)'
const CONTORNO = 'var(--e3-contorno, #4f5a6e)'
const EXC = 'var(--terra)'

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

// ---------------------------------------------------------------- gráfico: la barra de los envíos

/**
 * Barra 100 % de los envíos del período: el tramo sin consentimiento en terracota con trama y su valor
 * adentro; el resto en relleno de contexto, sin número. Arriba, el período con una cota de punta a punta y
 * a quién fue cada tramo; debajo del tramo, una llave con «la lista sale sin ellos» y la acción que lo hace.
 * El bloque se centra en el alto; la barra crece con el alto hasta un tope.
 */
function BarraEnvios({ w, h, k }) {
  const fRot = Math.round(12 * k)
  const fEtq = Math.round(18 * k)
  const fBig = Math.round(24 * k)
  const fSub = Math.round(15 * k)
  const gap = Math.round(14 * k)
  const xIni = 1
  const xFin = w - 1
  const total = xFin - xIni
  const wExc = Math.max(2, total * TASA)
  const xResto = xIni + wExc + 2                 // 2 px de superficie entre los tramos
  const llave = Math.round(12 * k)

  // Alto fijo de todo lo que no es la barra; la barra se queda con el resto, entre un piso y un tope.
  const arribaAlto = arriba(fRot) + fRot + gap * 1.2 + fEtq + gap * 0.7
  const abajoAlto = gap + llave + gap + fBig * 1.15 + fSub * 1.5
  const barra = Math.max(48 * k, Math.min(120 * k, (h - arribaAlto - abajoAlto) * 0.7))
  const alto = arribaAlto + barra + abajoAlto
  const y0 = Math.max(0, (h - alto) * 0.4)       // un poco arriba del centro: más cerca de la conclusión
  const yCota = y0 + arriba(fRot) + fRot + 7 * k
  const yEtq = y0 + arribaAlto - gap * 0.7
  const yBar = y0 + arribaAlto
  const yLlave = yBar + barra + gap
  const yLista = yLlave + llave + gap

  // Valor adentro del tramo: lo más grande que entra en el ancho y en el alto.
  const fVal = Math.min(barra * 0.4, 36 * k, ((wExc - 28 * k) / Math.max(1, ancho(TASA_TXT, 100, 700))) * 100)
  // «el resto de los envíos» al principio de su tramo; si choca con el rótulo del tramo sin consentimiento,
  // al final.
  const etqExc = A_QUIEN
  const etqResto = 'el resto de los envíos'
  const choca = xIni + ancho(etqExc, fEtq, 700) + 16 * k > xResto + 10 * k
  const tituloExc = `Sin consentimiento: ${TASA_TXT} ${ALERTA} (${entero(L.envios_sin_consentimiento)} envíos)`

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${PERIODO}: ${TASA_TXT} fue a quien ${A_QUIEN}; la lista sale sin ellos.`}>
      <Tramas />
      {/* período: rótulo y cota de punta a punta, que dice que la barra es el total */}
      <Rotulo x={xIni} y={y0 + arriba(fRot)} texto={PERIODO} f={fRot} color={CTX} />
      <path d={`M${xIni + 0.5} ${yCota + 5 * k} V${yCota} H${xFin - 0.5} V${yCota + 5 * k}`}
            fill="none" stroke={EJE} strokeWidth="1" />

      {/* a quién fue cada tramo */}
      <text x={xIni} y={yEtq} fontSize={fEtq} fontWeight={700} fill={INK}>{etqExc}</text>
      <text x={choca ? xFin : xResto + 10 * k} y={yEtq} fontSize={fEtq} fontWeight={500} fill={CTX}
            textAnchor={choca ? 'end' : 'start'}>{etqResto}</text>

      {/* la barra */}
      <g>
        <title>{tituloExc}</title>
        <rect x={xIni} y={yBar} width={wExc} height={barra} fill="url(#trama-exc)" />
        {fVal >= 14 && (
          <text x={xIni + 14 * k} y={yBar + barra / 2} fontSize={fVal} fontWeight={700} fill="#fff"
                dominantBaseline="central" className="tabular">{TASA_TXT}</text>
        )}
      </g>
      <g>
        <title>{`El resto de los ${minus(PERIODO)}`}</title>
        <rect x={xResto} y={yBar} width={Math.max(0, xFin - xResto)} height={barra} fill={CTX_RELLENO} />
      </g>

      {/* llave bajo el tramo y lo que hace la lista */}
      <path d={`M${xIni + 0.75} ${yLlave} V${yLlave + llave * 0.5} H${xIni + wExc - 0.75} V${yLlave}`
             + ` M${xIni + 0.75} ${yLlave + llave * 0.5} V${yLlave + llave}`}
            fill="none" stroke={CONTORNO} strokeWidth={Math.max(1.5, 2 * k)} />
      <text x={xIni} y={yLista} fontSize={fBig} fontWeight={700} fill={INK} dominantBaseline="hanging">
        la lista sale sin ellos
      </text>
      <text x={xIni} y={yLista + fBig * 1.2} fontSize={fSub} fontWeight={500} fill={CTX}
            dominantBaseline="hanging">{COMO}</text>
    </svg>
  )
}

// ---------------------------------------------------------------- Explorar: las cinco dimensiones

function Dimensiones({ w, h, k }) {
  const f2 = 12.5 * k
  const pie = envolver(D10.escala, w, f2)
  const altoPie = pie.length * f2 * 1.3 + 8 * k
  const paso = Math.min(64 * k, (h - altoPie) / DIMS.length)
  const f = Math.min(18 * k, paso * 0.4)
  const r = f * 0.42
  const sep = r * 2.9
  const anchoNom = Math.max(...DIMS.map((d) => ancho(d.nombre, f, 600)))
  const xPip = anchoNom + 28 * k
  const xVal = xPip + (TOPE - 1) * sep + r + 14 * k
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`Puntaje de cada dimensión legal: ${DIMS.map((d) => `${d.nombre} ${fijo(d.puntaje, 0)}`).join(', ')}`}>
      {DIMS.map((d, i) => {
        const y = i * paso + paso / 2
        return (
          <g key={d.id}>
            <title>{`${d.nombre}: ${fijo(d.puntaje, 0)}${PROM_UNIDAD}`}</title>
            {i > 0 && <line x1={0} x2={w} y1={i * paso} y2={i * paso} stroke="var(--bd, #d9dde3)" strokeWidth="1" />}
            <text x={0} y={y} fontSize={f} fontWeight={600} fill={INK} dominantBaseline="central">{d.nombre}</text>
            {Array.from({ length: TOPE }, (_, j) => (
              <circle key={j} cx={xPip + j * sep} cy={y} r={r}
                      fill={j < d.puntaje ? CONTORNO : 'none'} stroke={CONTORNO} strokeWidth={1.5} />
            ))}
            <text x={xVal} y={y} fontSize={f} fontWeight={700} fill={INK} dominantBaseline="central"
                  className="tabular">{`${fijo(d.puntaje, 0)}${PROM_UNIDAD}`}</text>
          </g>
        )
      })}
      <Renglones lineas={pie} x={0} y={h - altoPie + 8 * k} f={f2} color={MUT2} />
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V06LegalSeguro() {
  const k = useEscalaTexto()
  const [abierto, setAbierto] = useState(false)
  const [panel, setPanel] = useState('dimensiones')
  const [sel, setSel] = useState(PRIMERO?.n)
  // Tocado con el mouse, el control cambia y suelta el foco: las flechas siguen pasando de vista.
  const soltar = (e) => { if (e.detail) e.target.closest?.('button')?.blur() }
  const conclusion = !abierto
    ? <>{CONCLUSION}</>
    : panel === 'dimensiones'
      ? <>{`Las ${DIMS.length} dimensiones, `}<b>{PAREJAS ? `todas en ${fijo(DIMS[0].puntaje, 0)}` : `promedio ${PROM_TXT}`}</b></>
      : panel === 'plan'
        ? <>{`${ACCIONES.length} acciones en ${D10.plan.length} tramos, `}<b>con dueño</b></>
        : <>{'En azul, '}<b>{`los ${CRITICOS.length} críticos`}</b></>
  return (
    <section className="pant v06">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`Puntaje legal: promedio de las ${DIMS.length} dimensiones, ${minus(L.tramo.nivel)}. ${plano(D10.escala)}`}>
          <span className="kpi-lbl"><span>Puntaje legal</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={PROM_TXT} unidad={PROM_UNIDAD} />
            </div>
          </div>
          <p className="e2-linea">{FRASE_CENTRAL}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`Envíos sin consentimiento: ${TASA_TXT} ${ALERTA}`}>
          <span className="kpi-lbl"><span><span className="e2-marca-exc" aria-hidden="true" />Sin consentimiento</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra texto={TASA_TXT} sec /></div>
          </div>
          <p className="e2-linea">{ALERTA_DE}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 3' }}
             title={`${plano(D11.titulo)}, de los ${fijo(L.riesgos, 0)} de la matriz. ${CRITICOS.map((r) => `${r.n}: ${r.texto}${r.senal ? ` (${r.senal.filas.map((f) => `${minus(f.rotulo)}: ${plano(f.texto)}`).join('; ')})` : ''}`).join(' · ')}`}>
          <span className="kpi-lbl"><span>Riesgos críticos</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={fijo(L.riesgos_criticos, 0)} sec />
            </div>
          </div>
          <p className="e2-linea">con señal y umbral</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <div className="e3-v06-cab">
          <p className="e3-conclusion tabular">{conclusion}</p>
          <span className="e3-v06-ctl" onClick={soltar}>
            {abierto && (
              <Opciones etiqueta="Qué mostrar" valor={panel} onCambio={setPanel}
                        opciones={[{ valor: 'dimensiones', texto: `Las ${DIMS.length} dimensiones` },
                                   { valor: 'plan', texto: `Plan ${RANGO_L}` },
                                   { valor: 'riesgos', texto: `Los ${RIESGOS.length} riesgos` }]} />
            )}
            <BotonExplorar abierto={abierto} onCambio={setAbierto} />
          </span>
        </div>
        <div className="e3-v06-graf">
          <Lienzo className="lienzo">
            {({ w, h }) => (!abierto
              ? <BarraEnvios w={w} h={h} k={k} />
              : panel === 'dimensiones' ? <Dimensiones w={w} h={h} k={k} />
                : panel === 'plan' ? <PlanLegal w={w} h={h} k={k} />
                  : <MatrizRiesgos w={w} h={h} k={k} sel={sel} setSel={setSel} />)}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
