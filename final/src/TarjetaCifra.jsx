// Una tarjeta de cifra de la banda (17/11), la misma que repetían las vistas del E3 (V02, V05): rótulo de 22 caracteres o
// menos, una cifra (Cifra de e3/src/cifra.jsx) y un fragmento de 2 a 6 palabras sin otro número. La central va primera,
// sola al tamaño máximo; las demás, con `sec`. El rótulo y el fragmento salen de CF; la cifra, de DF con formato.js.

import { Cifra } from '../../e3/src/cifra.jsx'

export default function TarjetaCifra({ rotulo, valor, linea, title, central = false, span = 2 }) {
  return (
    <div className={`tarjeta${central ? ' e2-central' : ''}`} style={{ gridColumn: `span ${span}` }} title={title}>
      <span className="kpi-lbl"><span>{rotulo}</span></span>
      <div className="ban-par">
        <div className="par-item par-unico"><Cifra texto={valor} sec={!central} /></div>
      </div>
      <p className="e2-linea">{linea}</p>
    </div>
  )
}
