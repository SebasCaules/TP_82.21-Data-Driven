import { Chispa } from 'tablero-casa-oga'

/** Serie de recompra a 90 dias, 2022Q1 a 2025Q3. */
const RECOMPRA = [6.19, 9.48, 10.79, 12.78, 16.12, 15.96, 16.62, 18.83, 18.28, 19.03, 18.42, 18.61, 16.00, 12.91, 8.50]

/** Sparkline con banda de meta: la prueba grafica de un articulo del acta de cierre.
 *  Sin ejes ni etiquetas, porque la cifra ya esta escrita al lado. */
export const ConBandaDeMeta = () => (
  <Chispa serie={RECOMPRA} w={300} h={72}
          banda={[10, 11]} tonoBanda="var(--sem-meta)"
          rotuloBanda="meta" rotulo="8,5 %" />
)

/** Sin banda: solo la forma de la serie. */
export const Desnuda = () => (
  <Chispa serie={RECOMPRA} w={300} h={72} rotulo="8,5 %" />
)
