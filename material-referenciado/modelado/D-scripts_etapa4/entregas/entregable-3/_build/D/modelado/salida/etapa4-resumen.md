# Etapa 4: resultado del test (F3.1, 27/10/2026)

Fuente de cada cifra: `salida/etapa4.json` (sha256 `0368611d7d797b3bec39f19764d2e3496d9c74e539a8b6c2e8cdf03099844fbd`).
Filas del registro: J01 a J17 en `_build/D/registro-nuevo.md`.

El test se abrió una vez. `test-abierto.log` tiene una línea: 27/10/2026 15:55:55 (−03:00),
`preregistro.json` v1.1 (sha256 `c10f6ba3…`), `etapa4.py` (sha256 `7a7387ca…`) y `clase13.listo`
(sha256 `75ba0cdc…`, el que había al abrir). Después no se tocó el modelo, el umbral, el
preregistro ni el script.

## Lo que se fijó antes de abrir

- Preregistro 1.0 → 1.1 (`regla.cambios_antes_de_abrir`, 27/10, motivo: template D 8.1). Se agregó
  `template_d` con la forma de llenar la tabla 8.1, la matriz, la comparación con la B 3.4 (8.2) y
  los datos de la ficha (8.3), y cinco secundarias. No cambió el candidato, la lista, la métrica
  principal, el bootstrap ni el criterio.
- Baseline = regla del umbral. Modelo final = logística ajustada sin `genero`, el candidato de la
  etapa 3, con los 18 cortes de entrenamiento. La práctica actual se informa aparte.
- Precisión, recall, F1 y matriz salen de la lista de 500 contactables por corte, sumada sobre los
  cortes. El AUC-ROC es sobre todas las filas contactables, con los cortes juntos. El valor neto
  usa G33 y G30 y se anualiza con 12 / cortes (× 2,4 en test).
- Ensayo sin test: 125 de 125 cifras de control contra `etapa3.json` (las 90 de la v1.0 sin cambio),
  dos corridas iguales byte a byte, el camino de test corrido con validación (diferencias 0) y con
  los cinco últimos cortes de entrenamiento (anualización × 2,4), y los candados de apertura
  probados en una carpeta aparte.

## 8.1 Evaluación final en test

| Métrica | Baseline (test) | Modelo final (validación) | Modelo final (test) | Diferencia validación vs. test |
|---|---|---|---|---|
| Métrica principal: precisión de la lista de 500 contactables por corte | 86,1 % | 73,9 % | 85,9 % | +12,0 puntos |
| Precisión | 86,1 % | 73,9 % | 85,9 % | +12,0 puntos |
| Recall | 85,4 % | 94,3 % | 85,2 % | −9,1 puntos |
| F1 | 85,8 % | 82,8 % | 85,5 % | +2,7 puntos |
| AUC-ROC (filas contactables) | 0,979 | 0,966 | 0,974 | +0,008 |
| Valor neto estimado (USD por año) | 327,06 | 252,84 | 325,52 | +72,68 |

La diferencia es test menos validación. La precisión repite la métrica principal porque la
principal es la precisión de esa lista. Con dos decimales: modelo 85,88 % y regla 86,13 % en test
(J03); recall 85,16 % y 85,42 % (J04).

Matriz de confusión del modelo final en test (9.962 filas contactables de los 5 cortes; predicho
positivo = en la lista de 500 de su corte):

| | Predicho: positivo | Predicho: negativo |
|---|---|---|
| Real: positivo | VP = 2.147 | FN = 374 |
| Real: negativo | FP = 353 | VN = 7.088 |

La regla, en la misma lista: VP 2.153,35, FN 367,65, FP 346,65, VN 7.094,35 (los decimales son
empates del borde repartidos en proporción).

## Decisión (C 6.2, fila 13)

| Condición | Valor en test | Se cumple |
|---|---|---|
| 1. Límite inferior del intervalo del 95 % de (logística − regla) mayor que 0 | −1,45 puntos (intervalo −1,45 a +0,79; diferencia −0,25; 31,0 % de las réplicas a favor del modelo) | no |
| 2. Aciertos extra por mes que pagan lo que el modelo agrega al costo | −1,27 por mes (6,35 menos en 5 cortes), contra 8.595 por mes para pagar USD 10.400 (G53, G56) | no |

**La lista sigue con la regla del umbral.** Con la lista de 500 sin filtro, que no decide, la
logística gana +1,06 puntos con intervalo de +0,41 a +1,95, pero suma 5,32 aciertos por mes y
tampoco paga el costo: la decisión sería la misma.

## 8.2 ¿El modelo generaliza?

- El orden se sostiene: el AUC-ROC sobre contactables pasa de 0,966 a 0,974.
- Sube la precisión y baja el recall porque en test hay más positivos por corte entre los
  contactables: 504 en promedio (2.521 en 5 cortes) contra 392 en validación (1.175 en 3). Con
  500 lugares, en validación la precisión no podía pasar 78,3 % (1.175 / 1.500); en test la lista
  se llena de aciertos y deja afuera a 374 positivos contactables, 14,8 % (en validación, 67, 5,7 %).
- Contra el baseline: en validación la regla ganaba por 1,93 puntos con intervalo que excluía el
  cero (H16); en test la diferencia es −0,25 y el intervalo incluye el cero. El modelo no supera a
  la regla en ninguno de los dos conjuntos.

Comparación con el escenario base del ROI de la B 3.4 (a un año, valores por celda de G33):

| Fila de la B 3.4 | Base B 3.4 (id) | Test, lista de 500 contactables | Test, lista de 500 sin filtro | Costo año 1 |
|---|---|---|---|---|
| Modelo sobre la regla | USD 5,38; ROI −99,95 % (G40) | USD −1,54; ROI −100,01 % | USD 6,44; ROI −99,94 % | USD 10.400 |
| Proyecto con modelo frente a no contactar | USD 304,87; ROI −99,01 % (G40, G34) | USD 325,52; ROI −98,94 % | USD 352,39; ROI −98,85 % | USD 30.660 |
| Regla sin modelo, 15 % de descuento | USD 299,49; ROI −98,52 % (G41) | USD 327,06; ROI −98,39 % | USD 345,95; ROI −98,29 % | USD 20.260 |

Ninguna fila recupera el costo en el año, igual que en la B 3.4: el veredicto se sostiene. El
beneficio de test es mayor que el de la base. La lista de la regla con contactables pasa de
USD 264,54 por año en validación (H16, G54) a USD 327,06, y su ROI de −98,69 % (H42) a −98,39 %.
El template pide registrar en la 11.2 el ROI actualizado cuando cambia el beneficio.

## 8.3 Datos para la ficha del modelo

| Elemento | Dato | Clave en `etapa4.json` |
|---|---|---|
| Nombre y versión | `logistica_ajustada` (logística ajustada sin `genero`); preregistro v1.1; configuración sha256 `b59cabb9…`; scikit-learn 1.9.1 | `ficha_8_3.nombre`, `.hash_config`, `.preregistro_version` |
| Algoritmo e hiperparámetros | regresión logística L2, C = 0,01; agrupa en una categoría los valores con menos de 100 filas (`min_frecuencia` = 100: 3 motivos de devolución); numéricas imputadas por la mediana con marca de vacío y estandarizadas; categóricas en one-hot; lbfgs, convergió en 31 iteraciones. Elegida en grilla con 4 pliegues temporales y la regla de un error estándar (C 7.1) | `ficha_8_3.configuracion`, `.modelo` |
| Dataset y período de entrenamiento | `churn_cliente_corte_v0.2`; 18 cortes mensuales, 31/01/2023 a 30/06/2024; 18.882 filas, 2.921 clientes, 5.698 que cruzan su umbral (30,2 %) | `ficha_8_3.entrenamiento` |
| Features (cantidad y principales) | 39 variables (las 40 de la etapa 1 sin `genero`), 75 términos con el intercepto. Coeficientes estandarizados mayores: `gap_mediano` −2,47; `recency_sobre_umbral` +1,31; `recency_dias` +0,68; `compras_90d` +0,24; `envios_acum` −0,18; marca de vacío de `ticket_90d` +0,18. Por permutación (C 7.3, validación, H21): `gap_mediano` 34,4 puntos, `recency_sobre_umbral` 24,0, `recency_dias` 7,6 | `ficha_8_3.modelo.coeficientes`, `.importancia_c_7_3` |
| Umbral de decisión | lista de 500 por mes armada solo con contactables (H17); en test, el último puesto de cada lista tiene probabilidad de 0,32 a 0,39 | `ficha_8_3.probabilidad_del_ultimo_puesto` |
| Desempeño en test | precisión 85,9 % (regla 86,1 %), recall 85,2 %, F1 85,5 %, AUC-ROC 0,974, USD 325,52 por año; la regla no se reemplaza | `tabla_8_1`, `matriz_8_1`, `decision` |

Uso previsto, usos no previstos, limitaciones, reentrenamiento y responsable los escribe la
Parte D. La ficha describe un modelo que no pasa a producción: la lista sale con la regla.

## Cifras de las Partes A a C que el test no confirma (para la 11.2)

| Dónde | Lo entregado (validación) | Lo que da el test |
|---|---|---|
| C 5.3, 6.1, 6.2 fila 12, 7.4, 7.5 (H28, H43) | la lista acierta 79,7 % en mujeres y 85,8 % en hombres, también con la regla | mujeres 91,3 % y hombres 90,0 % (regla 89,9 % y 89,0 %): la brecha no aparece. `genero` X: 80,3 % en 66 lugares (69,2 % a 88,1 %) |
| C 6.1, 6.2 fila 12, 7.4 (H26) | clientes con menos de 12 meses, −4,0 puntos | +1,6 puntos (91,9 % en 62 lugares). Alto valor se repite: −2,7 (H27 decía −3,0) |
| C 7.4 (H25) | alta online 80,7 %, −1,9 puntos | 91,3 %, +1,0 punto |
| C 6.2 fila 13, 7.2, 7.5; B 4.5; E1 B 1.2 y C 1.3 (H16, G56) | en la lista que se puede mandar, la regla acierta 29 más que la logística (intervalo de −3,25 a −1,07) | 6,35 más en 5 cortes, −0,25 puntos, intervalo de −1,45 a +0,79: empate. La decisión no cambia |
| B 4.2, 4.5 (G17); C 7.1 (H06) | en la lista sin filtro, la ventaja de la logística tiene un intervalo que incluye el cero | +1,06 puntos con intervalo de +0,41 a +1,95. No cambia la decisión: no paga el costo y no es la lista que se puede mandar (L3) |
| C 7.2 (H15, H17) | la lista de 500 contactables capta 94,3 % de los positivos contactables | 85,2 %: quedan 374 afuera. El umbral de 500 se eligió en validación y no se ajusta después del test |
| B 3.3, 3.4, 4.4 (G34, G40, G41, G54); C 7.2, 7.5 (H42) | beneficio y ROI de validación | beneficio mayor y el mismo veredicto (tabla de la 8.2) |
| C 7.2 (H19) | dentro de la lista promete 76,8 % y acierta 82,6 % | promete 80,4 % y acierta 90,3 %; en todo el test, 21,8 % contra 25,3 % observado. Misma dirección, más corrida |

Se cumplen en test: la meta del criterio de éxito 1 (la regla acierta 430,67 por mes contra 379,
G56) y la alerta de la fila 10 (precisión por corte de 83,6 % a 88,2 %, arriba de 72,0 %, H44).
