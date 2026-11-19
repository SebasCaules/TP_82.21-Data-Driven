// Textos nuevos de V02 (fase 8), mezclados en textosDe('V02'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// flujo: la versión a (banda que se poda paso a paso); cascada: la versión b (columnas que restan). El título del eje de
// las dos es barras.eje («Filas de ventas»), de contenido_final.js.
export default {
  flujo: {
    etapas: ['Extracto', 'Sin repetidas', 'Con cliente', 'Con monto positivo'],
    final: 'entran a la lista',
    salidas: ['repetidas', 'sin cliente', 'devoluciones'],
    ley: {
      quedan: 'Quedan',
      salen: 'Salen',
      entran: 'Entran a la lista',
      alto: 'Alto de la banda = filas',
      minimo: 'Salida chica: grosor mínimo',
    },
  },
  cascada: {
    columnas: ['Extracto', 'Repetidas', 'Sin cliente', 'Devoluciones', 'Entran a la lista'],
    ley: {
      total: 'Extracto',
      salen: 'Salen',
      entran: 'Entran a la lista',
      minimo: 'Salida chica: grosor mínimo',
    },
  },
}
