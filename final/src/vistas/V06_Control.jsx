// V06 · Cómo se mide (modelo, Francisco C.). Cómo se reparte la lista de un mes en el piloto: el 20 % de mayor
// facturación se contacta entero; del resto se sortean el control (en --acc: es lo que permite medir) y las dos ramas, y a
// los 90 días cada rama se compara con el control.
// (19/11, fase 9, spec 4 V06; el usuario eligió el flujo, versión a: «Devuelta decluttea bastante y resalta lo que se
// quiere resaltar») Flujo de izquierda a derecha con bandas de alto proporcional a los clientes de la lista de muestra
// (K16, K17, K18 y G49.control_mes, que suman G49.lista_mes). En pantalla, solo las cifras que dice el orador: 500 (la
// lista), 20 % y 15 % (en los nombres), 100 (el control) y 90 días (la comparación). Los conteos de la muestra no se
// escriben: solo dan el alto de las bandas. Sin leyenda: cada nodo lleva su rótulo y el único color es el del control.
// Pasos (las notas de V06): 1 la lista y el 20 % que se aparta; 2 el sorteo, el control y las dos ramas; 3 la
// comparación a los 90 días.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { ACC, CTX, FIN_GRIS, INK, Paso, Renglones, TRAZO, ancho, rectRedondo, tam, useU } from '../svg.jsx'

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

export const meta = { id: ID, pasos: 3 }

/** Parte del alto del lienzo que ocupa el dibujo (la herramienta pide entre el 70 % y el 95 %). */
const LLENA = 0.88

// ---------------------------------------------------------------- piezas propias

/** Banda de un flujo: de la cara derecha de un nodo (x1, de a1 a b1) a la izquierda de otro (x2, de a2 a b2). */
function Banda({ x1, a1, b1, x2, a2, b2, fill, opacidad }) {
  const xm = (x1 + x2) / 2
  const d = `M${x1} ${a1} C${xm} ${a1} ${xm} ${a2} ${x2} ${a2} L${x2} ${b2} C${xm} ${b2} ${xm} ${b1} ${x1} ${b1} Z`
  return <path d={d} fill={fill} fillOpacity={opacidad} />
}

/** Nodo: una barra vertical angosta, en gris o, la del control, en acento. */
function Nodo({ u, x, y, nw, alto, foco = false }) {
  return <path d={rectRedondo(x, y, nw, alto, 4 * u, 'todos')} fill={foco ? ACC : FIN_GRIS} />
}

/** Rótulo de dos renglones centrado en yc: el nombre (con una cifra grande delante, si la hay) y debajo lo que se hace. */
function Rotulo({ x, yc, u, cifra, nombre, accion, foco = false, anchor = 'start' }) {
  const fC = tam('valFoco', u), fN = tam('val', u), fA = tam(24, u)
  const a1 = (cifra ? fC : fN) * 1.1
  const y0 = yc - (a1 + 6 * u + fA * 1.1) / 2
  return (
    <g>
      <text x={x} y={y0 + a1 / 2} fontSize={fN} fontWeight={700} fill={INK} textAnchor={anchor}
            dominantBaseline="central">
        {cifra && <tspan fontSize={fC}>{cifra}</tspan>}
        <tspan fontSize={fN} dx={cifra ? 0.3 * fN : undefined}>{nombre}</tspan>
      </text>
      <text x={x} y={y0 + a1 + 6 * u} fontSize={fA} fontWeight={foco ? 600 : 400} fill={foco ? INK : CTX}
            textAnchor={anchor} dominantBaseline="hanging">{accion}</text>
    </g>
  )
}

/** Ancho de un Rótulo (el renglón más largo). */
function anchoRotulo(u, { cifra, nombre, accion }) {
  const fC = tam('valFoco', u), fN = tam('val', u), fA = tam(24, u)
  const l1 = (cifra ? ancho(cifra, fC, 700) + 0.3 * fN : 0) + ancho(nombre, fN, 700)
  return Math.max(l1, ancho(accion, fA, 400))
}

/** Llave vertical en tinta de y1 a y2 sobre x, con el pico hacia la derecha: agrupa el control y las dos ramas. */
function LlaveComp({ u, x, y1, y2 }) {
  const d = 10 * u
  const ym = (y1 + y2) / 2
  return (
    <path d={`M${x - d} ${y1} H${x} V${y2} H${x - d} M${x} ${ym} H${x + d}`} fill="none" stroke={INK}
          strokeWidth={TRAZO.umbral * u} strokeLinejoin="round" />
  )
}

/** Renglones parejos: la menor cantidad de renglones (hasta `max`) en que el texto entra en `w`, cortado donde el
 *  renglón más largo queda más corto. */
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

// ---------------------------------------------------------------- el flujo

function Flujo({ w, h }) {
  const u = useU()
  const fNom = tam('val', u)
  const fComp = tam('valFoco', u)
  const fQue = tam(26, u)
  const nw = 22 * u

  const ROT = {
    lista: { cifra: fijo(LISTA), nombre: G.lista, accion: G.lista_accion },
    alto: { nombre: G.alto, accion: G.alto_accion },
    control: { cifra: fijo(CONTROL), nombre: G.control, accion: G.control_accion, foco: true },
    con: { nombre: G.con, accion: G.rama_accion },
    sin: { nombre: G.sin, accion: G.rama_accion },
  }

  // vertical: el flujo ocupa LLENA del alto, centrado
  const total = LLENA * h
  const yT = (h - total) / 2
  const yBot = yT + total
  const g1 = 64 * u                 // entre el 20 % y los sorteados: el rótulo del sorteo
  const g2 = 20 * u                 // entre los tres sorteados
  const k = (yBot - yT - g1 - 2 * g2) / LISTA

  // horizontal: rótulo de la lista | nodo | banda | sorteo | banda | grupos | rótulos | llave | comparación
  const gap = 20 * u
  const izq = anchoRotulo(u, ROT.lista) + gap
  const anchoEtq = Math.max(...['control', 'con', 'sin'].map((c) => anchoRotulo(u, ROT[c])))
  const anchoComp = Math.max(ancho(T.compara.cuando, fComp, 700), 280 * u)
  const lineasComp = parejos(T.compara.que, anchoComp, fQue, 400)
  const xA = izq
  const xD = w - (anchoComp + 30 * u + 30 * u + anchoEtq + gap + nw)
  const xB = (xA + nw + xD) / 2 - nw / 2
  const xEtq = xD + nw + gap
  const xLlave = xEtq + anchoEtq + 30 * u

  // grupos finales, de arriba abajo
  const gs = {}
  let y = yT
  ;[['alto', ALTO], ['control', CONTROL], ['con', CON], ['sin', SIN]].forEach(([c, n], i) => {
    if (i === 1) y += g1
    else if (i > 1) y += g2
    gs[c] = { y, alto: n * k }
    y += n * k
  })
  const { alto: gAlto, control: gCtl, con: gCon, sin: gSin } = gs
  // la lista, centrada; el sorteo, centrado frente a sus tres salidas
  const yA = (yT + yBot) / 2 - (LISTA * k) / 2
  const yB = (gCtl.y + yBot) / 2 - (RESTO * k) / 2
  const xA2 = xA + nw, xB2 = xB + nw

  const altoComp = fComp * 1.2 + 8 * u + lineasComp.length * fQue * 1.3
  const yComp = (gCtl.y + yBot) / 2 - altoComp / 2
  const centro = (g) => g.y + g.alto / 2

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* 1 · la lista y el 20 % de mayor facturación, que se contacta entero (en el paso 3 se apaga: no entra en la
          comparación) */}
      <Paso n={1} hasta={2}>
        <Banda x1={xA2} a1={yA} b1={yA + ALTO * k} x2={xD} a2={gAlto.y} b2={gAlto.y + gAlto.alto}
               fill={FIN_GRIS} opacidad={0.45} />
        <Nodo u={u} x={xD} y={gAlto.y} nw={nw} alto={gAlto.alto} />
        <Rotulo x={xEtq} yc={centro(gAlto)} u={u} {...ROT.alto} />
      </Paso>
      <Paso n={1}>
        <Nodo u={u} x={xA} y={yA} nw={nw} alto={LISTA * k} />
        <Rotulo x={xA - gap} yc={yA + (LISTA * k) / 2} u={u} {...ROT.lista} anchor="end" />
      </Paso>

      {/* 2 · del resto, el sorteo: el control (no se contacta) y las dos ramas */}
      <Paso n={2}>
        <Banda x1={xA2} a1={yA + ALTO * k} b1={yA + LISTA * k} x2={xB} a2={yB} b2={yB + RESTO * k}
               fill={FIN_GRIS} opacidad={0.3} />
        <Banda x1={xB2} a1={yB} b1={yB + CONTROL * k} x2={xD} a2={gCtl.y} b2={gCtl.y + gCtl.alto}
               fill={ACC} opacidad={0.75} />
        <Banda x1={xB2} a1={yB + CONTROL * k} b1={yB + (CONTROL + CON) * k} x2={xD} a2={gCon.y} b2={gCon.y + gCon.alto}
               fill={FIN_GRIS} opacidad={0.45} />
        <Banda x1={xB2} a1={yB + (CONTROL + CON) * k} b1={yB + RESTO * k} x2={xD} a2={gSin.y} b2={gSin.y + gSin.alto}
               fill={FIN_GRIS} opacidad={0.45} />
        <Nodo u={u} x={xB} y={yB} nw={nw} alto={RESTO * k} />
        <text x={xB + nw / 2} y={yB - 14 * u} fontSize={fNom} fontWeight={700} fill={INK}
              textAnchor="middle">{G.sorteo}</text>
        <Nodo u={u} x={xD} y={gCtl.y} nw={nw} alto={gCtl.alto} foco />
        <Rotulo x={xEtq} yc={centro(gCtl)} u={u} {...ROT.control} />
        <Nodo u={u} x={xD} y={gCon.y} nw={nw} alto={gCon.alto} />
        <Rotulo x={xEtq} yc={centro(gCon)} u={u} {...ROT.con} />
        <Nodo u={u} x={xD} y={gSin.y} nw={nw} alto={gSin.alto} />
        <Rotulo x={xEtq} yc={centro(gSin)} u={u} {...ROT.sin} />
      </Paso>

      {/* 3 · a los 90 días, cada rama se compara con el control */}
      <Paso n={3}>
        <LlaveComp u={u} x={xLlave} y1={gCtl.y} y2={yBot} />
        <text x={xLlave + 30 * u} y={yComp} fontSize={fComp} fontWeight={700} fill={INK}
              dominantBaseline="hanging">{T.compara.cuando}</text>
        <Renglones lineas={lineasComp} x={xLlave + 30 * u} y={yComp + fComp * 1.2 + 8 * u} f={fQue} inter={1.3} />
      </Paso>
    </svg>
  )
}

export default function V06Control() {
  return (
    <Vista id={ID}
           items={[{ clave: 'control', valor: fijo(CONTROL) }]}
           cifras={[pct(A['G49.alto_valor'].valor, 0)]}>
      {({ w, h }) => <Flujo w={w} h={h} />}
    </Vista>
  )
}
