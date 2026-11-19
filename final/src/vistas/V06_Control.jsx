// V06 · Cómo se mide (modelo, Francisco C.). Cómo se reparte la lista de un mes en el piloto, con la lista de muestra al
// corte de agosto de 2025: el 20 % de mayor facturación (K16) se contacta entero; el resto (K17) se sortea en el control
// (G49.control_mes, en --acc: es lo que permite medir) y las dos ramas (K18). Las sumas se controlan contra la lista del
// mes (G49.lista_mes) y el resto, como V10 a V12.
// (18/11, fase 8, spec 2 V06; el usuario: «completamente confuso») Dos versiones, variante('V06'):
//   a  flujo de izquierda a derecha con bandas de alto proporcional a los clientes: lista → 20 % de mayor facturación y
//      sorteo → control, rama con descuento y rama sin descuento; a la derecha, la llave «a los 90 días se compara cada
//      rama con el control». Leyenda: qué es cada color de nodo y qué es el alto de la banda.
//   b  cuadrícula de 500 puntos, un punto por cliente, en un bloque por grupo (columnas de R puntos), con la cantidad y el
//      nombre de cada grupo arriba, la llave de la lista entera encima y la del sorteo debajo de los tres sorteados.
// Ninguna cifra nueva: cantidades de DF; las proporciones del dibujo sí se calculan.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { variante } from '../variantes.js'
import {
  ACC, CONTORNO, CTX, FIN_GRIS, INK, PISTA, SUP, Leyenda, Llave, LlaveH, Renglones, ancho, anchoLeyenda, envolver,
  rectRedondo, tam, useU,
} from '../svg.jsx'

const ID = 'V06'
const A = DF.anclas
const T = textosDe(ID)
const G = T.grupos

const LISTA = A['G49.lista_mes'].valor
const ALTO = A.K16.valor
const RESTO = A.K17.valor
const CONTROL = A['G49.control_mes'].valor
const CON = A['K18.con_descuento'].valor
const SIN = A['K18.sin_descuento'].valor
if (ALTO + RESTO !== LISTA) throw new Error('V06: el 20 % de mayor facturación y el resto no suman la lista del mes')
if (CONTROL + CON + SIN !== RESTO) throw new Error('V06: el control y las dos ramas no suman el resto de la lista')

/** Los cuatro grupos finales, de arriba abajo (a) o de izquierda a derecha (b). */
const GRUPOS = [
  { clave: 'alto', n: ALTO, nombre: G.alto, accion: G.alto_accion },
  { clave: 'control', n: CONTROL, nombre: G.control, accion: G.control_accion, foco: true },
  { clave: 'con', n: CON, nombre: G.con, accion: G.rama_accion },
  { clave: 'sin', n: SIN, nombre: G.sin, accion: G.rama_accion },
]

export const meta = { id: ID }

/** Parte del alto del lienzo que ocupa el dibujo (la herramienta pide entre el 70 % y el 95 %). */
const LLENA = 0.9

// ---------------------------------------------------------------- piezas propias

/** Banda de un flujo: de la cara derecha de un nodo (x1, de a1 a b1) a la izquierda de otro (x2, de a2 a b2). */
function Banda({ x1, a1, b1, x2, a2, b2, fill, opacidad }) {
  const xm = (x1 + x2) / 2
  const d = `M${x1} ${a1} C${xm} ${a1} ${xm} ${a2} ${x2} ${a2} L${x2} ${b2} C${xm} ${b2} ${xm} ${b1} ${x1} ${b1} Z`
  return <path d={d} fill={fill} fillOpacity={opacidad} />
}

/** Estilo de un nodo: 'reparte' (blanco con contorno: la lista y el resto, que se parten), 'contacta' (gris) o
 *  'control' (acento). Devuelve el relleno, el trazo y el color del número que va adentro. */
function estiloNodo(tipo, u) {
  if (tipo === 'control') return { fill: ACC, texto: SUP }
  if (tipo === 'contacta') return { fill: FIN_GRIS, texto: INK }
  return { fill: SUP, stroke: CONTORNO, strokeWidth: 3 * u, texto: INK }
}

/** Nodo: rectángulo de ancho nw con el número centrado adentro. */
function Nodo({ u, x, y, nw, alto, tipo, numero, f }) {
  const e = estiloNodo(tipo, u)
  const sw = e.strokeWidth ?? 0
  return (
    <g>
      <path d={rectRedondo(x + sw / 2, y + sw / 2, nw - sw, alto - sw, 4 * u, 'todos')} fill={e.fill} stroke={e.stroke}
            strokeWidth={sw || undefined} />
      <text x={x + nw / 2} y={y + alto / 2} fontSize={f} fontWeight={700} fill={e.texto} textAnchor="middle"
            dominantBaseline="central">{numero}</text>
    </g>
  )
}

/** Muestra de leyenda para un tipo de nodo (cuadro de lado s centrado en x, y). */
const muestraNodo = (tipo) => function MuestraNodo({ u, x, y, s }) {
  const e = estiloNodo(tipo, u)
  const sw = e.strokeWidth ?? 0
  return <rect x={x - s / 2 + sw / 2} y={y - s / 2 + sw / 2} width={s - sw} height={s - sw} rx={4 * u} fill={e.fill}
               stroke={e.stroke} strokeWidth={sw || undefined} />
}

/** Ítem de leyenda de la banda, más ancho que una muestra común: un tramo de banda gris como los del dibujo, con su
 *  texto. (x, y): borde izquierdo y centro del renglón. */
function LeyendaBanda({ u, x, y, texto }) {
  const f = tam(24, u)
  const a = 44 * u, t = 12 * u, d = 6 * u
  return (
    <g>
      <Banda x1={x} a1={y - d - t / 2} b1={y - d + t / 2} x2={x + a} a2={y + d - t / 2} b2={y + d + t / 2}
             fill={FIN_GRIS} opacidad={0.5} />
      <text x={x + a + 10 * u} y={y} fontSize={f} fill={INK} dominantBaseline="central">{texto}</text>
    </g>
  )
}

/** Renglones parejos: la menor cantidad de renglones (hasta `max`) en que el texto entra en `w`, cortado donde el
 *  renglón más largo queda más corto («Lista» / «del mes», no «Lista del» / «mes»). */
function parejos(texto, w, f, peso = 400, max = 5) {
  const pal = String(texto).split(' ')
  const anchoDe = (ls) => Math.max(...ls.map((l) => ancho(l, f, peso)))
  let mejor = null
  const probar = (desde, quedan, hechos) => {
    if (quedan === 1) {
      const ls = [...hechos, pal.slice(desde).join(' ')]
      const a = anchoDe(ls)
      if (!mejor || a < mejor.a) mejor = { ls, a }
      return
    }
    for (let i = desde + 1; i <= pal.length - quedan + 1; i++) {
      probar(i, quedan - 1, [...hechos, pal.slice(desde, i).join(' ')])
    }
  }
  for (let n = 1; n <= Math.min(max, pal.length); n++) {
    mejor = null
    probar(0, n, [])
    if (mejor.a <= w) return mejor.ls
  }
  return mejor.ls
}

// ---------------------------------------------------------------- a · flujo

function Flujo({ w, h }) {
  const u = useU()
  const fNom = tam(28, u)
  const fAcc = tam(24, u)
  const fNum = tam(32, u)
  const fNota = tam(22, u)
  const nw = 88 * u

  // vertical: leyenda arriba y el flujo debajo; el bloque ocupa LLENA del alto
  const total = LLENA * h
  const yTop = (h - total) / 2
  const yLey = yTop + 13 * u
  const yT = yTop + 26 * u + 26 * u
  const yBot = yTop + total
  const g1 = 60 * u                 // entre el 20 % y los sorteados: el rótulo del sorteo
  const g2 = 18 * u                 // entre los tres sorteados
  const k = (yBot - yT - g1 - 2 * g2) / LISTA

  // horizontal: rótulo de la lista | nodo | banda | sorteo | banda | grupos | rótulos | llave | comparación
  const lineasLista = parejos(G.lista, 140 * u, fNom, 700)
  const izq = Math.max(...lineasLista.map((l) => ancho(l, fNom, 700))) + 18 * u
  const anchoEtq = Math.max(...GRUPOS.slice(1).flatMap((g) => [ancho(g.nombre, fNom, 700), ancho(g.accion, fAcc, 400)]))
  const anchoComp = Math.max(ancho(T.compara.cuando, fNom, 700), 200 * u)
  const xA = izq
  const xD = w - (anchoComp + 34 * u + 26 * u + anchoEtq + 18 * u + nw)
  const xB = (xA + nw + xD) / 2 - nw / 2
  const xEtq = xD + nw + 18 * u
  const xLlave = xEtq + anchoEtq + 26 * u

  // grupos finales, de arriba abajo
  const gs = []
  let y = yT
  GRUPOS.forEach((g, i) => {
    if (i === 1) y += g1
    else if (i > 1) y += g2
    gs.push({ ...g, y, alto: g.n * k })
    y += g.n * k
  })
  const [gAlto, gCtl, gCon, gSin] = gs
  // la lista, centrada; el sorteo, centrado frente a sus tres salidas
  const yA = (yT + yBot) / 2 - (LISTA * k) / 2
  const yB = (gCtl.y + yBot) / 2 - (RESTO * k) / 2
  const xA2 = xA + nw, xB2 = xB + nw

  const ley = [
    { marca: muestraNodo('reparte'), texto: T.ley.reparte },
    { marca: muestraNodo('contacta'), texto: T.ley.contacta },
    { marca: muestraNodo('control'), texto: T.ley.control },
  ]
  const lineasComp = parejos(T.compara.que, anchoComp, fAcc, 400)
  const altoComp = fNom * 1.25 + lineasComp.length * fAcc * 1.3
  const yComp = (gCtl.y + yBot) / 2 - altoComp / 2
  const altoEtq = fNom * 1.1 + 6 * u + fAcc * 1.1

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Leyenda u={u} x={0} y={yLey} items={ley} />
      <LeyendaBanda u={u} x={anchoLeyenda(u, ley) + 32 * u} y={yLey} texto={T.ley.banda} />
      <text x={w} y={yLey} fontSize={fNota} fill={CTX} textAnchor="end" dominantBaseline="central">{T.muestra}</text>

      {/* bandas, detrás de los nodos */}
      <Banda x1={xA2} a1={yA} b1={yA + ALTO * k} x2={xD} a2={gAlto.y} b2={gAlto.y + gAlto.alto}
             fill={FIN_GRIS} opacidad={0.5} />
      <Banda x1={xA2} a1={yA + ALTO * k} b1={yA + LISTA * k} x2={xB} a2={yB} b2={yB + RESTO * k}
             fill={PISTA} opacidad={0.7} />
      <Banda x1={xB2} a1={yB} b1={yB + CONTROL * k} x2={xD} a2={gCtl.y} b2={gCtl.y + gCtl.alto}
             fill={ACC} opacidad={0.75} />
      <Banda x1={xB2} a1={yB + CONTROL * k} b1={yB + (CONTROL + CON) * k} x2={xD} a2={gCon.y} b2={gCon.y + gCon.alto}
             fill={FIN_GRIS} opacidad={0.5} />
      <Banda x1={xB2} a1={yB + (CONTROL + CON) * k} b1={yB + RESTO * k} x2={xD} a2={gSin.y} b2={gSin.y + gSin.alto}
             fill={FIN_GRIS} opacidad={0.5} />

      {/* la lista */}
      <Nodo u={u} x={xA} y={yA} nw={nw} alto={LISTA * k} tipo="reparte" numero={fijo(LISTA)} f={fNum} />
      <Renglones lineas={lineasLista} x={xA - 18 * u} y={yA + (LISTA * k) / 2 - (lineasLista.length * fNom * 1.2) / 2}
                 f={fNom} peso={700} inter={1.2} anchor="end" />

      {/* el sorteo */}
      <Nodo u={u} x={xB} y={yB} nw={nw} alto={RESTO * k} tipo="reparte" numero={fijo(RESTO)} f={fNum} />
      <text x={xB} y={yB - 14 * u} fontSize={fNom} fontWeight={700} fill={INK}>{G.sorteo}</text>

      {/* los cuatro grupos y lo que se hace con cada uno */}
      {gs.map((g) => (
        <g key={g.clave}>
          <title>{`${g.nombre}: ${fijo(g.n)}, ${g.accion}`}</title>
          <Nodo u={u} x={xD} y={g.y} nw={nw} alto={g.alto} tipo={g.foco ? 'control' : 'contacta'} numero={fijo(g.n)}
                f={fNum} />
          <text x={xEtq} y={g.y + g.alto / 2 - altoEtq / 2} fontSize={fNom} fontWeight={700} fill={INK}
                dominantBaseline="hanging">{g.nombre}</text>
          <text x={xEtq} y={g.y + g.alto / 2 - altoEtq / 2 + fNom * 1.1 + 6 * u} fontSize={fAcc}
                fontWeight={g.foco ? 600 : 400} fill={g.foco ? INK : CTX} dominantBaseline="hanging">{g.accion}</text>
        </g>
      ))}

      {/* la comparación */}
      <Llave u={u} x={xLlave} y1={gCtl.y} y2={yBot} lado="der" />
      <text x={xLlave + 34 * u} y={yComp} fontSize={fNom} fontWeight={700} fill={INK}
            dominantBaseline="hanging">{T.compara.cuando}</text>
      <Renglones lineas={lineasComp} x={xLlave + 34 * u} y={yComp + fNom * 1.25} f={fAcc} inter={1.3} />
    </svg>
  )
}

// ---------------------------------------------------------------- b · un punto por cliente

/** Muestra de leyenda: un punto del color del grupo. */
const muestraPunto = (fill) => function MuestraPunto({ x, y, s }) {
  return <circle cx={x} cy={y} r={s * 0.36} fill={fill} />
}

/** Huecos entre bloques, en pasos de la cuadrícula: más ancho entre el 20 % (sin sorteo) y los sorteados. */
const HUECO = [0, 2.4, 1.3, 1.3]

function Puntos({ w, h }) {
  const u = useU()
  const fCant = tam(34, u)
  const fNom = tam(24, u)
  const fLlave = tam(26, u)
  const fNota = tam(22, u)
  const total = LLENA * h
  const huecos = HUECO.reduce((s, x) => s + x, 0)

  /** El armado con R filas por columna: paso p de la cuadrícula y el alto de cada parte. */
  function medir(R) {
    const cols = GRUPOS.map((g) => Math.ceil(g.n / R))
    const sumCols = cols.reduce((s, c) => s + c, 0)
    let p = Math.min(40 * u, w / (sumCols + huecos))
    let lay = null
    for (let vuelta = 0; vuelta < 3; vuelta++) {
      const nombres = GRUPOS.map((g, i) => envolver(g.nombre, Math.max(cols[i] * p, 120 * u), fNom, 600))
      const altoCab = fCant * 1.15 + Math.max(...nombres.map((l) => l.length)) * fNom * 1.2 + 12 * u
      const altoLey = 26 * u + 22 * u
      const altoLista = fLlave * 1.2 + 10 * u + 10 * u + 16 * u
      const altoPie = 14 * u + 10 * u + 12 * u + 2 * fNom * 1.25
      const altoGrilla = total - altoLey - altoLista - altoCab - altoPie
      lay = { R, cols, nombres, altoCab, altoLey, altoLista, altoPie, altoGrilla, p }
      if (R * p <= altoGrilla + 0.5) break
      p = altoGrilla / R
      lay.p = p
    }
    return lay
  }
  let L = null
  for (let R = 6; R <= 24; R++) {
    const m = medir(R)
    if (m.altoGrilla > 0 && (!L || m.p > L.p + 0.01)) L = m
  }
  const { R, cols, nombres, altoCab, altoLey, altoLista, p } = L
  const anchoTotal = (cols.reduce((s, c) => s + c, 0) + huecos) * p
  const x0 = (w - anchoTotal) / 2
  // el alto real (la grilla puede quedar más baja que su lugar si el ancho la limita), centrado en el lienzo
  const altoReal = altoLey + altoLista + altoCab + R * p + 14 * u + 20 * u + fNom * 1.25 + fNom
  const y00 = (h - altoReal) / 2
  const yLey = y00 + 13 * u
  const yLista = y00 + altoLey
  const yCab = yLista + altoLista
  const yGrilla = yCab + altoCab
  const yPie = yGrilla + R * p
  const r = p * 0.36

  let x = x0
  const bloques = GRUPOS.map((g, i) => {
    x += HUECO[i] * p
    const b = { ...g, x, cols: cols[i], ancho: cols[i] * p, nombreL: nombres[i] }
    x += cols[i] * p
    return b
  })
  const [bAlto, bCtl, , bSin] = bloques
  const ley = [
    { marca: muestraPunto(ACC), texto: T.ley.control },
    { marca: muestraPunto(FIN_GRIS), texto: T.ley.contacta },
  ]
  const xLlave1 = bCtl.x, xLlave2 = bSin.x + bSin.ancho
  const yLlavePie = yPie + 14 * u
  const notaAlto = envolver(G.alto_accion, bAlto.ancho, fNota, 400)

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Leyenda u={u} x={x0} y={yLey} items={ley} />
      <text x={x0 + anchoLeyenda(u, ley) + 40 * u} y={yLey} fontSize={tam(24, u)} fill={CTX}
            dominantBaseline="central">{T.ley.punto}</text>
      <text x={x0 + anchoTotal} y={yLey} fontSize={fNota} fill={CTX} textAnchor="end"
            dominantBaseline="central">{T.muestra}</text>

      {/* la lista entera */}
      <text x={x0 + anchoTotal / 2} y={yLista} fontSize={fLlave} fontWeight={700} fill={INK} textAnchor="middle"
            dominantBaseline="hanging">{T.puntos.lista}</text>
      <LlaveH u={u} x1={x0} x2={x0 + anchoTotal} y={yLista + fLlave * 1.2 + 18 * u} lado="arriba" />

      {bloques.map((b) => (
        <g key={b.clave}>
          <title>{`${b.nombre}: ${fijo(b.n)}, ${b.accion}`}</title>
          <text x={b.x} y={yCab} fontSize={fCant} fontWeight={700} fill={INK}
                dominantBaseline="hanging">{fijo(b.n)}</text>
          <Renglones lineas={b.nombreL} x={b.x} y={yCab + fCant * 1.15} f={fNom} peso={600} inter={1.2} />
          {Array.from({ length: b.n }, (_, i) => (
            <circle key={i} cx={b.x + (i % b.cols) * p + p / 2} cy={yGrilla + Math.floor(i / b.cols) * p + p / 2}
                    r={r} fill={b.foco ? ACC : FIN_GRIS} />
          ))}
        </g>
      ))}

      {/* lo que pasa con cada parte */}
      <Renglones lineas={notaAlto} x={bAlto.x} y={yLlavePie} f={fNota} color={CTX} />
      <LlaveH u={u} x1={xLlave1} x2={xLlave2} y={yLlavePie} lado="abajo" />
      <text x={(xLlave1 + xLlave2) / 2} y={yLlavePie + 20 * u} fontSize={fNom} fontWeight={700} fill={INK}
            textAnchor="middle" dominantBaseline="hanging">{T.puntos.sorteo}</text>
      <text x={(xLlave1 + xLlave2) / 2} y={yLlavePie + 20 * u + fNom * 1.25} fontSize={fNom} fill={INK}
            textAnchor="middle" dominantBaseline="hanging">{T.puntos.compara}</text>
    </svg>
  )
}

export default function V06Control() {
  const b = variante(ID) === 'b'
  return (
    <Vista id={ID} hibrido
           items={[
             { clave: 'control', valor: fijo(CONTROL) },
             { clave: 'lista', valor: fijo(LISTA) },
             { clave: 'meses', valor: fijo(A['G49.meses'].valor) },
           ]}
           cifras={[pct(A['G49.alto_valor'].valor, 0)]}>
      {({ w, h }) => (b ? <Puntos w={w} h={h} /> : <Flujo w={w} h={h} />)}
    </Vista>
  )
}
