// Barras horizontales de /final/ (18/11, spec de dataviz f.1): BarrasFin, para V01, V02, V04, V05 y V08. Letra por la
// escala u (ESCALA de svg.jsx, piso de 20 u), sin eje ni marcas ni título de eje, rótulo directo, valor con su unidad
// pegado al extremo, nota en el mismo renglón, marca de contorno y tramo fantasma (lo que se fue en un paso). El bloque se
// centra en vertical en el lienzo y nunca se estira para llenarlo. BarrasH de src/graficos.jsx no se usa acá.
//
// La API de las vistas sigue siendo barras(props), que devuelve el dibujo para Lienzo:
//   barras({ datos, maximo? })
//   datos: [{ etiqueta, valor, texto, nota?, foco?, contorno?, separado?, fantasma?, fantasmaFoco?, notaFantasma? }]
// `texto` es el valor ya escrito con formato.js (con su unidad: «USD 4.485», «86,1 %»): acá no se formatea nada.

import { useU } from './escala.js'
import { ACC, CTX, FIN_GRIS, INK, TRAZO, BarraH, LineaBase, ancho, rectRedondo, tam } from './svg.jsx'

/** Ancho de la columna de rótulos: el más largo a 26 u y 600, más 24 u. */
export const anchoEtiquetas = (datos, u) =>
  Math.ceil(Math.max(0, ...datos.map((d) => ancho(d.etiqueta, tam('cat', u), 600)))) + 24 * u

function geometria(datos, w, h, u, maximo, fuera) {
  const n = datos.length + datos.filter((d) => d.separado).length
  const paso = Math.min(128 * u, h / Math.max(1, n))
  const t = Math.min(64 * u, 0.5 * paso)
  const rot = anchoEtiquetas(datos, u)
  const anchoVal = (d) => ancho(d.texto, tam(d.foco ? 'valFoco' : 'val', u), d.foco ? 700 : 600)
  const anchoNota = (d) => Math.max(
    d.nota ? ancho(d.nota, tam('sec', u), 400) : 0,
    d.notaFantasma && fuera.has(d) ? ancho(d.notaFantasma, tam('cat', u), 700) : 0,
  )
  const hayNota = datos.some((d) => anchoNota(d) > 0)
  const cola = Math.max(...datos.map(anchoVal)) + 12 * u + (hayNota ? Math.max(...datos.map(anchoNota)) + 16 * u : 0)
  const max = maximo ?? Math.max(...datos.map((d) => Math.max(d.valor, d.fantasma ?? 0)))
  const largo = Math.max(0, w - rot - cola)
  const escala = (v) => (max > 0 ? (Math.max(0, v) / max) * largo : 0)
  return { paso, t, rot, escala, alto: n * paso }
}

export function BarrasFin({ w, h, datos, maximo }) {
  const u = useU()
  if (!datos?.length) return null
  // primera pasada con las notas fantasma adentro; las que no entran pasan a la derecha y se mide de nuevo
  let fuera = new Set()
  let g = geometria(datos, w, h, u, maximo, fuera)
  const noEntra = (gg, d) => d.notaFantasma &&
    ancho(d.notaFantasma, tam('cat', u), 700) + 32 * u > gg.escala(d.fantasma) - gg.escala(d.valor)
  fuera = new Set(datos.filter((d) => noEntra(g, d)))
  if (fuera.size) {
    g = geometria(datos, w, h, u, maximo, fuera)
    fuera = new Set(datos.filter((d) => noEntra(g, d)))
  }
  const { paso, t, rot, escala, alto } = g
  const x0 = rot
  const y0 = Math.max(0, (h - alto) / 2)
  let y = y0
  const filas = datos.map((d) => {
    if (d.separado) y += paso
    const fila = { d, yc: y + paso / 2 }
    y += paso
    return fila
  })
  const sep = TRAZO.separacion * u
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      {filas.map(({ d, yc }) => {
        const yb = yc - t / 2
        const largo = escala(d.valor)
        const xf = d.fantasma != null ? x0 + escala(d.fantasma) : null
        const extremo = Math.max(x0 + Math.max(largo, d.contorno ? 4 * u : 0), xf ?? 0)
        const fVal = tam(d.foco ? 'valFoco' : 'val', u)
        const xVal = extremo + 12 * u
        const anchoV = ancho(d.texto, fVal, d.foco ? 700 : 600)
        const notaFuera = d.notaFantasma && fuera.has(d)
        const xNota = xVal + anchoV + 16 * u
        return (
          <g key={d.etiqueta}>
            <title>{[d.etiqueta, d.texto, d.nota, d.notaFantasma].filter(Boolean).join(' · ')}</title>
            <text x={x0 - 24 * u} y={yc} fontSize={tam('cat', u)} fontWeight={d.foco ? 600 : 400}
                  fill={d.foco ? INK : CTX} textAnchor="end" dominantBaseline="central">{d.etiqueta}</text>
            <BarraH u={u} x={x0} y={yb} largo={largo} t={t} foco={d.foco} contorno={d.contorno} />
            {xf != null && xf - (x0 + largo) > sep && (
              d.fantasmaFoco
                ? <path d={rectRedondo(x0 + largo + sep + u, yb + u, xf - x0 - largo - sep - 2 * u, t - 2 * u, TRAZO.radio * u)}
                        fill={ACC} fillOpacity={0.12} stroke={ACC} strokeWidth={2 * u} />
                : <path d={rectRedondo(x0 + largo + sep + 0.75 * u, yb + 0.75 * u, xf - x0 - largo - sep - 1.5 * u, t - 1.5 * u, TRAZO.radio * u)}
                        fill="none" stroke={FIN_GRIS} strokeWidth={1.5 * u} />
            )}
            {d.notaFantasma && !notaFuera && (
              <text x={(x0 + largo + xf) / 2} y={yc} fontSize={tam('cat', u)} fontWeight={700} fill={INK}
                    textAnchor="middle" dominantBaseline="central">{d.notaFantasma}</text>
            )}
            <text x={xVal} y={yc} fontSize={fVal} fontWeight={d.foco ? 700 : 600} fill={INK}
                  dominantBaseline="central">{d.texto}</text>
            {d.nota && (
              <text x={xNota} y={yc} fontSize={tam('sec', u)} fill={CTX} dominantBaseline="central">{d.nota}</text>
            )}
            {notaFuera && (
              <text x={d.nota ? xNota + ancho(d.nota, tam('sec', u), 400) + 16 * u : xNota} y={yc}
                    fontSize={tam('cat', u)} fontWeight={700} fill={INK} dominantBaseline="central">{d.notaFantasma}</text>
            )}
          </g>
        )
      })}
      <LineaBase u={u} x={x0} y1={y0} y2={y0 + alto} />
    </svg>
  )
}

/** El dibujo para Lienzo: recibe { w, h } y devuelve el BarrasFin. */
export const barras = (props) => function Dibujo({ w, h }) {
  return <BarrasFin datos={props.datos} maximo={props.maximo} w={w} h={h} />
}

