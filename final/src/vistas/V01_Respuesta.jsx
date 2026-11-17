// V01 de MUESTRA (17/11): prueba el armazón de /final/ con una banda (Banda y TarjetaDecision del E2), dos cifras de D3 y
// un gráfico de src/graficos.jsx (BarrasH). La reemplaza la unidad de contenido.
// Ninguna cifra ni texto escrito acá: los valores salen de D3 (e3/src/datos_e3.js) con formato.js y el texto, de CF.

import { BarrasH, Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { D3 } from '../../../e3/src/datos_e3.js'
import { fijo, pct } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { textosDe, decisionDe } from '../textos.js'
import TarjetaCifra from '../TarjetaCifra.jsx'

const ID = 'V01'
const T = textosDe(ID)
const TE = D3.test
const TOPE = fijo(D3.tecnica.escala[D3.tecnica.escala.length - 1].hasta, 0)
const M = TE.metodos

export const meta = { id: ID }

export default function V01Respuesta() {
  const k = useEscalaTexto()
  const barras = [
    { etiqueta: T.barras.logistica, valor: M.logistica_ajustada.test.precision },
    { etiqueta: T.barras.regla, valor: M.regla.test.precision, enfasis: true },
    { etiqueta: T.barras.practica, valor: M.practica_actual.test.precision },
  ]
  return (
    <section className="pant fin-v01">
      <Banda dcs={[decisionDe(T)]}>
        <TarjetaCifra central span={3} rotulo={T.central.rotulo} linea={T.central.linea}
                      valor={pct(TE.conjunto.tasa, 2)} />
        <TarjetaCifra span={2} rotulo={T.secundaria.rotulo} linea={T.secundaria.linea}
                      valor={`${fijo(D3.tecnica.promedio, 2)}[[/${TOPE}]]`} />
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
