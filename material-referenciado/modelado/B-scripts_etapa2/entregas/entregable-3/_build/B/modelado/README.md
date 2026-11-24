# Modelado, etapa 2 (Entregable 3, Parte B, sección 4)

Generador de la comparación de modelos de la sección 4: tres modelos con configuración inicial
contra la regla del umbral, con el mismo dataset, la misma partición y la misma métrica que la
etapa 1. Página de trabajo: `wiki/entregables/modelado-etapa-2.md`. Cifras: filas G10 a G27 de
`wiki/entregables/cifras-entregable-3.md`.

## Cómo se regenera

```bash
python3 -I entregas/entregable-3/_build/B/modelado/etapa2.py
```

Tarda menos de 10 segundos. Necesita pandas, numpy y scikit-learn (corrido con 1.9.1). La salida
es determinista: dos corridas dan el mismo `etapa2.json`, byte a byte.

Usa lo de la etapa 1 sin copiarlo: importa `comun.py` de `_build/A/modelado/` (carga, partición
con embargo, lista de 500 por corte, variables), lee el dataset
`_build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz` y compara la regla del umbral con
`_build/A/modelado/salida/etapa1.json`. Si la regla no reproduce F09 (81,6 % en la lista de 500 de
validación, AUC-ROC 0,968, la matriz de la lista), el script sale con código 1 y no escribe nada.

## Archivos

| Archivo | Qué hace |
|---|---|
| `etapa2.py` | entrena la regresión logística, el árbol de decisión y el gradient boosting sobre entrenamiento con embargo; mide los tres y la regla en entrenamiento y validación; arma las matrices de confusión; bootstrap por cliente de la diferencia con la regla; coeficientes de la logística; variante de diagnóstico con `dias_para_cruzar`; lista por pérdida esperada |
| `salida/etapa2.json` | todas las cifras; la clave de cada fila del registro va en su columna de cálculo |

Claves principales de `etapa2.json`:

| Clave | Contenido |
|---|---|
| `particion` | filas, cortes y positivos de entrenamiento y validación; `maximo_lista_500`, el techo de la lista en cada conjunto |
| `modelos.<m>.entrenamiento` y `.validacion` | `lista_500` (precisión, recall, F1, matriz por corte y total), `decil_superior`, `auc_roc`, `auc_pr`, `auc_roc_cerca_del_umbral`; `umbral_05` para los tres modelos; `como_clasificador` para la regla |
| `mejor` | el candidato elegido, las cuatro matrices que usa la 4.4 (`mejor_umbral_05`, `mejor_lista_500`, `regla_lista_500`, `regla_como_clasificador`) con VP, FP, FN y VN por corte y en total, y `contra_regla` |
| `coeficientes_logistica` | los 10 términos de mayor peso, con las filas de entrenamiento que tienen ese valor |
| `variante_con_dias_para_cruzar` | los tres modelos con la variable de la regla como 41.ª; diagnóstico, no candidatos |
| `perdida_esperada` | la lista de 500 por corte ordenada por probabilidad del mejor modelo × facturación anualizada al corte (A 2.4): precisión, matriz y facturación anualizada que juntan sus aciertos y los de las listas del modelo y de la regla (G27) |

Las particiones `test` y `test_flag` se descartan al cargar (`comun.sin_reservadas`) y no se usan
para nada. El test se mide una sola vez, en la etapa 4.
