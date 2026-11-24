# Scripts de la Parte D del Entregable 3 (Grupo 2)

Reproducen la etapa 4 del modelado, la evaluación en test de la sección 8 de la Parte D. Las carpetas son
las del repositorio del equipo: cada script busca sus entradas por ruta relativa, así que se corre desde
la carpeta donde se descomprimió el zip. Requiere Python 3 con pandas, numpy, scikit-learn 1.9.1 (la
versión que fija el preregistro) y matplotlib (lo importa etapa3.py).

    python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py --ensayo

Tarda menos de un minuto y escribe en `entregas/entregable-3/_build/D/modelado/salida/` dos archivos,
iguales byte a byte a los del zip:

- `etapa4_validacion.json`: la columna «Modelo final (validación)» de la tabla 8.1 y el control contra la
  Parte C (125 cifras de `etapa3.json` que se tienen que reproducir; si una no da, el script corta).
- `etapa4_ensayo.json`: el camino de test corrido con datos que no son de test, para probar el código
  antes de abrirlo.

Ninguno de los dos lee filas de test. Las cifras de test (8.1 a 8.3 y la decisión) están en
`etapa4.json`, la salida de la apertura del test que decide, el 27/10/2026 a las 15:55. La apertura quedó
en `test-abierto.log` con el sha256 de `preregistro.json` y de `etapa4.py`. Con esa línea en el registro,
`--abrir-test` se niega. `etapa4-resumen.md` es la lectura del resultado. La segunda línea del registro es
la relectura del 30/10 (`relectura_800.py` → `relectura_800.json`): la lista de 800 que pidió la
cátedra, fuera del preregistro y sin decidir nada; reproduce antes la lista de 500 de `etapa4.json`.

Qué lee y para qué:

- `_build/D/modelado/preregistro.json`: el modelo, la lista, las métricas y el criterio de decisión,
  congelados antes de abrir el test (lo armó `armar_preregistro.py`, que ya no corre). Guarda el sha256 de
  cada archivo de abajo: si alguno cambia, `etapa4.py` no corre.
- `_build/A/modelado/comun.py` y `_build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz`: el dataset y
  la partición de la Parte A. Las filas de test se descartan al leer el CSV, antes de armar la tabla.
- `_build/B/modelado/etapa2.py` y `_build/C/modelado/etapa3.py` (con `grafico.py`, que importa): las
  funciones de las etapas 2 y 3. `_build/C/modelado/salida/etapa3.json`: las cifras de validación que se
  controlan.
- `_build/B/economia/salida/economia.json`: el valor de cada celda de la B 4.4, el tipo de cambio y los
  aciertos por mes que pagan el costo del modelo. Va la versión que fijó el preregistro el 27/10; la Parte B la
  actualizó después con el diseño del piloto (su zip trae la vigente), y etapa4.py no corre con otra.

Además, dos scripts de la Parte D que no son de la etapa 4:

- `_build/D/grafico_8_1.py`: el gráfico de la 8.1 (`graficos/precision_test.png`). Lee `etapa4.json` y los
  colores de `app/src/estilos.css`. Se corre con `python3 -I entregas/entregable-3/_build/D/grafico_8_1.py`.
- `_build/D/drift/serie_riesgo.py`: la serie de clientes en riesgo y la alerta de drift de la 10.2
  (`serie_riesgo.json`). Usa el pipeline del repositorio público del tablero (carpeta `pipeline/`) y los CSV de
  la cátedra, que no van en este zip.

El detalle del método está en `_build/D/modelado/LEEME.md`.
