# Modelado, etapa 4 (Entregable 3, Parte D): evaluación en test

El conjunto de test se mira una sola vez, con el modelo ya elegido (clase 12, lámina 5; ver
[[criterios-de-la-catedra]]; template de la D, 8.1). La A 2.2 lo reservó hasta esta etapa. Esta
carpeta lo cumple en dos pasos: `preregistro.json` congela qué se mide y cómo se decide, y
`etapa4.py` no abre el test sin la marca de la clase 13 y sin dejar registrada la apertura.

**Estado (27/10/2026): el test ya se abrió, una vez** (F3.1). `test-abierto.log` tiene una línea
(15:55:55, −03:00). Resultado: la lista sigue con la regla del umbral. Las cifras están en
`salida/etapa4.json`, la lectura para la Parte D en `salida/etapa4-resumen.md` y las filas del
registro (J01 a J17) en `../registro-nuevo.md`. Desde ahora `armar_preregistro.py` no corre y
`etapa4.py --abrir-test` se niega (código 2).

**Relectura (30/10/2026): lista de 800, fuera del preregistro, no decide.** La devolución de la cátedra
del 29/10 (fila B 2.1) pidió comparar modelo y regla también en una lista de 800 por mes. `etapa4.json`
guarda solo agregados de la de 500, así que `relectura_800.py` volvió a puntuar test con la
configuración congelada, sin cambiar `etapa4.py`. Dejó la segunda línea de `test-abierto.log` antes de
leer test, reprodujo la lista de 500 de `etapa4.json` (J03, J08) y escribió `salida/relectura_800.json`
(J25). La decisión sigue siendo la del 27/10.

## Archivos

| Archivo | Qué hace |
|---|---|
| `preregistro.json` | v1.1. Congela el candidato (logística ajustada sin `genero`, configuración `{"C":0.01,"min_frecuencia":100}` con su sha256), la regla del umbral, la lista de 500 contactables por corte, la métrica principal, las secundarias, el bootstrap por cliente (1.000 réplicas, semilla 42, intervalo del 95 %), el criterio de la C 6.2, fila 13, citado textual, los cortes de test y los que quedan fuera. `template_d` dice cómo se llenan la tabla y la matriz de la 8.1, la comparación con la B 3.4 (8.2) y la ficha (8.3). Guarda el sha256 del dataset, de `comun.py`, `etapa2.py`, `etapa3.py`, `etapa3.json` y `economia.json` |
| `armar_preregistro.py` | Arma `preregistro.json`. Lee solo train y dev (para el esquema). No corre si existe `test-abierto.log` |
| `etapa4.py` | Mide con lo que fija el preregistro. Sin bandera, solo validación; `--ensayo`, el camino de test sin test; `--abrir-test`, el test |
| `salida/etapa4_validacion.json` | Las cifras de validación, la columna «Modelo final (validación)» de la 8.1 y el control contra `etapa3.json`, cifra por cifra |
| `salida/etapa4_ensayo.json` | El camino de test corrido con validación y con los cinco últimos cortes de entrenamiento. Sus cifras no se citan |
| `salida/etapa4.json` | Las cifras de test: tabla 8.1, matriz, comparación con la B 3.4, datos de la ficha y decisión |
| `salida/etapa4-resumen.md` | La lectura del resultado para la Parte D (8.1 a 8.3) y lo que el test no confirma de las Partes A a C (para la 11.2) |
| `relectura_800.py` | Relectura del 30/10: lista de 800 en test y validación, con la de 500 como control contra `etapa4.json`. Se niega si su salida ya existe |
| `salida/relectura_800.json` | Las cifras de la lista de 800 (J25) y el resultado del control de la de 500 |
| `test-abierto.log` | Una línea por apertura: fecha, sha256 de `preregistro.json`, de `etapa4.py` y de `clase13.listo`. No se borra |

## Cómo se corre

Desde la raíz del vault. Necesita pandas, numpy, scikit-learn 1.9.1 (la versión de la etapa 3, la
fija el preregistro) y matplotlib (lo importa `etapa3.py`).

```bash
# Solo validación: reproduce la Parte C y no lee test. Unos 8 segundos.
python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py

# El camino de test con datos que no son de test. Unos 25 segundos.
python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py --ensayo

# Abre el test, una sola vez. Ya se corrió el 27/10/2026; ahora se niega.
python3 -I entregas/entregable-3/_build/D/modelado/etapa4.py --abrir-test

# Relectura de la lista de 800 (30/10/2026). Ya se corrió; ahora se niega.
python3 -I entregas/entregable-3/_build/D/modelado/relectura_800.py
```

Sin bandera escribe `salida/etapa4_validacion.json`. Dos corridas dan el mismo archivo, byte a
byte. La regla en la lista de 500 contactables da 75,8 % y la logística, 73,9 % (H16 y H15). La
diferencia va de −3,25 a −1,07 puntos. El control compara 125 cifras con `etapa3.json`, con
tolerancia 1e-9: las 90 de la v1.0 del preregistro y 35 que agregó F3.1 (valor neto de la lista
sin filtro, probabilidad del último puesto, los 15 coeficientes de H20 y las categorías
agrupadas). Si una no reproduce, sale con código 1.

`--ensayo` corre, después del control, el mismo camino que el test: (a) validación como si fuera
test, donde cada diferencia de la tabla 8.1 tiene que dar 0, y (b) los cortes de febrero a junio
de 2024 con el entrenamiento hasta noviembre de 2023, para probar la anualización con cinco cortes
(× 2,4). No lee test.

Con `--abrir-test`, en este orden:

1. Verifica las huellas del preregistro y repite el control en validación.
2. Corre el ensayo. Si falla, no abre (código 1).
3. Exige `contratos/clase13.listo`. Se niega (código 2) si `test-abierto.log` ya tiene una línea.
4. Agrega la línea con fecha a `test-abierto.log`.
5. Recién ahí lee train y test. Entrena con los 18 cortes de train, con el embargo de mayo y junio
   de 2024 de vuelta (A 2.2). Mide en los cinco cortes de test, enero a mayo de 2025.
6. Aplica el criterio de la C 6.2, fila 13. Escribe `salida/etapa4.json`.

`--reintento` (con `--abrir-test`) sirve solo si la apertura anterior quedó registrada y no llegó a
escribir `salida/etapa4.json`. Deja otra línea en el registro. No hizo falta.

## Candados

- El lector filtra el CSV por partición como texto, antes de armar el DataFrame. Una aserción corta
  la corrida si se piden filas de test sin la bandera. `test_flag` no se lee en ningún modo
  (DC-09).
- El interruptor que habilita test solo se prende después de escribir la línea del registro.
- Si cambia el dataset, un script de las etapas 1 a 3, `etapa3.json`, `economia.json`, la versión
  de scikit-learn o la configuración del candidato, no corre (código 1).
- Los cambios al preregistro antes de abrir están en `regla.cambios_antes_de_abrir`: uno, el
  27/10 (v1.0 → 1.1, template D 8.1). La línea del registro guarda el sha256 con que se abrió
  (`c10f6ba3…`).
- Los candados de apertura se probaron el 27/10 con rutas de prueba, sin leer test: sin contrato
  no abre, una segunda apertura se niega, `--reintento` solo pasa sin salida escrita, y `leer`
  corta si se piden test o test_flag sin la bandera.

## Criterio de decisión

Texto de la C 6.2, fila 13: «Un modelo reemplaza a la regla solo si suma aciertos por mes con un
intervalo que excluye el cero y paga lo que agrega al costo (criterio de éxito 1, B 4.5). Se mide
en el test, en la etapa 4».

En el script son dos condiciones:

- **Intervalo.** El límite inferior del intervalo del 95 % de (logística − regla) es mayor que 0. Se
  mide en la precisión de la lista de 500 contactables por corte, con bootstrap por cliente.
- **Costo.** La logística acierta por mes, en esa lista, al menos 8.594,66 clientes más que la regla
  (`economia.json` → `meta_criterio_1`; G53 y G56). Es lo que paga los USD 10.400 de G40.

Si se cumplen las dos, la logística reemplaza a la regla. Si no, la lista sigue con la regla.

Resultado en test (J10): intervalo de −1,45 a +0,79 puntos y −1,27 aciertos por mes. No se cumple
ninguna de las dos. **La lista sigue con la regla del umbral.** Las secundarias se informan y no
deciden.
