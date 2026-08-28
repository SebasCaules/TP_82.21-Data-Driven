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
| Recorrido | **un solo riel de 14 vistas numeradas**, no dos bloques conmutables. La distinción de audiencia pasa a ser un rótulo de grupo (Diagnóstico · Operación · Decisión) que separa sin partir | implementación, `pantallas/index.jsx` |
| Riel | clickeable, con la vista activa marcada por inversión y peso, no solo color | Nielsen H1 |
| Teclado | `↑` `↓` `←` `→` avanzan y retroceden · `Inicio` y `Fin` van a los extremos · `f` pantalla completa · `i` imprime · `Esc` limpia corte y filtros. El handler ignora el evento si el foco está en un `select`, un `input` o el riel del corte, y **`f` e `i` solo actúan con el foco fuera de todo control** (WCAG 2.1.4) | — |
| Selector de mes de corte | 25 cortes, dibujado como **serie de exposición por corte** con el activo marcado: mover el corte es ver la trayectoria | clase 4, "ver cómo vengo" |
| Filtros | región, categoría, segmento RFM, quintil. En las pantallas de series globales se **apagan con leyenda** en vez de quedar activos e inertes | Nielsen H1 |
| Drill-down | clic en una barra de D2, D3, D5a o D5b fija ese valor como filtro y salta a M1 | Parte D §4.1, "Drill-down desde cualquier barra al listado filtrado" |
| Volver al inicio | control visible solo cuando el estado difiere del inicial | Nielsen H1 (reversibilidad) |
| Foco | orden de tabulación declarado, anillo de 2 px en gris, no en el color de énfasis | — |

> **Nota.** La versión 1 de este documento describía dos bloques conmutables con atajos por
> dígito, `0` y `b`. La implementación los descartó: catorce vistas en un recorrido único con
> tres rótulos de grupo separan igual y no obligan a recordar en qué bloque se está. La tabla
> de arriba es lo que el tablero hace hoy.

> **Nota.** Los cuatro filtros (región, categoría, segmento RFM y quintil) los declara la
> Parte D v2.0 §4.1. Esta nota se escribió contra la v1.0, que solo declaraba tres. El único
> agregado que sobrevive es el corte móvil contra C-06.

## Pie de dos líneas — solo en la hoja impresa

Estaba pensado como pie fijo de pantalla, comprimido de 5 líneas a 2 porque las 5 comían 107 px
de 640. Terminó saliendo de la pantalla y quedando solo en papel (decisión N0-13): corría
idéntico en las 14 vistas y a fuerza de repetirse se volvía invisible, mientras que en la hoja,
que se lee sin el tablero al lado, es donde hace falta. Lo que la pantalla sí conserva es el
dato que las resume, "exposición, no recupero", pegado al número en vez de a 600 px.

1. Corte activo · filtros activos · rótulo del bloque (Diagnóstico / Modelo predictivo).
2. Proxy de churn · "el monto en riesgo es exposición, no recupero" · importes sin deriva
   de precios (−7,6 % de 2022 a 2025) · gasto anual estimado = facturación ÷ años desde la
   primera compra hasta el corte.

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
- **El pedido concreto NO subió a D0.** El comité lo había aceptado, y la implementación lo dejó
  entero en D7 (decisión N0-19): D0 ya lleva el BAN, sus tres encuadres y la serie de recompra,
  y una cuarta zona con las tres decisiones repetía lo que la vista 14 dice con más contexto.
  Lo que sostiene la regla 24 acá es que el título de D0 da la lectura y no la etiqueta.
  *Lead with the ending* (regla 24) no admite que el pedido aparezca en la pantalla 8 de 8.
- **Sin bajada.** La apertura S-C-P de dos líneas tampoco quedó: D0 es la única de las 14 que
  declara cabecera de una sola línea, porque el BAN tiene que arrancar arriba y las dos líneas
  de situación y complicación le comían el alto a la serie. La caída de 2025 se cuenta en D4,
  que es su pantalla.
- La tarjeta del indicador declara **dueño y cadencia**: "Recompra 90 días · María G. · mensual",
  con el estado del semáforo. Es la pregunta 3 de las cuatro que el tablero tiene que resistir.
- Una línea de rango: la exposición al umbral de 60 d es 95,1 M y a 120 d es 93,5 M. El valor
  es **casi insensible al umbral del proxy**, y decirlo es un argumento a favor, no una salvedad.

### D1 · Desde cuándo

| | |
|---|---|
| Pregunta | ¿El problema es de este año o viene de antes? |
| Cifra | la cohorte en riesgo pesa 47,3 / 52,1 / 54,8 / 31,2 % de la facturación identificada de 2022 a 2025 |
| Gráfico | **cuatro barras al 100 %, una por año**, cada una sobre la facturación de SU año, partida entre la cohorte en riesgo al corte y el resto. Años de más reciente a más viejo, con el último arriba y en énfasis |
| Título | Los mismos clientes pesaban 54,8 % de lo facturado en 2024 y 31,2 % en 2025 |
| Reglas | 4, 6, 18 · capa (a) del protocolo |

**Cambio del 27/08/2026: de "de qué tamaño" a "desde cuándo" (dirección 4c).** Las dos barras
de tramos decían el tamaño del problema y no el eje del tiempo, y el tamaño ya lo contestan
D0 (la cifra) y D2 (el reparto por quintil). Lo que faltaba era la MISMA gente mirada año por
año. La cohorte es fija: se clasifica una sola vez, al corte, y se mira hacia atrás.

Cada barra va sobre la facturación de su propio año porque entre 2022 y 2024 la base casi se
triplica; comparar montos crudos no diría nada.

> **Cuidado:** el proxy define la cohorte por haber dejado de comprar, así que la caída de
> 2025 es en parte definición y no hallazgo. Lo que no es definición es cuánto pesaba esa
> misma gente antes: 47,3 % en 2022 y 54,8 % en 2024. La pantalla lo declara al pie.

La serie va **por corte y no por celda de contingencia**: partir `f` por año serían ocho
columnas más sobre 17.136 celdas y casi un mega de payload, contra la promesa del bundle de
un solo archivo. El precio es que la vista no acepta filtros, y lo declara
(`depende: 'corte'`, App.jsx los apaga con leyenda).

### D2 · Riesgo por quintil de valor

| | |
|---|---|
| Pregunta | ¿El riesgo se concentra en los que más facturan o en los de menor valor? |
| Cifra | Q1 13,3 % → Q5 51,8 % sobre el total · 40,9 % → 52,1 % entre elegibles |
| Gráfico | cinco barras **apiladas al 100 %**, una por quintil: en riesgo (acento, desde cero) · elegible sin riesgo · no elegible (trama). Tasa entre elegibles como nota de fila y línea del 41,0 % general |
| Título | El salto de 13,3 % a 51,8 % es composición: el 67,5 % de Q1 no califica para el cálculo |
| Reglas | 4, 6, 11, 14, 18 · Tufte, lie factor · baseline al lado |

El pie es obligatorio y es el hallazgo real: *el salto Q1→Q2 es de composición. El 67,5 % de
Q1 tiene menos de 3 compras y por definición no puede estar en riesgo. Entre clientes
comparables el gradiente va de 40,9 % a 52,1 %, o sea 1,27×.*

El denominador del KPI (51,8 % sobre el total de Q5) **no se toca**: lo fija la Parte D §2.1.
Lo que cambia es lo que se afirma.

**Cambio del 26/08/2026: la barra simple pasa a composición al 100 %.** El bloque de acento
mide exactamente lo mismo que medía la barra —nr/n, desde cero— así que el contrato queda
intacto; lo que agrega el formato es la causa del salto, que antes solo estaba escrita en la
bajada: la cuña tramada de no elegibles se derrite de Q1 a Q5. Lo que se pierde es la tasa
entre elegibles como dibujo (es una razón entre dos bloques que el ojo no calcula) y por eso
sigue como nota de cada fila, con su encabezado. Con un filtro que angosta el bloque de
acento, su cifra sale sobre plaqueta: el KPI no se cae del gráfico.

### D3 · Dónde está la plata contra dónde está el riesgo

| | |
|---|---|
| Pregunta | ¿Dónde conviene gastar el presupuesto de retención? |
| Cifra | desvío entre participación en la facturación y participación en la exposición, en puntos, por segmento RFM |
| Gráfico | **barras divergentes desde cero**, ordenadas por el desvío; lavado de zona en la mitad negativa y trama en sus barras (redundante con el lado, para impresión en B/N); eje simétrico con piso de ±10 puntos; columna de exposición con barra de magnitud |
| Título | Campeones está 12,7 puntos subexpuesto: 29,1 % de lo facturado, 16,4 % de la exposición |
| Reglas | 4, 6, 11, 14, 18, 21 · capa (a), no mezclar bases |

Cambios: **"con la tasa más baja" era falso** y sale (Campeones es el cuarto más bajo, no el
primero); las dos bases van escritas; el eje se rotula "Exposición anual (ARS)" y no "pérdida
esperada", porque no hay ninguna probabilidad aplicada.

El segmento "En riesgo" va con la aclaración de circularidad al lado.

**Cambio del 26/08/2026: de barras de exposición a barras divergentes.** El título afirmaba
una resta ("el riesgo no está donde está la plata") que el gráfico no dibujaba: había una
sola distribución en pantalla y la otra estaba escrita en la bajada. Ahora la resta es la
barra. Lo que se pierde son los niveles —un segmento chico y uno grande pueden dar el mismo
desvío— y por eso la exposición en pesos de cada uno queda como nota. El piso de ±10 puntos
del eje existe porque el eje se simetriza al máximo absoluto: sin piso, un filtro que deje
desvíos de décimas los dibujaría del ancho de la pantalla.

El orden de la resta lo fija el signo, no la comodidad: **el negativo tiene que ser el mal
desempeño**. Un segmento que pesa más en el riesgo que en lo que factura está sobreexpuesto,
va a la izquierda y con trama; el que factura más de lo que arriesga va a la derecha. Con la
resta al revés, el −12,7 le tocaba a Campeones, que es justamente el segmento sano.

La mitad negativa va sobre un lavado neutro: sin él los dos lados se distinguen solo por el
lado de una línea, que es justo lo que hay que leer rápido. Es neutro y no de color porque el
lado ya tiene significado y un color le agregaría un segundo. La columna de exposición lleva
la moneda declarada una vez en el encabezado y las cifras en magnitud, igual que el eje de
las pantallas de pesos, más una barra de magnitud: el desvío dice de qué lado cae el
segmento, la columna dice cuánta plata hay detrás.

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
| Cifra | reparto de los clientes contra reparto de la exposición, por región. Amplitud de tasa 2,8 pp entre las 5 |
| Gráfico | **dos barras apiladas al 100 % alineadas** (clientes arriba, exposición abajo) con los cortes conectados; mismo orden en las dos; base escrita al lado de cada barra |
| Título | La exposición se reparte igual que los clientes: AMBA es 41,1 % de la base y 43,2 % de lo expuesto |
| Reglas | 6, 11, 14, 18, 21 |

**"Solo online" va separado bajo una línea divisoria**, rotulado "sin región asignable, fuera
de las dos bases". Pie con la regla de asignación (C-04) y con la apertura por tienda
declarada fuera de alcance V1 (Parte D §6.1).

**Cambio del 26/08/2026: de barras de pesos al par de composiciones.** Una concentración sin
su referencia no se puede juzgar: "AMBA concentra el 43,2 %" pesa distinto sabiendo que AMBA
es el 41,1 % de la base. La inclinación del conector ES la diferencia entre las dos
composiciones, y acá son casi verticales: ninguna región concentra riesgo por encima de su
tamaño. Lo que se pierde es la tasa de riesgo (baja a la bajada), el monto absoluto (las dos
bases van escritas) y la comparación fina entre tramos que no arrancan en el mismo punto. La
escala fija al 100 % lo vuelve inmune al filtro: nada acá se puede inflar recortando la base.

### D5b · Categoría

| | |
|---|---|
| Pregunta | ¿Qué categoría concentra la exposición? |
| Cifra | reparto de clientes contra reparto de exposición, por categoría · amplitud 15,5 pp de tasa (Muebles 44,4 % contra Baño 28,9 %) |
| Gráfico | gemelo exacto de D5a: dos barras apiladas al 100 % alineadas, con conectores |
| Título | Muebles ocupa 47,8 % de la exposición con 31,7 % de los clientes |
| Reglas | ídem D5a |

Pie: las dos categorías del extremo bajo tienen menos de 200 clientes cada una.

**Cambio del 26/08/2026: mismo formato que D5a, a propósito.** El par se lee comparando
formas entre pantallas: en región los conectores salen casi verticales y acá todos se corren
a la derecha, porque Muebles se lleva más exposición que clientes y cada categoría chica
pierde participación al pasar de personas a pesos. Con siete categorías los tramos de la cola
no aceptan rótulo adentro: bajan a una línea de resto arriba del gráfico, en el orden del
dibujo, que se corta con puntos suspensivos cuando no entra.

### D6 · Contra el criterio actual

| | |
|---|---|
| Pregunta | ¿Conviene cambiar el criterio con el que se arma la lista? |
| Cifra | por criterio de orden: exposición cubierta 49,5 / 32,1 / 12,3 / 31,0 M y compra a 7 días 1,42 / 1,72 / 0,84 / 1,18 %, todas con IC solapado contra el actual |
| Gráfico | **punto con intervalo de Wilson al 95 %** con la banda del IC de la vara y una fila punteada reservada al score, más una **tabla de seis columnas** que pone la decisión en pesos y en compras esperadas |
| Título | Cambiar de criterio no gana compras y cuesta de 17,4 M a 37,2 M de cobertura |
| Reglas | 4, 6, 18 · corrección 4 (descriptivo contra predictivo) · Tufte, lie factor |

Rotulado **"Modelo predictivo (en desarrollo)"**. Cambios: sale el 1,2 % global, que es de
otra base y hacía parecer la marca cuatro veces más grande de lo que es contra su comparable
real ("Todos", 1,34 %); y el título deja de ser verdadero por construcción.

**Cambio del 26/08/2026: las barras ordenadas salen.** La v2 pedía cinco barras desde cero de
mayor a menor y ese orden no lo sostienen los datos: los diez pares de intervalos se solapan,
el IC de una sola barra mide 0,70 pp contra los 0,43 pp que separan a la más alta de la más
baja, y con las cinco tasas iguales el azar reproduce esa amplitud en el 32,5 % de las
corridas. La vista 13, que muestra los mismos cinco números, titula que ninguno se despega: el
tablero se contradecía a sí mismo. Ahora la banda es el IC de la vara, los otros cuatro
criterios caen adentro y van como contexto tenue, y la fila punteada de arriba reserva el lugar
del score. El gráfico afirma lo mismo que el título.

> **Nota.** La vara no es el máximo de los cinco. `pipeline/series.py` la fija a
> "Inactivos 90d" porque es el criterio que Marketing usa hoy, y la Parte D §5 lo declara como
> baseline. Elegirla por ser la más alta habría sido sesgo de selección; no lo es.

**Cambio del 27/08/2026: el costo de equivocarse (dirección 17e).** La vista contestaba solo
en tasa, y en tasa la respuesta era "no se puede saber": correcta y estéril. Ahora contesta en
las dos monedas que el directorio va a mirar igual, y el contraste entre ellas ES la vista:

- la **tasa** sale de una muestra chica y llega con un intervalo que se come cualquier
  diferencia entre criterios (los cuatro se solapan con el actual);
- la **exposición cubierta** es aritmética de la base, sin ruido, y las diferencias son de
  17,4 a 37,2 M.

Por eso el criterio se elige por cobertura y no por tasa. Dos de los cuatro criterios ni
siquiera llegan a llenar los 800 (525 y 490 clientes disponibles), que es un costo propio y va
en su columna.

Los datos salen de `series.criterios_orden`: cada criterio define un subconjunto de la base en
riesgo, se toman los 800 de mayor anualizado —lo que Marketing ejecutaría— y se mide la tasa
de las campañas que ya salieron a esos mismos clientes. **No es un experimento**: los criterios
no se asignaron al azar y sus bases se pisan. Sirve para mostrar que ninguna diferencia
sobrevive a su intervalo, no para estimar el efecto de cambiar de criterio. "Azar" no se
sortea: se reporta el valor esperado, para no tener que justificar una semilla.

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
| Cifra | 2.452 en riesgo · capacidad 500 a 800 · contactar 500 cubre el 37,0 % de la exposición contra el 20,4 % que cubriría al azar |
| Gráfico | **curva de concentración**: la lista ordenada por exposición contra el azar, con la banda de capacidad marcada. Tres KPIs de cabecera que son la lectura del punto elegido y se mueven con él |
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
| Cifra | 29,5 / 31,2 / 30,3 / 29,6 % de envíos sin consentimiento por año, sobre bases de 4.515 / 3.915 / 8.028 / 7.071 · agregado 7.078 de 23.529 (30,1 %) |
| Gráfico | **cuatro barras al 100 %, una por año**, cada una sobre sus propios envíos. Cumplidor en azul contra el eje, bloqueante en terracota con trama a la derecha. Años de más reciente a más viejo, el último arriba y en énfasis |
| Título | El incumplimiento va de 29,5 % a 31,2 % en cuatro años: no baja |
| Reglas | 4, 6 · Ley 25.326, ya declarada en Parte D §6.1 |

Las dos cifras van en líneas separadas: 30,1 % es sobre envíos y 98,3 % es sobre clientes.
Se presenta como incumplimiento reconocido por el negocio con corrección en marcha.

**Cambio del 26/08/2026: de dos barras sueltas a una sola al 100 %.** La afirmación es una
razón sobre un total, y con dos barras el total no estaba dibujado: había que dividirlas de
memoria. Lo que se pierde es la magnitud absoluta —16.451 y 7.078 dejan de compararse por
largo contra un eje de conteo—, así que los dos conteos van escritos, uno en el rótulo del
tramo y el otro en el título.

**Cambio del 27/08/2026: abierto por año (dirección 12c).** Una cifra acumulada de cuatro años
no distingue un incumplimiento que se corrige de uno estable, y esa es la primera pregunta que
hace cualquiera que lo lee. Cada barra va sobre SU propia base de envíos, que cambia fuerte
entre años (3.915 en 2023 contra 8.028 en 2024).

> **Cuidado:** la dirección 12c anticipaba "la corrección ya está en marcha", con una caída de
> 38,2 % a 22,6 %. **Los datos reales no la sostienen**: 29,5 / 31,2 / 30,3 / 29,6 %, una
> amplitud de 1,7 pp en cuatro años. No hay corrección en marcha, hay una tasa estable, y el
> título dice eso. El ancla `amplitud del incumplimiento entre anios (pp)` de `build.py` lo
> deja fijo: si algún día la serie se moviera de verdad, el pipeline corta y el texto se
> reescribe.

La meta sigue siendo cero, no una tendencia: 29,5 % también es incumplimiento.

### M1 · La lista

| | |
|---|---|
| Pregunta | ¿Cómo se reparte la lista entre las semanas de contacto? |
| Cifra | los cuatro tramos de 200: 17,2 / 12,4 / 10,5 / 9,3 M, con 139 / 138 / 144 / 147 contactables. Total 49,5 M de los 94,9 M (52,1 %), 568 contactables |
| Gráfico | **barras horizontales de la exposición de cada tramo** más una tabla de siete columnas con su subtotal, ticket medio, contactables y composición dominante |
| Título | La semana 1 vale 1,9 veces la semana 4 con los mismos 200 contactos |
| Reglas | 4, 6, 18 · Shneiderman (details-on-demand) · Parte D §4.1 |

Cambios: el marcador "ARS X M" del título se calculó y se recalcula por corte; 800 filas
paginadas sin scroll eran 60 páginas; el ranking se parte en cuatro tramos de 200, uno por
semana, porque la decisión de Marketing es semanal y la lista es mensual; y se declara
exportable, como promete la Parte D. Solo código de cliente, sin nombre ni mail.

**Cambio del 27/08/2026: la lista leída por tramo (dirección 13d).** La pantalla mostraba las
filas de un tramo por vez, con orden por cabecera. Lo que NO mostraba es que los cuatro lotes
no valen lo mismo: como la lista sale ordenada por exposición, la semana 1 concentra casi el
doble de pesos que la semana 4 con la misma cantidad de contactos. Eso es lo que decide cómo
se reparte el esfuerzo del mes, y no se veía en ningún lado.

> **Cuidado:** las filas cliente por cliente **ya no están en pantalla**. El botón de exportar
> sigue bajando los ~800 completos, con su tramo en una columna nueva, que es como la lista
> llega a Marketing de verdad. El drill-down de las vistas de diagnóstico sigue trayendo acá
> con el filtro puesto; lo que cambia es que la respuesta pasa a ser "cuánto pesa este recorte
> y en qué semana cae", no "estos veinte ids".

Los tramos se recalculan sobre el recorte activo: con un filtro puesto la lista puede tener
menos de 800 y los tramos son los que haya. Con un recorte de un solo cliente la escala del
eje pasa de millones a miles, porque en millones colapsa a "0,1 M" repetido seis veces.

Repartir por exposición en vez de por orden dejaría los cuatro tramos parejos y quitaría la
urgencia de la semana 1. Es una decisión de Marketing, no del tablero, y la pantalla la deja
planteada al pie.

### M2a · El embudo

| | |
|---|---|
| Pregunta | ¿Qué rindió la campaña? |
| Cifra | 35,1 % → 24,9 % → 13,8 % de retención paso a paso, sobre bases de 23.529, 8.266 y 2.059 |
| Gráfico | **tres barras apiladas al 100 %**, una por paso, cada una sobre su propia base: avanza (acento) contra se pierde (trama), con la base escrita en cada fila |
| Título | Cada paso del embudo pierde al menos 64,9 % de lo que recibe; el peor, Clic → Compra, pierde 86,2 % |
| Reglas | 4, 6, 18 |

Pie con las dos bases y con la advertencia de que `compra_7dias` nunca ocurre sin clic previo
(0 excepciones), así que el "uplift" de abrir es mecánico, no causal.

**Cambio del 26/08/2026: de cuatro barras de conteo a tres barras de conversión.** Entre la
primera etapa y la última hay tres órdenes de magnitud, así que en escala lineal la barra de
compra a 7 días medía unos 9 px sobre 827 y la conversión de cada paso —lo propio de un
embudo— no estaba dibujada en ningún lado. Agrandar esa barra habría sido el lie factor que
la regla 4 prohíbe; el formato lo resuelve sin tocar el dato, porque cada barra va sobre su
propia base. Lo que se pierde es la escala absoluta: tres barras del mismo largo sobre
23.529, 8.266 y 2.059 se pueden leer como tres poblaciones iguales, y por eso cada fila lleva
su base escrita y la bajada declara la compra sobre el total (1,2 %). El título propuesto por
la lámina de formatos ("ningún paso retiene más de un tercio") no se usó: el primer paso
retiene 35,1 %, que es más de un tercio.

### M2b · El experimento

| | |
|---|---|
| Pregunta | ¿Con qué comparación se mide la próxima campaña? |
| Cifra | una sola tasa medible: 1,21 % sobre 23.529 envíos y 284 compras. MDE de 1,71 pp con 3 cortes de 360 por rama |
| Gráfico | **punto con intervalo más dos renglones vacíos** (el control que no existe y el efecto que no es computable), con una vara punteada en el mínimo detectable, más la tabla de las tres ramas propuestas |
| Título | Falta el control: 3 cortes solo detectan 1,71 pp sobre una base de 1,21 % |
| Reglas | 4, 6, 11, 18 · ninguna afirmación causal sin grupo de control |

**Cambio del 27/08/2026: de reportar cinco segmentos a proponer un experimento
(dirección 15f).** La versión anterior dibujaba las cinco tasas con su intervalo y titulaba que
ninguno se despega. Era cierto y estaba bien dibujado, pero la conclusión era "no se puede
concluir nada", repetida cada mes sobre los mismos datos. Con cinco tasas indistinguibles el
reporte no cambia ninguna decisión.

Lo que la reemplaza es la comparación que falta y por qué falta. Los **dos renglones vacíos**
son la mitad del argumento: el dataset no tiene grupo de control, así que el efecto de la
campaña no es computable por más grande que sea la base.

La otra mitad es el tamaño. `series.potencia_experimento` calcula la diferencia mínima
detectable con las ramas y los cortes que declara `meta.experimento`: **1,71 pp sobre una tasa
base de 1,21 %**, o sea que el experimento propuesto solo puede ganar si el efecto es enorme.
Declararlo antes de correrlo es lo que evita gastar tres cortes para volver a escribir "no
concluyente". La vara punteada del gráfico está justamente en ese umbral, y que caiga tan a la
derecha del punto medido ES la advertencia.

> **Cuidado:** el control de 80 clientes no se contacta durante tres cortes. Son ARS 4,9 M de
> exposición que se dejan sin tocar a propósito, y la pantalla lo dice al pie.

La asignación a ramas es **determinística, no sorteada**: un ciclo fijo de 20 sobre la lista ya
ordenada por exposición reparte 9-9-2, así que las tres ramas quedan estratificadas por
exposición sin depender de una semilla que después habría que justificar. La propuesta se arma
sobre la lista del corte de referencia y no sobre el corte activo: en cortes viejos la base en
riesgo es más chica y las ramas no darían los 360 con los que está calculado el MDE.

---

## Reglas transversales del 27/08/2026

**Títulos de una sola línea.** Las catorce. El tope de dos renglones dejaba lugar para relleno
y el relleno apareció: subordinadas, aposiciones y la segunda mitad de la frase repitiendo la
primera. Con un renglón el título tiene que ser la afirmación y nada más, y el que no entra se
ve cortado enseguida en vez de esconderse en el segundo renglón. El presupuesto real es ~88
caracteres a 1152 px, que es el ancho mínimo declarado; los catorce entran con margen. Lo que
salió del título bajó a la bajada, que sigue en dos renglones.

**Glosario a un toque.** Todo término que decide algo —en riesgo, elegible, anualizado,
exposición, quintil, RFM, recompra a 90 días, compra a 7 días, IC de Wilson, consentimiento,
capacidad, tramo, MDE, corte, pesos nominales, y once más— lleva subrayado punteado y abre una
ficha con **definición, ecuación, umbral de decisión y fuente**. El tablero afirma cosas que
dependen de definiciones que no estaban en pantalla: vivían en la Parte D y en
`pipeline/CONTRACT.md`, es decir en otro archivo y en otra reunión. Un directorio que pregunta
"¿por qué ese es el umbral?" en la mitad de la presentación tiene que poder verlo ahí mismo.
Los umbrales numéricos de la ficha salen de `meta`, no del glosario: si `build.py` cambia
`umbral_en_riesgo`, la ficha lo sigue sola. En impresión el punteado desaparece y la ficha no
existe. Ver `src/Glosario.jsx`.

**Cada marca dice su lectura.** Barras, tramos, puntos con intervalo y sparklines llevan
`<title>` nativo con etiqueta, valor, base y nota. Es lo que hace falta cuando alguien señala
un dibujo en una reunión y pregunta "¿este cuál era?". Va en `<title>` y no en un popover
propio porque el navegador ya lo resuelve, sobrevive a la impresión y no roba el foco.

**El semáforo es un semáforo.** Caja, tres luces y poste. La luz encendida marca el estado por
**posición** antes que por color —arriba fuera, medio alerta, abajo en meta—, que es el canal
redundante que la pastilla necesita para sobrevivir a una impresión en blanco y negro y a un
daltónico. Las apagadas quedan como aro tenue: sin ellas no se lee como semáforo sino como un
punto de color. Los tres colores son la paleta reservada `--sem-*`, la misma de antes: no entra
ningún color nuevo.

**Los montos en escala llevan `$`.** Donde la unidad va en un eje o en una columna de
magnitudes, el signo evita ir a buscar la moneda al encabezado ("$ 23,5 M" y no "23,5 M").
`pesos()` sigue siendo la forma larga para la prosa.

## Lo que ninguna pantalla hace

- Ningún estado depende solo del color: forma distinta más etiqueta de texto, y trama en los
  tramos de barra segmentada para que la impresión en B/N los distinga.
- Cero tortas, donas, 3D, eje Y secundario, barras truncadas.
- Ningún título es una etiqueta, ninguno es verdadero por construcción, y ninguno afirma algo
  que los datos no sostengan.
- Ninguna afirmación causal sin grupo de control.
- Ninguna cifra sin su corte y su base al lado.
- Ningún control se ve activo si no hace nada.
