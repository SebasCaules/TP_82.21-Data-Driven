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
- `build_e3.py` usa solo la biblioteca estándar y corre con `python3 -I`. Si una de sus 139 anclas
  no da el número del documento, sale con código 1 y no escribe nada. Además compara su fórmula
  económica con `economia.json` (24 controles).
- Los dos scripts son deterministas: dos corridas, los mismos bytes.
- `data/e3/` son copias byte a byte (el sha256 va en `D3.meta.fuentes`) de las salidas de las partes:
  `etapa2.json` ← `_build/B/modelado/salida/`, `etapa3.json` ← `_build/C/modelado/salida/`,
  `economia.json` ← `_build/B/economia/salida/`, `condiciones.json` ← `_build/A/factibilidad/salida/`.
  Se copian enteras: 242 KB en total, y una copia fiel se verifica con el hash. Un recorte sería un
  formato más que mantener.

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
  3 s por cambio, redondeo a 5 s), comprobado contra `_gen/tiempos.txt`. `TIEMPOS.total_s` = 650
  (10:50); `TIEMPOS.turnos` = los seis turnos consecutivos con su integrante, diapositivas y segundos.
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

`{meta, caso, tecnica, modelos, lista, economia, piloto, anclas}`. Entre paréntesis: cómo lo escribe
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
  en `contactables`, null. Las ocho filas del A2 son anclas (H11, H13, H15, H16).
- `elegida` (la lista que sale: regla, contactables, 500) y `elegida_modelo` (logística, contactables, 500).
- `regla_menos_modelo_500_contactables`: `aciertos` 29 (H16) e `ic95_pp_modelo_menos_regla` (−3,25 a −1,07).
- `comparaciones[] = {filtro, largo_mes, gana, aciertos_de_mas}` (24/10, para el selector de la diapositiva 7):
  por cada largo de lista y filtro, quién acierta más entre `regla` y `logistica_ajustada` (`empate` si dan igual)
  y por cuántos aciertos en los 3 cortes de validación. La resta se hace acá, no en el navegador. Se muestra
  entero si es entero y con 1 decimal si no (la regla promedia empates: 15,3). En contactables y 500: regla, 29 (H16).
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
  `modelo_roi_pct_con_s_100` (−95,68; el registro G36 lo escribe «−95,7 %»; la parte no lo escribe);
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
  −97,93 %, modelo USD 5,38 y −99,95 %, acierto ARS 99,96, punto USD 6,05, 1.719 puntos; en
  `ic95_inferior`, −99,97 % y −99,32 %; en `solo_cruzan`, −99,94 % y −98,32 % (anexo A3); en los
  equilibrios, ROI 0,00 y 48,6 y 39,0 veces; en `cien`, modelo USD 448,90, 1 decimal de ROI −95,7 %,
  punto USD 505,02 y 20,6 puntos.

### `piloto`: diapositiva 12 (G49, B 3.6)

`meses` 3, `lista_mes` 500, `control_mes` 80, `contactados_mes` 420, `tratados` 1.260, `control` 240;
`diferencia_detectable_pp` «2,87 puntos» (2 decimales); `compra_7d_base` «1,21 %»; `horas_equipo` 32 y
`horas_operador` 4; `costo_horas_usd` «USD 1.350»; `acciones_ars` «ARS 68.289» (entero) y
`acciones_usd` «USD 46,79»; `costo_por_tratado_ars` «ARS 54,20».

### `meta` y `anclas`

`meta.fuentes[] = {archivo, sha256}` de los cuatro JSON; `meta.contenido = {archivo, version, sha256}`
del `contenido_e3.js` con que se armó `D3`. `anclas[] = {id, nombre, documento, donde}`: las 139
comprobaciones, con el texto del documento y dónde lo escribe («B 3.6 · C3 d9»). Cuando `donde` nombra
una diapositiva o un anexo de `C3`, el script comprobó que ese texto está ahí. Sirven para un
`title` de fuente.

## 4. Lo que no está en los JSON

| Qué | Por qué | Cómo queda |
|---|---|---|
| Puntajes de las cuatro condiciones técnicas y la escala | `condiciones.json` trae inventario, cruces y nulos, no el puntaje | constantes de la A 1.2 en `build_e3.py`; el script comprueba que la diapositiva 4 escribe «Datos · 3», «Calidad · 2»… |
| 1,5 y 90 días del umbral | es la definición del target (A 2.1), no un dato | constantes en `build_e3.py` |
| −35,6 %, 16.052 positivos en 59.585 filas y 33 cortes, 500 a 800 contactos (diapositiva 3) | salen del pipeline del E1 y de `resumen_v0.2.json`, que no se copian | texto de `C3` (`cifras`, `definicion`) |
| 1.431 clientes con positivo, señal de alerta de 50 a 100 (diapositiva 4) | `etapa1.json` no se copia | texto de `C3` |
| Práctica actual en entrenamiento | `etapa2.json` y `etapa3.json` solo la miden en validación | `entrenamiento: null` |
| ROI del modelo con s = 100 % en las partes | la B escribe USD 448,90; el −95,7 % está solo en el registro (G36) | `modelo_roi_pct_con_s_100`, anclado a G36 |
| Legal, riesgos, sensibilidad, matriz, segmentos y costos por componente (10, 11, A3 a A6) | el pedido los deja en texto | `C3`; los números de A3 y A6 que también están en `D3` son anclas |

> **Nota.** En la importancia, `reclamos_90d` (0,5 puntos, H21) pesa más que `edad` (0,4) y no está ni
> en el gráfico de la diapositiva 7 ni en la tabla de la C 7.3, que eligen variables con lectura de
> negocio. Llega con `en_diapositiva: false`. El gráfico no afirma ser un top 6. Si la interfaz lo
> titula así, la fila de `reclamos_90d` tiene que entrar.
