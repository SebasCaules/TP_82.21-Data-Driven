// Textos de V02, mezclados en textosDe('V02'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// flujo: la banda que se poda etapa por etapa (fase 8, versión a; fase 9 sin leyenda). El título del eje es barras.eje
// («Filas de ventas»), de contenido_final.js. «compras devueltas» es el nombre de la sección 22.1 del informe para las
// filas de monto negativo con cliente.
export default {
  flujo: {
    etapas: ['Extracto', 'Sin repetidas', 'Con cliente', 'Con monto positivo'],
    final: 'entran a la lista',
    salidas: ['repetidas', 'sin cliente', 'compras devueltas'],
  },
}
