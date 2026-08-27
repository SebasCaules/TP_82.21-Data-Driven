import { Tramas } from 'tablero-casa-oga'

/** Tramas no dibuja nada por si mismo: monta los dos <pattern> que hacen que un tramo se
 *  distinga sin depender del color. Va una sola vez adentro del <svg> que los referencia.
 *  Las primitivas de barra ya lo montan solas; se exporta para componer SVG a mano. */
export const LosDosPatrones = () => (
  <svg width={840} height={150} role="img" aria-label="Los dos patrones de trama">
    <Tramas />
    <text x={0} y={14} fontSize={11} fill="var(--lbl)" fontWeight={600}>trama</text>
    <rect x={0} y={24} width={390} height={78} fill="url(#trama)" stroke="var(--bd)" />
    <text x={0} y={122} fontSize={10} fill="var(--mut)">
      el tramo que no lleva enfasis
    </text>
    <text x={430} y={14} fontSize={11} fill="var(--lbl)" fontWeight={600}>trama-exc</text>
    <rect x={430} y={24} width={390} height={78} fill="url(#trama-exc)" stroke="var(--bd)" />
    <text x={430} y={122} fontSize={10} fill="var(--mut)">
      la excepcion: sin consentimiento, fuera de meta, no contactable
    </text>
  </svg>
)
