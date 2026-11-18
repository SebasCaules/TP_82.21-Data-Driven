// La forma común de las vistas de /final/ (17/11, F6; 18/11, spec de dataviz d y e). Arriba la banda (Banda del E2):
// la tarjeta de cifra, o dos en V04, y la tarjeta de decisión; sin tarjetas, la decisión ocupa la banda entera (variante
// sola). Abajo, una tarjeta con un solo gráfico, centrado en vertical en su lienzo. Qué mide no se dibuja: es el
// aria-label del lienzo. La conclusión aparece solo si la vista la pide (conclusion), hoy solo V13. Los textos salen de
// CF (textosDe) y las cifras, de DF. Nada de texto escrito acá.
//
//   <Vista id="V08" items={[{ clave, valor }]} conclusion={false} cifras={[]}>{dibujo}</Vista>

import { Lienzo } from '../../src/graficos.jsx'
import Banda from '../../e2/src/Banda.jsx'
import { textosDe, decisionDe } from './textos.js'
import TarjetaCifra from './TarjetaCifra.jsx'
import { NBSP } from '../../e3/src/formato.js'

/** La conclusión: textos.conclusion, después cada cifra en negrita seguida del tramo que le corresponde de
 *  textos.sigue (un tramo por cifra). Tinta; la cifra en 700, sin acento (estilos_final.css). */
export function Conclusion({ T, cifras = [] }) {
  const sigue = T.sigue ?? []
  return (
    <p className="e3-conclusion">
      {cifras.length ? `${T.conclusion} ` : T.conclusion}
      {cifras.map((c, i) => (
        <span key={i}><b>{c}</b>{sigue[i] ?? ''}</span>
      ))}
    </p>
  )
}

/** Las tarjetas de la banda, en orden: [{ clave, valor }]; la primera es la central. `valor` es la cifra escrita con
 *  formato.js; el rótulo, el fragmento y la unidad (`unidad`, detrás al 0,6, o `antes`, delante) salen de
 *  textos[clave]. `span` se ignora: la grilla de la banda reparte el ancho. */
export function Tarjetas({ T, items }) {
  return items.map((x, i) => {
    const t = T[x.clave]
    const valor = t.unidad ? `${x.valor}[[${NBSP}${t.unidad}]]` : x.valor
    return (
      <TarjetaCifra key={x.clave} central={i === 0} rotulo={t.rotulo} linea={t.linea} valor={valor} antes={t.antes}
                    title={t.title} />
    )
  })
}

export default function Vista({ id, items = [], cifras = [], conclusion = false, children }) {
  const T = textosDe(id)
  return (
    <section className={`pant fin-${id.toLowerCase()}`}>
      <div className={`fin-banda ${items.length ? 'fin-banda-cifra' : 'fin-banda-sola'}`}>
        <Banda dcs={[decisionDe(T)]}>
          <Tarjetas T={T} items={items} />
        </Banda>
      </div>
      <div className="tarjeta fin-graf">
        {conclusion && (
          <div className="fin-cab">
            <Conclusion T={T} cifras={cifras} />
          </div>
        )}
        <div className="fin-lienzo" role="img" aria-label={T.mide}>
          <Lienzo className="lienzo">{children}</Lienzo>
        </div>
      </div>
    </section>
  )
}
