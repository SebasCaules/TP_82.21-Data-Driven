import { Semaforo } from 'tablero-casa-oga'

const fila: React.CSSProperties = {
  display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: 4,
}

/** Los tres estados directos: mas alto es mejor. Cada uno cambia de FORMA ademas de color
 *  (lleno, medio, punteado), asi que se leen impresos en blanco y negro. */
export const Estados = () => (
  <div style={fila}>
    <Semaforo estado="meta" de="recompra a 90 dias" />
    <Semaforo estado="cerca" de="recompra a 90 dias" />
    <Semaforo estado="fuera" de="recompra a 90 dias" />
  </div>
)

/** Los mismos tres estados con rotulo invertido, para indicadores donde mas alto es peor.
 *  Sale de estadoInverso(valor, [45, 52]): el umbral de riesgo en Q5. */
export const EstadosInvertidos = () => (
  <div style={fila}>
    <Semaforo estado="inv-meta" de="riesgo en Q5" />
    <Semaforo estado="inv-cerca" de="riesgo en Q5" />
    <Semaforo estado="inv-fuera" de="riesgo en Q5" />
  </div>
)

/** Tamano grande, para cuando el estado ES el mensaje de la pantalla: suma el rotulo
 *  ESTADO al frente. La cifra va en `sufijo` y la vara contra la que se compara en
 *  `contra`. Es el caso de la vista de recompra, que cerro 2025Q3 en 8,5 %. */
export const Grande = () => (
  <div style={fila}>
    <Semaforo estado="fuera" tamano="grande" de="recompra a 90 dias"
              sufijo="8,5 %" contra="meta 10 a 11 %" />
  </div>
)

/** Chico con cifra, que es como entra en la cabecera de una tarjeta. */
export const ConCifra = () => (
  <div style={fila}>
    <Semaforo estado="inv-fuera" de="riesgo en Q5" sufijo="51,8 %" contra="umbral 45 a 52 %" />
    <Semaforo estado="meta" de="cobertura" sufijo="32,6 %" />
  </div>
)
