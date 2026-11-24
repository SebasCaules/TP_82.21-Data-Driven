# Scripts de la Parte B del Entregable 3 (Grupo 2)

Reproducen las cifras de la Parte B. Las carpetas son las del repositorio del equipo: cada script
busca sus entradas por ruta relativa, así que se corren desde la carpeta donde se descomprimió el zip.
Requieren Python 3 con pandas, numpy y scikit-learn (corrido con 1.9.1). Las salidas que vienen en el
zip son las publicadas: una corrida nueva da los mismos archivos.

## 1. Datos de Casa Óga del 13/10 (margen, costo de adquisición, inversión en retención)

    python3 -I entregas/entregable-3/_build/B/datos/margen_marketing.py

Escribe `datos/margen_marketing.json` (filas G01 a G07 del registro de cifras del equipo).

## 2. Sección 4: modelado, etapa 2

    python3 -I entregas/entregable-3/_build/B/modelado/etapa2.py

Usa `_build/A/modelado/comun.py`, el dataset v0.2 (`_build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz`,
el mismo que `A-churn_cliente_corte_v0.2.csv`) y `_build/A/modelado/salida/etapa1.json`. Escribe
`modelado/salida/etapa2.json`. Las particiones de test se descartan al cargar: ninguna métrica las usa.

## 3. Sección 3 y 4.4: factibilidad económica

    python3 -I entregas/entregable-3/_build/B/economia/economia.py

Lee `etapa2.json`, `margen_marketing.json`, `_build/A/factibilidad/salida/condiciones.json` y el
dataset v0.2. Escribe `economia/salida/economia.json` y la planilla `costos_beneficios_roi.csv`
(la misma que `B-costos_beneficios_roi.csv`). Las filas «8.2 test (Parte D)» de la planilla, el ROI
rehecho con el test, salen de `_build/D/modelado/salida/etapa4.json`, que viene en el zip; el script
que lo escribe está en `D-scripts_etapa4.zip`.

Desde la v3.0 (24/11/2026) escribe además los costos por etapa (piloto mínimo, producción completa y operación
mínima), el umbral de pase del piloto, su potencia y el valor de la información (claves `piloto_minimo`,
`produccion_completa`, `operacion_minima`, `umbral_de_pase`, `potencia_piloto`, `valor_informacion`), y llama
a `cv_temporal.py`, que escribe `economia/salida/cv_temporal.json`: lo que deja la regla por año en cada
trimestre y en cada ventana de doce meses del histórico (clave `rango_anual`). `cv_temporal.py` lee además
`_build/C/modelado/salida/etapa3.json`, que viene en el zip; el script que lo escribe está en `C-scripts_etapa3.zip`.

## 4. Gráfico de la 3.5

    python3 -I entregas/entregable-3/_build/B/grafico/grafico_3_5.py

Lee `economia/salida/economia.json` → `grafico_3_5` y escribe `grafico/salida/grafico_3_5.png`: el ROI a un año
de la regla sin modelo, con 15 % de descuento, moviendo una variable por vez. Necesita matplotlib.

## CSV de la cátedra que hacen falta

Con sus nombres originales, en estas carpetas de la misma raíz:

- `raw/datasets/unidad-1/` (3): Campanias_marketing.csv, Clientes.csv, Transacciones_clientes.csv
- `raw/datasets/unidad-2/` (2): Catalogo_Acciones_Retencion.csv, Identidad_resuelta.csv
- `raw/datasets/unidad-3/` (2, enviados por Casa Óga el 13/10): Costo_Margen_Categoria_Mensual.csv,
  Inversion_Marketing_Anual.csv
- `raw/Respuestas_Consultas_Entregable_3.md`: la respuesta de Casa Óga del 13/10, de donde los scripts
  verifican el texto del tope de descuento

La lista de 500 armada solo con clientes contactables (3.3 y 4.4) la calcula la etapa 3, en
`C-scripts_etapa3.zip`.
