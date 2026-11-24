# Scripts de la Parte C del Entregable 3 (Grupo 2)

Reproducen la sección 7 de la Parte C: ajuste de hiperparámetros (7.1), umbral de decisión (7.2),
explicabilidad (7.3) y errores por segmento (7.4), y el indicador de la limitación principal de la 6.5. Las carpetas son las del repositorio del equipo:
cada script busca sus entradas por ruta relativa, así que se corre desde la carpeta donde se
descomprimió el zip. Requiere Python 3 con pandas, numpy, scikit-learn (corrido con 1.9.1) y
matplotlib.

    python3 -I entregas/entregable-3/_build/C/modelado/etapa3.py

Tarda unos 4 minutos y escribe en `entregas/entregable-3/_build/C/modelado/salida/`:
`etapa3.json` (todas las cifras), `segmentos_etapa3.csv` (la tabla de la 7.4) y el gráfico de
importancia de variables en PNG (la figura de la 7.3). Las salidas que vienen en el zip son las
publicadas: una corrida nueva da los mismos dos archivos de datos, byte a byte.

    python3 -I entregas/entregable-3/_build/C/modelado/indicador_6_5.py

Tarda unos segundos y escribe `indicador_6_5.json`: el cruce a 90 días de la lista de la regla (solo
contactables, llevada en cada corte a la parte de los contactables que ocupa la de 500 en validación)
menos el de toda la base elegible del mismo corte, de octubre de 2023 a diciembre de 2024 (el valor de
referencia del indicador de la 6.5). Corta si no coincide con lo publicado.

Qué lee y para qué:

- `_build/A/modelado/comun.py` y `_build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz`: el
  dataset y la partición de las etapas 1 y 2 (Parte A). El test se descarta al cargar.
- `_build/B/modelado/etapa2.py` y `_build/B/modelado/salida/etapa2.json`: las funciones de la etapa 2
  y su resultado; si la configuración inicial no da lo mismo que la etapa 2, el script corta.
- `_build/B/economia/salida/economia.json`: el valor de cada celda de la 4.4 de la Parte B.
- `app/src/estilos.css`: los colores del gráfico.

El detalle del método está en `_build/C/modelado/LEEME.md`.
