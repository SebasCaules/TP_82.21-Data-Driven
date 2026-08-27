import { Linea } from 'tablero-casa-oga'

/** Recompra a 90 dias, serie trimestral completa 2022Q1 a 2025Q3. Es la serie real del
 *  tablero: sube hasta 19,0 % en 2024Q2 y se cae a 8,5 % en los ultimos tres trimestres. */
const RECOMPRA = [
  { etiqueta: "'22Q1", valor: 6.19 }, { etiqueta: "'22Q2", valor: 9.48 },
  { etiqueta: "'22Q3", valor: 10.79 }, { etiqueta: "'22Q4", valor: 12.78 },
  { etiqueta: "'23Q1", valor: 16.12 }, { etiqueta: "'23Q2", valor: 15.96 },
  { etiqueta: "'23Q3", valor: 16.62 }, { etiqueta: "'23Q4", valor: 18.83 },
  { etiqueta: "'24Q1", valor: 18.28 }, { etiqueta: "'24Q2", valor: 19.03 },
  { etiqueta: "'24Q3", valor: 18.42 }, { etiqueta: "'24Q4", valor: 18.61 },
  { etiqueta: "'25Q1", valor: 16.0 }, { etiqueta: "'25Q2", valor: 12.91 },
  { etiqueta: "'25Q3", valor: 8.5 },
]

const pc = (v: number) => `${v.toFixed(1).replace('.', ',')} %`

/** Las tres zonas de estado como franjas del eje Y. El estado deja de ser una pastilla
 *  suelta y pasa a ser POSICION: la linea cae adentro de una de las tres. */
export const ConZonasDeEstado = () => (
  <Linea
    serie={RECOMPRA} w={900} h={320} formato={pc}
    zonas={[
      { etiqueta: 'Fuera de meta', desde: 0, hasta: 9, tono: 'var(--sem-fuera)', rango: '< 9,0 %', activa: true },
      { etiqueta: 'Por debajo', desde: 9, hasta: 10, tono: 'var(--sem-cerca)', rango: '9,0 - 10,0 %' },
      { etiqueta: 'En meta', desde: 10, hasta: Infinity, tono: 'var(--sem-meta)', rango: '>= 10,0 %' },
    ]}
    tituloY="% que recompra en 90 dias" tituloEje="Trimestre"
  />
)

/** La misma serie contra dos bandas en vez de zonas: la meta 10 a 11 % y la linea base
 *  historica 8 a 9 %. Las bandas se rotulan en el margen derecho, fuera del area de dibujo. */
export const ConBandaDeMeta = () => (
  <Linea
    serie={RECOMPRA} w={900} h={320} formato={pc}
    banda={[10, 11]} banda2={[8, 9]}
    rotuloBanda="meta" rotuloBanda2="linea base"
    tituloY="% que recompra en 90 dias" tituloEje="Trimestre"
  />
)

/** Huecos: un trimestre sin ventana de 90 dias completa se corta, no se interpola.
 *  El valor null deja el tramo sin dibujar en vez de inventar una recta. */
export const ConHuecos = () => (
  <Linea
    serie={[
      ...RECOMPRA.slice(0, 8),
      { etiqueta: "'24Q1", valor: null },
      { etiqueta: "'24Q2", valor: null },
      ...RECOMPRA.slice(10),
    ]}
    w={900} h={320} formato={pc}
    banda={[10, 11]} rotuloBanda="meta"
    tituloY="% que recompra en 90 dias" tituloEje="Trimestre"
  />
)
