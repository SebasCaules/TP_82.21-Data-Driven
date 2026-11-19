// Textos nuevos de V09 (fase 8), mezclados en textosDe('V09'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// «de cada 100» sale de la unidad del ancla de DF (G68), no se tipea; la escala de los círculos (1 círculo = 10 veces)
// es la del dibujo, no una cifra del caso.
import { DF } from '../datos_final.js'
import { NBSP, fijo } from '../../../e3/src/formato.js'

const DE_CADA = DF.anclas['G68.potencia_con_descuento'].unidad

export default {
  barras: {
    eje: 'Diferencia de cruce, control menos rama, en puntos',
    unidad: 'puntos',
    // versión a: zonas de la escala (el espacio duro decide dónde corta el renglón si la zona es angosta)
    zona_no: 'No pasa ninguna rama',
    zona_sin: `Pasa la rama sin${NBSP}descuento`,
    zona_dos: `Pasan las dos${NBSP}ramas`,
    llave: 'Lo que falta para pasar',
    // versión b: un carril por rama
    rama_con: 'Rama con descuento',
    rama_sin: 'Rama sin descuento',
    no_pasa: 'No pasa',
    pasa: 'Pasa',
    // de cada 100 (G68)
    ve: 'el piloto lo ve',
    de_cada: DE_CADA,
    // leyendas
    ley_hoy: 'Con lo observado',
    ley_umbral: 'Umbral de pase',
    ley_llave: 'Lo que falta para pasar',
    // «círculo» y no «punto»: «puntos» es la unidad del eje
    ley_punto: `${fijo(1)} círculo = ${fijo(10)} veces ${DE_CADA}`,
  },
}
