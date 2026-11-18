// Textos de /final/, la presentación final (24/11). Las cifras salen de DF (final/src/datos_final.js, que escribe
// pipeline/build_final.py desde los JSON del vault) y todo el texto sale de acá.
//
// ESTE ARCHIVO ES DE MUESTRA (CF.MUESTRA = true): los textos prueban el andamiaje (riel, notas, tiempos, impresión) y
// los reemplaza la unidad que carga el contenido cuando exista el canon. scripts/verificar_final.py --sin-muestra falla
// mientras quede «MUESTRA» en pantalla o CF.MUESTRA siga en true.
//
// Forma (la lee final/src/vistas/index.jsx, y scripts/verificar_final.py con node):
//   BLOQUES, en el orden de la presentación: { id, titulo, riel?, integrante, vistas: [...] }
//     - titulo: el nombre del bloque en las notas; riel: el rótulo corto del grupo en el riel (si falta, el titulo).
//     - integrante: quien presenta las vistas del bloque (una vista puede pisarlo con su propio `integrante`).
//   Cada vista: { id, titulo, pregunta, fuente?, segundos, notas: [párrafos], textos?: {...} }
//     - id: único ('V01', 'V02', …); el archivo final/src/vistas/Vnn_Nombre.jsx exporta `meta = { id }`. Sin archivo,
//       la vista se muestra como esqueleto. El número del riel sale de la posición, no del id: reordenar no renombra.
//     - titulo: el rótulo del riel. pregunta: el h1, un renglón de hasta 74 caracteres (regla 12 del E2).
//     - fuente: lo que va a la derecha del encabezado, después de «n / total».
//     - segundos: el tiempo de la vista; los del bloque y el total se suman de acá.
//     - notas: el guion de la vista, en párrafos, con **negrita** (e3/src/texto.jsx).
//     - textos: lo que escribe la vista (rótulos de la banda, fragmentos, qué mide, conclusión, decisión). Cada vista
//       lee lo suyo; ninguna escribe texto en el JSX.
//   TIEMPOS.objetivo_s: el tiempo de la presentación; el verificador falla si la suma de las vistas lo pasa.
// Sin imports: es dato puro.

export const CF = {
  MUESTRA: true,
  VERSION: 'muestra-0',
  TITULO: 'Casa Óga · Presentación final',
  SUBTITULO: 'presentación final',
  TIEMPOS: { objetivo_s: 1800 },
  BLOQUES: [
    {
      id: 'apertura',
      titulo: 'Apertura',
      integrante: 'Todo el equipo',
      vistas: [
        {
          id: 'V01',
          titulo: 'La respuesta',
          pregunta: 'MUESTRA · ¿Conviene anticipar?',
          fuente: 'MUESTRA · Entregable 3',
          segundos: 60,
          notas: [
            '**MUESTRA.** Guion de prueba del andamiaje: la vista abre la presentación con la respuesta y una cifra.',
            'El texto definitivo lo carga la unidad de contenido.',
          ],
          textos: {
            central: { rotulo: 'Se van en 90 días', linea: 'de los que siguen comprando' },
            secundaria: { rotulo: 'Puntaje técnico', linea: 'factibilidad media' },
            mide: 'Precisión en test, por método',
            conclusion: 'MUESTRA: la regla acierta tanto como el modelo',
            barras: { logistica: 'Logística', regla: 'Regla del umbral', practica: 'Práctica actual' },
            decision: {
              area: 'Veredicto',
              estado: 'muestra',
              corta: 'MUESTRA: no viable como proyecto, piloto mínimo',
              larga: 'MUESTRA. Texto completo de la decisión, para el title de la tarjeta.',
            },
          },
        },
      ],
    },
    {
      id: 'problema',
      titulo: 'Problema, legal, riesgos y adopción',
      riel: '1 · Problema',
      integrante: 'Tomás Ferreccio',
      vistas: [
        {
          id: 'V02',
          titulo: 'El problema',
          pregunta: 'MUESTRA · ¿Qué problema tiene Casa Óga?',
          segundos: 330,
          notas: ['**MUESTRA.** Vista sin archivo todavía: el andamiaje la muestra como esqueleto.'],
        },
      ],
    },
    {
      id: 'datos',
      titulo: 'Datos y calidad',
      riel: '2 · Datos y calidad',
      integrante: 'Matías Sola',
      vistas: [
        {
          id: 'V03',
          titulo: 'Los datos',
          pregunta: 'MUESTRA · ¿Alcanzan los datos?',
          fuente: 'MUESTRA · Entregable 3, Parte A',
          segundos: 330,
          notas: [
            '**MUESTRA.** Guion de prueba: la vista muestra una cifra de datos y el puntaje de cada condición técnica.',
          ],
          textos: {
            central: { rotulo: 'Ventas sin cliente', linea: 'no se pueden atribuir' },
            secundaria: { rotulo: 'Casos para entrenar', linea: 'clientes que se fueron' },
            mide: 'Puntaje de cada condición técnica',
            conclusion: 'MUESTRA: los datos alcanzan, la capacidad humana limita',
            decision: {
              area: 'Datos',
              estado: 'muestra',
              corta: 'MUESTRA: se trabaja con las ventas que tienen cliente',
              larga: 'MUESTRA. Texto completo de la decisión, para el title de la tarjeta.',
            },
          },
        },
      ],
    },
    {
      id: 'modelo',
      titulo: 'Modelo, validación y diseño del piloto',
      riel: '3 · Modelo y piloto',
      integrante: 'Francisco Cattaneo',
      vistas: [
        {
          id: 'V04',
          titulo: 'El modelo',
          pregunta: 'MUESTRA · ¿El modelo mejora a la regla?',
          segundos: 330,
          notas: ['**MUESTRA.** Vista sin archivo todavía: el andamiaje la muestra como esqueleto.'],
        },
      ],
    },
    {
      id: 'economia',
      titulo: 'Economía y medición del piloto',
      riel: '4 · Economía',
      integrante: 'Juan Manuel Rilo',
      vistas: [
        {
          id: 'V05',
          titulo: 'Se paga',
          pregunta: 'MUESTRA · ¿Se paga?',
          fuente: 'MUESTRA · Entregable 3, Parte B',
          segundos: 330,
          notas: [
            '**MUESTRA.** Guion de prueba: la vista repite la estructura de la vista 5 del E3 (costo contra beneficio).',
            'Es la vista que scripts/paridad_final.py compara con la vista 4 del E2.',
          ],
          textos: {
            central: { rotulo: 'ROI de la regla sola', linea: 'a un año, validación sin filtro' },
            suma: { rotulo: 'Suma el modelo', linea: 'por año, en la Parte\u00a0B' },
            cuesta: { rotulo: 'Cuesta el modelo', linea: 'dólares más el primer año' },
            mide: 'Costo del año 1 contra beneficio por año',
            conclusion: 'MUESTRA: ningún escenario recupera el costo; deja',
            conclusion_fin: 'por año',
            barras: {
              costo_modelo: 'Costo año 1, con modelo',
              beneficio_modelo: 'Beneficio, con modelo',
              costo_regla: 'Costo año 1, regla sola',
              beneficio_regla: 'Beneficio, regla sola',
              eje: 'Dólares',
              presupuesto: 'presupuesto',
            },
            pie: 'MUESTRA: renglón de pie del gráfico, en una línea.',
            decision: {
              area: 'Económica',
              estado: 'no viable',
              corta: 'MUESTRA: no viable tal como está planteado',
              larga: 'MUESTRA. Texto completo de la decisión, para el title de la tarjeta.',
            },
          },
        },
      ],
    },
    {
      id: 'gestion',
      titulo: 'Gestión del proyecto y solución',
      riel: '5 · Gestión',
      integrante: 'Sebastian Caules',
      vistas: [
        {
          id: 'V06',
          titulo: 'El proyecto',
          pregunta: 'MUESTRA · ¿Cómo se gestiona el proyecto?',
          segundos: 330,
          notas: ['**MUESTRA.** Vista sin archivo todavía: el andamiaje la muestra como esqueleto.'],
        },
      ],
    },
    {
      id: 'cierre',
      titulo: 'Cierre',
      integrante: 'Todo el equipo',
      vistas: [
        {
          id: 'V07',
          titulo: 'Lo que pedimos',
          pregunta: 'MUESTRA · ¿Qué le pedimos a Casa Óga?',
          segundos: 90,
          notas: ['**MUESTRA.** Vista sin archivo todavía: el andamiaje la muestra como esqueleto.'],
        },
      ],
    },
  ],
}
