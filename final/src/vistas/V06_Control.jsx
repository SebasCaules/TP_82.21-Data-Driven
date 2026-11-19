// V06 · Cómo se mide (modelo, Francisco C.). Cómo se reparte la lista de un mes en el piloto: el 20 % de mayor
// facturación se contacta entero; del resto se sortean el control (en --acc: es lo que permite medir) y las dos ramas, y a
// los 90 días cada rama se compara con el control.
// Flujo de izquierda a derecha con bandas de alto proporcional a los clientes de la lista de muestra (K16, K17, K18 y
// G49.control_mes, que suman G49.lista_mes): un solo factor k para todas, así cada banda mide lo que mide. En pantalla,
// solo las cifras que dice el orador: 500 (la lista), 15 % (en el nombre de la rama), 100 (el control) y 90 días (la
// comparación); el 20 % va en la conclusión y no junto a su banda, que mide un tercio de la lista. Los conteos de la
// muestra no se escriben: solo dan el alto de las bandas. Sin leyenda: cada nodo lleva su rótulo y el único color es el
// del control.
// (19/11, fase 10, spec 4 V06: «que arranque en el medio los 500 contactables y pase una se corra eso a la izquierda y se
// abra la rama del 20% y la otra rama todavia sin datos y un pase mas y ahi aparecen las 3 ramas con un estilo mucho mas
// estetico») Tres pasos, en el orden de las notas:
//   1 los 500 contactables solos, grandes, en el centro del lienzo;
//   2 el bloque se corre a la izquierda (Anima «corre») y se abren dos bandas (Anima «revela-x»): la de mayor facturación,
//     con su rótulo, y la del resto, que llega al nodo del sorteo sin rótulo;
//   3 el resto se abre en las tres ramas (control en acento, con descuento, sin descuento), con sus rótulos de a uno, y
//     entra la comparación a los 90 días. Mayor facturación queda apagada (ya se dijo y no entra en la comparación).
// Nada queda en boceto: lo que no llegó no se ve (Paso oculto), porque la composición del paso 1 no es la del final.
// Estilo: bandas con curvas de un solo arco, separadas por un filo blanco; la del control pasa del gris al acento.

import { useId } from 'react'
import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { ACC, CTX, EJE, FIN_GRIS, INK, SUP, Anima, Paso, Renglones, ancho, rectRedondo, tam, useU } from '../svg.jsx'
import { escalonado, usePaso } from '../pasos.js'

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

/** Parte del alto del lienzo que ocupa el flujo (la herramienta pide entre el 70 % y el 95 %). */
const LLENA = 0.86
/** Opacidad de las bandas grises; la del control va del gris (GRIS_DESDE) al acento (ACC_HASTA). */
const OP_BANDA = 0.34
const GRIS_DESDE = 0.34
const ACC_HASTA = 0.9

// ---------------------------------------------------------------- piezas propias

/** Borde de una banda: la curva de (x1, a) a (x2, b), un solo arco con tangentes horizontales en las dos puntas. */
const curva = (x1, a, x2, b) => {
  const xm = (x1 + x2) / 2
  return `C${xm} ${a} ${xm} ${b} ${x2} ${b}`
}

/** Banda de un flujo: de la cara derecha de un nodo (x1, de a1 a b1) a la izquierda de otro (x2, de a2 a b2). */
function Banda({ x1, a1, b1, x2, a2, b2, fill, opacidad = 1 }) {
  const d = `M${x1} ${a1} ${curva(x1, a1, x2, a2)} L${x2} ${b2} ${curva(x2, b2, x1, b1)} Z`
  return <path d={d} fill={fill} fillOpacity={opacidad} />
}

/** Filo blanco sobre el borde compartido de dos bandas vecinas (de la cara de un nodo a la del otro). */
function Filo({ u, x1, a, x2, b }) {
  return <path d={`M${x1} ${a} ${curva(x1, a, x2, b)}`} fill="none" stroke={SUP} strokeWidth={2.5 * u} />
}

/** Nodo: una barra vertical angosta con las puntas redondeadas, en gris o, la del control, en acento. */
function Nodo({ u, x, y, nw, alto, foco = false }) {
  return <path d={rectRedondo(x, y, nw, alto, 5 * u, 'todos')} fill={foco ? ACC : FIN_GRIS} />
}

/** Rótulo de dos renglones centrado en yc: el nombre (con una cifra grande delante, si la hay) y debajo lo que se hace. */
function Rotulo({ x, yc, u, cifra, nombre, accion, foco = false }) {
  const fC = tam(36, u), fN = tam('val', u), fA = tam(24, u)
  const a1 = (cifra ? fC : fN) * 1.1
  const y0 = yc - (a1 + 6 * u + fA * 1.1) / 2
  return (
    <g>
      <text x={x} y={y0 + a1 / 2} fontSize={fN} fontWeight={700} fill={INK} dominantBaseline="central">
        {cifra && <tspan fontSize={fC}>{cifra}</tspan>}
        <tspan fontSize={fN} dx={cifra ? 0.3 * fN : undefined}>{nombre}</tspan>
      </text>
      <text x={x} y={y0 + a1 + 6 * u} fontSize={fA} fontWeight={foco ? 600 : 400} fill={foco ? INK : CTX}
            dominantBaseline="hanging">{accion}</text>
    </g>
  )
}

/** Ancho de un Rótulo (el renglón más largo). */
function anchoRotulo(u, { cifra, nombre, accion }) {
  const fC = tam(36, u), fN = tam('val', u), fA = tam(24, u)
  const l1 = (cifra ? ancho(cifra, fC, 700) + 0.3 * fN : 0) + ancho(nombre, fN, 700)
  return Math.max(l1, ancho(accion, fA, 400))
}

/** Medidas del rótulo de la lista: la cifra grande y, debajo, el nombre y lo que es, alineados a la derecha. */
function medidasLista(u) {
  const fC = tam(60, u), fN = tam('val', u), fA = tam(24, u)
  const alto = fC * 0.74 + 16 * u + fN * 0.74 + 12 * u + fA * 0.74
  const w = Math.max(ancho(fijo(LISTA), fC, 700), ancho(G.lista, fN, 700), ancho(G.lista_accion, fA, 400))
  return { fC, fN, fA, alto, w }
}

/** El rótulo de la lista, a la izquierda de x (borde derecho) y centrado en yc. */
function RotuloLista({ x, yc, u }) {
  const { fC, fN, fA, alto } = medidasLista(u)
  const y1 = yc - alto / 2 + fC * 0.74
  const y2 = y1 + 16 * u + fN * 0.74
  const y3 = y2 + 12 * u + fA * 0.74
  return (
    <g>
      <text x={x} y={y1} fontSize={fC} fontWeight={700} fill={INK} textAnchor="end">{fijo(LISTA)}</text>
      <text x={x} y={y2} fontSize={fN} fontWeight={700} fill={INK} textAnchor="end">{G.lista}</text>
      <text x={x} y={y3} fontSize={fA} fill={CTX} textAnchor="end">{G.lista_accion}</text>
    </g>
  )
}

/** Llave de la comparación, de y1 a y2 sobre x, con los codos redondeados y el pico hacia la derecha en el centro. */
function LlaveComp({ u, x, y1, y2 }) {
  const d = 14 * u, r = 12 * u
  const ym = (y1 + y2) / 2
  const p = `M${x - d} ${y1} Q${x} ${y1} ${x} ${y1 + r} V${ym - r} Q${x} ${ym} ${x + d} ${ym}`
    + ` Q${x} ${ym} ${x} ${ym + r} V${y2 - r} Q${x} ${y2} ${x - d} ${y2}`
  return <path d={p} fill="none" stroke={EJE} strokeWidth={2.5 * u} strokeLinecap="round" strokeLinejoin="round" />
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
  const paso = usePaso()
  const idGrad = `v06-acc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const fNom = tam('val', u)
  const fComp = tam(34, u)
  const fQue = tam(26, u)
  const nw = 20 * u
  const nwL = 26 * u                // la lista, un poco más ancha: es el bloque del que sale todo

  const ROT = {
    alto: { nombre: G.alto, accion: G.alto_accion },
    control: { cifra: fijo(CONTROL), nombre: G.control, accion: G.control_accion, foco: true },
    con: { nombre: G.con, accion: G.rama_accion },
    sin: { nombre: G.sin, accion: G.rama_accion },
  }

  // vertical: el flujo ocupa LLENA del alto, centrado
  const total = LLENA * h
  const yT = (h - total) / 2
  const yBot = yT + total
  const g1 = 84 * u                 // entre mayor facturación y los sorteados: aire para el rótulo del sorteo
  const g2 = 30 * u                 // entre los tres sorteados
  const k = (total - g1 - 2 * g2) / LISTA

  // horizontal: rótulo de la lista | lista | banda | sorteo | banda | grupos | rótulos | llave | comparación
  const gap = 24 * u
  const ml = medidasLista(u)
  const anchoEtq = Math.max(...['alto', 'control', 'con', 'sin'].map((c) => anchoRotulo(u, ROT[c])))
  const anchoComp = Math.max(ancho(T.compara.cuando, fComp, 700), 270 * u)
  const lineasComp = parejos(T.compara.que, anchoComp, fQue, 400)
  const sepLlave = 40 * u, sepComp = 30 * u
  const xA = ml.w + gap
  const xD = w - (anchoComp + sepComp + sepLlave + anchoEtq + gap + nw)
  const xA2 = xA + nwL
  const xB = xA2 + (xD - xA2) * 0.5 - nw / 2
  const xB2 = xB + nw
  const xEtq = xD + nw + gap
  const xLlave = xEtq + anchoEtq + sepLlave

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
  const centro = (g) => g.y + g.alto / 2

  // paso 1: el bloque de la lista (rótulo y nodo) centrado en el lienzo; desde el paso 2, contra la izquierda
  const dxCentro = w / 2 - xA2 / 2
  const corrido = paso >= 2 ? undefined : `translate(${dxCentro} 0)`

  const altoComp = fComp * 1.2 + 10 * u + lineasComp.length * fQue * 1.3
  const yComp = (gCtl.y + yBot) / 2 - altoComp / 2
  const xComp = xLlave + sepComp

  // los bordes de las bandas
  const lA = yA + ALTO * k                    // en la lista, entre mayor facturación y el resto
  const sC = yB + CONTROL * k                 // en el sorteo, entre el control y la rama con descuento
  const sS = yB + (CONTROL + CON) * k         // en el sorteo, entre las dos ramas

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <defs>
        <linearGradient id={idGrad} gradientUnits="userSpaceOnUse" x1={xB2} y1={0} x2={xD} y2={0}>
          <stop offset="0" style={{ stopColor: FIN_GRIS, stopOpacity: GRIS_DESDE }} />
          <stop offset="1" style={{ stopColor: ACC, stopOpacity: ACC_HASTA }} />
        </linearGradient>
      </defs>

      {/* 2 · las dos bandas que salen de la lista: mayor facturación (se apaga en el paso 3) y el resto, hasta el
          sorteo. Se descubren juntas de izquierda a derecha cuando el bloque termina de correrse. */}
      <Paso n={2} oculto entrada={false}>
        <Anima n={2} efecto="revela-x" dur={600} style={{ '--fin-anima-base': '380ms' }}>
          <Paso n={1} hasta={2}>
            <Banda x1={xA2} a1={yA} b1={lA} x2={xD} a2={gAlto.y} b2={gAlto.y + gAlto.alto}
                   fill={FIN_GRIS} opacidad={OP_BANDA} />
            <Nodo u={u} x={xD} y={gAlto.y} nw={nw} alto={gAlto.alto} />
          </Paso>
          <Banda x1={xA2} a1={lA} b1={yA + LISTA * k} x2={xB} a2={yB} b2={yB + RESTO * k}
                 fill={FIN_GRIS} opacidad={OP_BANDA} />
          <Filo u={u} x1={xA2} a={lA} x2={xB} b={yB} />
          <Nodo u={u} x={xB} y={yB} nw={nw} alto={RESTO * k} />
        </Anima>
        <Paso n={1} hasta={2}>
          <Anima n={2} efecto="funde" dur={300} style={{ '--fin-anima-base': '880ms' }}>
            <Rotulo x={xEtq} yc={centro(gAlto)} u={u} {...ROT.alto} />
          </Anima>
        </Paso>
      </Paso>

      {/* 3 · el resto se abre en el control y las dos ramas; los rótulos entran de a uno y al final la comparación */}
      <Paso n={3} oculto entrada={false}>
        <Anima n={3} efecto="funde" dur={300}>
          <text x={xB + nw / 2} y={yB - 18 * u} fontSize={fNom} fontWeight={700} fill={INK}
                textAnchor="middle">{G.sorteo}</text>
        </Anima>
        <Anima n={3} efecto="revela-x" dur={550} style={{ '--fin-anima-base': '120ms' }}>
          <Banda x1={xB2} a1={yB} b1={sC} x2={xD} a2={gCtl.y} b2={gCtl.y + gCtl.alto} fill={`url(#${idGrad})`} />
          <Banda x1={xB2} a1={sC} b1={sS} x2={xD} a2={gCon.y} b2={gCon.y + gCon.alto}
                 fill={FIN_GRIS} opacidad={OP_BANDA} />
          <Banda x1={xB2} a1={sS} b1={yB + RESTO * k} x2={xD} a2={gSin.y} b2={gSin.y + gSin.alto}
                 fill={FIN_GRIS} opacidad={OP_BANDA} />
          <Filo u={u} x1={xB2} a={sC} x2={xD} b={gCtl.y + gCtl.alto} />
          <Filo u={u} x1={xB2} a={sC} x2={xD} b={gCon.y} />
          <Filo u={u} x1={xB2} a={sS} x2={xD} b={gCon.y + gCon.alto} />
          <Filo u={u} x1={xB2} a={sS} x2={xD} b={gSin.y} />
          <Nodo u={u} x={xD} y={gCtl.y} nw={nw} alto={gCtl.alto} foco />
          <Nodo u={u} x={xD} y={gCon.y} nw={nw} alto={gCon.alto} />
          <Nodo u={u} x={xD} y={gSin.y} nw={nw} alto={gSin.alto} />
        </Anima>
        <g style={{ ...escalonado(3, { total: 520, dur: 300 }), '--fin-anima-base': '480ms' }}>
          {[['control', gCtl], ['con', gCon], ['sin', gSin]].map(([c, g], i) => (
            <Anima key={c} n={3} efecto="funde" i={i}>
              <Rotulo x={xEtq} yc={centro(g)} u={u} {...ROT[c]} />
            </Anima>
          ))}
        </g>
        <Anima n={3} efecto="aparece" dur={320} style={{ '--fin-anima-base': '860ms' }}>
          <LlaveComp u={u} x={xLlave} y1={gCtl.y} y2={gSin.y + gSin.alto} />
          <text x={xComp} y={yComp} fontSize={fComp} fontWeight={700} fill={INK}
                dominantBaseline="hanging">{T.compara.cuando}</text>
          <Renglones lineas={lineasComp} x={xComp} y={yComp + fComp * 1.2 + 10 * u} f={fQue} inter={1.3} />
        </Anima>
      </Paso>

      {/* 1 · la lista del mes: el bloque del que sale todo. Entra al llegar a la vista y en el paso 2 se corre a la
          izquierda. Va al final para quedar encima del arranque de las bandas. */}
      <Anima n={1} efecto="funde" dur={420}>
        <Anima n={2} efecto="corre" dx={dxCentro} dur={520}>
          <g transform={corrido}>
            <RotuloLista x={xA - gap} yc={yA + (LISTA * k) / 2} u={u} />
            <Nodo u={u} x={xA} y={yA} nw={nwL} alto={LISTA * k} />
          </g>
        </Anima>
      </Anima>
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
