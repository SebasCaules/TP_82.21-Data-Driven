// BarrasH de src/graficos.jsx (el componente del E1, el E2 y el E3, sin tocar) con el ancho de etiqueta medido sobre los
// rótulos reales, para las vistas de /final/ que comparan cantidades en barras horizontales (17/11, F6).

import { BarrasH } from '../../src/graficos.jsx'
import { ancho } from './svg.jsx'

/** El ancho de la columna de rótulos: el rótulo más largo a la letra máxima de BarrasH (15 px, 600) más su margen. */
export const anchoEtiquetas = (datos) => Math.ceil(Math.max(...datos.map((d) => ancho(d.etiqueta, 15, 600)))) + 18

/** El dibujo para Lienzo: recibe { w, h } y devuelve el BarrasH. */
export const barras = (props) => function Dibujo({ w, h }) {
  return <BarrasH {...props} w={w} h={h} anchoEtiqueta={props.anchoEtiqueta ?? anchoEtiquetas(props.datos)} />
}
