# Modelado, etapa 3 (Entregable 3, Parte C, sección 7)

Generador de la sección 7 de la Parte C: ajuste de hiperparámetros (7.1), umbral de decisión
(7.2), explicabilidad (7.3) y errores por segmento (7.4). Mismo dataset, misma partición y misma
métrica que las etapas 1 y 2. Página de trabajo: `wiki/entregables/modelado-etapa-3.md`. Cifras:
filas H01 a H39 de `wiki/entregables/cifras-entregable-3.md`.

## Cómo se regenera

```bash
python3 -I entregas/entregable-3/_build/C/modelado/etapa3.py
```

Tarda unos 4 minutos (la grilla del gradient boosting son 576 ajustes). Necesita pandas, numpy,
scikit-learn (corrido con 1.9.1) y matplotlib (3.9.2). Dos corridas dan el mismo `etapa3.json` y
el mismo CSV, byte a byte (semilla 42 en todo lo que sortea).

Usa lo de las etapas anteriores sin copiarlo:

| Entrada | Para qué |
|---|---|
| `_build/A/modelado/comun.py` | carga, partición con embargo, lista de k por corte, decisiones del control de fugas |
| `_build/A/modelado/dataset/churn_cliente_corte_v0.2.csv.gz` | el dataset de las etapas 1 y 2 |
| `_build/B/modelado/etapa2.py` | variables, preparación, matrices de confusión, métricas y bootstrap por cliente (solo funciones; su `main` no corre) |
| `_build/B/modelado/salida/etapa2.json` | control: la configuración inicial tiene que dar G13 y G15 |
| `_build/B/economia/salida/economia.json` | valores por celda de la 4.4 (G33), tipo de cambio (G30) y anualización × 4 (G34) |
| `app/src/estilos.css` | colores del gráfico |

Sale con código 1, sin escribir nada, si la configuración inicial de la logística o del gradient
boosting no reproduce la precisión de la lista de 500 de `etapa2.json`, o si los valores por celda
de `economia.json` no son los de G33 (VP ARS 99,96, FP ARS −47,21, FN y VN 0).

Test y test_flag se descartan al cargar (`comun.sin_reservadas`): el template de la Parte C dice
«el conjunto de test continúa reservado».

## Archivos

| Archivo | Qué hace |
|---|---|
| `etapa3.py` | búsqueda en grilla con validación temporal, medición en validación, umbrales, calibración, importancia por permutación, disponibilidad de variables, caso real y segmentos |
| `grafico.py` | gráfico de importancia con los tokens de `app/src/estilos.css` |
| `salida/etapa3.json` | todas las cifras; la clave de cada fila del registro va en su columna de cálculo |
| `salida/segmentos_etapa3.csv` | 7.4: una fila por segmento, con la precisión de la lista, su intervalo y la de la regla |
| `salida/importancia_variables_etapa3.png` | 7.3 y 7.6: gráfico de importancia de variables (va dentro del DOCX de la Parte C) |

Claves principales de `etapa3.json`:

| Clave | Contenido |
|---|---|
| `pliegues`, `regla_en_pliegues` | los cuatro pliegues temporales de la búsqueda y la regla medida en ellos |
| `busqueda.<modelo>` | grilla, cada configuración con su precisión por pliegue, media y error estándar; `mejor` y `elegida` (regla de un error estándar) |
| `medidos.<modelo>` | entrenamiento y validación: lista de 500, lista proporcional, decil, AUC; `brecha` entrenamiento − validación |
| `contra` | diferencias de precisión de la lista con intervalo por bootstrap de clientes |
| `genero` | lo que cuesta sacar `genero` contra el ruido entre cortes (D11) |
| `umbral` | listas de 500 a 800, umbral 0,5 y regla al mismo largo, con valor neto; listas solo con contactables; umbral elegido |
| `calibracion` | Brier, probabilidad media contra tasa observada, por decil y dentro de la lista |
| `coeficientes`, `importancia`, `disponibilidad`, `caso_real` | 7.3 |
| `segmentos` | 7.4 |

## Método, en dos líneas por punto

- **Búsqueda.** Cuatro pliegues de dos cortes (septiembre de 2023 a abril de 2024); cada uno
  entrena con los cortes cuyo target cierra antes de su primer corte. La métrica es la precisión
  de la lista que ocupa en cada corte la misma porción que la de 500 en validación (20,9 %), porque
  los cortes de entrenamiento son más chicos. Se elige la configuración más simple a menos de un
  error estándar de la mejor.
- **Umbral.** Cada lista se valoriza con los valores por celda de la 4.4 y se lleva a un año × 4,
  como la 4.4. La lista que Marketing puede mandar es la de contactables (`acepta_marketing` y sin
  pedido de baja al corte): el umbral se elige ahí.
- **Segmentos.** Precisión de la lista de 500 dentro de cada segmento: aciertos del segmento en la
  lista sobre los lugares que ocupa. Alto valor es el 20 % de mayor `monetary` de cada corte (D7).
