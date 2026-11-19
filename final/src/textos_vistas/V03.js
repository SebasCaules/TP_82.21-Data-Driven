// Textos de V03, mezclados en textosDe('V03'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// Fase 8, ficha V03: eje vertical de 0 a 100 % con su título, la línea de control rotulada y la leyenda de los dos colores
// de las columnas. Fase 9: el año del eje X («Mes de 2025») pasa al título del eje Y y ese renglón sale.
import { DF } from '../datos_final.js'

const VT = DF.tablas.ventas_2025

export default {
  // un solo nombre para el control: la banda y el gráfico dicen «control»
  fuera: { linea: 'debajo del control' },
  barras: {
    control: 'Control del mes',
    eje: `Operaciones de cada mes de ${VT.anio} sobre el mismo mes de ${VT.anio_anterior} (%)`,
    entra: 'Mes completo: entra',
    no_entra: 'Mes incompleto: no entra',
  },
}
