// Textos de V15 (fase 8; 19/11, fase 9: menos información; fase 10: vuelve el esqueleto; fase 11, spec 2.2: el cierre
// se parte en dos y esta vista queda con el paneo de la presentación), mezclados en textosDe('V15'). El título y la
// sección los pone el encabezado de App.jsx; el balance (lo que nos llevamos) está en contenido_final.js.
// El recorrido: una estación por sección, con su cifra y una línea; el número y el nombre los pone la vista desde el
// rótulo del riel de su bloque («1 · Datos»). Las cifras salen de DF con formato.js.

export default {
  llevamos: 'Lo que nos llevamos',
  // los dibujos de las estaciones no llevan rótulos: el acento es lo que cuenta la cifra de la estación. Corto: la
  // leyenda va en el hueco junto a la estación 4
  ley: { cifra: 'la cifra', resto: 'el resto' },
  // una línea por estación, debajo de su cifra. Datos: 27.276 son las ventas con cliente y monto positivo (C20.positivas;
  // con cliente son 27.606); se nombran como en V02, «base de la lista»
  piezas: {
    datos: { despues: 'ventas', desc: 'base de la lista' },
    modelo: { desc: 'acierta la regla' },
    economia: { despues: 'por año', desc: 'deja la lista' },
    legal: { despues: 'acciones', desc: 'antes de la primera lista' },
    gestion: { despues: 'semanas', desc: 'hasta la decisión' },
  },
}
