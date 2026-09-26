// (26/09, revisión UX H12) Los cuatro grosores de línea de los gráficos propios del E2, con nombre:
// eje (ejes y marcas), guía (referencias, contornos, líneas punteadas, marcadores), serie (líneas
// de datos) y énfasis (la serie que hay que mirar). Antes cada vista tenía los suyos: cinco en V02
// y en V08, y un 3 × k sin redondear en V09. Las tramas de relleno (Tramas, de graficos.jsx) y los
// gráficos que vienen del E1 (PuntosIC, BarrasH) no pasan por acá.

export const TRAZO = { eje: 1, guia: 1.5, serie: 2.5, enfasis: 4 }
