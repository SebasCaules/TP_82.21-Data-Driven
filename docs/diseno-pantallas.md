# Diseño por pantalla — propuesta para el comité

Artefacto de la compuerta 3. Cada ficha declara la pregunta de negocio que responde, la
cifra, el tipo de gráfico, el título-hallazgo y la regla del rulebook que lo justifica.
El comité audita esto contra `wiki/entregables/guia-dashboard-directorio.md` (25 reglas de
Knaflic + canon externo) y contra la Parte D entregada. No re-discute lo que ya está citado.

Fuentes de autoridad, en orden: apunte de la clase 4 → Parte D entregada → guía → canon.

## Lo que el apunte de la clase 4 obliga

"Dashboard: sostiene una decisión recurrente" · "mirar el futuro pero también el pasado para
ver cómo vengo" · "se debe poder explorar, interactividad" · "debe haber movimiento" · "las
preguntas del diseño del dashboard son las que van a decidir las decisiones".

Consecuencia de diseño: **las 6 preguntas de negocio de la Parte D §1.2 son el índice de
pantallas**, no una lista decorativa. Cada pantalla responde una y lo dice en el título.

## Navegación

Dos bloques conmutables con un botón persistente en el encabezado (D2). Dentro de cada
bloque, una pantalla por gráfico, sin scroll (D1).

| Elemento | Comportamiento | Regla que lo pide |
|---|---|---|
| Botón de bloque | `Directorio · mensual` / `Marketing · semanal`, siempre visible | D2 |
| Riel de progreso | puntos numerados con la pantalla activa marcada por forma y por texto, no solo color | Nielsen H1 (visibilidad del estado) + restricción 5 |
| Teclado | `→` `←` avanzan, `1`-`9` saltan, `f` pantalla completa, `i` imprime | continuidad con lo que el equipo ya sabe presentar |
| Selector de mes de corte | 25 cortes, persistente entre pantallas y entre bloques | D4 + "ver cómo vengo" |
| Filtros | región, categoría, segmento RFM, quintil. Chips con el valor activo y un `limpiar` | Parte D §4.1 |
| Corte y filtros activos | impresos **al lado de cada cifra**, no solo en la barra | restricción 3 + Nielsen H1 |

Al cambiar de bloque se conservan corte y filtros: las dos audiencias miran el mismo corte
de los datos, con distinta pregunta. Volver a la vista consolidada es un solo movimiento
desde cualquier pantalla.

## Bloque Directorio (mensual) — decide si sigue el presupuesto

### D0 · Consolidada

| | |
|---|---|
| Pregunta | ¿Cuánta facturación anual está hoy en riesgo y qué parte de la base la explica? |
| Cifra | BAN ARS 94,9 M de exposición · 46,4 % de la base anualizada · 2.452 de 5.978 clientes |
| Gráfico | widget F07 congelado (D11) + tres tarjetas de apoyo + estado del indicador contra la meta |
| Título | Casi la mitad del ingreso anual de la base depende de clientes que ya dejaron de comprar |
| Reglas | regla 8 (un número solo va como texto grande), regla 23 (arriba a la izquierda), Wexler (BAN), Few (una pantalla consolidada) |

Es la respuesta a C-13: la pantalla que Few pide, sin romper D1. La marca vertical del BAN
es el corte anterior (ARS 80,1 M al 30/09/2025) y se mueve con el selector.

### D1 · Exposición contra base

| | |
|---|---|
| Pregunta | ¿De qué tamaño es el problema contra el total? |
| Cifra | 94,9 M sobre 204,6 M anualizados · 262,8 M sobre 550,2 M históricos |
| Gráfico | dos barras horizontales desde cero, una por base, con la porción en riesgo en el color de énfasis |
| Título | La exposición anual es ARS 94,9 M: el 46,4 % de lo que la base factura por año |
| Reglas | regla 4 (base en cero), regla 6 (barra horizontal), regla 18 (un color de énfasis) |

> **Cuidado:** 46,4 % (anualizado) y 47,8 % (facturación histórica) son dos ratios
> distintos sobre dos bases distintas. La pantalla muestra los dos con su rótulo y nunca
> los mezcla en una frase.

### D2 · Riesgo por quintil de valor

| | |
|---|---|
| Pregunta | ¿El riesgo se concentra en los clientes que más facturan o en los de menor valor? |
| Cifra | Q1 13,3 % → Q5 51,8 %, ratio 3,89× · baseline general 41,0 % |
| Gráfico | cinco barras horizontales desde cero, Q5 en énfasis, el resto en gris, con la línea del promedio general |
| Título | El riesgo crece con el valor del cliente: Q5 casi cuadruplica a Q1 |
| Reglas | reglas 4, 6, 11 (orden decidido), 18 · baseline al lado (corrección 3) |

El salto real está entre Q1 y Q2 (13,3 % → 42,5 %), no repartido parejo. El pie lo dice.

### D3 · Dónde está la plata contra dónde está el riesgo

| | |
|---|---|
| Pregunta | ¿Dónde conviene gastar el presupuesto de retención? |
| Cifra | pérdida esperada en pesos por segmento RFM, con la tasa de riesgo etiquetada |
| Gráfico | barras horizontales ordenadas por pérdida esperada, no por tasa de riesgo |
| Título | El riesgo no está donde está la plata: Campeones concentra el 29,1 % de la facturación con la tasa más baja |
| Reglas | reglas 6, 11, 14 (etiqueta directa sobre la serie), 18 |

> **Cuidado:** el 95,7 % del segmento "En riesgo" va con la aclaración de circularidad al
> lado (la R de RFM es la misma recency que define el target). Nunca como hallazgo suelto.

### D4 · La recompra contra la meta

| | |
|---|---|
| Pregunta | ¿La recompra a 90 días se mueve hacia la meta de 10-11 % o sigue en la línea base de 8-9 %? |
| Cifra | serie trimestral 2022Q1–2025Q3, pico 19,0 % en 2024Q2, 8,5 % en 2025Q3 |
| Gráfico | línea única, banda de meta 10-11 % y banda de línea base 8-9 % en gris |
| Título | La recompra pasó de 19,0 % a 8,5 % en cinco trimestres |
| Reglas | regla 7 (tiempo en línea), regla 3 (sin eje Y secundario), regla 21 (títulos de eje) |

El título resuelve C-05: la caída **no** es monótona (2024Q4 sube contra 2024Q3), así que
"cuatro trimestres seguidos" es falso y "de 19,0 % a 8,5 % en cinco trimestres" es exacto.
Los trimestres sin ventana de 90 días completa se dibujan cortados, no se inventan.

### D5 · Región y categoría

| | |
|---|---|
| Pregunta | ¿Qué región y qué categoría concentran la pérdida esperada? |
| Cifra | 2,8 pp de amplitud entre las 5 regiones · 15,5 pp entre categorías |
| Gráfico | dos paneles de barras horizontales con la misma escala, todo en gris salvo el extremo |
| Título | La geografía no explica el riesgo; la categoría sí lo mueve |
| Reglas | reglas 4, 6, 11, 18 · agregación declarada (Cleveland-McGill rango 1) |

Pie obligatorio con la regla de asignación (C-04): la región de un cliente es la de la
tienda donde concentra su gasto hasta el corte; los 317 clientes sin ninguna compra en
tienda física van en un bucket propio, **Solo online**, para que el corte reconcilie con
el total. Ese bucket tiene 12,9 % de riesgo contra 41,0 % general, y eso se declara: es
una diferencia de composición de la base, no una conclusión sobre el canal.

### D6 · Contra el criterio actual

| | |
|---|---|
| Pregunta | ¿La lista priorizada rinde más que el criterio actual? |
| Cifra | 1,39 % de compra a 7 días del segmento "Inactivos 90d" · 1,2 % global |
| Gráfico | barras horizontales de compra a 7 días por segmento objetivo, con la marca a superar destacada |
| Título | La marca a superar es 1,39 %, y hoy ningún criterio la supera |
| Reglas | reglas 4, 6, 18 · corrección 4 (descriptivo contra predictivo) |

Bloque rotulado **"Modelo predictivo (en desarrollo)"**. No hay score todavía: la pantalla
muestra la marca y el hueco, no un resultado inventado. Resuelve C-10.

### D7 · Cierre

| | |
|---|---|
| Pregunta | ¿Qué se decide hoy? |
| Cifra | ninguna nueva: las tres decisiones y su costo |
| Gráfico | sin gráfico. Tres bloques de texto corto con el pedido concreto |
| Título | Tres decisiones, ninguna cuesta presupuesto nuevo |
| Reglas | regla 24 (lead with the ending), regla 25 (lógica horizontal), Minto |

## Bloque Marketing (semanal) — decide a quién contactar

### M0 · Cobertura contra capacidad

| | |
|---|---|
| Pregunta | ¿A cuántos clientes en riesgo alcanza a contactar Marketing y cuáles quedan sin cubrir? |
| Cifra | 2.452 en riesgo · capacidad 500 a 800 por mes · 20 % a 33 % de cobertura |
| Gráfico | barra única segmentada: cubierto por capacidad contra excedente, desde cero |
| Título | La capacidad cubre uno de cada tres clientes en riesgo: el orden importa más que el alcance |
| Reglas | reglas 4, 8, 18 · el excedente es el grupo de control natural (Parte C, criterio 5) |

### M1 · La lista

| | |
|---|---|
| Pregunta | ¿A quiénes contacto esta semana y con qué acción? |
| Cifra | top 800 por pérdida esperada, con el total en riesgo al lado |
| Gráfico | tabla paginada sin scroll: código de cliente, pérdida esperada, recency, gap propio, categoría, consentimiento |
| Título | Los 800 de mayor pérdida esperada concentran ARS X M de los 94,9 M |
| Reglas | Shneiderman (details-on-demand, nunca en la principal) · Parte D §4.1 nivel de detalle |

Sin nombre ni mail: solo código de cliente. El filtro de consentimiento es obligatorio y
está a la vista, no escondido en una opción.

### M2 · El embudo

| | |
|---|---|
| Pregunta | ¿Qué rindió la campaña contra el criterio anterior? |
| Cifra | 35,1 % abre → 8,8 % clic → 1,2 % compra a 7 días, y el corte por segmento |
| Gráfico | embudo en barras horizontales desde cero, más el desagregado por segmento |
| Título | El embudo termina en 1,2 %: las campañas masivas no discriminan |
| Reglas | reglas 4, 6, 18 |

Pie con las dos bases declaradas (23.729 del dataset, 23.529 limpios) y la advertencia de
que `compra_7dias` nunca ocurre sin clic previo, así que el "uplift" de abrir es mecánico.

### M3 · Consentimiento

| | |
|---|---|
| Pregunta | ¿La lista se puede ejecutar tal cual? |
| Cifra | 7.078 envíos (30,1 %) a clientes sin consentimiento · 98,3 % de los que no consintieron |
| Gráfico | dos barras desde cero: envíos con y sin consentimiento |
| Título | Tres de cada diez envíos van a clientes que no dieron consentimiento |
| Reglas | reglas 4, 6 · Ley 25.326, ya declarada en la Parte D §6.1 |

Se presenta como incumplimiento reconocido por el negocio con corrección en marcha, que es
lo que dijo el relevamiento, no como hallazgo que la empresa ignora.

## Notas fijas, en las doce pantallas

Al pie, una línea, siempre:

1. Fecha de corte activa y filtros activos.
2. Proxy declarado: churn es operativo, sin compra por más de 90 días o más de 1,5 veces el
   ritmo propio del cliente.
3. Los ARS 94,9 M son **exposición, no recupero**.
4. Rótulo del bloque: "Diagnóstico (datos históricos)" o "Modelo predictivo (en desarrollo)".
5. Importes en pesos nominales, sin deflactar.

## Lo que ninguna pantalla hace

- Ningún estado depende solo del color: cada semáforo cambia de forma y lleva etiqueta.
- Cero tortas, donas, 3D, eje Y secundario, barras truncadas.
- Ningún título es una etiqueta; todos son hallazgos.
- Ninguna afirmación causal sin grupo de control.
- Ninguna cifra sin su corte al lado.
