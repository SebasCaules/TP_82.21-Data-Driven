# Contrato de datos — pipeline → SPA

Decisión N0, cerrada en compuerta 2. **Ningún worker cambia este contrato.** Ante una
ambigüedad, se devuelve BLOCKED con la pregunta exacta; no se decide por cuenta propia.

Fuente: `app/data/raw/*.csv` (copia de `raw/datasets/`, md5 idéntico). Nunca se lee de `raw/`.

## 1. Limpieza — orden fijo y conteo en cada etapa

Se aplica exactamente en este orden sobre `Transacciones_clientes.csv` y se reporta el
conteo de las cuatro etapas. Los cuatro números son parte de la salida, no un log.

| Etapa | Regla | Conteo esperado |
|---|---|---|
| crudo | lectura tal cual | 50.250 |
| dedupe | `drop_duplicates()` de fila completa | 50.000 |
| identificado | `id_cliente` no nulo | 27.606 |
| monto > 0 | `monto_neto > 0` | **27.276** ← ancla 1 |

Notas que el pipeline declara y que resuelven contradicciones del wiki:

- Las 250 filas que saca el dedupe son exactamente las de `id_transaccion` duplicado:
  después del dedupe de fila completa quedan 0 ids duplicados. Los dos métodos coinciden.
- Montos ≤ 0: **613 en crudo, 608 después del dedupe**. Todos estrictamente negativos,
  ninguno en cero. El wiki reporta los dos números en páginas distintas sin declarar la
  etapa; el pipeline informa ambos.
- `canal` se normaliza de 4 etiquetas a 2: `Tienda`/`tienda` → `fisico`,
  `Online`/`E-commerce` → `online`.
- No se deflacta por IPC. La decisión de compuerta 1 era declarar los importes como pesos
  nominales; la medición del 27/08/2026 la reemplaza por un motivo más fuerte: **el extracto
  no tiene deriva de precios** (precio unitario implícito −7,6 % de 2022 a 2025, plano en las
  siete categorías, contra un IPC que multiplicó los precios por más de 13). No hay inflación
  en el dato que deflactar, y la base de precios de `monto_neto` sigue sin estar declarada por
  el negocio. Toda pantalla en pesos lo dice al pie.

## 2. Cortes

25 cortes mensuales, fin de mes, de **2023-12-31 a 2025-12-31** (decisión compuerta 1).
El corte por defecto de la SPA es 2025-12-31. Cada cifra en pantalla lleva su corte al lado.

## 3. Definiciones por corte

Todo se recalcula desde cero en cada corte, usando solo transacciones con `fecha <= corte`.

| Campo | Definición |
|---|---|
| `recency` | días entre la última compra del cliente y el corte |
| `gap_mediano` | mediana de los días entre compras consecutivas del cliente |
| `elegible` | el cliente tiene 3 compras o más |
| `en_riesgo` | `elegible` **y** `recency > max(90, 1,5 × gap_mediano)`. Un cliente no elegible nunca está en riesgo |
| `facturacion` | suma de `monto_neto` hasta el corte |
| `anualizado` | `facturacion / años`, donde **años = días entre la primera compra y el CORTE / 365,25**. No hasta la última compra. Con años = 0 se usa `facturacion` |
| `quintil` | `qcut(facturacion, 5)` → 1 a 5 |
| `region` | región de la tienda donde el cliente **concentra su gasto** hasta el corte. Sin ninguna compra en tienda física → `Solo online` |
| `categoria` | categoría donde el cliente concentra su gasto hasta el corte |
| `perdida_esperada` | `anualizado` de los clientes en riesgo. Es exposición, no recupero |

### RFM

R, F, M son quintiles de `qcut(serie.rank(method="first"), 5)` → 1 a 5. R se rankea
**descendente** (recency baja = score alto). F rankea el número de compras, M la facturación.

Segmentos, excluyentes, **primera regla que aplica gana**, en este orden:

1. `Campeones` — R≥4 ∧ F≥4 ∧ M≥4
2. `En riesgo` — R≤2 ∧ F≥3
3. `Leales` — R≥3 ∧ F≥4
4. `Hibernando` — R≤2 ∧ F≤2
5. `Nuevos` — R≥4 ∧ **n_compras == 1** (conteo literal, no el quintil F)
6. `Potenciales` — R≥4 ∧ F≤2
7. `Perdidos` — el resto

> Al corte 31/12/2025 esto da Campeones 1.014, En riesgo 1.018, Leales 820, Hibernando
> 1.373, Nuevos 34 — los cinco exactos contra el wiki — y Perdidos 1.128 / Potenciales 591
> contra 1.129 / 590 del wiki: **un cliente** en un empate de borde de quintil. Es la regla
> reproducible; la corrección al wiki va en compuerta 6.

## 4. Payload

Tres bloques. Todo entero, todo cuantizado, sin strings repetidos.

### 4.1 Diccionarios (una vez)

```
dims: { region: [...6], categoria: [...7], rfm: [...7], quintil: [1..5] }
cortes: ["2023-12-31", ..., "2025-12-31"]   // 25
```

`region` incluye `Solo online` como sexto valor, para que el corte por región **reconcilie
con el total de la base**. 317 clientes al 31/12/2025 no tienen ninguna compra en tienda
física y no se pueden geolocalizar; esconderlos rompería la suma.

### 4.2 Tabla de contingencia — el corazón

Por cada corte, una fila por celda **ocupada** de `region × categoria × rfm × quintil`
(664 ocupadas de 1.470 posibles al último corte). Por celda, seis enteros:

| Campo | Tipo | Qué es |
|---|---|---|
| `k` | uint16 | clave empaquetada de la celda: `((reg*7 + cat)*7 + rfm)*5 + (q-1)` |
| `n` | uint16 | clientes |
| `nr` | uint16 | clientes en riesgo |
| `ne` | uint16 | clientes elegibles |
| `f` | uint32 | facturación histórica, en ARS |
| `fr` | uint32 | facturación histórica de los en riesgo |
| `a` | uint32 | anualizado total, en ARS |
| `ar` | uint32 | anualizado de los en riesgo (= exposición) |

**Toda combinación de filtros es una suma de celdas.** El navegador no calcula riesgo,
recency, quintiles ni RFM: filtra celdas y suma. Toda la aritmética con riesgo de
divergencia queda en Python. Esto es lo que hace validable la grilla completa de
2.688 combinaciones × 25 cortes = 67.200 celdas agregadas.

### 4.3 Listas de Marketing

Por corte, los **800 clientes en riesgo de mayor `anualizado`** (tope de la capacidad
declarada, decisión compuerta 1), con el total en riesgo al lado para que se vea qué queda
sin cubrir:

| Campo | Tipo |
|---|---|
| `id` | uint16, índice al array de ids de cliente |
| `a` | uint32 anualizado |
| `rec` | uint16 recency |
| `gap` | uint16 gap mediano |
| `qs` | uint8, quintil y segmento RFM empaquetados |
| `gk` | uint8, región y categoría empaquetadas |
| `mk` | uint8, `acepta_marketing` |

### 4.4 Series

| Serie | Contenido |
|---|---|
| `recompra_trimestral` | tasa por trimestre 2022Q1–2025Q3, con la meta 10-11 % y la base 8-9 % |
| `embudo_campanias` | por `segmento_objetivo`: envíos, abre, clic, compra a 7 días. **Las dos bases declaradas**: 23.729 del dataset y 23.529 limpios |
| `base_activa_anual` | clientes activos y primeras compras por año |
| `consentimiento` | envíos a clientes con `acepta_marketing = False` |
| `exposicion_por_corte` | la serie de los 25 cortes, para el "cómo vengo" que pide la clase 4 |
| `facturacion_anual_cohorte` | por corte y por año, la facturación identificada partida entre los clientes en riesgo AL CORTE y el resto. Cohorte fija mirada hacia atrás; no es la tasa de riesgo de cada año |
| `consentimiento_anual` | el mismo corte de `consentimiento` abierto por año de `fecha_envio`, cada año sobre su propia base de envíos |
| `criterios_orden` | por criterio de armado de la lista: clientes que alcanza, exposición cubierta, costo contra el actual, y la tasa de compra a 7 días con su IC de las campañas que ya salieron a esos mismos clientes |
| `potencia_experimento` | diferencia mínima detectable del experimento que declara `meta.experimento`, en puntos porcentuales |

Las cuatro últimas se agregaron el 27/08/2026 con el rediseño de las vistas 02, 08, 10 y 13.
Ninguna cambia una definición existente: son cortes nuevos de las mismas bases. Las tres
primeras salen de `pipeline/series.py`; la cuarta es aritmética de potencia sobre la tasa
global del embudo. Todas están ancladas en `_anclas_variantes` de `build.py`.

`meta.experimento` declara el reparto de la capacidad en ramas (360/360/80) y cuántos cortes
se prevé correr. Vive en el payload y no en la pantalla porque `potencia_experimento` se
calcula con esos mismos números: separados, el MDE podría quedar describiendo un experimento
distinto del que la vista propone.

## 5. Anclas — el pipeline para si alguna falla

Corte 31/12/2025:

| Chequeo | Esperado |
|---|---|
| filas identificadas | 27.276 |
| ventana de fechas | 2022-01-03 a 2025-12-29 |
| clientes con compra válida | 5.978 |
| elegibles | 4.940 |
| en riesgo | 2.452 |
| exposición anual | ARS 94,9 M |
| base anualizada | ARS 204,6 M |
| facturación histórica en riesgo | ARS 262,8 M |
| facturación de la base | ARS 550,2 M |
| exposición al 30/09/2025 | ARS 80,1 M |
| riesgo Q5 / riesgo Q1 | 51,8 % / 13,3 % |
| amplitud de riesgo entre las 5 regiones | 2,8 pp |

Las series del rediseño suman 25 anclas más (`_anclas_variantes`), y cinco de ellas son
booleanas: anclan el **hallazgo** que el título de la pantalla afirma, no solo la cifra.

| Chequeo | Esperado |
|---|---|
| peso de la cohorte en riesgo, 2022 a 2025 | 47,3 / 52,1 / 54,8 / 31,2 % |
| la cohorte pesa menos en 2025 que en cualquier año previo | verdadero |
| envíos sin consentimiento, 2022 a 2025 | 29,5 / 31,2 / 30,3 / 29,6 % |
| amplitud del incumplimiento entre años | 1,7 pp |
| exposición por criterio (actual / Q5+180d / Hibernando / azar) | 49,5 / 32,1 / 12,3 / 31,0 M |
| ningún criterio alternativo se distingue del actual por tasa | verdadero |
| MDE del experimento propuesto | 1,71 pp |

Subtotal con el rediseño: **121 anclas**.

### 5.1 Series globales (`_anclas_series_globales`)

Las dos series que no dependen del corte no tenían ancla, y una de ellas es el KPI de
cabecera. Son 13 chequeos, uno booleano.

| Chequeo | Esperado |
|---|---|
| trimestres con recompra calculable | 15 |
| pico de recompra | 2024Q2 · 19,0 % |
| último calculable | 2025Q3 · 8,5 % |
| el último queda por debajo de la línea base 8-9 | verdadero |
| base activa 2022 a 2025 | 2.472 / 4.472 / 4.755 / 3.956 |
| primeras compras 2023 y 2025 | 2.647 / 111 |
| variación de la base activa en 2025 | −16,8 % |

**Total del arnés: 134 anclas.**

## 6. Reglas duras para todo worker

1. Confirmar nombres de columna con `head -1` antes de escribir un filtro.
2. Corte fijo por parámetro, **nunca `MAX(fecha)`**.
3. Cero escritura en `raw/`. Cero lectura de `demos/`.
4. Cada función que produce un número que va a pantalla es pura y testeable sin I/O.
5. Ningún redondeo intermedio: se redondea solo al formatear para la vista.
