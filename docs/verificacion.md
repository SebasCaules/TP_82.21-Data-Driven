# Verificación — compuerta 5

Protocolo (a)(b)(c)(d) de `wiki/entregables/guia-dashboard-directorio.md`, más la matriz de
resoluciones y la auditoría final adversarial.

## Cadena de validación

Se cierra en dos tramos y los dos usan `client_facts` como verdad independiente. Ninguno
compara el payload contra sí mismo, que sería probar nada.

```
pipeline/validate.py    payload == client_facts                201.900 chequeos
test/paridad.mjs        agregacion.js(payload) == client_facts  606.270 chequeos
```

| Etapa | Cobertura | Resultado |
|---|---|---|
| Anclas | 75 cifras: el wiki completo, la tabla RFM, región y categoría, el embudo y la sensibilidad del proxy | **75/75** |
| Contingencia | celda a celda, 9 campos, 25 cortes | **225/225** |
| Grilla de filtros | 2.688 combinaciones × 25 cortes | **201.600/201.600** |
| Paridad Python ↔ JS | las mismas 2.688 × 25 sobre 9 campos, más la decodificación de las 1.470 claves | **606.270/606.270** |

Las anclas pasaron de 44 a 75 por un hallazgo de la auditoría: el arnés probaba que el
payload coincide con `client_facts`, pero de ahí no se sigue que `client_facts` sea correcto.
La tabla RFM, la asignación de región y la de categoría no estaban ancladas contra ninguna
fuente externa: un cambio en esas reglas habría pasado los 201.819 chequeos sin que nadie se
enterara. Ahora tienen ancla propia.

Tolerancias declaradas: los conteos (`n`, `nr`, `ne`) se exigen exactos, sin tolerancia. En
los campos de dinero se acepta 1 peso por celda sumada, porque Python redondea el total de
cada celda y el navegador suma celdas ya redondeadas. En la práctica se activa en 11 de 225
casos, y 1 peso sobre ARS 94,9 M es 1 parte en 95 millones.

## Contraste contra "Los números disponibles" del wiki

Las ocho cifras que la guía declara como permitidas, recomputadas hoy:

| Cifra | Wiki | Pipeline |
|---|---|---|
| Clientes en riesgo | 41,0 % | **41,0 %** |
| Riesgo en Q5 | 51,8 % (619) | **51,8 % (619)** |
| Exposición anual | ARS 94,9 M | **ARS 94,9 M** |
| Facturación en riesgo | ARS 262,8 M | **ARS 262,8 M** |
| Facturación de la base | ARS 550,2 M | **ARS 550,2 M** |
| Facturación de los 619 de Q5 | ARS 113,6 M | **ARS 113,6 M** |
| Recency mediana | 277 días | **277 días** |
| Compra a 7 días del criterio actual | 1,39 % | **1,39 %** |

Las diferencias están todas en la tabla RFM y todas salen del mismo empate de borde:

| Segmento | Wiki | Pipeline | Diferencia |
|---|---|---|---|
| Campeones | 1.014 · 25,3 % · 159,9 M | 1.014 · 25,3 % · **160,0 M** | ARS 0,1 M |
| Leales | 820 · 58,3 % · 90,8 M | 820 · 58,3 % · **90,6 M** | ARS 0,2 M |
| Perdidos | **1.129** · 20,4 % · 86,7 M | **1.128** · 20,4 % · 86,7 M | un cliente |
| Potenciales | **590** · 3,9 % · 35,5 M | **591** · 3,9 % · 35,5 M | un cliente |
| En riesgo · Hibernando · Nuevos | — | — | exactos |

Un solo cliente cae del otro lado de un borde de quintil y se lleva su facturación consigo.
La regla del pipeline está escrita y es reproducible; la del wiki salió de un script que este
proyecto no puede leer. Se corrige el wiki, no el tablero (S-05).

## Matriz de resoluciones

Detector propio (`src/fit.js`). No usa `scrollHeight`, que da cero con `overflow:hidden` y
produce el falso negativo conocido: compara rectángulos con `getBoundingClientRect` y detecta
superposición con el borde inferior del cuerpo y con la barra de controles, desborde lateral,
texto recortado y gráfico aplastado por debajo de 90 px.

> **Cuidado:** hasta el 26/08/2026 esos dos chequeos apuntaban a `.pie` y `.enc`, dos clases
> que dejaron de existir cuando el pie salió de la pantalla (N0-13). Ningún selector matcheaba,
> así que comparaban contra el borde de la ventana y contra cero, o sea que no comparaban nada.
> Las corridas de la matriz anteriores a esa fecha valen por sus otros chequeos, no por estos dos.

| Resolución | 14 pantallas | Con filtro | 3 cortes |
|---|---|---|---|
| 1152 × 640 | limpio | limpio | limpio |
| 1280 × 800 | limpio | limpio | limpio |
| 1366 × 768 | limpio | limpio | limpio |
| 1440 × 900 | limpio | limpio | limpio |
| 1920 × 1080 | limpio | limpio | limpio |

Los cinco puntos de arriba son una diagonal: el ancho mínimo solo se probaba con la ventana
más baja, que es donde la media query por alto achica el título y la lateral. El peor caso de
la cabecera de alto fijo es el otro: ancho mínimo con ventana alta, donde el título vuelve a
su cuerpo grande y tiene menos lugar. Se agregó al barrido del 26/08/2026:

| Resolución | 14 pantallas | Por qué está |
|---|---|---|
| 1152 × 640 | limpio | piso declarado |
| 1440 × 900 | limpio | laptop típica |
| 1100 × 700 | **desborde de la barra superior** | por debajo del piso, dentro del hueco que la guarda no cubría |

El tercero es el que motivó alinear el umbral de la guarda con el piso declarado: entre 1001 y
1116 px el tablero se dibujaba entero pero el mes de corte activo quedaba fuera de la ventana,
y el detector daba limpio. Con el umbral corregido, ese rango ya cae del lado de la guarda.

Dos fallas reales que el detector cazó y que la captura de pantalla no mostraba:

1. **Bucle de realimentación de flexbox.** Un SVG con tamaño fijo en píxeles dentro del flujo
   impide que su contenedor flex se achique, así que el contenedor mide lo que mide el
   contenido y el contenido mide lo que mide el contenedor. Se resolvió sacando el SVG del
   flujo con `position:absolute`. Volvió a aparecer en la tabla de M1 y se resolvió igual.
2. **Gráfico aplastado a 640 px de alto.** El de D0 quedaba en 81 px. Se recortó cromo del
   encabezado y de las tarjetas con una media query por **alto**, no por ancho, que es la
   variable que aprieta. La regla de la guía manda: si un párrafo no cabe, se corta el
   párrafo antes que achicar el gráfico.

## Impresión

14 hojas A4 apaisadas de 180 mm, una por pantalla, con corte y filtros activos en el pie de
cada hoja. Ningún gráfico por debajo de 90 px (mínimo 193). M1 imprime 16 filas.

El modo de impresión renderiza las 14 en flujo normal, no con `display:none`: el
`ResizeObserver` que dimensiona cada SVG mide cero en un elemento oculto y los gráficos
saldrían vacíos.

## Offline

| Chequeo | Resultado |
|---|---|
| `fetch(` en el bundle | **0** |
| `XMLHttpRequest`, `WebSocket`, `importScripts`, `sendBeacon` | 0 |
| `import()` dinámico | 0 |
| `<script src>` externo | 0 |
| `<link>` | 0 |
| Subrecursos pedidos en runtime | **0** (una sola petición, la del documento) |

El polyfill de `modulePreload` de Vite era el único `fetch` que quedaba. Con todo inlineado
no llegaba a disparar, pero se desactivó para que la afirmación sea estructural y no
incidental.

Peso: 1,35 MB en un archivo; 470 KB transferidos comprimidos.

## Lectura horizontal — los 14 títulos en orden

El chequeo de Knaflic cap. 7: leer solo los títulos tiene que contar la historia.

**Directorio**

1. Casi la mitad del gasto anual de la base está en clientes sin compra reciente
2. Los mismos clientes pesaban 54,8 % de lo facturado en 2024 y 31,2 % en 2025
3. El salto de 13,3 % a 51,8 % es composición: 67,5 % de Q1 no califica
4. Campeones: 29,1 % de lo facturado y 16,4 % de la exposición
5. La recompra pasó de 19,0 % a 8,5 % en 5 trimestres y quedó fuera de meta
6. AMBA es 41,1 % de la base y 43,2 % de lo expuesto: se reparte parejo
7. Muebles ocupa 47,8 % de la exposición con 31,7 % de los clientes
8. Cambiar de criterio no gana compras y cuesta de 17,4 M a 37,2 M de cobertura
9. Tres decisiones, ninguna cuesta presupuesto nuevo

**Marketing**

1. Contactar 500 de 2.452 cubre 37,0 % de la exposición, no 20,4 %
2. El incumplimiento va de 29,5 % a 31,2 % en cuatro años: no baja
3. La semana 1 vale 1,9 veces la semana 4 con los mismos 200 contactos
4. El peor paso, Clic → Compra, pierde 86,2 % de lo que recibe
5. Falta el control: 3 cortes solo detectan 1,71 pp sobre una base de 1,21 %

Todos los títulos se recalculan con el corte y los filtros. Ninguno lleva una magnitud fija
escrita a mano, que con corte móvil sería falsa en 24 de los 25 cortes.

> **Nota (26/08/2026).** Seis de estos títulos cambiaron junto con el formato de su gráfico
> (D2, D3, D5a, D5b, M3 y M2a pasaron a composición al 100 % o a barras divergentes). El
> título sigue a lo que el gráfico dibuja, así que si el dibujo cambia de pregunta el título
> cambia con él. El detalle de qué formato tiene cada uno está en `diseno-pantallas.md`.

> **Nota (27/08/2026).** Los catorce pasaron a **una sola línea**. El tope de dos renglones
> dejaba lugar para relleno y el relleno apareció: subordinadas, aposiciones y la segunda
> mitad de la frase repitiendo la primera. Con un renglón el título tiene que ser la
> afirmación y nada más, y lo que sobraba bajó a la bajada. El presupuesto es ~88 caracteres
> a 1152 px, el ancho mínimo declarado; los catorce entran con margen (el más largo pide 784
> px de los 923 disponibles). Además cinco vistas cambiaron de pregunta con su rediseño
> (D1, D6, M3, M1 y M2b), así que su título es otro y no una versión corta del anterior.


## Auditoría final adversarial

Cinco auditores horizontales en modelo N0, uno por capa del protocolo más contrato y
accesibilidad. Cada hallazgo alto o medio pasó por un refutador independiente que arranca
del supuesto contrario: si no reproduce la evidencia exacta, el hallazgo cae.

| | |
|---|---|
| Hallazgos | 63 |
| Refutados | 22 |
| **Confirmados** | **29** |

Los auditores verificaron por su cuenta los cuatro números que se les dieron como estado
(44/44, 201.819, 471.870, cero subrecursos) y confirmaron los cuatro. El diagnóstico del
auditor de la capa (a) resume dónde estaba el problema real:

> El tablero tiene 25 cortes × 2.688 combinaciones de filtro = 67.200 estados. Las cifras
> están validadas en los 67.200; las frases, en uno.

### Lo que se corrigió

| Hallazgo | Qué pasaba |
|---|---|
| A-01 | Imprimir desde el menú del navegador daba **una** pantalla. Las 14 hojas solo existían si se apretaba la tecla `i`: no había listener de `beforeprint` |
| D-01 | La tarjeta del rango del umbral tenía las tres cifras escritas a mano y **no existía la línea de código que las generara**. Es exactamente lo que la capa (d) prohíbe. Ahora se calculan en `features.sensibilidad_umbral` y tienen ancla |
| D-02 | El arnés no ancla la tabla RFM ni la asignación de región y categoría contra ninguna fuente externa. 31 anclas nuevas |
| B-05 | La nota de historia corta del BAN salía de la serie global: con un filtro puesto mostraba el número nacional al lado de una cifra filtrada. Ahora viaja por celda de contingencia |
| B-01 | En `BarrasH`, la etiqueta de valor de la barra más larga se metía dentro de la columna de notas. El ancho de la etiqueta no salía del presupuesto de la barra |
| A-05 · B-06 | D5b marcaba con el mismo color de énfasis la categoría de **mayor** y la de **menor** tasa: dos significados opuestos en un mismo gráfico (regla 19) |
| A-02 | De los cuatro KPIs computables que la Parte D declara con semáforo, solo uno lo tenía. Tras el fix del 26/08/2026 son **dos de cuatro**: recompra a 90 días y clientes en riesgo. Los otros dos siguen sin pastilla |
| A-04 | El pie, donde viven las cuatro correcciones obligatorias, se pintaba a 2,6:1 de contraste |
| A-06 | Las barras sin énfasis quedaban a 1,64:1 contra el fondo, por debajo del mínimo de 3:1 para un objeto gráfico |
| A-08 | Al imprimir se colaba un decimoquinto pie, el de la pantalla activa |
| A-09 | Sin `print-color-adjust`, la barra del BAN y los cuadros del semáforo salían en blanco al imprimir |
| A-11 | Los SVG con drill-down llevaban `role="img"`, que en ARIA 1.2 poda todo el subárbol accesible, incluidos los botones |
| A-12 | `role="tablist"` reserva las flechas para moverse entre pestañas, y el handler global las usa para cambiar de pantalla |
| A-14 | Las bandas de meta y línea base quedaban a 1,14:1: invisibles en proyector |
| B-08 | El tope duro de 40 px de alto de barra invertía la regla 10 cuando el paso pasaba de 60 px |
| B-09 · B-10 | El sparkline del encabezado y una tarjeta de D7 mezclaban serie nacional con cifra filtrada sin declararlo |
| D-06 | El README prometía `npm run todo` pero tres de las cinco etapas son Python y el repo no declaraba sus dependencias |

### Lo que se declinó, con motivo

El auditor propuso poner énfasis en AMBA en D5a y en su momento no se hizo, porque el título
de entonces decía que la geografía no explica el riesgo y resaltar una región lo contradecía.

> **Nota (26/08/2026).** Eso cambió y este párrafo quedó viejo. El título de D5a pasó a ser la
> concentración, que es lo que las barras dibujan, y la planitud de la tasa bajó a la bajada,
> que es su lugar: un título que habla de la tasa sobre un gráfico de pesos no lo sostiene el
> dibujo. Con ese título, el énfasis en AMBA sí corresponde, y es el que tiene hoy. Lo que la
> auditoría de diseño sí encontró en esa pantalla es otra cosa: el 43,2 % del título (parte de
> la exposición) y el 43,2 % de la fila de AMBA (tasa de riesgo) coincidían al decimal en el
> corte por defecto sin que nada dijera que medían cosas distintas. La columna ahora lleva
> encabezado.
