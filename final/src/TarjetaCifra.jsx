// La tarjeta de cifra de la banda (17/11; 18/11, fase 8, spec 1.1 kpi): rótulo de 22 caracteres o menos (20 u, mono,
// mayúsculas), la cifra central (60 u, 700, acento) y su fragmento de 2 a 6 palabras sin otro número (24 u). Con `sub`
// (kpi.a), el fragmento va al lado de la cifra y debajo queda la subfila: las otras cifras de la vista en chico, lado a
// lado, cada una con su rótulo (20 u, mono) y su valor (34 u, 700, tinta); su fragmento va al title. Una sola cifra
// extra va en un renglón (rótulo y valor seguidos), para que la subfila no quede a medias. El rótulo y el fragmento salen
// de CF; la cifra, de DF con formato.js. `antes`: una palabra al 0,6 delante del número («semana 28»).

import { Cifra, partirCifra } from '../../e3/src/cifra.jsx'
import { NBSP } from '../../e3/src/formato.js'

function CifraAntes({ antes, valor, sec }) {
  return (
    <span className={`par-val e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{`${antes}${NBSP}`}</span>{valor}
    </span>
  )
}

/** Una cifra de la subfila: rótulo arriba (o al lado, si va sola) y valor con su unidad al 0,6, delante o detrás. */
function SubCifra({ rotulo, valor, antes, title }) {
  const [moneda, n, unidad] = partirCifra(valor)
  const delante = antes ?? moneda
  return (
    <div className="fin-sub-item" title={title}>
      <span className="fin-sub-lbl">{rotulo}</span>
      <span className="fin-sub-val tabular">
        {delante && <span className="fin-sub-u">{`${delante}${NBSP}`}</span>}
        {n}
        {unidad && <span className="fin-sub-u">{unidad}</span>}
      </span>
    </div>
  )
}

export default function TarjetaCifra({ rotulo, valor, linea, title, antes, central = false, sub = [] }) {
  const conSub = sub.length > 0
  return (
    <div className={`tarjeta fin-cifra${central ? ' e2-central' : ''}${conSub ? ' fin-con-sub' : ''}`} title={title}>
      <span className="kpi-lbl"><span>{rotulo}</span></span>
      <div className="ban-par fin-fila">
        <div className="par-item par-unico">
          {antes ? <CifraAntes antes={antes} valor={valor} sec={!central} /> : <Cifra texto={valor} sec={!central} />}
        </div>
        <p className="e2-linea">{linea}</p>
      </div>
      {conSub && (
        <div className={`fin-sub fin-sub-${sub.length}`}>
          {sub.map((s) => <SubCifra key={s.clave ?? s.rotulo} {...s} />)}
        </div>
      )}
    </div>
  )
}
