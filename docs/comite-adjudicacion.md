# Comité de diseño — adjudicación

Cuatro revisores read-only, modelo N0, una sola ronda. 72 hallazgos, **49 bloqueantes**.
Regla de desempate del runbook: gana la regla citada del rulebook; si ninguna aplica, manda
la Parte D; si tampoco, decide el usuario en compuerta.

> **Nota (28/08).** Cuando el comité corrió, "la Parte D" era la v1.0 (hoy `docs/parte-d-v1.txt`).
> Las adjudicaciones de abajo se resolvieron contra ese texto. La versión vigente es la v2.1, que
> incorporó las 14 enmiendas del 26/08 y los 21 puntos del audit del 28/08.

Resultado: **49 aceptados, 0 rechazados, 3 con la respuesta mejor de lo que el comité
suponía.** Ninguno se descartó por falta de cita.

## Los cuatro hallazgos que cambian lo que se afirma, no cómo se dibuja

Estos cuatro no son de diseño. Son afirmaciones que el equipo iba a proyectar y que los
datos no sostienen. Los cuatro se recomputaron y se confirmaron.

### 1. El gradiente de riesgo por quintil está inflado por la elegibilidad

La pantalla iba a decir "Q5 casi cuadruplica a Q1" (3,89×). Es cierto sobre el total, y es
casi todo composición: un cliente con menos de 3 compras **nunca** puede estar en riesgo,
por definición del proxy, y Q1 está compuesto en dos tercios por esos clientes.

| Quintil | Clientes | Elegibles | % elegibles | Riesgo s/ total | Riesgo s/ elegibles |
|---|---|---|---|---|---|
| Q1 | 1.196 | 389 | 32,5 % | 13,3 % | **40,9 %** |
| Q2 | 1.195 | 1.067 | 89,3 % | 42,5 % | 47,6 % |
| Q3 | 1.196 | 1.123 | 93,9 % | 47,8 % | 50,9 % |
| Q4 | 1.195 | 1.173 | 98,2 % | 49,7 % | 50,6 % |
| Q5 | 1.196 | 1.188 | 99,3 % | 51,8 % | **52,1 %** |

Ratio sobre total **3,89×**, ratio entre clientes comparables **1,27×**. El propio wiki ya
lo insinuaba ("en Q1 solo el 33 % califica, así que su 13,3 % subestima el desenganche real
de los esporádicos") pero la cifra viajó igual a la Parte D como gradiente de riesgo.

**Resolución.** El KPI de la Parte D fija el denominador (riesgo en Q5 / total de Q5 = 51,8 %)
y no se toca. Lo que cambia es lo que se afirma: la barra lleva el n de elegibles etiquetado,
el pie explica la composición y el título deja de prometer un efecto cuádruple.

### 2. "Campeones concentra la facturación con la tasa más baja" es falso

Está en el DOCX entregado, §4.1 viz 2. Al corte 31/12/2025:

| Segmento | Clientes | % en riesgo |
|---|---|---|
| Nuevos | 34 | 0,0 % |
| Potenciales | 591 | 3,9 % |
| Perdidos | 1.128 | 20,4 % |
| **Campeones** | 1.014 | **25,3 %** |
| Hibernando | 1.373 | 35,7 % |
| Leales | 820 | 58,3 % |
| En riesgo | 1.018 | 95,7 % |

Campeones es el cuarto más bajo. Lo defendible dice lo mismo para la decisión sin ser falso:
25,3 % contra el 41,0 % general, o sea menos de dos tercios. Va como enmienda al documento
integrado, junto a las de C-04 y C-05.

### 3. El excedente de capacidad no es un grupo de control

La Parte C, criterio de éxito 5, dice que el control "no cuesta nada" porque los clientes que
Marketing no alcanza a contactar son el control natural. No lo son: la lista se ordena por
exposición y se corta en 800, así que el excedente es **por construcción** el tramo de menor
exposición. Comparar los dos grupos mide el ordenamiento, no la campaña. La propia Parte D
§6.1 ya lo resuelve bien: control estratificado por quintil, en V2.

Sale de la pantalla M0. Es también una observación sobre la Parte C entregada.

### 4. La lista ejecutable no son 800 clientes, son 568

De los 800 de mayor exposición al corte de referencia, **568 tienen consentimiento de
marketing**. Los otros 232 no se pueden contactar sin incumplir, que es justamente el hallazgo
de M3. La pantalla tiene que mostrar los dos números o promete una capacidad que no existe.

## Lo que resultó mejor de lo que el comité suponía

| Hallazgo | Lo que dijeron | Lo que dio |
|---|---|---|
| Incertidumbre del BAN | "es una estimación que depende del umbral del proxy y no se declara" | la exposición es casi insensible al umbral: 60 d → 95,1 M · 90 d → 94,9 M · 120 d → 93,5 M. Se muestra el rango, que ahora es un argumento a favor |
| Marca del corte anterior | "dice corte anterior pero es 30/09, tres cortes atrás" | la implementación ya usa el mes inmediato anterior (nov 2025, ARS 90,0 M) y lo imprime con fecha |
| Teclado global | "colisiona con los controles de formulario" | el handler ya ignora el evento cuando el foco está en un `select` o un `input` |

## Cambios estructurales aceptados

| # | Cambio | Motivo citado |
|---|---|---|
| E-1 | **12 → 14 pantallas.** D5 se parte en D5a (región) y D5b (categoría); M2 en M2a (embudo) y M2b (segmentos) | dos gráficos en una pantalla viola la decisión D1, y a 1152×640 no cierra |
| E-2 | El bloque de Marketing se reordena a **M0 · M3 · M1 · M2** | "¿se puede ejecutar la lista?" es previa a "¿a quiénes contacto?" (lógica horizontal, Knaflic cap. 7) |
| E-3 | M1 muestra **las 12 primeras** en pantalla, con el total del top-800 al lado; las 800 salen por exportación e impresión | 800 filas sin scroll son 60 páginas que nadie recorre en una defensa |
| E-4 | El pie baja de **5 líneas a 2**, sin perder contenido | comía 107 px de 640 (17 %) y es lo que empujaba D0 fuera del presupuesto |
| E-5 | El **pedido concreto sube a D0** | *lead with the ending* (regla 24): el pedido no puede aparecer recién en la pantalla 8 de 8 |
| E-6 | El **selector de corte se dibuja como serie de exposición** por corte, con el activo marcado | es el "ver cómo vengo" que pide la clase 4, sin agregar pantalla ni tocar F07 |
| E-7 | **Drill-down** desde las barras de D2, D3, D5a y D5b a M1 con el filtro puesto | lo promete la Parte D §4.1 y es el único puente por contenido entre los dos bloques |
| E-8 | En D4, D6, M2a, M2b y M3 los filtros se **apagan con leyenda**, no se dejan activos e inertes | un control que se ve activo y no hace nada es la falla canónica de visibilidad del estado (Nielsen H1) |

## Correcciones de rótulo y de cifra

| Pantalla | Antes | Después |
|---|---|---|
| global | "pérdida esperada" como eje y columna | **"exposición anual (ARS)"**: no hay ninguna probabilidad aplicada, el término sugiere una esperanza estadística que no existe |
| global | nota fija con "los ARS 94,9 M son exposición" | sin número: el valor se mueve con el corte y el pie lo contradecía |
| global | nota fija 1 dice "corte y filtros" en las 14 | en las series globales dice "no responde al corte ni a los filtros" |
| global | faltaba la regla de anualización | sexta nota: gasto anual estimado = facturación / años desde la primera compra hasta el corte |
| D0 | "clientes que ya dejaron de comprar" | "clientes hoy en riesgo por falta de compra reciente": el proxy no habilita afirmar abandono consumado |
| D1 | "el 46,4 % de lo que la base factura por año" | "del gasto anual **estimado** de la base": 204,6 M no son ventas, y un directorio los compararía contra los 225,0 M reales de 2025 |
| D3 | sin baseline | con la línea del 41,0 % general, igual que D2 |
| D4 | título sin comparación | "...por debajo de la línea base de 8-9 %", que es lo que el gráfico ya dibuja |
| D5a | barras en % de riesgo | barras en **pesos de exposición**, con la tasa etiquetada al lado: la pregunta es dónde se concentra la plata |
| D5a | "Solo online" mezclado en el panel | separado bajo una línea, rotulado "sin región asignable · 317 clientes": con esa barra dentro, el rango visible es 30,3 pp y desmiente el título |
| D6 | 1,39 % contra 1,2 % | contra los comparables de la **misma base**: Todos 1,34 · Silver 1,33 · Gold 1,04 · Bronze 0,96 |
| D6 | tasas sin respaldo | con el n de compras: 61 · 82 · 53 · 45 · 45. La diferencia se apoya en decenas de eventos, no en miles |
| M0 | "uno de cada tres" | "entre uno de cada cinco y uno de cada tres": 500/2.452 = 20,4 % y 800/2.452 = 32,6 % |
| M1 | "ARS X M" (marcador sin resolver) | **ARS 49,5 M de los 94,9 M (52,1 %)**, recalculado por corte |
| M3 | dos cifras con unidades distintas juntas | "7.078 de 23.529 envíos (30,1 %)" y, aparte, "alcanza al 98,3 % de los clientes que no consintieron" |

## Correcciones de accesibilidad e interacción

| # | Corrección |
|---|---|
| A-1 | Los tramos de barra segmentada (D1, M0) llevan rótulo y valor sobre la propia barra más trama, no solo color: en la impresión B/N eran indistinguibles |
| A-2 | El semáforo de D4 usa las tres etiquetas de la Parte D §2.1 ("En meta" / "Por debajo" / "Fuera de meta") con forma distinta cada una |
| A-3 | El riel es clickeable, los dígitos direccionan dentro del bloque activo y `0` vuelve a la pantalla consolidada |
| A-4 | El salto de bloque aterriza en la pantalla 0 del destino y cada bloque recuerda su última pantalla |
| A-5 | Orden de tabulación declarado y anillo de foco visible en gris, no en el color de énfasis |
| A-6 | Impresión: una hoja A4 apaisada por pantalla, **las 14**, con corte y filtros activos en el pie de cada hoja |
| A-7 | Control de "volver al estado inicial", visible solo cuando el estado difiere del inicial |

## Correcciones al propio documento de diseño

| # | Qué |
|---|---|
| F-1 | Las citas a "restricción 3" y "restricción 5" no existen en ninguna fuente auditable: eran numeración interna del runbook. Reemplazadas por la cita real de la guía |
| F-2 | Colisión de nombres: D1–D4 y D11 designaban a la vez decisiones cerradas y pantallas. Las decisiones pasan a `dec-D1`, las pantallas siguen D0–D7 |
| F-3 | El quintil es un cuarto filtro que la Parte D no declara (declara tres). Se documenta como agregado, con su motivo |
| F-4 | Los perfiles de Lucía O. y del equipo del proyecto no tenían recorrido: se declara la apertura por tienda como fuera de alcance V1 y se agrega details-on-demand por cifra |
