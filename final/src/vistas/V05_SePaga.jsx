// V05 de MUESTRA (17/11): la estructura de la vista 5 del E3 (tres cifras en la banda, costo contra beneficio con
// BarrasH y la línea del presupuesto, un renglón al pie) con los textos de CF. Es la vista que scripts/paridad_final.py
// compara con la vista 4 del E2: si cambia, cambia la vista de referencia de ese script (--vista). La central va en --acc
// (en /e3/ iba en terracota). La reemplaza la unidad de contenido.
// Ninguna cifra ni texto escrito acá: los valores salen de DF (final/src/datos_final.js, anclas por id del registro del
// E4) con formato.js y el texto, de CF.

import { BarrasH, Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { DF } from '../datos_final.js'
import { fijo, pctDirecto, usd } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { textosDe, decisionDe } from '../textos.js'
import TarjetaCifra from '../TarjetaCifra.jsx'
import './V05.css'

const ID = 'V05'
const T = textosDe(ID)
const A = DF.anclas
const CTX = 'var(--e3-ctx-relleno, #a9b1bf)'
// Montos: centavos solo debajo de mil (USD 299,49; USD 30.660), como la vista 5 del E3.
const monto = (v) => usd(v, v < 1000 ? 2 : 0)
/** La letra de los valores de BarrasH (src/graficos.jsx, con título de eje: 48 de eje y 8 arriba). */
const valoresDe = (h, n) => Math.max(10.5, Math.min(13, ((h - 8 - 48) / n) * 0.42))

export const meta = { id: ID }

export default function V05SePaga() {
  const k = useEscalaTexto()
  const B = T.barras
  const barras = [
    { etiqueta: B.costo_modelo, valor: A.G38.valor, color: CTX },
    { etiqueta: B.beneficio_modelo, valor: A['G34.modelo'].valor, enfasis: true, anchoMin: 3 },
    { etiqueta: B.costo_regla, valor: A.G39.valor, color: CTX },
    { etiqueta: B.beneficio_regla, valor: A['G34.regla'].valor, enfasis: true, anchoMin: 3 },
  ]
  return (
    <section className="pant fin-v05">
      <Banda dcs={[decisionDe(T)]}>
        <TarjetaCifra central span={3} rotulo={T.central.rotulo} linea={T.central.linea}
                      valor={pctDirecto(A.G41.valor, 2)} />
        <TarjetaCifra span={2} rotulo={T.suma.rotulo} linea={T.suma.linea} valor={usd(A['G34.incremental'].valor, 2)} />
        <TarjetaCifra span={2} rotulo={T.cuesta.rotulo} linea={T.cuesta.linea} valor={fijo(A.G40.valor)} />
      </Banda>

      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          <p className="fin-mide">{T.mide}</p>
          <p className="e3-conclusion">
            {`${T.conclusion} `}<b className="tabular">{monto(A['G34.regla'].valor)}</b>{` ${T.conclusion_fin}`}
          </p>
        </div>
        <div className="fin-lienzo fin-v05-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <div style={{ '--fin-v05-ref': valoresDe(h, barras.length) / 10 }}>
                <BarrasH datos={barras} w={w} h={h} formato={monto} formatoEje={(v) => fijo(v, 0)} tituloEje={B.eje}
                         anchoEtiqueta={Math.round(230 * k)}
                         referencia={{ valor: A.C28.valor, etiqueta: `${B.presupuesto} ${monto(A.C28.valor)}` }} />
              </div>
            )}
          </Lienzo>
        </div>
        <p className="fin-pie">{T.pie}</p>
      </div>
    </section>
  )
}
