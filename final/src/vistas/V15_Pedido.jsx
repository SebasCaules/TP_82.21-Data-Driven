// V15 · Lo que pedimos (cierre, Sebastian C.). Lo que se le pide a Casa Óga en la banda (aprobar el piloto mínimo, G64;
// firmar el acuerdo de confidencialidad en la semana del hito 1; la decisión en la semana 28) y, en el gráfico, lo que
// pasa en la semana de la decisión: si una rama llega a su umbral de pase, sigue la operación mínima; si ninguna llega,
// se cierra. La decisión, en --acc. Nada se da por firmado ni aprobado: es lo que se pide. Textos de CF.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { ACC, BORDE, INK, SUP, TINTE, Renglones, Titulo, envolver, letra } from '../svg.jsx'

const ID = 'V15'
const A = DF.anclas
const X = textosDe(ID)
const AR = X.arbol
const SEM_FIN = A['G63.semana_decision'].valor
const SEM_ACUERDO = DF.tablas.plan.hitos.find((h) => h.n === 1).semana

export const meta = { id: ID }

function medir(w, f, k) {
  const flecha = 46 * k
  const bw = (w - 2 * flecha) / 3
  const pad = 0.8 * f
  const caja = (t, peso = 400, extra = 0) => {
    const l = envolver(t, bw - 2 * pad, f * 1.1, peso)
    return { l, alto: 2 * pad + extra + l.length * f * 1.1 * 1.25 }
  }
  const raiz = caja(AR.raiz, 600, f * 1.6)
  const si = caja(AR.si)
  const no = caja(AR.no)
  const siL = caja(AR.si_luego, 600)
  const noL = caja(AR.no_luego, 600)
  const filaAlto = Math.max(si.alto, siL.alto, no.alto, noL.alto)
  const sep = 1.4 * f
  const alto = Math.max(raiz.alto, 2 * filaAlto + sep)
  return { flecha, bw, pad, raiz, si, no, siL, noL, filaAlto, sep, alto }
}

function Caja({ x, y, bw, alto, c, f, pad, peso = 400, fill = SUP, stroke = BORDE, color = INK, ancho = 1 }) {
  return (
    <g>
      <rect x={x} y={y} width={bw} height={alto} fill={fill} stroke={stroke} strokeWidth={ancho} />
      <Renglones lineas={c.l} x={x + pad} y={y + (alto - c.l.length * f * 1.1 * 1.25) / 2} f={f * 1.1} peso={peso} color={color} />
    </g>
  )
}

function Dibujo({ w, h, k }) {
  const f = letra((x) => medir(w, x, k).alto, h, 15 * k)
  const m = medir(w, f, k)
  const y0 = Math.max(0, (h - m.alto) / 2)
  const ySi = y0
  const yNo = y0 + m.filaAlto + m.sep
  const yR = y0 + (m.alto - m.raiz.alto) / 2
  const x1 = m.bw + m.flecha
  const x2 = 2 * (m.bw + m.flecha)
  const flecha = (xa, ya, xb, yb) => (
    <path d={`M${xa},${ya} C${(xa + xb) / 2},${ya} ${(xa + xb) / 2},${yb} ${xb - 2},${yb} m-${5 * k},-${4 * k} l${5 * k},${4 * k} l-${5 * k},${4 * k}`}
          fill="none" stroke={INK} strokeWidth={1.5} />
  )
  const cS = ySi + m.filaAlto / 2
  const cN = yNo + m.filaAlto / 2
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${X.mide}: ${AR.raiz}. ${AR.si}: ${AR.si_luego}. ${AR.no}: ${AR.no_luego}.`}>
      <rect x={0} y={yR} width={m.bw} height={m.raiz.alto} fill={TINTE} stroke={ACC} strokeWidth={1.5} />
      <Titulo x={m.pad} y={yR + m.pad + f} f={f} texto={`${AR.semana} ${fijo(SEM_FIN)}`} color={ACC} max={m.bw - 2 * m.pad} />
      <Renglones lineas={m.raiz.l} x={m.pad} y={yR + m.pad + f * 1.6} f={f * 1.1} peso={600} />
      {flecha(m.bw, yR + m.raiz.alto / 2, x1, cS)}
      {flecha(m.bw, yR + m.raiz.alto / 2, x1, cN)}
      <Caja x={x1} y={ySi} bw={m.bw} alto={m.filaAlto} c={m.si} f={f} pad={m.pad} />
      <Caja x={x1} y={yNo} bw={m.bw} alto={m.filaAlto} c={m.no} f={f} pad={m.pad} />
      {flecha(x1 + m.bw, cS, x2, cS)}
      {flecha(x1 + m.bw, cN, x2, cN)}
      <Caja x={x2} y={ySi} bw={m.bw} alto={m.filaAlto} c={m.siL} f={f} pad={m.pad} peso={600} />
      <Caja x={x2} y={yNo} bw={m.bw} alto={m.filaAlto} c={m.noL} f={f} pad={m.pad} peso={600} />
    </svg>
  )
}

export default function V15Pedido() {
  const k = useEscalaTexto()
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'acuerdo', valor: fijo(SEM_ACUERDO) },
             { clave: 'decide', valor: fijo(SEM_FIN) },
           ]}
           cifras={[usd(A.G64.valor), usd(A.G39.valor)]}>
      {({ w, h }) => <Dibujo w={w} h={h} k={k} />}
    </Vista>
  )
}
