// V10 · ¿Qué está bien y qué nos deja? (01/11, W5; diapositiva 15 de C3). Cierra la corrección al Grupo 5. La
// pregunta del pedido («¿Qué hacen bien y qué nos llevamos?») pasaba a dos renglones a 1366 × 768 con la fuente de la
// planilla al lado; esta es la única de las probadas que entra en un renglón de 1152 × 640 a 1920 × 1080.
//
// - Banda: la central, las secciones en «Completo» sobre el total (lo que cierra, en --acc); al lado, cuántas cosas
//   destaca la planilla. Ni una ni otra repite la central de la vista 9.
// - Decisión: «E-CRU · sin cambios»: el cruce de sus cifras con nuestro registro no cambia ninguna nuestra
//   (_build/E/cruce.md: donde difieren, cambia la base o el target).
// - Debajo, a la izquierda, lo que hacen bien (las tres de la planilla, con su sección); a la derecha, el gráfico: por
//   qué los dos grupos concluyen distinto. Su modelo le gana a una regla que marca sí o no (los marcados quedan
//   empatados); la nuestra ordena a cada cliente por los días que le faltan para cruzar su umbral (cruce.md, última
//   fila). Es un esquema, sin datos: cada celda es un cliente de la lista, en el orden en que se lo contacta.
// Ningún texto ni cifra de la planilla escrito acá: salen de D3.correccion (correcciones.json de _build/E/).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { sinCortes } from '../texto.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V10.css'

const CO = D3.correccion
const T = CO.total

const DECISION = decision('E-CRU', {
  llano_corto: 'Ninguna cifra nuestra cambia con el cruce',
  llano: 'Cruzamos las cifras del Grupo 5 con nuestro registro: ninguna nuestra está mal. Donde difieren, cambia la '
    + 'base (envíos con o sin duplicados) o el target, o la cifra viene de una respuesta de Casa Óga que no tenemos.',
  decision: 'nuestras cifras quedan como están',
  justificacion: 'su modelo se mide contra una regla que marca sí o no; la nuestra ordena por días para cruzar el '
    + 'umbral. No es un error suyo: explica por qué los dos grupos concluyen distinto.',
})

const CONCLUSION = 'Concluimos distinto porque las reglas son distintas, no por un error'

export const meta = { id: 'V10', dc: 'E-CRU' }

// ---------------------------------------------------------------- el gráfico: cómo ordena la lista cada regla

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const CTX_R = 'var(--e3-ctx-relleno, #a9b1bf)'
const TINTE = 'var(--e3-tinte, #bccfe2)'
const CONTORNO = 'var(--e3-contorno, #4f5a6e)'

const N = 20          // clientes del esquema
const MARCADOS = 9    // los que su regla marca

const FILAS = [
  { quien: 'Grupo 5', regla: 'Su regla marca sí o no', bajo: 'los marcados quedan empatados: entre ellos, sin orden',
    gana: 'su modelo le gana', propia: false },
  { quien: 'Grupo 2', regla: 'Nuestra regla ordena por días', bajo: 'cada cliente, por los días que le faltan para cruzar su umbral',
    gana: 'nuestro modelo empata', propia: true },
]

/** Renglones de hasta `w` px, cortando entre palabras. */
function envolver(texto, w, f, peso = 400) {
  const out = []
  let linea = ''
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? `${linea} ${p}` : p
    if (linea && ancho(prueba, f, peso) > w) {
      out.push(linea)
      linea = p
    } else linea = prueba
  }
  if (linea) out.push(linea)
  return out
}

/** Mezcla lineal de dos colores #rrggbb (el tono de cada cliente en la fila ordenada). */
function mezcla(a, b, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
  const [x, y] = [h(a), h(b)]
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`
}

function Reglas({ w, h, k }) {
  const ajuste = Math.max(0.75, Math.min(1, h / (260 * k)))
  const fQuien = 11.5 * k * ajuste
  const fRegla = 17 * k * ajuste
  const fBajo = 13.5 * k * ajuste
  const fGana = 14 * k * ajuste
  const fEje = 11 * k * ajuste
  const sep = 2 * k
  const anchoGana = Math.max(...FILAS.map((f) => ancho(f.gana, fGana, 700))) + 14 * k
  const wCel = w - anchoGana
  const celda = (wCel - sep * (N - 1)) / N
  const yEje = h - fEje * 0.3
  const altoEje = fEje * 1.6
  const altoFila = (h - altoEje) / FILAS.length
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={'Cómo ordena la lista cada regla, una celda por cliente en el orden en que se lo contacta. '
           + 'Grupo 5: la regla marca sí o no y los marcados quedan empatados; su modelo le gana. Grupo 2: la regla '
           + 'ordena por los días que le faltan a cada cliente para cruzar su umbral; nuestro modelo empata.'}>
      {FILAS.map((f, i) => {
        const y0 = i * altoFila
        const yQuien = y0 + fQuien
        const yRegla = yQuien + fQuien * 0.3 + fRegla * 0.95 + 3 * k
        const yCel = yRegla + 8 * k
        const bajo = envolver(f.bajo, wCel, fBajo, 500)
        const hCel = Math.max(10, altoFila - (yCel - y0) - bajo.length * fBajo * 1.25 - 14 * k)
        const yBajo = yCel + hCel + 6 * k + fBajo * 0.8
        return (
          <g key={f.quien}>
            <title>{`${f.quien}: ${f.regla.toLowerCase()}; ${f.bajo}. Contra esta regla, ${f.gana}.`}</title>
            <text x={0} y={yQuien} fontSize={fQuien} fontWeight={600} fill={CTX} fontFamily="var(--mono)"
                  letterSpacing={`${0.08 * fQuien}`} style={{ textTransform: 'uppercase' }}>{f.quien}</text>
            <text x={0} y={yRegla} fontSize={fRegla} fontWeight={700} fill={f.propia ? ACC : INK}>{f.regla}</text>
            {Array.from({ length: N }, (_, j) => {
              const fill = f.propia ? mezcla('#22456f', '#dfe6ee', j / (N - 1)) : (j < MARCADOS ? CTX_R : TINTE)
              return <rect key={j} x={j * (celda + sep)} y={yCel} width={celda} height={hCel} fill={fill} />
            })}
            {!f.propia && (
              <rect x={-0.5} y={yCel - 0.5} width={MARCADOS * (celda + sep) - sep + 1} height={hCel + 1} fill="none"
                    stroke={CONTORNO} strokeWidth="1.5" />
            )}
            {bajo.map((t, r) => (
              <text key={r} x={0} y={yBajo + r * fBajo * 1.25} fontSize={fBajo} fontWeight={500} fill={INK}>{t}</text>
            ))}
            <text x={w} y={yCel + hCel / 2} fontSize={fGana} fontWeight={700} fill={f.propia ? ACC : INK}
                  textAnchor="end" dominantBaseline="central">{f.gana}</text>
          </g>
        )
      })}
      <text x={0} y={yEje} fontSize={fEje} fontWeight={600} fill={CTX} fontFamily="var(--mono)"
            letterSpacing={`${0.08 * fEje}`} style={{ textTransform: 'uppercase' }}>
        {`orden de contacto: primero${NBSP}→${NBSP}último`}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------- la vista

export default function V10NosLlevamos() {
  const k = useEscalaTexto()
  return (
    <section className="pant v10">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }}
             title={`${entero(T.completo)} de ${entero(T.filas)} secciones en «Completo»: cumplen la plantilla y sus `
               + 'cifras se reproducen.'}>
          <span className="kpi-lbl"><span>Secciones completas</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(T.completo)} unidad={`${NBSP}de${NBSP}${entero(T.filas)}`} />
            </div>
          </div>
          <p className="e2-linea">cierran sin cambios</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }}
             title={CO.bien.map((b) => `${b.seccion}: ${b.que}`).join('\n')}>
          <span className="kpi-lbl"><span>Lo que hacen bien</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={entero(CO.bien.length)} sec /></div>
          </div>
          <p className="e2-linea">secciones con cifras que reprodujimos</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v10-graf">
        <p className="e3-conclusion">{CONCLUSION}</p>
        <div className="e3-v10-par">
          <div className="e3-v10-bien">
            <p className="e3-v10-rot">Lo que hacen bien</p>
            <ul className="e3-v10-lista">
              {CO.bien.map((b) => (
                <li key={b.seccion}>
                  <b>{sinCortes(b.seccion)}</b>
                  <span>{sinCortes(b.que)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="e3-v10-reglas">
            <p className="e3-v10-rot">Lo que nos llevamos: cómo ordena la lista cada regla</p>
            <div className="e3-v10-lienzo">
              <Lienzo className="lienzo">
                {({ w, h }) => <Reglas w={w} h={h} k={k} />}
              </Lienzo>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
