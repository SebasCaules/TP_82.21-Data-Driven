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
// - (30/10, sin «Explorar») El plan de acción legal L1 a L6, con su dueño y su tramo (lo pide la Parte C 5.4),
//   pasa a verse en la vista, a la derecha de la barra, en el mismo svg. Debajo, a todo el ancho, las cinco
//   dimensiones en una línea («2 de 3 cada una», D3.legal.dimensiones) y las normas (nota de la diapositiva 10).
//   La matriz de los 13 riesgos queda en el anexo A4, a la vista; la señal y el umbral de cada riesgo crítico
//   están en la vista 9 (monitoreo) y en el title de la tarjeta de riesgos.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js; el texto, de C3.

import { Lienzo, Tramas } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, pct } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
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

// ---------------------------------------------------------------- el plan L1 a L6, a la vista (30/10)

function PlanLegal({ w, h, k }) {
  // (30/10) Los dos tramos uno debajo del otro, una acción por renglón: la sigla, qué se hace y quién responde, en
  // columnas. La letra baja hasta que todo entra en el alto; nada se corta.
  const filas = D10.plan.reduce((n, t) => n + 1 + t.acciones.length, 0)
  const anchoId = (id, fr) => ancho(id, fr, 700, true) + 10 * k
  let f = 15 * k
  const medir = (fx) => {
    const fr = fx * 0.78
    const wId = Math.max(...ACCIONES.map((a) => anchoId(a.id, fr)))
    const xQue = wId + 10 * k
    const xQuien = xQue + (w - xQue) * 0.56
    const lineas = D10.plan.map((t) => t.acciones.map((a) => Math.max(
      envolver(a.que, xQuien - xQue - 12 * k, fx, 600).length, envolver(a.quien, w - xQuien, fx * 0.9).length)))
    const alto = D10.plan.length * (fr * 2.2) + lineas.flat().reduce((x, n) => x + n * fx * 1.3 + fx * 0.55, 0)
    return { fr, wId, xQue, xQuien, lineas, alto }
  }
  let m = medir(f)
  while (m.alto > h && f > 10 * k) { f -= 0.25; m = medir(f) }
  let y = 0
  const out = []
  D10.plan.forEach((t, i) => {
    y += i ? m.fr * 0.7 : 0
    out.push(
      <g key={t.cuando}>
        <Rotulo x={0} y={y + 2} texto={t.cuando} f={m.fr} color={INK} />
        <line x1={0} x2={w} y1={y + m.fr * 1.55} y2={y + m.fr * 1.55} stroke={EJE} strokeWidth="1" />
      </g>,
    )
    y += m.fr * 2.2 - (i ? m.fr * 0.7 : 0) + (i ? m.fr * 0.7 : 0)
    t.acciones.forEach((a, j) => {
      const n = m.lineas[i][j]
      out.push(
        <g key={a.id}>
          <title>{`${a.id} · ${plano(a.que)} · ${plano(a.quien)} · ${t.cuando}`}</title>
          <rect x={0} y={y} width={m.wId} height={m.fr + 7 * k} rx="2" fill="var(--azul1)" />
          <text x={m.wId / 2} y={y + (m.fr + 7 * k) / 2} fontSize={m.fr} fontWeight={700} fill={ACC}
                fontFamily="var(--mono)" textAnchor="middle" dominantBaseline="central">{a.id}</text>
          <Renglones lineas={envolver(a.que, m.xQuien - m.xQue - 12 * k, f, 600)} x={m.xQue} y={y + 1} f={f} peso={600} />
          <Renglones lineas={envolver(a.quien, w - m.xQuien, f * 0.9)} x={m.xQuien} y={y + 1 + f * 0.08} f={f * 0.9} color={MUT2} />
        </g>,
      )
      y += n * f * 1.3 + f * 0.55
    })
  })
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }} aria-label={`Plan legal: ${DECISION.decision}`}
         data-filas={filas}>
      {out}
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
  const como = envolver(COMO, w - 2, fSub, 500)
  const abajoAlto = gap + llave + gap + fBig * 1.15 + fSub * 1.3 * como.length + fSub * 0.2
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
      <Renglones lineas={como} x={xIni} y={yLista + fBig * 1.2} f={fSub} peso={500} color={CTX} />
    </svg>
  )
}

// ---------------------------------------------------------------- la barra, el plan y la línea de las dimensiones

const DIMS_LINEA = `Las ${DIMS.length} dimensiones, ${PAREJAS ? `${fijo(DIMS[0].puntaje, 0)}${PROM_UNIDAD} cada una` : `promedio ${PROM_TXT}`}: `
  + DIMS.map((d, i) => (i ? minus(d.nombre) : d.nombre)).join(', ').replace(/, ([^,]+)$/, ' y $1') + '.'

/** Un solo svg: la barra de los envíos a la izquierda, el plan L1 a L6 a la derecha y, abajo, las dimensiones y las normas. */
function Cuerpo({ w, h, k }) {
  const f2 = 12.5 * k
  const fRot = 11 * k
  const gap = 36 * k
  const pieDims = envolver(DIMS_LINEA, w, f2)
  const pieNormas = envolver(D10.nota, w, f2)
  const altoPie = (pieDims.length + pieNormas.length) * f2 * 1.3 + 14 * k
  const hArriba = h - altoPie
  const wBarra = Math.round((w - gap) * 0.42)
  const wPlan = w - gap - wBarra
  const yPie = hArriba + 12 * k
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label={`${CONCLUSION}. Plan legal: ${DECISION.decision}. ${DIMS_LINEA}`}>
      <g><BarraEnvios w={wBarra} h={hArriba} k={k * 0.9} /></g>
      <line x1={wBarra + gap / 2} x2={wBarra + gap / 2} y1={0} y2={hArriba} stroke="var(--bd)" strokeWidth="1" />
      <g transform={`translate(${wBarra + gap}, 0)`}>
        <Rotulo x={0} y={arriba(fRot)} texto={`Plan de acción legal, ${RANGO_L}, con su dueño`} f={fRot} color={CTX} />
        <g transform={`translate(0, ${arriba(fRot) + fRot + 16 * k})`}>
          <PlanLegal w={wPlan} h={hArriba - (arriba(fRot) + fRot + 16 * k)} k={k} />
        </g>
      </g>
      <line x1={0} x2={w} y1={hArriba + 4 * k} y2={hArriba + 4 * k} stroke="var(--bd)" strokeWidth="1" />
      <Renglones lineas={pieDims} x={0} y={yPie} f={f2} color={INK} />
      <Renglones lineas={pieNormas} x={0} y={yPie + pieDims.length * f2 * 1.3} f={f2} color={MUT2} />
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V06LegalSeguro() {
  const k = useEscalaTexto()
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
          <p className="e3-conclusion tabular">{CONCLUSION}</p>
        </div>
        <div className="e3-v06-graf">
          <Lienzo className="lienzo">
            {({ w, h }) => <Cuerpo w={w} h={h} k={k} />}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
