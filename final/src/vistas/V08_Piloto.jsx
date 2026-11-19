// V08 · Qué cuesta el piloto (economía, Juan Manuel R.). El piloto mínimo (G64) como una sola barra partida en sus
// cinco líneas (G64.medicion, .planilla, .taller, .legal, .contingencia), de mayor a menor, que suma el total.
// (18/11, fase 8, spec 2 V08) Reemplaza las barras sueltas (BarrasFin) del intermedio: «hay un total y cada parte ocupa
// una porción».
// (19/11, fase 9, spec 4 V08: «Así pero mucho más sobrio, sin tanto texto, lo mínimo indispensable») Cada tramo lleva
// solo su monto y su nombre corto; salen «qué compra», la leyenda (la medición se nombra sola) y el punteado de la
// contingencia, que es un tramo gris más. Arriba, la llave del total; debajo, el eje en dólares sin repetir el total. En la
// banda, solo el piloto (G64): las horas de Marketing salen de la pantalla (las dice el orador; informe, 23.2 y 23.6).
// (19/11, fase 10, spec 4 V08: «que se vaya llenando la barra de total paso a paso») Cinco pasos, uno por tramo. La barra
// del total arranca como boceto: su pista (relleno claro y contorno) con el eje en dólares, los dos fuera de todo Paso.
// Cada paso suma un tramo, de mayor a menor, que se descubre de izquierda a derecha con su monto y su nombre (Paso oculto
// sin entrada y Anima 'revela-x', así el texto no se deforma). La medición, el primero, en acento desde el paso 1. En el
// último, con la contingencia, la barra queda llena y entran la llave y el rótulo del total, cuando el tramo terminó.

import Vista from '../Plantilla.jsx'
import { DF } from '../datos_final.js'
import { textosDe } from '../textos.js'
import { fijo, usd } from '../../../e3/src/formato.js'
import {
  ACC, FIN_GRIS, INK, SUP, CTX, PISTA, REALCE, Anima, EjeX, Guia, LlaveH, Paso, TRAZO, altoEjeX, ancho, envolver,
  escalaLinda, tam, useU,
} from '../svg.jsx'

const ID = 'V08'
const A = DF.anclas
const T = textosDe(ID)
const B = T.barras
const P = T.partida
const TOTAL = A.G64.valor

// Las cinco líneas del costo, de mayor a menor (a igual monto, en este orden). foco: la que va en acento.
const LINEAS = [
  { clave: 'medicion', ancla: 'G64.medicion', foco: true },
  { clave: 'planilla', ancla: 'G64.planilla' },
  { clave: 'taller', ancla: 'G64.taller' },
  { clave: 'legal', ancla: 'G64.legal' },
  { clave: 'contingencia', ancla: 'G64.contingencia' },
]
  .map((l, i) => ({ ...l, i, valor: A[l.ancla].valor, nombre: B[l.clave] }))
  .sort((a, b) => b.valor - a.valor || a.i - b.i)

const SUMA = LINEAS.reduce((s, l) => s + l.valor, 0)
if (Math.abs(SUMA - TOTAL) > 0.5) {
  throw new Error(`V08: las líneas del piloto suman ${SUMA} y G64 dice ${TOTAL}; la barra no puede sumar el total`)
}

// un paso por tramo: el último completa la barra
export const meta = { id: ID, pasos: 5 }
if (meta.pasos !== LINEAS.length) {
  throw new Error(`V08: meta.pasos (${meta.pasos}) tiene que ser uno por tramo (${LINEAS.length})`)
}

/** Marcas del eje: las redondas hasta el total, sin el total (lo dice el rótulo de arriba, en el último paso). */
const MARCAS = escalaLinda(TOTAL).marcas.filter((v) => v < TOTAL)

/** Lo que tarda en descubrirse cada tramo (ms): algo más el más largo, para que la barra se llene a un ritmo parejo. */
const durDe = (valor) => Math.round(300 + (350 * valor) / LINEAS[0].valor)

function Dibujo({ w, h }) {
  const u = useU()
  const f = { monto: tam('valFoco', u), totRot: tam('cat', u), totVal: tam('valFoco', u), eje: tam(23, u) }
  const lh = { monto: 1.15, nombre: 1.2 }
  const hueco = 4 * u
  // a lo ancho: el 0 del eje va centrado en la punta izquierda de la barra
  const x0 = ancho(fijo(0), f.eje, 400) / 2 + 2 * u
  const x1 = w - 2 * u
  const largo = Math.max(0, x1 - x0)
  const xDe = (v) => x0 + (v / TOTAL) * largo

  let acum = 0
  const base = LINEAS.map((l, k) => {
    const xa = xDe(acum)
    acum += l.valor
    const xb = xDe(acum)
    return {
      ...l,
      xi: xa + (k ? hueco / 2 : 0),
      xf: xb - (k < LINEAS.length - 1 ? hueco / 2 : 0),
      monto: usd(l.valor, 0),
    }
  })

  // un solo tamaño de nombre y un solo margen para los cinco tramos: el más grande con el que todos entran (monto en un
  // renglón, nombre en hasta dos). Si ni con 20 u entra alguno, ese va debajo de la barra con una guía.
  const PRUEBAS = [[26, 16], [26, 12], [24, 16], [24, 12], [22, 12], [20, 10]]
  const ajuste = (t, fn, p) => {
    const util = t.xf - t.xi - 2 * p
    const nombre = envolver(t.nombre, util, fn, 600)
    const cabe = util > 0 && ancho(t.monto, f.monto, 700) <= util && nombre.length <= 2
      && nombre.every((r) => ancho(r, fn, 600) <= util + 0.5)
    return { nombre, cabe }
  }
  const elegida = PRUEBAS.find(([n, p]) => base.every((t) => ajuste(t, tam(n, u), p * u).cabe)) ?? PRUEBAS.at(-1)
  const fn = tam(elegida[0], u)
  const pad = elegida[1] * u
  const tramos = base.map((t) => {
    const a = ajuste(t, fn, pad)
    return { ...t, nombre: a.cabe ? a.nombre : [t.nombre], dentro: a.cabe }
  })

  // el bloque de texto (monto y nombre) tiene el alto del nombre más largo: los montos quedan en un renglón
  const renglones = Math.max(1, ...tramos.filter((t) => t.dentro).map((t) => t.nombre.length))
  const altoBloque = f.monto * lh.monto + 6 * u + renglones * fn * lh.nombre
  const fuera = tramos.filter((t) => !t.dentro)
  const altoFuera = fuera.length ? 20 * u + fn * 1.2 + f.monto * 1.15 + 8 * u : 0

  // a lo alto: rótulo del total, llave, barra, (nombres que no entran), eje. Todo tiene su lugar desde el paso 1: nada
  // se corre al avanzar.
  const fijoArriba = f.totVal * 0.8 + 22 * u + 18 * u
  const fijoAbajo = altoFuera + 14 * u + altoEjeX(u, true)
  const hNec = Math.max(altoBloque + 2 * 24 * u, 120 * u)
  // la barra crece con el lienzo hasta que el dibujo ocupa el 75 % del alto, con un tope para que no sea un bloque
  const hB = Math.max(hNec, Math.min(0.75 * h - fijoArriba - fijoAbajo, hNec + Math.max(80 * u, 0.3 * h)))
  const top = Math.max(0, (h - (fijoArriba + hB + fijoAbajo)) / 2)
  const yTot = top + f.totVal * 0.8
  const yLlave = yTot + 22 * u
  const yB = yLlave + 18 * u
  const yMonto = yB + (hB - altoBloque) / 2
  const yNombre = yMonto + f.monto * lh.monto + 6 * u
  const yFuera = yB + hB + 20 * u
  const yEje = yB + hB + altoFuera + 14 * u
  const r = TRAZO.radio * u
  const sw = TRAZO.contorno * u
  // la pista va un píxel por dentro de la barra: al llenarse, los tramos la tapan sin dejar filo
  const ins = sw / 2 + Math.max(1, u)
  const ultimo = LINEAS.length
  const durUltimo = durDe(tramos[ultimo - 1].valor)

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {/* boceto fijo: la pista del total, por dentro de su borde (los tramos la tapan entera al llenarse) */}
      <rect x={x0 + ins} y={yB + ins} width={Math.max(0, largo - 2 * ins)} height={Math.max(0, hB - 2 * ins)} rx={r}
            fill={REALCE} stroke={PISTA} strokeWidth={sw} />

      {/* un tramo por paso, de mayor a menor: se descubre de izquierda a derecha con su monto y su nombre */}
      {tramos.map((t, k) => {
        const color = t.foco ? SUP : INK
        const xc = (t.xi + t.xf) / 2
        const anchoRot = ancho(t.nombre.join(' '), fn, 600)
        const xRot = Math.min(Math.max(xc, x0 + anchoRot / 2), x1 - anchoRot / 2)
        const xAntes = k ? tramos[k - 1].xf : t.xi
        return (
          <Paso key={t.clave} n={k + 1} oculto entrada={false}>
            <title>{`${t.nombre.join(' ')}: ${t.monto}`}</title>
            <Anima n={k + 1} efecto="revela-x" dur={durDe(t.valor)}>
              {/* el hueco con el tramo anterior, del color de la tarjeta: tapa la pista */}
              {k > 0 && <rect x={xAntes} y={yB} width={Math.max(0, t.xi - xAntes)} height={hB} fill={SUP} />}
              <rect x={t.xi} y={yB} width={Math.max(0, t.xf - t.xi)} height={hB} rx={r} fill={t.foco ? ACC : FIN_GRIS} />
              {t.dentro && (
                <g>
                  <text x={t.xi + pad} y={yMonto} fontSize={f.monto} fontWeight={700} fill={color}
                        dominantBaseline="hanging">{t.monto}</text>
                  {t.nombre.map((renglon, i) => (
                    <text key={i} x={t.xi + pad} y={yNombre + i * fn * lh.nombre} fontSize={fn} fontWeight={600}
                          fill={color} dominantBaseline="hanging">{renglon}</text>
                  ))}
                </g>
              )}
              {!t.dentro && (
                <g>
                  <Guia u={u} x1={xc} y1={yB + hB} x2={xc} y2={yFuera - 6 * u} />
                  <text x={xRot} y={yFuera} fontSize={fn} fontWeight={600} fill={INK} textAnchor="middle"
                        dominantBaseline="hanging">{t.nombre.join(' ')}</text>
                  <text x={xRot} y={yFuera + fn * 1.2} fontSize={f.monto} fontWeight={700} fill={INK}
                        textAnchor="middle" dominantBaseline="hanging">{t.monto}</text>
                </g>
              )}
            </Anima>
          </Paso>
        )
      })}

      {/* el total: la llave que abarca la barra es boceto hasta el último paso y se enciende mientras el último tramo
          termina de llenarse (orden: 4 × 100 ms); el rótulo entra cuando la barra ya está llena. Van en dos Paso: el
          escalonado del encendido (orden) y la espera del rótulo (--fin-anima-base) no se mezclan. */}
      <Paso n={ultimo} orden={4}>
        <LlaveH u={u} x1={x0} x2={x1} y={yLlave} lado="arriba" />
      </Paso>
      <Paso n={ultimo} oculto entrada={false}>
        <Anima n={ultimo} efecto="aparece" dur={350} style={{ '--fin-anima-base': `${durUltimo}ms` }}>
          <text x={(x0 + x1) / 2} y={yTot} fontSize={f.totVal} textAnchor="middle">
            <tspan fontSize={f.totRot} fontWeight={600} fill={CTX}>{P.total}</tspan>
            <tspan dx={14 * u} fontSize={f.totVal} fontWeight={700} fill={INK}>{usd(TOTAL, 0)}</tspan>
          </text>
        </Anima>
      </Paso>

      <EjeX u={u} x0={x0} x1={x1} y={yEje} min={0} max={TOTAL} marcas={MARCAS} formato={(v) => fijo(v)}
            titulo={B.eje} />
    </svg>
  )
}

export default function V08Piloto() {
  return (
    <Vista id={ID} items={[{ clave: 'piloto', valor: usd(A.G64.valor) }]} cifras={[]}>
      {({ w, h }) => <Dibujo w={w} h={h} />}
    </Vista>
  )
}
