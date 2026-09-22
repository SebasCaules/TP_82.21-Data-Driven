// Cifra grande de un par antes/después cuando es un monto («ARS 94,9 M»): la moneda y la
// unidad van un escalón más chicas (.par-unidad, estilos_e2.css) y todo en un renglón
// (D5-04 de la auditoría del 22/09). Para cualquier otro texto devuelve el texto tal cual.
import { partesMonto } from './formato.js'

export default function ValorMonto({ texto, className = 'par-val tabular' }) {
  const p = partesMonto(texto)
  return (
    <span className={className}>
      {p ? (<><span className="par-unidad">{p.pre}</span>{p.num}<span className="par-unidad">{p.suf}</span></>) : texto}
    </span>
  )
}
