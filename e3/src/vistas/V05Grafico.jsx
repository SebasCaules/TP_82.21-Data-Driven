// V05 · la tarjeta del gráfico de la vista 5 (Parte B 3.2 a 3.6; diapositivas 8 y 9 de C3).
//
// (03/11) Cuatro barras, por opción: costo y beneficio con modelo, costo y beneficio con la regla sola.
// (01/11, a la vista) TarjetaCostoBeneficio muestra tres barras con BarrasH (src/graficos.jsx; paridad_e3.py mide sus
// rótulos en esta vista): el costo del año 1 con modelo (D3.economia.costos.con_modelo, USD 30.660) y con la regla sola
// (USD 20.260), en --e3-ctx-relleno, contra el beneficio anual de la regla (D3.economia.observada.regla_usd, USD 299,49,
// en --acc), y la línea del presupuesto (USD 30.000). La astilla es el mensaje; la barra con modelo pasa la línea.
// Encabezado como las vistas 1 y 4: qué mide en mono (con «lista de 500 sin filtro en validación», que busca
// verificar_e3.py) y la conclusión en .e3-conclusion, la frase de la tarjeta «Económica» de la diapositiva 2 de C3 con
// el beneficio en --acc.
// (02/11) Sale el simulador de la tasa de éxito, que vivía en el anexo A3 (el archivo se llamaba V05_Simulador.jsx).
// Debajo del gráfico, una línea con lo vital de los anexos A7 y A3: el valor de cada caso (las celdas de la
// diapositiva 8, B 4.4) y la sensibilidad (la decisión de la diapositiva 9, B 3.5: ningún supuesto lleva el ROI a 0).
//
// (02/11, W6 fase B, hallazgos.md) Qué mide: D9.mide de C3, con la base de la Parte B (COB-06, VIS-13). Sale el
// título de eje «Dólares»: cada barra ya dice USD; la etiqueta del presupuesto, a la letra de los valores (VIS-12).
// En el pie, a la letra del texto, los escenarios a un año (D9.escenarios, COB-07, B 3.4) y la sensibilidad nueva.
//
// (03/11, pedido del usuario) Menos texto alrededor del gráfico y el eje rotulado: vuelve el título de eje «Dólares»
// (en la punta, mono, como las vistas 2 y 7) y el pie queda en un renglón, el valor de cada caso y que ningún escenario
// recupera el costo en un año. Los escenarios con su ROI y la sensibilidad pasan al title del pie (los dice el guion).
// Este archivo NO exporta `default`: vistas/index.jsx registra como vista todo `V*.jsx` con default.
// Ninguna cifra escrita acá: los montos salen de D3 con formato.js y el texto, de C3.

import { BarrasH, Lienzo } from '../../../src/graficos.jsx'
import { D3 } from '../datos_e3.js'
import { C3 } from '../contenido_e3.js'
import { fijo, pctDirecto, usd } from '../formato.js'
import { plano } from '../texto.jsx'
import { useEscalaTexto } from '../../../e2/src/escala.js'

const E = D3.economia
const D8 = C3.DIAPOSITIVAS.find((d) => d.n === 8)
const D9 = C3.DIAPOSITIVAS.find((d) => d.n === 9)
if (!D9?.mide || !D9?.escenarios) throw new Error('V05Grafico: la diapositiva 9 de C3 no trae mide o escenarios')
// La conclusión del gráfico: la frase de la tarjeta «Económica» de la diapositiva 2 de C3, sin el punto.
const ECO = C3.DIAPOSITIVAS.find((d) => d.n === 2).tarjetas.find((t) => t.area === 'Económica')
if (!ECO) throw new Error('V05Grafico: la diapositiva 2 de C3 no trae la tarjeta «Económica»')
const NO_RECUPERA = ECO.texto.replace(/\.$/, '')
// Las barras de costo, en el relleno de contexto del E3.
const CTX = 'var(--e3-ctx-relleno, #a9b1bf)'

const RC = E.regla_contactables                                           // H42
const RT = D3.test.roi_b_3_4.find((f) => f.fila === 'regla_sin_modelo')   // J12
if (!RT) throw new Error('V05Grafico: D3.test.roi_b_3_4 no trae la fila de la regla')
const COSTO_MODELO = E.costos.con_modelo.total_anio_1_usd
const COSTO_REGLA = E.costos.regla_sin_modelo.total_anio_1_usd

/** La letra de los valores de BarrasH (src/graficos.jsx, con título de eje: 48 de eje y 8 arriba). */
const valoresDe = (h, n) => Math.max(10.5, Math.min(13, ((h - 8 - 48) / n) * 0.42))

// Montos de las barras: centavos solo debajo de mil (USD 299,49; USD 30.660), como V05.
const monto = (v) => usd(v, v < 1000 ? 2 : 0)

// (02/11) La línea de abajo. El valor de cada caso: las celdas de la diapositiva 8 (acierto, falso positivo, falso
// negativo), con su valor tal cual (build_e3.py ancla G33 contra ese texto). La sensibilidad: la decisión de la
// diapositiva 9 después de la negrita, hasta el «;» («Ningún supuesto lleva el ROI a 0»).
const CELDAS = D8.celdas.map((c) => `${c.celda.toLowerCase()} ${c.valor}`)
if (CELDAS.length !== 3) throw new Error('V05Grafico: la diapositiva 8 de C3 no trae las tres celdas')
const SENSIBILIDAD = (plano(D9.decision).match(/\.\s*([^;.]+)/) ?? [])[1]
if (!/supuesto/.test(SENSIBILIDAD ?? '')) throw new Error('V05Grafico: la decisión de la diapositiva 9 no trae la sensibilidad')

/** La tarjeta del gráfico de V05: el costo del año 1, con modelo y con la regla sola, contra el beneficio anual de la
 *  regla, con la línea del presupuesto; debajo, el valor de cada caso y la sensibilidad. */
export function TarjetaCostoBeneficio() {
  const k = useEscalaTexto()
  const barras = [
    // (02/11, W6) «Costo año 1», como el rótulo de qué mide (D9.mide): dos palabras menos por el renglón de escenarios
    // (03/11, pedido del usuario) Por opción: cada costo con su beneficio debajo. El del modelo (G34, USD 304,87) es la
    // regla más los 5,38 de la tarjeta: las dos astillas casi iguales al lado de costos que difieren en 10.400.
    { etiqueta: 'Costo año 1, con modelo', valor: COSTO_MODELO, color: CTX },
    { etiqueta: 'Beneficio, con modelo', valor: E.observada.proyecto_usd, enfasis: true, anchoMin: 3 },
    { etiqueta: 'Costo año 1, regla sola', valor: COSTO_REGLA, color: CTX },
    { etiqueta: 'Beneficio, regla sola', valor: E.observada.regla_usd, enfasis: true, anchoMin: 3 },
  ]
  const conclusion = <>{`${NO_RECUPERA}: deja `}<b className="tabular">{monto(E.observada.regla_usd)}</b>{' por año'}</>
  const titulo = `Beneficio por año con modelo: ${monto(E.observada.proyecto_usd)}, ${monto(E.observada.modelo_usd)} más que la regla. `
    + `Beneficio anual de la regla con la lista de 500 sin filtro en los cortes de validación, el escenario `
    + `base de la B 3.4: ${monto(E.observada.regla_usd)}, ROI ${pctDirecto(E.observada.regla_roi_pct, 2)}. Con la lista `
    + `que sale, 500 contactables: ${monto(RC.usd_anio)} en validación (ROI ${pctDirecto(RC.roi_pct, 2)}) y `
    + `${monto(RT.contactables.usd)} en test (ROI ${pctDirecto(RT.contactables.roi_pct, 2)}, Parte D 11.2). Ninguna `
    + `recupera el costo en el año. Con modelo, el año 1 cuesta ${monto(COSTO_MODELO)} y pasa el presupuesto de `
    + `${monto(E.costos.presupuesto_usd)}; el detalle por componente, en la Parte B 3.2.`
  return (
    <div className="tarjeta e3-v05-graf" title={titulo}>
      <div className="e3-v05-cab">
        <div className="e3-v05-titulos">
          <p className="e3-v05-mide">{D9.mide}</p>
          <p className="e3-conclusion">{conclusion}</p>
        </div>
      </div>

      <div className="e3-v05-lienzo">
        <Lienzo className="lienzo">
          {({ w, h }) => (
            // --e3-v05-ref: la etiqueta del presupuesto (Plaqueta de 10) crece hasta la letra de los valores de BarrasH
            <div style={{ '--e3-v05-ref': valoresDe(h, barras.length) / 10 }}>
            <BarrasH
              datos={barras} w={w} h={h}
              formato={monto}
              formatoEje={(v) => fijo(v, 0)}
              tituloEje="Dólares"
              anchoEtiqueta={Math.round(230 * k)}
              referencia={{ valor: E.costos.presupuesto_usd, etiqueta: `presupuesto ${monto(E.costos.presupuesto_usd)}` }}
            />
            </div>
          )}
        </Lienzo>
      </div>

      <p className="e3-v05-pie" title={`${plano(D8.celdas.map((c) => `${c.celda}: ${c.texto}`).join(' '))} ${plano(D9.escenarios)} ${SENSIBILIDAD}. ${plano(D9.decision)}`}>
        <b>Por caso:</b> {CELDAS.join(' · ')}. Ningún escenario recupera el costo en un año.
      </p>
    </div>
  )
}
