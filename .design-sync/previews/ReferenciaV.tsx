import { ReferenciaV, Tramas } from 'tablero-casa-oga'

/** ReferenciaV devuelve un <g>: va DENTRO de un <svg>. Es la vertical punteada con su
 *  rotulo arriba, la que marca un promedio o un umbral sobre un grafico de barras.
 *  Sin el rotulo, una punteada suelta no dice contra que se compara. */
export const SobreBarras = () => (
  <svg width={840} height={200} role="img" aria-label="Linea de referencia sobre barras">
    <Tramas />
    <rect x={0} y={30} width={620} height={30} fill="var(--acc)" />
    <rect x={0} y={70} width={380} height={30} fill="var(--gris)" />
    <rect x={0} y={110} width={300} height={30} fill="var(--gris)" />
    <rect x={0} y={150} width={140} height={30} fill="url(#trama)" />
    <ReferenciaV x={340} h={190} etiqueta="promedio 41,0 %" y={16} />
  </svg>
)

/** Dos referencias en el mismo dibujo: el promedio y el umbral declarado. */
export const DosReferencias = () => (
  <svg width={840} height={200} role="img" aria-label="Dos lineas de referencia">
    <rect x={0} y={30} width={620} height={30} fill="var(--acc)" />
    <rect x={0} y={70} width={380} height={30} fill="var(--gris)" />
    <rect x={0} y={110} width={300} height={30} fill="var(--gris)" />
    <ReferenciaV x={340} h={190} etiqueta="promedio 41,0 %" y={16} />
    <ReferenciaV x={620} h={190} etiqueta="umbral 52 %" y={16} />
  </svg>
)
