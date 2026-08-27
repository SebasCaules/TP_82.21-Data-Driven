import { Plaqueta, Tramas } from 'tablero-casa-oga'

/** Plaqueta devuelve un <g>: va DENTRO de un <svg>, nunca suelta. Existe para que un valor
 *  se lea encima de una trama o de un tramo de color, poniendole una placa opaca detras.
 *  Sobre la trama, sin placa, el numero se pierde. */
export const SobreTrama = () => (
  <svg width={840} height={130} role="img" aria-label="Plaqueta sobre trama">
    <Tramas />
    <rect x={0} y={20} width={820} height={70} fill="url(#trama)" stroke="var(--bd)" />
    <Plaqueta x={20} y={62} texto="ARS 109,7 M" />
    <Plaqueta x={420} y={62} texto="64,9 %" anclaje="middle" />
    <Plaqueta x={800} y={62} texto="se pierden 15.263" anclaje="end" />
    <text x={0} y={118} fontSize={10} fill="var(--mut)">
      anclaje: start, middle, end
    </text>
  </svg>
)

/** Los parametros de cuerpo, peso y color, sobre fondo plano. */
export const Variantes = () => (
  <svg width={840} height={130} role="img" aria-label="Variantes de plaqueta">
    <rect x={0} y={20} width={820} height={70} fill="var(--acc)" />
    <Plaqueta x={20} y={62} texto="por defecto" />
    <Plaqueta x={210} y={62} texto="cuerpo 15" fuente={15} />
    <Plaqueta x={420} y={62} texto="peso 400" peso={400} />
    <Plaqueta x={620} y={62} texto="en excepcion" color="var(--terra)" />
  </svg>
)
