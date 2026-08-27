// D6 — el costo de equivocarse de criterio (dirección 17e). La vista sigue contestando si
// algo rinde más que el criterio actual, pero deja de contestarlo solo en tasa: pone la
// decisión en pesos y en compras esperadas, que es la comparación que el directorio va a
// hacer igual.
//
// Por qué no son barras ordenadas. Hasta el 26/08/2026 esta vista dibujaba los criterios como
// barras desde cero, de mayor a menor. Ese orden no lo sostienen los datos: los intervalos se
// solapan de a pares y con las tasas iguales el azar reproduce la amplitud observada en una de
// cada tres corridas. Lo que se dibuja es lo que el título dice.
//
// Las dos columnas tienen precisión distinta, y ese contraste ES la vista:
//   · la tasa de compra sale de una muestra chica y llega con un intervalo que se come
//     cualquier diferencia entre criterios;
//   · la exposición cubierta es aritmética de la base, sin ruido, y las diferencias son de
//     decenas de millones.
// Por eso el criterio se elige por cobertura y no por tasa.
//
// De dónde sale cada fila (series.criterios_orden, pipeline/series.py): cada criterio define
// un subconjunto de la base en riesgo, se toman los 800 de mayor anualizado —lo que Marketing
// ejecutaría— y se mide la tasa de las campañas que YA salieron a esos mismos clientes. No es
// un experimento: los criterios no se asignaron al azar y sus bases se pisan. Sirve para
// mostrar que ninguna diferencia sobrevive a su intervalo, no para estimar el efecto de
// cambiar de criterio.
//
// La vara no es el máximo de los cinco segmentos de campaña: `series.py` la fija a
// "Inactivos 90d" porque es el criterio que Marketing usa hoy y la Parte D §5 lo declara como
// baseline. Elegirla por ser la más alta habría sido sesgo de selección.

import { Lienzo, PuntosIC } from '../graficos.jsx'
import { entero, millones, pct, series } from '../agregacion.js'
import { Def } from '../Glosario.jsx'

const ic100 = (ic) => [ic[0] * 100, ic[1] * 100]
const unaDecimal = (v) => v.toFixed(1).replace('.', ',')

export default function D6() {
  const co = series.criterios_orden
  const capacidad = co.capacidad
  const filasCampania = series.embudo_campanias.por_segmento_completa
  const marca = series.embudo_campanias.marca_a_superar.segmento
  const vara = filasCampania.find((f) => f.segmento === marca)
  const marcaPct = vara.compra_7dias * 100
  const marcaIc = ic100(vara.compra_7dias_ic)

  const actual = co.criterios[0]

  // Compras esperadas en `capacidad` envíos: la tasa observada multiplicada por la capacidad,
  // con el intervalo propagado por el mismo factor. No es un pronóstico, es la aritmética de
  // una tasa que ya se reporta; el intervalo viaja para que no se lea como cifra cerrada.
  const esperadas = (c) => c.compra_7dias * capacidad
  const esperadasIc = (c) => c.compra_7dias_ic.map((x) => x * capacidad)

  const datos = [
    { etiqueta: 'Score de propensión', vacio: true, nota: 'en desarrollo · no hay modelo entrenado' },
    {
      etiqueta: `Vara · ${marca}`,
      valor: marcaPct, ic: marcaIc, enfasis: true,
      nota: `${entero(vara.envios)} envíos · ${entero(vara.compras)} compras`,
    },
    ...co.criterios.map((c) => ({
      etiqueta: c.criterio,
      valor: c.compra_7dias * 100,
      ic: ic100(c.compra_7dias_ic),
      tenue: true,
      nota: `${entero(c.envios)} envíos · ${entero(c.compras)} compras`,
    })),
  ]

  const peor = co.criterios.reduce((m, c) => (c.costo_exposicion < m.costo_exposicion ? c : m), actual)
  const alternativos = co.criterios.filter((c) => c !== actual)
  const costos = alternativos.map((c) => -c.costo_exposicion)
  const costoMin = Math.min(...costos)
  const costoMax = Math.max(...costos)
  const todosSolapan = alternativos.every((c) => c.solapa_con_actual)

  const veredicto = (c) => {
    if (c === actual) return { texto: 'se mantiene', malo: false }
    if (!c.solapa_con_actual) return { texto: 'la tasa sí se distingue: revisar', malo: false }
    return { texto: 'no compensa', malo: true }
  }

  return (
    <section className="pant">
      <h1 className="titulo">
        Cambiar de criterio no gana compras y cuesta de {millones(costoMin)} a{' '}
        {millones(costoMax)} de cobertura
      </h1>
      <p className="bajada">
        Ningún <Def id="ic-wilson">intervalo</Def> alternativo se separa del de la vara, que
        es {marca}: el <Def id="criterio-orden">criterio</Def> que Marketing usa hoy, no el
        mejor de los cinco. <Def id="compras-esperadas">Compras esperadas</Def> = tasa ×{' '}
        {entero(capacidad)} envíos, con su intervalo propagado.
      </p>

      <div className="lienzo" style={{ flexDirection: 'column', gap: 'clamp(6px, 1vh, 14px)' }}>
        <Lienzo>
          {({ w, h }) => (
            <PuntosIC
              datos={datos} w={w} h={h}
              formato={(v) => pct(v, 2)}
              tituloEje="% de compra a 7 días del envío, por criterio (IC 95 % de Wilson)"
              anchoEtiqueta={158}
              referencia={{ valor: marcaPct, ic: marcaIc, rotulo: 'IC 95 % de la vara' }}
            />
          )}
        </Lienzo>

        <div className="tarjeta" style={{ flex: '0 0 auto' }}>
          <table className="lista-tabla">
            <thead>
              <tr>
                <th><Def id="criterio-orden">Criterio de orden</Def></th>
                <th className="num"><Def id="capacidad">Alcance</Def></th>
                <th className="num"><Def id="compras-esperadas">Compras esperadas</Def></th>
                <th className="num"><Def id="exposicion">Exposición cubierta</Def></th>
                <th className="num">Costo vs. actual</th>
                <th>Veredicto</th>
              </tr>
            </thead>
            <tbody>
              {co.criterios.map((c) => {
                const v = veredicto(c)
                const corto = c.clientes < capacidad
                return (
                  <tr key={c.criterio} className={c === actual ? 'activa' : undefined}>
                    <td className="destacado">
                      {c.criterio === 'Azar' ? <Def id="azar">{c.criterio}</Def> : c.criterio}
                    </td>
                    <td className={corto ? 'num no' : 'num'}>
                      {corto ? `${entero(c.clientes)} de ${entero(capacidad)}` : entero(c.clientes)}
                    </td>
                    <td className="num">
                      <b className="destacado">{unaDecimal(esperadas(c))}</b>
                      {'  '}
                      <span style={{ color: 'var(--mut)' }}>{esperadasIc(c).map(unaDecimal).join('–')}</span>
                    </td>
                    <td className="num destacado">{millones(c.exposicion)}</td>
                    <td className={c === actual ? 'num' : 'num no'}>
                      {c === actual ? '—' : `−${millones(-c.costo_exposicion)}`}
                    </td>
                    <td className={v.malo ? 'no' : undefined}>{v.texto}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="kpi-base" style={{ display: 'flex', gap: 'clamp(14px, 2.4vw, 40px)', flexWrap: 'wrap' }}>
            <span>
              {todosSolapan
                ? 'Las diferencias en compras esperadas caben todas dentro de los intervalos'
                : 'Hay un criterio cuya tasa se separa de la vara: mirarlo antes de decidir'}
            </span>
            <span>Las diferencias en cobertura no: van de {millones(costoMin)} a {millones(costoMax)}</span>
            <span>Compras esperadas en {entero(capacidad)} envíos, con su IC 95 %</span>
            <span>Por eso el criterio se elige por cobertura, no por tasa</span>
          </div>
        </div>
      </div>

      <p className="z-nota">
        Compras esperadas = tasa observada × {entero(capacidad)} envíos, con el intervalo
        propagado. Los criterios no se asignaron al azar y sus bases se pisan entre sí: la tasa
        muestra que ninguna diferencia sobrevive a su intervalo, no estima el efecto de cambiar
        de criterio. El peor caso, {peor.criterio}, deja {millones(-peor.costo_exposicion)} de
        exposición sin cubrir.
      </p>
    </section>
  )
}
