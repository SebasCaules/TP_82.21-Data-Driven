// Tarjeta de puntaje de la vista 3 (28/10, .workforce/PLAN.md, unidad V03). No exporta `default` ni
// `meta`: vistas/index.jsx no la registra como vista (como V05_Simulador.jsx).
//
// Una fila por condición técnica. Arriba, chico: el puntaje en pips (●●○, de `tope`) y el nombre. Debajo,
// grande: la razón, que es lo que se lee. La fila que limita (limite: true) lleva el único color (--acc):
// filete a la izquierda, fondo apenas teñido, pips y nombre en --acc y la razón en tinta 700. Las demás,
// en tokens de contexto del E3 (--e3-ctx, --e3-ctx-relleno). Sin eje ni tramo: la escala está en la cifra
// de la banda. La letra de la razón es la misma en las cuatro filas y se achica hasta que la más larga
// entre en el ancho; el detalle (lo que sigue a los dos puntos en C3) va después de los dos puntos, más
// chico y en --e3-ctx, solo si entra en la línea.

import { anchoTexto } from '../medir.js'

const ACC = 'var(--acc)'
const INK = 'var(--ink)'
const CTX = 'var(--e3-ctx, #5a6478)'
const CTX_RELLENO = 'var(--e3-ctx-relleno, #a9b1bf)'
const FILETE = 'var(--bd, #d9dde3)'

/**
 * filas: [{ id, nombre, puntaje, razon, detalle?, limite? }] · tope: máximo de la escala (pips)
 * k: escala de letra (useEscalaTexto) · w, h: la caja del Lienzo
 */
export function TarjetaPuntaje({ filas, tope, k, w, h }) {
  const n = filas.length
  const paso = h / n
  const x0 = Math.round(22 * k)
  const derecha = w - Math.round(14 * k)

  // Línea chica: pips y nombre.
  const fNom = Math.min(14 * k, paso * 0.15)
  const r = fNom * 0.42
  const sepPip = r * 2.9
  const xNom = x0 + (tope - 1) * sepPip + 2 * r + fNom * 0.8

  // Razón: misma letra en todas las filas, la más grande que deja entrar a la más larga.
  const ancho100 = Math.max(...filas.map((f) => anchoTexto(f.razon, 100, f.limite ? 700 : 500)))
  const fR = Math.max(12, Math.min(32 * k, paso * 0.34, ((derecha - x0) / ancho100) * 100))
  const fDet = fR * 0.62

  // Bloque de cada fila (nombre arriba, razón debajo), centrado en su alto.
  const alto = fNom + fR * 0.55 + fR * 0.78

  return (
    <svg width={w} height={h} role="img" style={{ display: 'block' }}
         aria-label={filas.map((f) => `${f.nombre}: ${f.puntaje} de ${tope}. ${f.razon}`
           + (f.detalle ? `: ${f.detalle}` : '')).join('. ')}>
      {filas.map((f, i) => {
        const y0 = i * paso
        const top = y0 + (paso - alto) / 2
        const yNom = top + fNom * 0.82
        const yRaz = top + alto
        const ancho = anchoTexto(`${f.razon}: `, fR, f.limite ? 700 : 500)
        const conDetalle = f.detalle && x0 + ancho + anchoTexto(f.detalle, fDet, 500) <= derecha
        const color = f.limite ? ACC : CTX
        return (
          <g key={f.id}>
            <title>{`${f.nombre}: ${f.puntaje} de ${tope}. ${f.razon}${f.detalle ? `: ${f.detalle}` : ''}.`}</title>
            <rect x={0} y={y0} width={w} height={paso} fill={f.limite ? ACC : 'transparent'}
                  opacity={f.limite ? 0.07 : 1} />
            {f.limite && <rect x={0} y={y0 + 4} width={Math.max(4, 5 * k)} height={paso - 8} fill={ACC} />}
            {i > 0 && !f.limite && !filas[i - 1].limite && (
              <line x1={x0} x2={w} y1={y0} y2={y0} stroke={FILETE} strokeWidth="1" />
            )}
            {Array.from({ length: tope }, (_, j) => {
              const lleno = j < f.puntaje
              return (
                <circle key={j} cx={x0 + r + j * sepPip} cy={yNom - fNom * 0.36} r={lleno ? r : r - 0.8 * k}
                        fill={lleno ? color : '#fff'} stroke={lleno ? 'none' : f.limite ? ACC : CTX_RELLENO}
                        strokeWidth={lleno ? 0 : 1.6 * k} />
              )
            })}
            <text x={xNom} y={yNom} fontSize={fNom} fontFamily="var(--mono)" fill={color}
                  fontWeight={f.limite ? 700 : 600} letterSpacing=".08em"
                  style={{ textTransform: 'uppercase' }}>{f.nombre}</text>
            <text x={x0} y={yRaz} fontSize={fR} fill={f.limite ? INK : CTX} fontWeight={f.limite ? 700 : 500}
                  letterSpacing="-.01em">
              {conDetalle ? `${f.razon}: ` : f.razon}
              {conDetalle && (
                <tspan fontSize={fDet} fontWeight={500} fill={CTX} letterSpacing="0">{f.detalle}</tspan>
              )}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
