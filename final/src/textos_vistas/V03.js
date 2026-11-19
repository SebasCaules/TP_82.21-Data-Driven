// Textos de V03, mezclados en textosDe('V03'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// Eje vertical de 0 a 100 % con su título (el año del eje X va en él), la línea de control rotulada con el nombre del
// informe (A1.12, «Control de mes completo») y la leyenda de los dos colores con las palabras del título y de la decisión
// (completo, incompleto): lo que entra ya lo dice la tarjeta de la decisión.
import { DF } from '../datos_final.js'

const VT = DF.tablas.ventas_2025

export default {
  // un solo nombre para el control: la banda y el gráfico dicen «control»
  fuera: { linea: 'debajo del control' },
  barras: {
    control: 'Control de mes completo',
    eje: `Operaciones de cada mes de ${VT.anio} sobre el mismo mes de ${VT.anio_anterior} (%)`,
    completo: 'Mes completo',
    incompleto: 'Mes incompleto',
  },
}
