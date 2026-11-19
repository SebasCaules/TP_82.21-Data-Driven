// Barras horizontales de /final/ (18/11, spec de dataviz f.1; 18/11, fase 8, spec 1.4): BarrasFin, para V01, V02, V04,
// V05 y V08. Letra por la escala u (ESCALA de svg.jsx, piso de 20 u). Filas equiespaciadas que llenan el alto del lienzo
// (el bloque ocupa el 92 %), rótulo directo a la izquierda, valor con su unidad pegado al extremo, nota en el mismo
// renglón, marca de contorno y tramo fantasma (lo que se fue en un paso). Debajo, el eje X (EjeX de svg.jsx): línea,
// marcas con su valor y el título del eje con su unidad, con una grilla fina detrás de las barras. BarrasH de
// src/graficos.jsx no se usa acá.
//
// La API de las vistas sigue siendo barras(props), que devuelve el dibujo para Lienzo:
//   barras({ datos, maximo?, eje, marcas?, formatoEje? })
//   datos: [{ etiqueta, valor, texto, nota?, foco?, contorno?, fantasma?, fantasmaFoco?, notaFantasma?, paso?, oculto? }]
// `texto` es el valor ya escrito con formato.js (con su unidad: «USD 4.485», «86,1 %»): acá no se formatea nada.
// `eje`: el título del eje (de CF: barras.eje). `marcas`: los valores con marca (por defecto, escalaLinda hasta `maximo`
// o hasta el mayor valor); el eje termina en la última marca. `formatoEje`: cómo se escribe cada marca (formato.js).
// (19/11, fase 9, spec 2.2) `paso` en un dato: la fila entera (rótulo, barra, valor y nota) se enciende en ese paso del
// avance y antes se ve atenuada (Paso de svg.jsx); sin `paso`, desde el paso 1. El eje y la línea base, siempre.
// (fase 10) Antes de su paso la fila es boceto: la barra tenue y sin acento, sin rótulo, valor ni nota (Paso oculta los
// textos). `oculto: true` en un dato: la fila no se ve hasta su paso y entra (regla 2).

import { useU } from './escala.js'
import { ACC, CTX, FIN_GRIS, INK, SUP, TRAZO, BarraH, EjeX, LineaBase, Paso, altoEjeX, ancho, escalaLinda, rectRedondo,
  tam } from './svg.jsx'
import { fijo } from '../../e3/src/formato.js'

/** Ancho de la columna de rótulos: el más largo a 26 u y 600, más 24 u. */
export const anchoEtiquetas = (datos, u) =>
  Math.ceil(Math.max(0, ...datos.map((d) => ancho(d.etiqueta, tam('cat', u), 600)))) + 24 * u

/** Parte del alto del lienzo que ocupa el bloque (filas y eje), centrado. */
const LLENA = 0.92

function geometria({ datos, w, h, u, maximo, marcas, formatoEje, eje, fuera }) {
  const n = datos.length
  const abajo = altoEjeX(u, Boolean(eje))
  const bloque = LLENA * h
  const paso = Math.max(0, bloque - abajo) / Math.max(1, n)
  const t = Math.min(120 * u, 0.5 * paso)
  const rot = anchoEtiquetas(datos, u)
  const anchoVal = (d) => ancho(d.texto, tam(d.foco ? 'valFoco' : 'val', u), d.foco ? 700 : 600)
  const anchoNota = (d) => Math.max(
    d.nota ? ancho(d.nota, tam('sec', u), 400) : 0,
    d.notaFantasma && fuera.has(d) ? ancho(d.notaFantasma, tam('cat', u), 700) : 0,
  )
  const hayNota = datos.some((d) => anchoNota(d) > 0)
  const max = maximo ?? Math.max(...datos.map((d) => Math.max(d.valor, d.fantasma ?? 0)))
  const ms = marcas ?? escalaLinda(max).marcas
  const tope = Math.max(max, ms[ms.length - 1])
  // la última marca va centrada en el final del eje: su mitad tiene que entrar a la derecha
  const medioUltima = ancho(formatoEje(ms[ms.length - 1]), tam(23, u), 400) / 2
  const cola = Math.max(
    Math.max(...datos.map(anchoVal)) + 12 * u + (hayNota ? Math.max(...datos.map(anchoNota)) + 16 * u : 0),
    medioUltima,
  )
  const largo = Math.max(0, w - rot - cola)
  const escala = (v) => (tope > 0 ? (Math.max(0, v) / tope) * largo : 0)
  const y0 = (h - bloque) / 2
  return { paso, t, rot, escala, largo, y0, yEje: y0 + n * paso, marcas: ms, tope }
}

export function BarrasFin({ w, h, datos, maximo, marcas, formatoEje = (x) => fijo(x), eje }) {
  const u = useU()
  if (!datos?.length) return null
  const base = { datos, w, h, u, maximo, marcas, formatoEje, eje }
  // primera pasada con las notas fantasma adentro; las que no entran pasan a la derecha y se mide de nuevo
  let fuera = new Set()
  let g = geometria({ ...base, fuera })
  const noEntra = (gg, d) => d.notaFantasma &&
    ancho(d.notaFantasma, tam('cat', u), 700) + 32 * u > gg.escala(d.fantasma) - gg.escala(d.valor)
  fuera = new Set(datos.filter((d) => noEntra(g, d)))
  if (fuera.size) {
    g = geometria({ ...base, fuera })
    fuera = new Set(datos.filter((d) => noEntra(g, d)))
  }
  const { paso, t, rot, escala, largo, y0, yEje, tope } = g
  const x0 = rot
  const sep = TRAZO.separacion * u
  const halo = { stroke: SUP, strokeWidth: 8 * u, paintOrder: 'stroke', strokeLinejoin: 'round' }
  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden="true">
      <EjeX u={u} x0={x0} x1={x0 + largo} y={yEje} min={0} max={tope} marcas={g.marcas} formato={formatoEje} titulo={eje}
            grilla yGrilla={y0} />
      {datos.map((d, i) => {
        const yc = y0 + (i + 0.5) * paso
        const yb = yc - t / 2
        const largoB = escala(d.valor)
        const xf = d.fantasma != null ? x0 + escala(d.fantasma) : null
        const extremo = Math.max(x0 + Math.max(largoB, d.contorno ? 4 * u : 0), xf ?? 0)
        const fVal = tam(d.foco ? 'valFoco' : 'val', u)
        const xVal = extremo + 12 * u
        const anchoV = ancho(d.texto, fVal, d.foco ? 700 : 600)
        const notaFuera = d.notaFantasma && fuera.has(d)
        // con la nota del fantasma adentro, el valor va dentro de su barra (en gris, tinta a 5,1:1), no después del fantasma
        const valDentro = d.notaFantasma && !notaFuera && !d.foco && !d.contorno && anchoV + 24 * u <= largoB
        const xNota = xVal + anchoV + 16 * u
        return (
          <Paso key={d.etiqueta} n={d.paso ?? 1} oculto={d.oculto === true}>
            <title>{[d.etiqueta, d.texto, d.nota, d.notaFantasma].filter(Boolean).join(' · ')}</title>
            <text x={x0 - 24 * u} y={yc} fontSize={tam('cat', u)} fontWeight={d.foco ? 600 : 400}
                  fill={d.foco ? INK : CTX} textAnchor="end" dominantBaseline="central">{d.etiqueta}</text>
            <BarraH u={u} x={x0} y={yb} largo={largoB} t={t} foco={d.foco} contorno={d.contorno} />
            {xf != null && xf - (x0 + largoB) > sep && (
              d.fantasmaFoco
                ? <path d={rectRedondo(x0 + largoB + sep + u, yb + u, xf - x0 - largoB - sep - 2 * u, t - 2 * u, TRAZO.radio * u)}
                        fill={ACC} fillOpacity={0.12} stroke={ACC} strokeWidth={2 * u} />
                : <path d={rectRedondo(x0 + largoB + sep + 0.75 * u, yb + 0.75 * u, xf - x0 - largoB - sep - 1.5 * u, t - 1.5 * u, TRAZO.radio * u)}
                        fill={SUP} stroke={FIN_GRIS} strokeWidth={1.5 * u} />
            )}
            {d.notaFantasma && !notaFuera && (
              <text x={(x0 + largoB + xf) / 2} y={yc} fontSize={tam('cat', u)} fontWeight={700} fill={INK}
                    textAnchor="middle" dominantBaseline="central">{d.notaFantasma}</text>
            )}
            <text x={valDentro ? x0 + largoB - 12 * u : xVal} y={yc} fontSize={fVal} fontWeight={d.foco ? 700 : 600} fill={INK}
                  textAnchor={valDentro ? 'end' : 'start'} dominantBaseline="central" {...(valDentro ? {} : halo)}>{d.texto}</text>
            {d.nota && (
              <text x={xNota} y={yc} fontSize={tam('sec', u)} fill={CTX} dominantBaseline="central" {...halo}>{d.nota}</text>
            )}
            {notaFuera && (
              <text x={d.nota ? xNota + ancho(d.nota, tam('sec', u), 400) + 16 * u : xNota} y={yc}
                    fontSize={tam('cat', u)} fontWeight={700} fill={INK} dominantBaseline="central" {...halo}>{d.notaFantasma}</text>
            )}
          </Paso>
        )
      })}
      <LineaBase u={u} x={x0} y1={y0} y2={yEje} />
    </svg>
  )
}

/** El dibujo para Lienzo: recibe { w, h } y devuelve el BarrasFin. `llenar` (fase 7) se acepta y no hace nada: las
 *  filas siempre llenan el lienzo. */
export const barras = (props) => function Dibujo({ w, h }) {
  return <BarrasFin datos={props.datos} maximo={props.maximo} marcas={props.marcas} formatoEje={props.formatoEje}
                    eje={props.eje} w={w} h={h} />
}
