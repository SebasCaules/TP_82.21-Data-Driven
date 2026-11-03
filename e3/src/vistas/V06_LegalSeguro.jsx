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
//   terracota y su valor adentro, más chico que la cifra central de la banda (la única al tamaño máximo); el
//   resto en relleno de contexto y sin número (no se calcula el complemento en el navegador). Debajo del
//   tramo, una llave con «la lista sale sin ellos». Conclusión arriba, en .e3-conclusion: la cola del
//   título de la diapositiva 10, «El riesgo es contactar sin consentimiento».
// - (01/11, a la vista; lo que hasta ese día iba detrás de un botón) El plan de acción legal L1 a L6, con su dueño
//   y su tramo (lo pide la Parte C 5.4), se ve en la vista, a la derecha de la barra, en el mismo svg.
// - (02/11, W6: UX-04, VIS-04, COB-08, ORA-11) Debajo, a todo el ancho, los tres riesgos críticos de los 13 de la
//   matriz (C 6.2 y 6.3) en una fila de tres celdas bajo el rótulo «Riesgos críticos, 3 de 13: señal y umbral»: el
//   riesgo en tinta 700, a la letra de «la lista sale sin ellos» si entra (baja hasta que el plan L1 a L6 entra a
//   13 px reales); la señal y el umbral (D11.columnas, umbral en negrita); el dueño. Salen la línea de las cinco
//   dimensiones (repetía la banda y «2/3» se leía dos tercios) y el renglón gris bajo «la lista sale sin ellos»
//   (repetía la L3 del plan). Las normas y la escala de la cátedra quedan en un renglón (D10.nota). El 30,1 % va
//   sobre terracota lisa, sin trama debajo del número (VIS-16). Para no terminar con más palabras que antes, el
//   rótulo del plan queda «Plan legal» y el tramo gris va sin rótulo (la cota del período dice que es el total).
// - (03/11, pedido del usuario) La barra pasa a dos filas sobre la escala del total: «Hasta hoy», con el tramo
//   terracota, y «Nuestra lista», el riel vacío con «la lista sale sin ellos (filtro L3)»; sale el tramo gris y la llave.
//   Cada riesgo crítico lleva tres viñetas: «Mide», «Alerta» y «Dueño».
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) con formato.js; el texto, de C3.

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, pct } from '../formato.js'
import { plano, sinCortes } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V06.css'

const D2 = C3.DIAPOSITIVAS.find((d) => d.n === 2)
const D10 = C3.DIAPOSITIVAS.find((d) => d.n === 10)
const D11 = C3.DIAPOSITIVAS.find((d) => d.n === 11)
const A4 = C3.RIESGOS          // la matriz de la C 6.2 (el que era el anexo A4)
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

// Riesgos: los 13 de la matriz y los críticos (A4.destacar, en el orden de las columnas de la diapositiva 11). (02/11)
// Sale riesgo12.js (el riesgo 12 como lo deja la D 11.2): solo lo mostraba el anexo A4, y el 12 no es crítico.
const COL = Object.fromEntries(A4.columnas.map((c, i) => [c, i]))
const RIESGOS = A4.filas.map((f, i) => ({
  n: f[COL['#']], tipo: f[COL['Tipo']], texto: f[COL['Riesgo']],
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

/** Las medidas del plan con letra `fx`: Cuerpo las usa para saber cuánto alto le deja la fila de los riesgos. */
function medirPlan(w, fx, k) {
  const fr = fx * 0.78
  const wId = Math.max(...ACCIONES.map((a) => ancho(a.id, fr, 700, true) + 10 * k))
  const xQue = wId + 10 * k
  const xQuien = xQue + (w - xQue) * 0.56
  const lineas = D10.plan.map((t) => t.acciones.map((a) => Math.max(
    envolver(a.que, xQuien - xQue - 12 * k, fx, 600).length, envolver(a.quien, w - xQuien, fx).length)))
  const alto = D10.plan.length * (fr * 2.1) + (D10.plan.length - 1) * fr * 0.7
    + lineas.flat().reduce((x, n) => x + n * fx * 1.3 + fx * 0.4, 0)
  return { fr, wId, xQue, xQuien, lineas, alto }
}

function PlanLegal({ w, h, k }) {
  // (30/10) Los dos tramos uno debajo del otro, una acción por renglón: la sigla, qué se hace y quién responde, en
  // columnas. La letra baja hasta que todo entra en el alto; nada se corta.
  const filas = D10.plan.reduce((n, t) => n + 1 + t.acciones.length, 0)
  let f = 15 * k
  let m = medirPlan(w, f, k)
  while (m.alto > h && f > 10 * k) { f -= 0.25; m = medirPlan(w, f, k) }
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
    y += m.fr * 2.1
    t.acciones.forEach((a, j) => {
      const n = m.lineas[i][j]
      out.push(
        <g key={a.id}>
          <title>{`${a.id} · ${plano(a.que)} · ${plano(a.quien)} · ${t.cuando}`}</title>
          <rect x={0} y={y} width={m.wId} height={m.fr + 7 * k} rx="2" fill="var(--azul1)" />
          <text x={m.wId / 2} y={y + (m.fr + 7 * k) / 2} fontSize={m.fr} fontWeight={700} fill={ACC}
                fontFamily="var(--mono)" textAnchor="middle" dominantBaseline="central">{a.id}</text>
          <Renglones lineas={envolver(a.que, m.xQuien - m.xQue - 12 * k, f, 600)} x={m.xQue} y={y + 1} f={f} peso={600} />
          <Renglones lineas={envolver(a.quien, w - m.xQuien, f)} x={m.xQuien} y={y + 1} f={f} color={MUT2} />
        </g>,
      )
      y += n * f * 1.3 + f * 0.4
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
 * (03/11, pedido del usuario: la barra gris no decía nada y «la lista sale sin ellos» quedaba suelto bajo una llave)
 * Dos filas sobre la misma escala, el total de los envíos. Arriba, lo que pasa hoy: el tramo terracota con su valor
 * adentro y a quién fue, al lado. Abajo, nuestra lista: el mismo riel vacío, con «la lista sale sin ellos» y el
 * filtro que lo asegura (L3). El riel es solo un filete: marca la escala sin dibujar el resto como un dato.
 */
function BarraEnvios({ w, h, k }) {
  const fRot = Math.round(12 * k)
  const fEtq = Math.round(17 * k)
  const fDentro = Math.round(17 * k)
  const gap = Math.round(14 * k)
  const xIni = 1
  const xFin = w - 1
  const total = xFin - xIni
  const wExc = Math.max(2, total * TASA)

  const cab = fEtq * 1.45                        // el rótulo de cada fila
  const barra = Math.max(40 * k, Math.min(76 * k, (h - arriba(fRot) - fRot - 2 * cab - 3 * gap) / 2))
  const alto = arriba(fRot) + fRot + gap + 2 * (cab + barra) + gap * 1.6
  const y0 = Math.max(0, (h - alto) * 0.4)
  const y1 = y0 + arriba(fRot) + fRot + gap      // fila 1: hoy
  const yB1 = y1 + cab
  const y2 = yB1 + barra + gap * 1.6             // fila 2: nuestra lista
  const yB2 = y2 + cab

  // Valor adentro del tramo: lo más grande que entra en el ancho y en el alto.
  const fVal = Math.min(barra * 0.45, 34 * k, ((wExc - 24 * k) / Math.max(1, ancho(TASA_TXT, 100, 700))) * 100)
  const xAQuien = xIni + wExc + 10 * k
  const entraAQuien = xAQuien + ancho(A_QUIEN, fDentro, 700) <= xFin - 8 * k
  const LISTA = 'la lista sale sin ellos'
  const FILTRO = '(filtro L3)'
  const tituloExc = `Sin consentimiento: ${TASA_TXT} ${ALERTA} (${entero(L.envios_sin_consentimiento)} envíos)`
  const riel = (y) => (
    <rect x={xIni + 0.5} y={y + 0.5} width={total - 1} height={barra - 1} fill="none" stroke={EJE} strokeWidth="1" />
  )

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${PERIODO}: ${TASA_TXT} fue a quien ${A_QUIEN}. Nuestra lista: ${LISTA} ${FILTRO}.`}>
      <Rotulo x={xIni} y={y0 + arriba(fRot)} texto={`${PERIODO}, sobre el total`} f={fRot} color={CTX} />

      {/* hoy */}
      <text x={xIni} y={y1} fontSize={fEtq} fontWeight={700} fill={INK} dominantBaseline="hanging">Hasta hoy</text>
      {riel(yB1)}
      <g>
        <title>{tituloExc}</title>
        <rect x={xIni} y={yB1} width={wExc} height={barra} fill={EXC} />
        {fVal >= 14 && (
          <text x={xIni + 12 * k} y={yB1 + barra / 2} fontSize={fVal} fontWeight={700} fill="#fff"
                dominantBaseline="central" className="tabular">{TASA_TXT}</text>
        )}
      </g>
      {entraAQuien && (
        <text x={xAQuien} y={yB1 + barra / 2} fontSize={fDentro} fontWeight={700} fill={INK}
              dominantBaseline="central">{A_QUIEN}</text>
      )}

      {/* nuestra lista */}
      <text x={xIni} y={y2} fontSize={fEtq} fontWeight={700} fill={INK} dominantBaseline="hanging">Nuestra lista</text>
      {riel(yB2)}
      <text x={xIni + 12 * k} y={yB2 + barra / 2} fontSize={fDentro} fontWeight={700} fill={INK}
            dominantBaseline="central">
        {LISTA}<tspan fontWeight={400} fill={CTX}>{` ${FILTRO}`}</tspan>
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- la barra, el plan y la fila de los riesgos críticos

// (02/11, W6) Los tres críticos de la diapositiva 11, cada uno con su señal, su umbral (la parte en negrita se lee
// primero: «**40,4 puntos** al tercer mes») y su dueño. Las filas se buscan por rótulo.
const filaRiesgo = (c, re) => c.filas.find((f) => re.test(f.rotulo))?.texto
const CRITICOS_FILA = D11.columnas.map((c) => ({
  n: c.n, riesgo: plano(c.riesgo), senal: filaRiesgo(c, /^se[ñn]al/i), umbral: filaRiesgo(c, /^umbral/i),
  dueno: filaRiesgo(c, /^due[ñn]o/i),
}))
if (CRITICOS_FILA.length !== L.riesgos_criticos
    || CRITICOS_FILA.some((c) => !c.senal || !c.dueno || !/\*\*.+?\*\*/.test(c.umbral || ''))) {
  throw new Error('V06: cada columna de la diapositiva 11 trae Señal, Umbral (con su negrita) y Dueño')
}
const ROT_CRITICOS = `Riesgos críticos, ${fijo(L.riesgos_criticos, 0)} de ${fijo(L.riesgos, 0)}`

// (03/11, pedido del usuario) Debajo de cada riesgo, tres viñetas cortas: qué se mide, qué dispara la alerta y quién.
const VINETAS = (c) => [`**Mide:** ${c.senal}`, `**Alerta:** ${c.umbral}`, `**Dueño:** ${c.dueno}`]

/** La fila de tres celdas con letra `fR` para el riesgo y `fS` para las viñetas: renglones de cada celda y alto. */
function medirCriticos(w, fR, fS, k) {
  const gapC = 26 * k
  const wCel = (w - gapC * (CRITICOS_FILA.length - 1)) / CRITICOS_FILA.length
  const sangria = fS * 0.95
  const celdas = CRITICOS_FILA.map((c) => ({
    riesgo: envolver(c.riesgo, wCel, fR, 700),
    vinetas: VINETAS(c).map((t) => envolver(t, wCel - sangria, fS)),
  }))
  const altoCelda = (x) => 6 * k + x.riesgo.length * fR * 1.25 + fR * 0.25
    + x.vinetas.reduce((a, v) => a + v.length * fS * 1.25 + fS * 0.15, 0)
  return { gapC, wCel, sangria, celdas, alto: Math.max(...celdas.map(altoCelda)) }
}

function FilaCriticos({ m, fR, fS, k }) {
  return m.celdas.map((x, i) => {
    const c = CRITICOS_FILA[i]
    const x0 = i * (m.wCel + m.gapC)
    let y = 6 * k + x.riesgo.length * fR * 1.25 + fR * 0.25
    return (
      <g key={c.n} transform={`translate(${x0}, 0)`}>
        <title>{`${c.riesgo}. Mide: ${plano(c.senal)}. Alerta: ${plano(c.umbral)}. Dueño: ${plano(c.dueno)}.`}</title>
        <rect x={0} y={0} width={m.wCel} height={Math.max(2, 3 * k)} fill="var(--azul3)" />
        <Renglones lineas={x.riesgo} x={0} y={6 * k} f={fR} peso={700} color={INK} interlinea={1.25} />
        {x.vinetas.map((v, j) => {
          const yv = y
          y += v.length * fS * 1.25 + fS * 0.15
          return (
            <g key={j}>
              <circle cx={fS * 0.28} cy={yv + fS * 0.55} r={fS * 0.16} fill={CTX} />
              <Renglones lineas={v} x={m.sangria} y={yv} f={fS} color={CTX} interlinea={1.25} />
            </g>
          )
        })}
      </g>
    )
  })
}

/**
 * Un solo svg: la barra de los envíos a la izquierda y el plan L1 a L6 a la derecha; abajo, a todo el ancho, la
 * fila de los riesgos críticos y el renglón de las normas. El riesgo empieza a la letra de «la lista sale sin
 * ellos» y baja hasta que el plan entra arriba con su letra de 13 px reales a 1280 × 720 (11,75 por k en el svg,
 * con el zoom de 1,11). Los dos rótulos mono, a la misma letra.
 */
function Cuerpo({ w, h, k }) {
  const f2 = 12.5 * k
  const fRot = 11.75 * k
  const fS = 12.5 * k
  const fPlan = 11.75 * k
  const gap = 36 * k
  const wBarra = Math.round((w - gap) * 0.42)
  const wPlan = w - gap - wBarra
  const cabPlan = arriba(fRot) + fRot + 12 * k
  const pieNormas = envolver(D10.nota, w, f2)
  const altoNormas = pieNormas.length * f2 * 1.3
  const fMax = Math.round(20 * k * 0.9)          // la letra del riesgo, a lo sumo
  const pie = (fR) => {
    const m = medirCriticos(w, fR, fS, k)
    return { m, fR, alto: 10 * k + arriba(fRot) + fRot + 8 * k + m.alto + 8 * k + altoNormas }
  }
  let p = pie(fMax)
  for (let fR = fMax; fR >= 14 * k; fR -= 0.5) {
    p = pie(fR)
    if (medirPlan(wPlan, fPlan, k).alto <= h - p.alto - cabPlan) break
  }
  const hArriba = h - p.alto
  const yRot = hArriba + 10 * k
  const yFila = yRot + arriba(fRot) + fRot + 8 * k
  const yNormas = yFila + p.m.alto + 8 * k
  return (
    <svg width={w} height={h} role="group" style={{ display: 'block' }}
         aria-label={`${CONCLUSION}. Plan legal: ${DECISION.decision}. ${ROT_CRITICOS}: ${CRITICOS_FILA.map((c) => `${c.riesgo} (mide ${plano(c.senal)}; alerta: ${plano(c.umbral)}; dueño: ${plano(c.dueno)})`).join('; ')}. ${plano(D10.nota)}`}>
      <g><BarraEnvios w={wBarra} h={hArriba} k={k * 0.9} /></g>
      <line x1={wBarra + gap / 2} x2={wBarra + gap / 2} y1={0} y2={hArriba} stroke="var(--bd)" strokeWidth="1" />
      <g transform={`translate(${wBarra + gap}, 0)`}>
        <Rotulo x={0} y={arriba(fRot)} texto="Plan legal" f={fRot} color={CTX} />
        <g transform={`translate(0, ${cabPlan})`}>
          <PlanLegal w={wPlan} h={hArriba - cabPlan} k={k} />
        </g>
      </g>
      <line x1={0} x2={w} y1={hArriba + 4 * k} y2={hArriba + 4 * k} stroke="var(--bd)" strokeWidth="1" />
      <Rotulo x={0} y={yRot + arriba(fRot)} texto={ROT_CRITICOS} f={fRot} color={INK} />
      <g transform={`translate(0, ${yFila})`}><FilaCriticos m={p.m} fR={p.fR} fS={fS} k={k} /></g>
      <Renglones lineas={pieNormas} x={0} y={yNormas} f={f2} color={MUT2} />
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
