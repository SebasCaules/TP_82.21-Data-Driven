// V01 de MUESTRA (17/11): prueba el armazón de /final/ con una banda (Banda y TarjetaDecision del E2), dos cifras de DF y
// un gráfico de src/graficos.jsx (BarrasH). La reemplaza la unidad de contenido.
// Ninguna cifra ni texto escrito acá: los valores salen de DF (final/src/datos_final.js, anclas por id del registro del
// E4) con formato.js y el texto, de CF.

import { BarrasH, Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { DF } from '../datos_final.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { textosDe, decisionDe } from '../textos.js'
import TarjetaCifra from '../TarjetaCifra.jsx'

const ID = 'V01'
const T = textosDe(ID)
const A = DF.anclas
const TOPE = fijo(DF.tablas.escala_tecnica.hasta, 0)

export const meta = { id: ID }

export default function V01Respuesta() {
  const k = useEscalaTexto()
  const barras = [
    { etiqueta: T.barras.logistica, valor: A['J03.logistica'].valor },
    { etiqueta: T.barras.regla, valor: A['J03.regla'].valor, enfasis: true },
    { etiqueta: T.barras.practica, valor: A.J17.valor },
  ]
  return (
    <section className="pant fin-v01">
      <Banda dcs={[decisionDe(T)]}>
        <TarjetaCifra central span={3} rotulo={T.central.rotulo} linea={T.central.linea}
                      valor={pct(A['J02.tasa'].valor, 2)} />
        <TarjetaCifra span={2} rotulo={T.secundaria.rotulo} linea={T.secundaria.linea}
                      valor={`${fijo(A.F16.valor, 2)}[[/${TOPE}]]`} />
      </Banda>

      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          <p className="fin-mide">{T.mide}</p>
          <p className="e3-conclusion">{T.conclusion}</p>
        </div>
        <div className="fin-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH datos={barras} w={w} h={h} formato={(v) => pct(v, 1)} formatoEje={(v) => pct(v, 0)}
                       anchoEtiqueta={Math.round(190 * k)} />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
