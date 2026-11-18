// La forma común de las vistas de /final/ (17/11, F6): la de la vista 5 del E3. Arriba la banda (Banda del E2: las
// tarjetas de cifra y la tarjeta de decisión); abajo una tarjeta con un solo gráfico, qué mide en mono y la conclusión en
// tinta. Cada vista pasa sus tarjetas, las cifras de su conclusión y su dibujo; los textos salen de CF (textosDe) y las
// cifras, de DF. Nada de texto escrito acá.

import { Lienzo } from '../../src/graficos.jsx'
import Banda from '../../e2/src/Banda.jsx'
import { textosDe, decisionDe } from './textos.js'
import TarjetaCifra from './TarjetaCifra.jsx'
import { NBSP } from '../../e3/src/formato.js'

/** La conclusión: textos.conclusion, después cada cifra en negrita seguida del tramo que le corresponde de
 *  textos.sigue (un tramo por cifra). */
export function Conclusion({ T, cifras = [] }) {
  const sigue = T.sigue ?? []
  return (
    <p className="e3-conclusion">
      {cifras.length ? `${T.conclusion} ` : T.conclusion}
      {cifras.map((c, i) => (
        <span key={i}><b className="tabular">{c}</b>{sigue[i] ?? ''}</span>
      ))}
    </p>
  )
}

/** Las tarjetas de la banda, en orden: [{ clave, valor, span? }]; la primera es la central. `valor` es la cifra escrita
 *  con formato.js; el rótulo, el fragmento y la unidad (`unidad`, detrás y un escalón más chica, o `antes`, delante)
 *  salen de textos[clave]. */
export function Tarjetas({ T, items }) {
  return items.map((x, i) => {
    const t = T[x.clave]
    const valor = t.unidad ? `${x.valor}[[${NBSP}${t.unidad}]]` : x.valor
    return (
      <TarjetaCifra key={x.clave} central={i === 0} span={x.span ?? (i === 0 ? 3 : 2)} rotulo={t.rotulo}
                    linea={t.linea} valor={valor} antes={t.antes} title={t.title} />
    )
  })
}

export default function Vista({ id, items, cifras, lienzo = '', children }) {
  const T = textosDe(id)
  return (
    <section className={`pant fin-${id.toLowerCase()}`}>
      <Banda dcs={[decisionDe(T)]}>
        <Tarjetas T={T} items={items} />
      </Banda>
      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          <p className="fin-mide">{T.mide}</p>
          <Conclusion T={T} cifras={cifras} />
        </div>
        <div className={`fin-lienzo${lienzo ? ` ${lienzo}` : ''}`}>
          <Lienzo className="lienzo">{children}</Lienzo>
        </div>
      </div>
    </section>
  )
}
