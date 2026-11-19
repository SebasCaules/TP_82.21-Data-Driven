// Textos nuevos de V04 (fase 8), mezclados en textosDe('V04'); puede importar DF de '../datos_final.js' y formato.js de '../../../e3/src/formato.js'.
// escalera: la versión a (escalones hacia el umbral, con ejes). cuadros: la versión b (de cada cien, con leyenda).
// Las cifras («553 de 603») las arma la vista con formato.js: acá van solo las palabras.
export default {
  escalera: {
    ejeY: 'Casos que cruzan su umbral, %',
    ejeX: 'Días que le faltan al cliente para cruzar su umbral',
    umbral: 'Umbral',
    umbral2: 'del cliente',
    flecha: 'más cerca del umbral',
    de: 'de',
    casos: 'casos lo cruzan',
    caso: 'Caso: un cliente en un mes de validación',
  },
  cuadros: {
    cruza: 'cruza su umbral',
    noCruza: 'no lo cruza',
    unidad: 'Cada cuadro: uno de cada cien casos del tramo',
    caso: 'Caso: un cliente en un mes de validación',
    de: 'de',
    casos: 'casos lo cruzan',
    flecha: 'más cerca del umbral',
  },
}
