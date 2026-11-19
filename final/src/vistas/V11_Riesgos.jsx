// V11 · Qué puede fallar (legal, riesgos y adopción, Tomas F.). Los tres riesgos críticos de la C 6.3 (tabla TOP3 de
// contenido_c.py; DF cuenta cuántos son en riesgos_criticos.n), con su señal y su respuesta (textos de CF). Fase 8
// (18/11): el usuario la vio «insulsa, sin contraste»; dos versiones (spec 2, ficha V11):
//   a  tres tarjetas en columna, una por riesgo: encabezado lleno (INK con texto blanco; ACC en el de adopción, que es el
//      que nombra el título) con número, nombre y tipo; debajo, «Señal que se mira» y «Qué se hace» con rótulo en mono.
//      La de adopción además sobresale 24 u a cada lado y lleva el cuerpo en realce; los textos quedan alineados.
//   b  tabla de tres filas por tres columnas (riesgo → señal → respuesta), fila de encabezado llena en INK, flechas entre
//      columnas y la fila de adopción realzada (fondo de realce, celda del riesgo llena en ACC).
// Las dos llevan leyenda de lo que es cada color (y en b, la flecha). El espacio vertical (rellenos y aire entre
// tarjetas o filas) crece con el lienzo entre un mínimo y un máximo para que el dibujo ocupe del 90 al 93 % del alto; la
// letra no cambia, salvo la del cuerpo de a, que baja hasta 24 u si una señal o una respuesta no entra en un renglón.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo } from '../../../e3/src/formato.js'
import { variante } from '../variantes.js'
import { ACC, BORDE, CTX, FIN_GRIS, INK, PISTA, REALCE, SUP, TRAZO, Leyenda, ancho, envolver, rectRedondo, tam,
  useU } from '../svg.jsx'

const ID = 'V11'
const A = DF.anclas
const X = textosDe(ID)
const C = X.columnas
const N = DF.tablas.riesgos_criticos.n
const FOCO = 1   // la fila de adopción (quién corre la planilla): la que nombra el título
const LLENA = 0.9
const LLENA_A = 0.93   // las tarjetas piden un poco más de aire por dentro

if (X.filas.length !== N) throw new Error('V11: la tarjeta y el gráfico no cuentan los mismos riesgos')
if (X.tipos?.length !== N) throw new Error('V11: textos_vistas/V11.js no trae un tipo por riesgo')

export const meta = { id: ID }

const MONO = { fontFamily: 'var(--mono)' }

/** Rótulo en mono, mayúsculas y espaciado (el de la banda): «SEÑAL QUE SE MIRA». */
function Mono({ x, y, f, texto, color = CTX, peso = 600, anchor = 'start', base = 'hanging', ls }) {
  return (
    <text x={x} y={y} fontSize={f} fontWeight={peso} fill={color} textAnchor={anchor} dominantBaseline={base}
          letterSpacing={ls} style={MONO}>{texto.toUpperCase()}</text>
  )
}

/** Renglones desde y (borde superior del primero), con interlineado `inter`. */
function Lineas({ ls, x, y, f, peso = 400, color = INK, inter = 1.22 }) {
  return ls.map((l, i) => (
    <text key={i} x={x} y={y + i * f * inter} fontSize={f} fontWeight={peso} fill={color}
          dominantBaseline="hanging">{l}</text>
  ))
}

/** Como envolver, pero con los renglones parejos y sin cortes feos. En dos renglones prueba cada corte que entra en `w`
 *  y elige el de menor costo: el renglón más largo sobre el del corte más parejo, más 0,35 si el primer renglón termina
 *  en una palabra de hasta tres letras («no», «la», «se», «sin») y menos 0,2 si termina en coma o punto y coma («si
 *  ninguna rama llega, / se cierra…», «Contactar / no paga la lista»). En más renglones, el ancho más angosto que no
 *  agrega uno. */
function parejo(texto, w, f, peso = 400) {
  const base = envolver(texto, w, f, peso)
  if (base.length < 2) return base
  if (base.length === 2) {
    const ps = String(texto).split(' ')
    const cortes = []
    for (let k = 1; k < ps.length; k++) {
      const l = [ps.slice(0, k).join(' '), ps.slice(k).join(' ')]
      const max = Math.max(...l.map((x) => ancho(x, f, peso)))
      const ult = ps[k - 1]
      if (max <= w) cortes.push({ l, max, corta: ult.replace(/[^\p{L}]/gu, '').length <= 3, signo: /[,;]$/.test(ult) })
    }
    const min = Math.min(...cortes.map((c) => c.max))
    const costo = (c) => c.max / min + (c.corta ? 0.35 : 0) - (c.signo ? 0.2 : 0)
    return cortes.sort((p, q) => costo(p) - costo(q))[0].l
  }
  let lo = 0
  let hi = w
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2
    if (envolver(texto, mid, f, peso).length > base.length) lo = mid
    else hi = mid
  }
  return envolver(texto, hi, f, peso)
}

/** Flecha fina de x1 a x2 en y: asta de `grosor` u con punta triangular llena de `punta` u, en `color`. */
function Flechita({ u, x1, x2, y, color, grosor = 4, punta = 18 }) {
  const p = punta * u
  const a = 0.62 * p
  return (
    <g>
      <line x1={x1} x2={x2 - p + u} y1={y} y2={y} stroke={color} strokeWidth={grosor * u} />
      <path d={`M${x2 - p} ${y - a} L${x2} ${y} L${x2 - p} ${y + a} Z`} fill={color} />
    </g>
  )
}

/** Reparte el alto libre: cada hueco va de su mínimo a su máximo (en px) con el mismo k ∈ [0, 1], el que deja el
 *  total en `meta` (o el más cercano). fijo: lo que no crece. huecos: [[min, max, veces], …]. */
function repartir(fijoPx, huecos, metaPx) {
  const tot = (k) => fijoPx + huecos.reduce((s, [a, b, n]) => s + n * (a + k * (b - a)), 0)
  const k = Math.max(0, Math.min(1, (metaPx - tot(0)) / Math.max(1e-9, tot(1) - tot(0))))
  return { k, val: huecos.map(([a, b]) => a + k * (b - a)), total: tot(k) }
}

// ---------------------------------------------------------------- a: tres tarjetas en columna

function medirA(w, h, u) {
  const fNom = tam(30, u)       // número y nombre del riesgo, blanco 700
  const fTip = tam(20, u)       // tipo del riesgo, mono
  const fLab = tam(20, u)       // rótulo del campo, mono
  const fLey = tam(24, u)
  const lsTip = 0.14 * fTip
  const lsLab = 0.1 * fLab
  const padX = 28 * u
  const salto = 24 * u          // la tarjeta de adopción sobresale esto a cada lado; los textos quedan alineados
  const gapCol = 72 * u
  const colW = (w - 2 * salto - 2 * padX - gapCol) / 2
  // letra del cuerpo: la más grande, de 28 a 24 u, con la que cada señal y cada respuesta entra en un renglón
  const textos = X.filas.flatMap((r) => [r.senal, r.respuesta])
  let fTxt = tam(28, u)
  while (fTxt > 24 * u && textos.some((t) => ancho(t, fTxt) > colW)) fTxt = Math.max(24 * u, fTxt - 0.25 * u)
  const inter = 1.22
  const filas = X.filas.map((r, i) => {
    const ls = [parejo(r.senal, colW, fTxt), parejo(r.respuesta, colW, fTxt)]
    return { ...r, i, foco: i === FOCO, tipo: X.tipos[i], ls, nl: Math.max(ls[0].length, ls[1].length) }
  })
  const altoLey = fLey * 1.2
  const texto = filas.reduce((s, r) => s + fNom + fLab + (r.nl - 1) * fTxt * inter + fTxt, 0)
  // huecos: aire leyenda → tarjetas, relleno del encabezado (2 por tarjeta), relleno del cuerpo (2 por tarjeta),
  // rótulo → texto (1 por tarjeta) y aire entre tarjetas (n − 1)
  const n = filas.length
  const R = repartir(altoLey + texto, [
    [14 * u, 40 * u, 1], [8 * u, 28 * u, 2 * n], [14 * u, 36 * u, 2 * n], [8 * u, 16 * u, n], [14 * u, 44 * u, n - 1],
  ], LLENA_A * h)
  const [gLey, pH, pB, gL, gC] = R.val
  return { fNom, fTip, fLab, fLey, fTxt, lsTip, lsLab, inter, padX, salto, gapCol, colW, filas, altoLey, gLey, pH, pB, gL, gC,
    alto: R.total }
}

function DibujoA({ w, h }) {
  const u = useU()
  const m = medirA(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const numW = Math.max(...m.filas.map((r) => ancho(fijo(r.i + 1), m.fNom, 700)))
  let y = m.altoLey + m.gLey
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        <Leyenda u={u} x={0} y={m.altoLey / 2} items={[
          { marca: 'hecho', texto: X.ley.foco },
          { marca: 'curso', texto: X.ley.otros },
        ]} />
        {m.filas.map((r) => {
          const hHead = m.fNom + 2 * m.pH
          const hBody = 2 * m.pB + m.fLab + m.gL + (r.nl - 1) * m.fTxt * m.inter + m.fTxt
          const yc = y
          y += hHead + hBody + m.gC
          const color = r.foco ? ACC : INK
          const sw = (r.foco ? 4 : 2) * u
          const rx = 8 * u
          const yB = yc + hHead
          const yLab = yB + m.pB
          const yTxt = yLab + m.fLab + m.gL
          const x0 = r.foco ? 0 : m.salto           // borde izquierdo de la tarjeta
          const wc = w - 2 * x0
          const xt = m.salto + m.padX                // los textos, alineados en las tres
          const xs = [xt, xt + m.colW + m.gapCol]
          return (
            <g key={r.riesgo}>
              <title>{`${fijo(r.i + 1)}. ${r.riesgo} (${r.tipo}). ${C.senal}: ${r.senal}. ${C.respuesta}: ${r.respuesta}.`}</title>
              <rect x={x0 + sw / 2} y={yc + sw / 2} width={wc - sw} height={hHead + hBody - sw} rx={rx}
                    fill={r.foco ? REALCE : SUP} stroke={color} strokeWidth={sw} />
              <path d={rectRedondo(x0, yc, wc, hHead, rx, 'arr')} fill={color} />
              <text x={xt} y={yc + hHead / 2} fontSize={m.fNom} fontWeight={700} fill={SUP}
                    dominantBaseline="central">{fijo(r.i + 1)}</text>
              <text x={xt + numW + 22 * u} y={yc + hHead / 2} fontSize={m.fNom} fontWeight={700} fill={SUP}
                    dominantBaseline="central">{r.riesgo}</text>
              <Mono x={w - xt} y={yc + hHead / 2} f={m.fTip} texto={r.tipo} color={SUP} anchor="end" base="central"
                    ls={m.lsTip} />
              <line x1={xs[1] - m.gapCol / 2} x2={xs[1] - m.gapCol / 2} y1={yLab} y2={yB + hBody - m.pB}
                    stroke={r.foco ? FIN_GRIS : PISTA} strokeWidth={TRAZO.guia * u} />
              <Mono x={xs[0]} y={yLab} f={m.fLab} texto={C.senal} ls={m.lsLab} />
              <Mono x={xs[1]} y={yLab} f={m.fLab} texto={C.respuesta} ls={m.lsLab} />
              <Lineas ls={r.ls[0]} x={xs[0]} y={yTxt} f={m.fTxt} inter={m.inter} />
              <Lineas ls={r.ls[1]} x={xs[1]} y={yTxt} f={m.fTxt} inter={m.inter} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------- b: tabla riesgo → señal → respuesta

function medirB(w, h, u) {
  const fH = tam(22, u)         // encabezado, mono en blanco
  const fNom = tam(28, u)       // riesgo, 700
  const fTxt = tam(28, u)       // señal y respuesta
  const fLey = tam(24, u)
  const lsH = 0.1 * fH
  const gA = 76 * u             // hueco de la flecha entre columnas
  const pad = 24 * u            // relleno lateral de cada celda
  const util = w - 2 * gA
  const anchos = [0.29, 0.33, 0.38].map((p) => p * util)
  const xs = [0, anchos[0] + gA, anchos[0] + anchos[1] + 2 * gA]
  const numW = Math.max(...X.filas.map((_, i) => ancho(fijo(i + 1), fNom, 700)))
  const gNum = 16 * u
  const inter = 1.22
  const filas = X.filas.map((r, i) => {
    const ls = [
      parejo(r.riesgo, anchos[0] - 2 * pad - numW - gNum, fNom, 700),
      parejo(r.senal, anchos[1] - 2 * pad, fTxt),
      parejo(r.respuesta, anchos[2] - 2 * pad, fTxt),
    ]
    const nl = Math.max(...ls.map((x) => x.length))
    return { ...r, i, foco: i === FOCO, ls, nl, texto: (nl - 1) * fTxt * inter + fTxt }
  })
  const altoLey = fLey * 1.2
  const n = filas.length
  const fijoPx = altoLey + fH + filas.reduce((s, r) => s + r.texto, 0)
  // huecos: aire leyenda → tabla, relleno del encabezado (2) y relleno de cada fila (2 por fila)
  const R = repartir(fijoPx, [[16 * u, 44 * u, 1], [14 * u, 30 * u, 2], [16 * u, 76 * u, 2 * n]], LLENA * h)
  const [gLey, pH, pR] = R.val
  return { fH, fNom, fTxt, fLey, lsH, gA, pad, anchos, xs, numW, gNum, inter, filas, altoLey, gLey, pH, pR,
    alto: R.total }
}

function DibujoB({ w, h }) {
  const u = useU()
  const m = medirB(w, h, u)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const rx = 8 * u
  const yH = m.altoLey + m.gLey
  const hH = m.fH + 2 * m.pH
  const largoF = m.gA - 28 * u
  const xF = (j) => m.xs[j] - m.gA / 2          // centro del hueco antes de la columna j
  const cab = [C.riesgo, C.senal, C.respuesta]
  let y = yH + hH
  const filas = m.filas.map((r) => {
    const yr = y
    const hr = r.texto + 2 * m.pR
    y += hr
    return { ...r, yr, hr }
  })
  const fin = y
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <g transform={`translate(0,${y0})`}>
        <Leyenda u={u} x={0} y={m.altoLey / 2} items={[
          { marca: 'hecho', texto: X.ley.foco },
          { marca: ({ u: uu, x, y: yy, s }) => <Flechita u={uu} x1={x - s / 2 - 10 * uu} x2={x + s / 2} y={yy} color={FIN_GRIS}
                                                           punta={14} />,
            texto: X.ley.flecha },
        ]} />
        {/* encabezado lleno en INK, con flechas blancas entre columnas */}
        <path d={rectRedondo(0, yH, w, hH, rx, 'arr')} fill={INK} />
        {cab.map((t, j) => (
          <Mono key={t} x={m.xs[j] + m.pad} y={yH + hH / 2} f={m.fH} texto={t} color={SUP} base="central" ls={m.lsH} />
        ))}
        {[1, 2].map((j) => (
          <Flechita key={j} u={u} x1={xF(j) - largoF / 2} x2={xF(j) + largoF / 2} y={yH + hH / 2} color={SUP} />
        ))}
        {filas.map((r, k) => {
          const yc = r.yr + r.hr / 2
          // cada celda, centrada en el alto de la fila
          const yt = (k2, f) => yc - ((r.ls[k2].length - 1) * f * m.inter + f) / 2
          return (
            <g key={r.riesgo}>
              <title>{`${fijo(r.i + 1)}. ${r.riesgo}. ${C.senal}: ${r.senal}. ${C.respuesta}: ${r.respuesta}.`}</title>
              {r.foco && <rect x={0} y={r.yr} width={w} height={r.hr} fill={REALCE} />}
              {r.foco && <rect x={0} y={r.yr} width={m.anchos[0]} height={r.hr} fill={ACC} />}
              {k > 0 && !r.foco && !filas[k - 1].foco && (
                <line x1={0} x2={w} y1={r.yr} y2={r.yr} stroke={BORDE} strokeWidth={TRAZO.guia * u} />
              )}
              <text x={m.pad} y={yt(0, m.fNom)} fontSize={m.fNom} fontWeight={700} fill={r.foco ? SUP : INK}
                    dominantBaseline="hanging">{fijo(r.i + 1)}</text>
              <Lineas ls={r.ls[0]} x={m.pad + m.numW + m.gNum} y={yt(0, m.fNom)} f={m.fNom} peso={700} color={r.foco ? SUP : INK}
                      inter={m.inter} />
              <Lineas ls={r.ls[1]} x={m.xs[1] + m.pad} y={yt(1, m.fTxt)} f={m.fTxt} inter={m.inter} />
              <Lineas ls={r.ls[2]} x={m.xs[2] + m.pad} y={yt(2, m.fTxt)} f={m.fTxt} inter={m.inter} />
              {[1, 2].map((j) => (
                <Flechita key={j} u={u} x1={xF(j) - largoF / 2} x2={xF(j) + largoF / 2} y={yc} color={r.foco ? ACC : FIN_GRIS}
                          grosor={r.foco ? 5 : 4} />
              ))}
            </g>
          )
        })}
        {/* borde de la tabla y línea de cierre */}
        <path d={rectRedondo(0, yH, w, fin - yH, rx, 'arr')} fill="none" stroke={INK} strokeWidth={TRAZO.contorno * u} />
        <line x1={0} x2={w} y1={fin} y2={fin} stroke={INK} strokeWidth={TRAZO.contorno * u} />
      </g>
    </svg>
  )
}

export default function V11Riesgos() {
  const Dibujo = variante(ID) === 'b' ? DibujoB : DibujoA
  return (
    <Vista id={ID}
           items={[
             { clave: 'horas', valor: fijo(A['G64.horas_por_lista'].valor) },
             { clave: 'riesgos', valor: fijo(N) },
           ]}
           cifras={[fijo(N)]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
