// Puntaje por dimensión en la escala de la cátedra (27/10, W2, hallazgo T3 del verificador). Las vistas 3
// (cuatro condiciones técnicas) y 6 (cinco dimensiones legales) muestran lo mismo: cuánto vale cada
// dimensión de 0 al tope de la escala y en qué tramo de la cátedra cae. Antes la 3 lo dibujaba con
// BarrasH y la línea del promedio, y la 6 con un SVG propio y el tramo sombreado: dos estilos para un
// mismo significado. Ahora las dos usan esta pieza.
//
// - Barras grises; la que limita (enfasis), en --acc con su nombre en negrita (regla 12 del E2).
// - El tramo de la cátedra, sombreado y con su plaqueta arriba («factibilidad media · 2,1 a 2,5»).
// - El promedio, punteado y con su plaqueta debajo de la del tramo, solo si no coincide con todas las
//   barras (en la 6 las cinco valen 2 y la línea quedaría sobre sus puntas).
// - Una nota al lado de la barra, si la dimensión la trae (la razón del puntaje).
// La letra crece con `k` (useEscalaTexto del E2), como los demás SVG propios del E3.

import { Plaqueta, escalaNice } from '../../src/graficos.jsx'
import { anchoTexto } from './medir.js'
import { fijo } from './formato.js'

const ACC = 'var(--acc)'
const GRIS = 'var(--gris)'
const INK = 'var(--ink)'
const MUT = 'var(--mut)'
const MUT2 = 'var(--mut2)'
const EJE = 'var(--eje)'

const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'))

/** «Escala de la cátedra: 2,1 a 2,5 es factibilidad media.» → el tramo y su nombre (C3). */
export function tramoDe(escala) {
  const m = String(escala || '').match(/(\d+(?:,\d+)?) a (\d+(?:,\d+)?) es ([^.]+)/)
  if (!m) return null
  return { desde: num(m[1]), hasta: num(m[2]), rotulo: `${m[3]} · ${m[1]} a ${m[2]}` }
}

/**
 * dims: [{ nombre, valor, texto?, enfasis?, nota? }] (texto: cómo se escribe el puntaje; si falta, entero)
 * tope: el máximo de la escala · tramo: tramoDe(…) · promedio: { valor, rotulo } · k: escala de letra
 */
export default function PuntajeDimensiones({ dims, tope, tramo, promedio, k, w, h, tituloEje = 'Puntaje' }) {
  const fEtq = 14 * k
  const fVal = 13 * k
  const fNota = 12 * k
  const fTick = 10.5 * k
  const fTit = 11 * k
  const fPlq = 11 * k
  const texto = (d) => d.texto ?? fijo(d.valor, 0)
  const parejas = dims.every((d) => d.valor === dims[0].valor)
  const conPromedio = promedio && !(parejas && Math.abs(promedio.valor - dims[0].valor) < 1e-9)

  const x0 = Math.max(...dims.map((d) => anchoTexto(d.nombre, fEtq, d.enfasis ? 700 : 400))) + 14 * k
  const anchoVal = Math.max(...dims.map((d) => anchoTexto(texto(d), fVal, 700))) + 14 * k
  const anchoNota = Math.max(0, ...dims.map((d) => (d.nota ? anchoTexto(d.nota, fNota) + 16 * k : 0)))
  const util = Math.max(40, w - x0 - anchoVal - anchoNota)
  const { max, ticks } = escalaNice(tope, tope)
  const x = (v) => x0 + (v / max) * util

  // Arriba, una fila por plaqueta: el tramo y, debajo, el promedio.
  const fila = fPlq + 7 + 6 * k
  const yTramo = fila / 2 + 1
  const yProm = yTramo + (tramo ? fila : 0)
  const padTop = Math.round((tramo ? fila : 0) + (conPromedio ? fila : 0) + 6 * k)
  const yBase = h - Math.round(44 * k)
  const paso = (yBase - padTop) / dims.length
  const alto = Math.min(paso * 0.6, 34 * k)

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={`${tituloEje} por dimensión: ${dims.map((d) => `${d.nombre} ${texto(d)}`).join(', ')}`
           + (tramo ? `. ${tramo.rotulo}` : '') + (conPromedio ? `. ${promedio.rotulo}` : '')}>
      {tramo && (
        <g>
          <title>{tramo.rotulo}</title>
          <rect x={x(tramo.desde)} y={padTop - 4} width={x(tramo.hasta) - x(tramo.desde)} height={yBase - padTop + 4}
                fill={ACC} opacity=".16" />
          <line x1={x(tramo.desde)} x2={x(tramo.desde)} y1={yTramo} y2={yBase} stroke={ACC} strokeWidth="1" opacity=".5" />
          <line x1={x(tramo.hasta)} x2={x(tramo.hasta)} y1={yTramo} y2={yBase} stroke={ACC} strokeWidth="1" opacity=".5" />
        </g>
      )}
      {dims.map((d, i) => {
        const y = padTop + i * paso + (paso - alto) / 2
        return (
          <g key={d.nombre}>
            <title>{[d.nombre, `${texto(d)} de ${fijo(tope, 0)}`, d.nota].filter(Boolean).join(' · ')}</title>
            <text x={x0 - 9 * k} y={y + alto / 2} fontSize={fEtq} fill={d.enfasis ? INK : MUT2} textAnchor="end"
                  fontWeight={d.enfasis ? 700 : 400} dominantBaseline="central">{d.nombre}</text>
            <rect x={x0} y={y} width={Math.max(1, x(d.valor) - x0)} height={alto} fill={d.enfasis ? ACC : GRIS} />
            <text x={x(d.valor) + 7 * k} y={y + alto / 2} fontSize={fVal} fill={INK} fontWeight={d.enfasis ? 700 : 600}
                  dominantBaseline="central" className="tabular">{texto(d)}</text>
            {d.nota && (
              <text x={w} y={y + alto / 2} fontSize={fNota} fill={MUT} textAnchor="end"
                    dominantBaseline="central">{d.nota}</text>
            )}
          </g>
        )
      })}
      {conPromedio && (
        <g>
          <title>{promedio.rotulo}</title>
          <line x1={x(promedio.valor)} x2={x(promedio.valor)} y1={yProm} y2={yBase} stroke={INK} strokeWidth="1.25"
                strokeDasharray="4 3" />
        </g>
      )}
      <line x1={x0} x2={x0} y1={padTop - 4} y2={yBase} stroke={EJE} strokeWidth="1" />
      <line x1={x0} x2={x0 + util} y1={yBase} y2={yBase} stroke={EJE} strokeWidth="1" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={yBase} y2={yBase + 4} stroke={EJE} strokeWidth="1" />
          <text x={x(t)} y={yBase + 17 * k} fontSize={fTick} fill={MUT} textAnchor="middle"
                className="tabular">{fijo(t, 0)}</text>
        </g>
      ))}
      <text fontFamily="var(--mono)" x={x0 + util} y={yBase + 38 * k} fontSize={fTit} fill={MUT2} textAnchor="end"
            letterSpacing=".09em" fontWeight={600} style={{ textTransform: 'uppercase' }}>{tituloEje}</text>
      {tramo && (
        <Plaqueta x={(x(tramo.desde) + x(tramo.hasta)) / 2} y={yTramo} texto={tramo.rotulo} fuente={fPlq}
                  peso={600} color={ACC} anclaje="middle" />
      )}
      {conPromedio && (
        <Plaqueta x={x(promedio.valor)} y={yProm} texto={promedio.rotulo} fuente={fPlq} peso={600} color={INK}
                  anclaje="middle" />
      )}
    </svg>
  )
}
