import { SerieCortes } from 'tablero-casa-oga'

/** Exposicion anual en cada uno de los 25 cortes mensuales, 2023-12-31 a 2025-12-31.
 *  En millones de pesos. */
const EXPOSICION = [263, 300, 320, 374, 415, 436, 472, 489, 505, 515, 526, 557, 579, 605, 632, 646, 677, 712, 723, 747, 777, 801, 850, 900, 949].map((v) => v * 1e5)

/** Serie chica de los cortes con el activo marcado: el "como vengo" al lado del selector
 *  de mes, sin ejes ni etiquetas. El ultimo corte es el activo. */
export const UltimoCorte = () => (
  <SerieCortes valores={EXPOSICION} activo={24} w={260} h={54} />
)

/** El mismo recorrido parado en un corte del medio: la marca se mueve, la serie no. */
export const CorteIntermedio = () => (
  <SerieCortes valores={EXPOSICION} activo={12} w={260} h={54} />
)
