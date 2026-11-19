// V08 · Qué cuesta el piloto (economía, Juan Manuel R.). El piloto mínimo (G64) como una sola barra partida en sus
// cinco líneas (G64.medicion, .planilla, .taller, .legal, .contingencia), de mayor a menor, que suma el total: la
// medición en --acc, que es para lo que se hace el piloto; planilla, taller y legal en gris; la contingencia, que es una
// reserva sobre las otras cuatro, con contorno punteado. Cada tramo lleva adentro su monto, su nombre y qué compra (si no
// entra, el nombre y el monto van debajo con una guía). Arriba, la llave del total; debajo, el eje en dólares de 0 al
// total, y la leyenda de los tres rellenos. En la banda, el piloto (G64) y las horas de Marketing (G64.horas_marketing).
// (18/11, fase 8, spec 2 V08) Reemplaza las barras sueltas (BarrasFin) del intermedio: «hay un total y cada parte ocupa
// una porción».

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import {
  CTX, INK, SUP, EjeX, Guia, Leyenda, LlaveH, altoEjeX, ancho, duro, envolver, escalaLinda, marcaFlujo, tam, useU,
} from '../svg.jsx'

const ID = 'V08'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras
const P = T.partida
const TOTAL = A.G64.valor

// Las cinco líneas del costo, de mayor a menor (a igual monto, en este orden). tipo: el estado de FLUJO que da el relleno.
const LINEAS = [
  { clave: 'medicion', ancla: 'G64.medicion', tipo: 'hecho' },
  { clave: 'planilla', ancla: 'G64.planilla', tipo: 'contexto' },
  { clave: 'taller', ancla: 'G64.taller', tipo: 'contexto' },
  { clave: 'legal', ancla: 'G64.legal', tipo: 'contexto' },
  { clave: 'contingencia', ancla: 'G64.contingencia', tipo: 'condicional' },
]
  .map((l, i) => ({ ...l, i, valor: A[l.ancla].valor, nombre: B[l.clave], desc: duro(P.desc[l.clave]) }))
  .sort((a, b) => b.valor - a.valor || a.i - b.i)

const SUMA = LINEAS.reduce((s, l) => s + l.valor, 0)
if (Math.abs(SUMA - TOTAL) > 0.5) {
  throw new Error(`V08: las líneas del piloto suman ${SUMA} y G64 dice ${TOTAL}; la barra no puede sumar el total`)
}

export const meta = { id: ID }

const LEYENDA = [
  { marca: 'hecho', texto: P.ley.foco },
  { marca: 'contexto', texto: P.ley.resto },
  { marca: 'condicional', texto: P.ley.reserva },
]

/** Marcas del eje: las redondas por debajo del total que no pisan su número, y el total al final. */
function marcasEje(u, largo) {
  const f = tam(23, u)
  const xDe = (v) => (v / TOTAL) * largo
  const anchoNum = (v) => ancho(fijo(v), f, 400)
  const redondas = escalaLinda(TOTAL).marcas.filter((v) => v < TOTAL)
  const libres = redondas.filter((v) => xDe(TOTAL) - xDe(v) >= (anchoNum(v) + anchoNum(TOTAL)) / 2 + 16 * u)
  return [...libres, TOTAL]
}

function Dibujo({ w, h }) {
  const u = useU()
  const f = {
    ley: tam(24, u),
    monto: tam('valFoco', u),
    nombre: tam(24, u),
    desc: tam(22, u),
    totRot: tam('cat', u),
    totVal: tam('valFoco', u),
    eje: tam(23, u),
  }
  const lh = { monto: 1.15, nombre: 1.2, desc: 1.25 }
  const pad = 16 * u
  const hueco = 4 * u
  // a lo ancho: el 0 y el total del eje van centrados en las puntas de la barra
  const x0 = ancho(fijo(0), f.eje, 400) / 2 + 2 * u
  const x1 = w - ancho(fijo(TOTAL), f.eje, 400) / 2 - 2 * u
  const largo = Math.max(0, x1 - x0)
  const xDe = (v) => x0 + (v / TOTAL) * largo

  // cada tramo: su lugar y qué texto entra adentro (monto, nombre en hasta 2 renglones y qué compra en hasta 3). Un
  // tramo angosto prueba primero con menos margen a los lados y después con el nombre más chico (nunca menos de 20 u); si no
  // entra igual, el nombre y el monto van debajo de la barra con una guía.
  const PRUEBAS = [[pad, f.nombre], [10 * u, f.nombre], [10 * u, tam(22, u)], [10 * u, tam(20, u)]]
  let acum = 0
  const tramos = LINEAS.map((l, k) => {
    const xa = xDe(acum)
    acum += l.valor
    const xb = xDe(acum)
    const xi = xa + (k ? hueco / 2 : 0)
    const xf = xb - (k < LINEAS.length - 1 ? hueco / 2 : 0)
    const monto = usd(l.valor, 0)
    let r = null
    for (const [p, fn] of PRUEBAS) {
      const util = xf - xi - 2 * p
      const nombre = envolver(l.nombre, util, fn, 600)
      const cabe = (ls, fz, peso) => ls.every((t) => ancho(t, fz, peso) <= util + 0.5)
      if (util > 0 && ancho(monto, f.monto, 700) <= util && nombre.length <= 2 && cabe(nombre, fn, 600)) {
        const desc = envolver(l.desc, util, f.desc, 400)
        r = { p, fn, nombre, desc, dentro: true, conDesc: desc.length <= 3 && cabe(desc, f.desc, 400) }
        break
      }
    }
    r ??= { p: pad, fn: f.nombre, nombre: [l.nombre], desc: [], dentro: false, conDesc: false }
    return { ...l, xi, xf, monto, ...r }
  })
  const altoTexto = (t, desc) => pad + f.monto * lh.monto + 6 * u + t.nombre.length * t.fn * lh.nombre
    + (desc && t.conDesc ? 10 * u + t.desc.length * f.desc * lh.desc : 0) + pad
  const fuera = tramos.filter((t) => !t.dentro)
  const altoFuera = fuera.length ? 20 * u + f.nombre * 1.2 + f.monto * 1.15 + 8 * u : 0

  // a lo alto: leyenda, rótulo del total, llave, barra, (nombres que no entran), eje
  const fijoArriba = f.ley + 36 * u + f.totVal * 0.8 + 22 * u + 18 * u
  const fijoAbajo = altoFuera + 14 * u + altoEjeX(u, true)
  const necesita = (desc) => Math.max(...tramos.filter((t) => t.dentro).map((t) => altoTexto(t, desc)), 120 * u)
  let conDesc = true
  let hNec = necesita(true)
  if (fijoArriba + hNec + fijoAbajo > 0.95 * h) {
    conDesc = false
    hNec = necesita(false)
  }
  // la barra crece con el lienzo hasta el 88 % del alto, con un tope para que no se vuelva un bloque (en 4:3)
  const hB = Math.max(hNec, Math.min(0.88 * h - fijoArriba - fijoAbajo, hNec + Math.max(60 * u, 0.15 * h)))
  const yTexto = (hB - hNec) / 2   // el bloque más alto queda centrado en la barra; los demás arrancan a su altura
  const top = Math.max(0, (h - (fijoArriba + hB + fijoAbajo)) / 2)
  const yLey = top + f.ley / 2
  const yTot = top + f.ley + 36 * u + f.totVal * 0.8
  const yLlave = yTot + 22 * u
  const yB = yLlave + 18 * u
  const yFuera = yB + hB + 20 * u
  const yEje = yB + hB + altoFuera + 14 * u

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <Leyenda u={u} x={x0} y={yLey} items={LEYENDA} />

      {/* el total, con la llave que abarca la barra entera */}
      <text x={(x0 + x1) / 2} y={yTot} fontSize={f.totVal} textAnchor="middle">
        <tspan fontSize={f.totRot} fontWeight={600} fill={CTX}>{P.total}</tspan>
        <tspan dx={14 * u} fontSize={f.totVal} fontWeight={700} fill={INK}>{usd(TOTAL, 0)}</tspan>
      </text>
      <LlaveH u={u} x1={x0} x2={x1} y={yLlave} lado="arriba" />

      {tramos.map((t) => {
        const m = marcaFlujo(t.tipo, u)
        const color = m.texto
        const colorDesc = t.tipo === 'condicional' ? CTX : color
        const xt = t.xi + t.p   // el margen de arriba es el mismo en todos: los montos quedan en un renglón
        const yMonto = yB + yTexto + pad
        const yNombre = yMonto + f.monto * lh.monto + 6 * u
        const yDesc = yNombre + t.nombre.length * t.fn * lh.nombre + 10 * u
        const xc = (t.xi + t.xf) / 2
        const xRot = Math.min(Math.max(xc, x0 + ancho(t.nombre.join(' '), f.nombre, 600) / 2),
          x1 - ancho(t.nombre.join(' '), f.nombre, 600) / 2)
        return (
          <g key={t.clave}>
            <title>{`${t.nombre.join(' ')}: ${t.monto}`}</title>
            <rect x={t.xi + m.trazo / 2} y={yB + m.trazo / 2} width={Math.max(0, t.xf - t.xi - m.trazo)}
                  height={Math.max(0, hB - m.trazo)} rx={4 * u} {...m.attrs} />
            {t.dentro && (
              <g>
                <text x={xt} y={yMonto} fontSize={f.monto} fontWeight={700} fill={color}
                      dominantBaseline="hanging">{t.monto}</text>
                {t.nombre.map((r, i) => (
                  <text key={i} x={xt} y={yNombre + i * t.fn * lh.nombre} fontSize={t.fn} fontWeight={600}
                        fill={color} dominantBaseline="hanging">{r}</text>
                ))}
                {conDesc && t.conDesc && t.desc.map((r, i) => (
                  <text key={`d${i}`} x={xt} y={yDesc + i * f.desc * lh.desc} fontSize={f.desc} fontWeight={400}
                        fill={colorDesc} dominantBaseline="hanging">{r}</text>
                ))}
              </g>
            )}
            {!t.dentro && (
              <g>
                <Guia u={u} x1={xc} y1={yB + hB} x2={xc} y2={yFuera - 6 * u} />
                <text x={xRot} y={yFuera} fontSize={f.nombre} fontWeight={600} fill={INK} textAnchor="middle"
                      dominantBaseline="hanging">{t.nombre.join(' ')}</text>
                <text x={xRot} y={yFuera + f.nombre * 1.2} fontSize={f.monto} fontWeight={700} fill={INK}
                      textAnchor="middle" dominantBaseline="hanging">{t.monto}</text>
              </g>
            )}
          </g>
        )
      })}

      <EjeX u={u} x0={x0} x1={x1} y={yEje} min={0} max={TOTAL} marcas={marcasEje(u, largo)} formato={(v) => fijo(v)}
            titulo={P.eje} />
    </svg>
  )
}

export default function V08Piloto() {
  return (
    <Vista id={ID}
           items={[
             { clave: 'piloto', valor: usd(A.G64.valor) },
             { clave: 'horas', valor: fijo(A['G64.horas_marketing'].valor) },
           ]}
           cifras={[]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
