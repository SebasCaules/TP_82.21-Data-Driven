// La forma común de las vistas de /final/ (17/11, F6; 18/11, fase 8; 19/11, fase 9: spec 3). Una sola forma para las
// quince, con las ramas que eligió el usuario fijas: arriba la banda (Banda del E2) con la tarjeta de una sola cifra
// (items[0]; banda de 180 u, sin subfila) y la tarjeta verde con su fila «Decisión · área · estado» pegada al borde
// superior. Abajo, la tarjeta del gráfico: un renglón con la conclusión corta y el lienzo con todo lo que sobra. Los
// textos salen de CF (textosDe) y las cifras, de DF. Nada de texto acá.
//
//   <Vista id="V08" items={[{ clave, valor }]} cifras={[…]}>{({ w, h }) => dibujo}</Vista>
//
// `valor` es la cifra ya escrita con formato.js; el rótulo, el fragmento y la unidad salen de textos[clave]. Si la vista
// pasa más de un ítem, se usa el primero (las demás cifras ya no van en la banda). La banda y la conclusión están desde
// el paso 1 del avance: lo que se revela por pasos es el dibujo (Paso de svg.jsx). La prop `hibrido` de la fase 7 se
// acepta y no hace nada. VistaPlena (spec 1.5 de la fase 8): sin banda ni tarjeta, el lienzo entero.
// VistaLienzo (19/11, fase 10, spec 3): el lienzo con esqueleto. App.jsx dibuja el riel y el encabezado como en toda
// vista (sección, título, «n / 15 · cita», puntos del avance) y el cuerpo entero, dentro de su relleno, es lienzo: sin
// banda, sin tarjeta de decisión y sin la tarjeta blanca del gráfico. La usa el cierre (V15).

import { Lienzo } from '../../src/graficos.jsx'
import Banda from '../../e2/src/Banda.jsx'
import { textosDe, decisionDe } from './textos.js'
import TarjetaCifra from './TarjetaCifra.jsx'
import { NBSP } from '../../e3/src/formato.js'

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

/** La tarjeta de la banda: la cifra central (items[0]) con su rótulo, su fragmento y su unidad (textos[clave]). */
export function Tarjetas({ id = '', T, items }) {
  if (!items.length) return null
  const x = items[0]
  const t = T[x.clave]
  if (!t?.rotulo) throw new Error(`contenido_final.js: la vista «${id}» no trae textos.${x.clave} (rótulo y fragmento de su cifra)`)
  // la unidad detrás de la cifra, al 0,6 entre [[…]] (Cifra de e3/src/cifra.jsx)
  const valor = t.unidad ? `${x.valor}[[${NBSP}${t.unidad}]]` : x.valor
  return <TarjetaCifra central rotulo={t.rotulo} linea={t.linea} valor={valor} antes={t.antes} title={t.title} />
}

export default function Vista({ id, items = [], cifras = [], children }) {
  const T = textosDe(id)
  return (
    <section className={`pant fin-vista fin-${id.toLowerCase()}`}>
      <div className="fin-banda">
        <Banda dcs={[decisionDe(T)]}>
          <Tarjetas id={id} T={T} items={items} />
        </Banda>
      </div>
      <div className="tarjeta fin-graf">
        <div className="fin-cab">
          <Conclusion T={T} cifras={cifras} />
        </div>
        <div className="fin-lienzo" role="img" aria-label={T.mide}>
          <Lienzo className="lienzo">{children}</Lienzo>
        </div>
      </div>
    </section>
  )
}

/** Vista a pantalla completa (spec 1.5 de la fase 8, `meta.plena`): sin banda ni tarjeta del gráfico; el dibujo recibe
 *  todo el lugar que App.jsx le da a la vista (w × h). Qué mide queda como aria-label. */
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

/** Lienzo con esqueleto (spec 3 de la fase 10): la vista conserva el riel y el encabezado (los pone App.jsx; la vista NO
 *  declara `plena`) y el cuerpo entero es lienzo, sin banda ni tarjetas. El dibujo recibe { w, h } del cuerpo dentro de su
 *  relleno (a 1920 × 1080 con el riel: unos 1540 × 896 u). Qué mide queda como aria-label.
 *    export default function V15() { return <VistaLienzo id="V15">{({ w, h }) => <Dibujo w={w} h={h} />}</VistaLienzo> } */
export function VistaLienzo({ id, children }) {
  const T = textosDe(id)
  return (
    <section className={`pant fin-vista-lienzo fin-${id.toLowerCase()}`}>
      <div className="fin-lienzo fin-lienzo-esqueleto" role="img" aria-label={T.mide}>
        <Lienzo className="lienzo">{children}</Lienzo>
      </div>
    </section>
  )
}
