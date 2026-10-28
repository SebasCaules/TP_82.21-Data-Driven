// V04 · ¿El modelo mejora a la regla? (Parte A 2.2, 2.3 y 2.5 · Parte B 4.1 a 4.5 · Parte C 7.1 a 7.3 ·
// Parte D 8.1, 8.2, 11.1 y 11.2; diapositivas 6 y 7 de C3). Banda de cifras con la tarjeta de decisión a
// la derecha y un gráfico a todo el ancho debajo.
//
// (27/10, W3) La vista decide con el test (enero a mayo de 2025, D3.test), no con validación: sin filtrar
// la logística gana con un intervalo que excluye el cero (Parte D 11.2), y en la lista que sale empata
// (Parte D 8.2 y 11.1).
//
// (28/10, unidad V04 de .workforce/PLAN.md) Una cifra que se impone y un gráfico con un mensaje:
// - Banda, un número por tarjeta y la central primero, a la izquierda (N0-6). Sin rangos de intervalo
//   (van al gráfico); fragmentos de 2 a 6 palabras sin segundo número (N0-8).
//   - «Lista que sale · test», la central: logística menos regla en la lista de 500 contactables (J09,
//     D3.test.contra_regla.diferencia_pp), «empata con la regla».
//   - «Harían falta por mes»: los aciertos de más por mes que pagan los USD 10.400 del modelo (J10,
//     D3.test.decision.aciertos_por_mes_para_pagar), «más que toda la lista». El largo de la lista va al
//     title y la vista corta el armado si la cifra deja de pasar ese largo.
//   Dos tarjetas, no tres: el +1,06 sin filtrar (J11) queda en el gráfico, con su veredicto, y su detalle en
//   el title de la tarjeta del gráfico. Con tres, «−0,25 puntos» no entraba en la central a 1366 × 768 y
//   «puntos» tenía que bajar al fragmento, que pasaba a dos renglones y agrandaba la banda.
//   El detalle (intervalos, validación, precisiones) va al title de cada tarjeta.
// - Decisión: «C-MOD · sale la regla» de decisiones.js, con la frase corta escrita acá porque C3 no trae la
//   Parte D. La vista corta el armado si la etapa 4 deja de sostenerla.
// - Gráfico: SVG propio (`Diferencias`; PuntosIC de src/graficos.jsx tiene grosor fijo y no se toca), un
//   solo svg dentro de .lienzo que llena el alto de la tarjeta. Al llegar, solo las dos filas de test:
//   logística menos regla con su intervalo del 95 %. Sin zona sombreada: el empate es que el intervalo
//   cruce el cero, y la línea del 0 lleva el rótulo «empate». El veredicto de cada fila va grande y pegado
//   a su intervalo; los extremos del intervalo, debajo de sus remates. La fila que decide, «Lista que
//   sale», en --acc; la otra, en contexto (--e3-ctx-relleno, texto en --e3-ctx). La conclusión, arriba,
//   con .e3-conclusion.
// - Explorar (abre en «Diferencia»):
//   - «Diferencia»: el mismo gráfico con las cuatro filas, validación (julio a septiembre de 2024, H06 y la
//     validación de J09) y test. Validación pasó del gráfico de llegada a acá (28/10).
//   - «Test»: precisión de la lista de 500 contactables por mes en los 5 cortes de test, la regla, la
//     logística ajustada y la práctica actual (J03 y J17). verificar_e3.py lo abre por el nombre.
//   - «Validación» y «Entrenamiento»: la lista de 500 sin filtrar por modelo de la Parte B (F07, F08, G11,
//     G13 a G15; techo G12). La logística se rotula «de la Parte B» para no confundirla con la ajustada.
//   «Diferencia» no contiene «Test» ni «Validación»: verificar_e3.py elige la opción por texto.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y se escriben con formato.js. Las notas
// (N) siguen leyendo el guion de las diapositivas 6 y 7 de C3 (vistas/index.jsx).

import { useState } from 'react'
import { Lienzo, BarrasH } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fecha, fijo, mesAnio, pct, usd } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'
import { anchoTexto } from '../medir.js'
import './V04.css'

const MD = D3.modelos
const L = D3.lista
const TE = D3.test
const LARGO = L.elegida.largo_mes
const SF = TE.sin_filtro       // J11: lista de 500 sin filtro, test
const CO = TE.contra_regla     // J09: lista de 500 contactables, test (y su validación)
const DE = TE.decision         // J10: el criterio de la C 6.2, fila 13, medido en test
const MET = TE.metodos         // J03: precisión de cada método en test
const SFV = L.modelo_menos_regla_500_sin_filtro   // H06: lista de 500 sin filtro, validación, logística ajustada

/** «enero a mayo de 2025»; con años distintos, los dos. */
function periodo(desde, hasta) {
  const a = mesAnio(desde)
  return `${desde.slice(0, 4) === hasta.slice(0, 4) ? a.replace(/ de \d{4}$/, '') : a} a ${mesAnio(hasta)}`
}
const TEST = periodo(TE.conjunto.desde, TE.conjunto.hasta)
const VALID = periodo(MD.validacion.desde, MD.validacion.hasta)

const pp = (x) => fijo(x, 2, true)
const intervalo = ([a, b]) => `${pp(a)} a ${pp(b)}`
/** Lo que dice un intervalo de logística menos regla. */
const veredicto = ([a, b]) => (a > 0 ? 'gana la logística' : b < 0 ? 'gana la regla' : 'empate')

// Lo que la vista afirma en palabras, comprobado contra la etapa 4: si los datos cambian, corta el armado.
if (!DE.sigue_la_regla || DE.condicion_2 || veredicto(CO.ic95_pp) !== 'empate'
    || veredicto(SF.ic95_pp) !== 'gana la logística' || veredicto(CO.validacion_ic95_pp) !== 'gana la regla'
    || !(DE.aciertos_por_mes_para_pagar > LARGO)) {
  throw new Error('V04: la etapa 4 ya no sostiene lo que dice la vista (empate, gana sin filtrar, ' +
    'en validación ganaba la regla, pagarlo pide más que la lista)')
}
const DECISION = decision('C-MOD', {
  llano_corto: 'No: en la lista que sale empata y no paga su costo',
  llano: `En test (${TEST}), en la lista de ${entero(LARGO)} contactables por mes la logística queda a ` +
    `${pp(CO.diferencia_pp)} puntos de la regla, con un intervalo de ${intervalo(CO.ic95_pp)} que incluye el ` +
    `cero. Sin filtrar gana por ${pp(SF.diferencia_pp)} (${intervalo(SF.ic95_pp)}), pero esa lista no se ` +
    `puede mandar`,
  decision: DE.resultado,
  justificacion: `para reemplazar a la regla, el intervalo tiene que quedar arriba del cero y los aciertos de ` +
    `más tienen que pagar los ${usd(DE.costo_incremental_usd)} que el modelo agrega al costo del primer año, ` +
    `que piden ${entero(DE.aciertos_por_mes_para_pagar)} aciertos más por mes. En test suma ` +
    `${fijo(CO.aciertos_extra_por_mes, 2, true)} por mes en la lista que sale y ` +
    `${fijo(SF.aciertos_de_mas_por_mes, 2, true)} sin filtrar`,
})

const TITULO_SF = `Logística menos regla en la lista de ${entero(LARGO)} por mes sin filtrar, en test (${TEST}): ` +
  `${pp(SF.diferencia_pp)} puntos, intervalo del 95${NBSP}% de ${intervalo(SF.ic95_pp)}; ` +
  `${fijo(SF.aciertos_de_mas_por_mes, 2)} aciertos más por mes. En validación (${VALID}), la misma logística ` +
  `sumaba ${pp(SFV.diferencia_pp)} puntos, de ${intervalo(SFV.ic95_pp)} (la de la Parte B, sin ajustar, ` +
  `${pp(MD.contra_regla.diferencia_pp)}, de ${intervalo(MD.contra_regla.ic95_pp)}). Esa lista incluye clientes que ` +
  'no aceptan marketing: no se puede mandar.'
const TITULO_LISTA = `Logística menos regla en la lista de ${entero(LARGO)} contactables por mes, la que sale, en ` +
  `test (${TEST}): ${pp(CO.diferencia_pp)} puntos, intervalo del 95${NBSP}% de ${intervalo(CO.ic95_pp)}, que ` +
  `incluye el cero. La regla acierta ${pct(MET.regla.test.precision, 1)} y la logística ` +
  `${pct(MET.logistica_ajustada.test.precision, 1)}. En validación (${VALID}), la regla acertaba ` +
  `${entero(L.regla_menos_modelo_500_contactables.aciertos)} clientes más: ${pp(CO.validacion_diferencia_pp)} ` +
  `puntos, de ${intervalo(CO.validacion_ic95_pp)}.`
const TITULO_PAGA = `El modelo agrega ${usd(DE.costo_incremental_usd)} al costo del primer año. Pagarlo pide ` +
  `${entero(DE.aciertos_por_mes_para_pagar)} aciertos más por mes en una lista de ${entero(LARGO)}: ni una ` +
  `lista perfecta lo paga. En test suma ${fijo(CO.aciertos_extra_por_mes, 2, true)} aciertos por mes en la ` +
  `lista que sale y ${fijo(SF.aciertos_de_mas_por_mes, 2, true)} sin filtrar.`

// Filas del gráfico. `decide`: la fila que decide, en --acc. `tenue`: validación, solo en Explorar.
const NO_SALE = 'incluye a quien no acepta marketing'
const SALE = `${entero(LARGO)} contactables por mes`
const FILAS_TEST = [
  { id: 'sf', nombre: 'Sin filtrar', sub: NO_SALE, valor: SF.diferencia_pp, ic: SF.ic95_pp },
  { id: 'co', nombre: 'Lista que sale', sub: SALE, valor: CO.diferencia_pp, ic: CO.ic95_pp, decide: true },
]
const FILAS_TODAS = [
  { id: 'sfv', nombre: 'Sin filtrar · validación', sub: VALID, valor: SFV.diferencia_pp, ic: SFV.ic95_pp,
    tenue: true },
  { id: 'sf', nombre: 'Sin filtrar · test', sub: TEST, valor: SF.diferencia_pp, ic: SF.ic95_pp },
  { id: 'cov', nombre: 'Lista que sale · validación', sub: VALID, valor: CO.validacion_diferencia_pp,
    ic: CO.validacion_ic95_pp, tenue: true },
  { id: 'co', nombre: 'Lista que sale · test', sub: TEST, valor: CO.diferencia_pp, ic: CO.ic95_pp, decide: true },
]

const marca = (t) => (t === 0 ? '0' : fijo(t, 0, true))

/**
 * Diferencia con su intervalo, una fila por lista. Marcas gruesas para proyector; la línea del 0 es el
 * empate. `k`: escala de la letra (useEscalaTexto). Con más filas que alto, todo se achica junto (`s`).
 */
function Diferencias({ filas, w, h, k, tituloEje }) {
  const pasoBruto = Math.min((h - 80 * k) / filas.length, 165 * k)
  const s = Math.max(0.72, Math.min(1, pasoBruto / (118 * k)))
  const f = k * s
  const fsNom = 19 * f
  const fsSub = 14 * f
  const fsVer = 23 * f
  const fsVal = 17 * f
  const fsExt = 14 * f
  const fsEje = 13.5 * k
  const fsEmp = 16 * k

  const anchoIzq = Math.max(...filas.map((d) => Math.max(anchoTexto(d.nombre, fsNom, 700),
    anchoTexto(d.sub, fsSub, 500)))) + 28 * k
  const anchoDer = Math.max(...filas.map((d) => anchoTexto(veredicto(d.ic), fsVer, 700))) + 22 * k
  const lo = Math.floor(Math.min(0, ...filas.map((d) => d.ic[0])))
  const hi = Math.ceil(Math.max(0, ...filas.map((d) => d.ic[1])))
  const pasoEje = hi - lo > 6 ? 2 : 1
  const marcas = []
  for (let t = lo; t <= hi + 1e-9; t += pasoEje) marcas.push(t)

  const x0 = anchoIzq
  const x1 = Math.max(x0 + 80, w - anchoDer)
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0)
  // Paso entre filas con tope: en una pantalla alta las filas no se separan tanto que cueste compararlas.
  // El bloque (rótulo del empate, filas, eje) va centrado en el alto del lienzo.
  const paso = Math.min((h - 80 * k) / filas.length, 165 * k)
  const yTop = (h - paso * filas.length - 80 * k) / 2 + 30 * k
  const yBase = yTop + paso * filas.length

  const lectura = filas.map((d) => `${d.nombre} ${pp(d.valor)} (intervalo ${intervalo(d.ic)}), ${veredicto(d.ic)}`)
  return (
    <svg width={w} height={h} role="img" aria-label={`${tituloEje}: ${lectura.join('; ')}`}
         style={{ display: 'block' }} className="e3-v04-svg">
      {/* grilla tenue en cada marca y el eje */}
      {marcas.map((t) => t !== 0 && (
        <line key={t} x1={X(t)} x2={X(t)} y1={yTop} y2={yBase} stroke="var(--trk, #dfe1e0)" strokeWidth="1" />
      ))}
      <line x1={x0} x2={x1} y1={yBase} y2={yBase} stroke="var(--e3-eje, #6a7489)" strokeWidth="1.25" />
      {marcas.map((t) => (
        <text key={t} x={X(t)} y={yBase + 8 * k + fsEje * 0.8} fontSize={fsEje} textAnchor="middle"
              fill={t === 0 ? 'var(--ink)' : 'var(--e3-ctx, #5a6478)'} fontWeight={t === 0 ? 700 : 500}
              className="tabular">{marca(t)}</text>
      ))}
      <text x={(x0 + x1) / 2} y={yBase + 46 * k} fontSize={fsEje} textAnchor="middle" fill="var(--e3-ctx, #5a6478)"
            fontWeight="500">{tituloEje}</text>

      {/* el empate: la línea del 0, rotulada arriba */}
      <line x1={X(0)} x2={X(0)} y1={yTop - 4 * k} y2={yBase} stroke="var(--e3-contorno, #4f5a6e)"
            strokeWidth={2.5 * k} />
      <text x={X(0)} y={yTop - 10 * k} fontSize={fsEmp} textAnchor="middle" fill="var(--e3-contorno, #4f5a6e)"
            fontWeight="700" letterSpacing=".02em">empate</text>

      {filas.map((d, i) => {
        const y = yTop + paso * (i + 0.5)
        const tenue = !!d.tenue
        const color = d.decide ? 'var(--acc)' : 'var(--e3-ctx-relleno, #a9b1bf)'
        const tinta = d.decide ? 'var(--ink)' : 'var(--e3-ctx, #5a6478)'
        const gros = (tenue ? 3 : 6) * f
        const remate = (tenue ? 16 : 26) * f
        const r = (tenue ? 7 : 11) * f
        const [a, b] = d.ic
        // El valor va centrado sobre el punto; si ahí lo cruzaría la línea del empate, se corre a su lado.
        const anchoVal = anchoTexto(pp(d.valor), fsVal, 700)
        const pisa = Math.abs(X(d.valor) - X(0)) < anchoVal / 2 + 6 * k
        const xVal = !pisa ? X(d.valor) : d.valor < 0 ? X(0) - 8 * k : X(0) + 8 * k
        const anclaVal = !pisa ? 'middle' : d.valor < 0 ? 'end' : 'start'
        // El veredicto, a la derecha del intervalo; si el intervalo termina antes del 0, del otro lado de la
        // línea del empate, para que la línea no lo cruce.
        const xVer = Math.max(X(b) + 16 * k, b < 0 ? X(0) + 14 * k : 0)
        return (
          <g key={d.id}>
            <title>{`${d.nombre}, ${d.sub}: logística menos regla ${pp(d.valor)} puntos, intervalo del 95 % de ` +
              `${intervalo(d.ic)}. ${veredicto(d.ic)}.`}</title>
            <text x={0} y={y - fsSub * 0.25} fontSize={fsNom} fill={tinta} fontWeight={d.decide ? 700 : 600}>
              {d.nombre}
            </text>
            <text x={0} y={y + fsSub * 1.05} fontSize={fsSub} fill="var(--e3-ctx, #5a6478)" fontWeight="500">
              {d.sub}
            </text>

            <line x1={X(a)} x2={X(b)} y1={y} y2={y} stroke={color} strokeWidth={gros} strokeLinecap="butt" />
            <line x1={X(a)} x2={X(a)} y1={y - remate / 2} y2={y + remate / 2} stroke={color}
                  strokeWidth={gros * 0.7} />
            <line x1={X(b)} x2={X(b)} y1={y - remate / 2} y2={y + remate / 2} stroke={color}
                  strokeWidth={gros * 0.7} />
            <circle cx={X(d.valor)} cy={y} r={r} fill={color} stroke="var(--sup, #fff)" strokeWidth={3 * f} />

            {/* el valor, sobre el punto; los extremos, debajo de sus remates */}
            <text x={xVal} y={y - r - 9 * f} fontSize={fsVal} textAnchor={anclaVal} fill={tinta}
                  fontWeight={d.decide ? 700 : 600} className="tabular e3-v04-halo">{pp(d.valor)}</text>
            {[a, b].map((v) => (
              <text key={v} x={X(v)} y={y + remate / 2 + fsExt * 1.05} fontSize={fsExt} textAnchor="middle"
                    fill="var(--e3-ctx, #5a6478)" fontWeight="500" className="tabular e3-v04-halo">{pp(v)}</text>
            ))}

            {/* el veredicto, grande y pegado al intervalo */}
            <text x={xVer} y={y} fontSize={fsVer} dominantBaseline="central"
                  fill={d.decide ? 'var(--acc)' : 'var(--e3-ctx, #5a6478)'} fontWeight="700">
              {veredicto(d.ic)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Explorar: la diferencia en validación y test, o la precisión de la lista por método.
const CONJUNTOS = [
  { valor: 'diferencia', texto: 'Diferencia' },
  { valor: 'test', texto: 'Test' },
  { valor: 'validacion', texto: 'Validación' },
  { valor: 'entrenamiento', texto: 'Entrenamiento' },
]
const NOMBRE = Object.fromEntries(MD.filas.map((f) => [f.id, f.nombre]))
const nombreParteB = (f) => (f.id === 'logistica' ? 'Logística de la Parte B' : f.nombre)
const BARRAS_TEST = [
  { etiqueta: NOMBRE.practica_actual, valor: MET.practica_actual.test.precision },
  { etiqueta: 'Logística ajustada', valor: MET.logistica_ajustada.test.precision },
  { etiqueta: NOMBRE.regla_umbral, valor: MET.regla.test.precision, enfasis: true },
]
const LISTAS_TEST = TE.conjunto.cortes.length

export const meta = { id: 'V04', dc: 'C-MOD' }

export default function V04ModeloORegla() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [conjunto, setConjunto] = useState('diferencia')
  const ent = conjunto === 'entrenamiento'
  const test = conjunto === 'test'
  const dif = !explorar || conjunto === 'diferencia'
  const barras = test ? BARRAS_TEST : MD.filas.filter((f) => f[conjunto]).map((f) => ({
    etiqueta: nombreParteB(f),
    valor: f[conjunto].precision,
    enfasis: f.grupo === 'regla',
  }))
  const techo = MD.entrenamiento.techo_precision

  let mide
  let conclusion
  if (!explorar) {
    mide = `Logística menos regla, en puntos · lista de ${entero(LARGO)} por mes · test, ${TEST}`
    conclusion = <>El intervalo de la lista que sale cruza el cero: <b>empate</b></>
  } else if (dif) {
    mide = "Logística menos regla, en puntos · validación y test"
    conclusion = <>En validación ganaba la regla; en test, <b>empate</b></>
  } else if (test) {
    mide = `Precisión de la lista de ${entero(LARGO)} contactables por mes, en test`
    conclusion = `${LISTAS_TEST} listas, de ${fecha(TE.conjunto.desde)} a ${fecha(TE.conjunto.hasta)}`
  } else {
    mide = `Precisión de la lista de ${entero(LARGO)} por mes, sin filtrar${ent ? ', en entrenamiento' : ''}`
    conclusion = ent
      ? `${MD.entrenamiento.cortes} cortes; techo ${pct(techo, 1)}`
      : `${entero(MD.validacion.largo_lista)} lugares en ${MD.validacion.cortes} meses de validación`
  }
  // Las barras de precisión no llenan el alto: tope por fila, como antes (W2).
  const tope = dif ? undefined : Math.round((barras.length * (test ? 70 : 56) + 56) * k)

  return (
    <section className="pant v04">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 1' }} title={TITULO_LISTA}>
          <span className="kpi-lbl"><span>Lista que sale · test</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={pp(CO.diferencia_pp)} unidad={`${NBSP}puntos`} /></div>
          </div>
          <p className="e2-linea">empata con la regla</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 1' }} title={TITULO_PAGA}>
          <span className="kpi-lbl"><span>Harían falta por mes</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(DE.aciertos_por_mes_para_pagar)} unidad={`${NBSP}aciertos`} sec />
            </div>
          </div>
          <p className="e2-linea">más que toda la lista</p>
        </div>

      </Banda>

      <div className="tarjeta e3-v04-graf" title={TITULO_SF}>
        <div className="e3-v04-cab">
          <div className="e3-v04-titulos">
            <p className="e3-v04-mide">{mide}</p>
            <p className="e3-conclusion">{conclusion}</p>
          </div>
          <div className="e3-v04-mandos">
            {explorar && (
              <Opciones etiqueta="Conjunto" valor={conjunto} onCambio={setConjunto} opciones={CONJUNTOS} />
            )}
            <BotonExplorar abierto={explorar}
                           onCambio={(v) => { setExplorar(v); if (!v) setConjunto('diferencia') }} />
          </div>
        </div>
        <div className="e3-v04-lienzo" style={tope ? { maxHeight: tope } : undefined}>
          <Lienzo className="lienzo">
            {({ w, h }) => (dif ? (
              <Diferencias filas={explorar ? FILAS_TODAS : FILAS_TEST} w={w} h={h} k={k}
                           tituloEje="Logística menos regla (puntos)" />
            ) : (
              <BarrasH
                datos={barras} w={w} h={h}
                formato={(v) => pct(v, 1)}
                formatoEje={(v) => pct(v, 0)}
                anchoEtiqueta={Math.round(270 * k)}
                tituloEje={test ? 'Precisión de la lista en test' : 'Precisión de la lista'}
                tope={1}
              />
            ))}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
