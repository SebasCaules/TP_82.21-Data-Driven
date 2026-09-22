# Contrato de datos E2 — pipeline de calidad → tablero `/e2/` y Parte B

Decisión N0 del 22/09/2026 (bitácora en `wiki/entregables/plan-entregable-2.md`). **Ningún
worker cambia este contrato**: ante una ambigüedad devuelve BLOCKED con la pregunta exacta.
Todo lo que el tablero E2 y la Parte B muestran sale de acá; ninguna cifra se escribe a mano.

## 0. Reglas duras

- El pipeline E2 **no toca ningún archivo del E1**: ni `loader.py`, `features.py`, `series.py`,
  `pack.py`, `build.py`, `validate.py`, `golden.py`, ni `src/datos.js`, ni `data/payload/datos.json`.
  Importa `loader`, `features` y `series` como librerías (son funciones puras) y aplica sus
  correcciones sobre copias de los DataFrames.
- Fuentes: `app/data/raw/*.csv` (los 6 del E1) y `app/data/raw_e2/*.csv` (los 7 de la unidad 2,
  md5 idéntico a `raw/datasets/unidad-2/`). Nunca se lee de `raw/`.
- Módulos nuevos: `pipeline/calidad.py` (las decisiones DC como funciones puras),
  `pipeline/build_e2.py` (orquestador: anclas + escritura), `pipeline/validate_e2.py` (arnés de
  solo lectura), `pipeline/tablon.py` (dataset de entrenamiento por cortes).
- Salidas: `data/payload/e2.json` (gitignored por patrón) y `e2/src/datos_e2.js` con
  `export const D2 = {...};` (versionado). El tablón se escribe fuera de `app/`:
  `entregas/entregable-2/_build/B/dataset/` (CSV gzip, sin pyarrow) más `resumen_tablon.json`.
- Corte de referencia **2025-12-31** (igual que el E1, `CORTE_REF`); corte de sensibilidad
  **2025-08-31** (`CORTE_SENS`, decisión DC-09). Fecha de la última venta: 2025-12-29.
- Base "antes" = archivo crudo tal como llega (con duplicados, signos, etiquetas). Base
  "después" = con las decisiones DC aplicadas en el orden de la sección 2. Cada vista muestra
  las dos sobre el **mismo corte**, nunca dos cortes distintos salvo cuando la decisión es el corte.
- Formato de número: los valores van crudos (int/float nativos), sin redondear salvo donde se
  indica `pct` (una decimal) y `M` (millones con una decimal). El tablero formatea.
- Toda cifra que el registro `wiki/entregables/cifras-entregable-2.md` ya tiene es un **ancla**
  con valor esperado (sección 5): si no cierra, `build_e2.py` corta y no escribe nada.

## 1. Decisiones DC (la lista canónica está en `wiki/sintesis/decisiones-de-calidad-de-datos.md`)

| id | Archivo | Qué hace `calidad.py` |
|---|---|---|
| DC-01 | Transacciones | `drop_duplicates()` de fila completa |
| DC-02 | Transacciones · Devoluciones | conserva filas negativas con `es_devolucion=True`; unidades solo de filas positivas; serie de devoluciones por `fecha_devolucion` y por la fecha de la fila negativa |
| DC-03 | Transacciones · Clientes | `canal` → {`fisico`, `online`} (mapeo de `loader`); `canal_alta`: `Tienda`/`Sucursal` → `fisico`, `Online` → `online` |
| DC-04 | Clientes · Identidad_resuelta | `id_cliente` → `id_cliente_canonico` (mapa de `Identidad_resuelta.csv`, `es_canonico`); se aplica a transacciones, campañas, soporte, devoluciones, bajas y fidelización antes de agregar |
| DC-05 | Campanias | `drop_duplicates()` de fila completa (equivale a `id_envio` único: verificar y reportar) |
| DC-06 | Campanias · Fidelizacion | el segmento de campaña no se usa como nivel; nivel = `Fidelizacion.nivel` (`no socio` si no está) |
| DC-07 | Clientes · Fidelizacion | `edad` fuera de [15, 100] → NaN con `edad_flag`; `puntos_canjeados > puntos_acumulados` → NaN con bandera; `fecha_alta` > 2025-12-31 → bandera |
| DC-08 | todos | corte común: para cualquier cruce con comportamiento se usan solo datos con fecha ≤ `CORTE_REF`; calendario y bajas se conservan enteros como contexto |
| DC-09 | Transacciones | mes con `n_ventas / n_ventas_mismo_mes_año_anterior < 0.60` → `cobertura_no_confirmada` (esperado: 2025-09 a 2025-12); sensibilidad de riesgo y exposición con `CORTE_SENS` |
| DC-10 | Transacciones | no se deflacta; se calcula la mediana anual de `monto_neto/unidades` y se publica el índice IPC acumulado (D09: 94,8 %, 211,4 %, 117,8 % para 2022, 2023, 2024) como comparación |
| DC-11 | Interacciones_soporte | `nps_sin_interaccion = (reclamos==0) & (consultas==0) & nps_promedio.notna()`; NPS medio anual con y sin esas filas |
| DC-12 | Historial_Bajas | análisis de comportamiento: `fecha_solicitud ≤ CORTE_REF` (812); filtro de contacto: todas (1.211) |
| DC-13 | Contenido_Campanias | dedupe por `id_campania`: queda la fila cuya `fecha_envio` coincide con la de `Campanias_marketing` para esa campaña; si ninguna o ambas coinciden, la de `fecha_creacion` más reciente; `tipo_oferta` normalizado a 5 valores (misma tabla de grafías que `recalc_e2a.py`); reportar las filas elegidas y descartadas |
| DC-14 | Catalogo_Acciones | costo vigente al 22/09; estado `declarada`. La tasa de éxito por acción no se calcula en el E2 (el catálogo no trae la correspondencia acción-oferta): `calidad.py` puede imprimir la tabla proxy a stdout, pero no viaja en el payload. `vista` = "V01" |
| DC-15 | Documentación | sin cálculo; solo estado |

Orden de aplicación: DC-01 → DC-02 → DC-03 → DC-05 → DC-13 → DC-04 → DC-07 → DC-12 → DC-08 (corte).
DC-09, DC-10, DC-11 y DC-14 son lecturas sobre la base ya corregida.

## 2. `e2.json` — forma exacta

```json
{
  "meta": {
    "version": "e2-1.0", "corte_ref": "2025-12-31", "corte_sens": "2025-08-31",
    "ultima_venta": "2025-12-29", "umbral_cobertura": 0.60,
    "archivos": [ {"nombre": "Transacciones_clientes.csv", "sistema": "POS + e-commerce", "filas": 50250,
                    "desde": "2022-01-03", "hasta": "2025-12-29", "granularidad": "transacción"} ]   // los 13, en este orden: los 6 del E1 y los 7 de la unidad 2
  },
  "decisiones": [
    { "id": "DC-01", "archivo": "Transacciones_clientes.csv", "dimension": "unicidad",
      "hallazgo": "250 filas duplicadas exactas", "decision": "…", "justificacion": "…",
      "estado": "aplicada" | "declarada" | "pendiente del negocio",
      "antes":   {"valor": 50250, "etiqueta": "filas"},
      "despues": {"valor": 50000, "etiqueta": "filas"},
      "impacto": "…una frase con la cifra…", "cifras": ["D01"], "vista": "V04" }
  ],   // 15 objetos, DC-01 a DC-15; los textos salen de wiki/sintesis/decisiones-de-calidad-de-datos.md (celdas), no se inventan
  // Claves aditivas admitidas (22/09): meta.archivos[].origen_dir y .ruta; V02.riesgo.*.exposicion_M; V07.casos[].desempate; V11.positivos y V11.features; stage_counts.ventas_M, .edades_fuera_de_rango, .edades_nulas. Ninguna clave del contrato puede faltar.
  "vistas": { …una clave por vista, sección 3… },
  "anclas": [ {"nombre": "…", "valor": …, "esperado": …, "ok": true} ],   // sección 5
  "stage_counts": { "crudo": 50250, "dedupe": 50000, "identificado": 27606, "monto_pos": 27276 }
}
```

## 3. Datos por vista (`vistas.Vnn`)

- **V01 Qué decidimos** — `{"n_archivos": 13, "n_decisiones": 15, "por_estado": {"aplicada": n, "declarada": n, "pendiente del negocio": n}, "por_archivo": [{"archivo", "decisiones": ["DC-01", …]}]}`.
- **V02 Ventana de extracción** — `{"archivos": [{"nombre", "desde", "hasta", "filas", "tipo": "transaccional"|"contexto"}], "corte_ref", "riesgo": {"al_2026_08_31": {"corte", "elegibles", "en_riesgo", "pct"}, "al_corte_ref": {...}}}`. `pct` = en_riesgo / elegibles × 100, una decimal. Riesgo con la regla E1 (`features.client_facts`) sobre la base **antes de DC-04** (para que 49,6 y 85,2 reproduzcan D05).
- **V03 Cobertura 2025** — `{"serie": [{"mes": "2024-01", "n": 1480, "n_prev": …, "ratio": 0.94, "flag": false}], "meses_flag": ["2025-09", …], "sensibilidad": {"corte_ref": {"corte", "elegibles", "en_riesgo", "pct", "exposicion_M"}, "corte_sens": {...}}}`. Serie de 2023-01 a 2025-12 sobre filas únicas con monto > 0 (antes de DC-04). Sensibilidad sobre la base después de DC-04.
- **V04 Duplicados de cliente** — `{"antes": {"clientes": 5978, "elegibles", "en_riesgo", "pct": 49.6, "exposicion_M": 94.9}, "despues": {"clientes": 5634, …, "pct": 50.4, "exposicion_M": 96.4}, "personas_por_n_ids": [{"n_ids": 2, "personas": …}, …], "duplicados_con_actividad": 348, "canonicos_sin_compra_propia": 4}`.
- **V05 Devoluciones** — `{"unidades": {"antes": 107352, "despues": 106028}, "devoluciones": {"crudas": 613, "unicas": 608}, "serie": [{"mes": "2022-01", "por_fila_negativa": n, "por_fecha_devolucion": n}], "desfase_dias": {"mediana": 11, "min": …, "max": …}, "motivos": [{"motivo", "n"}]}`.
- **V06 Envíos, consentimiento y bajas** — `{"envios": {"antes": 23729, "despues": 23529}, "embudo": {"antes": {"abre_pct", "clic_pct", "compra_pct"}, "despues": {...}}, "sin_consentimiento": {"n": 7078, "pct": 30.1}, "bajas": {"total": 1211, "hasta_corte": 812, "2026": 399}, "lista_800": {"contactables_consentimiento": 568, "contactables_sin_baja": …}}`. `lista_800` = los 800 en riesgo de mayor `anualizado` al corte ref (`features.top_lista` sobre la base después de DC-04); `contactables_sin_baja` excluye además a quien tiene cualquier baja (las 1.211).
- **V07 Campañas: join y Gold** — `{"casos": [{"id_campania": "CAMP004", "elegida": {"fecha_creacion", "fecha_envio", "tipo_oferta"}, "descartada": {...}, "criterio": "fecha_envio coincide" | "fecha_creacion más reciente"}], "ofertas": [{"tipo", "antes": {"n", "compras", "tasa_pct", "ic_lo", "ic_hi"}, "despues": {...}}], "envios_duplicados_por_join": 920, "gold": {"envios": 5066, "socios": 3, "coincidencia_pct": 30.1}}`. `antes` = D16 (sin CAMP004 ni CAMP034, 22.614); `despues` = base completa 23.529 con DC-13. IC de Wilson al 95 %.
- **V08 Precios** — `{"mediana_unitaria": [{"anio": 2022, "valor": 8900}, …], "ipc": [{"anio": 2022, "acumulado": 1.0}, {"anio": 2023, "acumulado": 1.948}, …], "variacion_pct": -7.6, "por_categoria": [{"categoria", "v2022", "v2025", "pct"}]}`. Mediana por fila de `monto_neto/unidades` sobre filas con monto y unidades > 0, crudas (C29, D08); IPC acumulado base 2022 = 1 con los tres anuales de D09.
- **V09 NPS y soporte** — `{"filas": 14976, "sin_interaccion": {"n": 4312, "pct": 28.8}, "nps_anual": [{"anio", "con_todo", "solo_con_interaccion", "n_filas", "n_sin_interaccion"}], "reclamos_por_cliente_mes": [{"anio", "valor"}], "riesgo_vs_soporte": {"en_riesgo": {"reclamos_acum": 2.34, "nps": 19.1}, "sin_riesgo": {"reclamos_acum": 2.00, "nps": 24.3}}}`.
- **V10 La cifra central** — `{"e1": {"pct": 49.6, "exposicion_M": 94.9, "en_riesgo": 2452, "elegibles": 4940}, "despues": {"pct": 50.4, "exposicion_M": 96.4, "en_riesgo", "elegibles"}, "sens": {"corte": "2025-08-31", "pct", "exposicion_M", "en_riesgo", "elegibles"}, "cambios": [{"decision": "DC-04", "delta_pct_pp", "delta_exposicion_M"}]}`.
- **V11 Dataset de entrenamiento** — copia de `resumen_tablon.json` (sección 4).
- **V12 Lo que le pedimos a Casa Óga** — `{"pedidos": [{"id": "DC-13", "que": "…", "detalle": "…", "estado": "pendiente del negocio"}]}` (DC-09 meses, DC-13 casos, DC-07 correcciones, 598 negativas, DC-15 diccionario).

## 4. Tablón (`pipeline/tablon.py`)

- Base: transacciones después de DC-01, DC-02 (solo filas positivas para compras), DC-03, DC-04, DC-08.
- Cortes T: fin de mes de **2023-01-31 a 2025-09-30** (33 cortes). Fila = (`id_cliente_canonico`, T) si el cliente es **elegible** (≥ 3 compras hasta T) y **no está en riesgo** en T (`B_i(T)=0` con la regla del E1, `features.client_facts`).
- Target `y_churn_90` = 1 si existe t en (T, T+90] con `B_i(t)=1`. Se evalúa con `client_facts` en T+90 (la recency crece con el tiempo, así que si en T+90 no cruzó, no cruzó antes; si cruzó, `recency > θ` en T+90 detecta el cruce salvo que haya vuelto a comprar dentro de la ventana: en ese caso la fila es 0). Documentar esta simplificación en `resumen_tablon.json.notas`.
- Features (nombres exactos; todas con datos ≤ T): `recency_dias`, `gap_mediano`, `recency_sobre_umbral`, `frequency`, `compras_90d`, `compras_90d_prev`, `monetary`, `ticket_medio`, `ticket_90d`, `n_tiendas_distintas`, `n_categorias_distintas`, `categoria_dominante`, `pct_online`, `region_dominante`, `formato_tienda`, `meses_desde_alta`, `canal_alta`, `edad`, `edad_flag`, `genero`, `provincia`, `es_socio`, `nivel`, `puntos_canjeados`, `meses_sin_movimiento`, `envios_90d`, `envios_acum`, `aperturas_90d`, `clics_90d`, `compro_7d_alguna`, `ultimo_canal_campania`, `reclamos_90d`, `reclamos_acum`, `consultas_90d`, `nps_ultimo`, `nps_sin_interaccion_flag`, `tiene_panel`, `n_devoluciones`, `motivo_ultima_devolucion`, `pidio_baja`, `mes_corte`, `temporada`, `dias_a_proximo_evento`. Más `acepta_marketing` como columna de filtro (no feature) y `particion`.
- Partición por corte: `train` = T ≤ 2024-06-30; `dev` = 2024-07-31 a 2024-09-30; `test` = 2025-01-31 a 2025-05-31; `test_flag` = 2025-06-30 a 2025-09-30 (ventana del target cae en meses con cobertura no confirmada); los cortes 2024-10-31 a 2024-12-31 quedan como `gap` (su ventana de target cae en 2025-01 a 2025-03, que sí tiene cobertura: se marcan `gap` igual para que test empiece con targets medidos en 2025). Sin split aleatorio.
- Salida: `entregas/entregable-2/_build/B/dataset/churn_cliente_corte_v0.1.csv.gz` y
  `resumen_tablon.json` = `{"nombre": "churn_cliente_corte_v0.1", "filas", "columnas", "n_features", "clientes_distintos", "cortes": [{"corte", "filas", "positivos", "tasa_pct", "particion"}], "por_particion": [{"particion", "filas", "positivos", "tasa_pct"}], "tasa_global_pct", "notas": [...]}`.

## 5. Anclas (valor esperado = registro `cifras-entregable-2.md`; tolerancia 0 en conteos, 0,05 en porcentajes y 0,05 M en millones)

| nombre | esperado | fila |
|---|---|---|
| `filas crudas` | 50250 | D01 |
| `filas unicas` | 50000 | D01 |
| `ventas M` | 994.4 | D01 |
| `unidades antes` | 107352 | D02 |
| `unidades despues` | 106028 | D02 |
| `devoluciones crudas` | 613 | D02 |
| `devoluciones unicas` | 608 | D02 |
| `clientes antes` | 5978 | C01 |
| `elegibles antes` | 4940 | C02 |
| `en riesgo antes` | 2452 | C03 |
| `riesgo pct antes` | 49.6 | D05 |
| `exposicion M antes` | 94.9 | C04 |
| `riesgo pct 2026-08-31` | 85.2 | D05 |
| `en riesgo 2026-08-31` | 4207 | D05 |
| `duplicados con actividad` | 348 | D22 |
| `clientes despues` | 5634 | D22 |
| `riesgo pct despues` | 50.4 | D22 |
| `exposicion M despues` | 96.4 | D22 |
| `envios crudos` | 23729 | D15 |
| `envios unicos` | 23529 | D15 |
| `clic pct despues` | 8.8 | D15 |
| `sin consentimiento` | 7078 | D18 |
| `sin consentimiento pct` | 30.1 | D18 |
| `contactables 800` | 568 | C11 |
| `bajas total` | 1211 | D03 |
| `bajas hasta corte` | 812 | D03 |
| `bajas 2026` | 399 | D03 |
| `envios gold` | 5066 | D17 |
| `socios gold` | 3 | D17 |
| `coincidencia gold pct` | 30.1 | D17 |
| `precio mediana 2022` | 8900 | D08 |
| `precio mediana 2025` | 8221 | D08 |
| `precio variacion pct` | -7.6 | D08 |
| `filas soporte` | 14976 | D25 |
| `nps sin interaccion` | 4312 | D24 |
| `nps sin interaccion pct` | 28.8 | D24 |
| `nps 2022` | 41.8 | D19 |
| `nps 2025` | 16.2 | D19 |
| `ofertas base antes` | 22614 | D16 |
| `cupon fijo tasa antes` | 1.49 | D16 |
| `edades fuera de rango` | 106 | D24 |
| `edades nulas` | 524 | D24 |
| `meses flag` | ["2025-09","2025-10","2025-11","2025-12"] | DC-09 (nuevo) |

Las cifras nuevas (sensibilidad al 31/08/2025, contactables sin baja, conversión por oferta sobre 23.529, NPS solo con interacción, serie de devoluciones, tablón) no tienen esperado: `build_e2.py` las imprime en una sección `NUEVAS` para cargarlas al registro como filas `E01…`.
