// Entry del design system para /design-sync. No es parte de la app: existe solo para
// acotar qué se sincroniza.
//
// Se re-exporta únicamente lo que no toca el payload de datos. graficos.jsx, Semaforo.jsx
// e Iconos.jsx importan React y nada más, así que el bundle queda chico y cada componente
// renderiza sin datos. Filtros.jsx y LineaTiempo.jsx quedan afuera a propósito: importan
// agregacion.js, que arrastra datos.js (1,2 MB del corte 31/12/2025). Las 14 pantallas
// también quedan afuera: son composiciones de la app, no piezas del sistema.
export {
  useMedida,
  Lienzo,
  escalaNice,
  Plaqueta,
  BarrasH,
  ReferenciaV,
  Linea,
  PuntosIC,
  Tramas,
  BarraTramos,
  rampa,
  BarrasApiladas100,
  BarrasDivergentes,
  Chispa,
  BarraMini,
  CurvaConcentracion,
  SerieCortes,
} from '../src/graficos.jsx'

export { default as Semaforo, estadoRecompra, estadoInverso } from '../src/Semaforo.jsx'

export { Region, Categoria, Segmentos, Escalera, ICONO_VALOR, iconoDeValor } from '../src/Iconos.jsx'
