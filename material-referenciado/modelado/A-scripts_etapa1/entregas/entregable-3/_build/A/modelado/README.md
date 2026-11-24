# Modelado, etapa 1 (Entregable 3, Parte A, sección 2)

Generador de la ficha del experimento, la partición, el control de fugas, la métrica principal y
las líneas base. Página de trabajo: `wiki/entregables/modelado-etapa-1.md`.

## Cómo se regenera

```bash
python3 entregas/entregable-3/_build/A/modelado/dataset_v02.py
python3 entregas/entregable-3/_build/A/modelado/etapa1.py
python3 entregas/entregable-3/_build/A/modelado/lista_500.py
python3 entregas/entregable-3/_build/A/modelado/devoluciones_v02.py
```

`dataset_v02.py` necesita el pipeline de `app/` (lee las campañas y las ventas corregidas con
`tablon._bases`). `etapa1.py` solo necesita los dos CSV, pandas, numpy y scikit-learn. `devoluciones_v02.py` necesita `app/` y
`etapa2.py` de la Parte B (viene en B-scripts_etapa2.zip).

## Archivos

| Archivo | Qué hace |
|---|---|
| `comun.py` | carga, umbral y días para cruzar, partición con embargo, métricas de lista por corte, decisiones del control de fugas |
| `dataset_v02.py` | arma `dataset/churn_cliente_corte_v0.2.csv.gz` desde el v0.1 entregado en el E2: target evaluado cada día, 3 variables fuera, 3 recalculadas. Antes reproduce el target y las variables del v0.1 fila por fila |
| `etapa1.py` | control de fugas sobre el v0.1; ficha, partición y líneas base sobre el v0.2. Escribe `salida/etapa1.json` y `salida/fugas_por_variable.csv` |
| `lista_500.py` | matriz de confusión y F1 de cada línea base en la lista de 500 por corte (2.5), desde `salida/etapa1.json`. Escribe `salida/lista_500.json` |
| `devoluciones_v02.py` | compras devueltas (2.1): las filas de la regla sin contar la compra devuelta (reproduce el v0.2 fila por fila) y contándola. Escribe `salida/devoluciones_v02.json` |

Las particiones `test` y `test_flag` se cuentan para la ficha y se descartan antes de cualquier
métrica. El test se mide una sola vez, en la etapa 4.
