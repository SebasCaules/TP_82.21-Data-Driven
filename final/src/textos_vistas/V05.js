// Textos nuevos de V05 (fase 8), mezclados en textosDe('V05'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// dos: la versión a (dos paneles: contra la práctica actual y modelo menos regla). lupa: la versión b (un eje de 0 a
// 100 % con el tramo de regla y modelo ampliado abajo). Las cifras las pone la vista, desde DF.
export default {
  barras: { eje: 'Precisión de la lista (%)' },
  dos: {
    izq: {
      titulo: 'Contra la práctica actual',
      hasta: 'Hasta la práctica actual',
      sobre: 'Más que la práctica actual',
      base: 'Práctica actual',
      baseNota: 'lo que acierta hoy',
      // la línea de base del proyecto es la regla (E3, decisión 6 de modelado-etapa-1); la práctica actual es referencia
      reglaNota: 'línea de base',
    },
    der: {
      titulo: 'Modelo menos regla',
      punto: 'Diferencia medida',
      intervalo: 'Intervalo de confianza',
      cero: 'Sin diferencia',
      ceroNota: 'modelo igual a regla',
      mejorRegla: 'mejor la regla',
      mejorModelo: 'mejor el modelo',
      eje: 'Puntos de precisión, modelo menos regla',
    },
  },
  lupa: {
    hoy: 'Práctica actual',
    regla: 'Regla del umbral',
    modelo: 'Modelo',
    reglaNota: 'línea de base',
    juntos: 'Regla y modelo',
    juntosNota: 'ampliado abajo',
    tramo: 'Tramo ampliado',
    empate: 'empate: dentro del margen de error',
    ejeZoom: 'Precisión de la lista (%), tramo ampliado',
  },
}
