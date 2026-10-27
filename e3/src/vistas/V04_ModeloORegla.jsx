// V04 · ¿El modelo mejora a la regla? (Parte A 2.2, 2.3 y 2.5 · Parte B 4.1 a 4.5 · Parte C 7.1 a 7.3 ·
// Parte D 8.1, 8.2, 11.1 y 11.2; diapositivas 6 y 7 de C3). (27/10, W2) Misma forma que V05: banda de cifras
// con la tarjeta de decisión a la derecha y un gráfico a todo el ancho debajo.
//
// (27/10, W3) Arreglo. Hasta W2 la vista mostraba solo validación (julio a septiembre de 2024) sin decirlo, y
// su decisión, «ningún modelo le gana a la regla por más que el ruido», no la sostiene el test: sin filtrar,
// la logística gana con un intervalo que excluye el cero (Parte D 11.2). Ahora cada cifra dice de qué
// conjunto es, y la banda y la decisión dicen lo que sostiene el test (Parte D 8.2 y 11.1):
//
// - Banda, todo en test (enero a mayo de 2025, D3.test):
//   - «Sin filtrar · test»: logística menos regla en la lista de 500 sin filtro, con su intervalo (J11). En
//     el title, lo mismo en validación con la logística de la Parte B (G17) y por qué esa lista no sale.
//   - «Lista que sale · test», la central y la única al tamaño máximo (regla 13 H1 del E2): logística menos
//     regla en la lista de 500 contactables, con su intervalo, que incluye el cero (J09). Es la comparación
//     del criterio de la C 6.2, fila 13. En el title, las dos precisiones (J03) y la validación (J09, H16 y H48).
//   - «Para pagarlo»: los aciertos de más por mes que pagan los USD 10.400 del modelo (J10, G40). En el
//     title, lo que el test da en las dos listas (J09, J11).
//   Anchos 3 / 3 / 2, como en W2: con la letra ×k, una frase de tres renglones (o de dos bajo la cifra
//   grande) agranda la banda.
// - Decisión: «C-MOD · sale la regla» de decisiones.js. La frase corta (≤ 60 caracteres) se escribe acá,
//   como en V01, porque C3 (presentación v1.2) no trae la Parte D: «No: en la lista que sale empata y no
//   paga su costo». Sale de test.decision (J10) y del intervalo de J09; si la etapa 4 dejara de sostenerla,
//   el módulo corta el armado. La regla es test.decision.resultado; el detalle, al title.
// - Gráfico: logística menos regla, en puntos, con intervalo del 95 %, en las dos listas y los dos
//   conjuntos (G17, J11, J09 en validación y en test). La fila que decide, «Lista que sale · test», en
//   --acc; validación en trazo fino. A la derecha, lo que dice cada intervalo: gana uno o empatan.
//   La fila «Sin filtrar · validación» es la logística de la Parte B (G17), no la ajustada que va al test:
//   la de la C 7.1 (H06) no está en D3. Si build_e3.py la suma, va en esa fila; el title de la tarjeta lo
//   dice mientras tanto.
// - Explorar (sin cambios desde W2): la precisión de la lista de 500 sin filtrar por modelo, en validación
//   o en entrenamiento (F07, F08, G11, G13 a G15; techo G12). Son las Partes A a C, rotuladas.
// Ninguna cifra escrita acá: los valores salen de D3 (datos_e3.js). Las notas (N) siguen leyendo el guion
// de las diapositivas 6 y 7 de C3 (vistas/index.jsx), que es de validación: el guion del test lo suma W4.

import { useState } from 'react'
import { Lienzo, BarrasH, PuntosIC, escalaNice } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../datos_e3.js'
import { NBSP, entero, fijo, mesAnio, pct, usd } from '../formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { decision } from '../decisiones.js'
import { BotonExplorar, Opciones } from '../controles.jsx'
import { Cifra } from '../cifra.jsx'

const MD = D3.modelos
const L = D3.lista
const TE = D3.test
const LARGO = L.elegida.largo_mes
const SF = TE.sin_filtro       // J11: lista de 500 sin filtro, test
const CO = TE.contra_regla     // J09: lista de 500 contactables, test (y su validación)
const DE = TE.decision         // J10: el criterio de la C 6.2, fila 13, medido en test
const MET = TE.metodos         // J03: precisión de cada método en test

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

// La decisión. La frase corta dice «empata» y «no paga su costo», y el detalle, que sin filtrar gana la
// logística: se comprueba contra la etapa 4.
if (!DE.sigue_la_regla || DE.condicion_2 || veredicto(CO.ic95_pp) !== 'empate'
    || veredicto(SF.ic95_pp) !== 'gana la logística') {
  throw new Error('V04: la etapa 4 ya no sostiene «No: en la lista que sale empata y no paga su costo»')
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
  `${fijo(SF.aciertos_de_mas_por_mes, 2)} aciertos más por mes. En validación (${VALID}), la logística de la ` +
  `Parte B sumaba ${pp(MD.contra_regla.diferencia_pp)} puntos, de ${intervalo(MD.contra_regla.ic95_pp)}. Esa ` +
  'lista incluye clientes que no aceptan marketing: no se puede mandar.'
const TITULO_LISTA = `Logística menos regla en la lista de ${entero(LARGO)} contactables por mes, la que sale, en ` +
  `test (${TEST}): ${pp(CO.diferencia_pp)} puntos, intervalo del 95${NBSP}% de ${intervalo(CO.ic95_pp)}, que ` +
  `incluye el cero. La regla acierta ${pct(MET.regla.test.precision, 1)} y la logística ` +
  `${pct(MET.logistica_ajustada.test.precision, 1)}. En validación (${VALID}), la regla acertaba ` +
  `${entero(L.regla_menos_modelo_500_contactables.aciertos)} clientes más: ${pp(CO.validacion_diferencia_pp)} ` +
  `puntos, de ${intervalo(CO.validacion_ic95_pp)}.`
const TITULO_PAGA = `El modelo agrega ${usd(DE.costo_incremental_usd)} al costo del primer año. Pagarlo pide ` +
  `${entero(DE.aciertos_por_mes_para_pagar)} aciertos más por mes en una lista de ${entero(LARGO)}` +
  `${DE.aciertos_por_mes_para_pagar > LARGO ? ': ni una lista perfecta lo paga' : ''}. En test suma ` +
  `${fijo(CO.aciertos_extra_por_mes, 2, true)} aciertos por mes en la lista que sale y ` +
  `${fijo(SF.aciertos_de_mas_por_mes, 2, true)} sin filtrar.`

// El gráfico que llega: una fila por lista y conjunto, de arriba abajo como se contó (Partes B y C, después
// el test). La que decide, en --acc; validación, en trazo fino (`tenue` de PuntosIC).
const FILAS = [
  { etiqueta: 'Sin filtrar · validación', valor: MD.contra_regla.diferencia_pp, ic: MD.contra_regla.ic95_pp,
    tenue: true },
  { etiqueta: 'Sin filtrar · test', valor: SF.diferencia_pp, ic: SF.ic95_pp },
  { etiqueta: 'Lista que sale · validación', valor: CO.validacion_diferencia_pp, ic: CO.validacion_ic95_pp,
    tenue: true },
  { etiqueta: 'Lista que sale · test', valor: CO.diferencia_pp, ic: CO.ic95_pp, enfasis: true },
].map((f) => ({ ...f, nota: veredicto(f.ic) }))

// PuntosIC (src/graficos.jsx, compartido con el E1, no se toca) dibuja de 0 hacia la derecha. Las
// diferencias van corridas CORRE puntos y el formato lo descuenta: el eje marca de −CORRE a +AIRE con el
// cero en una marca (CORRE y CORRE + AIRE, múltiplos del paso del eje). La referencia es la línea del
// empate; su intervalo, de ancho cero, va al final del eje y le deja un paso de aire al rótulo del valor
// más alto (sin él, el eje cerraba en +2 y «+1,06», escrito después de +1,95, se salía del gráfico).
function eje(filas) {
  let corre = Math.ceil(-Math.min(0, ...filas.map((f) => f.ic[0])))
  let fin = corre + Math.ceil(Math.max(0, ...filas.map((f) => f.ic[1]))) + 1
  for (let i = 0; i < 4; i++) {
    const paso = escalaNice(fin).ticks[1]
    const c = Math.ceil(corre / paso - 1e-9) * paso
    const f = Math.ceil((fin - corre + c) / paso - 1e-9) * paso
    if (c === corre && f === fin) break
    corre = c
    fin = f
  }
  return { corre, aire: fin - corre }
}
const { corre: CORRE, aire: AIRE } = eje(FILAS)
const CORRIDAS = FILAS.map((f) => ({ ...f, valor: f.valor + CORRE, ic: [f.ic[0] + CORRE, f.ic[1] + CORRE] }))
const EMPATE = { valor: CORRE, ic: [CORRE + AIRE, CORRE + AIRE] }
/** Marcas del eje enteras («−4», «0», «+3»); valores con dos decimales, como en la Parte D. */
const formatoPuntos = (v) => {
  const x = v - CORRE
  return Math.abs(x - Math.round(x)) < 1e-9 ? fijo(Math.round(x), 0, true) : pp(x)
}

// Explorar (W2): la precisión de la lista de 500 sin filtrar por modelo, en validación o en entrenamiento.
const CONJUNTOS = [{ valor: 'validacion', texto: 'Validación' }, { valor: 'entrenamiento', texto: 'Entrenamiento' }]

export const meta = { id: 'V04', dc: 'C-MOD' }

export default function V04ModeloORegla() {
  const k = useEscalaTexto()
  const [explorar, setExplorar] = useState(false)
  const [conjunto, setConjunto] = useState('validacion')
  const ent = conjunto === 'entrenamiento'
  // Tope de alto por fila, como en W2: con el alto de las seis barras, las cuatro filas quedaban sueltas a 1920.
  const tope = Math.round(((explorar ? MD.filas.length : FILAS.length) * 56 + 56) * k)
  const barras = MD.filas.filter((f) => f[conjunto]).map((f) => ({
    etiqueta: f.nombre,
    valor: f[conjunto].precision,
    enfasis: f.grupo === 'regla',
  }))
  const techo = MD.entrenamiento.techo_precision
  return (
    <section className="pant v04">
      <Banda dcs={[DECISION]}>
        <div className="tarjeta" style={{ gridColumn: 'span 3' }} title={TITULO_SF}>
          <span className="kpi-lbl"><span>Sin filtrar · test</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={pp(SF.diferencia_pp)} sec /></div>
          </div>
          <p className="e2-linea">{`puntos para la logística, de ${intervalo(SF.ic95_pp)}`}</p>
        </div>

        <div className="tarjeta e2-central" style={{ gridColumn: 'span 3' }} title={TITULO_LISTA}>
          <span className="kpi-lbl"><span>Lista que sale · test</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={pp(CO.diferencia_pp)} /></div>
          </div>
          <p className="e2-linea">{`puntos, de ${intervalo(CO.ic95_pp)}`}</p>
        </div>

        <div className="tarjeta" style={{ gridColumn: 'span 2' }} title={TITULO_PAGA}>
          <span className="kpi-lbl"><span>Para pagarlo</span></span>
          <div className="ban-par">
            <div className="par-item par-unico"><Cifra num={entero(DE.aciertos_por_mes_para_pagar)} sec /></div>
          </div>
          <p className="e2-linea">aciertos más por mes</p>
        </div>
      </Banda>

      <div className="tarjeta" style={{ flex: '1 1 0', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1cqw, 16px)' }}>
          <span className="kpi-lbl frase" style={{ flex: '1 1 auto' }}>
            {explorar ? (
              <>
                <span>{`Precisión de la lista de ${entero(LARGO)} por mes, sin filtrar${ent ? ', en entrenamiento' : ''}`}</span>
                <b className="tabular">
                  {ent
                    ? `${MD.entrenamiento.cortes} cortes; techo ${pct(techo, 1)}`
                    : `${entero(MD.validacion.largo_lista)} contactos en ${MD.validacion.cortes} meses de validación`}
                </b>
              </>
            ) : (
              <>
                <span>{`Logística menos regla en la lista de ${entero(LARGO)} por mes, en puntos`}</span>
                <b className="tabular">{`validación: ${VALID} · test: ${TEST}`}</b>
              </>
            )}
          </span>
          {explorar && (
            <Opciones etiqueta="Conjunto" valor={conjunto} onCambio={setConjunto} opciones={CONJUNTOS} />
          )}
          <BotonExplorar abierto={explorar}
                         onCambio={(v) => { setExplorar(v); if (!v) setConjunto('validacion') }} />
        </div>
        <div style={{ flex: '1 1 0', minHeight: 0, maxHeight: tope, marginTop: 'clamp(6px, 1.6cqh, 20px)',
                      display: 'flex', flexDirection: 'column' }}>
          <Lienzo className="lienzo">
            {({ w, h }) => (explorar ? (
              <BarrasH
                datos={barras} w={w} h={h}
                formato={(v) => pct(v, 1)}
                formatoEje={(v) => pct(v, 0)}
                anchoEtiqueta={Math.round(270 * k)}
                tituloEje="Precisión de la lista"
                tope={1}
              />
            ) : (
              <PuntosIC
                datos={CORRIDAS} w={w} h={h}
                formato={formatoPuntos}
                tituloEje="Logística menos regla (puntos)"
                anchoEtiqueta={Math.round(215 * k)}
                referencia={EMPATE}
              />
            ))}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
