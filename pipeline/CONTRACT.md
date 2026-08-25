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
- No se deflacta por IPC (decisión del usuario, compuerta 1). Todos los importes son
  **pesos nominales corrientes** y toda pantalla en pesos lo declara al pie.

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
(696 ocupadas de 1.470 posibles al último corte). Por celda, seis enteros:

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
2.304 combinaciones × 25 cortes = 57.600 celdas agregadas.

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

## 6. Reglas duras para todo worker

1. Confirmar nombres de columna con `head -1` antes de escribir un filtro.
2. Corte fijo por parámetro, **nunca `MAX(fecha)`**.
3. Cero escritura en `raw/`. Cero lectura de `demos/`.
4. Cada función que produce un número que va a pantalla es pura y testeable sin I/O.
5. Ningún redondeo intermedio: se redondea solo al formatear para la vista.
