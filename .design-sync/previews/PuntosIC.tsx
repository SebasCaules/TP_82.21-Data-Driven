import { PuntosIC } from 'tablero-casa-oga'

const pc = (v: number) => `${v.toFixed(2).replace('.', ',')} %`

/** Punto y barra: proporcion con su intervalo de Wilson al 95 %. La punteada es la tasa
 *  global. El hallazgo es que NINGUN segmento se despega: los intervalos del mejor y el
 *  peor se pisan, y eso se puede leer del grafico en vez de tener que creerlo. */
export const PorSegmento = () => (
  <PuntosIC
    datos={[
      { etiqueta: 'Inactivos 90d', valor: 1.387, ic: [1.081, 1.777], nota: '4.399 envios \u00b7 61 compras', enfasis: true },
      { etiqueta: 'Todos', valor: 1.345, ic: [1.007, 1.795], nota: '3.346 envios \u00b7 45 compras' },
      { etiqueta: 'Silver', valor: 1.330, ic: [1.073, 1.648], nota: '6.164 envios \u00b7 82 compras' },
      { etiqueta: 'Gold', valor: 1.036, ic: [0.793, 1.352], nota: '5.117 envios \u00b7 53 compras' },
      { etiqueta: 'Bronze', valor: 0.957, ic: [0.716, 1.278], nota: '4.703 envios \u00b7 45 compras' }
    ]}
    w={940} h={300} anchoEtiqueta={134} formato={pc}
    tituloEje="% de compra a 7 dias del envio, por segmento (IC 95 %)"
    referencia={{ valor: 1.2070, ic: [1.0752, 1.3547] }}
  />
)

/** `vacio` reserva el renglon sin dibujar punto: es como se declara un score que todavia
 *  no existe, en vez de omitir la fila y dejar creer que el modelo ya compite. La vara es
 *  el criterio que se usa hoy, no el mejor de los cinco. */
export const ContraElCriterio = () => (
  <PuntosIC
    datos={[
      { etiqueta: 'Score del modelo', vacio: true, nota: 'en desarrollo' },
      { etiqueta: 'Inactivos 90d', valor: 1.387, ic: [1.081, 1.777], nota: '4.399 envios \u00b7 61 compras', enfasis: true },
      { etiqueta: 'Todos', valor: 1.345, ic: [1.007, 1.795], nota: '3.346 envios \u00b7 45 compras', tenue: true },
      { etiqueta: 'Silver', valor: 1.330, ic: [1.073, 1.648], nota: '6.164 envios \u00b7 82 compras', tenue: true },
      { etiqueta: 'Gold', valor: 1.036, ic: [0.793, 1.352], nota: '5.117 envios \u00b7 53 compras', tenue: true },
      { etiqueta: 'Bronze', valor: 0.957, ic: [0.716, 1.278], nota: '4.703 envios \u00b7 45 compras', tenue: true }
    ]}
    w={940} h={330} anchoEtiqueta={134} formato={pc}
    tituloEje="% de compra a 7 dias del envio, por criterio de envio"
    referencia={{ valor: 1.3867, ic: [1.0811, 1.7771], rotulo: 'IC 95 % de la vara' }}
  />
)
