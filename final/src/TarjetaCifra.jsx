// Una tarjeta de cifra de la banda (17/11), la misma que repetían las vistas del E3 (V02, V05): rótulo de 22 caracteres o
// menos, una cifra (Cifra de e3/src/cifra.jsx) y un fragmento de 2 a 6 palabras sin otro número. La central va primera,
// sola al tamaño máximo; las demás, con `sec`. El rótulo y el fragmento salen de CF; la cifra, de DF con formato.js.
// `antes`: una palabra un escalón más chica delante del número («semana 28»), como «USD» en los montos y como la cifra
// de semana de la vista 8 del E3.

import { Cifra } from '../../e3/src/cifra.jsx'

function CifraAntes({ antes, valor, sec }) {
  return (
    <span className={`par-val tabular e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{`${antes} `}</span>{valor}
    </span>
  )
}

export default function TarjetaCifra({ rotulo, valor, linea, title, antes, central = false, span = 2 }) {
  return (
    <div className={`tarjeta${central ? ' e2-central' : ''}`} style={{ gridColumn: `span ${span}` }} title={title}>
      <span className="kpi-lbl"><span>{rotulo}</span></span>
      <div className="ban-par">
        <div className="par-item par-unico">
          {antes ? <CifraAntes antes={antes} valor={valor} sec={!central} /> : <Cifra texto={valor} sec={!central} />}
        </div>
      </div>
      <p className="e2-linea">{linea}</p>
    </div>
  )
}
