// Una tarjeta de cifra de la banda (17/11; 18/11, spec de dataviz e.1): rótulo de 22 caracteres o menos (20 u, mono,
// mayúsculas: el único texto en mono, R17), una cifra (48 u, 700, tinta; 36 u la segunda tarjeta de V04) y un fragmento
// de 2 a 6 palabras sin otro número (24 u, --e3-ctx). La central va primera, con el borde superior en --acc. El rótulo y
// el fragmento salen de CF; la cifra, de DF con formato.js. `antes`: una palabra al 0,6 delante del número («semana
// 28»). La grilla de la banda reparte el ancho (estilos_final.css): sin span en línea y sin tabular.

import { Cifra } from '../../e3/src/cifra.jsx'

function CifraAntes({ antes, valor, sec }) {
  return (
    <span className={`par-val e2-cifra${sec ? ' sec' : ''}`}>
      <span className="par-unidad">{`${antes} `}</span>{valor}
    </span>
  )
}

export default function TarjetaCifra({ rotulo, valor, linea, title, antes, central = false }) {
  return (
    <div className={`tarjeta${central ? ' e2-central' : ''}`} title={title}>
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
