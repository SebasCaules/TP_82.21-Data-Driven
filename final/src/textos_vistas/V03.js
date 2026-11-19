// Textos nuevos de V03 (fase 8), mezclados en textosDe('V03'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// Spec fase 8, ficha V03: eje vertical de 0 a 100 % con su título, la línea de control rotulada, el título del eje de los meses
// y la leyenda de los dos colores de las columnas.
import { DF } from '../datos_final.js'

const VT = DF.tablas.ventas_2025

export default {
  barras: {
    control: 'Control del mes',
    eje: `Operaciones del mes sobre el mismo mes de ${VT.anio_anterior} (%)`,
    eje_x: `Mes de ${VT.anio}`,
    entra: 'Mes completo: entra',
    no_entra: 'Mes incompleto: no entra',
  },
}
