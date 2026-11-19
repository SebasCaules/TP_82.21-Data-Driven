// Textos nuevos de V11, mezclados en textosDe('V11'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// (19/11, fase 9) La tarjeta de cada riesgo lleva el nombre, la señal y la respuesta. Los rótulos de los campos son las
// dos palabras de la conclusión («cada uno con su señal y su respuesta»), que son también las de la ficha de la sección
// 26.3 del informe. Salieron la subfila de la banda (las 24 horas de las tres listas), el tipo de cada riesgo y la leyenda.
// `filas` reemplaza entera la lista de contenido_final.js (los arreglos no se mezclan) y ya va escrita como se lee en la
// tarjeta, con inicial mayúscula. Respecto de CF (revisión del 19/11):
// - riesgo 1: «si ninguna rama llega, se cierra en la semana 28» → «pasa», el verbo de V09 («No pasa ninguna», «Pasa
//   una»), y «el proyecto cierra», el sujeto de la ficha de la 26.3; sale la semana 28, que el orador no dice acá (está
//   en V09 y V14).
// - riesgo 3: «filtro probado en cero» → «se prueba el filtro», como la acción L3 de V10 («Probar el filtro de
//   consentimiento»); «en cero» era jerga.
export default {
  mide: 'Riesgos críticos del piloto, cada uno con su señal y su respuesta',
  columnas: { senal: 'Señal', respuesta: 'Respuesta' },
  filas: [
    {
      riesgo: 'Contactar no paga la lista',
      senal: 'Diferencia de cruce entre el control y cada rama',
      respuesta: 'Si ninguna rama pasa, el proyecto cierra',
    },
    {
      riesgo: 'Nadie corre la planilla',
      senal: 'Listas corridas a tiempo',
      respuesta: 'Marketing la corre con la guía; el equipo acompaña',
    },
    {
      riesgo: 'Se contacta sin consentimiento',
      senal: 'Clientes sin consentimiento o con baja',
      respuesta: 'Se prueba el filtro antes de cada lista',
    },
  ],
}
