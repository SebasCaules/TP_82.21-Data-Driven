// La forma común de las vistas de /final/ (17/11, F6; 18/11, fase 8: spec 1.1 a 1.3). Una sola forma para las quince:
// arriba la banda (Banda del E2) con la tarjeta de cifra (items[0]; con kpi.a, items[1..] en la subfila) y la tarjeta
// verde con su fila «Decisión · área · estado» pegada al borde superior (dec.a) o como franja llena (dec.b). Abajo, la
// tarjeta del gráfico: un renglón con la conclusión corta (cab.a) o con qué mide (cab.b), y el lienzo con todo lo que
// sobra. Las letras de las variantes salen de variante() (variantes.js) y llegan al CSS como clases de la sección
// (fin-dec-a, fin-kpi-a, fin-cab-a, …). Los textos salen de CF (textosDe) y las cifras, de DF. Nada de texto acá.
//
//   <Vista id="V08" items={[{ clave, valor }, …]} cifras={[…]}>{({ w, h }) => dibujo}</Vista>
//
// `valor` es la cifra ya escrita con formato.js; el rótulo, el fragmento y la unidad salen de textos[clave]. La prop
// `hibrido` de la fase 7 se acepta y no hace nada. VistaPlena (spec 1.5): sin banda ni tarjeta, el lienzo entero.

import { Lienzo } from '../../src/graficos.jsx'
import Banda from '../../e2/src/Banda.jsx'
import { textosDe, decisionDe } from './textos.js'
import TarjetaCifra from './TarjetaCifra.jsx'
import { NBSP } from '../../e3/src/formato.js'
import { variante } from './variantes.js'

/** La conclusión: textos.conclusion (puede ser '': el renglón empieza con la cifra), después cada cifra en negrita
 *  seguida de su tramo de textos.sigue (un tramo por cifra). Sin cifras, la conclusión sola. */
export function Conclusion({ T, cifras = [] }) {
  const sigue = T.sigue ?? []
  const inicio = T.conclusion ?? ''
  return (
    <p className="e3-conclusion">
      {inicio && cifras.length ? `${inicio} ` : inicio}
      {cifras.map((c, i) => (
        <span key={i}><b>{c}</b>{sigue[i] ?? ''}</span>
      ))}
    </p>
  )
}

/** Los textos de una cifra de la banda (textos[clave]), con un error que dice qué falta. */
function textosCifra(id, T, clave) {
  const t = T[clave]
  if (!t?.rotulo) throw new Error(`contenido_final.js: la vista «${id}» no trae textos.${clave} (rótulo y fragmento de su cifra)`)
  return t
}

/** La cifra con su unidad detrás (textos.unidad, al 0,6 entre [[…]]) o tal cual. */
const conUnidad = (t, valor) => (t.unidad ? `${valor}[[${NBSP}${t.unidad}]]` : valor)

/** La tarjeta de la banda: items[0] grande; con `sub`, items[1..] en la subfila (rótulo y valor; el fragmento de cada
 *  una va a su title). */
export function Tarjetas({ id = '', T, items, sub = false }) {
  if (!items.length) return null
  const [x, ...resto] = items
  const t = textosCifra(id, T, x.clave)
  const subs = sub
    ? resto.map((y) => {
      const s = textosCifra(id, T, y.clave)
      return { clave: y.clave, rotulo: s.rotulo, valor: conUnidad(s, y.valor), antes: s.antes, title: s.linea }
    })
    : []
  return (
    <TarjetaCifra central rotulo={t.rotulo} linea={t.linea} valor={conUnidad(t, x.valor)} antes={t.antes} title={t.title}
                  sub={subs} />
  )
}

export default function Vista({ id, items = [], cifras = [], children }) {
  const T = textosDe(id)
  const dec = variante('dec')
  const kpi = variante('kpi')
  const cab = variante('cab')
  const sub = kpi === 'a' && items.length > 1
  return (
    <section className={`pant fin-vista fin-dec-${dec} fin-kpi-${kpi} fin-cab-${cab} fin-${id.toLowerCase()}`}>
      <div className="fin-banda">
        <Banda dcs={[decisionDe(T)]}>
          <Tarjetas id={id} T={T} items={items} sub={sub} />
        </Banda>
      </div>
      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          {cab === 'b' ? <p className="fin-mide">{T.mide}</p> : <Conclusion T={T} cifras={cifras} />}
        </div>
        <div className="fin-lienzo" role="img" aria-label={T.mide}>
          <Lienzo className="lienzo">{children}</Lienzo>
        </div>
      </div>
    </section>
  )
}

/** Vista a pantalla completa (spec 1.5, `meta.plena`): sin banda ni tarjeta del gráfico; el dibujo recibe todo el lugar
 *  que App.jsx le da a la vista (w × h). Qué mide queda como aria-label. */
export function VistaPlena({ id, children }) {
  const T = textosDe(id)
  return (
    <section className={`pant fin-plena fin-${id.toLowerCase()}`}>
      <div className="fin-lienzo fin-lienzo-pleno" role="img" aria-label={T.mide}>
        <Lienzo className="lienzo">{children}</Lienzo>
      </div>
    </section>
  )
}
