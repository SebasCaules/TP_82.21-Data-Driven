// La tarjeta de cifra de la banda (17/11; 19/11, fase 9: una sola cifra, sin subfila): rótulo de 22 caracteres o menos
// (20 u, mono, mayúsculas), la cifra central (60 u, 700, acento) y su fragmento de 2 a 6 palabras sin otro número (24 u).
// El rótulo y el fragmento salen de CF; la cifra, de DF con formato.js. `antes`: una palabra al 0,6 delante del número
// («semana 28»).

import { Cifra } from '../../e3/src/cifra.jsx'
import { NBSP } from '../../e3/src/formato.js'

function CifraAntes({ antes, valor, sec }) {
  return (
    <span className={`par-val e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{`${antes}${NBSP}`}</span>{valor}
    </span>
  )
}

export default function TarjetaCifra({ rotulo, valor, linea, title, antes, central = false }) {
  return (
    <div className={`tarjeta fin-cifra${central ? ' e2-central' : ''}`} title={title}>
      <span className="kpi-lbl"><span>{rotulo}</span></span>
      <div className="ban-par fin-fila">
        <div className="par-item par-unico">
          {antes ? <CifraAntes antes={antes} valor={valor} sec={!central} /> : <Cifra texto={valor} sec={!central} />}
        </div>
        <p className="e2-linea">{linea}</p>
      </div>
    </div>
  )
}
