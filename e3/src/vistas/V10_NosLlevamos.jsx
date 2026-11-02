// V10 · ¿Qué está bien y qué nos deja? (01/11, W5; diapositiva 15 de C3). Cierra la corrección al Grupo 5. La
// pregunta del pedido («¿Qué hacen bien y qué nos llevamos?») pasaba a dos renglones a 1366 × 768 con la fuente de la
// planilla al lado; esta es la única de las probadas que entra en un renglón de 1152 × 640 a 1920 × 1080.
//
// - Banda: la central, los bloques en «Completo» sobre el total (lo que cierra, en --acc); al lado, lo que hacen bien
//   (cuántas secciones, y que sus cifras se rehicieron). Ni una ni otra repite la central de la vista 9.
// - Decisión: «E-CRU · sin cambios»: el cruce de sus cifras con nuestro registro no cambia ninguna nuestra
//   (_build/E/cruce.md: donde difieren, cambia la base o el target).
// - Debajo, a la izquierda, lo que hacen bien (las tres de la planilla, con su sección); a la derecha, el gráfico: por
//   qué los dos grupos concluyen distinto. (01/11, planilla v2.0) Hasta acá decía que su regla «marca sí o no» y por
//   eso su modelo le ganaba: es falso, su AUC usa atraso_relativo como puntaje continuo (su A 2.5, pág. 21;
//   verificacion-2.json, «cruce-regla»). Las dos reglas ordenan por cuánto se atrasó el cliente; lo que cambia es el
//   target. El nuestro (cruza su umbral en 90 días) casi coincide con lo que ordena la regla, que ya separa casi todo;
//   el suyo (no compra en el doble de su intervalo) le deja lugar al modelo. El gráfico pone, para cada target, el
//   AUC-ROC en validación de la regla (círculo hueco) y del modelo (lleno) sobre una escala de 0,5 (azar) a 1,0.
// (02/11, W6) Conclusión «sobre todo por el target» (DAT-04: la fuga de la vista 9 puede inflar su modelo y no la
//   medimos). Los dos textos dicen que las dos reglas ordenan por atraso (DAT-09). La tarjeta cuenta las secciones
//   de CO.bien (5, no los 3 ítems: DAT-05). La columna izquierda muestra C3 «bien_corto» (diapositiva 15), sin las
//   cifras que el oral no dice; el texto completo va al title (ORA-14, VIS-07). Las marcas 0,5 · 0,75 · 1,0 van
//   debajo de cada línea de puntos y salen el eje y la leyenda del pie (UX-17).
// Ningún texto ni cifra de la planilla escrito acá: salen de D3.correccion (correcciones.json de _build/E/; el AUC, de
// etapa2.json y del consolidado del Grupo 5, con sus anclas en build_e3.py).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { Cifra } from '../cifra.jsx'
import { sinCortes } from '../texto.jsx'
import { anchoTexto as ancho } from '../medir.js'
import './V10.css'

const CO = D3.correccion
const T = CO.total
const TG = CO.target
const D15 = C3.DIAPOSITIVAS.find((d) => d.n === 15)
/** Secciones que rehicimos: «1.4», «3.2 y 4.4», «5.1 y 5.2» son cinco, no tres ítems (DAT-05). */
const SECCIONES = CO.bien.flatMap((b) => b.seccion.match(/\d+\.\d+/g) ?? []).length
/** El texto completo de la planilla de cada ítem, para el title de su versión corta. */
const QUE = Object.fromEntries(CO.bien.map((b) => [b.seccion, b.que]))

const DECISION = decision('E-CRU', {
  llano_corto: 'Ninguna cifra nuestra cambia con el cruce',
  llano: 'Cruzamos las cifras del Grupo 5 con nuestro registro: ninguna nuestra está mal. Donde difieren, cambia la '
    + 'base (envíos con o sin duplicados) o el target, o la cifra viene de una respuesta de Casa Óga que no tenemos.',
  decision: 'nuestras cifras quedan como están',
  justificacion: 'las dos reglas ordenan por cuánto se atrasó el cliente; los grupos concluyen distinto porque el '
    + 'target es otro. No es un error suyo.',
})

const CONCLUSION = 'Concluimos distinto sobre todo por el target'

export const meta = { id: 'V10', dc: 'E-CRU' }

// ---------------------------------------------------------------- el gráfico: el AUC de la regla y del modelo, por target

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const EJE = 'var(--e3-eje, #6a7489)'
const CONTORNO = 'var(--e3-contorno, #4f5a6e)'
const DESDE = 0.5    // AUC del azar: el piso de la escala
const HASTA = 1      // separa todo
const MARCAS = [DESDE, 0.75, HASTA]

const FILAS = [
  { quien: 'Grupo 2 · nuestro target', target: 'Cruza su umbral en 90 días', modelo: 'logística', d: TG.nuestro,
    bajo: 'Nuestra regla ordena por el atraso frente al umbral, casi lo mismo que marca el target: separa casi todo y '
      + 'al modelo no le queda dónde ganar.', propia: true },
  { quien: 'Grupo 5 · su target', target: 'No compra en el doble de su intervalo', modelo: 'modelo', d: TG.suyo,
    bajo: 'Su regla también ordena por el atraso, pero su target es otro: separa poco y el modelo gana.',
    propia: false },
]

const auc = (x) => fijo(x, 3)

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

function Targets({ w, h, k }) {
  const ajuste = Math.max(0.72, Math.min(1, h / (300 * k)))
  const fQuien = 11.5 * k * ajuste
  const fTarget = 17 * k * ajuste
  const fVal = 13.5 * k * ajuste
  const fBajo = 13.5 * k * ajuste
  const fEje = 12 * k * ajuste
  const r = 6.5 * k * ajuste
  const izq = r + 1
  const der = w - r - 1
  const x = (v) => izq + (der - izq) * (v - DESDE) / (HASTA - DESDE)
  const altoFila = h / FILAS.length
  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={FILAS.map((f) => `${f.quien}: ${f.target.toLowerCase()}. AUC-ROC en validación: regla `
           + `${auc(f.d.regla)}, ${f.modelo} ${auc(f.d.modelo)}. ${f.bajo}`).join(' ')}>
      {FILAS.map((f, i) => {
        const y0 = i * altoFila
        const yQuien = y0 + fQuien
        const yTarget = yQuien + fQuien * 0.3 + fTarget * 0.95 + 3 * k
        const bajo = envolver(f.bajo, w, fBajo, 500)
        const yVal = yTarget + fTarget * 0.25 + fVal * 0.95 + 10 * k * ajuste
        const yPunto = yVal + fVal * 0.25 + r + 5 * k * ajuste
        // las marcas de la escala, debajo de la línea de puntos (UX-17)
        const yMarca = yPunto + r + 3 * k * ajuste + fEje * 0.8
        const yBajo = yMarca + fEje * 0.25 + 8 * k * ajuste + fBajo * 0.8
        const [xr, xm] = [x(f.d.regla), x(f.d.modelo)]
        const tR = `regla ${auc(f.d.regla)}`
        const tM = `${f.modelo} ${auc(f.d.modelo)}`
        // los dos rótulos van sobre su punto; si se pisan (nuestro target: 0,968 y 0,966), uno solo que termina
        // sobre el punto de más a la derecha
        const juntos = Math.abs(xm - xr) < (ancho(tR, fVal, 600) + ancho(tM, fVal, 700)) / 2 + 12 * k
        return (
          <g key={f.quien}>
            <title>{`${f.quien}: ${f.target.toLowerCase()}. AUC-ROC en validación: regla ${auc(f.d.regla)}, `
              + `${f.modelo} ${auc(f.d.modelo)}. ${f.bajo}`}</title>
            <text x={0} y={yQuien} fontSize={fQuien} fontWeight={600} fill={CTX} fontFamily="var(--mono)"
                  letterSpacing={`${0.08 * fQuien}`} style={{ textTransform: 'uppercase' }}>{f.quien}</text>
            <text x={0} y={yTarget} fontSize={fTarget} fontWeight={700} fill={f.propia ? ACC : INK}>{f.target}</text>
            <line x1={izq} x2={der} y1={yPunto} y2={yPunto} stroke={EJE} strokeWidth="1" />
            {MARCAS.map((v, j) => (
              <g key={v} data-escala="">
                <line x1={x(v)} x2={x(v)} y1={yPunto} y2={yPunto + r + 1 * k} stroke={EJE} />
                <text x={x(v)} y={yMarca} fontSize={fEje} fill={CTX} className="tabular" data-escala=""
                      textAnchor={j === 0 ? 'start' : j === MARCAS.length - 1 ? 'end' : 'middle'}>
                  {fijo(v, v === 0.75 ? 2 : 1)}
                </text>
              </g>
            ))}
            <line x1={xr} x2={xm} y1={yPunto} y2={yPunto} stroke={ACC} strokeWidth={3 * k} />
            {/* la regla, hueca, debajo; el modelo, lleno y encima: con 0,968 y 0,966 se ven los dos */}
            <circle cx={xr} cy={yPunto} r={r} fill="var(--sup, #fff)" stroke={CONTORNO} strokeWidth="1.5" />
            <circle cx={xm} cy={yPunto} r={r * (Math.abs(xm - xr) < 2 * r ? 0.6 : 1)} fill={ACC} />
            {juntos ? (
              <text x={Math.min(der + r, Math.max(xr, xm) + r)} y={yVal} fontSize={fVal} textAnchor="end"
                    className="tabular">
                <tspan fontWeight={600} fill={CTX}>{tR}</tspan>
                <tspan fontWeight={700} fill={ACC}>{` · ${tM}`}</tspan>
              </text>
            ) : (
              <>
                <text x={xr} y={yVal} fontSize={fVal} fontWeight={600} fill={CTX} textAnchor="middle"
                      className="tabular">{tR}</text>
                <text x={Math.min(xm, der + r - ancho(tM, fVal, 700) / 2)} y={yVal} fontSize={fVal} fontWeight={700}
                      fill={ACC} textAnchor="middle" className="tabular">{tM}</text>
              </>
            )}
            {bajo.map((s, j) => (
              <text key={j} x={0} y={yBajo + j * fBajo * 1.25} fontSize={fBajo} fontWeight={500} fill={INK}>{s}</text>
            ))}
          </g>
        )
      })}
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
             title={`${entero(T.completo)} de ${entero(T.filas)} bloques de secciones en «Completo»: no tienen un `
               + 'error que cambie una cifra o el método.'}>
          <span className="kpi-lbl"><span>Bloques completos</span></span>
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
            <div className="par-item par-unico">
              <Cifra num={entero(SECCIONES)} unidad={`${NBSP}secciones`} sec />
            </div>
          </div>
          <p className="e2-linea">rehicimos sus cifras y cierran</p>
        </div>
      </Banda>

      <div className="tarjeta e3-v10-graf">
        <p className="e3-conclusion">{CONCLUSION}</p>
        <div className="e3-v10-par">
          <div className="e3-v10-bien">
            <ul className="e3-v10-lista">
              {D15.bien_corto.map((b) => (
                <li key={b.seccion} title={QUE[b.seccion]}>
                  <b>{sinCortes(b.seccion)}</b>
                  <span>{sinCortes(b.texto)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="e3-v10-reglas">
            {/* dos renglones a toda resolución: cortado a mano después de los dos puntos, no en «AUC-ROC» */}
            <p className="e3-v10-rot">Por qué concluimos distinto:<br />AUC-ROC en validación con el target de cada grupo</p>
            <div className="e3-v10-lienzo">
              <Lienzo className="lienzo">
                {({ w, h }) => <Targets w={w} h={h} k={k} />}
              </Lienzo>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
