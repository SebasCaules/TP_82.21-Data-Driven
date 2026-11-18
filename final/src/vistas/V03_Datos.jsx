// V03 de MUESTRA (17/11): segunda vista de prueba del armazón de /final/, en otro bloque y con otro integrante, para
// ejercitar el riel, las notas y los tiempos por bloque. La reemplaza la unidad de contenido.
// Ninguna cifra ni texto escrito acá: los valores salen de DF (final/src/datos_final.js, anclas por id del registro del
// E4) con formato.js y el texto, de CF.

import { BarrasH, Lienzo } from '../../../src/graficos.jsx'
import Banda from '../../../e2/src/Banda.jsx'
import { DF } from '../datos_final.js'
import { entero, fijo, pctDirecto } from '../../../e3/src/formato.js'
import { useEscalaTexto } from '../../../e2/src/escala.js'
import { textosDe, decisionDe } from '../textos.js'
import TarjetaCifra from '../TarjetaCifra.jsx'

const ID = 'V03'
const T = textosDe(ID)
const A = DF.anclas
const TOPE = DF.tablas.escala_tecnica.hasta

export const meta = { id: ID }

export default function V03Datos() {
  const k = useEscalaTexto()
  const barras = DF.tablas.condiciones.map((c) => ({ etiqueta: c.nombre, valor: c.puntaje, enfasis: c.id === 'capacidad_humana' }))
  return (
    <section className="pant fin-v03">
      <Banda dcs={[decisionDe(T)]}>
        <TarjetaCifra central span={3} rotulo={T.central.rotulo} linea={T.central.linea}
                      valor={pctDirecto(A.C19.valor, 1)} />
        <TarjetaCifra span={2} rotulo={T.secundaria.rotulo} linea={T.secundaria.linea}
                      valor={entero(A.G10.valor)} />
      </Banda>

      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          <p className="fin-mide">{T.mide}</p>
          <p className="e3-conclusion">{T.conclusion}</p>
        </div>
        <div className="fin-lienzo">
          <Lienzo className="lienzo">
            {({ w, h }) => (
              <BarrasH datos={barras} w={w} h={h} formato={(v) => `${fijo(v, 0)} de ${fijo(TOPE, 0)}`}
                       formatoEje={(v) => fijo(v, Number.isInteger(v) ? 0 : 1)} tope={TOPE} anchoEtiqueta={Math.round(190 * k)} />
            )}
          </Lienzo>
        </div>
      </div>
    </section>
  )
}
