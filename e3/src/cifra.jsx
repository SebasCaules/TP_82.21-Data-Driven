// La cifra de una tarjeta de la banda (27/10, W2), con su unidad un escalón más chica (.par-unidad),
// como los montos del E2 (ValorMonto): «USD 5,38», «−99,95 %», «2,25/3», «500/mes», «3 de 13». Antes
// cada vista tenía su copia (Monto, Porcentaje, Cifra).
//
// - `texto`: una cifra ya escrita, de formato.js o de C3. La unidad es lo que va entre [[…]] (C3), el
//   « %» final (formato.js y C3 lo pegan con espacio duro) o la moneda de adelante (USD, ARS).
// - `num` y `unidad`: la cifra y la unidad por separado, cuando la unidad no viene en el texto.
// - `sec`: un escalón más chica y en gris, la cifra secundaria de la banda (regla 13 H1 del E2).

import { NBSP } from './formato.js'
import { sinCortes } from './texto.jsx'

/** «2,25[[/3]]» → ['', '2,25', '/3']; «−99,95 %» → ['', '−99,95', ' %']; «USD 5,38» → ['USD', '5,38', '']. */
export function partirCifra(t) {
  const s = sinCortes(String(t))
  const chica = s.match(/^(.*?)\[\[(.+?)\]\]$/)
  if (chica) return ['', chica[1], chica[2]]
  const moneda = s.match(new RegExp(`^(USD|ARS)[ ${NBSP}](.+)$`))
  if (moneda) return [moneda[1], moneda[2], '']
  const i = s.lastIndexOf(`${NBSP}%`)
  if (i > 0 && s.endsWith('%')) return ['', s.slice(0, i), s.slice(i)]
  return ['', s, '']
}

export function Cifra({ texto, num, unidad = '', sec = false }) {
  const [antes, n, u] = texto != null ? partirCifra(texto) : ['', num, unidad]
  return (
    <span className={`par-val tabular e2-cifra${sec ? ' sec' : ''}`}>
      {antes && <span className="par-unidad">{antes}{' '}</span>}
      {n}
      {u && <span className="par-unidad">{u}</span>}
    </span>
  )
}
