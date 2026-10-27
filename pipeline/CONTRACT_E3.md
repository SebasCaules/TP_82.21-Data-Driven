# Contrato de datos E3: presentación interactiva `/e3/`

Versión interactiva de la presentación del Entregable 3 (27/10/2026): doce diapositivas y seis
anexos. Dos módulos, los dos generados; la interfaz solo los lee:

| Archivo | Exporta | Lo escribe | Desde |
|---|---|---|---|
| `e3/src/contenido_e3.js` | `C3`: todo el texto | `entregas/entregable-3/_build/F/presentacion/exportar_web.py` (vault) | `contenido.py` de la presentación |
| `e3/src/datos_e3.js` | `D3`: los números de las piezas con datos | `pipeline/build_e3.py` | `data/e3/*.json` |

```bash
# desde la carpeta presentacion/ del vault (por defecto escribe en app/; para un worktree, --app <ruta>)
python3 exportar_web.py --app <app>
# desde la app
python3 -I pipeline/build_e3.py
```

## 0. Reglas

- **El navegador no calcula.** Busca en `D3` y formatea. Ninguna cifra se escribe en el JSX ni se
  deriva (ni una resta: `piloto.contactados_mes` ya viene). El texto sale de `C3` tal cual.
- `build_e3.py` usa solo la biblioteca estándar y corre con `python3 -I`. Si una de sus 409 anclas
  no da el número del documento, sale con código 1 y no escribe nada. Además compara su fórmula
  económica con `economia.json` (26 controles).
- Los dos scripts son deterministas: dos corridas, los mismos bytes.
- `data/e3/` son copias byte a byte (el sha256 va en `D3.meta.fuentes`) de las salidas de las partes:
  `etapa2.json` ← `_build/B/modelado/salida/`, `etapa3.json` ← `_build/C/modelado/salida/`,
  `economia.json` ← `_build/B/economia/salida/`, `condiciones.json` ← `_build/A/factibilidad/salida/`;
  desde W3 (27/10), `etapa4.json` y `etapa4_validacion.json` ← `_build/D/modelado/salida/` (la etapa 4 de la
  Parte D: el test, abierto una sola vez, y la misma medición en validación).
  Se copian enteras: 340 KB en total, y una copia fiel se verifica con el hash. Un recorte sería un
  formato más que mantener. `etapa4.json` además tiene que tener la huella que cita el registro (J01:
  sha256 `0368611d…`): si cambia, el test se habría vuelto a correr, y el script sale con código 1.
- Dos fuentes más, de la propia app (su sha256 también va en `D3.meta.fuentes`): `src/datos.js`, el payload
  del tablero del E1 (C08, C14, C18 y el C03 de J52), y `data/raw/Campanias_marketing.csv`, la copia de los
  datos de la cátedra (J51).

## 1. Formato de los números

`D3` trae valores crudos. La unidad va en el nombre del campo:

| Sufijo | Unidad | Ejemplo |
|---|---|---|
| `precision`, `recall`, `tasa`, `s…`, `r`, `descuento`, `compra_7d_base` | fracción de 0 a 1 | 0,8158 → «81,6 %» |
| `_pp` | puntos porcentuales | 0,8889 → «+0,89 puntos» |
| `_pct` | porcentaje ya multiplicado por 100 | −98,5217 → «−98,52 %» |
| `_usd`, `_ars` | moneda | 299,4946 → «USD 299,49» |
| `_dias`, `casos`, `vp`, `fp`, `aciertos` | unidades | 1.223,67 |

Cómo se muestra un número, igual que lo escriben las partes:

- Redondeo de `toFixed(d)` de JS (mitad lejos del cero), coma decimal y punto de miles:
  `toLocaleString('es-AR', {minimumFractionDigits: d, maximumFractionDigits: d})`. Con `'es'` a secas
  1.719 sale «1719»: tiene que ser `'es-AR'`.
- Negativo con el menos tipográfico «−» (U+2212), como `e2/src/formato.js`. Si el redondeo da cero,
  sin signo («0,00», nunca «−0,00»).
- Las fracciones se multiplican por 100 antes de redondear.
- Positivos con «+» solo donde la diapositiva lo escribe (+0,89 puntos, +2,34).

Las anclas de `build_e3.py` formatean con esta misma regla.

## 2. `C3` (texto)

`{VERSION, EQUIPO, PIE, DIAPOSITIVAS, ANEXOS, TIEMPOS}`. Los campos de cada diapositiva son los de
`contenido.py`, con el texto sin tocar. El marcado `**negrita**` llega sin resolver: lo resuelve la
interfaz. Las tuplas de `contenido.py` llegan como objetos con nombre:

| Campo | Objeto | Diapositiva |
|---|---|---|
| `tarjetas` | `{area, valor, escala, texto}` | 2 |
| `cifras` | `{valor, texto}` | 3 |
| `filas` | `{rotulo, texto}` (en los anexos, `filas` es una lista de listas de celdas) | 4 |
| `pasos` | `{titulo, texto}` | 5 |
| `hechos` | `{valor, texto}` en la 5; texto con `**` en la 12 | 5, 12 |
| `callouts`, `callout` | `{titulo, texto}` | 6, 7, 9 · 8 |
| `grandes` | `{valor, texto}` | 8 |
| `celdas` | `{celda, valor, texto}` | 8 |
| `dimensiones` | `{dimension, puntaje}` | 10 |
| `promedio`, `alerta` | `{valor, texto}` | 10 |
| `plan` | `[{cuando, acciones: [{id, que, quien}]}]` | 10 |
| `columnas` | `[{n, riesgo, filas: [{rotulo, texto}]}]` (en los anexos, la lista de encabezados) | 11 |

El resto de los campos son texto o listas de texto: `n`, `quien`, `tipo`, `kicker`, `titulo`, `bajada`,
`fuente` (la línea «Fuente» del pie), `ids` (filas del registro de cifras; no van en pantalla), `guion`
(lo que se dice, para notas del orador), `decision`, `definicion`, `figura`, `pie_figura`, `nota`,
`formula`, `pedidos_titulo`, `pedidos`.

- `segundos` de cada diapositiva: el tiempo del guion (130 palabras por minuto, un número vale 3,
  3 s por cambio, redondeo a 5 s), comprobado contra `_gen/tiempos.txt`. `TIEMPOS.total_s` = 655
  (10:55); `TIEMPOS.turnos` = los seis turnos consecutivos con su integrante, diapositivas y segundos.
- `ANEXOS[i]`: `{n: "A1"…"A6", titulo, fuente, ids, columnas, anchos, filas, destacar, pie?}`. `anchos`
  son pulgadas del PPTX: sirven como proporción. `destacar` son índices de fila (desde 0).
- `figura` nombra el PNG del PPTX. En `/e3/` la figura se dibuja con los datos de `D3`:

| `figura` | Datos |
|---|---|
| `cliente.png` (3) | `D3.caso` |
| `tecnica.png` (4) | `D3.tecnica` |
| `modelos.png` (6) | `D3.modelos.filas` (validación, de arriba abajo) |
| `importancia.png` (7) | `D3.lista.importancia` con `en_diapositiva` |
| `costos.png` (9) | `D3.economia.costos` |
| `piloto.png` (12) | `D3.piloto` |

Las diapositivas 2, 5, 10 y 11 y los anexos A1 a A6 salen solo de `C3`.

## 3. `D3` (datos)

`{meta, caso, tecnica, modelos, lista, economia, piloto, encuadre, legal, test, plan, monitoreo, anclas}`. Entre paréntesis: cómo lo escribe
el documento y la fila del registro (`wiki/entregables/cifras-entregable-3.md`).

### `caso`: diapositiva 3 (H23, C 7.3)

`id_cliente` «CLI03296»; `corte` ISO «2024-07-31» (se muestra «31/07/2024»); `gap_mediano_dias` 162,
`umbral_dias` 243, `recency_dias` 181, `dias_para_cruzar` 62 (enteros); `ventana_dias` 90,
`factor_umbral` 1,5 y `piso_dias` 90 (la definición del target, A 2.1: θ = máx(90; 1,5 × intervalo));
`y_churn_90` 1 y `cruzo_en_la_ventana` true; `puesto_lista_modelo` 500, `puesto_lista_regla` 449,
`probabilidad` (2 decimales, 0,46).

### `tecnica`: diapositiva 4 (F16, A 1.2 y 1.3)

`condiciones[] = {id, nombre, puntaje}`: Datos suficientes 3, Calidad utilizable 2, Infraestructura 2,
Capacidad humana 2. `promedio` 2,25 (2 decimales). `escala[] = {desde, hasta, nivel}` (1,0 a 1,5 No
factible; 1,6 a 2,0 baja; 2,1 a 2,5 media; 2,6 a 3,0 alta) y `nivel` «Factibilidad media».
`positivos_entrenamiento` 4.636 (G10); `ventas_sin_cliente_pct` 44,79 → «44,8 %» (C19).

### `modelos`: diapositiva 6 (G10 a G17, G24)

- `validacion` y `entrenamiento`: `desde`, `hasta`, `cortes`, `filas`, `positivos`, `tasa`,
  `largo_lista` (1.500 y 6.920 lugares: la lista de 500 por corte); en entrenamiento, `techo_aciertos`
  4.590 y `techo_precision` → «66,3 %» (G12).
- `filas[]`, en el orden del gráfico: `{id, nombre, grupo, entrenamiento, validacion, auc_pr_validacion?}`.
  `grupo`: `hoy` (gris), `regla` (acento) o `modelo` (azul 3). Cada medida: `{precision, recall,
  aciertos, largo, positivos}`. Precisión con 1 decimal: tasa base 23,9 (F08), práctica actual 36,2
  (F07), árbol 80,5 (G14), gradient boosting 81,5 (G15), regla 81,6 (G11), logística 82,5 (G13); en
  entrenamiento, 62,4 la logística, 62,5 el árbol y 66,0 el gradient boosting. Aciertos: la regla con 2
  decimales (1.223,67), el resto enteros. La práctica actual no tiene entrenamiento (`null`).
- `contra_regla`: `diferencia_pp` «+0,89», `ic95_pp` «−0,21 a +1,91» (2 decimales), `aciertos_de_mas`
  «13,3» (1 decimal) en `contactos` 1.500 (G17).
- `coeficientes[]`: `gap_mediano` «−5,07» y `recency_dias` «+2,34» (G24).

### `lista`: diapositiva 7 y anexo A2 (H01 a H21, C 7.1 a 7.3)

- `filas[] = {metodo, filtro, tipo, largo_mes, por_corte, casos, vp, fp, precision, recall, usd_anio, contactables}`.
  `metodo`: `logistica_ajustada`, `regla` o `practica_actual`. `filtro`: `sin_filtro` (largos 500 a 800)
  o `contactables` (acepta marketing y no pidió la baja; largos 300 a 800). `tipo`: `lista`, `umbral`
  (logística con probabilidad ≥ 0,5; `largo_mes` null) o `clasificador` (la regla con todos los que
  están cerca del umbral). `precision` y `recall` con 1 decimal; `usd_anio` con 2; `casos` entero.
  En `sin_filtro`, `contactables = {quedan, vp, precision}` dice cuántos de la lista se pueden mandar;
  en `contactables`, null. Las ocho filas del A2 son anclas (H11, H13, H15, H16), y la precisión de cada
  largo que el selector de la diapositiva 7 deja ver, de la regla y de la logística ajustada con y sin
  filtro, también (H11, H12, H15, H16; 24/10).
- `elegida` (la lista que sale: regla, contactables, 500) y `elegida_modelo` (logística, contactables, 500).
- `regla_menos_modelo_500_contactables`: `aciertos` 29 (H16) e `ic95_pp_modelo_menos_regla` (−3,25 a −1,07).
- `modelo_menos_regla_500_sin_filtro` (27/10, crítica del W3): la logística ajustada menos la regla en la lista de
  500 sin filtro de validación (H06): `diferencia_pp` +1,02, `ic95_pp` (−0,50 a +1,81), `aciertos_de_mas` 15,3 y
  `replicas_a_favor` 0,865. La usa la fila «Sin filtrar · validación» de la vista 4.
- `comparaciones[] = {filtro, largo_mes, gana, aciertos_de_mas}` (24/10, para el selector de la diapositiva 7):
  por cada largo de lista y filtro, quién acierta más entre `regla` y `logistica_ajustada` (`empate` si dan igual)
  y por cuántos aciertos en los 3 cortes de validación. La resta se hace acá, no en el navegador. Cada una es
  ancla de la fila H48 del registro (quién gana y por cuánto, 1 decimal). Se muestra entera si es entera y, si
  no, redondeada con «≈» (la regla reparte los empates del último puesto: 15,33 es «≈ 15»). En contactables y
  500: regla, 29 (H16).
- `no_contactables_lista_500` 483 (H45); `precision_de_equilibrio` (32,1 %, H17); `validacion`: filas,
  positivos, contactables (5.038) y `positivos_contactables` (1.175).
- `ajuste`: `pliegues` 4 (H01); `brecha_pp[] = {id, antes, despues}` con 1 decimal: gradient boosting
  18,1 → 6,4, logística 4,3 → 4,5, regla 4,5 (H08); `precision_validacion` (logística ajustada 82,6 %, H05).
- `importancia[] = {variable, etiqueta, caida_pp, desvio_pp, coeficiente, de_la_regla, en_diapositiva}`,
  ordenada por `caida_pp` (1 decimal: 34,4; 24,0; 7,6; 0,8; 0,6; 0,4, H21). `etiqueta` es el rótulo del
  gráfico de la diapositiva. `de_la_regla` marca las tres de la regla (acento). El gráfico muestra
  solo las de `en_diapositiva`.

### `economia`: diapositivas 8 y 9 (G31 a G54)

- `parametros`: `s_observada` «1,02 %» (2 decimales), `s_ic95` «0,63 % a 1,65 %», `s_solo_cruzan`
  «1,12 %», con sus envíos y compras; `contactados_por_exito` «98» (entero: «1 de cada 98»); `r`
  «0,74 %»; `margen_anual_ars` (m) «ARS 15.282»; `descuento` (d) «15 %»; `ticket_medio_ars` (t);
  `costo_accion_ars` (c) «ARS 25»; `tipo_de_cambio` 1.459,42 ARS/USD al 30/12/2025; `anualizar` 4
  (12 listas por año sobre 3 cortes de validación); `aciertos_de_mas_modelo` 13,33;
  `aciertos_por_punto` 15.
- `valores_celda_ars` con s observada: VP «ARS 99,96», FP «ARS −47,21», FN y VN 0 (G33). Fórmulas:
  VP = s (m − d t) − c y FP = −c − r d t.
- `matrices.regla` y `matrices.modelo`: `{vp, fp, fn, vn, largo, neto_ars, anual_usd}` (validación,
  lista de 500 × 3 cortes).
- `costos`: `con_modelo` y `regla_sin_modelo` con `unicos_usd`, `contingencia_usd`,
  `inversion_inicial_usd` (23.460 y 14.260), `recurrente_usd` (7.200 y 6.000), `total_anio_1_usd`
  (30.660 y 20.260); `incremental_usd` 10.400; `presupuesto_usd` 30.000;
  `con_modelo_menos_presupuesto_usd` 660 y `presupuesto_menos_regla_usd` 9.740. Enteros (G38, G39, C28).
- `observada`: los valores de la grilla con s observada (los mismos de `grilla` en su notable).
- `regla_contactables`: la lista de 500 contactables de la regla, `usd_anio` «264,54» y `roi_pct`
  «−98,69 %» (G54).
- `umbral`: `s_equilibrio_con_descuento` «49,6 %» y `s_equilibrio_sin_descuento` «39,7 %» (1 decimal);
  `veces_con_descuento` «48,6» y `veces_sin_descuento` «39,0» (G43); `modelo_usd_con_s_100` «448,90» y
  `modelo_roi_pct_con_s_100` «−95,68» (registro G36; la parte no lo escribe);
  **`modelo_se_paga_con_s_100` false**; `maximo_pp` «18,4»; `valor_del_maximo_usd` «111,46»;
  `puntos_para_pagar_con_s_100` «20,6» (G46).

> El ROI con s = 100 % es el del **modelo sobre la regla**: beneficio incremental anual (USD 448,90)
> contra lo que el modelo agrega al costo del año 1 (USD 10.400). No es el del proyecto completo.
> Ni con todos los contactados de vuelta el modelo paga lo que agrega: ese es el mensaje de la
> diapositiva 9 y de la B 3.6 («El modelo no se paga ni con éxito de 100 %»).

### `economia.grilla`: el control de la tasa de éxito

Precalculada en Python con la fórmula de `economia.py`. Columnas paralelas, todas de largo `n` (1.457):

| Columna | Qué es | Se muestra |
|---|---|---|
| `s` | tasa de éxito (fracción) | ×100; 2 decimales si s < 0,05, 1 si no; s = 1 es «100 %» |
| `regla_usd` | beneficio anual de la lista de 500 de la regla, 15 % de descuento | USD, 2 decimales |
| `regla_roi_pct` | ROI de la regla contra USD 20.260 | 2 decimales |
| `regla_usd_sin`, `regla_roi_pct_sin` | lo mismo sin descuento (d = r = 0) | ídem |
| `modelo_usd` | beneficio incremental anual del modelo sobre la regla | USD, 2 decimales |
| `modelo_roi_pct` | ROI del modelo contra USD 10.400 | 2 decimales |
| `modelo_usd_sin`, `modelo_roi_pct_sin` | lo mismo sin descuento (d = r = 0): s × m por acierto de más | ídem |
| `acierto_ars` | valor de un acierto (VP) | ARS, 2 decimales |
| `punto_usd` | valor anual de un punto de precisión sobre la regla | USD, 2 decimales |
| `puntos_para_pagar` | puntos que pagarían los USD 10.400 | entero si ≥ 100, 1 decimal si no |
| `veces` | s / s observada | 1 decimal |

- Valores con 6 decimales. `tramos`: paso de 0,0001 (0,01 puntos) de 0 a 0,05 y de 0,001 de 0,05 a 1.
  La grilla no es uniforme: el control recorre el **índice** `i` de 0 a `n − 1` y lee la fila `i`.
  Sin interpolar.
- `notables[] = {id, s, i, rotulo}`, insertados con su valor exacto: `cero`, `ic95_inferior` (0,63 %),
  `observada` (1,02 %, el punto de partida), `solo_cruzan` (1,12 %), `ic95_superior` (1,65 %),
  `equilibrio_sin_descuento` (39,7 %), `equilibrio_con_descuento` (49,6 %) y `cien` (100 %). Sirven de
  marcas y de imán. Los `rotulo` son una frase corta y pueden reescribirse en la interfaz.
- El falso positivo no depende de s: queda en `valores_celda_ars.fp`.
- Anclas sobre la grilla: en `observada`, regla USD 299,49 y ROI −98,52 %, sin descuento USD 419,53 y
  −97,93 %, modelo USD 5,38 y −99,95 %, modelo sin descuento −99,95 % (la sensibilidad «sin descuento» de la
  B 3.5 y el A3; además, control contra `economia.json`), acierto ARS 99,96, punto USD 6,05, 1.719 puntos; en
  `ic95_inferior`, −99,97 % y −99,32 %; en `solo_cruzan`, −99,94 % y −98,32 % (anexo A3); en los
  equilibrios, ROI 0,00 y 48,6 y 39,0 veces; en `cien`, modelo USD 448,90, ROI −95,68 %,
  punto USD 505,02 y 20,6 puntos.

### `piloto`: diapositiva 12 (G49, B 3.6)

`meses` 3, `lista_mes` 500, `control_mes` 80, `contactados_mes` 420, `tratados` 1.260, `control` 240;
`diferencia_detectable_pp` «2,87 puntos» (2 decimales); `compra_7d_base` «1,21 %»; `horas_equipo` 32 y
`horas_operador` 4; `costo_horas_usd` «USD 1.350»; `acciones_ars` «ARS 68.289» (entero) y
`acciones_usd` «USD 46,79»; `costo_por_tratado_ars` «ARS 54,20».

### `encuadre` y `legal`: lo que las vistas 2 y 6 leían del texto (W3, 27/10)

Hasta W2 estas cinco cifras solo estaban en el texto de `C3`. Ahora vienen con su fila y un ancla que comprueba
que `C3` escribe lo mismo.

- `encuadre`: `ventas_2024_ars` y `ventas_2025_ars` (ARS 349,7 M y 225,0 M), `variacion_ventas_2025_pct`
  «−35,6 %» (C14); `capacidad_contacto_mes` [500, 800] (C08).
- `legal`: `dimensiones[] = {id, nombre, puntaje}` (las cinco de la C 5.3, todas en 2), `promedio` «2,0»,
  `tramo = {desde 1,6, hasta 2,5, nivel}` (H40); `envios_sin_consentimiento` 7.078,
  `envios_sin_consentimiento_tasa` «30,1 %», `no_consintieron_contactados_tasa` «98,3 %» (C18); `riesgos` 13
  y `riesgos_criticos` 3, contados en el anexo A4 de `C3` (J22).

### `test`: la etapa 4 (J01 a J21, Parte D 8.1 a 8.3 y 11.2)

Test: los 5 cortes del 31/01 al 31/05/2025. Validación: los 3 cortes de julio a septiembre de 2024. La lista es
la de 500 contactables por corte, salvo en `sin_filtro`.

- `apertura` (J01): `fecha` «2026-10-27T15:55:55-03:00», `lineas` 1, `preregistro_version` «1.1»,
  `control_cifras` y `control_reproducen` 125, `etapa4_sha256`.
- `conjunto` (J02, J18): `cortes`, `desde`, `hasta`, `filas` 14.211, `positivos` 3.602, `tasa` «25,35 %»,
  `anualizar` 2,4, `contactables` 9.962, `contactables_por_corte`, `positivos_contactables` 2.521,
  `positivos_contactables_tasa` «25,3 %», `positivos_contactables_por_corte` «504».
- `validacion` (J18): `cortes`, `contactables` 5.038, `positivos_contactables` 1.175,
  `positivos_contactables_por_corte` «392», `techo_precision` «78,3 %».
- `entrenamiento` (J02, J20): `filas` 18.882, `cortes` 18, `desde`, `hasta`, `clientes` 2.921, `positivos` 5.698,
  `tasa` «30,2 %».
- `metodos.<logistica_ajustada | regla | practica_actual>.<test | validacion>` (J03 a J06, J08, J17):
  `{precision, recall, f1, auc_roc_contactables, casos, vp, fp, fn, vn, usd, usd_anio, aciertos_por_mes,
  precision_por_corte[]}`. `usd` es el valor neto del período (5 cortes en test); `usd_anio`, por año. Test:
  logística 85,88 % y regla 86,13 % (la 8.1 los escribe con un decimal: 85,9 % y 86,1 %).
- `tabla_8_1[] = {fila, baseline_test, modelo_validacion, modelo_test, diferencia_test_menos_validacion,
  baseline_validacion}` (J03 a J07), en el orden de la tabla: `metrica_principal`, `precision`, `recall`, `f1`,
  `auc_roc`, `valor_neto_anual_usd`. Las fracciones van sin multiplicar; el AUC con 3 decimales; el valor en USD.
- `fuera_de_la_lista` (J18): `test` 374 y `test_tasa` «14,8 %»; `validacion` 67 y `validacion_tasa` «5,7 %».
- `contra_regla` (J09): `diferencia_pp` «−0,25», `ic95_pp` «−1,45 a +0,79», `replicas_a_favor` «31,0 %»,
  `aciertos_de_menos` «6,35», `aciertos_extra_por_mes` «−1,27»; `validacion_diferencia_pp` «−1,93» y
  `validacion_ic95_pp` «−3,25 a −1,07» (H16).
- `decision` (J10): `condicion_1` false, `ic95_inferior_pp`, `condicion_2` false, `aciertos_extra_por_mes`,
  `aciertos_por_mes_para_pagar` «8.595», `costo_incremental_usd` 10.400, `valor_extra_anual_usd`,
  **`sigue_la_regla` true** y `resultado` (texto de `etapa4.json`).
- `sin_filtro` (J11, no decide): `logistica_ajustada` y `regla` con `{precision, aciertos, largo, recall,
  usd_anio, auc_roc, decil_superior}`; `diferencia_pp` «+1,06», `ic95_pp` «+0,41 a +1,95», `replicas_a_favor`
  «99,9 %», `aciertos_de_mas_por_mes` «5,32», `usd_anio_de_mas` «6,44».
- `roi_b_3_4[]` (J12), filas `modelo_sobre_la_regla`, `proyecto_completo`, `regla_sin_modelo`:
  `{fila, id, costo_usd, b_3_4, contactables, sin_filtro, cambia_el_veredicto}`, cada celda
  `{usd, roi_pct, recupera_en_el_anio}`. Ninguna recupera; `cambia_el_veredicto` false en las tres.
- `meta_y_alerta` (J13): `regla_aciertos_por_mes` «430,67», `meta_aciertos_por_mes` 379,
  `regla_precision_por_corte[]`, `regla_precision_minima` «83,6 %», `regla_precision_maxima` «88,2 %»,
  `alerta_precision` «72,0 %».
- `calibracion` (J14): `brier` «0,066», `brier_tasa_base` «0,189», `probabilidad_media` «21,8 %»,
  `tasa_observada` «25,3 %», `positivos_esperados` «3.104», `positivos_observados` 3.602, `ece_deciles` «0,058»,
  `lista_500_probabilidad_media` «80,4 %», `lista_500_precision` «90,3 %».
- `segmentos` (J15, J21): `lista_precision` «90,32 %», `lista_precision_regla` «89,26 %»; `filas[] = {id,
  segmento, valor, en_lista, precision, ic95, diferencia_pp, precision_regla, diferencia_regla_pp,
  validacion_diferencia_pp}` con `id` `mujeres`, `hombres`, `genero_x`, `alto_valor`, `menos_de_12_meses`,
  `alta_online` y `alta_fisica` (lista de 500 sin filtro de la logística; `validacion_diferencia_pp` de
  `etapa3.json`, H25 a H28).
- `modelo` (J16, J20): `nombre`, `version` «1.1», `scikit_learn` «1.9.1», `C` 0,01, `min_frecuencia` 100,
  `sin` [«genero»], `agrupadas` 3 (`agrupadas_etapa3` 5), `variables` 39, `terminos_con_intercepto` 75,
  `iteraciones` 31, `pliegues` 4, `coeficientes[]` (los seis mayores: `gap_mediano` −2,47 … marca de vacío de
  `ticket_90d` +0,18, con sus `filas`), `importancia[]` (C 7.3), `probabilidad_del_ultimo_puesto[]` y su
  mínima y máxima (0,32 y 0,39).
- `equilibrio` (J19): `s_equilibrio` «46,9 %», `precision_lista` (la de la regla en test),
  `diferencia_compra_7d_pp` «40,4», `costo_anio_1_usd` 20.260. La fórmula es la de `economia.s_equilibrio_mvp`
  con la matriz de la regla en test × 2,4.

### `plan` (J50, D 12.1 y 12.2) y `monitoreo` (J51, J52)

- `plan`: `semana_1` «2026-11-02» (lunes; la semana de la entrega del E3), `fases[] = {id, nombre,
  desde_semana, hasta_semana, semanas, desde, hasta}` (fechas ISO: el piloto, semanas 6 a 18, del 2026-12-07
  al 2027-03-07; la decisión termina el 2027-03-21), `semanas` 20 y `hitos_semana` (alcance 1, regla del target
  y operador del piloto 2, acciones legales y control 4, extracto regenerado y go-live 6, operador de después
  del piloto 13, decisión 20).
- `monitoreo.campanias_noviembre[] = {anio, fecha, id_campania}` (J51): el primer envío de noviembre de cada año,
  calculado del CSV. `monitoreo.drift` (J52): `verde_hasta_pct` 38 y `rojo_desde_pct` 42 (el semáforo del E1),
  `referencia` «41,0 %» = `en_riesgo` 2.452 / `clientes` 5.978 al `referencia_corte` 2025-12-31 (C03).

### `meta` y `anclas`

`meta.fuentes[] = {archivo, sha256}` de los seis JSON, `src/datos.js` y `data/raw/Campanias_marketing.csv`;
`meta.contenido = {archivo, version, sha256}`
del `contenido_e3.js` con que se armó `D3`. `anclas[] = {id, nombre, documento, donde}`: las 409
comprobaciones, con el texto del documento y dónde lo escribe («B 3.6 · C3 d9»). Cuando `donde` nombra
una diapositiva o un anexo de `C3`, el script comprobó que ese texto está ahí. Sirven para un
`title` de fuente.

## 4. Lo que no está en los JSON

| Qué | Por qué | Cómo queda |
|---|---|---|
| Puntajes de las cuatro condiciones técnicas y la escala | `condiciones.json` trae inventario, cruces y nulos, no el puntaje | constantes de la A 1.2 en `build_e3.py`; el script comprueba que la diapositiva 4 escribe «Datos · 3», «Calidad · 2»… |
| 1,5 y 90 días del umbral | es la definición del target (A 2.1), no un dato | constantes en `build_e3.py` |
| 16.052 positivos en 59.585 filas y 33 cortes (diapositiva 3) | salen de `resumen_v0.2.json`, que no se copia | texto de `C3` (`definicion`). Desde W3, el −35,6 % y los 500 a 800 contactos están en `D3.encuadre`, leídos del payload del E1 |
| 1.431 clientes con positivo, señal de alerta de 50 a 100 (diapositiva 4) | `etapa1.json` no se copia | texto de `C3` |
| Práctica actual en entrenamiento | `etapa2.json` y `etapa3.json` solo la miden en validación | `entrenamiento: null` |
| ROI del modelo con s = 100 % en las partes | la B escribe USD 448,90; el −95,68 % está solo en el registro (G36) | `modelo_roi_pct_con_s_100`, anclado a G36 |
| Diferencias de aciertos por largo y filtro (diapositiva 7) | las partes escriben solo la de 500 contactables (29) | `comparaciones`, anclado a la fila H48 del registro |
| Legal, riesgos, sensibilidad, matriz, segmentos y costos por componente (10, 11, A3 a A6) | el pedido los deja en texto | `C3`; los números de A3 y A6 que también están en `D3` son anclas. Desde W3, el puntaje legal, el 30,1 % y los 13 riesgos (3 críticos) están en `D3.legal` |
| Puntajes de las cinco dimensiones legales y su tramo (C 5.3) | ningún JSON los trae | constantes en `build_e3.py`; el script comprueba nombres y puntajes contra `C3` d10 |
| Fases, semanas e hitos del plan (D 12) | `contenido_d_solucion.py` no escribe un JSON | constantes en `build_e3.py` (la tabla `FASES` de la D, con sus mismas comprobaciones de duración y orden); las fechas se calculan desde el lunes 02/11/2026 |
| Texto de las vistas 7 y 8 (Parte D) | `contenido.py` de la presentación (v1.2) no tiene diapositivas de la D | los números ya están en `D3.test` y `D3.plan`; el texto entra a `C3` cuando `contenido.py` sume esas diapositivas y se vuelva a correr `exportar_web.py` |

> **Nota.** En la importancia, `reclamos_90d` (0,5 puntos, H21) pesa más que `edad` (0,4) y no está ni
> en el gráfico de la diapositiva 7 ni en la tabla de la C 7.3, que eligen variables con lectura de
> negocio. Llega con `en_diapositiva: false`. El gráfico no afirma ser un top 6. Si la interfaz lo
> titula así, la fila de `reclamos_90d` tiene que entrar.
