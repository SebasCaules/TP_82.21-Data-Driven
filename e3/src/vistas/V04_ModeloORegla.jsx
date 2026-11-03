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
//   - «Para pagar el modelo» (unidad «aciertos más/mes»): los aciertos de más por mes que pagan los USD 10.400 del modelo (J10,
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
// - (01/11, a la vista) El gráfico muestra de entrada las cuatro filas: sin filtrar y la lista que sale, cada una en
//   validación (julio a septiembre de 2024, H06 y la validación de J09, más finas) y en test. Hasta el 01/11 la
//   validación iba detrás de un botón. La precisión de cada método (J03, J17) y las listas de la Parte B en
//   validación y entrenamiento (F07, F08, G11 a G15) pasaron al anexo A7. (02/11) Sin el respaldo, el A7 sale; lo
//   que el A1 decía del test (medido una vez, en la etapa 4: A 2.2 y D 8.1; Juan Manuel R. lo dice en voz alta) va
//   en la línea de qué mide el gráfico.
// - (02/11, W6 fase B, hallazgos.md) Los puntos son de precisión: lo dicen el rótulo, el eje y el fragmento de la
//   central (VIS-03, UX-05). Debajo del rótulo, la partición de C3 (D6.particion, A 2.2); al pie, lo que acierta la
//   lista que sale en test (D6.pie_test, COB-03) y, en el mismo renglón, la lista de 800 (D6.pie_800, COB-04: entra
//   a 1280 × 720). Los cuatro veredictos en una columna fija a la derecha y, bajo el eje, pegados al cero, hacia
//   qué lado gana cada uno (UX-19, VIS-08). Los extremos del intervalo, solo en la fila que decide; los subrótulos de
//   fila, a 13 px reales a 1280 × 720 (VIS-09). La tarjeta del costo dice «ni una lista perfecta lo paga» (UX-14,
//   VIS-10, DAT-16) y su unidad, «aciertos extra/mes» (la de VIS-10): «8.595 aciertos extra por mes» y «−0,25 puntos»
//   no entran juntos en la banda a 1366 × 768, 1536 × 864 ni 1920 × 1080 con ningún reparto (faltan de 12 a 18 px
//   reales). Con «/mes», anchos 8 / 9: la central y la del costo entran con 10 px o más de aire en las cinco.
// - (03/11, pedido del usuario: el forest tenía mucho texto) Las filas se agrupan por lista: a la izquierda, una vez por
//   grupo, «Sin filtrar · no se puede mandar» y «Lista que sale · 500 contactables por mes»; al lado, solo el período
//   de cada fila. Una línea fina separa los dos grupos. La conclusión dice el mensaje: «En la lista que sale, el modelo
//   empata con la regla». El renglón de qué mide pasa a los dos períodos (la partición completa y la lista de 800, al
//   title); al pie queda solo lo que acierta la lista que sale en test.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js) y se escriben con formato.js; el texto nuevo, de
// C3 (contenido_e3.js). Las notas (N) siguen leyendo el guion de las diapositivas 6 y 7 de C3 (vistas/index.jsx).

import { Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { NBSP, entero, fijo, mesAnio, pct, usd } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
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
// La partición (A 2.2) y lo que acierta la lista que sale en test (D 8.1), de la diapositiva 6 de C3.
const D6 = C3.DIAPOSITIVAS.find((d) => d.n === 6)
if (!D6?.particion || !D6?.pie_test || !D6?.pie_800) {
  throw new Error('V04: la diapositiva 6 de C3 no trae particion, pie_test o pie_800')
}

/** «enero a mayo de 2025»; con años distintos, los dos. */
function periodo(desde, hasta) {
  const a = mesAnio(desde)
  return `${desde.slice(0, 4) === hasta.slice(0, 4) ? a.replace(/ de \d{4}$/, '') : a} a ${mesAnio(hasta)}`
}
export const TEST = periodo(TE.conjunto.desde, TE.conjunto.hasta)
export const VALID = periodo(MD.validacion.desde, MD.validacion.hasta)

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

// Filas del gráfico. `decide`: la fila que decide, en --acc. `tenue`: validación, más fina. `grupo` y `sub` se escriben
// una vez por grupo de filas seguidas (03/11); `periodo`, en cada fila; `nombre`, en el aria-label y el title.
const NO_SALE = 'no se puede mandar'
const SALE = `${entero(LARGO)} contactables por mes`
export const FILAS_TODAS = [
  { id: 'sfv', nombre: 'Sin filtrar · validación', grupo: 'Sin filtrar', sub: NO_SALE, periodo: 'validación',
    valor: SFV.diferencia_pp, ic: SFV.ic95_pp, tenue: true },
  { id: 'sf', nombre: 'Sin filtrar · test', grupo: 'Sin filtrar', sub: NO_SALE, periodo: 'test',
    valor: SF.diferencia_pp, ic: SF.ic95_pp },
  { id: 'cov', nombre: 'Lista que sale · validación', grupo: 'Lista que sale', sub: SALE, periodo: 'validación',
    valor: CO.validacion_diferencia_pp, ic: CO.validacion_ic95_pp, tenue: true },
  { id: 'co', nombre: 'Lista que sale · test', grupo: 'Lista que sale', sub: SALE, periodo: 'test',
    valor: CO.diferencia_pp, ic: CO.ic95_pp, decide: true },
]

const marca = (t) => (t === 0 ? '0' : fijo(t, 0, true))
// (UX-19, VIS-08) los dos lados del cero, debajo del eje
const IZQ = '← gana la regla'
const DER = 'gana la logística →'

/**
 * Diferencia con su intervalo, una fila por lista. Marcas gruesas para proyector; la línea del 0 es el
 * empate. `k`: escala de la letra (useEscalaTexto). Con más filas que alto, todo se achica junto (`s`).
 */
export function Diferencias({ filas, w, h, k, tituloEje }) {
  // Abajo del eje, tres renglones: las marcas, hacia qué lado gana cada uno y el título.
  const ABAJO = 70 * k
  const pasoBruto = Math.min((h - (30 * k + ABAJO)) / filas.length, 165 * k)
  const s = Math.max(0.72, Math.min(1, pasoBruto / (118 * k)))
  const f = k * s
  const fsNom = 19 * f
  // (VIS-09) el subrótulo de fila y los extremos de la fila que decide, nunca debajo de 12 × k: 13 px reales a
  // 1280 × 720 con el zoom de .e3-vp
  const fsSub = Math.max(16.5 * f, 12 * k)
  const fsVer = 23 * f
  const fsVal = 17 * f
  const fsExt = Math.max(14 * f, 12 * k)
  const fsEje = 13.5 * k
  const fsPer = 17 * f

  // (03/11) Grupos de filas seguidas con la misma lista: el nombre y el subrótulo, una vez por grupo.
  const grupos = []
  filas.forEach((d, i) => {
    const g = grupos[grupos.length - 1]
    if (g && g.grupo === d.grupo) g.hasta = i
    else grupos.push({ grupo: d.grupo, sub: d.sub, desde: i, hasta: i, decide: false })
    if (d.decide) grupos[grupos.length - 1].decide = true
  })
  const anchoGrupo = Math.max(...grupos.map((g) => Math.max(anchoTexto(g.grupo, fsNom, 700),
    anchoTexto(g.sub, fsSub, 500)))) + 24 * k
  const anchoIzq = anchoGrupo + Math.max(...filas.map((d) => anchoTexto(d.periodo, fsPer, 700))) + 22 * k
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
  const paso = Math.min((h - (30 * k + ABAJO)) / filas.length, 165 * k)
  const yTop = (h - paso * filas.length - (30 * k + ABAJO)) / 2 + 30 * k
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
      {/* (UX-19, VIS-08) hacia qué lado gana cada uno, pegado al cero; debajo, el título del eje */}
      <text x={X(0) - 8 * k} y={yBase + 8 * k + fsEje * 2.25} fontSize={fsEje} textAnchor="end"
            fill="var(--e3-ctx, #5a6478)" fontWeight="600">{IZQ}</text>
      <text x={X(0) + 8 * k} y={yBase + 8 * k + fsEje * 2.25} fontSize={fsEje} textAnchor="start"
            fill="var(--e3-ctx, #5a6478)" fontWeight="600">{DER}</text>
      {/* (03/11) el título del eje como en las vistas 1, 2, 5, 7 y 8: mono, mayúsculas, en la punta derecha */}
      <text x={x1} y={yBase + 8 * k + fsEje * 3.8} fontSize={fsEje} textAnchor="end" fill="var(--e3-ctx, #5a6478)"
            fontWeight="600" fontFamily="var(--mono)" letterSpacing=".09em"
            style={{ textTransform: 'uppercase' }}>{tituloEje}</text>

      {/* el empate: la línea del 0. (03/11) Sin el rótulo «empate» encima: lo dicen el 0 del eje y los veredictos */}
      <line x1={X(0)} x2={X(0)} y1={yTop - 4 * k} y2={yBase} stroke="var(--e3-contorno, #4f5a6e)"
            strokeWidth={2.5 * k} />

      {/* (03/11) la lista de cada grupo, una vez, centrada en sus filas; una línea fina separa los grupos */}
      {grupos.map((g, j) => {
        const yc = yTop + paso * ((g.desde + g.hasta + 1) / 2)
        return (
          <g key={g.grupo}>
            {j > 0 && (
              <line x1={0} x2={anchoIzq - 10 * k} y1={yTop + paso * g.desde} y2={yTop + paso * g.desde}
                    stroke="var(--trk, #dfe1e0)" strokeWidth="1.5" />
            )}
            <text x={0} y={yc - fsSub * 0.25} fontSize={fsNom} fontWeight={g.decide ? 700 : 600}
                  fill={g.decide ? 'var(--ink)' : 'var(--e3-ctx, #5a6478)'}>{g.grupo}</text>
            <text x={0} y={yc + fsSub * 1.05} fontSize={fsSub} fill="var(--e3-ctx, #5a6478)" fontWeight="500">
              {g.sub}
            </text>
          </g>
        )
      })}

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
        // (UX-19) El veredicto, en una columna fija a la derecha del eje: los cuatro alineados.
        const xVer = x1 + 16 * k
        return (
          <g key={d.id}>
            <title>{`${d.nombre}, ${d.sub}: logística menos regla ${pp(d.valor)} puntos, intervalo del 95 % de ` +
              `${intervalo(d.ic)}. ${veredicto(d.ic)}.`}</title>
            <text x={anchoGrupo} y={y} fontSize={fsPer} fill={tinta} fontWeight={d.decide ? 700 : 600}
                  dominantBaseline="central">{d.periodo}</text>

            <line x1={X(a)} x2={X(b)} y1={y} y2={y} stroke={color} strokeWidth={gros} strokeLinecap="butt" />
            <line x1={X(a)} x2={X(a)} y1={y - remate / 2} y2={y + remate / 2} stroke={color}
                  strokeWidth={gros * 0.7} />
            <line x1={X(b)} x2={X(b)} y1={y - remate / 2} y2={y + remate / 2} stroke={color}
                  strokeWidth={gros * 0.7} />
            <circle cx={X(d.valor)} cy={y} r={r} fill={color} stroke="var(--sup, #fff)" strokeWidth={3 * f} />

            {/* el valor, sobre el punto; los extremos, a los costados de sus remates, solo en la fila que decide (VIS-09) */}
            <text x={xVal} y={y - r - 9 * f} fontSize={fsVal} textAnchor={anclaVal} fill={tinta}
                  fontWeight={d.decide ? 700 : 600} className="tabular e3-v04-halo">{pp(d.valor)}</text>
            {d.decide && [a, b].map((v, j) => (
              <text key={v} x={j ? X(v) + 10 * k : X(v) - 10 * k} y={y} fontSize={fsExt} dominantBaseline="central"
                    textAnchor={j ? 'start' : 'end'} fill="var(--e3-ctx, #5a6478)" fontWeight="500"
                    className="tabular e3-v04-halo">{pp(v)}</text>
            ))}

            {/* el veredicto, grande, en la columna de la derecha */}
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

export const meta = { id: 'V04', dc: 'C-MOD' }

export default function V04ModeloORegla() {
  const k = useEscalaTexto()
  const mide = `Validación: ${VALID} · test: ${TEST}, medido una vez`
  const conclusion = <>En la lista que sale, el modelo <b>empata</b> con la regla</>

  return (
    <section className="pant v04">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta e2-central" style={{ gridColumn: 'span 8' }} title={TITULO_LISTA}>
          <span className="kpi-lbl"><span>Lista que sale · test</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={pp(CO.diferencia_pp)} unidad={`${NBSP}puntos`} /></div>
          </div>
          <p className="e2-linea">de precisión: empata</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 9' }} title={TITULO_PAGA}>
          <span className="kpi-lbl"><span>Para pagar el modelo</span></span>
          <div className="ban-par">
            <div className="par-item par-unico">
              <Cifra num={entero(DE.aciertos_por_mes_para_pagar)} unidad={`${NBSP}aciertos extra/mes`} sec />
            </div>
          </div>
          <p className="e2-linea">ni una lista perfecta lo paga</p>
        </div>

      </Banda>

      <div className="tarjeta e3-v04-graf" title={`${TITULO_SF} ${D6.particion}. ${D6.pie_800}`}>
        <div className="e3-v04-cab">
          <div className="e3-v04-titulos">
            <p className="e3-v04-mide">{mide}</p>
            <p className="e3-conclusion">{conclusion}</p>
          </div>
        </div>
        <div className="e3-v04-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <Diferencias filas={FILAS_TODAS} w={w} h={h} k={k} tituloEje="Logística menos regla (puntos de precisión)" />
            )}
          </Lienzo>
        </div>
        <p className="e3-v04-pie">{D6.pie_test}</p>
      </div>
    </section>
  )
}
