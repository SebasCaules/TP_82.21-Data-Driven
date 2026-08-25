# Diseño por pantalla — v2, con el comité aplicado

Artefacto de la compuerta 3. Versión 2: incorpora los 49 hallazgos bloqueantes del comité
([comite-adjudicacion.md](comite-adjudicacion.md)). Cambios estructurales respecto de la v1:
**14 pantallas** en vez de 12, bloque de Marketing reordenado, pie de 2 líneas, pedido
concreto en la primera pantalla.

Autoridad, en orden: apunte de la clase 4 → regla citada del rulebook → Parte D entregada.

> **Nota.** Las **decisiones** cerradas del runbook se escriben `dec-D1`…`dec-D11`. Las
> **pantallas** se escriben D0…D7 y M0…M3. Antes colisionaban.

## Lo que obliga el apunte de la clase 4

"Dashboard: sostiene una decisión recurrente" · "mirar el futuro pero también el pasado para
ver cómo vengo" · "se debe poder explorar, interactividad" · "debe haber movimiento" · "las
preguntas del diseño del dashboard son las que van a decidir las decisiones".

Las 6 preguntas de negocio de la Parte D §1.2 son el índice de pantallas.

## Navegación

Dos bloques, una pantalla por gráfico, sin scroll (`dec-D1`, `dec-D2`).

| Elemento | Comportamiento | Cita |
|---|---|---|
| Control de bloque | dos pestañas siempre visibles, la activa marcada por **forma y texto** además de color | guía, "Lo que el negocio pidió", fila "No depender solo del color" |
| Salto de bloque | aterriza en la pantalla 0 del destino; cada bloque recuerda su última pantalla | Nielsen H1 |
| Riel | clickeable, con la pantalla activa marcada por relleno y borde, no solo color | ídem |
| Teclado | `→` `←` avanzan · dígitos dentro del bloque activo (1-8 / 1-4) · `0` vuelve a la consolidada · `b` cambia de bloque · `f` pantalla completa · `i` imprime · `Esc` limpia filtros. El handler **ignora el evento si el foco está en un control** | — |
| Selector de mes de corte | 25 cortes, dibujado como **serie de exposición por corte** con el activo marcado: mover el corte es ver la trayectoria | clase 4, "ver cómo vengo" |
| Filtros | región, categoría, segmento RFM, quintil. En las pantallas de series globales se **apagan con leyenda** en vez de quedar activos e inertes | Nielsen H1 |
| Drill-down | clic en una barra de D2, D3, D5a o D5b fija ese valor como filtro y salta a M1 | Parte D §4.1, "Drill-down desde cualquier barra al listado filtrado" |
| Volver al inicio | control visible solo cuando el estado difiere del inicial | Nielsen H1 (reversibilidad) |
| Foco | orden de tabulación declarado, anillo de 2 px en gris, no en el color de énfasis | — |

> **Nota.** El **quintil** es un cuarto filtro que la Parte D no declara (declara tres:
> región, categoría, segmento RFM). Se agrega porque el contrato ya lo trae como dimensión
> de la contingencia y porque D2 es su pantalla. Queda documentado como agregado, igual que
> el corte móvil contra C-06.

## Pie fijo — dos líneas en las 14 pantallas

Comprimido de 5 líneas a 2 sin sacar contenido: las 5 comían 107 px de 640.

1. Corte activo · filtros activos · rótulo del bloque (Diagnóstico / Modelo predictivo).
2. Proxy de churn · "el monto en riesgo es exposición, no recupero" · pesos nominales sin
   deflactar · gasto anual estimado = facturación ÷ años desde la primera compra hasta el corte.

La nota de exposición **ya no lleva el número**: el valor se mueve con el corte y el pie lo
contradecía en los otros 24.

---

## Bloque Directorio — decide si sigue el presupuesto

### D0 · Consolidada

| | |
|---|---|
| Pregunta | ¿Cuánta facturación anual está en riesgo y qué parte de la base la explica? |
| Cifra | BAN ARS 94,9 M · 46,4 % de la base anualizada · 2.452 de 5.978 |
| Gráfico | widget F07 (`dec-D11`, congelado) arriba a la izquierda + tres tarjetas de apoyo + recompra contra meta |
| Título | Casi la mitad del ingreso anual de la base está en clientes hoy en riesgo por falta de compra reciente |
| Reglas | 8 (un número solo va como texto grande), 23 (arriba a la izquierda), Wexler (BAN), Few (una pantalla consolidada) |

Cambios del comité:

- El título ya no dice "ya dejaron de comprar": el proxy no habilita afirmar abandono consumado.
- **El arriba-a-la-izquierda lo ocupa el BAN**, no el título. El título va como línea superior
  de menor peso. Resuelve el choque entre la regla 23 y Wexler que la v1 dejaba abierto.
- **Sube el pedido concreto**: una línea con las tres decisiones y su costo cero, con salto a D7.
  *Lead with the ending* (regla 24) no admite que el pedido aparezca en la pantalla 8 de 8.
- Dos líneas de apertura S-C-P: situación (la base creció hasta 2024, las campañas se deciden
  por criterio comercial) y complicación (en 2025 la base activa cayó 16,8 % y la recompra bajó
  a 8,5 %). Minto.
- La tarjeta del indicador declara **dueño y cadencia**: "Recompra 90 días · María G. · mensual",
  con el estado del semáforo. Es la pregunta 3 de las cuatro que el tablero tiene que resistir.
- Una línea de rango: la exposición al umbral de 60 d es 95,1 M y a 120 d es 93,5 M. El valor
  es **casi insensible al umbral del proxy**, y decirlo es un argumento a favor, no una salvedad.

### D1 · Exposición contra base

| | |
|---|---|
| Pregunta | ¿De qué tamaño es el problema contra el total? |
| Cifra | 94,9 M sobre 204,6 M anualizados · 262,8 M sobre 550,2 M históricos |
| Gráfico | dos barras segmentadas desde cero, con **rótulo y valor sobre cada tramo** y trama en el tramo en riesgo |
| Título | No es un mal año: el 47,8 % de todo lo facturado desde 2022 está en las mismas manos |
| Reglas | 4, 6, 18 · capa (a) del protocolo (declarar la base de todo número en pesos) |

Cambios: el título ya no repite lo que D0 dijo (lógica horizontal); los tramos no dependen
solo del color; y el denominador se nombra **gasto anual estimado**, no "lo que la base
factura por año" — 204,6 M no son ventas y un directorio los compararía contra los 225,0 M
reales de 2025.

### D2 · Riesgo por quintil de valor

| | |
|---|---|
| Pregunta | ¿El riesgo se concentra en los que más facturan o en los de menor valor? |
| Cifra | Q1 13,3 % → Q5 51,8 % sobre el total · 40,9 % → 52,1 % entre elegibles |
| Gráfico | cinco barras desde cero, Q5 en énfasis, con el **n de elegibles etiquetado** en cada barra y la línea del 41,0 % general |
| Título | El riesgo sube con el valor del cliente, pero menos de lo que sugiere el total |
| Reglas | 4, 6, 11, 14, 18 · Tufte, lie factor · baseline al lado |

El pie es obligatorio y es el hallazgo real: *el salto Q1→Q2 es de composición. El 67,5 % de
Q1 tiene menos de 3 compras y por definición no puede estar en riesgo. Entre clientes
comparables el gradiente va de 40,9 % a 52,1 %, o sea 1,27×.*

El denominador del KPI (51,8 % sobre el total de Q5) **no se toca**: lo fija la Parte D §2.1.
Lo que cambia es lo que se afirma.

### D3 · Dónde está la plata contra dónde está el riesgo

| | |
|---|---|
| Pregunta | ¿Dónde conviene gastar el presupuesto de retención? |
| Cifra | exposición anual por segmento RFM, con la tasa de riesgo etiquetada |
| Gráfico | barras horizontales ordenadas por exposición, con la línea del 41,0 % general |
| Título | El riesgo no está donde está la plata: Campeones concentra ARS 159,9 M de los 550,2 M históricos (29,1 %) y aporta ARS 15,5 M de los 94,9 M de exposición |
| Reglas | 6, 11, 14, 18, 21 · capa (a), no mezclar bases |

Cambios: **"con la tasa más baja" era falso** y sale (Campeones es el cuarto más bajo, no el
primero); las dos bases van escritas; el eje se rotula "Exposición anual (ARS)" y no "pérdida
esperada", porque no hay ninguna probabilidad aplicada.

El 95,7 % del segmento "En riesgo" va con la aclaración de circularidad al lado.

### D4 · La recompra contra la meta

| | |
|---|---|
| Pregunta | ¿La recompra a 90 días se mueve hacia la meta de 10-11 % o sigue en la base de 8-9 %? |
| Cifra | serie trimestral 2022Q1–2025Q3, pico 19,0 % en 2024Q2, 8,5 % en 2025Q3 |
| Gráfico | línea única, banda de meta y banda de línea base, con el estado del semáforo en el último punto |
| Título | La recompra pasó de 19,0 % a 8,5 % en cinco trimestres, por debajo de la línea base de 8-9 % |
| Reglas | 3, 7, 21 · Parte D §2.1 (semáforo con etiqueta de texto) |

El título resuelve C-05: la caída **no** es monótona (2024Q3 18,4 → 2024Q4 18,6), así que
"cuatro trimestres seguidos" es falso. Los trimestres sin ventana de 90 días completa se
cortan, no se interpolan. **Los filtros se apagan**: la serie es global.

### D5a · Región

| | |
|---|---|
| Pregunta | ¿Qué región concentra la exposición? |
| Cifra | exposición en ARS por región, con la tasa de riesgo etiquetada. Amplitud 2,8 pp entre las 5 regiones |
| Gráfico | barras horizontales en **pesos**, no en porcentaje |
| Título | La geografía no explica el riesgo: 2,8 puntos entre la región más alta y la más baja |
| Reglas | 4, 6, 11, 14, 18 |

Cambios: la barra codifica pesos porque la pregunta es de concentración de plata; y
**"Solo online" va separado bajo una línea divisoria**, rotulado "sin región asignable ·
317 clientes · 12,9 %". Dentro del panel, esa barra hacía que el rango visible fuera 30,3 pp
y desmentía el título. Pie con la regla de asignación (C-04) y con la apertura por tienda
declarada fuera de alcance V1 (Parte D §6.1).

### D5b · Categoría

| | |
|---|---|
| Pregunta | ¿Qué categoría concentra la exposición? |
| Cifra | exposición por categoría · amplitud 15,5 pp de tasa (Muebles 44,4 % contra Baño 28,9 %) |
| Gráfico | barras horizontales en pesos, misma escala que D5a |
| Título | La categoría sí mueve la aguja: 15,5 puntos entre Muebles y Baño |
| Reglas | ídem D5a |

Pie: las dos categorías del extremo bajo tienen menos de 200 clientes cada una.

### D6 · Contra el criterio actual

| | |
|---|---|
| Pregunta | ¿La lista priorizada rinde más que el criterio actual? |
| Cifra | compra a 7 días por segmento objetivo, sobre la base de 23.729: Inactivos 90d 1,39 % (61 compras) · Todos 1,34 % (45) · Silver 1,33 % (82) · Gold 1,04 % (53) · Bronze 0,96 % (45) |
| Gráfico | barras desde cero con el **n de envíos y de compras** en cada una |
| Título | Todavía no hay score que comparar: el objetivo es superar el 1,39 % del criterio actual |
| Reglas | 4, 6, 18 · corrección 4 (descriptivo contra predictivo) · Tufte, lie factor |

Rotulado **"Modelo predictivo (en desarrollo)"**. Cambios: sale el 1,2 % global, que es de
otra base y hacía parecer la marca cuatro veces más grande de lo que es contra su comparable
real ("Todos", 1,34 %); y el título deja de ser verdadero por construcción.

### D7 · Cierre

| | |
|---|---|
| Pregunta | ¿Qué se decide hoy? |
| Gráfico | sin gráfico: tres bloques de texto corto con el pedido |
| Título | Tres decisiones, ninguna cuesta presupuesto nuevo |
| Reglas | 24, 25 · Minto |

Es el desarrollo del pedido que ya apareció en D0, no su primera aparición.

---

## Bloque Marketing — decide a quién contactar

Orden **M0 · M3 · M1 · M2**: capacidad, condición de ejecución, lista, resultado. "¿Se puede
ejecutar?" es previa a "¿a quiénes contacto?".

### M0 · Cobertura contra capacidad

| | |
|---|---|
| Pregunta | ¿A cuántos alcanza a contactar Marketing y cuáles quedan sin cubrir? |
| Cifra | 2.452 en riesgo · capacidad 500 a 800 · cobertura 20,4 % a 32,6 % |
| Gráfico | barra segmentada desde cero con la capacidad como **banda** (dos cortes), rótulo y trama en cada tramo |
| Título | La capacidad cubre entre uno de cada cinco y uno de cada tres clientes en riesgo: el orden importa más que el alcance |
| Reglas | 4, 8, 18 |

Cambios: el título ya no toma solo el extremo optimista; y **sale la frase "el excedente es el
grupo de control natural"**. No lo es: la lista se ordena por exposición y se corta, así que el
excedente es el tramo de menor exposición y compararlo mide el ordenamiento, no la campaña.
El control estratificado por quintil es V2 (Parte D §6.1).

### M3 · Consentimiento

| | |
|---|---|
| Pregunta | ¿La lista se puede ejecutar tal cual? |
| Cifra | 7.078 de 23.529 envíos (30,1 %) · alcanza al 98,3 % de los clientes que no consintieron · 46 envíos a ids inexistentes |
| Gráfico | dos barras desde cero |
| Título | Tres de cada diez envíos van a clientes que no dieron consentimiento |
| Reglas | 4, 6 · Ley 25.326, ya declarada en Parte D §6.1 |

Las dos cifras van en líneas separadas: 30,1 % es sobre envíos y 98,3 % es sobre clientes.
Se presenta como incumplimiento reconocido por el negocio con corrección en marcha.

### M1 · La lista

| | |
|---|---|
| Pregunta | ¿A quiénes contacto esta semana? |
| Cifra | top 800 por exposición = ARS 49,5 M de los 94,9 M (52,1 %). **568 de los 800 tienen consentimiento** |
| Gráfico | tabla de las **12 primeras** en pantalla; las 800 por exportación e impresión |
| Título | Los 800 de mayor exposición concentran ARS 49,5 M de los 94,9 M, y solo 568 se pueden contactar |
| Reglas | Shneiderman (details-on-demand) · Parte D §4.1 |

Cambios: el marcador "ARS X M" del título se calculó y se recalcula por corte; 800 filas
paginadas sin scroll eran 60 páginas; el ranking se parte en cuatro tramos de 200, uno por
semana, porque la decisión de Sofía R. es semanal y la lista es mensual; y se declara
ordenable y exportable, como promete la Parte D. La columna "acción sugerida" va rotulada
"Modelo predictivo (en desarrollo)" mientras no haya score, con el mismo criterio que los dos
KPIs no computables (C-10). Solo código de cliente, sin nombre ni mail.

### M2a · El embudo

| | |
|---|---|
| Pregunta | ¿Qué rindió la campaña? |
| Cifra | 35,1 % abre → 8,8 % clic → 1,2 % compra a 7 días, sobre 23.529 limpios |
| Gráfico | embudo en barras desde cero |
| Título | El embudo termina en 1,2 %: las campañas masivas no discriminan |
| Reglas | 4, 6, 18 |

Pie con las dos bases y con la advertencia de que `compra_7dias` nunca ocurre sin clic previo
(0 excepciones), así que el "uplift" de abrir es mecánico, no causal.

### M2b · Por segmento

| | |
|---|---|
| Pregunta | ¿Algún segmento discrimina? |
| Cifra | los cinco segmentos sobre la base de 23.729, con n de envíos y de compras |
| Gráfico | barras desde cero |
| Título | Ningún segmento se despega: entre 0,96 % y 1,39 % de compra a 7 días |
| Reglas | 4, 6, 11, 18 |

---

## Lo que ninguna pantalla hace

- Ningún estado depende solo del color: forma distinta más etiqueta de texto, y trama en los
  tramos de barra segmentada para que la impresión en B/N los distinga.
- Cero tortas, donas, 3D, eje Y secundario, barras truncadas.
- Ningún título es una etiqueta, ninguno es verdadero por construcción, y ninguno afirma algo
  que los datos no sostengan.
- Ninguna afirmación causal sin grupo de control.
- Ninguna cifra sin su corte y su base al lado.
- Ningún control se ve activo si no hace nada.
